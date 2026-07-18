/**
 * Mention utilities for channel + DM messages.
 * Storage format: `@[Full Name](uuid)`
 * This is a Slack-style inline token that survives copy/paste and is
 * cheap to parse in the renderer.
 */

export type ParsedMentionPart =
  | { kind: "text"; text: string }
  | { kind: "mention"; userId: string; name: string };

const MENTION_RE = /@\[([^\]]+)\]\(([0-9a-fA-F-]{36})\)/g;

/** Extract distinct mentioned user IDs from a message body. */
export function extractMentionIds(body: string): string[] {
  const ids = new Set<string>();
  let m: RegExpExecArray | null;
  const re = new RegExp(MENTION_RE.source, "g");
  while ((m = re.exec(body)) !== null) ids.add(m[2]);
  return Array.from(ids);
}

/** Split a body into text + mention parts for rendering. */
export function parseMentionParts(body: string): ParsedMentionPart[] {
  const out: ParsedMentionPart[] = [];
  const re = new RegExp(MENTION_RE.source, "g");
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    if (m.index > last) out.push({ kind: "text", text: body.slice(last, m.index) });
    out.push({ kind: "mention", name: m[1], userId: m[2] });
    last = m.index + m[0].length;
  }
  if (last < body.length) out.push({ kind: "text", text: body.slice(last) });
  return out;
}

/** Does this body mention the given user? */
export function bodyMentions(body: string | null | undefined, userId: string): boolean {
  if (!body) return false;
  return extractMentionIds(body).includes(userId);
}
