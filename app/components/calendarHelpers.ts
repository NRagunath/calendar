// ============================================================
// calendarHelpers.ts — Pure utility functions for the calendar
//
// Handles all the date math, month names, holiday lookups,
// hero image mapping (12 unique images, one per month),
// the 2026→2028 year skip logic, and theme cycling.
//
// Zero dependencies — just the built-in Date object.
// ============================================================

// ---- Month & Day Names ----

export const MONTH_NAMES = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
] as const;

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export function getMonthName(monthIndex: number): string {
  return MONTH_NAMES[monthIndex] || "";
}

export function getWeekdayLabels(): readonly string[] {
  return WEEKDAY_LABELS;
}

// ---- Date Math ----

/**
 * Days in a given month. The "day 0 of next month" trick
 * gives us the last day of the current month automatically.
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Which day-of-week does the 1st fall on?
 * Returns 0 = Monday ... 6 = Sunday (ISO style).
 */
export function getStartDayOffset(year: number, month: number): number {
  const jsDay = new Date(year, month, 1).getDay(); // 0=Sun
  return jsDay === 0 ? 6 : jsDay - 1;
}

export function isSameDay(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isBetween(target: Date, start: Date | null, end: Date | null): boolean {
  if (!start || !end) return false;
  const t = target.getTime();
  return t > start.getTime() && t < end.getTime();
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function formatShortDate(date: Date): string {
  const monthAbbr = MONTH_NAMES[date.getMonth()].slice(0, 3);
  return `${monthAbbr} ${date.getDate()}`;
}

/**
 * Format for saved note timestamps.
 * Returns something like "Apr 8, 2026 at 3:14 PM"
 */
export function formatTimestamp(date: Date): string {
  const monthAbbr = MONTH_NAMES[date.getMonth()].slice(0, 3);
  const day = date.getDate();
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const amPm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${monthAbbr} ${day}, ${year} at ${hours}:${minutes} ${amPm}`;
}

// ============================================================
// Year Skip Logic — 2026 → 2028, skipping 2027
//
// The calendar should jump from December 2026 directly to
// January 2028 when navigating forward, and from January 2028
// ============================================================

export interface MonthYear {
  month: number;
  year: number;
}

export function getNextMonth(current: MonthYear): MonthYear {
  let nextMonth = current.month + 1;
  let nextYear = current.year;

  if (nextMonth > 11) {
    nextMonth = 0;
    nextYear += 1;
  }

  return { month: nextMonth, year: nextYear };
}

/**
 * Returns the previous month/year.
 */
export function getPrevMonth(current: MonthYear): MonthYear {
  let prevMonth = current.month - 1;
  let prevYear = current.year;

  if (prevMonth < 0) {
    prevMonth = 11;
    prevYear -= 1;
  }

  return { month: prevMonth, year: prevYear };
}

// ============================================================
// Holiday Map — popular holidays by MM-DD
// ============================================================

export interface HolidayInfo {
  name: string;
  emoji: string;
}

const HOLIDAYS: Record<string, HolidayInfo> = {
  // January
  "01-01": { name: "New Year's Day", emoji: "🎉" },
  "01-15": { name: "Makar Sankranti / Pongal", emoji: "🌾" },
  "01-26": { name: "Republic Day (India)", emoji: "🇮🇳" },

  // February
  "02-14": { name: "Valentine's Day", emoji: "❤️" },
  "02-28": { name: "National Science Day", emoji: "🔬" },

  // March
  "03-08": { name: "Intl. Women's Day", emoji: "👩‍💼" },
  "03-14": { name: "Pi Day", emoji: "🥧" },
  "03-17": { name: "St. Patrick's Day", emoji: "☘️" },
  "03-25": { name: "Holi (Festival of Colors)", emoji: "🎨" }, // Approx

  // April
  "04-01": { name: "April Fools'", emoji: "🤡" },
  "04-14": { name: "Ambedkar Jayanti", emoji: "⚖️" },
  "04-22": { name: "Earth Day", emoji: "🌍" },

  // May
  "05-01": { name: "Labor Day / May Day", emoji: "🛠️" },
  "05-12": { name: "Mother's Day", emoji: "💐" },

  // June
  "06-05": { name: "World Environment Day", emoji: "🌱" },
  "06-16": { name: "Father's Day", emoji: "👔" },
  "06-21": { name: "Intl. Yoga Day / Solstice", emoji: "🧘" },

  // July
  "07-04": { name: "US Independence Day", emoji: "🇺🇸" },
  "07-17": { name: "World Emoji Day", emoji: "😂" },

  // August
  "08-15": { name: "Independence Day (India)", emoji: "🇮🇳" },
  "08-30": { name: "Raksha Bandhan", emoji: "🎗️" },

  // September
  "09-05": { name: "Teacher's Day", emoji: "📚" },
  "09-22": { name: "Autumn Equinox", emoji: "🍂" },

  // October
  "10-02": { name: "Gandhi Jayanti", emoji: "🕊️" },
  "10-24": { name: "United Nations Day", emoji: "🕊️" },
  "10-31": { name: "Halloween", emoji: "🎃" },

  // November
  "11-01": { name: "Diwali (Festival of Lights)", emoji: "🪔" }, // Approx
  "11-14": { name: "Children's Day", emoji: "🎈" },
  "11-28": { name: "Thanksgiving", emoji: "🦃" },

  // December
  "12-25": { name: "Christmas Day", emoji: "🎄" },
  "12-31": { name: "New Year's Eve", emoji: "🥂" },
};

export function getHoliday(date: Date): HolidayInfo | null {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return HOLIDAYS[`${mm}-${dd}`] || null;
}

// ============================================================
// Monthly Images — 12 unique photos, one per month
// Each month always shows the same image regardless of year.
// ============================================================

const MONTHLY_IMAGES: Record<number, string> = {
  0: "/month-01.png",   // Jan — frozen lake
  1: "/month-02.png",   // Feb — cherry blossoms
  2: "/month-03.png",   // Mar — thunderstorm plains
  3: "/month-04.png",   // Apr — lavender fields
  4: "/month-05.png",   // May — rice terraces
  5: "/month-06.png",   // Jun — northern lights
  6: "/month-07.png",   // Jul — hot air balloons
  7: "/month-08.png",   // Aug — cenote
  8: "/month-09.png",   // Sep — autumn road
  9: "/month-10.png",   // Oct — cliff castle
  10: "/month-11.png",   // Nov — desert dunes
  11: "/month-12.png",   // Dec — snowy village
};

// descriptive captions for each month's image
const MONTHLY_CAPTIONS: Record<number, string> = {
  0: "Frozen Serenity",
  1: "Blossom Whispers",
  2: "Storm & Bloom",
  3: "Lavender Dreams",
  4: "Emerald Terraces",
  5: "Aurora Symphony",
  6: "Sky Festival",
  7: "Crystal Depths",
  8: "Amber Path",
  9: "Cliffside Majesty",
  10: "Golden Sands",
  11: "Winter Glow",
};

export function getMonthImage(monthIndex: number): string {
  return MONTHLY_IMAGES[monthIndex] || "/month-01.png";
}

export function getMonthCaption(monthIndex: number): string {
  return MONTHLY_CAPTIONS[monthIndex] || "";
}

// ============================================================
// Theme Helpers
// ============================================================

export type ThemeName = "light" | "dark" | "ember";

const THEME_ORDER: ThemeName[] = ["light", "dark", "ember"];

const THEME_LABELS: Record<ThemeName, { icon: string; label: string }> = {
  light: { icon: "☀️", label: "Light" },
  dark: { icon: "🌙", label: "Dark" },
  ember: { icon: "🔥", label: "Ember" },
};

export function cycleTheme(current: ThemeName): ThemeName {
  const idx = THEME_ORDER.indexOf(current);
  return THEME_ORDER[(idx + 1) % THEME_ORDER.length];
}

export function getThemeLabel(theme: ThemeName) {
  return THEME_LABELS[theme];
}

// ============================================================
// Saved Notes — types and localStorage helpers
// ============================================================

export interface SavedNote {
  id: string;
  text: string;
  savedAt: string;       // ISO string
  monthKey: string;       // e.g., "2026-4"
  rangeLabel: string | null; // e.g., "Apr 5 – Apr 12" or null for month-level
}

const NOTES_STORAGE_KEY = "wall-calendar-saved-notes";

export function loadAllNotes(): SavedNote[] {
  try {
    const raw = localStorage.getItem(NOTES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveNote(note: SavedNote): SavedNote[] {
  const allNotes = loadAllNotes();
  allNotes.unshift(note); // newest first
  try {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(allNotes));
  } catch {
    // storage full — silently fail
  }
  return allNotes;
}

export function deleteNoteById(noteId: string): SavedNote[] {
  const allNotes = loadAllNotes().filter((n) => n.id !== noteId);
  try {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(allNotes));
  } catch {
    // ignore
  }
  return allNotes;
}

export function getNotesForMonth(year: number, month: number): SavedNote[] {
  const key = `${year}-${month}`;
  return loadAllNotes().filter((n) => n.monthKey === key);
}

/**
 * Generates a simple unique ID for each saved note.
 * No uuid library needed — timestamp + random suffix is fine here.
 */
export function makeNoteId(): string {
  return `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
