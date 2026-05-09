import type { BoundStoreState } from "@/hooks/useBoundStore";

export type AchievementMetric = "xp" | "streak" | "lessonsCompleted" | "followers" | "following";

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  metric: AchievementMetric;
  target: number;
}

export interface AchievementProgress extends AchievementDefinition {
  current: number;
  progress: number;
  completed: boolean;
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: "first-xp",
    title: "Primeiros passos",
    description: "Ganhe 100 XP no total.",
    metric: "xp",
    target: 100,
  },
  {
    id: "streak-week",
    title: "Ritmo semanal",
    description: "Mantenha uma sequência de 7 dias.",
    metric: "streak",
    target: 7,
  },
  {
    id: "lesson-explorer",
    title: "Explorador de lições",
    description: "Complete 25 lições.",
    metric: "lessonsCompleted",
    target: 25,
  },
  {
    id: "social-learner",
    title: "Aprendiz social",
    description: "Siga 10 amigos.",
    metric: "following",
    target: 10,
  },
  {
    id: "community",
    title: "Comunidade ativa",
    description: "Tenha 15 seguidores.",
    metric: "followers",
    target: 15,
  },
];

type AchievementState = Pick<BoundStoreState, AchievementMetric>

export const getAchievementsProgress = (state: AchievementState): AchievementProgress[] => {
  return ACHIEVEMENTS.map((achievement) => {
    const current = state[achievement.metric];
    const progress = Math.min(100, Math.round((current / achievement.target) * 100));

    return {
      ...achievement,
      current,
      progress,
      completed: current >= achievement.target,
    };
  });
};
