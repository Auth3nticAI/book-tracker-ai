export interface Book {
    id: number;
    title: string;
    author: string;
    status: "want_to_read" | "reading" | "read";
    rating: number | null;
}

export const STATUS_LABELS: Record<Book["status"], string> = {
    want_to_read: "Want to read",
    reading: "Reading",
    read: "Read",
};

export const STATUS_STYLES: Record<Book["status"], string> = {
    want_to_read: "bg-slate-100 text-slate-700",
    reading: "bg-amber-100 text-amber-800",
    read: "bg-green-100 text-green-800",
};

export interface Note {
    id: number;
    book_id: number;
    content: string;
    page_number: number | null;
    created_at: string;
}

export interface NoteSummary {
    book_id: number;
    book_title: string;
    note_count: number;
    summary: string;
}
