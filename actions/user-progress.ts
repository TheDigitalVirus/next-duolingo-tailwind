"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import authOptions from "@/app/api/auth/[...nextauth]/auth-options";
import prisma from "@/lib/prisma";
import { getCourseById } from "@/lib/db/queries";

export const upsertUserProgress = async (courseId: number) => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) throw new Error("Unauthorized.");

  const userId = session.user.id;
  const userName = session.user.name || "User";
  const userImageSrc = session.user.image || "/mascot.svg";

  const course = await getCourseById(courseId);

  if (!course) throw new Error("Course not found.");

  if (!course.units.length || !course.units[0].lessons.length)
    throw new Error("Course is empty.");

  const existingEnrollment = await prisma.userEnrollment.findFirst({
    where: {
      userId,
      courseId,
    },
  });

  await prisma.userEnrollment.updateMany({
    where: {
      userId,
      isActive: true,
    },
    data: {
      isActive: false,
    },
  });

  if (existingEnrollment) {
    await prisma.userEnrollment.update({
      where: { id: existingEnrollment.id },
      data: {
        isActive: true,
        status: "ACTIVE",
        lastAccessedAt: new Date(),
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        name: userName,
      },
    });

    revalidatePath("/courses");
    revalidatePath("/learn");
    redirect("/learn");
  }

  const firstUnit = course.units[0];
  const firstLesson = firstUnit.lessons[0];

  await prisma.userEnrollment.create({
    data: {
      userId,
      courseId,
      isActive: true,
      status: "ACTIVE",
      currentUnitId: firstUnit.id,
      currentLessonId: firstLesson.id,
      startedAt: new Date(),
      lastAccessedAt: new Date(),
      courseHearts: 5,
      coursePoints: 0,
      progressPercent: 0,
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: userName,
    },
  });

  revalidatePath("/courses");
  revalidatePath("/learn");
  redirect("/learn");
};

export const reduceHearts = async (challengeId: number) => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) throw new Error("Unauthorized.");

  const userId = session.user.id;

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

  if (isPractice) return { error: "practice" };

  const isSubscriptionActive = userSubscription?.tier === "PRO" || 
    (userSubscription?.stripeCurrentPeriodEnd && 
     userSubscription.stripeCurrentPeriodEnd > new Date());

  if (isSubscriptionActive) return { error: "subscription" };

  if (activeEnrollment.courseHearts === 0) return { error: "hearts" };

  await prisma.$transaction([
    prisma.userEnrollment.update({
      where: { id: activeEnrollment.id },
      data: {
        courseHearts: Math.max(activeEnrollment.courseHearts - 1, 0),
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        hearts: {
          decrement: 1,
        },
      },
    }),
  ]);

  revalidatePath("/shop");
  revalidatePath("/learn");
  revalidatePath("/quests");
  revalidatePath("/leaderboard");
  revalidatePath(`/lesson/${lessonId}`);
};

export const refillHearts = async () => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) throw new Error("Unauthorized.");

  const userId = session.user.id;

  const activeEnrollment = await prisma.userEnrollment.findFirst({
    where: {
      userId,
      isActive: true,
    },
  });

  if (!activeEnrollment) throw new Error("No active enrollment found.");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      totalPoints: true,
    },
  });

  if (!user) throw new Error("User not found.");
  if (activeEnrollment.courseHearts === 5) throw new Error("Hearts are already full.");
  if (user.totalPoints < 10) throw new Error("Not enough points.");

  await prisma.$transaction([
    prisma.userEnrollment.update({
      where: { id: activeEnrollment.id },
      data: {
        courseHearts: 5,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        hearts: 5,
        totalPoints: user.totalPoints - 10,
      },
    }),
  ]);

  revalidatePath("/shop");
  revalidatePath("/learn");
  revalidatePath("/quests");
  revalidatePath("/leaderboard");
};

export const getUserActiveProgress = async () => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) return null;

  const userId = session.user.id;

  const activeEnrollment = await prisma.userEnrollment.findFirst({
    where: {
      userId,
      isActive: true,
    },
    include: {
      course: true,
      currentUnit: true,
      currentLesson: true,
    },
  });

  return activeEnrollment;
} 