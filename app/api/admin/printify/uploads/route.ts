import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/app/lib/auth/admin';
import { getPrintifyUploadService } from '@/app/lib/printify/uploads';
import { logger } from '@/app/lib/logger';
import { newRequestId } from '@/app/lib/requestId';

export const runtime = 'nodejs';

// POST /api/admin/printify/uploads - Upload image
export const POST = withAdminAuth(async (req: NextRequest) => {
  const requestId = newRequestId();

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const fileName = formData.get('fileName') as string | null;

    if (!file) {
      return NextResponse.json(
        {
          ok: false,
          error: 'File is required',
          requestId,
        },
        { status: 400 },
      );
    }

    const uploadService = getPrintifyUploadService();
    const upload = await uploadService.uploadImage(file, fileName || file.name);

    logger.info('admin_printify_upload_success', { requestId }, { uploadId: upload.id });

    return NextResponse.json({
      ok: true,
      data: upload,
      requestId,
    });
  } catch (error) {
    logger.error('admin_printify_upload_failed', { requestId }, { error: String(error) });
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to upload image',
        requestId,
      },
      { status: 500 },
    );
  }
});

