"use client";

import dayjs from "dayjs";
import Link from "next/link";
import type { ComponentProps } from "react";
import { useState } from "react";
import { useBoundStore } from "@/hooks/useBoundStore";
import { useEnrollments } from "@/hooks/use-enrollments";
import { Calendar } from "./Calendar";
import { CourseImage, CourseSwitcherMenu } from "./CourseSwitcher";
import {
  FireSvg,
  GemSvg,
  LessonTopBarEmptyHeart,
  LessonTopBarHeart,
  LingotsTreasureChestSvg,
} from "./Svgs";

const EmptyFireTopBarSvg = (props: ComponentProps<"svg">) => {
  return (
    <svg width="25" height="30" viewBox="0 0 25 30" fill="none" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.9697 2.91035C13.2187 1.96348 11.7813 1.96348 11.0303 2.91035L7.26148 7.66176L4.83362 6.36218C4.61346 6.24433 4.1221 6.09629 3.88966 6.05712C2.72329 5.86056 2.04098 6.78497 2.04447 8.03807L2.06814 16.5554C2.02313 16.9355 2 17.322 2 17.7137C2 23.2979 6.70101 27.8248 12.5 27.8248C18.299 27.8248 23 23.2979 23 17.7137C23 15.3518 22.1591 13.1791 20.7498 11.4581L13.9697 2.91035ZM11.7198 13.1888C12.0889 12.6861 12.8399 12.6861 13.209 13.1888L15.7324 16.6249C16.5171 17.4048 17 18.4679 17 19.6396C17 22.0329 14.9853 23.973 12.5 23.973C10.0147 23.973 8 22.0329 8 19.6396C8 18.6017 8.37893 17.649 9.01085 16.9029C9.0252 16.8668 9.04457 16.8315 9.06935 16.7978L11.7198 13.1888Z"
        fill="#37464F"
      />
    </svg>
  );
};

const EmptyGemTopBarSvg = (props: ComponentProps<"svg">) => {
  return (
    <svg width="24" height="30" viewBox="0 0 24 30" fill="none" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.63705 7.31556C2.62104 7.92872 2 9.02888 2 10.2156V19.8818C2 21.0685 2.62104 22.1687 3.63705 22.7819L10.1117 26.6893C11.1881 27.3389 12.5356 27.3389 13.612 26.6894L20.087 22.7818C21.1031 22.1687 21.7241 21.0685 21.7241 19.8818V10.2156C21.7241 9.0289 21.1031 7.92872 20.087 7.31557L13.612 3.40806C12.5356 2.7585 11.1881 2.75851 10.1117 3.40809L3.63705 7.31556ZM11.8902 6.37281C11.8902 5.52831 10.9645 5.01055 10.2449 5.45256L4.91163 8.72852C4.24944 9.13527 4.22068 10.0873 4.85711 10.5332L7.24315 12.2053C7.59354 12.4508 8.05585 12.4663 8.42194 12.2449L11.3692 10.462C11.6926 10.2664 11.8902 9.91591 11.8902 9.53794V6.37281Z"
        fill="#37464F"
      />
    </svg>
  );
};

type MenuState = "HIDDEN" | "LANGUAGES" | "STREAK" | "GEMS" | "HEARTS";

/** Barra superior com os status do usuário, visível só abaixo de `lg`. */
export const TopBar = () => {
  const [menu, setMenu] = useState<MenuState>("HIDDEN");
  const [now, setNow] = useState(dayjs());
  const streak = useBoundStore((x) => x.streak);
  const gems = useBoundStore((x) => x.gems);
  const hearts = useBoundStore((x) => x.hearts);
  const activeDays = useBoundStore((x) => x.activeDays);
  const { activeEnrollment } = useEnrollments();

  const practicedToday = activeDays.includes(dayjs().format("YYYY-MM-DD"));
  const toggle = (target: MenuState) =>
    setMenu((current) => (current === target ? "HIDDEN" : target));

  return (
    <header className="fixed left-0 right-0 top-0 z-30 h-[58px] lg:hidden">
      <div className="relative flex h-full w-full items-center justify-between border-b-2 border-[#37464F] bg-[#131F24] px-4">
        <button className="flex items-center gap-2 font-bold" onClick={() => toggle("LANGUAGES")}>
          <CourseImage course={activeEnrollment} />
          {activeEnrollment && (
            <span className="text-[#58CC02]">{activeEnrollment.coursePoints}</span>
          )}
          <span className="sr-only">Ver cursos</span>
        </button>

        <button
          className="flex items-center gap-2 font-bold"
          onClick={() => toggle("STREAK")}
          aria-label="Abrir ofensiva"
        >
          {practicedToday ? <FireSvg /> : <EmptyFireTopBarSvg />}
          <span className={practicedToday ? "text-[#FF9600]" : "text-[#52656D]"}>
            {streak}
          </span>
        </button>

        <button
          className="flex items-center gap-2 font-bold"
          onClick={() => toggle("GEMS")}
          aria-label="Abrir gemas"
        >
          {gems > 0 ? <GemSvg /> : <EmptyGemTopBarSvg />}
          <span className={gems > 0 ? "text-[#FF4B4B]" : "text-[#52656D]"}>{gems}</span>
        </button>

        <button
          className="flex items-center gap-2 font-bold"
          onClick={() => toggle("HEARTS")}
          aria-label="Abrir vidas"
        >
          {hearts > 0 ? <LessonTopBarHeart /> : <LessonTopBarEmptyHeart />}
          <span className={hearts > 0 ? "text-[#FF4B4B]" : "text-[#52656D]"}>
            {hearts}
          </span>
        </button>

        <div
          className={[
            "absolute left-0 right-0 top-full border-b-2 border-[#37464F] bg-[#131F24] text-[#DCE6EC] transition duration-300",
            menu === "HIDDEN" ? "pointer-events-none opacity-0" : "opacity-100",
          ].join(" ")}
          aria-hidden={menu === "HIDDEN"}
        >
          {(() => {
            switch (menu) {
              case "LANGUAGES":
                return <CourseSwitcherMenu onSelect={() => setMenu("HIDDEN")} />;

              case "STREAK":
                return (
                  <div className="flex grow flex-col items-center gap-3 p-5">
                    <h2 className="text-xl font-bold text-white">
                      Ofensiva de {streak} {streak === 1 ? "dia" : "dias"}
                    </h2>
                    <p className="text-sm text-[#9DB1BB]">
                      Pratique todo dia para não perder sua ofensiva!
                    </p>
                    <div className="self-stretch">
                      <Calendar now={now} setNow={setNow} />
                    </div>
                  </div>
                );

              case "GEMS":
                return (
                  <div className="flex grow items-center gap-3 p-5">
                    <LingotsTreasureChestSvg className="h-24 w-24" />
                    <div className="flex flex-col gap-3">
                      <h2 className="text-xl font-bold text-white">Gemas</h2>
                      <p className="text-sm text-[#9DB1BB]">
                        Você tem {gems} {gems === 1 ? "gema" : "gemas"}.
                      </p>
                      <Link
                        className="font-bold uppercase tracking-wide text-[#49C0F8] transition hover:brightness-110"
                        href="/shop"
                      >
                        Ir para a loja
                      </Link>
                    </div>
                  </div>
                );

              case "HEARTS":
                return (
                  <div className="flex flex-col gap-3 p-5">
                    <h2 className="text-xl font-bold text-white">Vidas</h2>
                    <p className="text-sm text-[#9DB1BB]">
                      {hearts > 0
                        ? `Você tem ${hearts} ${hearts === 1 ? "vida" : "vidas"}. Cada erro custa uma.`
                        : "Suas vidas acabaram. Recarregue na loja para continuar."}
                    </p>
                    <Link
                      className="font-bold uppercase tracking-wide text-[#49C0F8] transition hover:brightness-110"
                      href="/shop"
                    >
                      Recarregar vidas
                    </Link>
                  </div>
                );

              case "HIDDEN":
                return null;
            }
          })()}
          <div
            className={[
              "absolute left-0 top-full h-screen w-screen bg-black/50",
              menu === "HIDDEN" ? "pointer-events-none" : "",
            ].join(" ")}
            onClick={() => {
              setMenu("HIDDEN");
              setNow(dayjs());
            }}
            aria-label="Fechar menu"
            role="button"
          ></div>
        </div>
      </div>
    </header>
  );
};
