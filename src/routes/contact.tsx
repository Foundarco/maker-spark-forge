import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Section, PageHeader } from "@/components/site/Section";
import { CTAButtonBtn } from "@/components/site/CTAButton";
import { submitProjectRequest } from "@/lib/project-request.functions";
import { supabase } from "@/integrations/supabase/client";
import { brand } from "@/config/brand";
import { Check, Loader2, Phone, Mail, Clock, MapPin, Upload, X } from "lucide-react";

const desc =
  "Request a free estimate from McGuire Construction. Tell us about your project, share photos, and we'll respond within two business days.";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: `Request an Estimate — ${brand.name}` },
      { name: "description", content: desc },
      { property: "og:title", content: `Request an Estimate — ${brand.name}` },
      { property: "og:description", content: desc },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://clovrlab.com/contact" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://clovrlab.com/contact" }],
  }),
  component: ContactPage,
});

const fieldCls =
  "w-full border border-border bg-card px-4 py-3 text-sm text-ink placeholder:text-muted-foreground focus:border-ink focus:outline-none";
const labelCls = "rule-label mb-2 block text-muted-foreground";

const projectTypes = [
  { value: "new-construction", label: "New home construction" },
  { value: "addition", label: "Addition / structural" },
  { value: "renovation", label: "Whole-home renovation" },
  { value: "kitchen-bath", label: "Kitchen or bathroom" },
  { value: "carpentry", label: "Custom carpentry / millwork" },
  { value: "exterior", label: "Deck, siding, or exterior" },
  { value: "not-sure", label: "Not sure yet" },
];

function ContactPage() {
  const submit = useServerFn(submitProjectRequest);
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  function addFiles(list: FileList | null) {
    if (!list) return;
    const picked = Array.from(list).filter((f) => f.type.startsWith("image/") && f.size < 10 * 1024 * 1024);
    setFiles((prev) => [...prev, ...picked].slice(0, 6));
  }

  async function uploadPhotos(): Promise<string[]> {
    const paths: string[] = [];
    for (const file of files) {
      const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("project-request-photos").upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
      if (!error) paths.push(path);
    }
    return paths;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setStatus("submitting");
    setErrorMsg("");
    try {
      const photoUrls = files.length ? await uploadPhotos() : [];
      await submit({
        data: {
          name: String(fd.get("name") || ""),
          email: String(fd.get("email") || ""),
          phone: String(fd.get("phone") || ""),
          address: String(fd.get("address") || ""),
          projectType: fd.get("projectType") as never,
          budget: String(fd.get("budget") || ""),
          timeline: String(fd.get("timeline") || ""),
          description: String(fd.get("description") || ""),
          additionalInfo: String(fd.get("additionalInfo") || ""),
          photoUrls,
        },
      });
      setStatus("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please call us instead.");
      setStatus("error");
    }
  }

  return (
    <>
      <div className="border-b border-border">
        <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <PageHeader
            eyebrow="Request an estimate"
            title="Tell us what you want to build."
            lede="Fill this out with as much detail as you have — photos help a lot. We respond to every inquiry within two business days."
          />
        </div>
      </div>

      <Section wide>
        <div className="grid gap-14 lg:grid-cols-[1.5fr_1fr]">
          {/* FORM */}
          <div>
            {status === "done" ? (
              <div className="border border-border bg-card p-10">
                <div className="grid h-12 w-12 place-items-center bg-primary text-primary-foreground">
                  <Check className="h-6 w-6" />
                </div>
                <h2 className="mt-6 font-display text-2xl font-bold text-ink">Request received.</h2>
                <p className="mt-3 text-muted-foreground">
                  Thanks — we've logged your project and will be in touch within two business days to schedule a
                  site visit. If it's urgent, call {brand.phone}.
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className={labelCls} htmlFor="name">Full name *</label>
                    <input id="name" name="name" required maxLength={120} className={fieldCls} placeholder="Jane Doe" />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="email">Email *</label>
                    <input id="email" name="email" type="email" required maxLength={255} className={fieldCls} placeholder="jane@example.com" />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="phone">Phone</label>
                    <input id="phone" name="phone" maxLength={60} className={fieldCls} placeholder="(555) 555-0100" />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="address">Project address</label>
                    <input id="address" name="address" maxLength={300} className={fieldCls} placeholder="Street, city" />
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-3">
                  <div>
                    <label className={labelCls} htmlFor="projectType">Project type *</label>
                    <select id="projectType" name="projectType" required defaultValue="renovation" className={fieldCls}>
                      {projectTypes.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="budget">Budget range</label>
                    <select id="budget" name="budget" defaultValue="" className={fieldCls}>
                      <option value="">Not sure yet</option>
                      <option>Under $25k</option>
                      <option>$25k – $75k</option>
                      <option>$75k – $200k</option>
                      <option>$200k – $500k</option>
                      <option>$500k+</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="timeline">Ideal start</label>
                    <select id="timeline" name="timeline" defaultValue="" className={fieldCls}>
                      <option value="">Flexible</option>
                      <option>As soon as possible</option>
                      <option>1–3 months</option>
                      <option>3–6 months</option>
                      <option>6+ months</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelCls} htmlFor="description">Describe the project *</label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    minLength={10}
                    maxLength={4000}
                    rows={6}
                    className={fieldCls}
                    placeholder="What you'd like built or changed, the rooms involved, any known constraints, and anything a contractor should know about the house."
                  />
                </div>

                <div>
                  <label className={labelCls} htmlFor="additionalInfo">Anything else</label>
                  <textarea
                    id="additionalInfo"
                    name="additionalInfo"
                    maxLength={2000}
                    rows={3}
                    className={fieldCls}
                    placeholder="Architect or drawings already in hand, HOA requirements, access notes, preferred contact times."
                  />
                </div>

                {/* PHOTOS */}
                <div>
                  <span className={labelCls}>Photos (optional, up to 6)</span>
                  <label className="flex cursor-pointer items-center justify-center gap-3 border border-dashed border-border bg-card px-4 py-8 text-sm text-muted-foreground hover:border-ink">
                    <Upload className="h-4 w-4" aria-hidden />
                    Add photos of the space
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="sr-only"
                      onChange={(e) => addFiles(e.target.files)}
                    />
                  </label>
                  {files.length > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {files.map((f, i) => (
                        <li key={`${f.name}-${i}`} className="flex items-center gap-2 border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
                          <span className="max-w-[12rem] truncate">{f.name}</span>
                          <button
                            type="button"
                            aria-label={`Remove ${f.name}`}
                            onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {status === "error" && (
                  <p className="border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    {errorMsg}
                  </p>
                )}

                <CTAButtonBtn type="submit" variant="primary" disabled={status === "submitting"}>
                  {status === "submitting" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Sending
                    </>
                  ) : (
                    "Send request"
                  )}
                </CTAButtonBtn>
              </form>
            )}
          </div>

          {/* SIDEBAR */}
          <aside className="space-y-px self-start border border-border bg-border">
            <div className="bg-card p-7">
              <h2 className="rule-label text-muted-foreground">Reach us directly</h2>
              <ul className="mt-5 space-y-4 text-sm">
                <li className="flex gap-3">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-ink" aria-hidden />
                  <a href={`tel:${brand.phone.replace(/[^0-9+]/g, "")}`} className="text-ink hover:underline">
                    {brand.phone}
                  </a>
                </li>
                <li className="flex gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-ink" aria-hidden />
                  <a href={`mailto:${brand.contact.estimates}`} className="text-ink hover:underline">
                    {brand.contact.estimates}
                  </a>
                </li>
                <li className="flex gap-3">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-ink" aria-hidden />
                  <span className="text-muted-foreground">{brand.hours}</span>
                </li>
                <li className="flex gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink" aria-hidden />
                  <span className="text-muted-foreground">{brand.serviceArea}</span>
                </li>
              </ul>
            </div>
            <div className="bg-card p-7">
              <h2 className="rule-label text-muted-foreground">What happens next</h2>
              <ol className="mt-5 space-y-4 text-sm text-muted-foreground">
                <li><span className="font-semibold text-ink">1.</span> We review your details and photos.</li>
                <li><span className="font-semibold text-ink">2.</span> We call within two business days.</li>
                <li><span className="font-semibold text-ink">3.</span> We schedule a site visit and measure.</li>
                <li><span className="font-semibold text-ink">4.</span> You get a written line-item estimate.</li>
              </ol>
            </div>
            <div className="bg-card p-7">
              <h2 className="rule-label text-muted-foreground">Other inquiries</h2>
              <ul className="mt-5 space-y-2 text-sm">
                <li>
                  General: <a className="text-ink hover:underline" href={`mailto:${brand.contact.general}`}>{brand.contact.general}</a>
                </li>
                <li>
                  Careers: <a className="text-ink hover:underline" href={`mailto:${brand.contact.careers}`}>{brand.contact.careers}</a>
                </li>
                <li>
                  Current clients: <a className="text-ink hover:underline" href={`mailto:${brand.contact.support}`}>{brand.contact.support}</a>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
