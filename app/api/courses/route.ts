// app/api/courses/route.ts
import { NextResponse } from 'next/server';
import { getCoursesWithEnrollmentCountOptimized } from '@/lib/db/queries';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sourceLanguage = searchParams.get('sourceLanguage') || undefined;
    
    const courses = await getCoursesWithEnrollmentCountOptimized(sourceLanguage);
    return NextResponse.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}