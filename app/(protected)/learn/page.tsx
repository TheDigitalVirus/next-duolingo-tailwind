"use client";

import { type NextPage } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PracticeExerciseSvg, UpArrowSvg } from "@/components/Svgs";
import { units } from "@/utils/units";
import { NotificationPrompt } from "./components/NotificationPrompt";
import { UnitSection } from "./components/UnitSection";

const floatingButtonClass =
  "absolute flex items-center justify-center border-2 border-b-4 border-[#37464F] bg-[#131F24] transition hover:bg-[#202F36]";

// Fundo, TopBar e RightBar vêm do layout (app/(protected)/layout.tsx).
const Learn: NextPage = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const updateScrollY = () => setScrollY(window.scrollY);
    updateScrollY();
    document.addEventListener("scroll", updateScrollY);
    return () => document.removeEventListener("scroll", updateScrollY);
  }, []);

  return (
    <>
      <div className="flex flex-col lg:-mt-6">
        {units.map((unit) => (
          <UnitSection unit={unit} key={unit.unitNumber} />
        ))}

        <div className="sticky bottom-28 left-0 right-0 flex items-end justify-between lg:bottom-8">
          <Link
            href="/practice"
            className={`${floatingButtonClass} left-0 h-16 w-16 rounded-full`}
          >
            <span className="sr-only">Exercício de prática</span>
            <PracticeExerciseSvg className="h-8 w-8" />
          </Link>
          {scrollY > 100 && (
            <button
              className={`${floatingButtonClass} right-0 h-14 w-14 self-end rounded-2xl`}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <span className="sr-only">Voltar ao topo</span>
              <UpArrowSvg />
            </button>
          )}
        </div>
      </div>

      <div className="pt-[90px]"></div>

      <NotificationPrompt />
    </>
  );
};

export default Learn;
