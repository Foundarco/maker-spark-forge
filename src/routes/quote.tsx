import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Section, PageHeader } from "@/components/site/Section";
import { CloudBackdrop } from "@/components/site/CloudBackdrop";
import { submitQuote } from "@/lib/quote.functions";
import { brand } from "@/config/brand";
import { Check, Loader2 } from "lucide-react";

export const Route = createFileRoute("/quote")({
  head: () => ({
    meta: [
      { title: `Request a Quote — ${brand.name}` },
      { name: "description", content: "Tell us about your hardware project. We'll come back with scope, timeline, and a fixed-fee estimate." },
      { property: "og:title", content: `Request a Quote — ${brand.name}` },
      { property: "og:description", content: "Tell us about your hardware project. We'll come back with scope, timeline, and a fixed-fee estimate." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: QuotePage,
});

const inputCls =
  "w-full rounded-xl border border-sky-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

function QuotePage() {
  const submit = useServerFn(submitQuote);
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setStatus("submitting");
    try {
      await submit({
        data: {
          name: String(fd.get("name") || ""),
          email: String(fd.get("email") || ""),
          company: String(fd.get("company") || ""),
          phone: String(fd.get("phone") || ""),
          stage: fd.get("stage") as never,
          service: fd.get("service") as never,
          budget: String(fd.get("budget") || ""),
          timeline: String(fd.get("timeline") || ""),
          description: String(fd.get("description") || ""),
        },
      });
      setStatus("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  return (
    <>
      <section className="relative overflow-hidden">
        <CloudBackdrop variant="dawn" />
        <div className="relative mx-auto w-full max-w-4xl px-5 pb-8 pt-20 sm:px-8 sm:pt-28">
          <PageHeader
            eyebrow="Request a quote"
            title={<>Tell us about <span className="text-primary">your project.</span></>}
            lede="Whether you're on a napkin or on your third prototype, we can help. Answer a few questions and we'll come back within 2 business days."
          />
        </div>
      </section>

      <Section>
        {status === "done" ? (
          <div className="rounded-3xl border border-sky-200/60 bg-white p-10 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success text-success-foreground">
              <Check className="h-6 w-6" />
            </div>
            <h2 className="mt-6 font-display text-3xl font-semibold text-ink">We've got it.</h2>
            <p className="mt-3 text-muted-foreground">
              Thanks — we'll review your project and reach out within 2 business days.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="grid gap-5 rounded-3xl border border-sky-200/60 bg-white p-8 sm:p-10">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-ink">Your name</span>
                <input name="name" required maxLength={120} className={inputCls} placeholder="Jane Doe" />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-ink">Email</span>
                <input name="email" type="email" required maxLength={255} className={inputCls} placeholder="you@company.com" />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-ink">Company</span>
                <input name="company" maxLength={200} className={inputCls} placeholder="Optional" />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-ink">Phone</span>
                <input name="phone" maxLength={60} className={inputCls} placeholder="Optional" />
              </label>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-ink">Where are you today?</span>
                <select name="stage" required defaultValue="idea" className={inputCls}>
                  <option value="idea">Just an idea</option>
                  <option value="sketch">Sketch or spec</option>
                  <option value="prototype">Working prototype</option>
                  <option value="ready-to-manufacture">Ready to manufacture</option>
                  <option value="in-production">Already in production</option>
                </select>
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-ink">What do you need?</span>
                <select name="service" required defaultValue="not-sure" className={inputCls}>
                  <option value="product-development">Product development</option>
                  <option value="prototyping">Prototyping</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="not-sure">Not sure yet</option>
                </select>
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-ink">Budget range</span>
                <input name="budget" maxLength={60} className={inputCls} placeholder="e.g. $50k–$150k (optional)" />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-ink">Ideal timeline</span>
                <input name="timeline" maxLength={60} className={inputCls} placeholder="e.g. 6 months (optional)" />
              </label>
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-ink">Tell us about the project</span>
              <textarea
                name="description"
                required
                minLength={10}
                maxLength={4000}
                rows={6}
                className={inputCls}
                placeholder="What is it? Who is it for? What have you tried? Attach links if helpful."
              />
            </label>

            {status === "error" && (
              <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {errorMsg || "Something went wrong. Please try again or email us directly."}
              </p>
            )}

            <div className="flex items-center justify-between gap-4 pt-2">
              <p className="text-xs text-muted-foreground">
                We reply within 2 business days. No spam, ever.
              </p>
              <button
                type="submit"
                disabled={status === "submitting"}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:brightness-110 disabled:opacity-60"
              >
                {status === "submitting" ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : "Send request"}
              </button>
            </div>
          </form>
        )}
      </Section>
    </>
  );
}
