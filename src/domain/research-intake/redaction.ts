export const REDACTION_CATEGORIES = [
  "SUBMITTER_NAME",
  "SUBMITTER_EMAIL",
  "SUBMITTER_PHONE",
  "SUBMITTER_ADDRESS",
  "SUBMITTER_ACCOUNT_IDENTIFIER",
] as const;

export const INSTITUTION_CATEGORIES = [
  "INSTITUTION",
  "PUBLIC_AUTHORITY",
  "COMPANY",
  "HEALTHCARE_ORGANISATION",
  "UNIVERSITY",
  "INSTITUTIONAL_UNIT",
  "PROCEDURE",
  "PROGRAMME",
] as const;

export type RedactionCategory = (typeof REDACTION_CATEGORIES)[number];
export type InstitutionCategory = (typeof INSTITUTION_CATEGORIES)[number];

export type SubmitterIdentity = {
  givenName: string;
  familyName: string;
  email: string;
  phone?: string | null;
  addressLines: string[];
  accountIdentifiers: string[];
};

export type IdentityRedaction = {
  category: RedactionCategory;
  start: number;
  end: number;
  original: string;
  replacement: string;
};

export type PreservedInstitution = {
  category: InstitutionCategory;
  start: number;
  end: number;
  text: string;
};

export type RedactionPreview = {
  sanitizedText: string;
  redactions: IdentityRedaction[];
  preservedInstitutions: PreservedInstitution[];
};

const institutionPatterns: Array<{
  category: InstitutionCategory;
  expression: RegExp;
}> = [
  {
    category: "UNIVERSITY",
    expression: /\b(?:Universit(?:ä|ae)t|University|Hochschule|دانشگاه)\s+[\p{L}\p{M}\d .&'’\-]{2,80}/giu,
  },
  {
    category: "HEALTHCARE_ORGANISATION",
    expression: /\b(?:Klinik|Krankenhaus|Hospital|Clinic|بیمارستان)\s+[\p{L}\p{M}\d .&'’\-]{2,80}/giu,
  },
  {
    category: "PUBLIC_AUTHORITY",
    expression: /\b(?:Amt|Behörde|Ministerium|Senat|Council|Authority|Ministry|اداره|وزارت)\s+[\p{L}\p{M}\d .&'’\-]{2,80}/giu,
  },
  {
    category: "COMPANY",
    expression: /\b[\p{L}\p{M}\d .&'’\-]{2,80}\s+(?:GmbH|gGmbH|AG|UG|Ltd\.?|Limited|Inc\.?|شرکت)\b/giu,
  },
  {
    category: "INSTITUTION",
    expression: /\b[\p{L}\p{M}\d .&'’\-]{2,80}\s+(?:e\.V\.|Stiftung|Foundation|Association|انجمن|بنیاد)\b/giu,
  },
  {
    category: "INSTITUTIONAL_UNIT",
    expression: /\b(?:Abteilung|Referat|Department|Unit|بخش|واحد)\s+[\p{L}\p{M}\d .&'’\-]{2,80}/giu,
  },
  {
    category: "PROCEDURE",
    expression: /\b(?:Verfahren|Procedure|Process|رویه|فرایند)\s+[\p{L}\p{M}\d .&'’\-]{2,80}/giu,
  },
  {
    category: "PROGRAMME",
    expression: /\b(?:Programm|Programme|Program|برنامه)\s+[\p{L}\p{M}\d .&'’\-]{2,80}/giu,
  },
];

export function redactSubmitterIdentity(
  text: string,
  identity: SubmitterIdentity
): RedactionPreview {
  if (!text.trim()) return { sanitizedText: text, redactions: [], preservedInstitutions: [] };
  const preservedInstitutions = classifyInstitutionalSpans(text);
  const candidates = identityCandidates(identity)
    .flatMap(({ category, value }) => findOccurrences(text, value)
      .map((span) => ({ category, original: text.slice(span.start, span.end), ...span })))
    .filter((candidate) => !shouldPreserveInstitutionalName(candidate, preservedInstitutions))
    .sort((left, right) => left.start - right.start || right.end - left.end);

  const redactions: IdentityRedaction[] = [];
  let occupiedUntil = -1;
  for (const candidate of candidates) {
    if (candidate.start < occupiedUntil) continue;
    const replacement = `[REDACTED:${candidate.category}]`;
    redactions.push({ ...candidate, replacement });
    occupiedUntil = candidate.end;
  }

  let sanitizedText = text;
  for (const redaction of [...redactions].reverse()) {
    sanitizedText = `${sanitizedText.slice(0, redaction.start)}${redaction.replacement}${sanitizedText.slice(redaction.end)}`;
  }
  return { sanitizedText, redactions, preservedInstitutions };
}

export function classifyInstitutionalSpans(text: string): PreservedInstitution[] {
  const matches: PreservedInstitution[] = [];
  for (const pattern of institutionPatterns) {
    pattern.expression.lastIndex = 0;
    for (const match of text.matchAll(pattern.expression)) {
      if (match.index === undefined) continue;
      const normalized = match[0].trimEnd();
      matches.push({
        category: pattern.category,
        start: match.index,
        end: match.index + normalized.length,
        text: normalized,
      });
    }
  }
  return deduplicateSpans(matches);
}

export function containsGenericDirectIdentifier(text: string): boolean {
  return /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/iu.test(text) ||
    /(?:\+?\d[\d ()/.-]{7,}\d)/u.test(text) ||
    /\b(?:auth0|member|membership|profile|wallet)[_:\-][A-Za-z0-9_-]{6,}\b/iu.test(text);
}

function identityCandidates(identity: SubmitterIdentity): Array<{
  category: RedactionCategory;
  value: string;
}> {
  const fullName = `${identity.givenName.trim()} ${identity.familyName.trim()}`.trim();
  const candidates: Array<{ category: RedactionCategory; value: string }> = [
    { category: "SUBMITTER_EMAIL", value: identity.email },
    { category: "SUBMITTER_PHONE", value: identity.phone ?? "" },
    ...identity.accountIdentifiers.map((value) => ({
      category: "SUBMITTER_ACCOUNT_IDENTIFIER" as const,
      value,
    })),
    ...identity.addressLines.map((value) => ({
      category: "SUBMITTER_ADDRESS" as const,
      value,
    })),
    { category: "SUBMITTER_NAME", value: fullName },
  ];
  return candidates.filter((candidate) => normalizedLength(candidate.value) >= 3);
}

function findOccurrences(text: string, value: string) {
  const normalizedText = text.normalize("NFKC").toLocaleLowerCase("und");
  const normalizedValue = value.trim().normalize("NFKC").toLocaleLowerCase("und");
  const matches: Array<{ start: number; end: number }> = [];
  let offset = 0;
  while (offset <= normalizedText.length - normalizedValue.length) {
    const start = normalizedText.indexOf(normalizedValue, offset);
    if (start < 0) break;
    matches.push({ start, end: start + normalizedValue.length });
    offset = start + normalizedValue.length;
  }
  return matches;
}

function shouldPreserveInstitutionalName(
  candidate: { category: RedactionCategory; start: number; end: number },
  institutions: PreservedInstitution[]
) {
  return candidate.category === "SUBMITTER_NAME" && institutions.some((span) =>
    candidate.start >= span.start && candidate.end <= span.end
  );
}

function deduplicateSpans(spans: PreservedInstitution[]) {
  return spans
    .sort((left, right) => left.start - right.start || right.end - left.end)
    .filter((span, index, all) => !all.slice(0, index).some((existing) =>
      span.start >= existing.start && span.end <= existing.end
    ));
}

function normalizedLength(value: string) {
  return value.trim().normalize("NFKC").length;
}
