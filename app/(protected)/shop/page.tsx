"use client";

import type { NextPage } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useBoundStore } from "@/hooks/useBoundStore";
import { shopItems } from "@/utils/shopItems";

const ShopPage: NextPage = () => {
  const gems = useBoundStore((store) => store.gems);
  const lingots = useBoundStore((store) => store.lingots);
  const inventory = useBoundStore((store) => store.inventory);
  const purchaseItem = useBoundStore((store) => store.purchaseItem);

  const powerUps = shopItems.filter((item) => item.type === "power-up");
  const merchItems = shopItems.filter((item) => item.type === "merch");

  return (
    <main className="min-h-screen space-y-8 p-8">
      <header>
        <h1 className="text-3xl font-bold">Shop</h1>
        <p className="mt-2 text-base">Saldo: {gems} gems • {lingots} lingots</p>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Power-ups</h2>

        <div className="grid gap-4 md:grid-cols-2">
          {powerUps.map((item) => {
            const userBalance = item.currency === "gems" ? gems : lingots;
            const owned = inventory[item.id] ?? 0;
            const hasStock = item.stockLimit === undefined || owned < item.stockLimit;
            const canAfford = userBalance >= item.cost;
            const canBuy = hasStock && canAfford;

            return (
              <article key={item.id} className="rounded-xl border p-4">
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                <p className="mt-3 text-sm">Custo: {item.cost} {item.currency}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Estoque: {owned}/{item.stockLimit ?? "∞"} • Equipados máx: {item.equipLimit ?? "∞"}
                </p>
                <Button
                  className="mt-4"
                  disabled={!canBuy}
                  onClick={() => purchaseItem(item.id, item.currency, item.cost)}
                >
                  {hasStock ? "Comprar" : "Limite atingido"}
                </Button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Merch</h2>
        {merchItems.map((item) => (
          <article key={item.id} className="rounded-xl border p-4">
            <h3 className="text-lg font-semibold">{item.name}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
            <Button className="mt-4" asChild>
              <Link href={item.externalUrl ?? "#"} rel="noreferrer" target="_blank">
                Ir para loja oficial
              </Link>
            </Button>
          </article>
        ))}
      </section>
    </main>
  );
};

export default ShopPage;
