import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { EnrollmentStatus } from "@prisma/client";
import authOptions from "../../auth/[...nextauth]/auth-options";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const body = await req.json();
    let courseId: number | null = null;

    if (typeof body === "object" && body !== null && "courseId" in body) {
      const raw = (body as Record<string, unknown>).courseId;
      if (typeof raw === "string" || typeof raw === "number") {
        courseId = Number(raw);
      }
    }

    if (!courseId) {
      return NextResponse.json(
        { error: "courseId is required" },
        { status: 400 }
      );
    }

    // Verificar se o curso existe
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Verificar se o usuário já está matriculado neste curso
    const existingEnrollment = await prisma.userEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json({
        success: true,
        message: "User already enrolled in this course",
        enrollment: existingEnrollment,
      });
    }

    // Buscar primeira lição do curso para definir como atual
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

    // Verificar quantos cursos ativos o usuário já tem
    const activeEnrollments = await prisma.userEnrollment.count({
      where: {
        userId,
        isActive: true,
        status: EnrollmentStatus.ACTIVE,
      },
    });

    // Criar nova matrícula
    const enrollment = await prisma.userEnrollment.create({
      data: {
        userId,
        courseId,
        status: EnrollmentStatus.ACTIVE,
        isActive: activeEnrollments === 0, // Se não tiver nenhum ativo, este será ativo
        progressPercent: 0,
        completedLessons: [],
        completedChallenges: [],
        coursePoints: 0,
        courseHearts: 5,
        perfectChallenges: 0,
        totalTimeSpent: 0,
        enrolledAt: new Date(),
        startedAt: new Date(),
        lastAccessedAt: new Date(),
        currentUnitId: firstLesson?.unitId,
        currentLessonId: firstLesson?.id,
      },
      include: {
        course: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Successfully enrolled in course",
      enrollment,
    });
  } catch (error) {
    console.error("Error enrolling in course:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}