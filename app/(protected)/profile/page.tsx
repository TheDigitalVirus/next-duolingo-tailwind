"use client";

import type { NextPage } from "next";
import Link from "next/link";

import { useBoundStore } from "@/hooks/useBoundStore";
import { getAchievementsProgress } from "@/utils/achievements";

const formatDate = (value: string) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const getLeagueByXp = (xp: number) => {
  if (xp >= 5000) return "Diamante";
  if (xp >= 2500) return "Obsidiana";
  if (xp >= 1000) return "Ouro";
  if (xp >= 500) return "Prata";
  return "Bronze";
};

const getPodiumsEstimate = (xp: number) => Math.floor(xp / 1000);

const ProfilePage: NextPage = () => {
  const profile = useBoundStore((store) => ({
    loggedIn: store.loggedIn,
    name: store.name,
    username: store.username,
    joinedAt: store.joinedAt,
    language: store.language,
    streak: store.streak,
    xp: store.xp,
    following: store.following,
    followers: store.followers,
    lessonsCompleted: store.lessonsCompleted,
  }));

  if (!profile.loggedIn) {
    return (
      <main className="mx-auto min-h-screen max-w-4xl p-8">
        <h1 className="text-3xl font-bold text-neutral-800">Perfil público</h1>
        <p className="mt-3 text-neutral-600">
          Você ainda não está logado. Faça login para ver suas estatísticas, amigos e conquistas.
        </p>
        <Link href="/signin" className="mt-6 inline-flex rounded-md bg-emerald-500 px-4 py-2 font-semibold text-white">
          Ir para login
        </Link>
      </main>
    );
  }

  const league = getLeagueByXp(profile.xp);
  const podiums = getPodiumsEstimate(profile.xp);
  const achievements = getAchievementsProgress(profile);

  return (
    <main className="mx-auto min-h-screen max-w-4xl space-y-8 p-8">
      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-neutral-800">{profile.name || "Sem nome"}</h1>
        <p className="mt-1 text-neutral-600">@{profile.username || "usuario"}</p>
        <div className="mt-4 grid gap-2 text-sm text-neutral-600 sm:grid-cols-2">
          <p>Data de entrada: {formatDate(profile.joinedAt)}</p>
          <p>Idioma: {profile.language.toUpperCase()}</p>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-neutral-800">Estatísticas</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <p className="rounded-lg bg-neutral-50 p-3">🔥 Streak: {profile.streak} dias</p>
          <p className="rounded-lg bg-neutral-50 p-3">⭐ XP total: {profile.xp}</p>
          <p className="rounded-lg bg-neutral-50 p-3">🏆 Liga: {league}</p>
          <p className="rounded-lg bg-neutral-50 p-3">🥇 Pódios: {podiums}</p>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-neutral-800">Amigos</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <p className="rounded-lg bg-neutral-50 p-3">Seguindo: {profile.following}</p>
          <p className="rounded-lg bg-neutral-50 p-3">Seguidores: {profile.followers}</p>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-neutral-800">Conquistas</h2>
        <ul className="mt-4 space-y-4">
          {achievements.map((achievement) => (
            <li key={achievement.id} className="rounded-lg border p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-neutral-800">{achievement.title}</p>
                <span className="text-sm text-neutral-500">
                  {achievement.current}/{achievement.target}
                </span>
              </div>
              <p className="mt-1 text-sm text-neutral-600">{achievement.description}</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-200">
                <div
                  className={`h-full ${achievement.completed ? "bg-emerald-500" : "bg-sky-500"}`}
                  style={{ width: `${achievement.progress}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
};

export default ProfilePage;
