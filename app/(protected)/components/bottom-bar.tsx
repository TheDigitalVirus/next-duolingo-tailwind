"use client";

import Link from "next/link";
import { NAV_ITEMS, type NavTab } from "./nav-items";
import { NAV_ICONS } from "./nav-icons";

type BottomBarProps = {
  selectedTab: NavTab;
};

const PRIMARY_ITEMS = NAV_ITEMS.filter((item) => item.isPrimary);

export const BottomBar = ({ selectedTab }: BottomBarProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-[#37464F] bg-[#131F24] lg:hidden">
      <ul className="flex h-[72px] items-center justify-around px-2">
        {PRIMARY_ITEMS.map((item) => {
          const Icon = NAV_ICONS[item.icon];
          const active = item.key === selectedTab;

          return (
            <li key={item.key} className="flex flex-1 justify-center">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-xl border-2 p-1.5 transition-colors ${
                  active
                    ? "border-[#3F85A7] bg-[#202F36]"
                    : "border-transparent hover:bg-[#202F36]"
                }`}
              >
                <Icon className="h-8 w-8" />
                <span className="sr-only">{item.labelPt}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
