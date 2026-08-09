import { connectTLS, readUntil, type MailSocket } from "./mail-socket.server";

export type ImapConfig = {
  host: string;
  port: number;
  username: string;
  password: string;
};

export type FetchedMessage = {
  uid: string;
  messageId: string | null;
  from: string | null;
  to: string | null;
  cc: string | null;
  subject: string;
  date: string | null;
  body: string;
};

const CRLF = "\r\n";

function decodeMimeWords(value: string) {
  return value.replace(/=\?([^?]+)\?([bBqQ])\?([^?]*)\?=/g, (_m, _cs, enc, text) => {
    try {
      if (enc.toLowerCase() === "b") return Buffer.from(text, "base64").toString("utf8");
      return text.replace(/_/g, " ").replace(/=([A-Fa-f0-9]{2})/g, (_x: string, h: string) =>
        String.fromCharCode(parseInt(h, 16)),
      );
    } catch {
      return text;
    }
  });
}

export class ImapClient {
  private socket: MailSocket | null = null;
  private counter = 0;

  async connect(config: ImapConfig) {
    this.socket = await connectTLS(config.host, config.port);
    await readUntil(this.socket, (b) => /\r?\n$/.test(b) && /^\* (OK|PREAUTH)/.test(b));
    await this.run(`LOGIN "${config.username}" "${config.password.replace(/(["\\])/g, "\\$1")}"`);
  }

  private async run(command: string): Promise<string> {
    if (!this.socket) throw new Error("IMAP socket is not connected");
    const tag = `a${++this.counter}`;
    await this.socket.write(`${tag} ${command}${CRLF}`);
    const response = await readUntil(this.socket, (b) =>
      new RegExp(`^${tag} (OK|NO|BAD)`, "m").test(b) && /\r?\n$/.test(b),
    );
    const status = response.match(new RegExp(`^${tag} (OK|NO|BAD)(.*)$`, "m"));
    if (status && status[1] !== "OK") {
      throw new Error(`IMAP ${status[1]}:${status[2]}`);
    }
    return response;
  }

  async selectMailbox(mailbox = "INBOX") {
    return this.run(`SELECT "${mailbox}"`);
  }

  async recentUids(limit: number): Promise<string[]> {
    const response = await this.run("UID SEARCH ALL");
    const line = response.split(/\r?\n/).find((l) => l.startsWith("* SEARCH")) ?? "";
    const uids = line.replace("* SEARCH", "").trim().split(/\s+/).filter(Boolean);
    return uids.slice(-limit);
  }

  async fetchMessage(uid: string): Promise<FetchedMessage | null> {
    const response = await this.run(
      `UID FETCH ${uid} (BODY.PEEK[HEADER.FIELDS (FROM TO CC SUBJECT DATE MESSAGE-ID)] BODY.PEEK[TEXT])`,
    );
    const headerBlock = extractLiteral(response, 0);
    const textBlock = extractLiteral(response, 1);
    if (headerBlock === null) return null;

    const header = (name: string) => {
      const match = headerBlock.match(new RegExp(`^${name}:\\s*([\\s\\S]*?)(?=\\r?\\n[A-Za-z-]+:|$)`, "im"));
      return match ? decodeMimeWords(match[1].replace(/\r?\n\s+/g, " ").trim()) : null;
    };

    return {
      uid,
      messageId: header("Message-ID"),
      from: header("From"),
      to: header("To"),
      cc: header("Cc"),
      subject: header("Subject") ?? "(no subject)",
      date: header("Date"),
      body: (textBlock ?? "").trim().slice(0, 20000),
    };
  }

  async close() {
    try { if (this.socket) await this.run("LOGOUT"); } catch { /* ignore */ }
    try { await this.socket?.close(); } catch { /* ignore */ }
    this.socket = null;
  }
}

/** Pulls the nth `{size}\r\n<payload>` literal out of an IMAP response. */
function extractLiteral(response: string, index: number): string | null {
  const regex = /\{(\d+)\}\r?\n/g;
  let match: RegExpExecArray | null;
  let seen = 0;
  while ((match = regex.exec(response))) {
    const size = Number(match[1]);
    const start = match.index + match[0].length;
    if (seen === index) return response.slice(start, start + size);
    seen += 1;
    regex.lastIndex = start + size;
  }
  return null;
}
