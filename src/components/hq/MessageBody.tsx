import type { Attachment } from "./MessageComposer";

/** Render message text with clickable links + attachments (images/videos/files) inline. */
export function MessageBody({ body, attachments, deleted }: { body: string; attachments?: Attachment[]; deleted?: boolean }) {
  if (deleted) {
    return <p className="text-sm italic text-muted-foreground">Message deleted</p>;
  }
  const parts: React.ReactNode[] = [];
  const re = /(https?:\/\/[^\s]+)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    if (m.index > last) parts.push(body.slice(last, m.index));
    parts.push(
      <a key={m.index} href={m[0]} target="_blank" rel="noopener noreferrer" className="text-primary underline break-all hover:opacity-80">
        {m[0]}
      </a>,
    );
    last = m.index + m[0].length;
  }
  if (last < body.length) parts.push(body.slice(last));

  return (
    <div>
      {body && <p className="whitespace-pre-wrap break-words text-sm">{parts}</p>}
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
