import Link from "next/link";
import { formatStorePrice } from "@/app/services/storefront";
import type { Product } from "@/dashboard/types";

type Props = {
  product: Product;
  businessSlug: string;
};

function stockDot(stock: Product["stock"]) {
  if (stock === "out") return "sf-stock-out";
  if (stock === "low") return "sf-stock-low";
  return "sf-stock-in";
}

function stockLabel(stock: Product["stock"]) {
  if (stock === "out") return "Out of stock";
  if (stock === "low") return "Limited stock";
  return "In stock";
}

export default function StoreProductCard({ product, businessSlug }: Props) {
  const cover = product.images?.[0];
  const price = formatStorePrice(product.price, product.currency);
  const out = product.stock === "out";
  const tagline = product.description?.trim() || "Available now with WhatsApp checkout.";

  return (
    <article className="sf-lineup-card group">
      <Link href={`/${businessSlug}/${product.slug}`} className="flex w-full flex-col items-center no-underline text-inherit">
        <div className="sf-lineup-image">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt={product.name} />
          ) : (
            <span className="text-7xl">{product.emoji ?? "📦"}</span>
          )}
        </div>

        <h3 className="sf-lineup-name">{product.name}</h3>
        <p className="sf-lineup-tagline">{tagline}</p>
        <p className="sf-lineup-price">From {price}</p>

        <p className="mb-4 flex items-center justify-center text-xs text-[#86868b]">
          <span className={`sf-stock-dot ${stockDot(product.stock)}`} />
          {stockLabel(product.stock)}
        </p>
      </Link>

      <div className="sf-lineup-actions">
        <Link href={`/${businessSlug}/${product.slug}`} className="sf-link">
          Learn more
        </Link>
        {out ? (
          <span className="sf-btn-buy opacity-45 cursor-not-allowed">Buy</span>
        ) : (
          <Link href={`/${businessSlug}/${product.slug}`} className="sf-btn-buy">
            Buy
          </Link>
        )}
      </div>
    </article>
  );
}
