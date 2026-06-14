"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function NewBookPage() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [status, setStatus] = useState("want_to_read");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const res = await fetch(`${API_URL}/books`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, author, status }),
            });
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }
            router.push("/books");
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create book");
            setIsSubmitting(false);
        }
    }

    return (
        <section className="max-w-xl mx-auto px-6 py-12">
            <div className="mb-8">
                <Link
                    href="/books"
                    className="text-sm text-slate-600 hover:text-blue-700 transition-colors"
                >
                    &larr; Back to books
                </Link>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 mt-2">
                    Add a Book
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label
                        htmlFor="title"
                        className="block text-sm font-medium text-slate-700 mb-1"
                    >
                        Title
                    </label>
                    <input
                        id="title"
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        placeholder="e.g. Designing Data-Intensive Applications"
                    />
                </div>

                <div>
                    <label
                        htmlFor="author"
                        className="block text-sm font-medium text-slate-700 mb-1"
                    >
                        Author
                    </label>
                    <input
                        id="author"
                        type="text"
                        required
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        placeholder="e.g. Martin Kleppmann"
                    />
                </div>

                <div>
                    <label
                        htmlFor="status"
                        className="block text-sm font-medium text-slate-700 mb-1"
                    >
                        Status
                    </label>
                    <select
                        id="status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    >
                        <option value="want_to_read">Want to read</option>
                        <option value="reading">Reading</option>
                        <option value="read">Read</option>
                    </select>
                </div>

                {error && (
                    <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                        {error}
                    </div>
                )}

                <div className="flex gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center rounded-md bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSubmitting ? "Adding..." : "Add Book"}
                    </button>
                    <Link
                        href="/books"
                        className="inline-flex items-center rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </section>
    );
}
