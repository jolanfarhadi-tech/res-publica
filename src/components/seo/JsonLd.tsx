/**
 * JsonLd — renders a schema.org structured-data block.
 * Search engines read these to show rich results.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  // Escape `<` as `<` so a value containing `</script>` can't break
  // out of this tag. JSON parsers decode `<` back to `<` identically,
  // so this changes nothing about the structured data itself — only how
  // the same JSON is safely embedded in HTML.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
