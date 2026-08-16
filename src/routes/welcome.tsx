import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Mail, ShieldCheck, KeyRound, ImagePlus, ClipboardCheck, Compass,
  Check, ArrowLeft, ArrowRight, Loader2, Upload, LayoutDashboard,
  MessagesSquare, FolderOpen, Bell,
} from "lucide-react";

export const Route = createFileRoute("/welcome")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Welcome to Clovr Labs HQ — Set up your account" },
      { name: "description", content: "Verify your work email, set a password, add a photo and finish your onboarding checklist for Clovr Labs HQ." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Welcome,
});

type StepKey = "email" | "code" | "password" | "photo" | "tasks" | "tour";

const STEPS: { key: StepKey; title: string; blurb: string; icon: any }[] = [
  { key: "email", title: "Verify your email", blurb: "Enter the work email you were added with so we can confirm your invite.", icon: Mail },
  { key: "code", title: "Security code", blurb: "We email you a 6-digit code. Enter it to prove the inbox is yours.", icon: ShieldCheck },
  { key: "password", title: "Create a password", blurb: "Choose a strong password you'll use to sign in to HQ from now on.", icon: KeyRound },
  { key: "photo", title: "Profile photo", blurb: "Teammates see this on messages, meetings and records across HQ.", icon: ImagePlus },
  { key: "tasks", title: "Onboarding tasks", blurb: "Your first-week checklist, assigned automatically by department.", icon: ClipboardCheck },
  { key: "tour", title: "Tour the workspace", blurb: "A quick pass over the tools you'll use every day.", icon: Compass },
];

const input =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20";

function Welcome() {
  const navigate = useNavigate();
  const [step, setStep] = useState<StepKey>("email");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const idx = STEPS.findIndex((s) => s.key === step);

  // If already signed in and mid-onboarding, jump ahead.
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      setEmail(data.user.email ?? "");
      const { data: p } = await supabase.from("profiles").select("onboarding_completed_at").eq("id", data.user.id).maybeSingle();
      if (p?.onboarding_completed_at) navigate({ to: "/dashboard" });
      else setStep((s) => (s === "email" ? "password" : s));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const go = (k: StepKey) => { setError(null); setNotice(null); setStep(k); };

  return (
    <div className="min-h-dvh bg-surface px-4 py-6 text-foreground">
      <div className="mx-auto max-w-6xl">
        <header className="mb-4 flex items-center justify-between rounded-2xl border border-border bg-card px-5 py-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-[11px] font-black text-primary-foreground">CL</span>
            <span className="text-sm font-semibold">Clovr Labs HQ</span>
          </div>
          <p className="text-xs text-muted-foreground">New hire setup</p>
        </header>

        <div className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
          <StepRail idx={idx} />

          <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
              {idx === STEPS.length - 1 ? "Last step" : `Step ${idx + 1} of ${STEPS.length}`}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">{STEPS[idx].title}</h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">{STEPS[idx].blurb}</p>

            {error && <Banner tone="error">{error}</Banner>}
            {notice && <Banner tone="ok">{notice}</Banner>}

            <div className="mt-6">
              {step === "email" && (
                <EmailStep
                  email={email} setEmail={setEmail} busy={busy} setBusy={setBusy}
                  setError={setError} setNotice={setNotice} onSent={() => go("code")}
                />
              )}
              {step === "code" && (
                <CodeStep
                  email={email} busy={busy} setBusy={setBusy} setError={setError} setNotice={setNotice}
                  onVerified={() => go("password")} onBack={() => go("email")}
                />
              )}
              {step === "password" && (
                <PasswordStep busy={busy} setBusy={setBusy} setError={setError} onDone={() => go("photo")} />
              )}
              {step === "photo" && (
                <PhotoStep busy={busy} setBusy={setBusy} setError={setError} onDone={() => go("tasks")} />
              )}
              {step === "tasks" && <TasksStep onDone={() => go("tour")} onBack={() => go("photo")} />}
              {step === "tour" && <TourStep onFinish={async () => {
                const { data } = await supabase.auth.getUser();
                if (data.user) {
                  await supabase.from("profiles").update({ onboarding_completed_at: new Date().toISOString(), onboarding_step: 6 }).eq("id", data.user.id);
                }
                try { localStorage.setItem("hq.tour.pending", "1"); } catch { /* ignore */ }
                navigate({ to: "/dashboard" });
              }} onBack={() => go("tasks")} />}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function StepRail({ idx }: { idx: number }) {
  return (
    <aside className="rounded-2xl border border-border bg-gradient-to-b from-primary/[0.07] to-transparent p-5">
      <p className="mb-5 text-xs text-muted-foreground">Get started by setting up your HQ account.</p>
      <ol className="relative space-y-6">
        {STEPS.map((s, i) => {
          const done = i < idx;
          const active = i === idx;
          const Icon = s.icon;
          return (
            <li key={s.key} className="relative flex gap-3">
              {i < STEPS.length - 1 && (
                <span className={`absolute left-[15px] top-9 h-[calc(100%+0.5rem)] w-px ${done ? "bg-primary" : "bg-border"}`} />
              )}
              <span className={`relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border ${
                done ? "border-primary bg-primary text-primary-foreground"
                : active ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground"}`}>
                {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </span>
              <div className="min-w-0">
                <p className={`text-sm font-semibold ${active || done ? "text-foreground" : "text-muted-foreground"}`}>{s.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{s.blurb}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}

function Banner({ tone, children }: { tone: "error" | "ok"; children: React.ReactNode }) {
  return (
    <div className={`mt-5 rounded-lg border px-3 py-2 text-sm ${
      tone === "error" ? "border-destructive/30 bg-destructive/5 text-destructive" : "border-primary/30 bg-primary/5 text-primary"}`}>
      {children}
    </div>
  );
}

function Actions({ onBack, onNext, nextLabel, busy, disabled }: {
  onBack?: () => void; onNext: () => void; nextLabel: string; busy?: boolean; disabled?: boolean;
}) {
  return (
    <div className="mt-8 flex items-center justify-between">
      {onBack ? (
        <button onClick={onBack} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      ) : <span />}
      <button onClick={onNext} disabled={busy || disabled}
        className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        {nextLabel} <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function EmailStep({ email, setEmail, busy, setBusy, setError, setNotice, onSent }: any) {
  const send = async () => {
    const value = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) { setError("Enter a valid email address."); return; }
    setError(null); setBusy(true);
    try {
      const { data, error } = await supabase.rpc("onboarding_invite_check", { _email: value });
      if (error) throw error;
      if (!(data as any)?.ok) {
        setError("That email hasn't been added to the team directory yet. Ask your manager to add you, then try again.");
        return;
      }
      const { error: otpErr } = await supabase.auth.signInWithOtp({
        email: value,
        options: { shouldCreateUser: true, emailRedirectTo: `${window.location.origin}/welcome` },
      });
      if (otpErr) throw otpErr;
      setNotice(`We sent a 6-digit code to ${value}.`);
      onSent();
    } catch (e: any) {
      setError(e?.message ?? "Could not send the code.");
    } finally { setBusy(false); }
  };

  return (
    <div className="max-w-md">
      <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">Work email</label>
      <input aria-label="Work email" type="email" autoComplete="email" value={email}
        onChange={(e) => setEmail(e.target.value)} placeholder="you@clovrlab.com" className={`${input} mt-1.5`} />
      <p className="mt-2 text-xs text-muted-foreground">Use the address your admin added in the team directory.</p>
      <Actions onNext={send} nextLabel="Send code" busy={busy} />
    </div>
  );
}

function CodeStep({ email, busy, setBusy, setError, setNotice, onVerified, onBack }: any) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const code = digits.join("");

  const setAt = (i: number, v: string) => {
    const clean = v.replace(/\D/g, "");
    if (!clean) { setDigits((d) => d.map((x, k) => (k === i ? "" : x))); return; }
    setDigits((d) => {
      const next = [...d];
      clean.split("").forEach((c, k) => { if (i + k < 6) next[i + k] = c; });
      return next;
    });
    const jump = Math.min(i + clean.length, 5);
    refs.current[jump]?.focus();
  };

  const verify = async () => {
    if (code.length !== 6) { setError("Enter all six digits."); return; }
    setError(null); setBusy(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });
      if (error) throw error;
      onVerified();
    } catch (e: any) {
      setError(e?.message?.includes("expired") ? "That code expired. Send a new one." : (e?.message ?? "Invalid code."));
    } finally { setBusy(false); }
  };

  const resend = async () => {
    setBusy(true); setError(null);
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
    setBusy(false);
    if (error) setError(error.message); else setNotice("New code sent.");
  };

  return (
    <div className="max-w-md">
      <p className="text-sm text-muted-foreground">Code sent to <span className="font-medium text-foreground">{email}</span></p>
      <div className="mt-4 flex gap-2">
        {digits.map((d, i) => (
          <input key={i} ref={(el) => { refs.current[i] = el; }} aria-label={`Digit ${i + 1}`} inputMode="numeric"
            value={d} onChange={(e) => setAt(i, e.target.value)}
            onKeyDown={(e) => { if (e.key === "Backspace" && !d && i > 0) refs.current[i - 1]?.focus(); }}
            className="h-14 w-12 rounded-lg border border-border bg-background text-center text-xl font-semibold outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20" />
        ))}
      </div>
      <button onClick={resend} className="mt-3 text-xs text-primary hover:underline">Didn't get it? Resend code</button>
      <Actions onBack={onBack} onNext={verify} nextLabel="Verify" busy={busy} disabled={code.length !== 6} />
    </div>
  );
}

function PasswordStep({ busy, setBusy, setError, onDone }: any) {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const strength = useMemo(() => {
    let s = 0;
    if (pw.length >= 8) s++;
    if (pw.length >= 12) s++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
    if (/\d/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return Math.min(s, 4);
  }, [pw]);

  const save = async () => {
    if (pw.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (pw !== pw2) { setError("Passwords don't match."); return; }
    setError(null); setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) setError(error.message); else onDone();
  };

  return (
    <div className="max-w-md">
      <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">New password</label>
      <input aria-label="New password" type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} className={`${input} mt-1.5`} />
      <div className="mt-2 flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={`h-1 flex-1 rounded-full ${i < strength ? "bg-primary" : "bg-border"}`} />
        ))}
      </div>
      <label className="mt-4 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Confirm password</label>
      <input aria-label="Confirm password" type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} className={`${input} mt-1.5`} />
      <p className="mt-2 text-xs text-muted-foreground">At least 8 characters. Mix cases, numbers and a symbol for a stronger score.</p>
      <Actions onNext={save} nextLabel="Save password" busy={busy} />
    </div>
  );
}

function PhotoStep({ busy, setBusy, setError, onDone }: any) {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const pick = (f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) { setError("Choose an image file."); return; }
    if (f.size > 5 * 1024 * 1024) { setError("Image must be under 5 MB."); return; }
    setError(null);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const save = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { setError("Session expired — start again."); return; }
    if (!file) { onDone(); return; }
    setBusy(true);
    try {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${u.user.id}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data: signed, error: signErr } = await supabase.storage.from("avatars").createSignedUrl(path, 60 * 60 * 24 * 365);
      if (signErr) throw signErr;
      await supabase.from("profiles").update({ avatar_url: signed.signedUrl, onboarding_step: 3 }).eq("id", u.user.id);
      onDone();
    } catch (e: any) {
      setError(e?.message ?? "Upload failed.");
    } finally { setBusy(false); }
  };

  return (
    <div className="max-w-md">
      <div className="flex items-center gap-5">
        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
          {preview ? <img src={preview} alt="Profile preview" className="h-full w-full object-cover" /> : <ImagePlus className="h-7 w-7 text-muted-foreground" />}
        </div>
        <div>
          <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
            <Upload className="h-4 w-4" /> {preview ? "Choose another" : "Upload photo"}
          </button>
          <p className="mt-2 text-xs text-muted-foreground">JPG or PNG, up to 5 MB.</p>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" aria-label="Profile photo"
          onChange={(e) => pick(e.target.files?.[0] ?? null)} />
      </div>
      <Actions onNext={save} nextLabel={file ? "Save photo" : "Skip for now"} busy={busy} />
    </div>
  );
}

type Task = { id: string; task: string; category: string | null; due_date: string | null; status: string | null };

function TasksStep({ onDone, onBack }: { onDone: () => void; onBack: () => void }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) { setLoading(false); return; }
      const { data } = await supabase
        .from("hr_onboarding")
        .select("id, task, category, due_date, status")
        .eq("assignee_id", u.user.id)
        .order("due_date", { ascending: true });
      setTasks((data ?? []) as Task[]);
      setLoading(false);
    })();
  }, []);

  const toggle = async (t: Task) => {
    const next = t.status === "done" ? "pending" : "done";
    setTasks((list) => list.map((x) => (x.id === t.id ? { ...x, status: next } : x)));
    await supabase.from("hr_onboarding").update({ status: next }).eq("id", t.id);
  };

  const done = tasks.filter((t) => t.status === "done").length;

  return (
    <div>
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading your checklist…</p>
      ) : tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground">No tasks assigned yet — your manager will add them shortly.</p>
      ) : (
        <>
          <div className="mb-3 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(done / tasks.length) * 100}%` }} />
            </div>
            <span className="text-xs text-muted-foreground">{done}/{tasks.length} done</span>
          </div>
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
            {tasks.map((t) => (
              <li key={t.id}>
                <button onClick={() => toggle(t)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/40">
                  <span className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border ${t.status === "done" ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
                    {t.status === "done" && <Check className="h-3 w-3" />}
                  </span>
                  <span className={`flex-1 text-sm ${t.status === "done" ? "text-muted-foreground line-through" : ""}`}>{t.task}</span>
                  {t.category && <span className="rounded bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">{t.category}</span>}
                  {t.due_date && <span className="text-[11px] text-muted-foreground">{new Date(t.due_date).toLocaleDateString()}</span>}
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">You can finish the rest later — they stay on your People → Onboarding list.</p>
        </>
      )}
      <Actions onBack={onBack} onNext={onDone} nextLabel="Continue" />
    </div>
  );
}

const SLIDES = [
  { icon: LayoutDashboard, title: "Your dashboard", body: "Everything assigned to you — tasks, meetings and alerts — lands here first each morning." },
  { icon: MessagesSquare, title: "Channels, DMs & phone", body: "Team channels for each division, direct messages for one-to-one, and in-app calling with automatic notes." },
  { icon: FolderOpen, title: "Drive & email", body: "Shared files live in Drive, and your work inbox is built right into HQ so nothing lives outside the workspace." },
  { icon: Bell, title: "Notifications", body: "Mentions, assignments and approvals show up in the bell — click any one to jump straight to the record." },
];

function TourStep({ onFinish, onBack }: { onFinish: () => void; onBack: () => void }) {
  const [i, setI] = useState(0);
  const S = SLIDES[i];
  const Icon = S.icon;
  return (
    <div>
      <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/[0.08] to-transparent p-8">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-6 w-6" /></span>
        <h2 className="mt-4 text-xl font-semibold">{S.title}</h2>
        <p className="mt-2 max-w-lg text-sm text-muted-foreground">{S.body}</p>
      </div>
      <div className="mt-4 flex items-center gap-2">
        {SLIDES.map((_, k) => (
          <button key={k} aria-label={`Slide ${k + 1}`} onClick={() => setI(k)}
            className={`h-1.5 rounded-full transition-all ${k === i ? "w-8 bg-primary" : "w-3 bg-border"}`} />
        ))}
      </div>
      <Actions
        onBack={i === 0 ? onBack : () => setI(i - 1)}
        onNext={() => (i < SLIDES.length - 1 ? setI(i + 1) : onFinish())}
        nextLabel={i < SLIDES.length - 1 ? "Next" : "Enter HQ"}
      />
    </div>
  );
}
