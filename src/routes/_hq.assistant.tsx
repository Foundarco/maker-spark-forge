import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Bot, Send, Sparkles, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_hq/assistant")({
  head: () => ({ meta: [{ title: "AI Assistant — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: AssistantPage,
});

const SUGGESTIONS = [
  "Give me a summary of what's happening across HQ today.",
  "Draft an announcement for a new product release.",
  "What KPIs should I be tracking in manufacturing?",
  "Write meeting notes template for a weekly ops sync.",
];

function AssistantPage() {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/hq/assistant",
      body: () => ({ module: "/assistant" }),
      fetch: (async (url, init) => {
        const { data } = await supabase.auth.getSession();
        const headers = new Headers(init?.headers);
        if (data.session) headers.set("Authorization", `Bearer ${data.session.access_token}`);
        return fetch(url, { ...init, headers });
      }) as typeof fetch,
    }),
  });

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, status]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const submit = (text: string) => {
    if (!text.trim() || busy) return;
    sendMessage({ text: text.trim() });
    setInput("");
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  return (
    <div className="mx-auto flex h-full w-full max-w-4xl flex-col px-6 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Bot className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Core · Assistant</p>
          <h1 className="text-3xl font-semibold tracking-tight">HQ Assistant</h1>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto rounded-xl border border-border bg-card p-6">
        {messages.length === 0 && (
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              How can I help?
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => submit(s)}
                  className="flex items-start gap-2 rounded-lg border border-border bg-background p-3 text-left text-sm transition hover:border-primary/50 hover:bg-primary/5"
                >
                  <Zap className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{s}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m: UIMessage) => {
          const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
          return (
            <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
              {m.role === "user" ? (
                <div className="max-w-[85%] rounded-2xl bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                  {text}
                </div>
              ) : (
                <div className="prose prose-sm max-w-[95%] text-sm leading-relaxed dark:prose-invert">
                  <ReactMarkdown>{text}</ReactMarkdown>
                </div>
              )}
            </div>
          );
        })}
        {status === "submitted" && <div className="text-sm text-muted-foreground">Thinking…</div>}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(input);
        }}
        className="mt-4"
      >
        <div className="flex items-end gap-2 rounded-xl border border-border bg-card px-3 py-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit(input);
              }
            }}
            placeholder="Ask anything about your business…"
            rows={2}
            className="max-h-40 flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="rounded-lg bg-primary p-2 text-primary-foreground disabled:opacity-40"
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Press Enter to send, Shift+Enter for a new line. The assistant sees the module you're on.
        </p>
      </form>
    </div>
  );
}
