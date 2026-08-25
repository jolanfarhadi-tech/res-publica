import type {
  ControlPanelGroupId,
  ControlPanelSectionId,
} from "../data/control-panel";
import type { Locale } from "./config";

type ControlPanelCopy = {
  eyebrow: string;
  title: string;
  lede: string;
  assignedAreas: string;
  membershipQueue: string;
  publishingScopes: string;
  siteOverviewTitle: string;
  siteOverviewLede: string;
  openPage: string;
  groups: Record<ControlPanelGroupId, string>;
  sections: Record<ControlPanelSectionId, string>;
  boundariesTitle: string;
  boundaries: [string, string, string];
};

const de: ControlPanelCopy = {
  eyebrow: "Interne Steuerung",
  title: "Admin Control Panel",
  lede: "Ein zentraler Überblick über öffentliche Bereiche und die Arbeitsräume, für die dieses Konto tatsächlich autorisiert ist.",
  assignedAreas: "Autorisierte Arbeitsräume",
  membershipQueue: "Zugewiesene Mitgliedschaftsanträge",
  publishingScopes: "Publikationsbereiche",
  siteOverviewTitle: "Alle Website-Bereiche",
  siteOverviewLede: "Diese Links dienen der Qualitätsprüfung öffentlicher Bereiche und der eigenen Kontoansichten. Änderungen an Inhalten erfolgen weiterhin ausschließlich über den kontrollierten Publishing-Workflow.",
  openPage: "Seite prüfen",
  groups: {
    institution: "Institution",
    work: "Methode und öffentliche Arbeit",
    programmes: "Programme und Beteiligung",
    services: "Angebote und Orientierung",
    legalAccount: "Rechtliches und Konto",
  },
  sections: {
    home: "Startseite",
    about: "Über uns",
    missionVision: "Mission und Vision",
    team: "Team",
    partners: "Partner",
    method: "Methode",
    lab: "Labor",
    projects: "Projekte",
    research: "Forschung",
    publications: "Publikationen",
    events: "Termine",
    news: "Aktuelles",
    programs: "Programme",
    academy: "Academy / Civic School",
    fellowship: "Civic Fellowship",
    membership: "Mitgliedschaft",
    contact: "Kontakt",
    products: "Digitale Produkte",
    services: "Dienstleistungen",
    search: "Suche",
    imprint: "Impressum",
    dataProtection: "Datenschutz",
    privacySettings: "Datenschutz-Einstellungen",
    dashboard: "Privates Dashboard",
    profile: "Privates Profil",
  },
  boundariesTitle: "Verbindliche Grenzen",
  boundaries: [
    "Das Control Panel verleiht keine Rechte. Jeder Arbeitsraum prüft weiterhin Sitzung, exakte Zuständigkeit und MFA selbst.",
    "Öffentliche Seiten können hier geprüft, aber nicht direkt überschrieben werden. Publishing endet weiterhin bei menschlich bestätigter Bereitschaft ohne automatische Veröffentlichung.",
    "Rechtlich oder operativ gesperrte Funktionen bleiben durch ihre bestehenden Aktivierungs-Gates geschlossen.",
  ],
};

const en: ControlPanelCopy = {
  eyebrow: "Internal operations",
  title: "Admin Control Panel",
  lede: "One central overview of public areas and the workspaces for which this account is actually authorized.",
  assignedAreas: "Authorized workspaces",
  membershipQueue: "Assigned membership applications",
  publishingScopes: "Publication scopes",
  siteOverviewTitle: "All website areas",
  siteOverviewLede: "These links support quality review of public areas and the current account’s own views. Content changes still proceed exclusively through the governed Publishing workflow.",
  openPage: "Review page",
  groups: {
    institution: "Institution",
    work: "Method and public work",
    programmes: "Programmes and participation",
    services: "Offerings and orientation",
    legalAccount: "Legal and account",
  },
  sections: {
    home: "Homepage",
    about: "About Us",
    missionVision: "Mission and Vision",
    team: "Team",
    partners: "Partners",
    method: "Method",
    lab: "Lab",
    projects: "Projects",
    research: "Research",
    publications: "Publications",
    events: "Events",
    news: "News",
    programs: "Programmes",
    academy: "Academy / Civic School",
    fellowship: "Civic Fellowship",
    membership: "Membership",
    contact: "Contact",
    products: "Digital products",
    services: "Services",
    search: "Search",
    imprint: "Legal notice",
    dataProtection: "Privacy notice",
    privacySettings: "Privacy settings",
    dashboard: "Private dashboard",
    profile: "Private profile",
  },
  boundariesTitle: "Binding boundaries",
  boundaries: [
    "The Control Panel grants no authority. Every workspace continues to verify the session, exact scope and MFA independently.",
    "Public pages can be reviewed here but not overwritten directly. Publishing still ends at human-confirmed readiness without automatic publication.",
    "Functions that remain legally or operationally gated stay closed behind their existing activation gates.",
  ],
};

const fa: ControlPanelCopy = {
  eyebrow: "مدیریت داخلی",
  title: "مرکز کنترل مدیریت",
  lede: "نمایی مرکزی از همه بخش‌های عمومی و محیط‌های کاری که این حساب واقعاً برای آن‌ها مجاز است.",
  assignedAreas: "محیط‌های کاری مجاز",
  membershipQueue: "درخواست‌های عضویت واگذارشده",
  publishingScopes: "محدوده‌های انتشار",
  siteOverviewTitle: "همه بخش‌های وب‌سایت",
  siteOverviewLede: "این پیوندها برای بررسی کیفیت بخش‌های عمومی و نماهای حساب خود کاربر هستند. تغییر محتوا همچنان فقط از مسیر کنترل‌شده انتشار انجام می‌شود.",
  openPage: "بررسی صفحه",
  groups: {
    institution: "نهاد",
    work: "روش و کار عمومی",
    programmes: "برنامه‌ها و مشارکت",
    services: "پیشنهادها و راه‌یابی",
    legalAccount: "حقوقی و حساب کاربری",
  },
  sections: {
    home: "صفحه اصلی",
    about: "درباره ما",
    missionVision: "مأموریت و چشم‌انداز",
    team: "تیم",
    partners: "همکاران",
    method: "روش",
    lab: "آزمایشگاه",
    projects: "پروژه‌ها",
    research: "پژوهش",
    publications: "انتشارات",
    events: "رویدادها",
    news: "اخبار",
    programs: "برنامه‌ها",
    academy: "آکادمی / مدرسه مدنی",
    fellowship: "همراهی مدنی",
    membership: "عضویت",
    contact: "تماس",
    products: "محصولات دیجیتال",
    services: "خدمات",
    search: "جست‌وجو",
    imprint: "اطلاعات حقوقی",
    dataProtection: "اطلاعیه حریم خصوصی",
    privacySettings: "تنظیمات حریم خصوصی",
    dashboard: "داشبورد خصوصی",
    profile: "پروفایل خصوصی",
  },
  boundariesTitle: "مرزهای الزام‌آور",
  boundaries: [
    "مرکز کنترل هیچ اختیاری اعطا نمی‌کند. هر محیط کاری همچنان نشست، محدوده دقیق اختیار و MFA را جداگانه بررسی می‌کند.",
    "صفحه‌های عمومی در اینجا قابل بررسی‌اند، اما مستقیماً بازنویسی نمی‌شوند. فرایند انتشار همچنان بدون انتشار خودکار، در مرز آمادگی تأییدشده توسط انسان متوقف می‌شود.",
    "قابلیت‌هایی که از نظر حقوقی یا عملیاتی بسته‌اند، پشت دروازه‌های فعال‌سازی موجود خود بسته می‌مانند.",
  ],
};

export const controlPanelCopy: Record<Locale, ControlPanelCopy> = { de, en, fa };
