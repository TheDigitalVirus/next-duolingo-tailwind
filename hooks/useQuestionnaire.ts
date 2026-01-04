// hooks/useQuestionnaire.ts
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface CourseLevel {
  level: string;
  intensity: string;
  focus: string;
}

export function useQuestionnaire() {
  const [showQuestionnaire, setShowQuestionnaire] = useState(true);
  const [courseLevel, setCourseLevel] = useState<CourseLevel | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Buscar os parâmetros da URL quando o componente montar
  useEffect(() => {
    const courseId = searchParams?.get("courseId");
    const courseTitle = searchParams?.get("courseTitle");

    if (courseId && courseTitle) {
      setSelectedCourse({
        id: courseId,
        title: decodeURIComponent(courseTitle),
      });
    }
  }, [searchParams]);

  // Função para salvar o questionário
  const handleQuestionnaireComplete = async (answers: any) => {
    setIsLoading(true);
    try {
      const payload = {
        ...answers,
        courseId: selectedCourse ? Number(selectedCourse.id) : null,
        courseTitle: selectedCourse?.title,
      };

      const response = await fetch("/api/user/questionnaire", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to save questionnaire");
      }

      const data = await response.json();

      // Determinar o nível do curso baseado nas respostas
      const level = determineCourseLevel(answers);
      setCourseLevel(level);
      setShowQuestionnaire(false);

      // Redirecionar para a página de aprendizado após 3 segundos
      setTimeout(() => {
        router.push("/learn");
      }, 3000);
    } catch (error) {
      console.error("Error saving questionnaire:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para determinar o nível do curso baseado nas respostas
  const determineCourseLevel = (answers: any): CourseLevel => {
    const { languageLevel, dailyGoal, learningGoal } = answers;

    let level = "beginner";
    let intensity = "moderate";
    let focus = "conversation";

    // Determinar nível baseado no conhecimento do idioma
    if (languageLevel?.includes("não sei nada")) {
      level = "beginner";
    } else if (languageLevel?.includes("algumas palavras")) {
      level = "elementary";
    } else if (languageLevel?.includes("conversas simples")) {
      level = "intermediate";
    } else if (languageLevel?.includes("assuntos variados")) {
      level = "upper-intermediate";
    } else if (languageLevel?.includes("maioria dos assuntos")) {
      level = "advanced";
    }

    // Determinar intensidade baseado na meta diária
    if (dailyGoal?.includes("5 min")) {
      intensity = "casual";
    } else if (dailyGoal?.includes("10 min")) {
      intensity = "moderate";
    } else if (dailyGoal?.includes("15 min")) {
      intensity = "intense";
    } else if (dailyGoal?.includes("20 min")) {
      intensity = "very intense";
    }

    // Determinar foco baseado no objetivo de aprendizado
    if (learningGoal?.includes("carreira")) {
      focus = "professional";
    } else if (learningGoal?.includes("viagem")) {
      focus = "travel";
    } else if (learningGoal?.includes("educação")) {
      focus = "academic";
    } else if (learningGoal?.includes("pessoas")) {
      focus = "social";
    } else if (learningGoal?.includes("diversão")) {
      focus = "casual";
    }

    return { level, intensity, focus };
  };

  return {
    showQuestionnaire,
    courseLevel,
    selectedCourse,
    handleQuestionnaireComplete,
    isLoading,
  };
}
