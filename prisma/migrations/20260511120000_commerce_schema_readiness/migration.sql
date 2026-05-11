-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'pending_fulfillment';

-- AlterTable
ALTER TABLE "WebhookEvent" ADD COLUMN     "attemptCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "externalEventId" TEXT,
ADD COLUMN     "lastError" TEXT,
ADD COLUMN     "processedAt" TIMESTAMP(3),
ADD COLUMN     "processingStatus" TEXT NOT NULL DEFAULT 'received',
ADD COLUMN     "provider" TEXT;

UPDATE "WebhookEvent"
SET "provider" = COALESCE("provider", 'legacy'),
    "externalEventId" = COALESCE("externalEventId", "id"),
    "processingStatus" = COALESCE(NULLIF("processingStatus", ''), 'processed'),
    "attemptCount" = CASE WHEN "attemptCount" < 1 THEN 1 ELSE "attemptCount" END
WHERE "provider" IS NULL
   OR "externalEventId" IS NULL
   OR "processingStatus" IS NULL
   OR "attemptCount" IS NULL
   OR "attemptCount" < 1;

ALTER TABLE "WebhookEvent"
ALTER COLUMN "provider" SET NOT NULL,
ALTER COLUMN "externalEventId" SET NOT NULL;

-- CreateTable
CREATE TABLE "CheckoutSession" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerSessionId" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "amountSubtotal" INTEGER NOT NULL,
    "amountTotal" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CheckoutSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrintifySyncLog" (
    "id" TEXT NOT NULL,
    "syncType" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "orderId" TEXT,
    "status" TEXT NOT NULL,
    "attempt" INTEGER NOT NULL DEFAULT 1,
    "requestPayload" JSONB,
    "responsePayload" JSONB,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrintifySyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CheckoutSession_orderId_idx" ON "CheckoutSession"("orderId");

-- CreateIndex
CREATE INDEX "CheckoutSession_userId_createdAt_idx" ON "CheckoutSession"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "CheckoutSession_status_updatedAt_idx" ON "CheckoutSession"("status", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CheckoutSession_provider_idempotencyKey_key" ON "CheckoutSession"("provider", "idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "CheckoutSession_provider_providerSessionId_key" ON "CheckoutSession"("provider", "providerSessionId");

-- CreateIndex
CREATE INDEX "PrintifySyncLog_syncType_status_idx" ON "PrintifySyncLog"("syncType", "status");

-- CreateIndex
CREATE INDEX "PrintifySyncLog_entityType_entityId_idx" ON "PrintifySyncLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "PrintifySyncLog_orderId_idx" ON "PrintifySyncLog"("orderId");

-- CreateIndex
CREATE INDEX "PrintifySyncLog_createdAt_idx" ON "PrintifySyncLog"("createdAt");

-- CreateIndex
CREATE INDEX "WebhookEvent_provider_processingStatus_idx" ON "WebhookEvent"("provider", "processingStatus");

-- CreateIndex
CREATE UNIQUE INDEX "WebhookEvent_provider_externalEventId_key" ON "WebhookEvent"("provider", "externalEventId");

-- AddForeignKey
ALTER TABLE "CheckoutSession" ADD CONSTRAINT "CheckoutSession_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckoutSession" ADD CONSTRAINT "CheckoutSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrintifySyncLog" ADD CONSTRAINT "PrintifySyncLog_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
