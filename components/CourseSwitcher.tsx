"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useActivateCourse, useEnrollments, type Enrollment } from "@/hooks/use-enrollments";

/** Bandeira/ícone do curso (vem de `course.imageSrc`). */
export const CourseImage = ({
  course,
  className = "h-6 w-8",
}: {
  course: Pick<Enrollment, "imageSrc" | "title"> | null;
  className?: string;
}) => {
  if (!course) {
    return <span className={`${className} rounded-md bg-[#37464F]`} aria-hidden />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={course.imageSrc}
      alt={course.title}
      className={`${className} shrink-0 rounded-md object-cover`}
    />
  );
};

/** Lista "MEUS CURSOS" com troca de curso ativo e atalho para adicionar curso. */
export const CourseSwitcherMenu = ({ onSelect }: { onSelect?: () => void }) => {
  const { enrollments, isLoading, isError } = useEnrollments();
  const activateCourse = useActivateCourse();

  return (
    <div className="py-2">
      <h2 className="px-4 pb-2 pt-1 text-xs font-bold uppercase tracking-wide text-[#52656D]">
        Meus cursos
      </h2>

      {isLoading && <p className="px-4 py-3 text-sm text-[#52656D]">Carregando...</p>}
      {isError && (
        <p className="px-4 py-3 text-sm text-[#FF4B4B]">Não foi possível carregar seus cursos.</p>
      )}

      <ul>
        {enrollments.map((course) => (
          <li key={course.courseId}>
            <button
              type="button"
              disabled={activateCourse.isPending}
              onClick={() => {
                if (!course.isActive) activateCourse.mutate(course.courseId);
                onSelect?.();
              }}
              aria-current={course.isActive ? "true" : undefined}
              className={`flex w-full items-center gap-4 px-4 py-3 text-left font-bold transition-colors ${
                course.isActive
                  ? "bg-[#202F36] text-[#49C0F8]"
                  : "text-[#DCE6EC] hover:bg-[#202F36]"
              }`}
            >
              <CourseImage course={course} />
              {course.title}
            </button>
          </li>
        ))}
      </ul>

      <div className="my-2 h-0.5 bg-[#37464F]" />

      <Link
        href="/select-courses"
        onClick={onSelect}
        className="flex items-center gap-4 px-4 py-3 font-bold text-[#DCE6EC] transition-colors hover:bg-[#202F36]"
      >
        <span className="flex h-6 w-8 items-center justify-center rounded-md border-2 border-[#52656D] text-[#52656D]">
          <Plus className="h-4 w-4" strokeWidth={3} />
        </span>
        Adicionar curso
      </Link>
    </div>
  );
};
