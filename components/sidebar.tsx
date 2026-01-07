"use client";

import { Loader } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

import { SidebarItem } from "./sidebar-item";

type SidebarProps = {
  className?: string;
};

export const Sidebar = ({ className }: SidebarProps) => {
  const { t } = useTranslation();
  return (
    <div
      className={cn(
        "left-0 top-0 flex h-full flex-col border-r-2 px-4 lg:fixed lg:w-[256px]",
        className
      )}
    >
      <Link href="/learn">
        <div className="flex items-center gap-x-3 pb-7 pl-4 pt-8">
          <Image alt="Mascot" src="https://d35aaqx5ub95lt.cloudfront.net/vendor/70a4be81077a8037698067f583816ff9.svg" height={30} width={128} />
          {/* <Image alt="Mascot" src="https://d35aaqx5ub95lt.cloudfront.net/vendor/0cecd302cf0bcd0f73d51768feff75fe.svg" height={40} width={40} /> */}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-y-2">
        <SidebarItem
          label={t("common.navigation.learn")}
          href="/learn"
          iconSrc="/learn.svg"
        />
        {/* <SidebarItem
          label={t("common.navigation.characters")}
          href="/characters"
          iconSrc="/characters.svg"
        />
        <SidebarItem
          label={t("common.navigation.practice-hub")}
          href="/practice"
          iconSrc="/practice.svg"
          // notification={true}
        />
        <SidebarItem
          label={t("common.navigation.leaderboard")}
          href="/leaderboard"
          iconSrc="/leaderboard.svg"
        />
        <SidebarItem
          label={t("common.navigation.quests")}
          href="/quests"
          iconSrc="/quests.svg"
        />
        <SidebarItem
          label={t("common.navigation.shop")}
          href="/shop"
          iconSrc="/shop.svg"
        />
        <SidebarItem
          label={t("common.navigation.profile")}
          href="/profile"
          // notification={true}
        />
        <SidebarItem
          label={t("common.navigation.shop")}
          href="/shop"
          iconSrc="/shop.svg"
        />
        <SidebarItem
          label={t("common.navigation.plus")}
          iconSrc="/plus.svg"
        /> */}
      </div>

      <div className="p-4">
      </div>
    </div>
  );
};