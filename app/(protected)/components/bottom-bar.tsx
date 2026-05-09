"use client";

import Link from "next/link";
import { NAV_ITEMS, type NavTab } from "./nav-items";

type BottomBarProps = {
  selectedTab: NavTab;
};

export const BottomBar = ({ selectedTab }: BottomBarProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-6 border-t bg-white lg:hidden">
      {NAV_ITEMS.map((item) => {
        const active = item.key === selectedTab;
        return (
          <Link
            key={item.key}
            href={item.href}
            className={`px-1 py-3 text-center text-xs font-semibold ${
              active ? "text-emerald-700" : "text-zinc-500"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};
