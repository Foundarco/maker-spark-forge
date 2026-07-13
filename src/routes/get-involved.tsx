import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Section, PageHeader, Eyebrow } from "@/components/site/Section";
import { Card } from "@/components/site/Card";
import { CTAButtonBtn } from "@/components/site/CTAButton";
import { submitInterest } from "@/lib/content.functions";
import { brand } from "@/config/brand";
import { toast, Toaster } from "sonner";

const types = [
  { v: "ambassador", label: "Ambassador (teach classes)" },
  { v: "contributor", label: "Contributor (docs, code, design)" },
  { v: "volunteer", label: "Volunteer (events, community)" },
  { v: "other", label: "Something else" },
] as const;

export const Route = createFileRoute("/get-involved")({
  head: () => ({
    meta: [
      { title: `Get involved — ${brand.name}` },
      { name: "description", content: "Teach a class, contribute to the docs, or help run the community." },
      { property: "og:title", content: `Get involved — ${brand.name}` },
      { property: "og:description", content: "Teach a class, contribute, or help run the community." },
    ],
  }),
  component: InvolvedPage,
});

function InvolvedPage() {
  const [interest_type, setType] = useState<(typeof types)[number]["v"]>("ambassador");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await submitInterest({ data: { interest_type, name, email, location: location || undefined, message: message || undefined } });
      setDone(true);
    } catch (err) {
      toast.error((err as Error).message || "Could not submit.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Toaster position="bottom-center" />
      <Section>
        <PageHeader
          eyebrow="Get involved"
          title="Teach a class. Improve the docs. Help this community grow."
          lede="Whether that's paid, volunteer, or somewhere in between depends on the final structure. Either way, we'd love to hear from you."
        />
      </Section>

      <Section className="py-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { h: "Ambassador", b: "Run in-person classes in your city. We support with curriculum and materials." },
            { h: "Contributor", b: "Improve docs, write repair guides, contribute upgrade designs." },
            { h: "Volunteer", b: "Help at events, moderate the forum, mentor new owners." },
          ].map((x) => (
            <Card key={x.h}>
              <Eyebrow>{x.h}</Eyebrow>
              <p className="mt-2 text-sm text-muted-foreground">{x.b}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <Card>
          {done ? (
            <>
              <h2 className="text-xl font-semibold">Thanks — we'll be in touch.</h2>
              <p className="mt-2 text-muted-foreground">Expect a reply from a real person, not an autoresponder.</p>
            </>
          ) : (
            <form onSubmit={submit} className="grid gap-4">
              <h2 className="text-xl font-semibold">Interest form</h2>
              <label className="grid gap-1 text-sm">
                <span>How do you want to get involved?</span>
                <select value={interest_type} onChange={(e) => setType(e.target.value as typeof interest_type)} className="h-11 rounded-lg border border-border bg-card px-3">
                  {types.map((t) => <option key={t.v} value={t.v}>{t.label}</option>)}
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
                <span>City / region (optional)</span>
                <input value={location} onChange={(e) => setLocation(e.target.value)} className="h-11 rounded-lg border border-border bg-card px-3" />
              </label>
              <label className="grid gap-1 text-sm">
                <span>Tell us more</span>
                <textarea rows={5} value={message} onChange={(e) => setMessage(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-2" placeholder="What you're excited about, what you'd want to do, anything relevant." />
              </label>
              <CTAButtonBtn type="submit" disabled={busy}>{busy ? "Submitting…" : "Submit"}</CTAButtonBtn>
            </form>
          )}
        </Card>
        <p className="mt-6 text-xs text-muted-foreground">Prefer email? {brand.contact.general}.</p>
      </Section>
    </>
  );
}
