import { createFileRoute } from "@tanstack/react-router";
import { FeaturePage } from "@/components/site/FeaturePage";
import { brand } from "@/config/brand";
import { Bell, Camera, Play, ShieldCheck, Wifi, History } from "lucide-react";

export const Route = createFileRoute("/software/app")({
  head: () => ({
    meta: [
      { title: `Mobile App — ${brand.name}` },
      { name: "description", content: "Monitor prints, get notifications, and start jobs from anywhere. iOS and Android." },
      { property: "og:title", content: `Mobile App — ${brand.name}` },
      { property: "og:description", content: "Prints in your pocket." },
    ],
  }),
  component: () => (
    <FeaturePage
      eyebrow="Mobile app"
      title={<>Your prints, <span className="text-primary">in your pocket.</span></>}
      lede="Start a print from your phone. Get a push when it finishes. Watch the webcam feed at 3am from a hotel. All optional, all local-first."
      primaryCta={{ to: "/software/downloads", label: "Download for iOS" }}
      secondaryCta={{ to: "/software/downloads", label: "Download for Android" }}
      features={[
        { icon: Play, title: "Start & queue prints", body: "Slice on desktop, send to the app, print from anywhere on your network." },
        { icon: Camera, title: "Live webcam feed", body: "Optional camera add-on streams straight to the app. Timelapses included." },
        { icon: Bell, title: "Smart notifications", body: "Print done, failure detected, filament out. Configurable per event." },
        { icon: History, title: "Full print history", body: "Every print logged with settings, duration, and material used. Export anytime." },
        { icon: Wifi, title: "Local-first", body: "Works on your LAN with no cloud account. Remote access is opt-in and end-to-end." },
        { icon: ShieldCheck, title: "Zero telemetry", body: "We don't phone home. Ever. Your prints are yours." },
      ]}
      finalCta={{
        title: "Grab the app.",
        body: "iOS 16+ and Android 12+. Free forever.",
        to: "/software/downloads",
        label: "Go to downloads",
      }}
    />
  ),
});
