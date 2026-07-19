import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { MemberProfileDashboard } from "@/components/platform/MemberProfileDashboard";
import { germanMemberProfileCopy as copy } from "@/i18n/member-profile";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (locale !== "de") return {};
  return {
    title: copy.title,
    description: copy.lede,
    alternates: pageAlternates("de", "/profile"),
    robots: { index: false, follow: false },
  };
}

export default async function MemberProfilePage({ params }: Props) {
  const { locale } = await params;
  if (locale !== "de") notFound();
  return (
    <>
      <PageHeader title={copy.title} lede={copy.lede} />
      <Container className="py-14 sm:py-20">
        <MemberProfileDashboard />
      </Container>
    </>
  );
}
