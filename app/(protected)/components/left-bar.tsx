"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/logo";
import {
  BookOpen,
  CircleUserRound,
  Crown,
  Ellipsis,
  ShieldQuestion,
  ShoppingBag,
  Type,
  type LucideIcon,
} from "lucide-react";
import { NAV_ITEMS, type NavIcon, type NavTab } from "./nav-items";

type LeftBarProps = {
  selectedTab: NavTab;
  collapsed?: boolean;
};

const ICON_BY_NAV: Record<NavIcon, LucideIcon> = {
  home: BookOpen,
  letters: Type,
  practice: ShieldQuestion,
  league: Crown,
  quests: ShieldQuestion,
  shop: ShoppingBag,
  profile: CircleUserRound,
  more: Ellipsis,
};

export const LeftBar = ({ selectedTab, collapsed }: LeftBarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const collapsedState = collapsed ?? isCollapsed;

  return (
    <aside
      className={`fixed left-0 top-0 hidden h-screen border-r border-blue-900/70 bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950 p-4 text-slate-200 transition-all duration-300 lg:block ${
        collapsedState ? "w-20" : "w-64"
      }`}
    >
      <div className="flex h-full flex-col">
        <div className={`mb-8 flex items-center ${collapsedState ? "justify-center" : "justify-between"}`}>
          <Logo variant="mobile" />
          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            className={`rounded-lg border border-white/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-300 transition-all hover:border-blue-400 hover:text-white ${
              collapsedState || collapsed !== undefined ? "hidden" : ""
            }`}
          >
            Fechar
          </button>
        </div>

        <nav className="space-y-2">
          {NAV_ITEMS.map((item) => {
            const Icon = ICON_BY_NAV[item.icon];
            const active = item.key === selectedTab;

            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-xs font-semibold uppercase tracking-[0.14em] transition-all duration-300 ${
                  collapsedState ? "justify-center" : "justify-start"
                } ${
                  active
                    ? "border-blue-400/70 bg-blue-500/15 text-blue-100 shadow-[inset_0_0_0_1px_rgba(96,165,250,0.4)]"
                    : "border-transparent text-slate-400 hover:border-white/10 hover:bg-white/5 hover:text-slate-100"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsedState && <span>{item.labelPt}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};
