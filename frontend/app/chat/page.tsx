"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const API_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

type Mode = "chat" | "recommend";
type Role = "user" | "assistant";
interface Message {
    role: Role;
    content: string;
}

const MODE_CONFIG: Record<
    Mode,
    {
        label: string;
        sublabel: string;
        endpoint: string;
        emptyHint: string;
        placeholder: string;
    }
> = {
    chat: {
        label: "General Chat",
        sublabel: "Talk to a bookish assistant",
        endpoint: "/ai/chat",
        emptyHint:
            "Ask anything about books — \"who wrote X?\", \"what should I read on systems?\", \"is X worth it?\"",
        placeholder: "Ask about a book...",
    },
    recommend: {
        label: "Book Recommendations",
        sublabel: "Personalized to your library",
        endpoint: "/ai/recommend",
        emptyHint:
            "Ask for recommendations grounded in your tracked books. \"What should I read next?\" \"More like Database Internals?\"",
        placeholder: "Ask for a recommendation...",
    },
};

export default function ChatPage() {
    const [mode, setMode] = useState<Mode>("chat");
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, sending]);

    function switchMode(newMode: Mode) {
        if (newMode === mode) return;
        setMode(newMode);
        setMessages([]);
        setError(null);
        setInput("");
    }

    async function sendMessage(e: React.FormEvent) {
        e.preventDefault();
        const trimmed = input.trim();
        if (!trimmed || sending) return;

        const userMessage: Message = { role: "user", content: trimmed };
        const newHistory = [...messages, userMessage];
        setMessages(newHistory);
        setInput("");
        setSending(true);
        setError(null);

        try {
            const res = await fetch(`${API_URL}${MODE_CONFIG[mode].endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: trimmed,
                    conversation_history: messages,
                }),
            });

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }

            const data = (await res.json()) as { reply: string };
            setMessages([
                ...newHistory,
                { role: "assistant", content: data.reply },
            ]);
        } catch (err) {
            setError(
                err instanceof Error
                    ? `Could not reach the assistant: ${err.message}`
                    : "Could not reach the assistant"
            );
        } finally {
            setSending(false);
        }
    }

    return (
        <section className="max-w-3xl mx-auto px-6 py-8 flex flex-col h-[calc(100vh-120px)]">
            <div className="mb-4">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    AI Assistant
                </h1>
                <p className="text-sm text-slate-600">
                    {MODE_CONFIG[mode].sublabel}
                </p>
            </div>

            {/* Mode toggle */}
            <div className="mb-4 inline-flex rounded-lg border border-slate-200 bg-slate-100 p-1 self-start">
                {(["chat", "recommend"] as const).map((m) => (
                    <button
                        key={m}
                        type="button"
                        onClick={() => switchMode(m)}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                            mode === m
                                ? "bg-white text-slate-900 shadow-sm"
                                : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                        {MODE_CONFIG[m].label}
                    </button>
                ))}
            </div>

            {/* Message area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto rounded-lg border border-slate-200 bg-white p-4 mb-3"
            >
                {messages.length === 0 && !sending && (
                    <div className="h-full flex items-center justify-center">
                        <p className="text-sm text-slate-500 text-center max-w-md leading-relaxed">
                            {MODE_CONFIG[mode].emptyHint}
                            {mode === "recommend" && (
                                <>
                                    {" "}
                                    <Link
                                        href="/books"
                                        className="text-blue-700 hover:underline"
                                    >
                                        Track some books
                                    </Link>{" "}
                                    first for the best results.
                                </>
                            )}
                        </p>
                    </div>
                )}

                <div className="space-y-4">
                    {messages.map((m, i) => (
                        <MessageBubble key={i} message={m} />
                    ))}
                    {sending && <ThinkingBubble />}
                </div>
            </div>

            {error && (
                <div className="mb-3 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                    {error}
                </div>
            )}

            {/* Input form */}
            <form onSubmit={sendMessage} className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={MODE_CONFIG[mode].placeholder}
                    disabled={sending}
                    className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-slate-50"
                />
                <button
                    type="submit"
                    disabled={sending || !input.trim()}
                    className="inline-flex items-center rounded-md bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                >
                    {sending ? "Sending..." : "Send"}
                </button>
            </form>
        </section>
    );
}

function MessageBubble({ message }: { message: Message }) {
    const isUser = message.role === "user";
    return (
        <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
            <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    isUser
                        ? "bg-blue-700 text-white rounded-br-md"
                        : "bg-slate-100 text-slate-900 rounded-bl-md"
                }`}
            >
                <div className="whitespace-pre-wrap">{message.content}</div>
            </div>
        </div>
    );
}

function ThinkingBubble() {
    return (
        <div className="flex justify-start">
            <div className="bg-slate-100 text-slate-600 rounded-2xl rounded-bl-md px-4 py-2.5 text-sm">
                <span className="inline-flex items-center gap-1">
                    Thinking
                    <span className="inline-flex gap-0.5">
                        <span className="animate-bounce" style={{ animationDelay: "0ms" }}>
                            .
                        </span>
                        <span className="animate-bounce" style={{ animationDelay: "150ms" }}>
                            .
                        </span>
                        <span className="animate-bounce" style={{ animationDelay: "300ms" }}>
                            .
                        </span>
                    </span>
                </span>
            </div>
        </div>
    );
}
