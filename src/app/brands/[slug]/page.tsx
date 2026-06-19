import { brandName } from "@/data/brands";
import { BrandPageClient } from "@/components/brands/BrandPageClient";

type Props = { params: { slug: string } };

export function generateMetadata({ params }: Props) {
  return { title: brandName(params.slug) };
}

export default function BrandPage({ params }: Props) {
  return <BrandPageClient slug={params.slug} />;
}
