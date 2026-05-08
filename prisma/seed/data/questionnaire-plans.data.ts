import { CourseLevel, Focus, Intensity } from "@prisma/client";
import type { SeedUserKey } from "./subscriptions.data";

export type CourseAliasRef = "english" | "spanish" | "french" | "german";

type QuestionnaireBasePayload = {
  discoverySource: string;
  learningGoal: string;
  languageLevel: string;
  dailyGoal: string;
  intensity: Intensity;
  focus: Focus;
  courseLevel: CourseLevel;
};

export type QuestionnairePlanItem = {
  userKey: SeedUserKey;
  selectedCourseAlias: CourseAliasRef;
  recommendedCourseAliases: CourseAliasRef[];
  payload: QuestionnaireBasePayload;
};

export const QUESTIONNAIRE_PLANS: QuestionnairePlanItem[] = [
  {
    userKey: "student1",
    selectedCourseAlias: "english",
    recommendedCourseAliases: ["english", "spanish"],
    payload: {
      discoverySource: "friend",
      learningGoal: "Become fluent in English for work",
      languageLevel: "beginner",
      dailyGoal: "30 minutes",
      intensity: Intensity.REGULAR,
      focus: Focus.BUSINESS,
      courseLevel: CourseLevel.BEGINNER,
    },
  },
  {
    userKey: "student2",
    selectedCourseAlias: "spanish",
    recommendedCourseAliases: ["spanish"],
    payload: {
      discoverySource: "online",
      learningGoal: "Learn Spanish for travel",
      languageLevel: "beginner",
      dailyGoal: "20 minutes",
      intensity: Intensity.CASUAL,
      focus: Focus.TRAVEL,
      courseLevel: CourseLevel.BEGINNER,
    },
  },
];
