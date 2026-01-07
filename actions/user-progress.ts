"use server";
 
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCourseById, getUserProgress, getUserSubscription } from "@/lib/db/queries";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth"; // Seu arquivo de configuração do NextAuth
import authOptions from "@/app/api/auth/[...nextauth]/auth-options";

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

  const existingUserProgress = await getUserProgress();

  if (existingUserProgress) {
    await prisma.userProgress.update({
      where: { userId },
      data: {
        activeCourseId: courseId,
        userName: userName,
        userImageSrc: userImageSrc,
      },
    });

    revalidatePath("/courses");
    revalidatePath("/learn");
    redirect("/learn");
  }

  await prisma.userProgress.create({
    data: {
      userId,
      activeCourseId: courseId,
      userName: userName,
      userImageSrc: userImageSrc,
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

  const currentUserProgress = await getUserProgress();
  const userSubscription = await getUserSubscription();

  const challenge = await prisma.challenge.findFirst({
    where: { id: challengeId },
  });

  if (!challenge) throw new Error("Challenge not found.");

  const lessonId = challenge.lessonId;

  const existingChallengeProgress = await prisma.challengeProgress.findFirst({
    where: {
      userId,
      challengeId,
    },
  });

  const isPractice = !!existingChallengeProgress;

  if (isPractice) return { error: "practice" };

  if (!currentUserProgress) throw new Error("User progress not found.");

  if (userSubscription?.isActive) return { error: "subscription" };

  if (currentUserProgress.hearts === 0) return { error: "hearts" };

  await prisma.userProgress.update({
    where: { userId },
    data: {
      hearts: Math.max(currentUserProgress.hearts - 1, 0),
    },
  });

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
  const currentUserProgress = await getUserProgress();

  if (!currentUserProgress) throw new Error("User progress not found.");
  if (currentUserProgress.hearts === 5)
    throw new Error("Hearts are already full.");
  if (currentUserProgress.points < 10)
    throw new Error("Not enough points.");

  await prisma.userProgress.update({
    where: { userId },
    data: {
      hearts: 5,
      points: currentUserProgress.points - 10,
    },
  });

  revalidatePath("/shop");
  revalidatePath("/learn");
  revalidatePath("/quests");
  revalidatePath("/leaderboard");
};