-- CreateEnum
CREATE TYPE "SignalSeverity" AS ENUM ('NONE', 'INFO', 'WARNING', 'CRITICAL');

-- CreateEnum
CREATE TYPE "SignalTrend" AS ENUM ('UP', 'DOWN', 'FLAT', 'UNKNOWN');

-- CreateTable
CREATE TABLE "FinancialSignal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "severity" "SignalSeverity" NOT NULL DEFAULT 'NONE',
    "trend" "SignalTrend" NOT NULL DEFAULT 'UNKNOWN',
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "ttlCategory" TEXT NOT NULL DEFAULT 'dashboard',
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "FinancialSignal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SignalSnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "signals" JSONB NOT NULL,
    "computeMs" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SignalSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntelligenceThreshold" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "userMode" "UserMode",
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntelligenceThreshold_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FinancialSignal_userId_idx" ON "FinancialSignal"("userId");

-- CreateIndex
CREATE INDEX "FinancialSignal_userId_generatedAt_idx" ON "FinancialSignal"("userId", "generatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialSignal_userId_key_key" ON "FinancialSignal"("userId", "key");

-- CreateIndex
CREATE INDEX "SignalSnapshot_userId_createdAt_idx" ON "SignalSnapshot"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "IntelligenceThreshold_userMode_idx" ON "IntelligenceThreshold"("userMode");

-- CreateIndex
CREATE UNIQUE INDEX "IntelligenceThreshold_key_userMode_key" ON "IntelligenceThreshold"("key", "userMode");
