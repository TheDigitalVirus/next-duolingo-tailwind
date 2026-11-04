import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import authOptions from "../../auth/[...nextauth]/auth-options";

/** Lista os cursos em que o usuário está matriculado (usado em "Meus cursos"). */
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const enrollments = await prisma.userEnrollment.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isActive: "desc" }, { lastAccessedAt: "desc" }],
      select: {
        isActive: true,
        coursePoints: true,
        course: {
          select: { id: true, title: true, imageSrc: true, language: true },
        },
      },
    });

    return NextResponse.json(
      enrollments.map(({ course, isActive, coursePoints }) => ({
        courseId: course.id,
        title: course.title,
        imageSrc: course.imageSrc,
        language: course.language,
        isActive,
        coursePoints,
      })),
    );
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
