import { PrismaClient, PhraseCategory } from '@prisma/client';

const prisma = new PrismaClient();

async function testSoapstone() {
  console.log(' Testing Dark Souls-style Comments System\n');

  // Show all phrase categories and counts
  console.log(' PHRASE CATEGORIES:');
  for (const category of Object.values(PhraseCategory)) {
    const count = await prisma.phrase.count({ where: { category } });
    console.log(`  ${category}: ${count} phrases`);
  }

  console.log('\n SAMPLE PHRASES BY CATEGORY:');

  // Show sample phrases from each category
  for (const category of Object.values(PhraseCategory)) {
    const phrases = await prisma.phrase.findMany({
      where: { category },
      take: 5,
      select: { text: true },
    });
    console.log(`\n${category}:`);
    phrases.forEach((p) => console.log(`  - "${p.text}"`));
  }

  console.log('\n MESSAGE TEMPLATES:');
  const templates = await prisma.messageTemplate.findMany({
    include: {
      slots: {
        include: {
          accepts: true,
        },
      },
    },
  });

  templates.forEach((template) => {
    console.log(`\n ${template.name}:`);
    console.log(`   Pattern: "${template.pattern}"`);
    console.log(`   Slots:`);
    template.slots.forEach((slot) => {
      const categories = slot.accepts.map((a) => a.category).join(', ');
      console.log(
        `     Position ${slot.position}: [${categories}] ${slot.optional ? '(optional)' : ''}`,
      );
    });
  });

  console.log('\n EXAMPLE MESSAGE BUILDS:');

  // Build some example messages
  const examples = [
    { template: 'be_wary_of_subject', subject: 'enemy' },
    { template: 'try_action', action: 'rolling' },
    { template: 'object_ahead', object: 'chest' },
    { template: 'subject_ahead', subject: 'boss' },
    { template: 'praise_the_subject', subject: 'sun' },
    { template: 'visions_of_subject', subject: 'victory' },
    { template: 'time_for_crab', subject: 'crab' },
    { template: 'meme_only', meme: 'horse?' },
    {
      template: 'combo_tip_subject_direction',
      tip: 'be wary of',
      subject: 'trap',
      direction: 'ahead',
    },
    { template: 'element_defense', element: 'fire', conjunction: 'therefore', action: 'rolling' },
  ];

  for (const example of examples) {
    const template = await prisma.messageTemplate.findUnique({
      where: { name: example.template },
      include: {
        slots: {
          include: {
            accepts: true,
          },
        },
      },
    });

    if (template) {
      let message = template.pattern;

      // Replace placeholders with example values
      if (example.subject) message = message.replace('{SUBJECT}', example.subject);
      if (example.action) message = message.replace('{ACTION}', example.action);
      if (example.object) message = message.replace('{OBJECT}', example.object);
      if (example.tip) message = message.replace('{TIP}', example.tip);
      if (example.direction) message = message.replace('{DIRECTION}', example.direction);
      if (example.element) message = message.replace('{ELEMENT}', example.element);
      if (example.conjunction) message = message.replace('{CONJUNCTION}', example.conjunction);
      if (example.meme) message = message.replace('{MEME}', example.meme);

      console.log(`  "${message}"`);
    }
  }

  console.log('\n FUNNY/MEME PHRASES:');
  const humorPhrases = await prisma.phrase.findMany({
    where: {
      OR: [{ category: PhraseCategory.HUMOR }, { category: PhraseCategory.MEME }],
    },
    take: 10,
    select: { text: true, category: true },
  });

  humorPhrases.forEach((p) => {
    console.log(`  [${p.category}] "${p.text}"`);
  });

  console.log('\n Dark Souls Comments System is ready!');
  console.log('   - Users can build messages from curated phrases');
  console.log('   - Templates constrain message structure');
  console.log('   - Appraisal system for Good/Poor votes');
  console.log('   - Full moderation and threading support');
  console.log('   - Mix of serious DS vibes and funny Otaku-mori content');
}

testSoapstone()
  .catch((e) => {
    console.error(' Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
