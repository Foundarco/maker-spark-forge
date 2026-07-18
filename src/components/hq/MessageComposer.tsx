import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Send, Paperclip, X, Loader2, Reply } from "lucide-react";
import { EmojiPickerButton } from "./EmojiPickerButton";
import { MentionPicker, type MentionCandidate } from "./MentionPicker";
import { extractMentionIds } from "@/lib/hq/mentions";

export type Attachment = { path: string; url: string; name: string; type: string; size: number };

export function MessageComposer({
  onSend, placeholder, userId, replyTo, onCancelReply,
}: {
  onSend: (body: string, attachments: Attachment[], mentions: string[]) => Promise<void> | void;
  placeholder?: string;
  userId: string;
  replyTo?: { name: string; body: string; deleted?: boolean } | null;
  onCancelReply?: () => void;
}) {
  const [text, setText] = useState("");
  const [attaching, setAttaching] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Mention picker state
  const [mention, setMention] = useState<{ query: string; anchor: { x: number; y: number } | null; start: number } | null>(null);

  useEffect(() => { if (replyTo) taRef.current?.focus(); }, [replyTo]);

  const updateMentionFromCaret = () => {
    const ta = taRef.current;
    if (!ta) return;
    const val = ta.value;
    const caret = ta.selectionStart ?? 0;
    // find last '@' before caret with only word chars after it
    let i = caret - 1;
    while (i >= 0 && /[A-Za-z0-9 ._-]/.test(val[i])) i--;
    if (i < 0 || val[i] !== "@") { setMention(null); return; }
    // must be preceded by whitespace or line start
    if (i > 0 && !/\s/.test(val[i - 1])) { setMention(null); return; }
    const query = val.slice(i + 1, caret);
    if (query.length > 30) { setMention(null); return; }
    const rect = ta.getBoundingClientRect();
    setMention({ query, start: i, anchor: { x: rect.left + 8, y: rect.top - 8 - 6 * 32 } });
  };

  const pickMention = (u: MentionCandidate) => {
    if (!mention || !taRef.current) return;
    const ta = taRef.current;
    const before = text.slice(0, mention.start);
    const after = text.slice(ta.selectionStart ?? 0);
    const token = `@[${u.full_name || u.email || "User"}](${u.id})`;
    const next = `${before}${token} ${after}`;
    setText(next);
    setMention(null);
    setTimeout(() => {
      ta.focus();
      const pos = (before + token + " ").length;
      ta.selectionStart = ta.selectionEnd = pos;
    }, 0);
  };

  const insertEmoji = (e: string) => {
    const ta = taRef.current;
    if (!ta) { setText((t) => t + e); return; }
    const s = ta.selectionStart, en = ta.selectionEnd;
    const next = text.slice(0, s) + e + text.slice(en);
    setText(next);
    setTimeout(() => { ta.focus(); ta.selectionStart = ta.selectionEnd = s + e.length; }, 0);
  };

  const upload = async (files: FileList) => {
    if (!files.length) return;
    setUploading(true);
    const uploaded: Attachment[] = [];
    for (const file of Array.from(files)) {
      if (file.size > 25 * 1024 * 1024) { alert(`${file.name} exceeds 25MB`); continue; }
      const ext = file.name.split(".").pop() || "bin";
      const path = `${userId}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("message-attachments").upload(path, file, { contentType: file.type });
      if (error) { alert(error.message); continue; }
      const { data } = await supabase.storage.from("message-attachments").createSignedUrl(path, 60 * 60 * 24 * 365);
      if (data?.signedUrl) uploaded.push({ path, url: data.signedUrl, name: file.name, type: file.type, size: file.size });
    }
    setAttaching((prev) => [...prev, ...uploaded]);
    setUploading(false);
  };

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const body = text.trim();
    if (!body && attaching.length === 0) return;
    const mentions = extractMentionIds(body);
    await onSend(body, attaching, mentions);
    setText("");
    setAttaching([]);
    setMention(null);
    taRef.current?.focus();
  };

  return (
    <form onSubmit={submit} className="border-t border-border p-3">
      {replyTo && (
        <div className="mb-2 flex items-start gap-2 rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-xs">
          <Reply className="mt-0.5 h-3 w-3 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-primary">Replying to {replyTo.name}</p>
            <p className="truncate text-muted-foreground">{replyTo.deleted ? "Message deleted" : (replyTo.body || "attachment")}</p>
          </div>
          <button type="button" onClick={onCancelReply} className="rounded p-0.5 hover:bg-background" aria-label="Cancel reply"><X className="h-3 w-3" /></button>
        </div>
      )}
      {attaching.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {attaching.map((a, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-2 py-1 text-xs">
              {a.type.startsWith("image/") ? (
                <img src={a.url} alt="" className="h-8 w-8 rounded object-cover" />
              ) : (
                <Paperclip className="h-3 w-3" />
              )}
              <span className="max-w-[140px] truncate">{a.name}</span>
              <button type="button" onClick={() => setAttaching((prev) => prev.filter((_, idx) => idx !== i))} className="rounded p-0.5 hover:bg-background"><X className="h-3 w-3" /></button>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-end gap-1 rounded-xl border border-border bg-background px-2 py-2 focus-within:border-primary">
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Attach">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
        </button>
        <input ref={fileRef} type="file" multiple accept="image/*,video/*,.pdf,.doc,.docx,.txt,.zip" onChange={(e) => { if (e.target.files) void upload(e.target.files); e.target.value = ""; }} className="hidden" />
        <textarea
          ref={taRef}
          value={text}
          onChange={(e) => { setText(e.target.value); setTimeout(updateMentionFromCaret, 0); }}
          onKeyUp={updateMentionFromCaret}
          onClick={updateMentionFromCaret}
          onKeyDown={(e) => {
            if (mention && (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "Enter" || e.key === "Tab" || e.key === "Escape")) return;
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void submit(); }
            if (e.key === "Escape" && replyTo) onCancelReply?.();
          }}
          rows={1}
          placeholder={placeholder ?? "Type a message… @ to mention"}
          className="max-h-32 flex-1 resize-none bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground"
        />
        <EmojiPickerButton onPick={insertEmoji} />
        <button type="submit" disabled={!text.trim() && attaching.length === 0} className="rounded-lg bg-primary p-2 text-primary-foreground disabled:opacity-40" aria-label="Send">
          <Send className="h-4 w-4" />
        </button>
      </div>
      {mention && (
        <MentionPicker
          query={mention.query}
          anchor={mention.anchor}
          onPick={pickMention}
          onClose={() => setMention(null)}
        />
      )}
    </form>
  );
}
