"use client";

import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export const Promo = () => {
  const { t } = useTranslation();  
  return (
    <div className="space-y-4 rounded-xl border-2 p-4">
      <div className="space-y-2">
        <div className="flex items-center gap-x-2">
          <Image src="/unlimited.svg" alt="Pro" height={26} width={26} />
          <h3 className="text-lg font-bold">{t('common.labels.proVersion')}</h3>
        </div>
        <p className="text-muted-foreground">{t('common.messages.upgrade.description')}</p>
      </div>

      <Button variant="default" className="w-full" size="lg" asChild>
        <Link href="/shop">{t('common.actions.upgrade')}</Link>
      </Button>
    </div>
  );
};