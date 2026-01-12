"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import authOptions from "@/app/api/auth/[...nextauth]/auth-options";
import prisma from "@/lib/prisma";

export const upsertChallengeProgress = async (challengeId: number) => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) throw new Error("Unauthorized.");

  const activeEnrollment = await prisma.userEnrollment.findFirst({
    where: {
      userId,
      isActive: true,
    },
  });

  if (!activeEnrollment) throw new Error("No active enrollment found.");

  const userSubscription = await prisma.userSubscription.findUnique({
    where: { userId },
  });

  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    include: {
      lesson: true,
    },
  });

  if (!challenge) throw new Error("Challenge not found.");

  const lessonId = challenge.lessonId;

  const existingChallengeProgress = await prisma.challengeProgress.findFirst({
    where: {
      enrollmentId: activeEnrollment.id,
      challengeId,
    },
  });

  const isPractice = !!existingChallengeProgress;

  const isSubscriptionActive = userSubscription?.tier === "PRO" || 
    (userSubscription?.stripeCurrentPeriodEnd && 
     userSubscription.stripeCurrentPeriodEnd > new Date());

  if (
    activeEnrollment.courseHearts === 0 &&
    !isPractice &&
    !isSubscriptionActive
  ) {
    return { error: "hearts" };
  }

  if (isPractice && existingChallengeProgress) {
    await prisma.$transaction([
      prisma.challengeProgress.update({
        where: { id: existingChallengeProgress.id },
        data: {
          completed: true,
          completedAt: new Date(),
          attempts: {
            increment: 1,
          },
        },
      }),
      prisma.userEnrollment.update({
        where: { id: activeEnrollment.id },
        data: {
          courseHearts: Math.min(activeEnrollment.courseHearts + 1, 5),
          coursePoints: activeEnrollment.coursePoints + 10,
          lastAccessedAt: new Date(),
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          totalPoints: { increment: 10 },
          hearts: {
            increment: 1,
          },
          lastActiveAt: new Date(),
        },
      }),
    ]);

    revalidatePath("/learn");
    revalidatePath("/lesson");
    revalidatePath("/quests");
    revalidatePath("/leaderboard");
    revalidatePath(`/lesson/${lessonId}`);
    return;
  }

  await prisma.$transaction([
    prisma.challengeProgress.create({
      data: {
        challengeId,
        userId,
        enrollmentId: activeEnrollment.id,
        completed: true,
        completedAt: new Date(),
        attempts: 1,
      },
    }),
    prisma.userEnrollment.update({
      where: { id: activeEnrollment.id },
      data: {
        coursePoints: activeEnrollment.coursePoints + 10,
        lastAccessedAt: new Date(),
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        totalPoints: { increment: 10 },
        lastActiveAt: new Date(),
      },
    }),
  ]);
  revalidatePath("/learn");
  revalidatePath("/lesson");
  revalidatePath("/quests");
  revalidatePath("/leaderboard");
  revalidatePath(`/lesson/${lessonId}`);
};

export const updateLessonProgress = async (lessonId: number) => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) throw new Error("Unauthorized.");

  const activeEnrollment = await prisma.userEnrollment.findFirst({
    where: {
      userId,
      isActive: true,
    },
  });

  if (!activeEnrollment) throw new Error("No active enrollment found.");

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      unit: true,
    },
  });

  if (!lesson) throw new Error("Lesson not found.");

  await prisma.userEnrollment.update({
    where: { id: activeEnrollment.id },
    data: {
      currentLessonId: lessonId,
      currentUnitId: lesson.unitId,
      lastAccessedAt: new Date(),
    },
  });

  revalidatePath("/learn");
  revalidatePath(`/lesson/${lessonId}`);
};