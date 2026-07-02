import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product Details | MessageBuddy Store",
  description: "View product details and checkout — no login required.",
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children;
}
