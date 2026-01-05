// app/api/user/questionnaire/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import authOptions from "../../auth/[...nextauth]/auth-options";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const questionnaire = await prisma.userQuestionnaire.findUnique({
      where: { userId: session.user.id },
    });

    // Retorna se o usuário completou o questionário
    return NextResponse.json({ 
      hasCompletedQuestionnaire: !!questionnaire,
      questionnaire 
    });
  } catch (error) {
    console.error("Error checking questionnaire:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { discoverySource, learningGoal, languageLevel, dailyGoal, courseId, courseTitle } = body;

    // Usar upsert para criar ou atualizar o questionário
    const questionnaire = await prisma.userQuestionnaire.upsert({
      where: { userId: session.user.id },
      update: {
        discoverySource,
        learningGoal,
        languageLevel,
        dailyGoal,
        selectedCourseId: courseId ? parseInt(courseId) : null,
        selectedCourseTitle: courseTitle,
        courseLevel: "BEGINNER",
        intensity: "REGULAR",
        focus: "GENERAL",
      },
      create: {
        userId: session.user.id,
        discoverySource,
        learningGoal,
        languageLevel,
        dailyGoal,
        selectedCourseId: courseId ? parseInt(courseId) : null,
        selectedCourseTitle: courseTitle,
        courseLevel: "BEGINNER",
        intensity: "REGULAR",
        focus: "GENERAL",
      },
    });

    return NextResponse.json(questionnaire);
  } catch (error) {
    console.error("Error saving questionnaire:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}