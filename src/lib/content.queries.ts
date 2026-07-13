import { queryOptions } from "@tanstack/react-query";
import { listProducts, getProduct, listPosts, getPost, listGuides, getGuide } from "./content.functions";

export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: () => listProducts(),
});
export const productQuery = (slug: string) => queryOptions({
  queryKey: ["product", slug],
  queryFn: () => getProduct({ data: { slug } }),
});
export const postsQuery = queryOptions({
  queryKey: ["posts"],
  queryFn: () => listPosts(),
});
export const postQuery = (slug: string) => queryOptions({
  queryKey: ["post", slug],
  queryFn: () => getPost({ data: { slug } }),
});
export const guidesQuery = queryOptions({
  queryKey: ["guides"],
  queryFn: () => listGuides(),
});
export const guideQuery = (slug: string) => queryOptions({
  queryKey: ["guide", slug],
  queryFn: () => getGuide({ data: { slug } }),
});
