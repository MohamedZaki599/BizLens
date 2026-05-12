-- CreateEnum
CREATE TYPE "SignalStatus" AS ENUM ('NEW', 'REVIEWED', 'INVESTIGATING', 'SNOOZED', 'RESOLVED');

-- AlterTable: Add lifecycle fields to FinancialSignal
ALTER TABLE "FinancialSignal" ADD COLUMN "status" "SignalStatus" NOT NULL DEFAULT 'NEW';
ALTER TABLE "FinancialSignal" ADD COLUMN "snoozedUntil" TIMESTAMP(3);
ALTER TABLE "FinancialSignal" ADD COLUMN "resolutionNotes" TEXT;
ALTER TABLE "FinancialSignal" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "FinancialSignal" ADD COLUMN "resolvedAt" TIMESTAMP(3);
