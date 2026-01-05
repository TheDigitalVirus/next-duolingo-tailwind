import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { CourseLevel } from "@prisma/client";
import authOptions from "../../auth/[...nextauth]/auth-options";

const progressUpdateSchema = z.object({
  level: z.nativeEnum(CourseLevel).optional(),
  recommendedUnits: z.array(z.number()).optional(),
  courseId: z.number().optional(),
});

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;

  try {
    const body = await request.json();
    const validatedData = progressUpdateSchema.parse(body);

    // Buscar o questionário do usuário para informações adicionais
    const userQuestionnaireData = await prisma.userQuestionnaire.findUnique({
      where: { userId },
    });

    const updateData: any = {};

    // Se foi fornecido um courseId, atualizar o curso ativo
    if (validatedData.courseId !== undefined) {
      updateData.activeCourseId = validatedData.courseId;
    }

    // Se foi fornecido um nível, podemos ajustar pontos iniciais baseados no nível
    if (validatedData.level) {
      // Ajustar pontos iniciais baseados no nível
      const initialPoints = getInitialPointsByLevel(validatedData.level);
      updateData.points = initialPoints;
    }

    // Se temos dados do questionário, podemos personalizar ainda mais
    if (userQuestionnaireData) {
      // Ajustar baseado na intensidade (meta diária)
      if (userQuestionnaireData.intensity === "HARD") {
        // Usuários com meta intensa podem começar com pequeno bônus
        updateData.points = (updateData.points || 0) + 50;
      }

      // Ajustar baseado no foco de aprendizado
      if (
        userQuestionnaireData.focus === "ACADEMIC" ||
        userQuestionnaireData.focus === "BUSINESS"
      ) {
        // Foco acadêmico ou de negócios - pequeno bônus adicional
        updateData.points = (updateData.points || 0) + 25;
      }
    }

    // Verificar se o userProgress existe
    const existingProgress = await prisma.userProgress.findUnique({
      where: { userId },
    });

    let updatedProgress;
    if (existingProgress) {
      // Atualizar progresso existente
      updatedProgress = await prisma.userProgress.update({
        where: { userId },
        data: updateData,
      });
    } else {
      // Criar novo progresso
      updatedProgress = await prisma.userProgress.create({
        data: {
          userId,
          userName: session.user.name || "User",
          userImageSrc: session.user.image || "/mascot.svg",
          hearts: 5,
          points: updateData.points || 0,
          level: 1,
          completedLessons: [],
          completedExercises: [],
          totalStudyTime: 0,
          dailyStudyTime: 0,
          perfectExercises: 0,
          currentStreak: 0,
          longestStreak: 0,
          lastActivityAt: new Date(),
          ...updateData,
        },
      });
    }

    return NextResponse.json({
      success: true,
      progress: updatedProgress,
      recommendedUnits: validatedData.recommendedUnits,
    });
  } catch (error) {
    console.error("Error updating user progress:", error);

    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid data", { status: 400 });
    }

    return new NextResponse("Internal server error", { status: 500 });
  }
}

// Função auxiliar para determinar pontos iniciais baseados no nível
function getInitialPointsByLevel(level: CourseLevel): number {
  const pointsMap = {
    [CourseLevel.BEGINNER]: 0,
    [CourseLevel.INTERMEDIATE]: 200,
    [CourseLevel.ADVANCED]: 500,
  };

  return pointsMap[level] || 0;
}

// GET para obter o progresso atual do usuário
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;

  try {
    const progress = await prisma.userProgress.findUnique({
      where: { userId },
    });

    // Buscar também o questionário para informações completas
    const questionnaire = await prisma.userQuestionnaire.findUnique({
      where: { userId },
    });

    return NextResponse.json({
      progress,
      questionnaire,
      // Incluir recomendações se disponíveis
      recommendations: questionnaire
        ? {
            level: questionnaire.courseLevel,
            intensity: questionnaire.intensity,
            focus: questionnaire.focus,
            recommendedUnits: questionnaire.recommendedUnits,
          }
        : null,
    });
  } catch (error) {
    console.error("Error fetching user progress:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}