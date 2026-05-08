import prisma from "@/lib/prisma";
import type { EnrollmentProgressMetrics } from "@/services/progress.service";

export const syncEnrollmentDerivedMetrics = async (
  enrollmentId: number,
  metrics: EnrollmentProgressMetrics
) => {
  // Regra única: sempre persistimos o percentual real (completed/total) e derivamos os demais campos a partir dele.
  const coursePoints = Math.round(metrics.progressPercent * 10);
  const perfectChallenges = Math.floor(metrics.progressPercent / 10);

  return prisma.userEnrollment.update({
    where: { id: enrollmentId },
    data: {
      completedChallenges: metrics.completedChallengeIds,
      progressPercent: metrics.progressPercent,
      coursePoints,
      perfectChallenges,
      lastAccessedAt: new Date(),
    },
  });
};
