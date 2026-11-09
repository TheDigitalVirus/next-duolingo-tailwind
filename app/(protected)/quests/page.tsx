"use client";

import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";
import { DailyQuestList, useQuestHistory } from "@/components/DailyQuests";
import {
  countCompletedQuestsInMonth,
  formatTimeLeft,
  monthName,
  MONTHLY_QUESTS_GOAL,
} from "@/utils/daily-quests";

/** Atualiza a cada minuto; null até montar (evita divergir do HTML do servidor). */
const useNow = () => {
  const [now, setNow] = useState<dayjs.Dayjs | null>(null);
  useEffect(() => {
    setNow(dayjs());
    const interval = window.setInterval(() => setNow(dayjs()), 60_000);
    return () => window.clearInterval(interval);
  }, []);
  return now;
};

const TimeLeft = ({ label, className }: { label: string | null; className: string }) =>
  label ? (
    <span className={`flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide ${className}`}>
      <Clock3 className="h-4 w-4" strokeWidth={3} />
      {label}
    </span>
  ) : null;

const MonthlyChallenge = ({ now }: { now: dayjs.Dayjs | null }) => {
  const history = useQuestHistory();
  const month = now ?? dayjs();
  const completed = countCompletedQuestsInMonth(history, month);
  const name = monthName(month);

  return (
    <section className="rounded-2xl bg-[#D9579F] p-6">
      <span className="inline-block rounded-lg bg-white px-2.5 py-1 text-sm font-bold uppercase tracking-wide text-[#D9579F]">
        {name}
      </span>
      <h1 className="mt-3 text-2xl font-bold text-white">Missão de {name}</h1>
      <div className="mt-2">
        <TimeLeft
          label={now ? formatTimeLeft(now.endOf("month"), now) : null}
          className="text-white/70"
        />
      </div>

      <div className="mt-10 rounded-2xl bg-[#131F24] p-5">
        <h2 className="font-bold text-white">Complete {MONTHLY_QUESTS_GOAL} missões</h2>
        <div className="mt-3 flex items-center gap-2">
          <div className="relative h-5 flex-1 overflow-hidden rounded-full bg-[#37464F]">
            <div
              className="h-full rounded-full bg-[#D9579F] transition-[width] duration-500"
              style={{ width: `${Math.min(1, completed / MONTHLY_QUESTS_GOAL) * 100}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#DCE6EC]">
              {Math.min(completed, MONTHLY_QUESTS_GOAL)} / {MONTHLY_QUESTS_GOAL}
            </span>
          </div>
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-[#E5A800] bg-[#FFC800] text-[10px] font-extrabold uppercase text-[#7A4F00]"
            aria-hidden
          >
            {name.slice(0, 3)}
          </span>
        </div>
      </div>
    </section>
  );
};

const QuestsPage = () => {
  const now = useNow();

  return (
    <main className="pb-32 pt-2 lg:pt-6">
      <MonthlyChallenge now={now} />

      <div className="mb-4 mt-10 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Missões do dia</h2>
        <TimeLeft
          label={now ? formatTimeLeft(now.endOf("day"), now) : null}
          className="text-[#FF9600]"
        />
      </div>
      <section className="rounded-2xl border-2 border-[#37464F]">
        <DailyQuestList divided />
      </section>
    </main>
  );
};

export default QuestsPage;
