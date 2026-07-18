import type { Attachment } from "./MessageComposer";
import { parseMentionParts } from "@/lib/hq/mentions";
import { UserMention } from "./UserMention";

/** Render message text with links, @mentions, and attachments. */
export function MessageBody({ body, attachments, deleted, currentUserId }: {
  body: string;
  attachments?: Attachment[];
  deleted?: boolean;
  currentUserId?: string;
}) {
  if (deleted) {
    return <p className="text-sm italic text-muted-foreground">Message deleted</p>;
  }

  const renderTextChunk = (text: string, keyBase: string) => {
    const parts: React.ReactNode[] = [];
    const re = /(https?:\/\/[^\s]+)/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) parts.push(text.slice(last, m.index));
      parts.push(
        <a key={`${keyBase}-${m.index}`} href={m[0]} target="_blank" rel="noopener noreferrer" className="text-primary underline break-all hover:opacity-80">
          {m[0]}
        </a>,
      );
      last = m.index + m[0].length;
    }
    if (last < text.length) parts.push(text.slice(last));
    return parts;
  };

  const mentionParts = parseMentionParts(body);

  return (
    <div>
      {body && (
        <p className="whitespace-pre-wrap break-words text-sm">
          {mentionParts.map((p, i) => {
            if (p.kind === "text") return <span key={`t-${i}`}>{renderTextChunk(p.text, `t-${i}`)}</span>;
            const isMe = currentUserId === p.userId;
            return (
              <span key={`m-${i}`} className={isMe ? "rounded px-0.5 bg-primary/20" : ""}>
                <UserMention
                  userId={p.userId}
                  name={p.name}
                  showAt
                  size="xs"
                  tone={isMe ? "border-primary/40 bg-primary/15 text-primary font-semibold" : "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20"}
                />
              </span>
            );
          })}
        </p>
      )}
      {attachments && attachments.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-2">
          {attachments.map((a, i) => {
            if (a.type.startsWith("image/")) {
              return (
                <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" className="block max-w-xs">
                  <img src={a.url} alt={a.name} className="max-h-64 rounded-lg border border-border object-cover" />
                </a>
              );
            }
            if (a.type.startsWith("video/")) {
              return <video key={i} src={a.url} controls className="max-h-64 max-w-xs rounded-lg border border-border" />;
            }
            return (
              <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs hover:bg-muted">
                📎 <span className="max-w-[200px] truncate">{a.name}</span>
                <span className="text-muted-foreground">{Math.round(a.size / 1024)}KB</span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
