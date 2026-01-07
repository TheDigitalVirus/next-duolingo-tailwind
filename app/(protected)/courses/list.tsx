"use client";

import { useTransition } from "react";

import { useRouter } from "next/navigation";
import { toast } from "sonner";


import { Card } from "./card";
import { Course, UserProgress } from "@prisma/client";
import { upsertUserProgress } from "@/actions/user-progress";

type ListProps = {
  courses: Course[];
  user?: UserProgress | null;
};

export const List = ({ courses, user }: ListProps) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const onClick = (id: number) => {
    if (pending) return;

    if (id === user?.activeCourseId) return router.push("/learn");

    startTransition(() => {
      upsertUserProgress(id).catch(() => toast.error("Something went wrong."));
    });
  };

  return (
    <div className="grid grid-cols-2 gap-4 pt-6 lg:grid-cols-[repeat(auto-fill,minmax(210px,1fr))]">
      {courses.map((course) => (
        <Card
          key={course.id}
          id={course.id}
          title={course.title}
          imageSrc={course.imageSrc}
          onClick={onClick}
          disabled={pending}
          isActive={course.id === user?.activeCourseId}
        />
      ))}
    </div>
  );
};