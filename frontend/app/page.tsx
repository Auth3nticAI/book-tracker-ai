import Link from "next/link";

export default function HomePage() {
    return (
        <section className="max-w-4xl mx-auto px-6 py-20 sm:py-28 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900">
                Book Tracker
            </h1>
            <p className="mt-4 text-lg text-slate-600 max-w-xl mx-auto">
                Track what you&apos;re reading, want to read, and have finished.
                A full-stack lab project: Next.js frontend, FastAPI backend,
                PostgreSQL database.
            </p>

            <div className="mt-10 flex flex-wrap gap-3 justify-center">
                <Link
                    href="/books"
                    className="inline-flex items-center justify-center rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 transition-colors"
                >
                    Browse My Books
                </Link>
                <Link
                    href="/books/new"
                    className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition-colors"
                >
                    Add a Book
                </Link>
            </div>
        </section>
    );
}
