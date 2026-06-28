-- Repair migration: create AvatarConfiguration tables that the subsequent
-- 20250129000000_add_glb_url_to_avatar_config migration expects to exist.
-- The shape matches the current Prisma schema models.

-- CreateTable
CREATE TABLE "AvatarConfiguration" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "configurationData" JSONB NOT NULL,
    "exportFormat" TEXT,
    "qualityPreset" TEXT,
    "celShadingConfig" JSONB,
    "physicsConfig" JSONB,
    "nsfwAnatomyConfig" JSONB,
    "advancedMaterialSettings" JSONB,
    "glbUrl" TEXT,
    "glbGeneratedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AvatarConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvatarConfigurationPart" (
    "id" TEXT NOT NULL,
    "configurationId" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "partType" TEXT NOT NULL,
    "attachmentOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AvatarConfigurationPart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvatarMaterialOverride" (
    "id" TEXT NOT NULL,
    "configurationId" TEXT NOT NULL,
    "slot" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "opacity" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AvatarMaterialOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvatarMorphTarget" (
    "id" TEXT NOT NULL,
    "configurationId" TEXT NOT NULL,
    "targetName" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AvatarMorphTarget_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AvatarConfiguration_userId_idx" ON "AvatarConfiguration"("userId");

-- CreateIndex
CREATE INDEX "AvatarConfiguration_glbUrl_idx" ON "AvatarConfiguration"("glbUrl");

-- CreateIndex
CREATE INDEX "AvatarConfigurationPart_configurationId_idx" ON "AvatarConfigurationPart"("configurationId");

-- CreateIndex
CREATE UNIQUE INDEX "AvatarConfigurationPart_configurationId_attachmentOrder_key" ON "AvatarConfigurationPart"("configurationId", "attachmentOrder");

-- CreateIndex
CREATE INDEX "AvatarMaterialOverride_configurationId_idx" ON "AvatarMaterialOverride"("configurationId");

-- CreateIndex
CREATE UNIQUE INDEX "AvatarMaterialOverride_configurationId_slot_key" ON "AvatarMaterialOverride"("configurationId", "slot");

-- CreateIndex
CREATE INDEX "AvatarMorphTarget_configurationId_idx" ON "AvatarMorphTarget"("configurationId");

-- CreateIndex
CREATE UNIQUE INDEX "AvatarMorphTarget_configurationId_targetName_key" ON "AvatarMorphTarget"("configurationId", "targetName");

-- AddForeignKey
ALTER TABLE "AvatarConfiguration" ADD CONSTRAINT "AvatarConfiguration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvatarConfigurationPart" ADD CONSTRAINT "AvatarConfigurationPart_configurationId_fkey" FOREIGN KEY ("configurationId") REFERENCES "AvatarConfiguration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvatarMaterialOverride" ADD CONSTRAINT "AvatarMaterialOverride_configurationId_fkey" FOREIGN KEY ("configurationId") REFERENCES "AvatarConfiguration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvatarMorphTarget" ADD CONSTRAINT "AvatarMorphTarget_configurationId_fkey" FOREIGN KEY ("configurationId") REFERENCES "AvatarConfiguration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
