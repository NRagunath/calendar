"use client";

// ============================================================
// CalendarGrid.tsx — The interactive date grid
//
// Renders weekday headers and a 6×7 grid of date cells.
// Handles range selection: click-start → click-end → reset.
// Shows hover previews, holiday markers, and today's pulse.
// Supports keyboard navigation with arrow keys.
// ============================================================

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
    getDaysInMonth,
    getStartDayOffset,
    getWeekdayLabels,
    isSameDay,
    isBetween,
    isToday,
    getHoliday,
} from "./calendarHelpers";

interface DateRange {
    start: Date | null;
    end: Date | null;
}

interface CalendarGridProps {
    year: number;
    month: number;
    selectedRange: DateRange;
    onRangeChange: (range: DateRange) => void;
}

/**
 * Builds the 42-cell array (6 rows × 7 columns) for the month.
 * Includes tail-end days of the previous month and leading
 * days of the next month so the grid is always full.
 */
function buildMonthCells(year: number, month: number) {
    const daysInMonth = getDaysInMonth(year, month);
    const startOffset = getStartDayOffset(year, month);
    const cells: { date: Date; belongsToMonth: boolean }[] = [];

    // trailing days from previous month
    const prevMonthDays = getDaysInMonth(year, month - 1);
    for (let i = startOffset - 1; i >= 0; i--) {
        const prevM = month === 0 ? 11 : month - 1;
        const prevY = month === 0 ? year - 1 : year;
        cells.push({
            date: new Date(prevY, prevM, prevMonthDays - i),
            belongsToMonth: false,
        });
    }

    // this month's days
    for (let day = 1; day <= daysInMonth; day++) {
        cells.push({
            date: new Date(year, month, day),
            belongsToMonth: true,
        });
    }

    // fill remaining slots (up to 42)
    const remaining = 42 - cells.length;
    for (let day = 1; day <= remaining; day++) {
        const nextM = month === 11 ? 0 : month + 1;
        const nextY = month === 11 ? year + 1 : year;
        cells.push({
            date: new Date(nextY, nextM, day),
            belongsToMonth: false,
        });
    }

    return cells;
}

export default function CalendarGrid({
    year,
    month,
    selectedRange,
    onRangeChange,
}: CalendarGridProps) {
    const weekdays = getWeekdayLabels();
    const cells = buildMonthCells(year, month);

    const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
    const [focusIdx, setFocusIdx] = useState<number | null>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    // ---- click handler: start → end → reset ----
    const handleDayClick = useCallback(
        (clickedDate: Date, belongsToMonth: boolean) => {
            if (!belongsToMonth) return;

            const { start, end } = selectedRange;

            // if nothing selected, or both already selected → start fresh
            if (!start || (start && end)) {
                onRangeChange({ start: clickedDate, end: null });
                return;
            }

            // we have a start but no end → finalize range
            if (clickedDate.getTime() < start.getTime()) {
                // clicked before start → swap
                onRangeChange({ start: clickedDate, end: start });
            } else if (isSameDay(clickedDate, start)) {
                // same day → single-day selection
                onRangeChange({ start: clickedDate, end: clickedDate });
            } else {
                onRangeChange({ start, end: clickedDate });
            }
        },
        [selectedRange, onRangeChange]
    );

    // ---- keyboard navigation ----
    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent) => {
            if (focusIdx === null) return;

            let next = focusIdx;
            switch (event.key) {
                case "ArrowRight": next = Math.min(focusIdx + 1, cells.length - 1); break;
                case "ArrowLeft": next = Math.max(focusIdx - 1, 0); break;
                case "ArrowDown": next = Math.min(focusIdx + 7, cells.length - 1); break;
                case "ArrowUp": next = Math.max(focusIdx - 7, 0); break;
                case "Enter":
                case " ": {
                    event.preventDefault();
                    const cell = cells[focusIdx];
                    handleDayClick(cell.date, cell.belongsToMonth);
                    return;
                }
                default: return;
            }
            event.preventDefault();
            setFocusIdx(next);
        },
        [focusIdx, cells, handleDayClick]
    );

    useEffect(() => {
        if (focusIdx !== null && gridRef.current) {
            const buttons = gridRef.current.querySelectorAll<HTMLButtonElement>(".day-btn");
            buttons[focusIdx]?.focus();
        }
    }, [focusIdx]);

    // ---- compute CSS classes for each cell ----
    function classesForCell(cellDate: Date, belongsToMonth: boolean): string {
        const classList = ["day-btn"];

        if (!belongsToMonth) {
            classList.push("outside-month");
            return classList.join(" ");
        }

        const { start, end } = selectedRange;

        if (isToday(cellDate)) classList.push("is-today");
        if (isSameDay(cellDate, start)) classList.push("range-start");
        if (isSameDay(cellDate, end)) classList.push("range-end");
        if (isBetween(cellDate, start, end)) classList.push("in-range");

        if (getHoliday(cellDate)) classList.push("is-holiday");

        // hover preview when start is picked but end isn't yet
        if (start && !end && hoveredDate && belongsToMonth) {
            const previewA = start.getTime() < hoveredDate.getTime() ? start : hoveredDate;
            const previewB = start.getTime() < hoveredDate.getTime() ? hoveredDate : start;
            const t = cellDate.getTime();
            if (t > previewA.getTime() && t < previewB.getTime() && !isSameDay(cellDate, start)) {
                classList.push("range-preview");
            }
        }

        return classList.join(" ");
    }

    return (
        <div className="grid-section" role="grid" aria-label="Calendar dates">
            <div className="weekday-row" role="row">
                {weekdays.map((label, i) => (
                    <div
                        key={label}
                        className={`weekday-cell${i >= 5 ? " weekend-day" : ""}`}
                        role="columnheader"
                    >
                        {label}
                    </div>
                ))}
            </div>

            <div className="dates-grid" ref={gridRef} onKeyDown={handleKeyDown} role="rowgroup">
                {cells.map((cell, idx) => {
                    const holiday = getHoliday(cell.date);
                    const cls = classesForCell(cell.date, cell.belongsToMonth);

                    return (
                        <button
                            key={`${cell.date.toISOString()}-${idx}`}
                            className={cls}
                            onClick={() => handleDayClick(cell.date, cell.belongsToMonth)}
                            onMouseEnter={() => setHoveredDate(cell.date)}
                            onMouseLeave={() => setHoveredDate(null)}
                            onFocus={() => setFocusIdx(idx)}
                            tabIndex={idx === 0 ? 0 : -1}
                            aria-label={`${cell.date.toDateString()}${holiday ? `, ${holiday.name}` : ""}`}
                            disabled={!cell.belongsToMonth}
                        >
                            {cell.date.getDate()}
                            {holiday && cell.belongsToMonth && (
                                <>
                                    <span className="holiday-marker" />
                                    <span className="holiday-tip">{holiday.emoji} {holiday.name}</span>
                                </>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
