export type NavTab = "learn" | "characters" | "leaderboard" | "quests" | "shop" | "profile";

export type NavItem = {
  key: NavTab;
  label: string;
  href: `/${NavTab}`;
};

export const NAV_ITEMS: NavItem[] = [
  { key: "learn", label: "Learn", href: "/learn" },
  { key: "characters", label: "Characters", href: "/characters" },
  { key: "leaderboard", label: "Leaderboard", href: "/leaderboard" },
  { key: "quests", label: "Quests", href: "/quests" },
  { key: "shop", label: "Shop", href: "/shop" },
  { key: "profile", label: "Profile", href: "/profile" },
];

export const getSelectedTabFromPathname = (pathname: string): NavTab => {
  const segment = pathname.split("/").filter(Boolean)[0];

  if (!segment) {
    return "learn";
  }

  return NAV_ITEMS.some((item) => item.key === segment)
    ? (segment as NavTab)
    : "learn";
};
