"use client";

import type { NextPage } from "next";
import { useMemo } from "react";
import { useBoundStore } from "@/hooks/useBoundStore";
import { buildUnits } from "@/utils/units";
import { UnitSection } from "./components/UnitSection";

const LearnPage: NextPage = () => {
  const lessonsCompleted = useBoundStore((store) => store.lessonsCompleted);
  const units = useMemo(() => buildUnits(lessonsCompleted), [lessonsCompleted]);

  return (
    <main className="min-h-screen space-y-6 p-8">
      <h1 className="text-3xl font-bold">Learn</h1>
      <p className="text-sm text-zinc-600">Lições concluídas: {lessonsCompleted}</p>

      {units.map((unit) => (
        <UnitSection key={unit.number} unit={unit} />
      ))}
    </main>
  );
};

export default LearnPage;
