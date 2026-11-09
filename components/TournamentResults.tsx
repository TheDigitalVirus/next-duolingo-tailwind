"use client";

import { useState, type ReactNode } from "react";
import { Award, Target, Timer, Zap } from "lucide-react";
import { GameModal } from "./GameModal";
import { LeagueBadge } from "./LeagueBadge";
import { LingotsTreasureChestSvg } from "./Svgs";
import { LEAGUES } from "@/utils/leagues";
import type { TournamentResult } from "@/utils/tournament";

type Step = "result" | "stats" | "reward";

const RESULT_COPY: Record<TournamentResult["outcome"], { title: string; text: string }> = {
  promoted: { title: "Você subiu de divisão!", text: "e subiu pra Divisão" },
  stayed: { title: "Muito bem!", text: "e manteve a sua posição na Divisão" },
  demoted: { title: "Quem sabe da próxima vez!", text: "e caiu pra Divisão" },
};

const statsTitle = (rank: number) => {
  if (rank <= 3) return "Você não facilita pra concorrência!";
  if (rank <= 10) return "Mandou bem no torneio!";
  return "Torneio encerrado!";
};

const StatTile = ({ icon, value, label }: { icon: ReactNode; value: number; label: string }) => (
  <div className="flex items-center gap-3 rounded-2xl border-2 border-[#37464F] p-4 text-left">
    <span className="shrink-0">{icon}</span>
    <div>
      <p className="font-bold text-white">{value}</p>
      <p className="text-sm font-bold text-[#DCE6EC]">{label}</p>
    </div>
  </div>
);

const XpPotionArt = () => (
  <div className="relative h-40 w-36">
    <LingotsTreasureChestSvg className="absolute bottom-0 left-1/2 h-28 w-28 -translate-x-1/2" />
    <svg
      viewBox="0 0 80 96"
      className="absolute left-1/2 top-0 h-24 w-20 -translate-x-1/2"
      aria-hidden
    >
      <rect x="30" y="2" width="20" height="12" rx="3" fill="#A56644" />
      <rect x="32" y="12" width="16" height="16" fill="#E8D5FF" />
      <circle cx="40" cy="58" r="34" fill="#E8D5FF" />
      <circle cx="40" cy="60" r="27" fill="#CE82FF" />
      <text
        x="40"
        y="70"
        textAnchor="middle"
        fontSize="26"
        fontWeight="800"
        fill="white"
        fontFamily="inherit"
      >
        2x
      </text>
    </svg>
  </div>
);

/**
 * Sequência exibida quando um torneio semanal termina:
 * resultado → estatísticas → recompensa (se houver).
 */
export const TournamentResults = ({
  result,
  onClaimReward,
  onDone,
}: {
  result: TournamentResult;
  onClaimReward: (minutes: number) => void;
  onDone: () => void;
}) => {
  const [step, setStep] = useState<Step>("result");
  const playedLeague = LEAGUES[result.leagueIndex] ?? LEAGUES[0];
  const newLeague = LEAGUES[result.newLeagueIndex] ?? playedLeague;

  if (step === "result") {
    const copy = RESULT_COPY[result.outcome];
    return (
      <GameModal
        illustration={<LeagueBadge league={newLeague} size={128} />}
        title={copy.title}
        onContinue={() => setStep("stats")}
      >
        Você terminou na posição {result.rank} {copy.text} {newLeague.name}.
      </GameModal>
    );
  }

  if (step === "stats") {
    return (
      <GameModal
        illustration={<LeagueBadge league={playedLeague} size={96} />}
        title={statsTitle(result.rank)}
        onContinue={() => (result.reward ? setStep("reward") : onDone())}
      >
        <p>Suas estatísticas no torneio:</p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <StatTile
            icon={<Zap className="h-8 w-8 fill-[#FFC800] text-[#FFC800]" />}
            value={result.stats.xp}
            label="XP obtido"
          />
          <StatTile
            icon={
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#CE82FF]">
                <Timer className="h-5 w-5 text-white" strokeWidth={3} />
              </span>
            }
            value={result.stats.minutes}
            label="Minutos gastos"
          />
          <StatTile
            icon={<Target className="h-8 w-8 text-[#58CC02]" strokeWidth={3} />}
            value={result.stats.perfectLessons}
            label="lições perfeitas"
          />
          <StatTile
            icon={<Award className="h-8 w-8 fill-[#FFC800] text-[#E5A800]" />}
            value={result.stats.lessons}
            label="Total de lições"
          />
        </div>
      </GameModal>
    );
  }

  const reward = result.reward;
  return (
    <GameModal
      illustration={<XpPotionArt />}
      title="Você ganhou uma poção de XP!"
      onContinue={() => {
        if (reward) onClaimReward(reward.minutes);
        onDone();
      }}
    >
      Parabéns pelo desempenho no Torneio {playedLeague.name}! Agora receba o dobro de XP pelos
      próximos <span className="font-bold text-[#FF9600]">{reward?.minutes} minutos</span>.
    </GameModal>
  );
};
