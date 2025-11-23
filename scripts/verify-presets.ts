import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyPresets() {
    try {
        const presets = await prisma.characterPreset.findMany({
            select: {
                id: true,
                name: true,
                category: true,
                configData: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 10,
        });

        console.log(`✅ Found ${presets.length} presets in database:`);
        presets.forEach((preset) => {
            const hasConfig = preset.configData !== null;
            console.log(`  - ${preset.name} (${preset.category})${hasConfig ? ' ✓ Has configData' : ' ✗ Missing configData'}`);
        });

        const withConfig = presets.filter((p) => p.configData !== null).length;
        console.log(`\n📊 Summary: ${withConfig}/${presets.length} presets have configData`);
    } catch (error) {
        console.error('❌ Error verifying presets:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verifyPresets();

