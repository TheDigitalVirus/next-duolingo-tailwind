"use client";

import dayjs from "dayjs";
import type { ReactNode } from "react";
import { LightningProgressSvg, TreasureProgressSvg } from "./Svgs";
import { useBoundStore } from "@/hooks/useBoundStore";
import {
  DAILY_QUESTS,
  toDateKey,
  type Chest,
  type QuestIcon,
} from "@/utils/daily-quests";

const StopwatchSvg = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden>
    <rect x="20" y="4" width="8" height="6" rx="2" fill="#1899D6" />
    <circle cx="24" cy="27" r="17" fill="#1CB0F6" />
    <circle cx="24" cy="27" r="12.5" fill="white" />
    <path d="M24 27V19" stroke="#1CB0F6" strokeWidth="3.5" strokeLinecap="round" />
    <circle cx="24" cy="27" r="2.5" fill="#1CB0F6" />
  </svg>
);

const ComboSvg = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden>
    <circle cx="24" cy="24" r="20" fill="#58CC02" />
    <circle cx="24" cy="24" r="13" fill="white" />
    <circle cx="24" cy="24" r="7" fill="#58CC02" />
    <path d="M24 24 40 8" stroke="#FF4B4B" strokeWidth="4" strokeLinecap="round" />
    <path d="M36 6h6v6" stroke="#FF4B4B" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const QUEST_ICONS: Record<QuestIcon, () => ReactNode> = {
  xp: () => <LightningProgressSvg size={48} />,
  time: () => <StopwatchSvg />,
  combo: () => <ComboSvg />,
};

/** O baú dourado recolorido por filtro CSS para bronze e prata. */
const CHEST_FILTER: Record<Chest, string> = {
  bronze: "sepia saturate-150 hue-rotate-[-15deg] brightness-90",
  silver: "grayscale brightness-125",
  gold: "",
};

export const QuestProgressBar = ({
  current,
  goal,
  chest,
}: {
  current: number;
  goal: number;
  chest?: Chest;
}) => {
  const clamped = Math.min(current, goal);
  const done = clamped >= goal;

  return (
    <div className="flex items-center gap-1">
      <div className="relative h-4 flex-1 overflow-hidden rounded-full bg-[#37464F]">
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${
            done ? "bg-[#58CC02]" : "bg-[#FFC800]"
          }`}
          style={{ width: `${(clamped / goal) * 100}%` }}
        />
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#DCE6EC]">
          {clamped} / {goal}
        </span>
      </div>
      {chest && (
        <span className={`-ml-3 scale-75 ${CHEST_FILTER[chest]}`}>
          <TreasureProgressSvg />
        </span>
      )}
    </div>
  );
};

/** Hook com o histórico necessário para calcular as missões. */
export const useQuestHistory = () => {
  const xpByDate = useBoundStore((x) => x.xpByDate);
  const studySecondsByDate = useBoundStore((x) => x.studySecondsByDate);
  const comboLessonsByDate = useBoundStore((x) => x.comboLessonsByDate);
  const goalXp = useBoundStore((x) => x.goalXp);
  return { xpByDate, studySecondsByDate, comboLessonsByDate, goalXp };
};

/**
 * Lista das missões de hoje.
 * `divided` separa as missões com linhas (layout da página Missões).
 */
export const DailyQuestList = ({ divided = false }: { divided?: boolean }) => {
  const history = useQuestHistory();
  const today = toDateKey(dayjs());

  return (
    <div className={divided ? "divide-y-2 divide-[#37464F]" : "flex flex-col gap-6"}>
      {DAILY_QUESTS.map((quest) => (
        <div key={quest.id} className={`flex items-center gap-4 ${divided ? "px-5 py-5" : ""}`}>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center">
            {QUEST_ICONS[quest.icon]()}
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <h3 className="font-bold leading-snug text-white">{quest.title(history)}</h3>
            <QuestProgressBar
              current={quest.progress(history, today)}
              goal={quest.goal(history)}
              chest={quest.chest}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
