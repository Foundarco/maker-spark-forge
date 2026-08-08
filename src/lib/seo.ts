export const SITE_URL = "https://clovrlab.com";

/** Turn a relative asset path into an absolute URL crawlers can resolve. */
export function absoluteUrl(path: string): string {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}
