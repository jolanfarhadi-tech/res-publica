/** Read-only smoke check for the approved trilingual architectural release. */
import assert from "node:assert/strict";

const base = new URL(process.argv[2] ?? "http://127.0.0.1:3100");
assert(["http:", "https:"].includes(base.protocol), "HTTP(S) base URL required");
const paths = ["", "about", "team", "research", "publications", "method", "programs", "projects", "news", "membership", "contact"];
const results = [];
for (const locale of ["de", "en", "fa"]) {
  for (const route of paths) {
    const pathname = `/${locale}${route ? `/${route}` : ""}`;
    const response = await fetch(new URL(pathname, base), { signal: AbortSignal.timeout(60000) });
    const html = await response.text();
    const root = html.match(/<html\b[^>]*>/)?.[0] ?? "";
    const direction = locale === "fa" ? "rtl" : "ltr";
    const checks = {
      http: response.status === 200,
      locale: root.includes(`lang="${locale}"`),
      direction: root.includes(`dir="${direction}"`),
      architecture: root.includes('data-architecture="cinema"'),
      content: /<main\b/.test(html) && /<h1\b/.test(html),
      legacyHeroAbsent: !html.includes('class="forum-hero '),
    };
    const ok = Object.values(checks).every(Boolean);
    results.push({ pathname, ok, status: response.status, ...checks });
    console.log(`${ok ? "PASS" : "FAIL"} ${pathname} HTTP ${response.status}${ok ? "" : ` ${JSON.stringify(checks)}`}`);
  }
}
const failed = results.filter((result) => !result.ok);
console.log(JSON.stringify({ base: base.origin, checked: results.length, passed: results.length - failed.length, failed: failed.length }));
if (failed.length) process.exitCode = 1;
