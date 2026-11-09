"use client";

import Image from "next/image";
import Link from "next/link";
import type { ComponentType } from "react";
import { toast } from "sonner";
import { Dices, ExternalLink, Snowflake, Sparkles, Zap, type LucideProps } from "lucide-react";
import { ProBadge } from "@/components/ProBadge";
import { GemSvg } from "@/components/Svgs";
import { useBoundStore } from "@/hooks/useBoundStore";
import { shopItems, type ShopItem } from "@/utils/shopItems";
import ProMascot from "@/public/duo-pro.svg";

const ITEM_ART: Record<string, { Icon: ComponentType<LucideProps>; bg: string; color: string }> = {
  "streak-freeze": { Icon: Snowflake, bg: "bg-[#84D8FF]", color: "text-[#1899D6]" },
  "double-or-nothing": { Icon: Dices, bg: "bg-[#FFC800]", color: "text-[#B87C00]" },
  "weekend-amulet": { Icon: Sparkles, bg: "bg-[#CE82FF]", color: "text-white" },
};
const DEFAULT_ART = { Icon: Zap, bg: "bg-[#37464F]", color: "text-[#DCE6EC]" };

const ItemArt = ({ id }: { id: string }) => {
  const { Icon, bg, color } = ITEM_ART[id] ?? DEFAULT_ART;
  return (
    <div className={`flex h-20 w-20 shrink-0 rotate-6 items-center justify-center rounded-3xl ${bg}`}>
      <Icon className={`h-10 w-10 -rotate-6 ${color}`} strokeWidth={2.5} />
    </div>
  );
};

const ProBanner = () => (
  <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0E4D7A] via-[#1F2A6E] to-[#4A2477] p-6">
    <ProBadge className="absolute right-5 top-5" />
    <div className="flex items-center gap-4">
      <Image src={ProMascot} alt="" className="h-28 w-auto shrink-0" />
      <div>
        <h1 className="text-xl font-bold leading-snug text-white">
          Assine agora mesmo para curtir todos os benefícios do Pro!
        </h1>
        <p className="mt-1 font-bold text-white/90">
          Teste grátis por <span className="text-[#58CC02]">7 dias</span>.
        </p>
      </div>
    </div>
    <button
      type="button"
      onClick={() => toast("As assinaturas chegam em breve!")}
      className="mt-6 w-full rounded-2xl border-b-4 border-[#C9C1E8] bg-white py-3.5 text-sm font-bold uppercase tracking-wide text-[#1F2A6E] transition hover:brightness-95 active:translate-y-0.5 active:border-b-2"
    >
      Obter Pro
    </button>
  </section>
);

const PowerUpRow = ({ item }: { item: ShopItem }) => {
  const gems = useBoundStore((x) => x.gems);
  const lingots = useBoundStore((x) => x.lingots);
  const owned = useBoundStore((x) => x.inventory[item.id] ?? 0);
  const purchaseItem = useBoundStore((x) => x.purchaseItem);

  const balance = item.currency === "gems" ? gems : lingots;
  const soldOut = item.stockLimit !== undefined && owned >= item.stockLimit;
  const canAfford = balance >= item.cost;

  const buy = () => {
    if (purchaseItem(item.id, item.currency, item.cost)) {
      toast.success(`${item.name} comprado!`);
    }
  };

  return (
    <li className="flex gap-5 border-b-2 border-[#37464F] py-6 last:border-b-0">
      <ItemArt id={item.id} />
      <div className="min-w-0 flex-1">
        <h3 className="text-lg font-bold text-white">{item.name}</h3>
        {item.stockLimit !== undefined && (
          <span className="mt-2 inline-block rounded-lg bg-[#37464F] px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-[#9DB1BB]">
            {owned} / {item.stockLimit} disponíveis
          </span>
        )}
        <p className="mt-2 text-[15px] leading-6 text-[#DCE6EC]">{item.description}</p>
      </div>
      <button
        type="button"
        onClick={buy}
        disabled={soldOut || !canAfford}
        title={soldOut ? "Você já tem o máximo deste item" : !canAfford ? "Saldo insuficiente" : undefined}
        className="flex h-fit shrink-0 items-center gap-2 self-start rounded-2xl border-2 border-b-4 border-[#37464F] px-4 py-2.5 text-sm font-bold uppercase tracking-wide transition enabled:hover:bg-[#202F36] enabled:active:translate-y-0.5 enabled:active:border-b-2 disabled:opacity-50"
      >
        {soldOut ? (
          <span className="text-[#52656D]">No limite</span>
        ) : (
          <>
            <span className="text-[#DCE6EC]">Por:</span>
            {item.currency === "gems" ? (
              <span className="inline-flex scale-75">
                <GemSvg />
              </span>
            ) : (
              <span className="text-[#FF4B4B]">lingots</span>
            )}
            <span className={canAfford ? "text-[#FF4B4B]" : "text-[#52656D]"}>{item.cost}</span>
          </>
        )}
      </button>
    </li>
  );
};

const SectionTitle = ({ children }: { children: string }) => (
  <h2 className="mt-10 border-b-2 border-[#37464F] pb-4 text-2xl font-bold text-white">
    {children}
  </h2>
);

const ShopPage = () => {
  const powerUps = shopItems.filter((item) => item.type === "power-up");
  const merchItems = shopItems.filter((item) => item.type === "merch");

  return (
    <main className="pb-32 pt-2 lg:pt-6">
      <ProBanner />

      <SectionTitle>Superpoderes</SectionTitle>
      <ul>
        {powerUps.map((item) => (
          <PowerUpRow key={item.id} item={item} />
        ))}
      </ul>

      {merchItems.length > 0 && (
        <>
          <SectionTitle>Produtos</SectionTitle>
          <ul>
            {merchItems.map((item) => (
              <li key={item.id} className="flex items-center gap-5 py-6">
                <ItemArt id={item.id} />
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold text-white">{item.name}</h3>
                  <p className="mt-2 text-[15px] leading-6 text-[#DCE6EC]">{item.description}</p>
                </div>
                <Link
                  href={item.externalUrl ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="flex shrink-0 items-center gap-2 rounded-2xl border-2 border-b-4 border-[#37464F] px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-[#49C0F8] transition hover:bg-[#202F36]"
                >
                  Ver loja
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
};

export default ShopPage;
