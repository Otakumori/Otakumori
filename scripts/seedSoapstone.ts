import { PrismaClient, PhraseCategory } from "@prisma/client";
import fs from "node:fs/promises";
import path from "node:path";

const prisma = new PrismaClient();

async function seedPhrases(jsonPath: string) {
  const raw = await fs.readFile(jsonPath, "utf8");
  const parsed = JSON.parse(raw) as { categories: Record<string, string[]> };

  for (const [cat, items] of Object.entries(parsed.categories)) {
    const category = cat as keyof typeof PhraseCategory;
    if (!(category in PhraseCategory)) {
      console.warn(`Skipping unknown category: ${cat}`);
      continue;
    }
    for (const text of items) {
      await prisma.phrase.upsert({
        where: {
          category_text_locale: {
            category: category as any,
            text,
            locale: "en",
          },
        },
        update: { isActive: true },
        create: { category: category as any, text, locale: "en" },
      });
    }
  }
}

async function seedTemplates() {
  // Helper to create a template + slots + acceptable categories
  async function makeTemplate(
    name: string,
    pattern: string,
    slots: Array<{ position: number; optional?: boolean; accepts: PhraseCategory[] }>
  ) {
    const tmpl = await prisma.messageTemplate.upsert({
      where: { name },
      update: { pattern, isActive: true },
      create: { name, pattern, isActive: true },
    });

    // Clear then recreate slots for idempotency
    await prisma.messageTemplateSlot.deleteMany({ where: { templateId: tmpl.id } });

    for (const s of slots) {
      const slot = await prisma.messageTemplateSlot.create({
        data: {
          templateId: tmpl.id,
          position: s.position,
          optional: s.optional ?? false,
        },
      });
      for (const cat of s.accepts) {
        await prisma.slotAccepts.create({
          data: { slotId: slot.id, category: cat },
        });
      }
    }
  }

  // Classic DS-style shapes
  await makeTemplate("be_wary_of_subject", "be wary of {SUBJECT}", [
    { position: 0, accepts: [PhraseCategory.SUBJECT] },
  ]);

  await makeTemplate("try_action", "try {ACTION}", [
    { position: 0, accepts: [PhraseCategory.ACTION] },
  ]);

  await makeTemplate("object_ahead", "{OBJECT} ahead", [
    { position: 0, accepts: [PhraseCategory.OBJECT] },
  ]);

  await makeTemplate("subject_ahead", "{SUBJECT} ahead", [
    { position: 0, accepts: [PhraseCategory.SUBJECT] },
  ]);

  await makeTemplate("praise_the_subject", "praise the {SUBJECT}", [
    { position: 0, accepts: [PhraseCategory.SUBJECT] },
  ]);

  await makeTemplate("visions_of_subject", "visions of {SUBJECT}", [
    { position: 0, accepts: [PhraseCategory.SUBJECT] },
  ]);

  await makeTemplate("no_hidden_path_ahead", "no hidden path ahead", []);

  await makeTemplate("could_this_be", "could this be a {SUBJECT}?", [
    { position: 0, accepts: [PhraseCategory.SUBJECT] },
  ]);

  await makeTemplate("therefore_quality", "{CONJUNCTION}, {QUALITY}", [
    { position: 0, accepts: [PhraseCategory.CONJUNCTION] },
    { position: 1, accepts: [PhraseCategory.QUALITY] },
  ]);

  await makeTemplate("behold_subject", "behold, {SUBJECT}", [
    { position: 0, accepts: [PhraseCategory.SUBJECT] },
  ]);

  // Fun Otaku-mori riffs
  await makeTemplate("time_for_crab", "time for {SUBJECT}", [
    { position: 0, accepts: [PhraseCategory.SUBJECT, PhraseCategory.MEME] },
  ]);

  await makeTemplate("meme_only", "{MEME}", [
    { position: 0, accepts: [PhraseCategory.MEME, PhraseCategory.HUMOR] },
  ]);

  await makeTemplate("combo_tip_subject_direction", "{TIP} {SUBJECT} {DIRECTION}", [
    { position: 0, accepts: [PhraseCategory.TIP] },
    { position: 1, accepts: [PhraseCategory.SUBJECT] },
    { position: 2, accepts: [PhraseCategory.DIRECTION] },
  ]);

  await makeTemplate("object_requires_action", "{OBJECT} requires {ACTION}", [
    { position: 0, accepts: [PhraseCategory.OBJECT] },
    { position: 1, accepts: [PhraseCategory.ACTION] },
  ]);

  await makeTemplate("element_defense", "{ELEMENT} ahead, {CONJUNCTION} {ACTION}", [
    { position: 0, accepts: [PhraseCategory.ELEMENT] },
    { position: 1, accepts: [PhraseCategory.CONJUNCTION] },
    { position: 2, accepts: [PhraseCategory.ACTION] },
  ]);
}

async function main() {
  const jsonPath = path.join(process.cwd(), "prisma", "data", "otaku_mori_phrases.json");
  await seedPhrases(jsonPath);
  await seedTemplates();
  console.log("✅ Seeded phrases & templates");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
