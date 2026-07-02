import ShopProductPage from "./ShopProductPage";

type Props = {
  params: Promise<{ userId: string; slug: string }>;
};

export default async function ShopPage({ params }: Props) {
  const { userId, slug } = await params;
  return <ShopProductPage userId={userId} slug={slug} />;
}
