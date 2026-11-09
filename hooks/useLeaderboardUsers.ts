"use client";

import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useBoundStore } from "@/hooks/useBoundStore";
import { LEAGUES } from "@/utils/leagues";
import {
  buildStandings,
  getOpponents,
  getWeekElapsed,
  getWeekKey,
  type TournamentPlayer,
} from "@/utils/tournament";

export type LeaderboardUser = TournamentPlayer & { avatarUrl: string | null };

/**
 * Ranking do torneio da semana atual. O XP dos oponentes avança com a
 * semana; o do usuário é o XP real ganho na semana.
 *
 * `standings` fica null até montar no cliente (o XP depende da hora atual
 * e divergiria do HTML do servidor).
 */
export const useLeaderboardUsers = () => {
  const { data: session } = useSession();
  const leagueIndex = useBoundStore((x) => x.leagueIndex);
  const xpThisWeek = useBoundStore((x) => x.xpThisWeek());
  const statusEmoji = useBoundStore((x) => x.statusEmoji);
  const streak = useBoundStore((x) => x.streak);

  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const interval = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const weekKey = getWeekKey();

  const standings = useMemo<LeaderboardUser[] | null>(() => {
    if (now === null) return null;

    const opponents = getOpponents(weekKey, leagueIndex, getWeekElapsed(weekKey, dayjs(now)));
    const me: TournamentPlayer = {
      id: session?.user?.id ?? "me",
      name: session?.user?.name ?? "Você",
      xp: xpThisWeek,
      status: statusEmoji,
      streakLabel: streak > 0 ? `${streak} ${streak === 1 ? "dia" : "dias"}` : null,
      isCurrentUser: true,
    };

    return buildStandings(opponents, me).map((player) => ({
      ...player,
      avatarUrl: player.isCurrentUser ? session?.user?.image ?? null : null,
    }));
  }, [now, weekKey, leagueIndex, xpThisWeek, statusEmoji, streak, session?.user]);

  return {
    standings,
    leagueIndex,
    league: LEAGUES[leagueIndex] ?? LEAGUES[0],
    weekKey,
  };
};
