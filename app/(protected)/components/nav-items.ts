export type NavTab =
  | "learn"
  | "characters"
  | "practice"
  | "leaderboard"
  | "quests"
  | "shop"
  | "profile";

export type NavIcon =
  | "home"
  | "letters"
  | "sounds"
  | "practice"
  | "league"
  | "quests"
  | "shop"
  | "profile"
  | "more";

export type MoreMenuItem = {
  label: string;
  href?: string;
  action?: "signOut";
};

export type NavItem = {
  key: NavTab | "more";
  label: string;
  labelPt: string;
  href: string;
  icon: NavIcon;
  activeIcon?: NavIcon;
  isPrimary: boolean;
  moreMenuItems?: MoreMenuItem[];
};

const MORE_MENU_ITEMS: MoreMenuItem[] = [
  { label: "Duolingo English Test", href: "/duolingo-english-test" },
  { label: "Escolas", href: "/schools" },
  { label: "Configurações", href: "/settings" },
  { label: "Ajuda", href: "/help" },
  { label: "Sair", action: "signOut" },
];

export const NAV_ITEMS: NavItem[] = [
  {
    key: "learn",
    label: "Learn",
    labelPt: "APRENDER",
    href: "/learn",
    icon: "home",
    activeIcon: "home",
    isPrimary: true,
  },
  {
    key: "characters",
    label: "Sounds",
    labelPt: "SONS",
    href: "/characters",
    icon: "sounds",
    activeIcon: "sounds",
    isPrimary: true,
  },
  {
    key: "practice",
    label: "Practice",
    labelPt: "PRATICAR",
    href: "/practice",
    icon: "practice",
    activeIcon: "practice",
    isPrimary: true,
  },
  {
    key: "leaderboard",
    label: "Leaderboard",
    labelPt: "LIGAS",
    href: "/leaderboard",
    icon: "league",
    activeIcon: "league",
    isPrimary: true,
  },
  {
    key: "quests",
    label: "Quests",
    labelPt: "MISSÕES",
    href: "/quests",
    icon: "quests",
    activeIcon: "quests",
    isPrimary: true,
  },
  {
    key: "shop",
    label: "Shop",
    labelPt: "LOJA",
    href: "/shop",
    icon: "shop",
    activeIcon: "shop",
    isPrimary: true,
  },
  {
    key: "profile",
    label: "Profile",
    labelPt: "PERFIL",
    href: "/profile",
    icon: "profile",
    activeIcon: "profile",
    isPrimary: true,
  },
  {
    key: "more",
    label: "More",
    labelPt: "MAIS",
    href: "/more",
    icon: "more",
    activeIcon: "more",
    isPrimary: false,
    moreMenuItems: MORE_MENU_ITEMS,
  },
];

/**
 * Páginas principais do app (as da navegação): recebem fundo escuro,
 * TopBar mobile e RightBar. Lição, onboarding etc. ficam de fora.
 */
export const isMainAppRoute = (pathname: string): boolean =>
  NAV_ITEMS.some(
    (item) =>
      item.key !== "more" && (pathname === item.href || pathname.startsWith(`${item.href}/`)),
  );

export const getSelectedTabFromPathname = (pathname: string): NavTab => {
  const segment = pathname.split("/").filter(Boolean)[0];

  if (!segment) {
    return "learn";
  }

  return NAV_ITEMS.some(
    (item): item is NavItem & { key: NavTab } => item.key !== "more" && item.key === segment,
  )
    ? (segment as NavTab)
    : "learn";
};
