import Link from 'next/link';
import { RitualStatePage } from '@/app/components/system/RitualStatePage';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default function UnauthorizedPage() {
  return (
    <RitualStatePage
      description="Only authorized administrators can open the console. No account or system settings were changed."
      eyebrow="Admin boundary"
      state="locked"
      title="Admin access required"
      action={
        <Link
          href="/"
          className="mori-button-secondary"
        >
          Return to Home
        </Link>
      }
    />
  );
}
