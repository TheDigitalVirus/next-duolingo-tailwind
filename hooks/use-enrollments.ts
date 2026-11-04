"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type Enrollment = {
  courseId: number;
  title: string;
  imageSrc: string;
  language: string | null;
  isActive: boolean;
  coursePoints: number;
};

const ENROLLMENTS_KEY = ["user", "enrollments"] as const;

const fetchEnrollments = async (): Promise<Enrollment[]> => {
  const response = await fetch("/api/user/enrollments");
  if (!response.ok) {
    throw new Error("Falha ao carregar os cursos");
  }
  return response.json();
};

/** Cursos do usuário e o curso ativo no momento. */
export const useEnrollments = () => {
  const query = useQuery({
    queryKey: ENROLLMENTS_KEY,
    queryFn: fetchEnrollments,
    staleTime: 60_000,
  });

  const enrollments = query.data ?? [];
  const activeEnrollment = enrollments.find((e) => e.isActive) ?? enrollments[0] ?? null;

  return { ...query, enrollments, activeEnrollment };
};

/** Troca o curso ativo usando a rota já existente `/api/user/activate-course`. */
export const useActivateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: number) => {
      const response = await fetch("/api/user/activate-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      if (!response.ok) {
        throw new Error("Falha ao trocar de curso");
      }
    },
    // Atualiza a UI na hora; se der erro, o refetch corrige.
    onMutate: async (courseId) => {
      await queryClient.cancelQueries({ queryKey: ENROLLMENTS_KEY });
      queryClient.setQueryData<Enrollment[]>(ENROLLMENTS_KEY, (current) =>
        current?.map((e) => ({ ...e, isActive: e.courseId === courseId })),
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ENROLLMENTS_KEY }),
  });
};
