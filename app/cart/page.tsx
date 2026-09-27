import { redirect } from 'next/navigation';
import { paths } from '@/lib/paths';

/** Compatibility route. Public cart authority lives at paths.cart(). */
export default function LegacyCartPage() {
  redirect(paths.cart());
}
