import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { divisions } from "@/config/divisions";

const BASE_URL = "https://clovrlab.com";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/divisions", changefreq: "weekly", priority: "0.9" },
          ...divisions.map((d) => ({
            path: `/divisions/${d.slug}`,
            changefreq: "monthly" as const,
            priority: "0.8",
          })),
          { path: "/projects", changefreq: "monthly", priority: "0.8" },
          { path: "/services", changefreq: "monthly", priority: "0.7" },
          { path: "/process", changefreq: "yearly", priority: "0.5" },
          { path: "/about", changefreq: "monthly", priority: "0.8" },
          { path: "/careers", changefreq: "weekly", priority: "0.7" },
          { path: "/contact", changefreq: "yearly", priority: "0.9" },
          { path: "/faq", changefreq: "monthly", priority: "0.6" },
          { path: "/blog", changefreq: "weekly", priority: "0.6" },
          { path: "/help", changefreq: "monthly", priority: "0.5" },
          { path: "/legal/privacy", changefreq: "yearly", priority: "0.2" },
          { path: "/legal/terms", changefreq: "yearly", priority: "0.2" },
          { path: "/legal/cookies", changefreq: "yearly", priority: "0.2" },
        ];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
