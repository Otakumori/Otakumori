import { redirect } from 'next/navigation';
import { paths } from '@/lib/paths';

export default function AdminBurstPage() {
  redirect(paths.admin());
}
