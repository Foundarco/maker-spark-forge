import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useMatches,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { MotionConfig } from "framer-motion";


import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Header } from "../components/site/Header";
import { Footer } from "../components/site/Footer";
import { brand } from "../config/brand";
import { SITE_URL } from "../lib/seo";

function NotFoundComponent() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center px-5 py-20">
        <div className="max-w-md text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-primary">404</p>
          <h1 className="text-4xl font-semibold">This page doesn't exist</h1>
          <p className="mt-3 text-muted-foreground">
            You may have followed an old link, or the page has moved.
          </p>
          <div className="mt-6">
            <Link to="/" className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">
              Go home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center px-5 py-20">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-semibold">This page didn't load</h1>
          <p className="mt-3 text-muted-foreground">Something went wrong. Try again or head home.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => { router.invalidate(); reset(); }}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
            >
              Try again
            </button>
            <a href="/" className="rounded-full border border-border px-5 py-2.5 text-sm">Go home</a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

const siteDescription =
  "Clovr Relief is a disaster-response nonprofit that reaches cut-off communities within hours — water, medical capacity, shelter and power — and stays through recovery.";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: `${brand.name} — ${brand.tagline}` },
      { name: "description", content: siteDescription },
      { property: "og:site_name", content: brand.name },
      { property: "og:title", content: `${brand.name} — ${brand.tagline}` },
      { property: "og:description", content: siteDescription },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Archivo:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&family=Inter+Tight:wght@400;500;600;700&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebSite",
              "@id": `${SITE_URL}/#website`,
              url: `${SITE_URL}/`,
              name: brand.name,
              description: siteDescription,
              publisher: { "@id": `${SITE_URL}/#organization` },
            },
            {
              "@type": "Organization",
              "@id": `${SITE_URL}/#organization`,
              name: brand.name,
              url: `${SITE_URL}/`,
              slogan: brand.tagline,
              description: siteDescription,
              email: brand.contact.general,
              knowsAbout: [
                "Wildfire detection",
                "Environmental sensor networks",
                "Autonomous UAV systems",
                "Thermal imaging",
                "Emergency response technology",
              ],

            },
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  const hqRedirectScript = `
    (function () {
      try {
        var host = window.location.hostname.toLowerCase();
        var path = window.location.pathname;
        var referrer = document.referrer || "";
        var isHqHost = host === "hq.clovrlab.com" || host.indexOf("hq.") === 0 || host.indexOf("hq--") === 0;
        var cameFromHq = /^https:\/\/hq\.clovrlab\.com(?:\/|$)/i.test(referrer);
        var isRootPath = path === "/" || path === "" || path === "/index.html";
        if ((isHqHost || cameFromHq) && isRootPath) {
          window.location.replace("/hq-login");
        }
      } catch (error) {}
    })();
  `;

  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: hqRedirectScript }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}




function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const matches = useMatches();
  const isHQ = matches.some((m) => m.routeId?.startsWith("/_hq") || m.routeId === "/hq-login");
  const isChromeless = matches.some((m) => m.routeId?.startsWith("/meeting"));

  useEffect(() => {
    if (typeof window === "undefined") return;
    const h = window.location.hostname;
    const hqHost = h === "hq.clovrlab.com" || h.startsWith("hq--") || h.startsWith("hq.");
    if (hqHost && window.location.pathname === "/") {
      window.location.replace("/hq-login");
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {isHQ || isChromeless ? (
        <Outlet />
      ) : (
        <MotionConfig reducedMotion="user">
          <div className="site-theme flex min-h-dvh flex-col bg-background text-foreground">
            <Header />
            <main className="flex-1">
              <Outlet />
            </main>
            <Footer />
          </div>
        </MotionConfig>
      )}
    </QueryClientProvider>
  );
}

