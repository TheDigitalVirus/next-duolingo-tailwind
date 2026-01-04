/*
  Warnings:

  - The values [general,academic,travel,business,conversation,fun] on the enum `Focus` will be removed. If these variants are still used in the database, this will fail.
  - The values [casual,regular,intense,hard] on the enum `Intensity` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ChallengeType" ADD VALUE 'CODE';
ALTER TYPE "ChallengeType" ADD VALUE 'FILL_BLANK';
ALTER TYPE "ChallengeType" ADD VALUE 'REORDER';
ALTER TYPE "ChallengeType" ADD VALUE 'MATCH';

-- AlterEnum
BEGIN;
CREATE TYPE "Focus_new" AS ENUM ('GENERAL', 'ACADEMIC', 'TRAVEL', 'BUSINESS', 'CONVERSATION', 'FUN');
ALTER TABLE "user_questionnaire" ALTER COLUMN "focus" TYPE "Focus_new" USING ("focus"::text::"Focus_new");
ALTER TYPE "Focus" RENAME TO "Focus_old";
ALTER TYPE "Focus_new" RENAME TO "Focus";
DROP TYPE "public"."Focus_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Intensity_new" AS ENUM ('CASUAL', 'REGULAR', 'INTENSE', 'HARD');
ALTER TABLE "user_questionnaire" ALTER COLUMN "intensity" TYPE "Intensity_new" USING ("intensity"::text::"Intensity_new");
ALTER TYPE "Intensity" RENAME TO "Intensity_old";
ALTER TYPE "Intensity_new" RENAME TO "Intensity";
DROP TYPE "public"."Intensity_old";
COMMIT;

-- AlterTable
ALTER TABLE "user_subscription" ALTER COLUMN "stripeCustomerId" DROP NOT NULL,
ALTER COLUMN "stripeSubscriptionId" DROP NOT NULL,
ALTER COLUMN "stripePriceId" DROP NOT NULL,
ALTER COLUMN "stripeCurrentPeriodEnd" DROP NOT NULL;
