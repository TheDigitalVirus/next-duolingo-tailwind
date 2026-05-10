import type { BoundStoreState } from "@/hooks/useBoundStore";

export type League = "Bronze" | "Prata" | "Ouro" | "Obsidiana" | "Diamante";

export interface ProfileStats {
  streak: number;
  totalXp: number;
  league: League;
  podiums: number;
}

const LEAGUE_BY_XP: Array<{ minXp: number; league: League }> = [
  { minXp: 5000, league: "Diamante" },
  { minXp: 2500, league: "Obsidiana" },
  { minXp: 1000, league: "Ouro" },
  { minXp: 500, league: "Prata" },
  { minXp: 0, league: "Bronze" },
];

const getLeagueByXp = (xp: number): League => {
  return LEAGUE_BY_XP.find((tier) => xp >= tier.minXp)?.league ?? "Bronze";
};

export const getProfileStats = (state: Pick<BoundStoreState, "xp" | "streak">): ProfileStats => {
  const totalXp = state.xp;

  return {
    streak: state.streak,
    totalXp,
    league: getLeagueByXp(totalXp),
    podiums: Math.floor(totalXp / 1000),
  };
};
