import prisma from "@/lib/prisma";

export type EnrollmentProgressMetrics = {
  totalChallenges: number;
  completedChallengeIds: number[];
  completedCount: number;
  progressPercent: number;
};

export const calculateEnrollmentProgressMetrics = async (
  enrollmentId: number,
  courseId: number
): Promise<EnrollmentProgressMetrics> => {
  const [totalChallenges, completedProgress] = await Promise.all([
    prisma.challenge.count({
      where: {
        lesson: {
          unit: {
            courseId,
          },
        },
      },
    }),
    prisma.challengeProgress.findMany({
      where: {
        enrollmentId,
        completed: true,
      },
      select: {
        challengeId: true,
      },
      distinct: ["challengeId"],
    }),
  ]);

  const completedChallengeIds = completedProgress.map((item: { challengeId: number }) => item.challengeId);
  const completedCount = completedChallengeIds.length;
  const progressPercent =
    totalChallenges > 0 ? (completedCount / totalChallenges) * 100 : 0;

  return {
    totalChallenges,
    completedChallengeIds,
    completedCount,
    progressPercent,
  };
};
