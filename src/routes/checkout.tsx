import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Section, PageHeader } from "@/components/site/Section";
import { Card } from "@/components/site/Card";
import { CTAButtonBtn } from "@/components/site/CTAButton";
import { useCart } from "@/lib/cart";
import { submitOrder } from "@/lib/content.functions";
import { toast, Toaster } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout" }, { name: "robots", content: "noindex" }] }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, clear } = useCart();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setBusy(true);
    try {
      await submitOrder({
        data: {
          cart: items.map((i) => ({ slug: i.slug, name: i.name, quantity: i.quantity })),
          subtotal_cents: 0,
          name, email,
          shipping_address: address ? { line1: address } : undefined,
          notes: notes || undefined,
        },
      });
      clear();
      setSubmitted(true);
    } catch (err) {
      toast.error((err as Error).message || "Could not save order.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Toaster position="bottom-center" />
      <Section>
        <PageHeader eyebrow="Checkout" title="Checkout" />
        <div className="rounded-2xl border border-dashed border-primary/50 bg-primary-soft/40 p-4 text-sm">
          Live payments aren't wired yet. Submitting this form saves your order as an <em>expression of interest</em>{" "}
          and we'll email you when payment is available.
        </div>

        {submitted ? (
          <Card className="mt-8">
            <h2 className="text-xl font-semibold">Thanks — we've got it.</h2>
            <p className="mt-2 text-muted-foreground">
              Your order is saved. We'll be in touch at your email as soon as live payments are turned on.
            </p>
            <Link to="/" className="mt-4 inline-flex text-sm text-primary hover:underline">Back home →</Link>
          </Card>
        ) : (
          <form onSubmit={submit} className="mt-8 grid gap-8 md:grid-cols-[1.4fr_1fr]">
            <div className="space-y-4">
              <Card>
                <h2 className="text-lg font-semibold">Contact</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1 text-sm">
                    <span>Name</span>
                    <input required value={name} onChange={(e) => setName(e.target.value)} className="h-11 rounded-lg border border-border bg-card px-3" />
                  </label>
                  <label className="grid gap-1 text-sm">
                    <span>Email</span>
                    <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 rounded-lg border border-border bg-card px-3" />
                  </label>
                </div>
              </Card>
              <Card>
                <h2 className="text-lg font-semibold">Shipping</h2>
                <label className="mt-4 grid gap-1 text-sm">
                  <span>Address</span>
                  <textarea rows={3} value={address} onChange={(e) => setAddress(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-2" />
                </label>
              </Card>
              <Card>
                <h2 className="text-lg font-semibold">Notes</h2>
                <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-4 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm" placeholder="Anything we should know?" />
              </Card>
            </div>
            <Card className="h-fit md:sticky md:top-24">
              <h2 className="text-lg font-semibold">Your order</h2>
              {items.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">Your cart is empty. <Link to="/store" className="text-primary hover:underline">Add something</Link>.</p>
              ) : (
                <ul className="mt-3 divide-y divide-border">
                  {items.map((i) => (
                    <li key={i.slug} className="flex justify-between py-3 text-sm">
                      <span>{i.name} × {i.quantity}</span>
                      <span className="text-muted-foreground">{i.price_display ?? "—"}</span>
                    </li>
                  ))}
                </ul>
              )}
              <CTAButtonBtn type="submit" className="mt-6 w-full" disabled={busy || items.length === 0}>
                {busy ? "Saving…" : "Save order"}
              </CTAButtonBtn>
              <p className="mt-3 text-xs text-muted-foreground">No card charged. No payment collected.</p>
            </Card>
          </form>
        )}
      </Section>
    </>
  );
}
