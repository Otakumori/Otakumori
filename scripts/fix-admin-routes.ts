import fs from 'fs';
import path from 'path';

const adminRoutes = [
  'app/api/admin/music/blob-upload-token/route.ts',
  'app/api/admin/music/playlists/[id]/route.ts',
  'app/api/admin/music/playlists/[id]/tracks/route.ts',
  'app/api/admin/music/playlists/route.ts',
  'app/api/admin/music/tracks/[id]/route.ts',
  'app/api/admin/reviews/[id]/approve/route.ts',
  'app/api/admin/reviews/[id]/route.ts',
  'app/api/admin/reviews/route.ts',
  'app/api/soapstones/[id]/route.ts',
];

for (const route of adminRoutes) {
  const filePath = path.join(process.cwd(), route);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Fix the requireAdmin pattern
    content = content.replace(
      /const admin = await requireAdmin\(\);\s*if \(!admin\.ok\) return NextResponse\.json\(\{ ok: false \}, \{ status: admin\.status \}\);/g,
      `try {
    const admin = await requireAdmin();
    // admin is { id: string } on success
  } catch (error) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }`,
    );

    fs.writeFileSync(filePath, content);
    console.log(`Fixed ${route}`);
  }
}

console.log('All admin routes fixed!');
