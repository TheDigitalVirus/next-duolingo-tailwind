import { cache } from "react";
import { getServerSession } from "next-auth";
import prisma from "../prisma";
import authOptions from "@/app/api/auth/[...nextauth]/auth-options";

const DAY_IN_MS = 86_400_000;

// Funções auxiliares
const getActiveEnrollment = cache(async (userId: string) => {
  const enrollment = await prisma.userEnrollment.findFirst({
    where: {
      userId,
      isActive: true,
      status: "ACTIVE",
    },
    include: {
      course: true,
      currentUnit: true,
      currentLesson: true,
    },
  });

  return enrollment;
});

// Queries principais
export const getCourses = cache(async () => {
  const data = await prisma.course.findMany({
    where: { isPublic: true },
    orderBy: { title: "asc" },
  });
  return data;
});

export const getUserData = cache(async () => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) return null;

  const data = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      enrollments: {
        where: { status: "ACTIVE" },
        include: {
          course: true,
          currentUnit: true,
          currentLesson: true,
        },
        orderBy: { isActive: "desc" },
      },
    },
  });

  return data;
});

export const getUnits = cache(async () => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const activeEnrollment = await getActiveEnrollment(userId!);

  if (!userId || !activeEnrollment?.courseId) return [];

  const data = await prisma.unit.findMany({
    where: { courseId: activeEnrollment.courseId },
    orderBy: { order: "asc" },
    include: {
      lessons: {
        orderBy: { order: "asc" },
        include: {
          challenges: {
            orderBy: { order: "asc" },
            include: {
              challengeProgress: {
                where: { 
                  userId,
                  enrollmentId: activeEnrollment.id 
                },
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
  const activeEnrollment = await getActiveEnrollment(userId!);

  if (!userId || !activeEnrollment?.courseId) return null;

  const unitsInActiveCourse = await prisma.unit.findMany({
    orderBy: { order: "asc" },
    where: { courseId: activeEnrollment.courseId },
    include: {
      lessons: {
        orderBy: { order: "asc" },
        include: {
          unit: true,
          challenges: {
            include: {
              challengeProgress: {
                where: { 
                  userId,
                  enrollmentId: activeEnrollment.id 
                },
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
    enrollment: activeEnrollment,
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
            where: { 
              userId,
              enrollmentId: courseProgress?.enrollment.id 
            },
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

  const data = await prisma.user.findMany({
    orderBy: { totalPoints: "desc" },
    take: 10,
    select: {
      id: true,
      name: true,
      totalPoints: true,
      level: true,
      avatar: {
        select: {
          url: true,
        },
      },
    },
  });

  return data.map(user => ({
    userId: user.id,
    userName: user.name || "Anonymous",
    userImageSrc: user.avatar?.url || "/mascot.svg",
    points: user.totalPoints,
    level: user.level,
  }));
});

export const getUserQuestionnaire = cache(async () => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) return null;

  const data = await prisma.userQuestionnaire.findFirst({
    where: { userId },
  });

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
  selectedCourseId?: number;
  selectedCourseTitle?: string;
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
    include: {
      role: true,
    },
  });

  return user?.role?.name === "ADMIN" || user?.role?.name === "OWNER";
};

export const getEnrolledUsersCountByCourseId = cache(async (courseId: number) => {
  const count = await prisma.userEnrollment.count({
    where: {
      courseId,
      status: "ACTIVE",
    },
  });
  
  return count;
});

export const getCoursesWithEnrollmentCountOptimized = cache(async (sourceLanguage?: string) => {
  const enrollmentCounts = await prisma.userEnrollment.groupBy({
    by: ['courseId'],
    _count: {
      courseId: true,
    },
    where: {
      status: "ACTIVE",
    },
  });
  
  // Cria um mapa de courseId -> count
  const enrollmentMap = new Map<number, number>();
  enrollmentCounts.forEach(item => {
    enrollmentMap.set(item.courseId, item._count.courseId);
  });
  
  // Busca todos os cursos públicos
  const courses = await prisma.course.findMany({
    where: { isPublic: true },
  });
  
  // Combina os dados
  const coursesWithCounts = courses.map(course => ({
    ...course,
    enrolledCount: enrollmentMap.get(course.id) || 0,
  }));
  
  // Filtra por idioma de origem se especificado
  if (sourceLanguage) {
    return coursesWithCounts.filter(course => 
      course.language === sourceLanguage
    );
  }
  
  return coursesWithCounts;
});

// Novas queries específicas para múltiplos cursos

export const getUserEnrollments = cache(async () => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) return [];

  const data = await prisma.userEnrollment.findMany({
    where: { 
      userId,
      status: "ACTIVE",
    },
    include: {
      course: true,
      currentUnit: true,
      currentLesson: true,
    },
    orderBy: [
      { isActive: "desc" },
      { lastAccessedAt: "desc" },
    ],
  });

  return data;
});

export const getUserEnrollmentByCourseId = cache(async (courseId: number) => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) return null;

  const data = await prisma.userEnrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
    include: {
      course: {
        include: {
          units: {
            include: {
              lessons: {
                include: {
                  challenges: {
                    include: {
                      challengeProgress: {
                        where: { 
                          userId,
                          enrollment: {
                            userId,
                            courseId,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  return data;
});

export const switchActiveCourse = async (courseId: number) => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) throw new Error("User not authenticated");

  // Desativar todos os cursos ativos do usuário
  await prisma.userEnrollment.updateMany({
    where: {
      userId,
      isActive: true,
    },
    data: {
      isActive: false,
    },
  });

  // Ativar o novo curso
  const enrollment = await prisma.userEnrollment.update({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
    data: {
      isActive: true,
      lastAccessedAt: new Date(),
    },
  });

  return enrollment;
};

export const enrollInCourse = async (courseId: number) => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) throw new Error("User not authenticated");

  // Verificar se já está matriculado
  const existingEnrollment = await prisma.userEnrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
  });

  if (existingEnrollment) {
    // Se já existe, apenas ativar
    return await switchActiveCourse(courseId);
  }

  // Buscar primeira lição do curso
  const firstLesson = await prisma.lesson.findFirst({
    where: {
      unit: {
        courseId,
      },
    },
    orderBy: {
      order: 'asc',
    },
    include: {
      unit: true,
    },
  });

  // Criar nova matrícula
  const enrollment = await prisma.userEnrollment.create({
    data: {
      userId,
      courseId,
      status: "ACTIVE",
      isActive: true, // Será o curso ativo
      currentUnitId: firstLesson?.unitId,
      currentLessonId: firstLesson?.id,
      enrolledAt: new Date(),
      startedAt: new Date(),
      lastAccessedAt: new Date(),
    },
    include: {
      course: true,
    },
  });

  return enrollment;
};

export const updateLessonProgress = async (
  lessonId: number, 
  completedChallenges: number[]
) => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) throw new Error("User not authenticated");

  // Buscar matrícula ativa
  const activeEnrollment = await getActiveEnrollment(userId);
  
  if (!activeEnrollment) {
    throw new Error("No active enrollment found");
  }

  // Buscar lição para obter o unitId
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      unit: true,
    },
  });

  if (!lesson) {
    throw new Error("Lesson not found");
  }

  // Atualizar matrícula com a lição atual
  await prisma.userEnrollment.update({
    where: { id: activeEnrollment.id },
    data: {
      currentUnitId: lesson.unitId,
      currentLessonId: lessonId,
      completedLessons: {
        push: lessonId,
      },
      completedChallenges: {
        push: completedChallenges,
      },
      lastAccessedAt: new Date(),
    },
  });

  // Buscar próximo lesson para sugerir
  const nextLesson = await prisma.lesson.findFirst({
    where: {
      unitId: lesson.unitId,
      order: { gt: lesson.order },
    },
    orderBy: { order: 'asc' },
  });

  return {
    nextLesson,
    currentLesson: lesson,
  };
};

export const getLeaderboardData = cache(async () => {
  const users = await prisma.user.findMany({
    where: {
      status: "ACTIVE",
    },
    orderBy: [
      { totalPoints: "desc" },
      { currentStreak: "desc" },
      { level: "desc" },
    ],
    take: 100,
    select: {
      id: true,
      name: true,
      email: true,
      totalPoints: true,
      level: true,
      currentStreak: true,
      longestStreak: true,
      totalStudyTime: true,
      perfectExercises: true,
      avatar: {
        select: {
          url: true,
        },
      },
      enrollments: {
        where: { isActive: true },
        include: {
          course: true,
        },
      },
    },
  });

  return users.map((user, index) => ({
    rank: index + 1,
    userId: user.id,
    userName: user.name || "Anonymous",
    userImageSrc: user.avatar?.url || "/mascot.svg",
    points: user.totalPoints,
    level: user.level,
    streak: user.currentStreak,
    totalStudyTime: user.totalStudyTime,
    perfectExercises: user.perfectExercises,
    activeCourse: user.enrollments[0]?.course?.title || "Nenhum curso ativo",
  }));
});