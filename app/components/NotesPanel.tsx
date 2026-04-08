"use client";

// ============================================================
// NotesPanel.tsx — Save-based notes with explicit Save button
//
// Key difference from v1: notes are now explicitly SAVED.
// The user types a note, hits "Save Note", and it gets
// persisted as a card below. No more auto-save on every
// keystroke. Saved notes show with timestamps and can be
// individually deleted.
//
// Notes are scoped:
//  - If a date range is selected → note is tagged with that range
//  - Otherwise → it's a general month-level note
// ============================================================

import React, { useState, useEffect, useCallback } from "react";
import {
    getMonthName,
    formatShortDate,
    formatTimestamp,
    makeNoteId,
    saveNote,
    deleteNoteById,
    getNotesForMonth,
    type SavedNote,
} from "./calendarHelpers";

interface DateRange {
    start: Date | null;
    end: Date | null;
}

interface NotesPanelProps {
    year: number;
    month: number;
    selectedRange: DateRange;
    onClearRange: () => void;
}

const MAX_CHARS = 500;

export default function NotesPanel({
    year,
    month,
    selectedRange,
    onClearRange,
}: NotesPanelProps) {
    const [draftText, setDraftText] = useState("");
    const [savedNotes, setSavedNotes] = useState<SavedNote[]>([]);
    const [showToast, setShowToast] = useState(false);

    // load saved notes whenever month or year changes
    useEffect(() => {
        setSavedNotes(getNotesForMonth(year, month));
        setDraftText(""); // clear draft when switching months
    }, [year, month]);

    // figure out the range label for scoping
    const hasRange = selectedRange.start && selectedRange.end;
    const rangeLabel = hasRange
        ? `${formatShortDate(selectedRange.start!)} – ${formatShortDate(selectedRange.end!)}`
        : null;

    // ---- save handler ----
    const handleSave = useCallback(() => {
        const trimmed = draftText.trim();
        if (!trimmed) return;

        const newNote: SavedNote = {
            id: makeNoteId(),
            text: trimmed,
            savedAt: new Date().toISOString(),
            monthKey: `${year}-${month}`,
            rangeLabel: rangeLabel,
        };

        const updatedNotes = saveNote(newNote);
        setSavedNotes(updatedNotes.filter((n) => n.monthKey === `${year}-${month}`));
        setDraftText("");

        // show toast
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2200);
    }, [draftText, year, month, rangeLabel]);

    // ---- delete handler ----
    const handleDelete = useCallback(
        (noteId: string) => {
            const updatedNotes = deleteNoteById(noteId);
            setSavedNotes(updatedNotes.filter((n) => n.monthKey === `${year}-${month}`));
        },
        [year, month]
    );

    // ---- input handler ----
    const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (e.target.value.length <= MAX_CHARS) {
            setDraftText(e.target.value);
        }
    }, []);

    // ---- keyboard shortcut: Ctrl+Enter to save ----
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                e.preventDefault();
                handleSave();
            }
        },
        [handleSave]
    );

    const charCount = draftText.length;
    const isNearLimit = charCount > MAX_CHARS * 0.85;
    const canSave = draftText.trim().length > 0;

    const placeholderText = hasRange
        ? `Write a note for ${rangeLabel}...`
        : `Write a note for ${getMonthName(month)} ${year}...`;

    return (
        <aside className="notes-section" aria-label="Notes">
            {/* header */}
            <div className="notes-header">
                <div>
                    <h3 className="notes-heading">📝 Notes</h3>
                    <p className="notes-scope-label">
                        {hasRange ? "Range-specific" : "Monthly memo"}
                    </p>
                </div>
                <span className={`notes-counter${isNearLimit ? " near-limit" : ""}`}>
                    {charCount}/{MAX_CHARS}
                </span>
            </div>

            {/* range badge */}
            {hasRange && (
                <div className="active-range-pill">
                    <span>📅 {rangeLabel}</span>
                    <button
                        className="clear-btn"
                        onClick={onClearRange}
                        aria-label="Clear date range"
                        title="Clear selection"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* text input + save button */}
            <div className="notes-input-area">
                <textarea
                    className="notes-textarea"
                    value={draftText}
                    onChange={handleTextChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholderText}
                    aria-label={hasRange ? `Notes for ${rangeLabel}` : `Notes for ${getMonthName(month)}`}
                    spellCheck
                />
                <button
                    className="save-note-btn"
                    onClick={handleSave}
                    disabled={!canSave}
                    title={canSave ? "Save note (Ctrl+Enter)" : "Type something first"}
                >
                    💾 Save Note
                </button>
            </div>

            {/* saved notes list */}
            {savedNotes.length > 0 && (
                <>
                    <div className="saved-notes-divider">
                        <span>Saved ({savedNotes.length})</span>
                    </div>
                    <div className="saved-notes-list">
                        {savedNotes.map((note) => (
                            <div key={note.id} className="saved-note-card">
                                <div className="saved-note-meta">
                                    <span className="saved-note-date">
                                        {note.rangeLabel
                                            ? `📅 ${note.rangeLabel}`
                                            : formatTimestamp(new Date(note.savedAt))}
                                    </span>
                                    <button
                                        className="saved-note-delete"
                                        onClick={() => handleDelete(note.id)}
                                        aria-label="Delete note"
                                        title="Delete this note"
                                    >
                                        🗑️
                                    </button>
                                </div>
                                <p className="saved-note-text">{note.text}</p>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* save confirmation toast */}
            <div className={`save-toast${showToast ? " visible" : ""}`}>
                ✅ Note saved!
            </div>
        </aside>
    );
}
