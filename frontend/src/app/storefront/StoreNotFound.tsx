import Link from "next/link";
import "./storefront.css";

type Props = {
  slug: string;
  reason?: "missing" | "disabled" | "error";
};

export default function StoreNotFound({ slug, reason = "missing" }: Props) {
  const message =
    reason === "disabled"
      ? "This store exists but the owner has turned off their public storefront."
      : reason === "error"
        ? "We could not load this store. Make sure the MessageBuddy backend is running."
        : "No public store was found for this link.";

  return (
    <div className="sf-root flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
      <h1 className="sf-hero-title mb-4 text-[2.5rem]">Store not found</h1>
      <p className="sf-hero-sub mx-auto mb-2">/{slug}</p>
      <p className="mb-8 max-w-md text-base text-[#6e6e73]">{message}</p>
      <Link href="/" className="sf-btn-buy no-underline">
        MessageBuddy
      </Link>
    </div>
  );
}
