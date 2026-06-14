"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Book, STATUS_LABELS, STATUS_STYLES } from "../../lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function BooksListPage() {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                const res = await fetch(`${API_URL}/books`);
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                const data = (await res.json()) as Book[];
                if (!cancelled) {
                    setBooks(data);
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
    }, []);

    return (
        <section className="max-w-4xl mx-auto px-6 py-12">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        My Books
                    </h1>
                    <p className="text-slate-600 mt-1">
                        Everything you&apos;ve tracked, in one place.
                    </p>
                </div>
                <Link
                    href="/books/new"
                    className="inline-flex items-center rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 transition-colors"
                >
                    + Add Book
                </Link>
            </div>

            {loading && (
                <p className="text-slate-500 text-center py-12">Loading books...</p>
            )}

            {error && !loading && (
                <div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-800">
                    <strong>Could not load books.</strong> {error}
                    <p className="mt-2 text-red-700">
                        Make sure the backend is running at <code>{API_URL}</code>.
                    </p>
                </div>
            )}

            {!loading && !error && books.length === 0 && (
                <div className="text-center py-16 border-2 border-dashed border-slate-300 rounded-lg">
                    <p className="text-slate-600 mb-4">No books yet.</p>
                    <Link
                        href="/books/new"
                        className="inline-flex items-center rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 transition-colors"
                    >
                        Add your first book
                    </Link>
                </div>
            )}

            {!loading && !error && books.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2">
                    {books.map((book) => (
                        <Link
                            key={book.id}
                            href={`/books/${book.id}`}
                            className="block rounded-lg border border-slate-200 bg-white p-5 hover:border-slate-300 hover:shadow-sm transition-all"
                        >
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <h2 className="text-lg font-semibold text-slate-900">
                                    {book.title}
                                </h2>
                                <span
                                    className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${STATUS_STYLES[book.status]}`}
                                >
                                    {STATUS_LABELS[book.status]}
                                </span>
                            </div>
                            <p className="text-sm text-slate-600 mb-3">
                                by {book.author}
                            </p>
                            {book.rating !== null && (
                                <p className="text-sm text-amber-600">
                                    {"★".repeat(book.rating)}
                                    <span className="text-slate-300">
                                        {"★".repeat(5 - book.rating)}
                                    </span>
                                </p>
                            )}
                        </Link>
                    ))}
                </div>
            )}
        </section>
    );
}
