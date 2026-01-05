import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import authOptions from "../../auth/[...nextauth]/auth-options";

// Função para verificar se o usuário é admin (reutilizável)
const getIsAdmin = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) return false;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      role: {
        select: { name: true },
      },
    },
  });

  return user?.role?.name === "admin";
};

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> } // Changed to Promise
) => {
  try {
    const { courseId } = await params; // Await the params
    const courseIdNum = parseInt(courseId);
    
    if (isNaN(courseIdNum)) {
      return new NextResponse("Invalid course ID", { status: 400 });
    }

    const data = await prisma.course.findUnique({
      where: { id: courseIdNum },
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

    if (!data) {
      return new NextResponse("Course not found", { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching course:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const PUT = async (
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> } // Changed to Promise
) => {
  try {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) {
      return new NextResponse("Unauthorized.", { status: 401 });
    }

    const { courseId } = await params; // Await the params
    const courseIdNum = parseInt(courseId);

    if (isNaN(courseIdNum)) {
      return new NextResponse("Invalid course ID", { status: 400 });
    }

    const body = await req.json();

    // Verificar se o curso existe
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseIdNum },
    });

    if (!existingCourse) {
      return new NextResponse("Course not found", { status: 404 });
    }

    const data = await prisma.course.update({
      where: { id: courseIdNum },
      data: {
        title: body.title,
        imageSrc: body.imageSrc,
        description: body.description,
        language: body.language,
        technology: body.technology,
        category: body.category,
        level: body.level,
        estimatedHours: body.estimatedHours,
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating course:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> } // Changed to Promise
) => {
  try {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) {
      return new NextResponse("Unauthorized.", { status: 401 });
    }

    const { courseId } = await params; // Await the params
    const courseIdNum = parseInt(courseId);

    if (isNaN(courseIdNum)) {
      return new NextResponse("Invalid course ID", { status: 400 });
    }

    // Verificar se o curso existe
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseIdNum },
    });

    if (!existingCourse) {
      return new NextResponse("Course not found", { status: 404 });
    }

    const data = await prisma.course.delete({
      where: { id: courseIdNum },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error deleting course:", error);

    // Tratar erro de constraint de chave estrangeira
    if (
      error instanceof Error &&
      error.message.includes("foreign key constraint")
    ) {
      return new NextResponse(
        "Cannot delete course because it is being used by other records",
        { status: 409 }
      );
    }

    return new NextResponse("Internal Server Error", { status: 500 });
  }
};