import { createFileRoute } from "@tanstack/react-router";
import { Section, PageHeader } from "@/components/site/Section";
import { Card } from "@/components/site/Card";
import { Placeholder } from "@/components/site/Placeholder";
import { brand } from "@/config/brand";
import { Download, Cpu, Smartphone, Layers } from "lucide-react";

const downloads = [
  {
    icon: Layers,
    name: "LoomSlicer",
    version: "2.1.0",
    date: "July 2026",
    files: [
      { os: "macOS (Apple Silicon)", size: "142 MB" },
      { os: "macOS (Intel)", size: "148 MB" },
      { os: "Windows 10/11", size: "156 MB" },
      { os: "Linux (AppImage)", size: "138 MB" },
    ],
  },
  {
    icon: Cpu,
    name: "Core Printer Firmware",
    version: "3.4.2",
    date: "July 2026",
    files: [
      { os: "Stable channel", size: "12 MB" },
      { os: "Beta channel", size: "12 MB" },
      { os: "Previous (3.3.8)", size: "12 MB" },
    ],
  },
  {
    icon: Smartphone,
    name: "Loom Mobile App",
    version: "1.8.0",
    date: "June 2026",
    files: [
      { os: "iOS — App Store", size: "—" },
      { os: "Android — Play Store", size: "—" },
      { os: "Android — APK", size: "42 MB" },
    ],
  },
];

export const Route = createFileRoute("/software/downloads")({
  head: () => ({
    meta: [
      { title: `Downloads — ${brand.name}` },
      { name: "description", content: "Slicer, firmware, and mobile app downloads." },
      { property: "og:title", content: `Downloads — ${brand.name}` },
      { property: "og:description", content: "All software in one place." },
    ],
  }),
  component: () => (
    <>
      <Section wide>
        <PageHeader eyebrow="Downloads" title="Everything, in one place." lede="Latest builds of the slicer, firmware, and mobile app. Older versions kept indefinitely." />
      </Section>
      <Section wide className="pt-0">
        <div className="grid gap-5 lg:grid-cols-3">
          {downloads.map((d) => (
            <Card key={d.name}>
              <div className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <d.icon className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold">{d.name}</h2>
              <p className="text-sm text-muted-foreground">v{d.version} · <Placeholder>{d.date}</Placeholder></p>
              <ul className="mt-5 space-y-1">
                {d.files.map((f) => (
                  <li key={f.os}>
                    <a
                      href="#"
                      className="flex items-center justify-between rounded-lg px-3 py-2 -mx-3 text-sm transition hover:bg-muted"
                    >
                      <span className="flex items-center gap-2 font-medium text-foreground">
                        <Download className="h-3.5 w-3.5 text-primary" /> {f.os}
                      </span>
                      <span className="text-xs text-muted-foreground"><Placeholder>{f.size}</Placeholder></span>
                    </a>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </Section>
      <Section wide>
        <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
          Older releases and release notes live in our <Placeholder>[PLACEHOLDER: GitHub releases]</Placeholder>. Signed checksums published with every build.
        </div>
      </Section>
    </>
  ),
});
