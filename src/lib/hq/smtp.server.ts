import { connectTLS, readUntil, type MailSocket } from "./mail-socket.server";

export type SmtpConfig = {
  host: string;
  port: number;
  username: string;
  password: string;
};

export type OutgoingMail = {
  from: string;
  fromName?: string | null;
  to: string[];
  cc?: string[];
  subject: string;
  text?: string;
  html?: string;
  inReplyTo?: string | null;
};

const CRLF = "\r\n";

function isComplete(buffer: string) {
  if (!/\r?\n$/.test(buffer)) return false;
  const lines = buffer.replace(/\r?\n$/, "").split(/\r?\n/);
  return /^\d{3} /.test(lines[lines.length - 1] ?? "");
}

async function command(socket: MailSocket, line: string | null, expect: number[]) {
  if (line !== null) await socket.write(line + CRLF);
  const response = await readUntil(socket, isComplete);
  const lastLine = response.trim().split(/\r?\n/).pop() ?? "";
  const code = Number(lastLine.slice(0, 3));
  if (!expect.includes(code)) {
    throw new Error(`SMTP error (expected ${expect.join("/")}, got ${code}): ${response.trim().slice(-300)}`);
  }
  return response;
}


function b64(value: string) {
  return Buffer.from(value, "utf8").toString("base64");
}

function encodeHeader(value: string) {
  // eslint-disable-next-line no-control-regex
  return /^[\x00-\x7F]*$/.test(value) ? value : `=?UTF-8?B?${b64(value)}?=`;
}

export function buildMessageId(domain: string) {
  return `<${crypto.randomUUID()}@${domain}>`;
}

export function buildMimeMessage(mail: OutgoingMail, messageId: string): string {
  const boundary = `bnd_${crypto.randomUUID().replace(/-/g, "")}`;
  const headers = [
    `From: ${mail.fromName ? `${encodeHeader(mail.fromName)} <${mail.from}>` : mail.from}`,
    `To: ${mail.to.join(", ")}`,
    ...(mail.cc?.length ? [`Cc: ${mail.cc.join(", ")}`] : []),
    `Subject: ${encodeHeader(mail.subject)}`,
    `Message-ID: ${messageId}`,
    ...(mail.inReplyTo ? [`In-Reply-To: ${mail.inReplyTo}`, `References: ${mail.inReplyTo}`] : []),
    `Date: ${new Date().toUTCString()}`,
    "MIME-Version: 1.0",
  ];

  if (mail.html) {
    headers.push(`Content-Type: multipart/alternative; boundary="${boundary}"`);
    const body = [
      "",
      `--${boundary}`,
      'Content-Type: text/plain; charset="UTF-8"',
      "",
      mail.text || mail.html.replace(/<[^>]+>/g, " "),
      `--${boundary}`,
      'Content-Type: text/html; charset="UTF-8"',
      "",
      mail.html,
      `--${boundary}--`,
      "",
    ];
    return headers.join(CRLF) + CRLF + body.join(CRLF);
  }

  headers.push('Content-Type: text/plain; charset="UTF-8"');
  return headers.join(CRLF) + CRLF + CRLF + (mail.text ?? "") + CRLF;
}

export async function sendSmtpMail(config: SmtpConfig, mail: OutgoingMail): Promise<{ messageId: string }> {
  const socket = await connectTLS(config.host, config.port);
  try {
    await command(socket, null, [220]);
    await command(socket, `EHLO ${config.host}`, [250]);
    await command(socket, "AUTH LOGIN", [334]);
    await command(socket, b64(config.username), [334]);
    await command(socket, b64(config.password), [235]);
    await command(socket, `MAIL FROM:<${config.username}>`, [250]);
    for (const rcpt of [...mail.to, ...(mail.cc ?? [])]) {
      await command(socket, `RCPT TO:<${rcpt}>`, [250, 251]);
    }
    await command(socket, "DATA", [354]);
    const messageId = buildMessageId(mail.from.split("@")[1] || "localhost");
    const raw = buildMimeMessage(mail, messageId)
      .split(/\r?\n/)
      .map((line) => (line.startsWith(".") ? "." + line : line))
      .join(CRLF);
    await command(socket, raw + CRLF + ".", [250]);
    try { await command(socket, "QUIT", [221]); } catch { /* ignore */ }
    return { messageId };
  } finally {
    await socket.close();
  }
}
