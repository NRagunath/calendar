"use client";

// ============================================================
// WallCalendar.tsx — Root component for the glassmorphic redesign
//
// This manages the state for the current month/year and the
// selected date range. It also manages the full-bleed background
// image which changes based on the month, while the calendar
// card itself floats over it in the center.
// ============================================================

import React, { useState, useCallback, useEffect } from "react";
import CalendarHero from "./CalendarHero";
import MonthNavigator from "./MonthNavigator";
import CalendarGrid from "./CalendarGrid";
import NotesPanel from "./NotesPanel";
import {
    getNextMonth,
    getPrevMonth,
    getMonthImage,
    cycleTheme,
    type ThemeName,
    type MonthYear,
} from "./calendarHelpers";

interface DateRange {
    start: Date | null;
    end: Date | null;
}

export default function WallCalendar() {
    // ---- state ----

    const today = new Date();
    const [activeDate, setActiveDate] = useState<MonthYear>({
        month: today.getMonth(),
        year: today.getFullYear(),
    });

    const [selectedRange, setSelectedRange] = useState<DateRange>({
        start: null,
        end: null,
    });

    const [theme, setTheme] = useState<ThemeName>("light");
    const [flipDir, setFlipDir] = useState<"next" | "prev" | null>(null);

    // ---- theme integration ----

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    const handleThemeToggle = useCallback(() => {
        setTheme((prev) => cycleTheme(prev));
    }, []);

    // ---- navigation ----

    const handleNextMonth = useCallback(() => {
        setFlipDir("next");
        setTimeout(() => {
            setActiveDate((prev) => getNextMonth(prev));
            setSelectedRange({ start: null, end: null }); // explicitly reset on month change
        }, 275); // halfway through 550ms flip
        setTimeout(() => setFlipDir(null), 550);
    }, []);

    const handlePrevMonth = useCallback(() => {
        setFlipDir("prev");
        setTimeout(() => {
            setActiveDate((prev) => getPrevMonth(prev));
            setSelectedRange({ start: null, end: null });
        }, 275); // halfway through 550ms flip
        setTimeout(() => setFlipDir(null), 550);
    }, []);

    const handleDateChange = useCallback((year: number, month: number) => {
        // If navigating forward in time vs backward, animate accordingly
        const current = new Date(activeDate.year, activeDate.month);
        const target = new Date(year, month);
        setFlipDir(target.getTime() > current.getTime() ? "next" : "prev");

        setTimeout(() => {
            setActiveDate({ year, month });
            setSelectedRange({ start: null, end: null });
        }, 275);
        setTimeout(() => setFlipDir(null), 550);
    }, [activeDate]);

    // ---- range ----

    const handleRangeChange = useCallback((range: DateRange) => {
        setSelectedRange(range);
    }, []);

    const handleClearRange = useCallback(() => {
        setSelectedRange({ start: null, end: null });
    }, []);

    // ---- flip animation logic ----

    let flipClass = "flip-card";
    if (flipDir === "next") flipClass += " flip-next";
    if (flipDir === "prev") flipClass += " flip-prev";

    // ---- background rendering ----

    // We render all 12 images absolutely positioned so the browser
    // can smoothly crossfade opacity between them using native CSS.
    // This achieves a completely seamless cinematic transition.

    return (
        <>
            {/* Immersive Background */}
            <div className="immersive-backdrop" aria-hidden="true">
                {Array.from({ length: 12 }).map((_, i) => (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                        key={i}
                        className="backdrop-image"
                        src={getMonthImage(i)}
                        alt=""
                        role="presentation"
                        style={{ opacity: activeDate.month === i ? 1 : 0 }}
                    />
                ))}
                <div className="backdrop-grain" />
                <div className="backdrop-fade" />
            </div>

            {/* Foreground Content */}
            <div className="calendar-page">
                <div className="flip-perspective">
                    <main className={`${flipClass} glass-calendar`}>
                        {/* Top Bar Navigation */}
                        <MonthNavigator
                            year={activeDate.year}
                            month={activeDate.month}
                            theme={theme}
                            onPrev={handlePrevMonth}
                            onNext={handleNextMonth}
                            onThemeToggle={handleThemeToggle}
                            onDateChange={handleDateChange}
                        />

                        {/* Sub-hero Image Strip */}
                        <CalendarHero year={activeDate.year} month={activeDate.month} />

                        {/* Body */}
                        <div className="calendar-body">
                            <CalendarGrid
                                year={activeDate.year}
                                month={activeDate.month}
                                selectedRange={selectedRange}
                                onRangeChange={handleRangeChange}
                            />
                            <NotesPanel
                                year={activeDate.year}
                                month={activeDate.month}
                                selectedRange={selectedRange}
                                onClearRange={handleClearRange}
                            />
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
