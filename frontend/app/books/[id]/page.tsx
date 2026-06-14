"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Book,
    Note,
    NoteSummary,
    STATUS_LABELS,
    STATUS_STYLES,
} from "../../../lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function BookDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const bookId = parseInt(id, 10);
    const router = useRouter();

    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                const res = await fetch(`${API_URL}/books/${bookId}`);
                if (!res.ok) {
                    throw new Error(
                        res.status === 404 ? "Book not found" : `HTTP ${res.status}`
                    );
                }
                const data = (await res.json()) as Book;
                if (!cancelled) {
                    setBook(data);
                    setLoading(false);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Failed to load");
                    setLoading(false);
                }
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [bookId]);

    async function updateStatus(newStatus: Book["status"]) {
        if (!book) return;
        setUpdating(true);
        try {
            const res = await fetch(`${API_URL}/books/${bookId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const updated = (await res.json()) as Book;
            setBook(updated);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Update failed");
        } finally {
            setUpdating(false);
        }
    }

    async function updateRating(rating: number) {
        if (!book) return;
        setUpdating(true);
        try {
            const res = await fetch(`${API_URL}/books/${bookId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rating }),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const updated = (await res.json()) as Book;
            setBook(updated);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Update failed");
        } finally {
            setUpdating(false);
        }
    }

    async function handleDelete() {
        if (!confirm(`Delete "${book?.title}"? This cannot be undone.`)) return;
        setDeleting(true);
        try {
            const res = await fetch(`${API_URL}/books/${bookId}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            router.push("/books");
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Delete failed");
            setDeleting(false);
        }
    }

    if (loading) {
        return (
            <section className="max-w-2xl mx-auto px-6 py-12">
                <p className="text-slate-500">Loading book...</p>
            </section>
        );
    }

    if (error || !book) {
        return (
            <section className="max-w-2xl mx-auto px-6 py-12">
                <Link
                    href="/books"
                    className="text-sm text-slate-600 hover:text-blue-700"
                >
                    &larr; Back to books
                </Link>
                <div className="mt-4 rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-800">
                    {error ?? "Book not found"}
                </div>
            </section>
        );
    }

    return (
        <section className="max-w-2xl mx-auto px-6 py-12">
            <Link
                href="/books"
                className="text-sm text-slate-600 hover:text-blue-700 transition-colors"
            >
                &larr; Back to books
            </Link>

            <div className="mt-4 rounded-lg border border-slate-200 bg-white p-8">
                <div className="flex items-start justify-between gap-4 mb-2">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        {book.title}
                    </h1>
                    <span
                        className={`text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap ${STATUS_STYLES[book.status]}`}
                    >
                        {STATUS_LABELS[book.status]}
                    </span>
                </div>
                <p className="text-slate-600 mb-8">by {book.author}</p>

                <div className="space-y-6">
                    <div>
                        <h2 className="text-sm font-semibold text-slate-700 mb-2">
                            Change status
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {(["want_to_read", "reading", "read"] as const).map(
                                (s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => updateStatus(s)}
                                        disabled={updating || book.status === s}
                                        className={`text-sm px-3 py-1.5 rounded-md border transition-colors ${
                                            book.status === s
                                                ? "bg-blue-700 text-white border-blue-700"
                                                : "bg-white text-slate-700 border-slate-300 hover:border-slate-400 hover:bg-slate-50"
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        {STATUS_LABELS[s]}
                                    </button>
                                )
                            )}
                        </div>
                    </div>

                    {book.status === "read" && (
                        <div>
                            <h2 className="text-sm font-semibold text-slate-700 mb-2">
                                Rating
                            </h2>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((r) => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => updateRating(r)}
                                        disabled={updating}
                                        className={`text-2xl transition-colors ${
                                            book.rating !== null && r <= book.rating
                                                ? "text-amber-500"
                                                : "text-slate-300 hover:text-amber-400"
                                        } disabled:cursor-not-allowed`}
                                        aria-label={`Rate ${r} stars`}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-10 pt-6 border-t border-slate-200">
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleting}
                        className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {deleting ? "Deleting..." : "Delete this book"}
                    </button>
                </div>
            </div>

            <NotesPanel bookId={bookId} />
        </section>
    );
}


function NotesPanel({ bookId }: { bookId: number }) {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [showAdd, setShowAdd] = useState(false);
    const [draftContent, setDraftContent] = useState("");
    const [draftPage, setDraftPage] = useState("");
    const [adding, setAdding] = useState(false);

    const [summary, setSummary] = useState<NoteSummary | null>(null);
    const [summarizing, setSummarizing] = useState(false);

    async function reload() {
        try {
            const res = await fetch(`${API_URL}/books/${bookId}/notes`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setNotes((await res.json()) as Note[]);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed");
        }
    }

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(`${API_URL}/books/${bookId}/notes`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = (await res.json()) as Note[];
                if (!cancelled) {
                    setNotes(data);
                    setLoading(false);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Failed");
                    setLoading(false);
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [bookId]);

    async function addNote(e: React.FormEvent) {
        e.preventDefault();
        const content = draftContent.trim();
        if (!content || adding) return;
        setAdding(true);
        try {
            const res = await fetch(`${API_URL}/books/${bookId}/notes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content,
                    page_number: draftPage ? parseInt(draftPage, 10) : null,
                }),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setDraftContent("");
            setDraftPage("");
            setShowAdd(false);
            setSummary(null); // invalidate stale summary
            await reload();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to add");
        } finally {
            setAdding(false);
        }
    }

    async function deleteNote(noteId: number) {
        if (!confirm("Delete this note?")) return;
        try {
            const res = await fetch(`${API_URL}/notes/${noteId}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setSummary(null);
            await reload();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete");
        }
    }

    async function summarize() {
        setSummarizing(true);
        setError(null);
        try {
            const res = await fetch(
                `${API_URL}/ai/books/${bookId}/summarize-notes`,
                { method: "POST" }
            );
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setSummary((await res.json()) as NoteSummary);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to summarize");
        } finally {
            setSummarizing(false);
        }
    }

    return (
        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-8">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">
                        Notes
                        <span className="text-slate-400 font-normal ml-2">
                            ({notes.length})
                        </span>
                    </h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Capture quotes and reactions while you read.
                    </p>
                </div>
                <div className="flex gap-2">
                    {notes.length > 0 && (
                        <button
                            type="button"
                            onClick={summarize}
                            disabled={summarizing}
                            className="inline-flex items-center rounded-md border border-blue-300 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50 transition-colors"
                        >
                            {summarizing ? "Synthesizing..." : "AI synthesis"}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => setShowAdd((v) => !v)}
                        className="inline-flex items-center rounded-md bg-blue-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-800 transition-colors"
                    >
                        {showAdd ? "Cancel" : "+ Note"}
                    </button>
                </div>
            </div>

            {showAdd && (
                <form
                    onSubmit={addNote}
                    className="rounded-md border border-blue-200 bg-blue-50/50 p-4 mb-4 space-y-3"
                >
                    <textarea
                        required
                        rows={3}
                        value={draftContent}
                        onChange={(e) => setDraftContent(e.target.value)}
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        placeholder="A quote, an idea, a reaction..."
                    />
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            min="1"
                            value={draftPage}
                            onChange={(e) => setDraftPage(e.target.value)}
                            placeholder="Page (optional)"
                            className="w-36 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm"
                        />
                        <button
                            type="submit"
                            disabled={adding || !draftContent.trim()}
                            className="inline-flex items-center rounded-md bg-blue-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:bg-slate-400 transition-colors"
                        >
                            {adding ? "Saving..." : "Save note"}
                        </button>
                    </div>
                </form>
            )}

            {error && (
                <div className="mb-3 rounded-md bg-red-50 border border-red-200 p-2 text-sm text-red-800">
                    {error}
                </div>
            )}

            {summary && (
                <div className="mb-4 rounded-md border border-blue-200 bg-blue-50/50 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-blue-900">
                            AI synthesis ({summary.note_count} notes)
                        </h3>
                        <button
                            type="button"
                            onClick={() => setSummary(null)}
                            className="text-xs text-blue-700 hover:underline"
                        >
                            dismiss
                        </button>
                    </div>
                    <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                        {summary.summary}
                    </div>
                </div>
            )}

            {loading && (
                <p className="text-sm text-slate-500">Loading notes...</p>
            )}

            {!loading && notes.length === 0 && !showAdd && (
                <p className="text-sm text-slate-500 text-center py-6 border-2 border-dashed border-slate-200 rounded-md">
                    No notes yet. Add one to start building a reading journal.
                </p>
            )}

            {notes.length > 0 && (
                <ul className="space-y-3">
                    {notes.map((n) => (
                        <li
                            key={n.id}
                            className="rounded-md border border-slate-200 bg-slate-50 p-4"
                        >
                            <div className="text-sm text-slate-800 whitespace-pre-wrap">
                                {n.content}
                            </div>
                            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                                <span>
                                    {n.page_number !== null
                                        ? `Page ${n.page_number}`
                                        : "—"}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => deleteNote(n.id)}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
