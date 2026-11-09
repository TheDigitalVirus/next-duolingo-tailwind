export type LeagueTier = {
  id: string;
  /** Nome curto ("Diamante"). */
  name: string;
  /** Cor principal do escudo. */
  color: string;
  /** Cor da face interna/brilho. */
  light: string;
  /** Cor da borda inferior (profundidade). */
  dark: string;
  /** XP total mínimo para estar nesta divisão. */
  minXp: number;
};

/** Divisões em ordem crescente. */
export const LEAGUES: LeagueTier[] = [
  { id: "bronze", name: "Bronze", color: "#CD7900", light: "#E89A3C", dark: "#A35F00", minXp: 0 },
  { id: "silver", name: "Prata", color: "#AFAFAF", light: "#D6D6D6", dark: "#8A8A8A", minXp: 500 },
  { id: "gold", name: "Ouro", color: "#FFC800", light: "#FFE066", dark: "#E5A800", minXp: 1000 },
  { id: "sapphire", name: "Safira", color: "#1CB0F6", light: "#84D8FF", dark: "#1899D6", minXp: 1750 },
  { id: "ruby", name: "Rubi", color: "#FF4B4B", light: "#FF8C8C", dark: "#D33131", minXp: 2500 },
  { id: "emerald", name: "Esmeralda", color: "#58CC02", light: "#89E219", dark: "#46A302", minXp: 3500 },
  { id: "amethyst", name: "Ametista", color: "#A560E8", light: "#CE82FF", dark: "#8447C4", minXp: 4500 },
  { id: "pearl", name: "Pérola", color: "#FF86D0", light: "#FFB8E4", dark: "#E066B0", minXp: 6000 },
  { id: "obsidian", name: "Obsidiana", color: "#4B4B4B", light: "#6F6F6F", dark: "#2E2E2E", minXp: 8000 },
  { id: "diamond", name: "Diamante", color: "#7FE3E8", light: "#B8F5F7", dark: "#4FC4CB", minXp: 10000 },
];

/** Quantos sobem e quantos caem ao fim de cada torneio semanal. */
export const PROMOTION_SLOTS = 7;
export const DEMOTION_SLOTS = 5;

export const getLeagueIndexForXp = (xp: number): number => {
  for (let i = LEAGUES.length - 1; i >= 0; i--) {
    if (xp >= LEAGUES[i].minXp) return i;
  }
  return 0;
};

export const getLeagueForXp = (xp: number): LeagueTier => LEAGUES[getLeagueIndexForXp(xp)];

export const isTopLeague = (index: number) => index === LEAGUES.length - 1;
export const isBottomLeague = (index: number) => index === 0;

export type RankZone = "promotion" | "safe" | "demotion";

export const getRankZone = (
  rank: number,
  totalPlayers: number,
  leagueIndex: number,
): RankZone => {
  if (!isTopLeague(leagueIndex) && rank <= PROMOTION_SLOTS) return "promotion";
  if (!isBottomLeague(leagueIndex) && rank > totalPlayers - DEMOTION_SLOTS) return "demotion";
  return "safe";
};
