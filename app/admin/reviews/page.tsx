// DEPRECATED: This component is a duplicate. Use app\sign-in\[[...sign-in]]\page.tsx instead.
import AdminReviewsClient from './review-client';

export const dynamic = 'force-dynamic';

export default function AdminReviewsPage() {
  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Review Moderation</h1>
      <AdminReviewsClient />
    </main>
  );
}
