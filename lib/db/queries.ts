import { cache } from "react";
import { getServerSession } from "next-auth";
import prisma from "../prisma";
import authOptions from "@/app/api/auth/[...nextauth]/auth-options";

const DAY_IN_MS = 86_400_000;

export const getCourses = cache(async () => {
  const data = await prisma.course.findMany();
  return data;
});

export const getUserProgress = cache(async () => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) return null;

  const data = await prisma.userProgress.findFirst({
    where: { userId },
    include: {
      activeCourse: true,
    },
  });

  return data;
});

export const getUnits = cache(async () => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const userProgress = await getUserProgress();

  if (!userId || !userProgress?.activeCourseId) return [];

  const data = await prisma.unit.findMany({
    where: { courseId: userProgress.activeCourseId },
    orderBy: { order: "asc" },
    include: {
      lessons: {
        orderBy: { order: "asc" },
        include: {
          challenges: {
            orderBy: { order: "asc" },
            include: {
              challengeProgress: {
                where: { userId },
              },
            },
          },
        },
      },
    },
  });

  const normalizedData = data.map((unit) => {
    const lessonsWithCompletedStatus = unit.lessons.map((lesson) => {
      if (lesson.challenges.length === 0) {
        return { ...lesson, completed: false };
      }

      const allCompletedChallenges = lesson.challenges.every((challenge) => {
        return (
          challenge.challengeProgress &&
          challenge.challengeProgress.length > 0 &&
          challenge.challengeProgress.every((progress) => progress.completed)
        );
      });

      return { ...lesson, completed: allCompletedChallenges };
    });

    return { ...unit, lessons: lessonsWithCompletedStatus };
  });

  return normalizedData;
});

export const getCourseById = cache(async (courseId: number) => {
  const data = await prisma.course.findFirst({
    where: { id: courseId },
    include: {
      units: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  return data;
});

export const getCourseProgress = cache(async () => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const userProgress = await getUserProgress();

  if (!userId || !userProgress?.activeCourseId) return null;

  const unitsInActiveCourse = await prisma.unit.findMany({
    orderBy: { order: "asc" },
    where: { courseId: userProgress.activeCourseId },
    include: {
      lessons: {
        orderBy: { order: "asc" },
        include: {
          unit: true,
          challenges: {
            include: {
              challengeProgress: {
                where: { userId },
              },
            },
          },
        },
      },
    },
  });

  const firstUncompletedLesson = unitsInActiveCourse
    .flatMap((unit) => unit.lessons)
    .find((lesson) => {
      return lesson.challenges.some((challenge) => {
        return (
          !challenge.challengeProgress ||
          challenge.challengeProgress.length === 0 ||
          challenge.challengeProgress.some((progress) => !progress.completed)
        );
      });
    });

  return {
    activeLesson: firstUncompletedLesson,
    activeLessonId: firstUncompletedLesson?.id,
  };
});

export const getLesson = cache(async (id?: number) => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) return null;

  const courseProgress = await getCourseProgress();
  const lessonId = id || courseProgress?.activeLessonId;

  if (!lessonId) return null;

  const data = await prisma.lesson.findFirst({
    where: { id: Number(lessonId) },
    include: {
      challenges: {
        orderBy: { order: "asc" },
        include: {
          challengeOptions: true,
          challengeProgress: {
            where: { userId },
          },
        },
      },
    },
  });

  if (!data || !data.challenges) return null;

  const normalizedChallenges = data.challenges.map((challenge) => {
    const completed =
      challenge.challengeProgress &&
      challenge.challengeProgress.length > 0 &&
      challenge.challengeProgress.every((progress) => progress.completed);

    return { ...challenge, completed };
  });

  return { ...data, challenges: normalizedChallenges };
});

export const getLessonPercentage = cache(async () => {
  const courseProgress = await getCourseProgress();

  if (!courseProgress?.activeLessonId) return 0;

  const lesson = await getLesson(courseProgress.activeLessonId);

  if (!lesson) return 0;

  const completedChallenges = lesson.challenges.filter(
    (challenge) => challenge.completed
  );

  const percentage = Math.round(
    (completedChallenges.length / lesson.challenges.length) * 100
  );

  return percentage;
});

export const getUserSubscription = cache(async () => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) return null;

  const data = await prisma.userSubscription.findFirst({
    where: { userId },
  });

  if (!data) return null;

  const isActive =
    data.stripePriceId &&
    data.stripeCurrentPeriodEnd &&
    data.stripeCurrentPeriodEnd.getTime() + DAY_IN_MS > Date.now();

  return {
    ...data,
    isActive: !!isActive,
  };
});

export const getTopTenUsers = cache(async () => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) return [];

  const data = await prisma.userProgress.findMany({
    orderBy: { points: "desc" },
    take: 10,
    select: {
      userId: true,
      userName: true,
      userImageSrc: true,
      points: true,
    },
  });

  return data;
});

export const getUserQuestionnaire = cache(async () => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) return null;

  const data = await prisma.userQuestionnaire.findFirst({
    where: { userId },
  });

  if (!data) return null;

  return data;
});

export const createUserQuestionnaire = async (data: {
  userId: string;
  discoverySource: string;
  learningGoal: string;
  languageLevel?: string;
  dailyGoal: string;
  courseLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  intensity: "CASUAL" | "REGULAR" | "INTENSE" | "HARD";
  focus:
    | "GENERAL"
    | "ACADEMIC"
    | "TRAVEL"
    | "BUSINESS"
    | "CONVERSATION"
    | "FUN";
}) => {
  const payload = {
    ...data,
    languageLevel: data.languageLevel ?? "",
  };

  return await prisma.userQuestionnaire.create({
    data: payload,
  });
};

// Função para verificar se o usuário é admin (reutilizável)
export const getIsAdmin = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) return false;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      role: {
        select: { name: true },
      },
    },
  });

  return user?.role?.name === "admin";
};
