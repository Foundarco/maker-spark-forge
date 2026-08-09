/**
 * Minimal TLS socket abstraction that works both on the Cloudflare Worker
 * runtime (via `cloudflare:sockets`) and on Node during local dev.
 */

export type MailSocket = {
  write: (data: string) => Promise<void>;
  /** Read more bytes; resolves to null when the peer closed the connection. */
  read: () => Promise<string | null>;
  close: () => Promise<void>;
};

async function cloudflareSocket(host: string, port: number): Promise<MailSocket | null> {
  try {
    // @ts-expect-error - only available on the Worker runtime
    const mod = await import(/* @vite-ignore */ "cloudflare:sockets");
    const socket = mod.connect({ hostname: host, port }, { secureTransport: "on", allowHalfOpen: false });
    const reader = socket.readable.getReader();
    const writer = socket.writable.getWriter();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    return {
      write: async (data) => { await writer.write(encoder.encode(data)); },
      read: async () => {
        const { value, done } = await reader.read();
        if (done) return null;
        return decoder.decode(value);
      },
      close: async () => {
        try { reader.releaseLock(); } catch { /* ignore */ }
        try { await writer.close(); } catch { /* ignore */ }
        try { await socket.close(); } catch { /* ignore */ }
      },
    };
  } catch {
    return null;
  }
}

async function nodeSocket(host: string, port: number): Promise<MailSocket> {
  const tls = await import("node:tls");
  const socket = tls.connect({ host, port, servername: host, rejectUnauthorized: false });
  const chunks: string[] = [];
  let waiter: ((v: string | null) => void) | null = null;
  let closed = false;

  socket.setEncoding("utf8");
  socket.on("data", (d: string) => {
    if (waiter) { const w = waiter; waiter = null; w(d); }
    else chunks.push(d);
  });
  const finish = () => {
    closed = true;
    if (waiter) { const w = waiter; waiter = null; w(null); }
  };
  socket.on("end", finish);
  socket.on("close", finish);
  socket.on("error", finish);

  await new Promise<void>((resolve, reject) => {
    socket.once("secureConnect", () => resolve());
    socket.once("error", (e: Error) => reject(e));
  });

  return {
    write: async (data) => { socket.write(data); },
    read: () =>
      new Promise<string | null>((resolve) => {
        if (chunks.length) return resolve(chunks.shift()!);
        if (closed) return resolve(null);
        waiter = resolve;
      }),
    close: async () => { try { socket.end(); socket.destroy(); } catch { /* ignore */ } },
  };
}

export async function connectTLS(host: string, port: number): Promise<MailSocket> {
  const cf = await cloudflareSocket(host, port);
  if (cf) return cf;
  return nodeSocket(host, port);
}

/** Reads until `predicate(buffer)` is true, or the timeout elapses. */
export async function readUntil(
  socket: MailSocket,
  predicate: (buffer: string) => boolean,
  timeoutMs = 20000,
): Promise<string> {
  let buffer = "";
  const deadline = Date.now() + timeoutMs;
  while (!predicate(buffer)) {
    if (Date.now() > deadline) throw new Error(`Mail server timed out. Received: ${buffer.slice(-300)}`);
    const chunk = await socket.read();
    if (chunk === null) break;
    buffer += chunk;
  }
  return buffer;
}
