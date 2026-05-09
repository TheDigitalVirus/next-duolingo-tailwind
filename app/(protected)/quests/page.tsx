import type { NextPage } from "next";
import { getServerSession } from "next-auth";
import authOptions from "@/app/api/auth/[...nextauth]/auth-options";
import prisma from "@/lib/prisma";
import { buildDailyMissions, getQuestWindow } from "@/utils/quests";
import { QuestCountdown } from "./quest-countdown";

const QuestsPage: NextPage = async () => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const { startOfDay } = getQuestWindow();

  const todayChallengesCount = await prisma.challengeProgress.count({
    where: {
      userId,
      completed: true,
      completedAt: {
        gte: startOfDay,
      },
    },
  });

  const dailyXp = todayChallengesCount * 10;
  const missions = buildDailyMissions(dailyXp);

  return (
    <main className="min-h-screen space-y-6 p-6 md:p-8">
      <section className="rounded-3xl bg-gradient-to-r from-emerald-500 to-green-600 p-6 text-white shadow-md">
        <p className="text-sm font-semibold uppercase tracking-wide">Missões diárias</p>
        <h1 className="mt-2 text-3xl font-bold">Conclua missões e ganhe bônus de XP</h1>
        <p className="mt-2 text-sm text-white/90">
          Renovação em <QuestCountdown expiresAt={missions[0].expiresAt} />
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-zinc-800 dark:text-zinc-100">Missões de hoje</h2>
        <div className="space-y-3">
          {missions.map((mission) => {
            const clamped = Math.min(mission.current, mission.goal);
            const progress = Math.round((clamped / mission.goal) * 100);

            return (
              <article
                key={mission.id}
                className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="font-semibold text-zinc-800 dark:text-zinc-100">{mission.title}</h3>
                  <span className="text-sm font-semibold text-emerald-600">+{mission.rewardXp} XP</span>
                </div>

                {mission.locked ? (
                  <p className="text-sm text-zinc-500">🔒 Missão bloqueada — em breve.</p>
                ) : (
                  <>
                    <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-300">
                      {clamped}/{mission.goal} XP
                    </p>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
};

export default QuestsPage;
