"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

type SidebarItemProps = {
  label: string;
  href?: string;
  iconSrc?: string;
  notification?: boolean;
  menu?: boolean;
};

export function SidebarItem({
  label,
  href,
  menu,
  iconSrc,
  notification = false,
}: SidebarItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Button
      asChild
      variant={isActive ? "outline" : "ghost"}
      className="h-12 w-full justify-start px-3"
    >
      {!menu && href ? (
        <Link href={href} className="flex items-center gap-3">
          <div className="relative shrink-0">
            {iconSrc ? (
              <Image
                src={iconSrc}
                alt={label}
                width={32}
                height={32}
                className="rounded"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white">
                {label.charAt(0)}
              </div>
            )}

            {notification && (
              <span className="absolute top-0 -right-1 h-3 w-3 rounded-full border-2 border-background bg-red-500" />
            )}
          </div>

          <span className="hidden text-sm font-semibold uppercase tracking-wide md:inline">
            {label}
          </span>
        </Link>) : (
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            {iconSrc ? (
              <Image
                src={iconSrc}
                alt={label}
                width={32}
                height={32}
                className="rounded"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white">
                {label.charAt(0)}
              </div>
            )}

            {notification && (
              <span className="absolute top-0 -right-1 h-3 w-3 rounded-full border-2 border-background bg-red-500" />
            )}
          </div>

          <span className="hidden text-sm font-semibold uppercase tracking-wide md:inline">
            {label}
          </span>
        </div>
      )}
    </Button>
  );
}
