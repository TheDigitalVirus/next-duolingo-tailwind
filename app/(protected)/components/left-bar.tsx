"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import Logo from "@/components/logo";
import {
  BookOpen,
  CircleUserRound,
  Crown,
  Ellipsis,
  ShieldQuestion,
  ShoppingBag,
  Sparkles,
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
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreContainerRef = useRef<HTMLDivElement>(null);
  const collapsedState = collapsed ?? isCollapsed;

  useEffect(() => {
    if (!isMoreOpen) return;

    const onClickOutside = (event: MouseEvent) => {
      if (!moreContainerRef.current?.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMoreOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);

    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [isMoreOpen]);

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

            if (item.key === "more") {
              const primaryItems = item.moreMenuItems?.slice(0, 2) ?? [];
              const secondaryItems = item.moreMenuItems?.slice(2) ?? [];

              return (
                <div key={item.key} ref={moreContainerRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setIsMoreOpen((prev) => !prev)}
                    className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-xs font-semibold uppercase tracking-[0.14em] transition-all duration-300 ${
                      collapsedState ? "justify-center" : "justify-start"
                    } ${
                      isMoreOpen
                        ? "border-blue-400/70 bg-blue-500/15 text-blue-100 shadow-[inset_0_0_0_1px_rgba(96,165,250,0.4)]"
                        : "border-transparent text-slate-400 hover:border-white/10 hover:bg-white/5 hover:text-slate-100"
                    }`}
                    aria-expanded={isMoreOpen}
                    aria-haspopup="menu"
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!collapsedState && <span>{item.labelPt}</span>}
                  </button>

                  {isMoreOpen && !collapsedState && (
                    <div
                      role="menu"
                      className="absolute left-full top-0 z-30 ml-3 w-72 rounded-2xl border border-blue-900/60 bg-slate-950/95 p-2 shadow-2xl backdrop-blur"
                    >
                      <div className="space-y-1">
                        {primaryItems.map((menuItem) => (
                          <Link
                            key={menuItem.label}
                            href={menuItem.href ?? "#"}
                            onClick={() => setIsMoreOpen(false)}
                            className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-100 transition-colors hover:bg-white/10"
                          >
                            {menuItem.label}
                          </Link>
                        ))}
                      </div>

                      <div className="my-2 h-px w-full bg-white/10" />

                      <div className="space-y-1">
                        {secondaryItems.map((menuItem) =>
                          menuItem.action === "signOut" ? (
                            <button
                              key={menuItem.label}
                              type="button"
                              onClick={async () => {
                                setIsMoreOpen(false);
                                await signOut();
                              }}
                              className="block w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-100 transition-colors hover:bg-white/10"
                            >
                              {menuItem.label}
                            </button>
                          ) : (
                            <Link
                              key={menuItem.label}
                              href={menuItem.href ?? "#"}
                              onClick={() => setIsMoreOpen(false)}
                              className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-100 transition-colors hover:bg-white/10"
                            >
                              {menuItem.label}
                            </Link>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            }

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

        {!collapsedState && (
          <div className="mt-auto rounded-2xl border border-blue-400/40 bg-gradient-to-b from-blue-500/20 via-blue-500/10 to-transparent p-4 shadow-[inset_0_0_0_1px_rgba(96,165,250,0.2)]">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-400/20 text-blue-100">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Turbine seu progresso</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-300">
              Desbloqueie recursos extras e mantenha sua sequência com desafios exclusivos.
            </p>
            <Link
              href="/shop"
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-blue-400 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-950 transition-colors hover:bg-blue-300"
            >
              Ver benefícios
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
};
