"use client";

// ============================================================
// MonthNavigator.tsx — Top bar with month/year, nav arrows,
// theme toggle, and the year-skip indicator.
//
// This sits at the very top of the glass card.
// ============================================================

import React, { useMemo, useState, useRef, useEffect } from "react";
import {
    MONTH_NAMES,
    getMonthName,
    type ThemeName,
    getThemeLabel,
} from "./calendarHelpers";

interface MonthNavigatorProps {
    year: number;
    month: number;
    theme: ThemeName;
    onPrev: () => void;
    onNext: () => void;
    onThemeToggle: () => void;
    onDateChange: (year: number, month: number) => void;
}

export default function MonthNavigator({
    year,
    month,
    theme,
    onPrev,
    onNext,
    onThemeToggle,
    onDateChange,
}: MonthNavigatorProps) {
    const themeInfo = getThemeLabel(theme);
    const monthName = getMonthName(month);

    const [isMonthOpen, setIsMonthOpen] = useState(false);
    const [isYearOpen, setIsYearOpen] = useState(false);

    const monthRef = useRef<HTMLDivElement>(null);
    const yearRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (monthRef.current && !monthRef.current.contains(e.target as Node)) {
                setIsMonthOpen(false);
            }
            if (yearRef.current && !yearRef.current.contains(e.target as Node)) {
                setIsYearOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const years = useMemo(() => {
        const arr = [];
        for (let y = 1988; y <= 2100; y++) arr.push(y);
        return arr;
    }, []);

    return (
        <header className="calendar-topbar">
            <div className="topbar-left">
                {/* Custom Month Dropdown */}
                <div className={`custom-dropdown ${isMonthOpen ? "open" : ""}`} ref={monthRef}>
                    <button
                        className="topbar-month dropdown-trigger"
                        onClick={() => setIsMonthOpen(!isMonthOpen)}
                        aria-label="Select month"
                    >
                        {monthName} <span className="chevron">▾</span>
                    </button>

                    {isMonthOpen && (
                        <ul className="dropdown-menu">
                            {MONTH_NAMES.map((name, idx) => (
                                <li key={name}>
                                    <button
                                        className={`dropdown-item ${month === idx ? "active" : ""}`}
                                        onClick={() => {
                                            onDateChange(year, idx);
                                            setIsMonthOpen(false);
                                        }}
                                    >
                                        {name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Custom Year Dropdown */}
                <div className={`custom-dropdown ${isYearOpen ? "open" : ""}`} ref={yearRef}>
                    <button
                        className="topbar-year dropdown-trigger"
                        onClick={() => setIsYearOpen(!isYearOpen)}
                        aria-label="Select year"
                    >
                        {year} <span className="chevron">▾</span>
                    </button>

                    {isYearOpen && (
                        <ul className="dropdown-menu year-menu">
                            {years.map(y => (
                                <li key={y}>
                                    <button
                                        className={`dropdown-item ${year === y ? "active" : ""}`}
                                        onClick={() => {
                                            onDateChange(y, month);
                                            setIsYearOpen(false);
                                        }}
                                    >
                                        {y}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <div className="topbar-right">
                <button
                    className="theme-btn"
                    onClick={onThemeToggle}
                    aria-label={`Switch theme (current: ${theme})`}
                    title={`Theme: ${theme}`}
                >
                    {themeInfo.icon} {themeInfo.label}
                </button>

                <button
                    className="nav-arrow"
                    onClick={onPrev}
                    aria-label="Previous month"
                    title="Previous month"
                >
                    ‹
                </button>
                <button
                    className="nav-arrow"
                    onClick={onNext}
                    aria-label="Next month"
                    title="Next month"
                >
                    ›
                </button>
            </div>
        </header>
    );
}
