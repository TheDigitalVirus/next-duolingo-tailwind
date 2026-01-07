"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "@/providers/i18n-provider";

interface CourseSelection {
  id: number;
  title: string;
  imageSrc: string;
  description: string;
}

export default function SelectCoursesPage() {
  const [courses, setCourses] = useState<CourseSelection[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCoursesLoading, setIsCoursesLoading] = useState(true);
  const router = useRouter();
  const { language, changeLanguage } = useLanguage();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await apiFetch("/api/courses");
        if (response.ok) {
          const coursesData = await response.json();
          const filteredCourses = coursesData.filter((lang: { language: string; }) => lang.language == language.code);
          setCourses(filteredCourses);
        }
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setIsCoursesLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleCourseSelect = (courseId: number) => {
    setSelectedCourseId(selectedCourseId === courseId ? null : courseId);
  };

  const handleStartLearning = async () => {
    if (!selectedCourseId) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/user/activate-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: selectedCourseId }),
      });

      if (!response.ok) throw new Error("Failed to activate course");

      const selectedCourse = courses.find(
        (course) => course.id === selectedCourseId
      );
      const queryParams = new URLSearchParams({
        courseId: selectedCourseId.toString(),
        courseTitle: selectedCourse?.title || "",
      });

      router.push(`/onboarding?${queryParams}`);
    } catch (error) {
      console.error("Error starting learning:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isCoursesLoading) {
    return <LoadingSpinner message="Carregando cursos..." />;
  }

  const selectedCourse = courses.find(
    (course) => course.id === selectedCourseId
  );

  return (
    <div className="min-h-screen bg-linear-to-b from-green-50 to-white py-8">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-800">
            Escolha seu idioma
          </h1>
          <p className="text-xl text-gray-600">
            Selecione o idioma que você quer aprender
          </p>
        </div>

        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              isSelected={selectedCourseId === course.id}
              onSelect={() => handleCourseSelect(course.id)}
            />
          ))}
        </div>

        {selectedCourse && (
          <div className="mb-8 rounded-xl bg-blue-50 p-6 text-center">
            <h3 className="text-lg font-semibold text-blue-800">
              Curso selecionado:
            </h3>
            <p className="text-xl font-bold text-blue-900">
              {selectedCourse.title}
            </p>
          </div>
        )}

        <div className="text-center">
          <Button
            onClick={handleStartLearning}
            disabled={!selectedCourseId || isLoading}
            className="bg-green-600 px-8 py-3 text-white hover:bg-green-700"
          >
            {isLoading ? "Carregando..." : "Personalizar Meu Aprendizado"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function CourseCard({
  course,
  isSelected,
  onSelect,
}: {
  course: CourseSelection;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={`cursor-pointer rounded-xl border-2 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl ${
        isSelected
          ? "border-green-500 bg-green-50 ring-2 ring-green-200"
          : "border-gray-200"
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center">
        <div className="relative mr-4 h-16 w-16">
          <img
            src={course.imageSrc}
            alt={course.title}
            className="object-contain"
          />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800">{course.title}</h3>
          <p className="text-sm text-gray-600">{course.description}</p>
        </div>
        <div
          className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
            isSelected ? "border-green-500 bg-green-500" : "border-gray-300"
          }`}
        >
          {isSelected && <span className="text-sm text-white">✓</span>}
        </div>
      </div>
    </div>
  );
}
