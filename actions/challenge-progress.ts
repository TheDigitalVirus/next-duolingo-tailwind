// use server
"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import authOptions from "@/app/api/auth/[...nextauth]/auth-options";
import prisma from "@/lib/prisma";

/**
 * Upsert do progresso do desafio (Prisma + next-auth)
 * - cria um ChallengeProgress se não existir
 * - marca como completed se já existir (prática)
 * - atualiza UserProgress (hearts/points)
 */
export const upsertChallengeProgress = async (challengeId: number) => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) throw new Error("Unauthorized.");

  // buscar progresso do usuário e assinatura
  const [currentUserProgress, userSubscription] = await Promise.all([
    prisma.userProgress.findUnique({ where: { userId } }),
    prisma.userSubscription.findUnique({ where: { userId } }),
  ]);

  if (!currentUserProgress) throw new Error("User progress not found.");

  // buscar challenge
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    select: { id: true, lessonId: true },
  });

  if (!challenge) throw new Error("Challenge not found.");

  const lessonId = challenge.lessonId;

  // buscar progresso existente do challenge para este user
  const existingChallengeProgress = await prisma.challengeProgress.findFirst({
    where: {
      userId,
      challengeId,
    },
  });

  const isPractice = !!existingChallengeProgress;

  // determinar se assinatura está ativa
  const now = new Date();
  const isSubscriptionActive =
    !!userSubscription &&
    ((userSubscription.stripeCurrentPeriodEnd &&
      userSubscription.stripeCurrentPeriodEnd > now) ||
      userSubscription.tier === "PRO");

  // se hearts = 0 e não é prática e sem assinatura ativa => retorna erro de hearts
  if (
    currentUserProgress.hearts === 0 &&
    !isPractice &&
    !isSubscriptionActive
  ) {
    return { error: "hearts" };
  }

  // tudo em transação para consistência
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
      prisma.userProgress.update({
        where: { userId },
        data: {
          // aumenta hearts (máx MAX_HEARTS) e points
          hearts: Math.min(currentUserProgress.hearts + 1, 5),
          points: currentUserProgress.points + 10,
          updatedAt: new Date(),
        },
      }),
    ]);

    // revalidate rotas
    revalidatePath("/learn");
    revalidatePath("/lesson");
    revalidatePath("/quests");
    revalidatePath("/leaderboard");
    revalidatePath(`/lesson/${lessonId}`);
    return;
  }

  // caso normal: cria progresso do challenge e atualiza pontos (sem dar heart)
  await prisma.$transaction([
    prisma.challengeProgress.create({
      data: {
        challengeId,
        userId,
        completed: true,
        completedAt: new Date(),
        attempts: 1,
        // score pode ser preenchido se houver lógica
      },
    }),
    prisma.userProgress.update({
      where: { userId },
      data: {
        points: currentUserProgress.points + 10,
        updatedAt: new Date(),
      },
    }),
  ]);

  // revalidate rotas
  revalidatePath("/learn");
  revalidatePath("/lesson");
  revalidatePath("/quests");
  revalidatePath("/leaderboard");
  revalidatePath(`/lesson/${lessonId}`);
};
