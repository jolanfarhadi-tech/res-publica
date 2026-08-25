export const controlPanelGroups = [
  {
    id: "institution",
    sections: [
      { id: "home", path: "" },
      { id: "about", path: "/about" },
      { id: "missionVision", path: "/mission-vision" },
      { id: "team", path: "/team" },
      { id: "partners", path: "/partners" },
    ],
  },
  {
    id: "work",
    sections: [
      { id: "method", path: "/method" },
      { id: "lab", path: "/lab" },
      { id: "projects", path: "/projects" },
      { id: "research", path: "/research" },
      { id: "publications", path: "/publications" },
      { id: "events", path: "/events" },
      { id: "news", path: "/news" },
    ],
  },
  {
    id: "programmes",
    sections: [
      { id: "programs", path: "/programs" },
      { id: "academy", path: "/academy" },
      { id: "fellowship", path: "/fellowship" },
      { id: "membership", path: "/membership" },
      { id: "contact", path: "/contact" },
    ],
  },
  {
    id: "services",
    sections: [
      { id: "products", path: "/products" },
      { id: "services", path: "/services" },
      { id: "search", path: "/search" },
    ],
  },
  {
    id: "legalAccount",
    sections: [
      { id: "imprint", path: "/impressum" },
      { id: "dataProtection", path: "/datenschutz" },
      { id: "privacySettings", path: "/privacy" },
      { id: "dashboard", path: "/dashboard" },
      { id: "profile", path: "/profile" },
    ],
  },
] as const;

export type ControlPanelGroupId = (typeof controlPanelGroups)[number]["id"];
export type ControlPanelSectionId =
  (typeof controlPanelGroups)[number]["sections"][number]["id"];
