export type ShopCurrency = "gems" | "lingots";
export type ShopItemType = "power-up" | "merch";

export interface ShopItem {
  id: string;
  name: string;
  type: ShopItemType;
  cost: number;
  currency: ShopCurrency;
  description: string;
  stockLimit?: number;
  equipLimit?: number;
  externalUrl?: string;
}

export const shopItems: ShopItem[] = [
  {
    id: "streak-freeze",
    name: "Streak Freeze",
    type: "power-up",
    cost: 200,
    currency: "gems",
    description: "Protege sua sequência por um dia sem prática.",
    stockLimit: 3,
    equipLimit: 1,
  },
  {
    id: "double-or-nothing",
    name: "Double or Nothing",
    type: "power-up",
    cost: 5,
    currency: "lingots",
    description: "Aposte seu XP para dobrar a recompensa na próxima lição.",
    stockLimit: 2,
    equipLimit: 1,
  },
  {
    id: "weekend-amulet",
    name: "Weekend Amulet",
    type: "power-up",
    cost: 350,
    currency: "gems",
    description: "Bônus de XP em lições concluídas no fim de semana.",
    stockLimit: 1,
    equipLimit: 1,
  },
  {
    id: "duo-plush",
    name: "Duo Plush",
    type: "merch",
    cost: 0,
    currency: "gems",
    description: "Conheça a loja oficial com produtos e colecionáveis Duolingo.",
    externalUrl: "https://store.duolingo.com/",
  },
];
