"use client";

// ============================================================
// CalendarHero.tsx — Hero image strip inside the glass card
//
// A smaller, rounded image strip that sits inside the calendar
// card rather than being a full-width header. Shows the
// month's unique landscape photo with a gradient overlay
// and a caption label (e.g., "Lavender Dreams").
// ============================================================

import React from "react";
import { getMonthImage, getMonthCaption, getMonthName } from "./calendarHelpers";

interface CalendarHeroProps {
    year: number;
    month: number;
}

export default function CalendarHero({ year, month }: CalendarHeroProps) {
    const imageSrc = getMonthImage(month);
    const caption = getMonthCaption(month);
    const monthName = getMonthName(month);

    return (
        <div className="hero-strip" role="img" aria-label={`${monthName} ${year} — ${caption}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                className="hero-strip-image"
                src={imageSrc}
                alt={`${caption} — landscape for ${monthName}`}
                draggable={false}
            />
            <div className="hero-strip-overlay" />
            <div className="hero-strip-label">
                <span className="hero-subtitle">{caption}</span>
                <span className="hero-title">{monthName}</span>
            </div>
        </div>
    );
}
