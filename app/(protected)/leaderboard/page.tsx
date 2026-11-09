"use client";

import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { LeagueBadge } from "@/components/LeagueBadge";
import { FirstPlaceSvg, SecondPlaceSvg, ThirdPlaceSvg } from "@/components/Svgs";
import { TournamentResults } from "@/components/TournamentResults";
import { UserAvatar } from "@/components/UserAvatar";
import { LESSONS_TO_UNLOCK_LEAGUES, useBoundStore } from "@/hooks/useBoundStore";
import { useLeaderboardUsers, type LeaderboardUser } from "@/hooks/useLeaderboardUsers";
import { formatTimeLeft } from "@/utils/daily-quests";
import {
  DEMOTION_SLOTS,
  getRankZone,
  isBottomLeague,
  isTopLeague,
  LEAGUES,
  PROMOTION_SLOTS,
  type RankZone,
} from "@/utils/leagues";
import { getDemoTournamentResult, getWeekEnd } from "@/utils/tournament";

const MEDALS = [FirstPlaceSvg, SecondPlaceSvg, ThirdPlaceSvg];

const RANK_COLOR: Record<RankZone, string> = {
  promotion: "text-[#58CC02]",
  safe: "text-[#DCE6EC]",
  demotion: "text-[#FF4B4B]",
};

/** Divisões vizinhas: anteriores coloridas, atual em destaque, próximas trancadas. */
const LeagueStrip = ({ leagueIndex }: { leagueIndex: number }) => {
  const last = LEAGUES.length - 1;
  const start = Math.max(0, Math.min(leagueIndex - 2, last - 4));
  const visible = LEAGUES.slice(start, start + 5);

  return (
    <div className="flex items-center justify-center gap-4">
      {visible.map((league, i) => {
        const index = start + i;
        const current = index === leagueIndex;
        return (
          <LeagueBadge
            key={league.id}
            league={league}
            size={current ? 80 : 44}
            locked={index > leagueIndex}
            showIcon={current || index > leagueIndex}
          />
        );
      })}
    </div>
  );
};

const ZoneDivider = ({ zone }: { zone: "promotion" | "demotion" }) => {
  const promotion = zone === "promotion";
  const Arrow = promotion ? ArrowBigUp : ArrowBigDown;
  const color = promotion ? "text-[#58CC02] fill-[#58CC02]" : "text-[#FF4B4B] fill-[#FF4B4B]";

  return (
    <li className="flex items-center justify-center gap-6 py-3" role="separator">
      <Arrow className={`h-6 w-6 ${color}`} />
      <span className={`text-sm font-bold uppercase tracking-wide ${color.split(" ")[0]}`}>
        {promotion ? "Zona de promoção" : "Zona de rebaixamento"}
      </span>
      <Arrow className={`h-6 w-6 ${color}`} />
    </li>
  );
};

const PlayerRow = ({ player, rank, zone }: { player: LeaderboardUser; rank: number; zone: RankZone }) => {
  const Medal = MEDALS[rank - 1];
  const highlight = player.isCurrentUser;

  return (
    <li
      className={`flex items-center gap-4 rounded-2xl px-4 py-3 ${
        highlight ? "bg-[#202F36]" : "hover:bg-[#202F36]/50"
      }`}
      aria-current={highlight ? "true" : undefined}
    >
      <span
        className={`flex w-10 shrink-0 justify-center text-lg font-bold ${
          highlight ? "text-[#4FD1C5]" : RANK_COLOR[zone]
        }`}
      >
        {Medal ? <Medal /> : rank}
      </span>
      <UserAvatar
        name={player.name}
        imageUrl={player.avatarUrl}
        status={player.status}
        size={48}
        online={highlight}
      />
      <div className="min-w-0 flex-1">
        <p className={`truncate font-bold ${highlight ? "text-[#4FD1C5]" : "text-white"}`}>
          {player.name}
        </p>
        {player.streakLabel && (
          <p className="text-sm font-bold text-[#FF9600]">🔥 {player.streakLabel}</p>
        )}
      </div>
      <span className={`shrink-0 ${highlight ? "text-[#4FD1C5]" : "text-[#DCE6EC]"}`}>
        {player.xp} XP
      </span>
    </li>
  );
};

const LockedLeagues = ({ lessonsMissing }: { lessonsMissing: number }) => (
  <section className="mt-6 flex flex-col items-center rounded-2xl border-2 border-[#37464F] px-6 py-10 text-center">
    <LeagueBadge league={LEAGUES[0]} size={96} locked />
    <h1 className="mt-6 text-2xl font-bold text-white">Desbloqueie as ligas!</h1>
    <p className="mt-3 max-w-sm text-[15px] leading-6 text-[#DCE6EC]">
      Complete mais {lessonsMissing} {lessonsMissing === 1 ? "lição" : "lições"} para começar a
      competir com outros alunos.
    </p>
    <Link
      href="/learn"
      className="mt-8 w-full max-w-xs rounded-2xl border-b-4 border-[#1899D6] bg-[#49C0F8] py-3.5 text-sm font-bold uppercase tracking-wide text-[#131F24] transition hover:brightness-110 active:translate-y-0.5 active:border-b-2"
    >
      Começar uma lição
    </Link>
  </section>
);

/** Pré-visualização dos modais de fim de torneio (só em desenvolvimento). */
const useDemoTournament = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const kind = process.env.NODE_ENV !== "production" ? searchParams.get("torneio") : null;
  return {
    demoResult: kind ? getDemoTournamentResult(kind) : null,
    closeDemo: () => router.replace("/leaderboard"),
  };
};

const LeaderboardPage = () => {
  const lessonsCompleted = useBoundStore((x) => x.lessonsCompleted);
  const { standings, league, leagueIndex, weekKey } = useLeaderboardUsers();
  const { demoResult, closeDemo } = useDemoTournament();

  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  useEffect(() => {
    const update = () => setTimeLeft(formatTimeLeft(getWeekEnd(weekKey)));
    update();
    const interval = window.setInterval(update, 60_000);
    return () => window.clearInterval(interval);
  }, [weekKey]);

  const locked = lessonsCompleted < LESSONS_TO_UNLOCK_LEAGUES;
  const total = standings?.length ?? 0;
  const firstDemotionRank = total - DEMOTION_SLOTS + 1;

  return (
    <main className="pb-32 pt-2 lg:pt-6">
      {locked ? (
        <LockedLeagues lessonsMissing={LESSONS_TO_UNLOCK_LEAGUES - lessonsCompleted} />
      ) : (
        <>
          <header className="sticky top-[58px] z-10 border-b-2 border-[#37464F] bg-[#131F24] pb-5 pt-2 text-center lg:top-0 lg:pt-6">
            <LeagueStrip leagueIndex={leagueIndex} />
            <h1 className="mt-4 text-2xl font-bold text-white">Divisão {league.name}</h1>
            <p className="mt-2 text-sm text-[#DCE6EC]">
              {isTopLeague(leagueIndex)
                ? "Você está na divisão mais alta!"
                : `Os ${PROMOTION_SLOTS} primeiros sobem de divisão`}
            </p>
            {timeLeft && <p className="mt-1 font-bold text-[#FFC800]">{timeLeft}</p>}
          </header>

          {standings === null ? (
            <p className="py-10 text-center text-[#52656D]">Carregando ranking...</p>
          ) : (
            <ol className="mt-2 flex flex-col gap-1">
              {standings.map((player, i) => {
                const rank = i + 1;
                return (
                  <Fragment key={player.id}>
                    {rank === firstDemotionRank && !isBottomLeague(leagueIndex) && (
                      <ZoneDivider zone="demotion" />
                    )}
                    <PlayerRow
                      player={player}
                      rank={rank}
                      zone={getRankZone(rank, total, leagueIndex)}
                    />
                    {rank === PROMOTION_SLOTS && !isTopLeague(leagueIndex) && (
                      <ZoneDivider zone="promotion" />
                    )}
                  </Fragment>
                );
              })}
            </ol>
          )}
        </>
      )}

      {demoResult && (
        <TournamentResults result={demoResult} onClaimReward={() => {}} onDone={closeDemo} />
      )}
    </main>
  );
};

export default LeaderboardPage;
