import { redirect } from 'next/navigation';
import { paths } from '@/lib/paths';

/** Compatibility route. Authenticated order history is consolidated at paths.orders(). */
export default function LegacyProfileOrdersPage() {
  redirect(paths.orders());
}
