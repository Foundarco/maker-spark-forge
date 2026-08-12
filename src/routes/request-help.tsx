import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Section, PageHeader } from "@/components/site/Section";
import { CTAButtonBtn } from "@/components/site/CTAButton";
import { submitProjectRequest } from "@/lib/project-request.functions";
import { supabase } from "@/integrations/supabase/client";
import { brand } from "@/config/brand";
import { SITE_URL } from "@/lib/seo";
import { Check, Loader2, Upload, X } from "lucide-react";

const desc =
  "Request emergency assistance from Clovr Relief. Tell us where you are, what you need, and how urgent it is — our operations center reviews every request.";
const title = `Request Help — ${brand.name}`;

export const Route = createFileRoute("/request-help")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: desc },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/request-help` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/request-help` }],
  }),
  component: RequestHelpPage,
});

const fieldCls =
  "w-full border border-border bg-card px-4 py-3 text-sm text-ink placeholder:text-muted-foreground focus:border-primary focus:outline-none";
const labelCls = "rule-label mb-2 block text-muted-foreground";

const needTypes = [
  { value: "water", label: "Clean water" },
  { value: "medical", label: "Medical care or supplies" },
  { value: "shelter", label: "Shelter or housing" },
  { value: "power-comms", label: "Power or communications" },
  { value: "evacuation", label: "Evacuation support" },
  { value: "recovery-repair", label: "Recovery / repair" },
  { value: "other", label: "Something else" },
];

const urgencies = ["Life-threatening now", "Within 24 hours", "Within a week", "Recovery phase"];

function RequestHelpPage() {
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
          budget: String(fd.get("household") || ""),
          timeline: String(fd.get("urgency") || ""),
          description: String(fd.get("description") || ""),
          additionalInfo: String(fd.get("additionalInfo") || ""),
          photoUrls,
        },
      });
      setStatus("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please call the emergency line instead.");
      setStatus("error");
    }
  }

  return (
    <>
      <div className="border-b border-border">
        <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <PageHeader
            eyebrow="Request help"
            title="Tell us where you are and what you need."
            lede="This form reaches our operations center directly. If life is in immediate danger, contact your local emergency services first."
          />
        </div>
      </div>

      <Section wide>
        <div className="grid gap-14 lg:grid-cols-[1.5fr_1fr]">
          <div>
            {status === "done" ? (
              <div className="border border-border bg-surface p-10">
                <div className="grid h-12 w-12 place-items-center bg-primary text-primary-foreground">
                  <Check className="h-6 w-6" />
                </div>
                <h2 className="mt-6 font-display text-2xl font-bold text-ink">Request received.</h2>
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  Our operations center reviews every request against active deployments and nearby
                  partners. We will follow up with next steps at the contact details you provided.
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className={labelCls} htmlFor="name">Your name</label>
                    <input id="name" name="name" required className={fieldCls} placeholder="Full name" />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="email">Email</label>
                    <input id="email" name="email" type="email" required className={fieldCls} placeholder="you@example.com" />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="phone">Phone</label>
                    <input id="phone" name="phone" className={fieldCls} placeholder="Best number to reach you" />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="household">People affected</label>
                    <input id="household" name="household" className={fieldCls} placeholder="e.g. 4 adults, 2 children" />
                  </div>
                </div>

                <div>
                  <label className={labelCls} htmlFor="address">Location</label>
                  <input
                    id="address"
                    name="address"
                    className={fieldCls}
                    placeholder="Address, landmark, or coordinates"
                  />
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className={labelCls} htmlFor="projectType">Primary need</label>
                    <select id="projectType" name="projectType" required defaultValue="" className={fieldCls}>
                      <option value="" disabled>Select a need</option>
                      {needTypes.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="urgency">Urgency</label>
                    <select id="urgency" name="urgency" defaultValue="" className={fieldCls}>
                      <option value="" disabled>Select urgency</option>
                      {urgencies.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelCls} htmlFor="description">What is happening?</label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    rows={6}
                    className={fieldCls}
                    placeholder="Conditions on the ground, access routes, injuries, utilities, anything that helps us plan."
                  />
                </div>

                <div>
                  <label className={labelCls} htmlFor="additionalInfo">Anything else</label>
                  <textarea
                    id="additionalInfo"
                    name="additionalInfo"
                    rows={3}
                    className={fieldCls}
                    placeholder="Other agencies already involved, accessibility needs, languages spoken."
                  />
                </div>

                <div>
                  <span className={labelCls}>Photos (optional)</span>
                  <label className="flex cursor-pointer items-center gap-3 border border-dashed border-border px-4 py-5 text-sm text-muted-foreground hover:border-primary">
                    <Upload className="h-4 w-4" aria-hidden />
                    Add photos of the site or damage
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="sr-only"
                      aria-label="Upload photos"
                      onChange={(e) => addFiles(e.target.files)}
                    />
                  </label>
                  {files.length ? (
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {files.map((f, i) => (
                        <li key={`${f.name}-${i}`} className="flex items-center gap-2 border border-border px-3 py-1.5 text-xs text-foreground/75">
                          {f.name}
                          <button
                            type="button"
                            aria-label={`Remove ${f.name}`}
                            onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                          >
                            <X className="h-3.5 w-3.5" aria-hidden />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                {status === "error" ? (
                  <p role="alert" className="border border-border bg-surface px-4 py-3 text-sm text-primary">
                    {errorMsg}
                  </p>
                ) : null}

                <CTAButtonBtn type="submit" variant="primary" disabled={status === "submitting"}>
                  {status === "submitting" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Sending
                    </>
                  ) : (
                    "Send request"
                  )}
                </CTAButtonBtn>
              </form>
            )}
          </div>

          <aside className="h-fit border border-border bg-surface p-8">
            <h2 className="font-display text-lg font-bold text-ink">Immediate danger</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              If someone's life is at risk right now, contact local emergency services first. This form
              is monitored continuously but is not a substitute for emergency dispatch.
            </p>
            <dl className="mt-7 space-y-5 text-sm">
              <div>
                <dt className="rule-label text-muted-foreground">Operations line</dt>
                <dd className="mt-1">
                  <a className="text-ink hover:text-primary" href={`tel:${brand.phone.replace(/[^0-9+]/g, "")}`}>
                    {brand.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="rule-label text-muted-foreground">Response email</dt>
                <dd className="mt-1">
                  <a className="text-ink hover:text-primary" href={`mailto:${brand.contact.emergency}`}>
                    {brand.contact.emergency}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="rule-label text-muted-foreground">Hours</dt>
                <dd className="mt-1 text-muted-foreground">{brand.hours}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </Section>
    </>
  );
}
