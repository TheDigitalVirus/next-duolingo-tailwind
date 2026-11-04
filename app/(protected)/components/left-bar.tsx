"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { PanelLeftClose, PanelLeftOpen, Sparkles } from "lucide-react";
import Logo from "@/components/logo";
import Wordmark from "@/public/wordmark.svg";
import { NAV_ITEMS, type NavTab } from "./nav-items";
import { NAV_ICONS } from "./nav-icons";

type LeftBarProps = {
  selectedTab: NavTab;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
};

const itemBaseClass =
  "flex w-full items-center gap-5 rounded-xl border-2 py-2 text-[15px] font-bold uppercase tracking-wide transition-colors duration-200";
const itemActiveClass = "border-[#3F85A7] bg-[#202F36] text-[#49C0F8]";
const itemIdleClass = "border-transparent text-[#DCE6EC] hover:bg-[#202F36]";

const menuItemClass =
  "block w-full rounded-xl px-4 py-3 text-left text-sm font-bold uppercase tracking-wide text-[#DCE6EC] transition-colors hover:bg-[#202F36]";

export const LeftBar = ({ selectedTab, collapsed, onCollapsedChange }: LeftBarProps) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreContainerRef = useRef<HTMLDivElement>(null);

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

  const itemLayoutClass = collapsed ? "justify-center px-0" : "justify-start px-4";
  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <aside
      className={`fixed left-0 top-0 z-40 hidden h-screen border-r-2 border-[#37464F] bg-[#131F24] px-4 py-6 transition-[width] duration-300 lg:block ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex h-full flex-col">
        <div
          className={`mb-6 flex items-center ${
            collapsed ? "flex-col gap-4" : "justify-between pl-4"
          }`}
        >
          <Link href="/learn" aria-label="Ir para Aprender">
            {collapsed ? (
              <Logo variant="mobile" />
            ) : (
              <Image src={Wordmark} alt="duolingo" className="h-8 w-auto" priority />
            )}
          </Link>
          <button
            type="button"
            onClick={() => onCollapsedChange(!collapsed)}
            className="rounded-lg p-1.5 text-[#52656D] transition-colors hover:bg-[#202F36] hover:text-[#DCE6EC]"
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
            title={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            <ToggleIcon className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-2">
          {NAV_ITEMS.map((item) => {
            const Icon = NAV_ICONS[item.icon];

            if (item.key === "more") {
              const primaryItems = item.moreMenuItems?.slice(0, 2) ?? [];
              const secondaryItems = item.moreMenuItems?.slice(2) ?? [];

              return (
                <div key={item.key} ref={moreContainerRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setIsMoreOpen((prev) => !prev)}
                    className={`${itemBaseClass} ${itemLayoutClass} ${
                      isMoreOpen ? itemActiveClass : itemIdleClass
                    }`}
                    aria-expanded={isMoreOpen}
                    aria-haspopup="menu"
                    title={collapsed ? item.labelPt : undefined}
                  >
                    <Icon className="h-8 w-8 shrink-0" />
                    {!collapsed && <span>{item.labelPt}</span>}
                  </button>

                  {isMoreOpen && (
                    <div
                      role="menu"
                      className="absolute left-full top-0 z-50 ml-3 w-72 rounded-2xl border-2 border-[#37464F] bg-[#131F24] p-2 shadow-2xl"
                    >
                      <div className="space-y-1">
                        {primaryItems.map((menuItem) => (
                          <Link
                            key={menuItem.label}
                            href={menuItem.href ?? "#"}
                            onClick={() => setIsMoreOpen(false)}
                            className={menuItemClass}
                          >
                            {menuItem.label}
                          </Link>
                        ))}
                      </div>

                      <div className="my-2 h-0.5 w-full bg-[#37464F]" />

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
                              className={menuItemClass}
                            >
                              {menuItem.label}
                            </button>
                          ) : (
                            <Link
                              key={menuItem.label}
                              href={menuItem.href ?? "#"}
                              onClick={() => setIsMoreOpen(false)}
                              className={menuItemClass}
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

            const active = item.key === selectedTab;

            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={active ? "page" : undefined}
                title={collapsed ? item.labelPt : undefined}
                className={`${itemBaseClass} ${itemLayoutClass} ${
                  active ? itemActiveClass : itemIdleClass
                }`}
              >
                <Icon className="h-8 w-8 shrink-0" />
                {!collapsed && <span>{item.labelPt}</span>}
              </Link>
            );
          })}
        </nav>

        {!collapsed && (
          <div className="mt-auto rounded-2xl border-2 border-[#37464F] p-4">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#202F36] text-[#49C0F8]">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Turbine seu progresso</h3>
            <p className="mt-1 text-xs leading-relaxed text-[#9DB1BB]">
              Desbloqueie recursos extras e mantenha sua sequência com desafios exclusivos.
            </p>
            <Link
              href="/shop"
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl border-b-4 border-[#1899D6] bg-[#49C0F8] px-3 py-2 text-xs font-bold uppercase tracking-wide text-[#131F24] transition hover:brightness-110 active:translate-y-0.5 active:border-b-2"
            >
              Ver benefícios
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
};
