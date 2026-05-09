export type Mission = {
  id: string;
  title: string;
  goal: number;
  current: number;
  rewardXp: number;
  expiresAt: string;
  locked?: boolean;
};

const getNextResetDate = (now = new Date()) => {
  const next = new Date(now);
  next.setUTCHours(24, 0, 0, 0);
  return next;
};

const getStartOfDayUtc = (now = new Date()) => {
  const start = new Date(now);
  start.setUTCHours(0, 0, 0, 0);
  return start;
};

export const getQuestWindow = (now = new Date()) => ({
  startOfDay: getStartOfDayUtc(now),
  expiresAt: getNextResetDate(now),
});

export const buildDailyMissions = (
  dailyXp: number,
  now = new Date()
): Mission[] => {
  const { expiresAt } = getQuestWindow(now);
  const expiresAtIso = expiresAt.toISOString();

  return [
    {
      id: "daily-xp-50",
      title: "Ganhe 50 XP hoje",
      goal: 50,
      current: dailyXp,
      rewardXp: 15,
      expiresAt: expiresAtIso,
    },
    {
      id: "daily-xp-100",
      title: "Ganhe 100 XP hoje",
      goal: 100,
      current: dailyXp,
      rewardXp: 30,
      expiresAt: expiresAtIso,
    },
    {
      id: "coming-soon-streak",
      title: "Missão de sequência (em breve)",
      goal: 7,
      current: 0,
      rewardXp: 45,
      expiresAt: expiresAtIso,
      locked: true,
    },
  ];
};
