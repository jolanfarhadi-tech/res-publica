import type { Locale } from "./config";

type LinkCopy = { label: string; href: string };

export type ExperienceCopy = {
  common: {
    learnMore: string;
    viewAll: string;
    status: string;
    source: string;
    close: string;
  };
  home: {
    hero: {
      kicker: string;
      title: string;
      text: string;
      primary: LinkCopy;
      secondary: LinkCopy;
      proof: string[];
    };
    mission: { label: string; title: string; text: string };
    research: { label: string; title: string; text: string; action: string };
    projects: { label: string; title: string; text: string; action: string };
    programmes: { label: string; title: string; text: string; action: string };
    lab: { label: string; title: string; text: string; action: string };
    publications: { label: string; title: string; text: string; action: string };
    events: { label: string; title: string; text: string; action: string };
    membership: { label: string; title: string; text: string; action: string };
    partners: { label: string; title: string; text: string; action: string };
    news: { label: string; title: string; text: string; action: string };
    close: { label: string; title: string; text: string; primary: LinkCopy; secondary: LinkCopy };
  };
  lab: {
    title: string;
    lede: string;
    missionTitle: string;
    missionText: string;
    areasTitle: string;
    areas: Array<[string, string]>;
    experimentsTitle: string;
    experimentsText: string;
    methodsTitle: string;
    methodsText: string;
    governanceTitle: string;
    governanceText: string;
    ethicsTitle: string;
    ethicsText: string;
    innovationTitle: string;
    innovationText: string;
    futureTitle: string;
    futureText: string;
    notice: string;
  };
  privacy: {
    title: string;
    lede: string;
    localTitle: string;
    localText: string;
    necessary: string;
    necessaryText: string;
    functional: string;
    functionalText: string;
    analytics: string;
    analyticsText: string;
    newsletter: string;
    newsletterText: string;
    accessibilityTitle: string;
    reduceMotion: string;
    highContrast: string;
    largerText: string;
    save: string;
    saved: string;
    acceptAll: string;
    rejectOptional: string;
    preferences: string;
    bannerTitle: string;
    bannerText: string;
    legalLink: string;
  };
};

const copies: Record<Locale, ExperienceCopy> = {
  de: {
    common: {
      learnMore: "Mehr erfahren",
      viewAll: "Alle ansehen",
      status: "Status",
      source: "Quelle",
      close: "Schließen",
    },
    home: {
      hero: {
        kicker: "Res Publica e.V. · Frankfurt am Main",
        title: "Demokratische Handlungsfähigkeit braucht Orte des Zuhörens.",
        text:
          "Res Publica verbindet politische Bildung, Forschung und Dialog mit nachvollziehbarer öffentlicher Verantwortung. Erfahrungen werden nicht vereinnahmt: Sie werden gehört, sorgfältig dokumentiert und in gemeinsames Handeln übersetzt.",
        primary: { label: "Unsere Arbeit erkunden", href: "/projects" },
        secondary: { label: "Mitglied werden", href: "/membership" },
        proof: ["Politische Bildung", "Interkultureller Dialog", "Digitale Governance"],
      },
      mission: {
        label: "Auftrag",
        title: "Eine unabhängige Institution für Bildung, Dialog und demokratische Selbstorganisation.",
        text:
          "Die Satzung verpflichtet Res Publica zu Gemeinnützigkeit, parteipolitischer Unabhängigkeit und Zusammenarbeit mit Wissenschaft, Öffentlichkeit und Zivilgesellschaft.",
      },
      research: {
        label: "Forschung",
        title: "Gesellschaftliche Fragen werden prüfbar, ohne ihre Komplexität zu verlieren.",
        text:
          "Forschung verbindet wissenschaftliche Reflexion mit den Folgen digitaler Governance, technologischer Transformation und künstlicher Intelligenz für Demokratie und Gesellschaft.",
        action: "Forschung ansehen",
      },
      projects: {
        label: "Projekte",
        title: "Begrenzte Vorhaben mit sichtbarer Quelle, Reife und Verantwortung.",
        text:
          "Projekte machen die institutionelle Arbeit konkret. HARM wird als Forschungsprojekt und Methodik in Entwicklung geführt—nicht als kommerzielles Produkt.",
        action: "Projekte ansehen",
      },
      programmes: {
        label: "Programme",
        title: "Lernen wird zur dauerhaften Form demokratischer Teilhabe.",
        text:
          "RPCS / Civic School und Civic Fellowship sind dokumentierte Programme. Ihre öffentliche Darstellung unterscheidet klar zwischen Konzept, Entwicklung und operativem Angebot.",
        action: "Programme ansehen",
      },
      lab: {
        label: "Labor",
        title: "Ein Forschungs- und Innovationsraum für verantwortliche institutionelle Entwicklung.",
        text:
          "Das Lab bündelt Forschungsfragen, experimentelle Projekte, Methoden in Entwicklung, KI-Governance, digitale Ethik und institutionelle Innovation.",
        action: "Das Lab öffnen",
      },
      publications: {
        label: "Publikationen",
        title: "Mehrsprachige Veröffentlichung braucht Herkunft, Prüfung und menschliche Verantwortung.",
        text:
          "Öffentlich sichtbar wird nur, was quellengeprüft und freigegeben ist. Technische Bereitschaft ersetzt keine redaktionelle Entscheidung.",
        action: "Publikationen ansehen",
      },
      events: {
        label: "Veranstaltungen",
        title: "Dialog wird öffentlich, wenn Teilnahme, Rahmen und Verantwortung klar sind.",
        text:
          "Veranstaltungen schaffen Räume für Bildung, Diskussion und interkulturelle Verständigung. Nur bestätigte Termine werden veröffentlicht.",
        action: "Veranstaltungen ansehen",
      },
      membership: {
        label: "Mitgliedschaft",
        title: "Mitgliedschaft ist eine verantwortliche Beziehung, kein Sofortabschluss.",
        text:
          "Natürliche und juristische Personen können einen Antrag stellen. Über die Aufnahme entscheidet gemäß Satzung der Vorstand.",
        action: "Mitgliedschaft verstehen",
      },
      partners: {
        label: "Zusammenarbeit",
        title: "Kooperation wird erst sichtbar, wenn sie bestätigt und belegbar ist.",
        text:
          "Die Satzung ermöglicht Zusammenarbeit mit Wissenschaft, öffentlichen Institutionen, Stiftungen und Zivilgesellschaft. Unbestätigte Partnerschaften werden nicht dargestellt.",
        action: "Zusammenarbeit ansehen",
      },
      news: {
        label: "Aktuelles",
        title: "Neuigkeiten mit überprüfbarer Herkunft statt laufender Selbstdarstellung.",
        text:
          "Diese Fläche zeigt ausschließlich redaktionell geprüfte Mitteilungen. Solange keine freigegeben sind, bleibt der Zustand bewusst transparent.",
        action: "Aktuelles ansehen",
      },
      close: {
        label: "Beteiligung",
        title: "Demokratische Institutionen entstehen durch verlässliche Teilnahme.",
        text:
          "Informieren Sie sich über Mitgliedschaft, bringen Sie eine Frage in den Dialog ein oder nehmen Sie direkt Kontakt mit Res Publica auf.",
        primary: { label: "Mitgliedschaft", href: "/membership" },
        secondary: { label: "Kontakt", href: "/contact" },
      },
    },
    lab: {
      title: "Res Publica Lab",
      lede:
        "Forschungs- und Innovationsumgebung für demokratische Bildung, digitale Governance und verantwortliche institutionelle Entwicklung.",
      missionTitle: "Auftrag",
      missionText:
        "Das Lab verbindet wissenschaftliche und gesellschaftliche Reflexion mit erprobbaren Formen von Dialog, Bildung und demokratischer Selbstorganisation.",
      areasTitle: "Forschungsfelder",
      areas: [
        ["Digitale Governance", "Institutionen, Regeln und öffentliche Verantwortung in digitalen Räumen."],
        ["Künstliche Intelligenz", "Auswirkungen algorithmischer Systeme auf Demokratie, Bildung und Gesellschaft."],
        ["Medienkompetenz", "Kritischer Umgang mit digitalen Medien, Desinformation und Informationssystemen."],
        ["Institutionelle Innovation", "Nachvollziehbare Formen von Beteiligung, Antwortbarkeit und Reparatur."],
      ],
      experimentsTitle: "Experimentelle Projekte",
      experimentsText:
        "Experimentelle Arbeit wird nur mit sichtbarem Reifegrad und ohne Erfolgsbehauptungen veröffentlicht.",
      methodsTitle: "Methoden in Entwicklung",
      methodsText:
        "HARM und angrenzende Evidenz- und Verantwortungspraktiken werden als Forschungs- und Entwicklungsarbeit geführt.",
      governanceTitle: "KI-Governance",
      governanceText:
        "KI unterstützt begrenzte Aufgaben. Sie trifft keine automatisierten Mitgliedschafts-, Verantwortungs- oder Publikationsentscheidungen.",
      ethicsTitle: "Digitale Ethik",
      ethicsText:
        "Datensparsamkeit, Zweckbindung, menschliche Aufsicht und nachvollziehbare Grenzen bilden den Ausgangspunkt.",
      innovationTitle: "Institutionelle Innovation",
      innovationText:
        "Neue Verfahren müssen demokratische Kompetenz, gesellschaftliche Verantwortung und Selbstorganisation stärken.",
      futureTitle: "Künftige Forschung",
      futureText:
        "Künftige Vorhaben werden erst nach Quellenprüfung, Zuständigkeitsklärung und öffentlicher Freigabe benannt.",
      notice:
        "Das Lab ist eine institutionelle Forschungsumgebung. Es ist kein offenes Versprechen bereits abgeschlossener Produkte oder Partnerschaften.",
    },
    privacy: {
      title: "Datenschutz & Einstellungen",
      lede:
        "Verwalten Sie optionale Einwilligungen und barrierearme Darstellung direkt auf diesem Gerät.",
      localTitle: "Lokale Präferenzen",
      localText:
        "Diese Einstellungen werden im Browser gespeichert. Sie ändern keine Mitgliedsdaten und werden nicht an ein Profil übertragen.",
      necessary: "Notwendige Funktionen",
      necessaryText: "Erforderlich für Sprache, Sicherheit und grundlegende Seitennutzung. Immer aktiv.",
      functional: "Funktionale Einstellungen",
      functionalText: "Speichert Darstellung, Sprache und Komforteinstellungen auf diesem Gerät.",
      analytics: "Optionale Analyse",
      analyticsText: "Bleibt ohne ausdrückliche Einwilligung aus. Es ist derzeit kein Analyseanbieter aktiviert.",
      newsletter: "Newsletter-Einwilligung",
      newsletterText: "Gilt nur, wenn ein bestätigter Newsletter-Dienst angeboten wird.",
      accessibilityTitle: "Barrierefreiheit",
      reduceMotion: "Bewegung reduzieren",
      highContrast: "Kontrast erhöhen",
      largerText: "Text vergrößern",
      save: "Einstellungen speichern",
      saved: "Einstellungen wurden lokal gespeichert.",
      acceptAll: "Optionale zulassen",
      rejectOptional: "Optionale ablehnen",
      preferences: "Einstellungen",
      bannerTitle: "Ihre Entscheidung bleibt bei Ihnen.",
      bannerText:
        "Res Publica verwendet notwendige lokale Funktionen. Optionale Kategorien bleiben aus, bis Sie zustimmen.",
      legalLink: "Datenschutzerklärung lesen",
    },
  },
  en: {
    common: {
      learnMore: "Learn more",
      viewAll: "View all",
      status: "Status",
      source: "Source",
      close: "Close",
    },
    home: {
      hero: {
        kicker: "Res Publica e.V. · Frankfurt am Main",
        title: "Democratic capacity needs places that listen.",
        text:
          "Res Publica connects civic education, research and dialogue with accountable public responsibility. Experience is not appropriated: it is heard, documented with care and translated into shared action.",
        primary: { label: "Explore our work", href: "/projects" },
        secondary: { label: "Become a member", href: "/membership" },
        proof: ["Civic education", "Intercultural dialogue", "Digital governance"],
      },
      mission: {
        label: "Mandate",
        title: "An independent institution for education, dialogue and democratic self-organisation.",
        text:
          "The constitution commits Res Publica to charitable purpose, party-political independence and cooperation with science, public institutions and civil society.",
      },
      research: {
        label: "Research",
        title: "Public questions become examinable without losing their complexity.",
        text:
          "Research connects scientific reflection with the effects of digital governance, technological transformation and artificial intelligence on democracy and society.",
        action: "View research",
      },
      projects: {
        label: "Projects",
        title: "Bounded work with visible sources, maturity and responsibility.",
        text:
          "Projects make institutional work concrete. HARM is presented as a research project and developing methodology—not a commercial product.",
        action: "View projects",
      },
      programmes: {
        label: "Programmes",
        title: "Learning becomes a durable form of democratic participation.",
        text:
          "RPCS / Civic School and Civic Fellowship are documented programmes. Their public presentation distinguishes concept, development and operational availability.",
        action: "View programmes",
      },
      lab: {
        label: "Laboratory",
        title: "A research and innovation environment for responsible institutional development.",
        text:
          "The Lab brings together research questions, experimental projects, developing methods, AI governance, digital ethics and institutional innovation.",
        action: "Open the Lab",
      },
      publications: {
        label: "Publications",
        title: "Multilingual publication requires provenance, review and human responsibility.",
        text:
          "Only source-reviewed and approved work becomes public. Technical readiness never replaces an editorial decision.",
        action: "View publications",
      },
      events: {
        label: "Events",
        title: "Dialogue becomes public when participation, setting and responsibility are clear.",
        text:
          "Events create spaces for education, discussion and intercultural understanding. Only confirmed dates are published.",
        action: "View events",
      },
      membership: {
        label: "Membership",
        title: "Membership is an accountable relationship, not an instant checkout.",
        text:
          "Natural and legal persons may apply. Under the constitution, the board decides on admission.",
        action: "Understand membership",
      },
      partners: {
        label: "Cooperation",
        title: "Cooperation becomes visible only when it is confirmed and evidenced.",
        text:
          "The constitution enables work with science, public institutions, foundations and civil society. Unconfirmed partnerships are not displayed.",
        action: "View cooperation",
      },
      news: {
        label: "Latest",
        title: "Verified institutional updates instead of continuous self-promotion.",
        text:
          "This area shows editorially reviewed notices only. When none are approved, the empty state remains deliberately transparent.",
        action: "View latest news",
      },
      close: {
        label: "Participation",
        title: "Democratic institutions are built through reliable participation.",
        text:
          "Learn about membership, bring a question into dialogue or contact Res Publica directly.",
        primary: { label: "Membership", href: "/membership" },
        secondary: { label: "Contact", href: "/contact" },
      },
    },
    lab: {
      title: "Res Publica Lab",
      lede:
        "A research and innovation environment for civic education, digital governance and responsible institutional development.",
      missionTitle: "Mission",
      missionText:
        "The Lab connects scientific and social reflection with testable forms of dialogue, education and democratic self-organisation.",
      areasTitle: "Research areas",
      areas: [
        ["Digital governance", "Institutions, rules and public responsibility in digital environments."],
        ["Artificial intelligence", "Effects of algorithmic systems on democracy, education and society."],
        ["Media literacy", "Critical engagement with digital media, disinformation and information systems."],
        ["Institutional innovation", "Accountable forms of participation, answerability and repair."],
      ],
      experimentsTitle: "Experimental projects",
      experimentsText:
        "Experimental work is published only with visible maturity and without claims of success.",
      methodsTitle: "Methods under development",
      methodsText:
        "HARM and related evidence and responsibility practices remain research and development work.",
      governanceTitle: "AI governance",
      governanceText:
        "AI supports bounded tasks. It does not automate membership, responsibility or publication decisions.",
      ethicsTitle: "Digital ethics",
      ethicsText:
        "Data minimisation, purpose limitation, human oversight and explicit boundaries form the starting point.",
      innovationTitle: "Institutional innovation",
      innovationText:
        "New procedures must strengthen democratic competence, social responsibility and self-organisation.",
      futureTitle: "Future research",
      futureText:
        "Future work is named only after source review, authority clarification and public approval.",
      notice:
        "The Lab is an institutional research environment, not a promise of completed products or partnerships.",
    },
    privacy: {
      title: "Privacy & settings",
      lede:
        "Manage optional consent and accessible presentation directly on this device.",
      localTitle: "Local preferences",
      localText:
        "These settings are stored in your browser. They do not change membership data or transfer to a profile.",
      necessary: "Necessary functions",
      necessaryText: "Required for language, security and essential site use. Always active.",
      functional: "Functional settings",
      functionalText: "Stores presentation, language and convenience choices on this device.",
      analytics: "Optional analytics",
      analyticsText: "Off without explicit consent. No analytics provider is currently enabled.",
      newsletter: "Newsletter consent",
      newsletterText: "Applies only when a confirmed newsletter service is available.",
      accessibilityTitle: "Accessibility",
      reduceMotion: "Reduce motion",
      highContrast: "Increase contrast",
      largerText: "Increase text size",
      save: "Save settings",
      saved: "Settings were saved locally.",
      acceptAll: "Allow optional",
      rejectOptional: "Reject optional",
      preferences: "Preferences",
      bannerTitle: "Your decision remains yours.",
      bannerText:
        "Res Publica uses necessary local functions. Optional categories remain off until you consent.",
      legalLink: "Read the privacy policy",
    },
  },
  fa: {
    common: {
      learnMore: "بیشتر بدانید",
      viewAll: "مشاهده همه",
      status: "وضعیت",
      source: "منبع",
      close: "بستن",
    },
    home: {
      hero: {
        kicker: "انجمن Res Publica · فرانکفورت",
        title: "توان دموکراتیک به فضاهایی نیاز دارد که می‌شنوند.",
        text:
          "Res Publica آموزش مدنی، پژوهش و گفت‌وگو را با مسئولیت عمومی پاسخ‌گو پیوند می‌دهد. تجربه تصاحب نمی‌شود؛ شنیده، با دقت مستند و به کنش مشترک تبدیل می‌شود.",
        primary: { label: "کاوش فعالیت‌ها", href: "/projects" },
        secondary: { label: "درخواست عضویت", href: "/membership" },
        proof: ["آموزش مدنی", "گفت‌وگوی میان‌فرهنگی", "حکمرانی دیجیتال"],
      },
      mission: {
        label: "ماموریت",
        title: "نهادی مستقل برای آموزش، گفت‌وگو و خودسازمان‌دهی دموکراتیک.",
        text:
          "اساسنامه، Res Publica را به اهداف عام‌المنفعه، استقلال حزبی و همکاری با علم، نهادهای عمومی و جامعه مدنی متعهد می‌کند.",
      },
      research: {
        label: "پژوهش",
        title: "پرسش‌های عمومی بدون از دست دادن پیچیدگی، قابل بررسی می‌شوند.",
        text:
          "پژوهش، تأمل علمی را با پیامدهای حکمرانی دیجیتال، تحول فناوری و هوش مصنوعی برای دموکراسی و جامعه پیوند می‌دهد.",
        action: "مشاهده پژوهش",
      },
      projects: {
        label: "پروژه‌ها",
        title: "کارهای محدود با منبع، بلوغ و مسئولیت روشن.",
        text:
          "پروژه‌ها کار نهادی را عینی می‌کنند. HARM به‌عنوان پروژه پژوهشی و روش در حال توسعه معرفی می‌شود، نه محصول تجاری.",
        action: "مشاهده پروژه‌ها",
      },
      programmes: {
        label: "برنامه‌ها",
        title: "یادگیری به شکلی پایدار از مشارکت دموکراتیک تبدیل می‌شود.",
        text:
          "RPCS / مدرسه مدنی و Civic Fellowship برنامه‌های مستند هستند. معرفی عمومی آن‌ها میان مفهوم، توسعه و دسترس‌پذیری عملی تمایز می‌گذارد.",
        action: "مشاهده برنامه‌ها",
      },
      lab: {
        label: "آزمایشگاه",
        title: "محیط پژوهش و نوآوری برای توسعه نهادی مسئولانه.",
        text:
          "آزمایشگاه پرسش‌های پژوهشی، پروژه‌های تجربی، روش‌های در حال توسعه، حکمرانی هوش مصنوعی، اخلاق دیجیتال و نوآوری نهادی را گرد هم می‌آورد.",
        action: "ورود به آزمایشگاه",
      },
      publications: {
        label: "انتشارات",
        title: "انتشار چندزبانه به منشأ، بازبینی و مسئولیت انسانی نیاز دارد.",
        text:
          "تنها محتوای منبع‌سنجی و تاییدشده عمومی می‌شود. آمادگی فنی جایگزین تصمیم تحریریه نیست.",
        action: "مشاهده انتشارات",
      },
      events: {
        label: "رویدادها",
        title: "گفت‌وگو زمانی عمومی می‌شود که مشارکت، چارچوب و مسئولیت روشن باشد.",
        text:
          "رویدادها فضایی برای آموزش، بحث و تفاهم میان‌فرهنگی می‌سازند. فقط زمان‌های تاییدشده منتشر می‌شوند.",
        action: "مشاهده رویدادها",
      },
      membership: {
        label: "عضویت",
        title: "عضویت یک رابطه مسئولانه است، نه ثبت‌نام فوری.",
        text:
          "اشخاص حقیقی و حقوقی می‌توانند درخواست دهند. طبق اساسنامه، هیئت‌مدیره درباره پذیرش تصمیم می‌گیرد.",
        action: "آشنایی با عضویت",
      },
      partners: {
        label: "همکاری",
        title: "همکاری فقط هنگامی نمایش داده می‌شود که تایید و مستند شده باشد.",
        text:
          "اساسنامه همکاری با علم، نهادهای عمومی، بنیادها و جامعه مدنی را ممکن می‌کند. همکاری تاییدنشده نمایش داده نمی‌شود.",
        action: "مشاهده همکاری",
      },
      news: {
        label: "تازه‌ها",
        title: "خبر نهادی تاییدشده، نه خودنمایی پیوسته.",
        text:
          "این بخش فقط اطلاعیه‌های بازبینی‌شده را نشان می‌دهد. تا زمان تایید محتوا، وضعیت خالی شفاف می‌ماند.",
        action: "مشاهده تازه‌ها",
      },
      close: {
        label: "مشارکت",
        title: "نهادهای دموکراتیک با مشارکت قابل اتکا ساخته می‌شوند.",
        text:
          "درباره عضویت بدانید، پرسشی را وارد گفت‌وگو کنید یا مستقیماً با Res Publica تماس بگیرید.",
        primary: { label: "عضویت", href: "/membership" },
        secondary: { label: "تماس", href: "/contact" },
      },
    },
    lab: {
      title: "آزمایشگاه Res Publica",
      lede:
        "محیط پژوهش و نوآوری برای آموزش مدنی، حکمرانی دیجیتال و توسعه نهادی مسئولانه.",
      missionTitle: "ماموریت",
      missionText:
        "آزمایشگاه، تأمل علمی و اجتماعی را با شکل‌های قابل آزمون گفت‌وگو، آموزش و خودسازمان‌دهی دموکراتیک پیوند می‌دهد.",
      areasTitle: "حوزه‌های پژوهش",
      areas: [
        ["حکمرانی دیجیتال", "نهادها، قواعد و مسئولیت عمومی در محیط‌های دیجیتال."],
        ["هوش مصنوعی", "پیامدهای سامانه‌های الگوریتمی برای دموکراسی، آموزش و جامعه."],
        ["سواد رسانه‌ای", "مواجهه انتقادی با رسانه دیجیتال، اطلاعات نادرست و سامانه‌های اطلاعاتی."],
        ["نوآوری نهادی", "شکل‌های پاسخ‌گوی مشارکت، جواب‌گویی و ترمیم."],
      ],
      experimentsTitle: "پروژه‌های تجربی",
      experimentsText:
        "کار تجربی فقط با سطح بلوغ روشن و بدون ادعای موفقیت منتشر می‌شود.",
      methodsTitle: "روش‌های در حال توسعه",
      methodsText:
        "HARM و شیوه‌های مرتبط با شواهد و مسئولیت همچنان کار پژوهش و توسعه‌اند.",
      governanceTitle: "حکمرانی هوش مصنوعی",
      governanceText:
        "هوش مصنوعی از وظایف محدود پشتیبانی می‌کند و تصمیم عضویت، مسئولیت یا انتشار را خودکار نمی‌کند.",
      ethicsTitle: "اخلاق دیجیتال",
      ethicsText:
        "کمینه‌سازی داده، محدودیت هدف، نظارت انسانی و مرزهای روشن نقطه آغاز هستند.",
      innovationTitle: "نوآوری نهادی",
      innovationText:
        "فرایندهای تازه باید توان دموکراتیک، مسئولیت اجتماعی و خودسازمان‌دهی را تقویت کنند.",
      futureTitle: "پژوهش آینده",
      futureText:
        "کار آینده فقط پس از بررسی منبع، روشن شدن اختیار و تایید عمومی نام‌گذاری می‌شود.",
      notice:
        "آزمایشگاه یک محیط پژوهشی نهادی است، نه وعده محصولات یا همکاری‌های تکمیل‌شده.",
    },
    privacy: {
      title: "حریم خصوصی و تنظیمات",
      lede:
        "رضایت‌های اختیاری و نمایش دسترس‌پذیر را مستقیماً روی این دستگاه مدیریت کنید.",
      localTitle: "ترجیحات محلی",
      localText:
        "این تنظیمات در مرورگر ذخیره می‌شوند و داده عضویت را تغییر نمی‌دهند یا به پروفایل منتقل نمی‌شوند.",
      necessary: "عملکردهای ضروری",
      necessaryText: "برای زبان، امنیت و استفاده پایه لازم است و همیشه فعال می‌ماند.",
      functional: "تنظیمات کاربردی",
      functionalText: "گزینه‌های نمایش، زبان و راحتی را روی این دستگاه ذخیره می‌کند.",
      analytics: "تحلیل اختیاری",
      analyticsText: "بدون رضایت روشن خاموش است. اکنون هیچ ارائه‌دهنده تحلیلی فعال نیست.",
      newsletter: "رضایت خبرنامه",
      newsletterText: "فقط زمانی کاربرد دارد که سرویس تاییدشده خبرنامه در دسترس باشد.",
      accessibilityTitle: "دسترس‌پذیری",
      reduceMotion: "کاهش حرکت",
      highContrast: "افزایش کنتراست",
      largerText: "بزرگ‌کردن متن",
      save: "ذخیره تنظیمات",
      saved: "تنظیمات به‌صورت محلی ذخیره شد.",
      acceptAll: "اجازه گزینه‌های اختیاری",
      rejectOptional: "رد گزینه‌های اختیاری",
      preferences: "تنظیمات",
      bannerTitle: "تصمیم شما در اختیار خودتان می‌ماند.",
      bannerText:
        "Res Publica از عملکردهای محلی ضروری استفاده می‌کند. گزینه‌های اختیاری تا رضایت شما خاموش می‌مانند.",
      legalLink: "مطالعه سیاست حریم خصوصی",
    },
  },
};

export function getExperienceCopy(locale: Locale): ExperienceCopy {
  return copies[locale];
}
