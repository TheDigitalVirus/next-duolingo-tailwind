import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { CourseLevel } from "@prisma/client";
import authOptions from "../../auth/[...nextauth]/auth-options";

const progressUpdateSchema = z.object({
  level: z.nativeEnum(CourseLevel).optional(),
  recommendedUnits: z.array(z.number()).optional(),
  courseId: z.number(),
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

    const { courseId, level, recommendedUnits } = validatedData;

    // Buscar o questionário do usuário para informações adicionais
    const userQuestionnaireData = await prisma.userQuestionnaire.findUnique({
      where: { userId },
    });

    // Buscar o curso para verificar se existe
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    // Buscar a primeira unidade e lição do curso para inicializar o progresso
    const firstUnit = await prisma.unit.findFirst({
      where: { courseId },
      orderBy: { order: 'asc' },
    });

    const firstLesson = firstUnit ? await prisma.lesson.findFirst({
      where: { unitId: firstUnit.id },
      orderBy: { order: 'asc' },
    }) : null;

    // Desativar todas as outras matrículas ativas do usuário
    await prisma.userEnrollment.updateMany({
      where: {
        userId,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    // Verificar se já existe uma matrícula neste curso
    const existingEnrollment = await prisma.userEnrollment.findFirst({
      where: {
        userId,
        courseId,
      },
    });

    let enrollment;
    let initialPoints = 0;

    // Calcular pontos iniciais baseados no nível (se fornecido)
    if (level) {
      initialPoints = getInitialPointsByLevel(level);
    }

    // Ajustar pontos baseados no questionário
    if (userQuestionnaireData) {
      // Ajustar baseado na intensidade (meta diária)
      if (userQuestionnaireData.intensity === "HARD") {
        // Usuários com meta intensa podem começar com pequeno bônus
        initialPoints += 50;
      }

      // Ajustar baseado no foco de aprendizado
      if (
        userQuestionnaireData.focus === "ACADEMIC" ||
        userQuestionnaireData.focus === "BUSINESS"
      ) {
        // Foco acadêmico ou de negócios - pequeno bônus adicional
        initialPoints += 25;
      }
    }

    if (existingEnrollment) {
      // Atualizar matrícula existente
      enrollment = await prisma.userEnrollment.update({
        where: { id: existingEnrollment.id },
        data: {
          isActive: true,
          status: "ACTIVE",
          currentUnitId: firstUnit?.id || existingEnrollment.currentUnitId,
          currentLessonId: firstLesson?.id || existingEnrollment.currentLessonId,
          lastAccessedAt: new Date(),
        },
      });
    } else {
      // Criar nova matrícula
      enrollment = await prisma.userEnrollment.create({
        data: {
          userId,
          courseId,
          isActive: true,
          status: "ACTIVE",
          currentUnitId: firstUnit?.id || null,
          currentLessonId: firstLesson?.id || null,
          courseHearts: 5,
          coursePoints: initialPoints,
          progressPercent: 0,
          startedAt: new Date(),
          lastAccessedAt: new Date(),
        },
      });

      const userEnrollmentsCount = await prisma.userEnrollment.count({
        where: { userId },
      });

      if (userEnrollmentsCount === 1) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            totalPoints: initialPoints,
            hearts: 5,
          },
        });
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        name: session.user.name,
        lastActiveAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      enrollment,
      recommendedUnits: recommendedUnits || [],
    });
  } catch (error) {
    console.error("Error updating user progress:", error);

    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid data", { status: 400 });
    }

    return new NextResponse("Internal server error", { status: 500 });
  }
}

function getInitialPointsByLevel(level: CourseLevel): number {
  const pointsMap = {
    [CourseLevel.BEGINNER]: 0,
    [CourseLevel.INTERMEDIATE]: 200,
    [CourseLevel.ADVANCED]: 500,
  };

  return pointsMap[level] || 0;
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        totalPoints: true,
        hearts: true,
        level: true,
        xp: true,
        streak: true,
        lastActiveAt: true,
        gems: true,
      },
    });

    const activeEnrollment = await prisma.userEnrollment.findFirst({
      where: {
        userId,
        isActive: true,
      },
      include: {
        course: {
          include: {
            units: {
              include: {
                lessons: true,
              },
            },
          },
        },
        currentUnit: true,
        currentLesson: true,
      },
    });

    const allEnrollments = await prisma.userEnrollment.findMany({
      where: { userId },
      include: {
        course: true,
      },
      orderBy: {
        lastAccessedAt: 'desc',
      },
    });

    const questionnaire = await prisma.userQuestionnaire.findUnique({
      where: { userId },
    });

    const subscription = await prisma.userSubscription.findUnique({
      where: { userId },
    });

    let courseProgress = null;
    if (activeEnrollment) {
      const totalChallenges = await prisma.challenge.count({
        where: {
          lesson: {
            unit: {
              courseId: activeEnrollment.courseId,
            },
          },
        },
      });

      const completedChallenges = await prisma.challengeProgress.count({
        where: {
          enrollmentId: activeEnrollment.id,
          completed: true,
        },
      });

      courseProgress = {
        progressPercent: totalChallenges > 0 
          ? (completedChallenges / totalChallenges) * 100 
          : 0,
        completedChallenges,
        totalChallenges,
      };
    }

    return NextResponse.json({
      user,
      activeEnrollment,
      allEnrollments,
      questionnaire,
      subscription,
      courseProgress,
      recommendations: questionnaire
        ? {
            level: questionnaire.courseLevel,
            intensity: questionnaire.intensity,
            focus: questionnaire.focus,
            recommendedCourses: questionnaire.recommendedCourses,
          }
        : null,
    });
  } catch (error) {
    console.error("Error fetching user progress:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

// Rota POST para criar uma nova matrícula sem ativar automaticamente
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;

  try {
    const body = await request.json();
    const { courseId } = z.object({
      courseId: z.number(),
    }).parse(body);

    // Verificar se o curso existe
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    // Verificar se já existe matrícula neste curso
    const existingEnrollment = await prisma.userEnrollment.findFirst({
      where: {
        userId,
        courseId,
      },
    });

    if (existingEnrollment) {
      return NextResponse.json({
        success: true,
        message: "Enrollment already exists",
        enrollment: existingEnrollment,
      });
    }

    // Buscar a primeira unidade e lição
    const firstUnit = await prisma.unit.findFirst({
      where: { courseId },
      orderBy: { order: 'asc' },
    });

    const firstLesson = firstUnit ? await prisma.lesson.findFirst({
      where: { unitId: firstUnit.id },
      orderBy: { order: 'asc' },
    }) : null;

    // Criar nova matrícula (não ativa por padrão)
    const enrollment = await prisma.userEnrollment.create({
      data: {
        userId,
        courseId,
        isActive: false, // Não ativar automaticamente
        status: "ACTIVE",
        currentUnitId: firstUnit?.id || null,
        currentLessonId: firstLesson?.id || null,
        courseHearts: 5,
        coursePoints: 0,
        progressPercent: 0,
        startedAt: new Date(),
        lastAccessedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      enrollment,
    });
  } catch (error) {
    console.error("Error creating enrollment:", error);
    
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid data", { status: 400 });
    }

    return new NextResponse("Internal server error", { status: 500 });
  }
}