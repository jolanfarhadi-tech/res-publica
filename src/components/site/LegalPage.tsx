import { readFileSync } from "node:fs";
import path from "node:path";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Container } from "@/components/ui/Container";
import { Prose } from "@/components/ui/Prose";

type LegalDocument = "impressum" | "datenschutz";

export function LegalPage({ document }: { document: LegalDocument }) {
  const source = readFileSync(path.join(process.cwd(), `${document}.md`), "utf8");

  return (
    <Container className="py-14 sm:py-20">
      <div lang="de" dir="ltr" className="[&_p]:whitespace-pre-line">
        <Prose>
          <MDXRemote source={source} />
        </Prose>
      </div>
    </Container>
  );
}
