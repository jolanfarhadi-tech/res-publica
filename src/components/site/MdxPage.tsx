import { MDXRemote } from "next-mdx-remote/rsc";
import type { Locale } from "@/i18n/config";
import { getPage } from "@/lib/content";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Prose } from "@/components/ui/Prose";

/**
 * MdxPage — renders one static content page from
 * content/<locale>/pages/<slug>.mdx. About and Mission both use
 * this; future MDX pages need only a tiny route file.
 */
export function MdxPage({ locale, slug }: { locale: Locale; slug: string }) {
  const page = getPage(locale, slug);

  return (
    <>
      <PageHeader
        title={page.frontmatter.title}
        lede={page.frontmatter.description}
      />
      <Container className="py-14 sm:py-20">
        <Prose>
          <MDXRemote source={page.body} />
        </Prose>
      </Container>
    </>
  );
}
