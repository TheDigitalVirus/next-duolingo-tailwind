import { SubscriptionTier } from "@prisma/client";

export type SeedUserKey = "owner" | "admin" | "student1" | "student2";

export type SubscriptionPlanItem = {
  userKey: SeedUserKey;
  tier: SubscriptionTier;
};

export const SUBSCRIPTIONS_PLAN: SubscriptionPlanItem[] = [
  { userKey: "owner", tier: SubscriptionTier.PRO },
  { userKey: "admin", tier: SubscriptionTier.PRO },
  { userKey: "student1", tier: SubscriptionTier.FREE },
  { userKey: "student2", tier: SubscriptionTier.FREE },
];
