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
    name: "Bloqueio de ofensiva",
    type: "power-up",
    cost: 200,
    currency: "gems",
    description:
      "Mantenha a sua ofensiva intacta mesmo se você deixar de praticar por 24 horas.",
    stockLimit: 2,
    equipLimit: 1,
  },
  {
    id: "double-or-nothing",
    name: "Dobro ou nada",
    type: "power-up",
    cost: 5,
    currency: "lingots",
    description: "Aposte e dobre a recompensa se completar a próxima lição sem errar.",
    stockLimit: 2,
    equipLimit: 1,
  },
  {
    id: "weekend-amulet",
    name: "Amuleto de fim de semana",
    type: "power-up",
    cost: 350,
    currency: "gems",
    description: "Ganhe bônus de XP nas lições concluídas no fim de semana.",
    stockLimit: 1,
    equipLimit: 1,
  },
  {
    id: "duo-plush",
    name: "Pelúcia do Duo",
    type: "merch",
    cost: 0,
    currency: "gems",
    description: "Conheça a loja oficial com produtos e colecionáveis Duolingo.",
    externalUrl: "https://store.duolingo.com/",
  },
];
