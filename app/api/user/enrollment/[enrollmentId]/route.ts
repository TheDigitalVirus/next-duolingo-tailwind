import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { EnrollmentStatus } from "@prisma/client";
import authOptions from "../../../auth/[...nextauth]/auth-options";

const enrollmentUpdateSchema = z.object({
  status: z.nativeEnum(EnrollmentStatus).optional(),
  isActive: z.boolean().optional(),
  progressPercent: z.number().min(0).max(100).optional(),
  completedLessons: z.array(z.number()).optional(),
  completedChallenges: z.array(z.number()).optional(),
  coursePoints: z.number().optional(),
  courseHearts: z.number().optional(),
  perfectChallenges: z.number().optional(),
  totalTimeSpent: z.number().optional(),
  currentUnitId: z.number().nullable().optional(),
  currentLessonId: z.number().nullable().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { enrollmentId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  const enrollmentId = parseInt(params.enrollmentId);

  if (isNaN(enrollmentId)) {
    return new NextResponse("Invalid enrollment ID", { status: 400 });
  }

  try {
    const body = await request.json();
    const validatedData = enrollmentUpdateSchema.parse(body);

    // Verificar se a matrícula pertence ao usuário
    const enrollment = await prisma.userEnrollment.findFirst({
      where: {
        id: enrollmentId,
        userId,
      },
    });

    if (!enrollment) {
      return new NextResponse("Enrollment not found", { status: 404 });
    }

    // Se estiver ativando esta matrícula, desativar outras
    if (validatedData.isActive === true) {
      await prisma.userEnrollment.updateMany({
        where: {
          userId,
          id: { not: enrollmentId },
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });
    }

    // Atualizar a matrícula
    const updatedEnrollment = await prisma.userEnrollment.update({
      where: { id: enrollmentId },
      data: {
        ...validatedData,
        lastAccessedAt: new Date(),
      },
      include: {
        course: true,
        currentUnit: true,
        currentLesson: true,
      },
    });

    return NextResponse.json({
      success: true,
      enrollment: updatedEnrollment,
    });
  } catch (error) {
    console.error("Error updating enrollment:", error);

    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid data", { status: 400 });
    }

    return new NextResponse("Internal server error", { status: 500 });
  }
}

// GET para obter uma matrícula específica
export async function GET(
  request: Request,
  { params }: { params: { enrollmentId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  const enrollmentId = parseInt(params.enrollmentId);

  if (isNaN(enrollmentId)) {
    return new NextResponse("Invalid enrollment ID", { status: 400 });
  }

  try {
    const enrollment = await prisma.userEnrollment.findFirst({
      where: {
        id: enrollmentId,
        userId,
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
                            enrollmentId,
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
        currentUnit: true,
        currentLesson: true,
      },
    });

    if (!enrollment) {
      return new NextResponse("Enrollment not found", { status: 404 });
    }

    return NextResponse.json({
      success: true,
      enrollment,
    });
  } catch (error) {
    console.error("Error fetching enrollment:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}