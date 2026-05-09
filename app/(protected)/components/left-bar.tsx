"use client";

import Link from "next/link";
import { NAV_ITEMS, type NavTab } from "./nav-items";

type LeftBarProps = {
  selectedTab: NavTab;
};

export const LeftBar = ({ selectedTab }: LeftBarProps) => {
  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r bg-white p-6 lg:block">
      <nav className="mt-12 space-y-2">
        {NAV_ITEMS.map((item) => {
          const active = item.key === selectedTab;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`block rounded-xl px-4 py-3 font-semibold transition ${
                active ? "bg-emerald-100 text-emerald-700" : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
