"use client";

import type { NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useBoundStore } from "@/hooks/useBoundStore";
import { useLeaderboardUsers } from "@/hooks/useLeaderboardUsers";

const LESSONS_TO_UNLOCK = 10;
const CURRENT_LEAGUE = "Liga Ouro";

const getTimeLeftInWeek = () => {
  const now = new Date();
  const endOfWeek = new Date(now);
  const day = now.getDay();
  const daysUntilSunday = (7 - day) % 7;

  endOfWeek.setDate(now.getDate() + daysUntilSunday);
  endOfWeek.setHours(23, 59, 59, 999);

  const diffMs = Math.max(0, endOfWeek.getTime() - now.getTime());
  const totalSeconds = Math.floor(diffMs / 1000);

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  return { days, hours, minutes };
};

const LeaderboardPage: NextPage = () => {
  const lessonsCompleted = useBoundStore((store) => store.lessonsCompleted);
  const leaderboardUsers = useLeaderboardUsers();
  const { status } = useSession();
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(getTimeLeftInWeek);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [router, status]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeLeft(getTimeLeftInWeek());
    }, 60_000);

    return () => clearInterval(intervalId);
  }, []);

  const isUnlocked = lessonsCompleted >= LESSONS_TO_UNLOCK;
  const lessonsMissing = Math.max(0, LESSONS_TO_UNLOCK - lessonsCompleted);

  const remainingTimeLabel = useMemo(
    () => `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}min`,
    [timeLeft.days, timeLeft.hours, timeLeft.minutes],
  );

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <main className="min-h-screen space-y-6 p-8">
      <h1 className="text-3xl font-bold">Ranking semanal</h1>

      {!isUnlocked ? (
        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Ranking bloqueado</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Complete {lessonsMissing} lição(ões) para desbloquear o ranking. Você precisa de {LESSONS_TO_UNLOCK} lições concluídas.
          </p>
          <Link
            href="/learn"
            className="mt-4 inline-flex rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Iniciar lição
          </Link>
        </section>
      ) : (
        <>
          <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-500">Liga atual</p>
            <p className="text-2xl font-bold text-amber-500">{CURRENT_LEAGUE}</p>
            <p className="mt-2 text-sm text-zinc-600">
              Tempo restante da semana: <span className="font-semibold">{remainingTimeLabel}</span>
            </p>
          </section>

          <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Usuários</h2>

            <ul className="mt-4 space-y-3">
              {leaderboardUsers.map((user, index) => (
                <li
                  key={user.id}
                  className={`flex items-center justify-between rounded-lg border px-4 py-3 ${
                    user.isCurrentUser
                      ? "border-emerald-400 bg-emerald-50"
                      : "border-zinc-200 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-sm font-semibold text-zinc-500">#{index + 1}</span>
                    <Image
                      src={user.avatarUrl}
                      alt={user.name}
                      width={36}
                      height={36}
                      className="rounded-full"
                    />
                    <span className="font-medium text-zinc-800">
                      {user.name} {user.isCurrentUser ? "(Você)" : ""}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-zinc-700">{user.points} XP</span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </main>
  );
};

export default LeaderboardPage;
