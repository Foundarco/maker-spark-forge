import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { productQuery } from "@/lib/content.queries";
import { Section, PageHeader, Eyebrow } from "@/components/site/Section";
import { Card } from "@/components/site/Card";
import { CTAButtonBtn } from "@/components/site/CTAButton";
import { Placeholder } from "@/components/site/Placeholder";
import { useCart } from "@/lib/cart";
import { brand } from "@/config/brand";
import { toast } from "sonner";
import { Toaster } from "sonner";

export const Route = createFileRoute("/store/$slug")({
  loader: async ({ params, context }) => {
    const p = await context.queryClient.ensureQueryData(productQuery(params.slug));
    if (!p) throw notFound();
    return { slug: params.slug };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: `Product — ${brand.name}` }, { name: "robots", content: "noindex" }] };
    return { meta: [{ title: `${loaderData.slug} — ${brand.name}` }] };
  },
  component: ProductPage,
  notFoundComponent: () => (
    <Section>
      <PageHeader title="Product not found" />
      <Link to="/store" className="text-primary hover:underline">Back to store →</Link>
    </Section>
  ),
});

function ProductPage() {
  const { slug } = Route.useLoaderData();
  const { data: p } = useSuspenseQuery(productQuery(slug));
  const { add } = useCart();
  if (!p) return null;
  const specs = (p.specs as Record<string, string> | null) ?? {};

  return (
    <>
      <Toaster position="bottom-center" />
      <Section>
        <Link to="/store" className="text-sm text-primary hover:underline">← Store</Link>
        <div className="mt-6 grid gap-10 md:grid-cols-2 md:gap-14">
          <div className="transparency-card aspect-square rounded-3xl">
            <div className="grid h-full place-items-center text-sm text-muted-foreground">
              <Placeholder>[PLACEHOLDER product image: {p.name}]</Placeholder>
            </div>
          </div>
          <div>
            <Eyebrow>{p.category}</Eyebrow>
            <h1 className="text-4xl font-semibold sm:text-5xl">{p.name}</h1>
            <p className="mt-3 text-lg text-muted-foreground">{p.tagline}</p>
            <p className="mt-6 text-2xl font-medium"><Placeholder>{p.price_display}</Placeholder></p>
            <p className="mt-6 whitespace-pre-line text-foreground">{p.description}</p>
            <CTAButtonBtn
              className="mt-8"
              onClick={() => {
                add({ slug: p.slug, name: p.name, price_display: p.price_display }, 1);
                toast.success(`Added ${p.name} to cart`);
              }}
            >
              Add to cart
            </CTAButtonBtn>
            <p className="mt-3 text-xs text-muted-foreground">
              Checkout captures interest until live payments are turned on.
            </p>
          </div>
        </div>
      </Section>

      <Section className="grid gap-8 md:grid-cols-2">
        <Card>
          <h2 className="text-xl font-semibold">Specs</h2>
          <dl className="mt-4 divide-y divide-border">
            {Object.entries(specs).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-6 py-3 text-sm">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="text-right"><Placeholder>{String(v)}</Placeholder></dd>
              </div>
            ))}
          </dl>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold">What's in the box</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {p.in_the_box.map((i) => (
              <li key={i} className="flex gap-2"><span className="text-primary">—</span> {i}</li>
            ))}
          </ul>
        </Card>
      </Section>

      {p.related_slugs.length > 0 && (
        <Section>
          <h2 className="mb-6 text-2xl font-semibold">Pairs well with</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {p.related_slugs.map((s) => (
              <Card key={s} className="flex-row items-center justify-between">
                <span className="text-sm">{s.replace(/-/g, " ")}</span>
                <Link to="/store/$slug" params={{ slug: s }} className="text-sm text-primary hover:underline">View →</Link>
              </Card>
            ))}
          </div>
        </Section>
      )}

      <Section>
        <h2 className="text-2xl font-semibold">Reviews</h2>
        <p className="mt-3 text-muted-foreground">
          <Placeholder>[PLACEHOLDER: reviews will appear here once we have real ones. Never fabricate.]</Placeholder>
        </p>
      </Section>
    </>
  );
}
