import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Section, PageHeader } from "@/components/site/Section";
import { Card } from "@/components/site/Card";
import { CTAButtonBtn } from "@/components/site/CTAButton";
import { submitContact } from "@/lib/content.functions";
import { brand } from "@/config/brand";
import { toast, Toaster } from "sonner";

const paths = [
  { value: "general", label: "General question" },
  { value: "support", label: "Product support" },
  { value: "press", label: "Press / media" },
  { value: "community", label: "Community involvement" },
  { value: "partnership", label: "Partnership inquiry" },
] as const;

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: `Contact — ${brand.name}` },
      { name: "description", content: "Reach us for support, press, community, or partnership questions." },
      { property: "og:title", content: `Contact — ${brand.name}` },
      { property: "og:description", content: "Reach us for support, press, community, or partnership questions." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [path, setPath] = useState<(typeof paths)[number]["value"]>("general");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await submitContact({ data: { path, name, email, subject: subject || undefined, message } });
      setDone(true);
    } catch (err) {
      toast.error((err as Error).message || "Could not send.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Toaster position="bottom-center" />
      <Section>
        <PageHeader
          eyebrow="Contact"
          title="Get in touch."
          lede="Pick the path that fits and we'll route it to the right person."
        />
      </Section>
      <Section className="py-6">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr]">
          <Card>
            {done ? (
              <>
                <h2 className="text-xl font-semibold">Thanks — message received.</h2>
                <p className="mt-2 text-muted-foreground">We'll respond as soon as we can.</p>
              </>
            ) : (
              <form onSubmit={submit} className="grid gap-4">
                <label className="grid gap-1 text-sm">
                  <span>What can we help with?</span>
                  <select value={path} onChange={(e) => setPath(e.target.value as typeof path)} className="h-11 rounded-lg border border-border bg-card px-3">
                    {paths.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-1 text-sm">
                    <span>Name</span>
                    <input required value={name} onChange={(e) => setName(e.target.value)} className="h-11 rounded-lg border border-border bg-card px-3" />
                  </label>
                  <label className="grid gap-1 text-sm">
                    <span>Email</span>
                    <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 rounded-lg border border-border bg-card px-3" />
                  </label>
                </div>
                <label className="grid gap-1 text-sm">
                  <span>Subject (optional)</span>
                  <input value={subject} onChange={(e) => setSubject(e.target.value)} className="h-11 rounded-lg border border-border bg-card px-3" />
                </label>
                <label className="grid gap-1 text-sm">
                  <span>Message</span>
                  <textarea required rows={6} value={message} onChange={(e) => setMessage(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-2" />
                </label>
                <CTAButtonBtn type="submit" disabled={busy}>{busy ? "Sending…" : "Send message"}</CTAButtonBtn>
              </form>
            )}
          </Card>
          <div className="space-y-3">
            <Card>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Direct email</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li>General: <a className="text-primary hover:underline" href={`mailto:${brand.contact.general}`}>{brand.contact.general}</a></li>
                <li>Support: <a className="text-primary hover:underline" href={`mailto:${brand.contact.support}`}>{brand.contact.support}</a></li>
                <li>Press: <a className="text-primary hover:underline" href={`mailto:${brand.contact.press}`}>{brand.contact.press}</a></li>
                <li>Partnerships: <a className="text-primary hover:underline" href={`mailto:${brand.contact.partnerships}`}>{brand.contact.partnerships}</a></li>
              </ul>
            </Card>
            <Card>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Community</h3>
              <p className="mt-3 text-sm text-muted-foreground">The fastest place to get an answer is often other owners.</p>
              <a href={brand.socials.discord} className="mt-3 inline-flex text-sm text-primary hover:underline">Join the community →</a>
            </Card>
          </div>
        </div>
      </Section>
    </>
  );
}
