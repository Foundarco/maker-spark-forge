import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, PageHeader } from "@/components/site/Section";
import { Card } from "@/components/site/Card";
import { CTAButton, CTAButtonBtn } from "@/components/site/CTAButton";
import { useCart } from "@/lib/cart";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your cart" }, { name: "robots", content: "noindex" }] }),
  component: CartPage,
});

function CartPage() {
  const { items, setQty, remove } = useCart();
  return (
    <>
      <Section>
        <PageHeader eyebrow="Cart" title="Your cart" />
        {items.length === 0 ? (
          <Card className="items-start">
            <p className="text-muted-foreground">Your cart is empty.</p>
            <CTAButton to="/store" className="mt-4">Browse the store</CTAButton>
          </Card>
        ) : (
          <>
            <div className="space-y-3">
              {items.map((i) => (
                <Card key={i.slug} className="flex-row items-center gap-4">
                  <div aria-hidden className="h-16 w-16 shrink-0 rounded-xl bg-warm" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{i.name}</p>
                    <p className="text-sm text-muted-foreground">{i.price_display ?? "—"}</p>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <span className="sr-only">Quantity</span>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={i.quantity}
                      onChange={(e) => setQty(i.slug, Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
                      className="h-11 w-16 rounded-lg border border-border bg-card px-3 text-center"
                    />
                  </label>
                  <button
                    onClick={() => remove(i.slug)}
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-border text-muted-foreground hover:text-destructive"
                    aria-label={`Remove ${i.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </Card>
              ))}
            </div>
            <div className="mt-8 flex flex-col-reverse items-start justify-between gap-4 sm:flex-row sm:items-center">
              <Link to="/store" className="text-sm text-primary hover:underline">← Keep shopping</Link>
              <CTAButton to="/checkout">Continue to checkout</CTAButton>
            </div>
          </>
        )}
      </Section>
    </>
  );
}
