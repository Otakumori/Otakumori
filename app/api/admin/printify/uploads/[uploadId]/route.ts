import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/app/lib/auth/admin';
import { getPrintifyUploadService } from '@/app/lib/printify/uploads';
import { logger } from '@/app/lib/logger';
import { newRequestId } from '@/app/lib/requestId';

export const runtime = 'nodejs';

// GET /api/admin/printify/uploads/[uploadId] - Get upload
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ uploadId: string }> },
) {
  return withAdminAuth(async (request: NextRequest) => {
    const requestId = newRequestId();
    const { uploadId } = await params;

    try {
      const uploadService = getPrintifyUploadService();
      const upload = await uploadService.getUpload(uploadId);

      return NextResponse.json({
        ok: true,
        data: upload,
        requestId,
      });
    } catch (error) {
      logger.error('admin_printify_upload_fetch_failed', { requestId }, {
        uploadId,
        error: String(error),
      });
      return NextResponse.json(
        {
          ok: false,
          error: 'Failed to fetch upload',
          requestId,
        },
        { status: 500 },
      );
    }
  })(req);
}

