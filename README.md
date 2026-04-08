# 📅 Calendar — The Redesign

A visually striking, highly unique calendar component built with Next.js 15, TypeScript, and a custom glassmorphic CSS design system. 

It completely reimagines what a web calendar looks like: ditching boring white grids for full-bleed immersive landscapes, floating frosted-glass cards, and deeply polished interactions.

---

## 🎨 Unique Features

- **Immersive Glassmorphism**: The calendar floats as a frosted glass card over a full-bleed, screen-filling background image.
- **12 Unique Landscapes**: Instead of repeating images, we generate 12 completely distinct, high-res photos. January gets a frozen drone shot, May gets emerald rice terraces, December gets a snowy village. The background cross-fades as you navigate.
- **Year Skip (2026 → 2028)**: By request, the calendar logic omits the year 2027 entirely. Navigating forward from December 2026 drops you perfectly into January 2028.
- **Saved Notes System**: A fully functional local storage notes system. Select a date range, write a memo, and hit **Save**. Saved notes appear in a ledger, complete with delete actions and ISO timestamp tracking.
- **Three Custom Themes**: `Light`, `Dark`, and a warm `Ember` theme. Every color, shadow, glow, and border updates instantly via CSS variables.

---

## 🛠 Tech & Architecture

- **Next.js 15 / App Router**: Component rendering.
- **Pure CSS**: No Tailwind, no component libraries. The `globals.css` file is heavily optimized with custom properties for deep level design control.
- **No Dependencies**: All date math, range calculations, and skips are done natively with JavaScript's `Date` object in `calendarHelpers.ts`.

## 🚀 Getting Started

```bash
cd calendar-app
npm install
npm run dev
```

Visit `http://localhost:3000`.

## ⌨️ Accessibility
- Arrow keys move focus across the dates grid.
- `Enter` / `Space` selects.
- `Ctrl+Enter` (or `Cmd+Enter`) saves a note quickly.
