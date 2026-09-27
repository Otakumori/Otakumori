import { redirect } from 'next/navigation';
import { paths } from '@/lib/paths';

/** Compatibility route. The idempotent checkout entry point lives at paths.checkout(). */
export default function LegacyCheckoutPage() {
  redirect(paths.checkout());
}
