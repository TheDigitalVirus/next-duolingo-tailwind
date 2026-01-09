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

  // Buscar matrícula existente neste curso
  const existingEnrollment = await prisma.userEnrollment.findFirst({
    where: {
      userId,
      courseId,
    },
  });

  // Primeiro, desativar todas as outras matrículas ativas do usuário
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
    // Atualizar matrícula existente
    await prisma.userEnrollment.update({
      where: { id: existingEnrollment.id },
      data: {
        isActive: true,
        status: "ACTIVE",
        lastAccessedAt: new Date(),
      },
    });

    // Atualizar informações básicas do usuário
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

  // Criar nova matrícula
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
      // Inicializar com valores padrão
      courseHearts: 5,
      coursePoints: 0,
      progressPercent: 0,
    },
  });

  // Atualizar informações básicas do usuário
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

  // Buscar matrícula ativa do usuário
  const activeEnrollment = await prisma.userEnrollment.findFirst({
    where: {
      userId,
      isActive: true,
    },
  });

  if (!activeEnrollment) throw new Error("No active enrollment found.");

  // Buscar assinatura do usuário
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

  // Verificar se já existe progresso neste desafio (prática)
  const existingChallengeProgress = await prisma.challengeProgress.findFirst({
    where: {
      enrollmentId: activeEnrollment.id,
      challengeId,
    },
  });

  const isPractice = !!existingChallengeProgress;

  if (isPractice) return { error: "practice" };

  // Verificar se a assinatura está ativa
  const isSubscriptionActive = userSubscription?.tier === "PRO" || 
    (userSubscription?.stripeCurrentPeriodEnd && 
     userSubscription.stripeCurrentPeriodEnd > new Date());

  if (isSubscriptionActive) return { error: "subscription" };

  // Usar hearts específicos do curso
  if (activeEnrollment.courseHearts === 0) return { error: "hearts" };

  // Reduzir hearts do curso e do usuário
  await prisma.$transaction([
    // Reduzir hearts da matrícula (curso específico)
    prisma.userEnrollment.update({
      where: { id: activeEnrollment.id },
      data: {
        courseHearts: Math.max(activeEnrollment.courseHearts - 1, 0),
      },
    }),
    // Reduzir hearts gerais do usuário
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

  // Buscar matrícula ativa do usuário
  const activeEnrollment = await prisma.userEnrollment.findFirst({
    where: {
      userId,
      isActive: true,
    },
  });

  if (!activeEnrollment) throw new Error("No active enrollment found.");

  // Buscar usuário para verificar pontos
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
    // Recarregar hearts da matrícula
    prisma.userEnrollment.update({
      where: { id: activeEnrollment.id },
      data: {
        courseHearts: 5,
      },
    }),
    // Recarregar hearts gerais do usuário
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

// Nova função para buscar progresso do usuário (substitui getUserProgress antigo)
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