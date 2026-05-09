-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('SPEND_SPIKE_CATEGORY', 'EXPENSES_EXCEED_INCOME', 'PROFIT_DROP', 'CATEGORY_CONCENTRATION', 'WEEKLY_SPEND_INCREASE', 'STALE_DATA', 'RECURRING_DETECTED', 'FORECAST_OVERSPEND', 'WEEKLY_SUMMARY');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastActivityAt" TIMESTAMP(3),
ADD COLUMN     "notificationsSeenAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "AlertType" NOT NULL,
    "severity" "AlertSeverity" NOT NULL DEFAULT 'INFO',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "actionJson" TEXT,
    "dedupeKey" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isDismissed" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Alert_userId_isRead_isDismissed_idx" ON "Alert"("userId", "isRead", "isDismissed");

-- CreateIndex
CREATE INDEX "Alert_userId_createdAt_idx" ON "Alert"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Alert_userId_dedupeKey_key" ON "Alert"("userId", "dedupeKey");

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
