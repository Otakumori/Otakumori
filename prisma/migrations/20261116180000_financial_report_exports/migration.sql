-- Additive reporting manifest for private, admin-generated financial workbooks.
-- Workbook bytes are returned directly and are not persisted in public storage.
ALTER TABLE "OrderItem" ADD COLUMN "taxCode" TEXT;
ALTER TABLE "Product" ADD COLUMN "tax_code" TEXT;

CREATE TABLE "FinancialReportExport" (
    "id" TEXT NOT NULL,
    "merchantAccountId" TEXT NOT NULL,
    "environment" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL,
    "accountingMethod" TEXT NOT NULL,
    "reportVersion" TEXT NOT NULL,
    "sourceDigest" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "generatedBy" TEXT NOT NULL,
    "rowCounts" JSONB NOT NULL,
    "limitations" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinancialReportExport_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FinancialReportExport_period_source_key"
ON "FinancialReportExport"("merchantAccountId", "environment", "periodStart", "periodEnd", "reportVersion", "sourceDigest");

CREATE INDEX "FinancialReportExport_periodStart_periodEnd_idx"
ON "FinancialReportExport"("periodStart", "periodEnd");

CREATE INDEX "FinancialReportExport_createdAt_idx"
ON "FinancialReportExport"("createdAt");

CREATE INDEX "FinancialReportExport_status_idx"
ON "FinancialReportExport"("status");
