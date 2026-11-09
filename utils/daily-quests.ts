import dayjs, { type Dayjs } from "dayjs";
import type { BoundStoreState } from "@/hooks/useBoundStore";

type QuestHistory = Pick<
  BoundStoreState,
  "xpByDate" | "studySecondsByDate" | "comboLessonsByDate" | "goalXp"
>;

export type Chest = "bronze" | "silver" | "gold";
export type QuestIcon = "xp" | "time" | "combo";

export type DailyQuest = {
  id: string;
  icon: QuestIcon;
  title: (history: QuestHistory) => string;
  goal: (history: QuestHistory) => number;
  /** Progresso num dia específico (chave YYYY-MM-DD). */
  progress: (history: QuestHistory, dateKey: string) => number;
  chest: Chest;
};

export const STUDY_MINUTES_GOAL = 5;
export const COMBO_LESSONS_GOAL = 3;
/** Missões concluídas no mês para ganhar a medalha mensal. */
export const MONTHLY_QUESTS_GOAL = 35;

export const DAILY_QUESTS: DailyQuest[] = [
  {
    id: "xp",
    icon: "xp",
    title: (h) => `Ganhe ${h.goalXp} XP`,
    goal: (h) => h.goalXp,
    progress: (h, day) => h.xpByDate[day] ?? 0,
    chest: "bronze",
  },
  {
    id: "time",
    icon: "time",
    title: () => `Estude por ${STUDY_MINUTES_GOAL} minutos`,
    goal: () => STUDY_MINUTES_GOAL,
    progress: (h, day) => Math.floor((h.studySecondsByDate[day] ?? 0) / 60),
    chest: "silver",
  },
  {
    id: "combo",
    icon: "combo",
    title: () => `Acerte 5 exercícios seguidos em ${COMBO_LESSONS_GOAL} lições`,
    goal: () => COMBO_LESSONS_GOAL,
    progress: (h, day) => h.comboLessonsByDate[day] ?? 0,
    chest: "gold",
  },
];

export const toDateKey = (day: Dayjs) => day.format("YYYY-MM-DD");

/** Quantas missões diárias foram concluídas no mês de `month`. */
export const countCompletedQuestsInMonth = (history: QuestHistory, month: Dayjs) => {
  const daysWithData = new Set([
    ...Object.keys(history.xpByDate),
    ...Object.keys(history.studySecondsByDate),
    ...Object.keys(history.comboLessonsByDate),
  ]);

  let completed = 0;
  daysWithData.forEach((day) => {
    if (!dayjs(day).isSame(month, "month")) return;
    DAILY_QUESTS.forEach((quest) => {
      if (quest.progress(history, day) >= quest.goal(history)) completed += 1;
    });
  });
  return completed;
};

/** Meses (do mais recente) em que a missão mensal foi concluída. */
export const getEarnedMonthlyMedals = (history: QuestHistory): Dayjs[] => {
  const months = new Set(
    [
      ...Object.keys(history.xpByDate),
      ...Object.keys(history.studySecondsByDate),
      ...Object.keys(history.comboLessonsByDate),
    ].map((day) => day.slice(0, 7)),
  );

  return Array.from(months)
    .sort()
    .reverse()
    .map((month) => dayjs(`${month}-01`))
    .filter((month) => countCompletedQuestsInMonth(history, month) >= MONTHLY_QUESTS_GOAL);
};

const MONTH_NAMES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

export const monthName = (day: Dayjs) => MONTH_NAMES[day.month()];

/** "24 DIAS", "15 HORAS", "40 MINUTOS" — o maior que fizer sentido. */
export const formatTimeLeft = (until: Dayjs, now: Dayjs = dayjs()) => {
  const minutes = Math.max(0, until.diff(now, "minute"));
  if (minutes >= 24 * 60) {
    const days = Math.floor(minutes / (24 * 60));
    return `${days} ${days === 1 ? "dia" : "dias"}`;
  }
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    return `${hours} ${hours === 1 ? "hora" : "horas"}`;
  }
  return `${minutes} ${minutes === 1 ? "minuto" : "minutos"}`;
};
