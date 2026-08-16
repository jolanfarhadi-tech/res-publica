import type { Locale } from "./config";

type Copy = {
  title: string; lede: string; loading: string;
  loginTitle: string; loginText: string; loginAction: string;
  forbiddenTitle: string; forbiddenText: string;
  unavailableTitle: string; unavailableText: string; empty: string;
  incidents: string; observations: string; claims: string; correlations: string;
  severity: string; status: string; affectedAssets: string; technicalSource: string;
  routes: string; techniques: string; evidenceHash: string; level: string;
  confidence: string; evidence: string; inferences: string; contradictions: string;
  alternatives: string; relation: string; identityBoundary: string; passiveBoundary: string;
};

const de: Copy = {
  title: "Security Operations",
  lede: "Geschützter Einblick in technische Vorfälle, pseudonymisierte Beobachtungen und evidenzgebundene Zuordnungshypothesen.",
  loading: "Sicherheitslage wird geladen …",
  loginTitle: "Anmeldung erforderlich",
  loginText: "Dieser Bereich ist nur für ausdrücklich zugewiesene Sicherheitsverantwortliche zugänglich.",
  loginAction: "Sicher anmelden",
  forbiddenTitle: "Keine Sicherheitszuständigkeit",
  forbiddenText: "Dieses Konto besitzt keine aktive, exakt begrenzte und MFA-geschützte Leseberechtigung.",
  unavailableTitle: "Security Operations nicht verfügbar",
  unavailableText: "Es wurden keine Daten verändert. Bitte versuchen Sie es später erneut.",
  empty: "Keine technischen Vorfälle im sichtbaren Zuständigkeitsbereich.",
  incidents: "Technische Vorfälle", observations: "Beobachtungen", claims: "Zuordnungshypothesen", correlations: "Zeitliche Korrelationen",
  severity: "Schweregrad", status: "Status", affectedAssets: "Betroffene Bereiche", technicalSource: "Pseudonymer technischer Bezug",
  routes: "Routenfolge", techniques: "Beobachtete Techniken", evidenceHash: "Evidenz-Hash", level: "Zuordnungsebene",
  confidence: "Konfidenz", evidence: "Beobachtete Evidenz", inferences: "Schlussfolgerungen", contradictions: "Widersprechende Evidenz",
  alternatives: "Alternative Erklärungen", relation: "Beziehung",
  identityBoundary: "Technische Ähnlichkeit ist kein Nachweis derselben Person. Die Ebenen A–D werden niemals automatisch zu einer realen Identität hochgestuft.",
  passiveBoundary: "Kein Hack-back und kein unbefugtes Scannen von Quellsystemen. Externe Netzwerkanreicherung bleibt ohne gesondert genehmigte Quelle deaktiviert.",
};

const en: Copy = {
  title: "Security Operations",
  lede: "Protected visibility into technical incidents, pseudonymized observations and evidence-bounded attribution hypotheses.",
  loading: "Loading security state …",
  loginTitle: "Sign-in required", loginText: "This area is available only to explicitly assigned security operators.", loginAction: "Sign in securely",
  forbiddenTitle: "No security assignment", forbiddenText: "This account has no active, exactly bounded and MFA-protected read authority.",
  unavailableTitle: "Security Operations unavailable", unavailableText: "No data was changed. Please try again later.", empty: "No technical incidents are visible within this authority.",
  incidents: "Technical incidents", observations: "Observations", claims: "Attribution hypotheses", correlations: "Temporal correlations",
  severity: "Severity", status: "Status", affectedAssets: "Affected areas", technicalSource: "Pseudonymous technical reference",
  routes: "Route sequence", techniques: "Observed techniques", evidenceHash: "Evidence hash", level: "Attribution level",
  confidence: "Confidence", evidence: "Observed evidence", inferences: "Inferences", contradictions: "Contradictory evidence",
  alternatives: "Alternative explanations", relation: "Relation",
  identityBoundary: "Technical similarity is not proof of the same person. Levels A–D are never automatically promoted to a real-world identity.",
  passiveBoundary: "There is no hack-back or unauthorized scanning of source systems. External network enrichment remains disabled without a separately approved source.",
};

const fa: Copy = {
  title: "عملیات امنیتی",
  lede: "نمای محافظت‌شده از رخدادهای فنی، مشاهدات مستعارسازی‌شده و فرضیه‌های انتسابِ محدود به شواهد.",
  loading: "وضعیت امنیتی در حال بارگذاری است…",
  loginTitle: "ورود لازم است", loginText: "این بخش فقط برای مسئولان امنیتی که صریحاً تعیین شده‌اند در دسترس است.", loginAction: "ورود امن",
  forbiddenTitle: "مسئولیت امنیتی وجود ندارد", forbiddenText: "این حساب مجوز خواندن فعال، دقیقاً محدود و محافظت‌شده با احراز هویت چندمرحله‌ای ندارد.",
  unavailableTitle: "عملیات امنیتی در دسترس نیست", unavailableText: "هیچ داده‌ای تغییر نکرده است. لطفاً بعداً دوباره تلاش کنید.", empty: "هیچ رخداد فنی در محدودهٔ این اختیار قابل مشاهده نیست.",
  incidents: "رخدادهای فنی", observations: "مشاهدات", claims: "فرضیه‌های انتساب", correlations: "هم‌بستگی‌های زمانی",
  severity: "شدت", status: "وضعیت", affectedAssets: "بخش‌های متأثر", technicalSource: "مرجع فنی مستعار",
  routes: "توالی مسیرها", techniques: "فنون مشاهده‌شده", evidenceHash: "هش شواهد", level: "سطح انتساب",
  confidence: "اطمینان", evidence: "شواهد مشاهده‌شده", inferences: "استنباط‌ها", contradictions: "شواهد متناقض",
  alternatives: "توضیح‌های جایگزین", relation: "رابطه",
  identityBoundary: "شباهت فنی اثبات نمی‌کند که یک شخص واحد مسئول بوده است. سطوح A تا D هرگز به‌طور خودکار به هویت واقعی ارتقا نمی‌یابند.",
  passiveBoundary: "هیچ اقدام تلافی‌جویانه یا اسکن غیرمجاز سامانه‌های مبدأ انجام نمی‌شود. غنی‌سازی بیرونی شبکه بدون منبع جداگانه و تأییدشده غیرفعال می‌ماند.",
};

export const securityOperationsCopy: Record<Locale, Copy> = { de, en, fa };
