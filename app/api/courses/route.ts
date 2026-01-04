import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const GET = async () => {
  try {
    const data = await prisma.course.findMany({
      orderBy: { id: "asc" }
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};