import type { MembershipStatus, MembershipTier } from "../modules/membership/types";

export const germanMemberProfileCopy = {
  title: "Mein Mitgliedschaftsprofil",
  lede: "Hier sehen Sie den aktuellen Stand Ihrer Mitgliedschaft und die nächsten möglichen Statusschritte.",
  loading: "Mitgliedschaftsprofil wird geladen …",
  loginTitle: "Bitte melden Sie sich an",
  loginText: "Ihr Mitgliedschaftsprofil ist ausschließlich über Ihr verifiziertes Konto erreichbar.",
  loginAction: "Anmelden und Profil öffnen",
  unavailableTitle: "Profil derzeit nicht erreichbar",
  unavailableText: "Ihre Daten wurden nicht verändert. Bitte versuchen Sie es später erneut.",
  errorTitle: "Profil konnte nicht geladen werden",
  errorText: "Bitte laden Sie die Seite erneut oder versuchen Sie es später noch einmal.",
  notEnrolledTitle: "Noch keine Mitgliedschaft vorhanden",
  notEnrolledText: "Für Ihr Konto wurde noch keine Mitgliedschaft angelegt.",
  membershipAction: "Mitgliedschaft auswählen",
  overviewTitle: "Mitgliedschaft im Überblick",
  typeLabel: "Mitgliedschaftsform",
  currentStatusLabel: "Aktueller Status",
  registeredAtLabel: "Registriert am",
  journeyTitle: "Mitgliedschaftsverlauf",
  previousStatusLabel: "Vorheriger Status",
  statusChangeDateLabel: "Letzte Statusänderung",
  triggeringActivityLabel: "Grundlage der Statusänderung",
  triggeringActivityValue: "Durch den zuständigen Mitgliedschaftsprozess bestätigt",
  noPreviousStatus: "Noch keine vorherige Statusstufe",
  nextStatusesTitle: "Mögliche nächste Statusschritte",
  noNextStatuses: "Für den aktuellen Status sind keine weiteren Statusschritte vorgesehen.",
  privacyNotice: "Diese Ansicht zeigt ausschließlich Angaben zu Ihrer eigenen Mitgliedschaft. Interne Prüf- und Governance-Informationen werden hier nicht angezeigt.",
  profileLink: "Mein Profil",
} as const;

export const germanMembershipStatusLabels: Record<MembershipStatus, string> = {
  registered: "Registriert",
  verified: "Verifiziert",
  active: "Aktiv",
  inactive: "Inaktiv",
  paused: "Pausiert",
  "self-isolated": "Selbstisoliert",
  withdrawn: "Ausgetreten",
  retired: "Im Ruhestand",
  suspended: "Suspendiert",
  terminated: "Beendet",
};

export const germanMembershipTierLabels: Record<MembershipTier, string> = {
  basic: "Basismitgliedschaft",
  supporter: "Fördermitgliedschaft",
  volunteer: "Ehrenamtliche Mitwirkung",
  research: "Forschungsmitgliedschaft",
  institutional: "Institutionelle Mitgliedschaft",
};
