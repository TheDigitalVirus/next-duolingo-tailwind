import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
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

    // Atualizar o usuário com o curso selecionado
    await prisma.user.update({
      where: { id: userId },
      data: {
        selectedCourseId: courseId,
      },
    });

    // Verificar se o userProgress existe
    const existingProgress = await prisma.userProgress.findUnique({
      where: { userId },
    });

    if (existingProgress) {
      // Atualizar progresso existente
      await prisma.userProgress.update({
        where: { userId },
        data: { activeCourseId: courseId },
      });
    } else {
      // Criar novo progresso
      await prisma.userProgress.create({
        data: {
          userId,
          activeCourseId: courseId,
          userName: session.user.name || "User",
          userImageSrc: session.user.image || "/mascot.svg",
          hearts: 5,
          points: 0,
          level: 1,
          completedLessons: [],
          completedExercises: [],
          totalStudyTime: 0,
          dailyStudyTime: 0,
          perfectExercises: 0,
          currentStreak: 0,
          longestStreak: 0,
          lastActivityAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Course activated successfully",
      course: {
        id: course.id,
        title: course.title,
        category: course.category,
        level: course.level,
      },
    });
  } catch (error) {
    console.error("Error activating course:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
