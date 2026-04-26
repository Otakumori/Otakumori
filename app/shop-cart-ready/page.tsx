import { redirect } from 'next/navigation';

export default function LegacyShopCartReadyPage() {
  redirect('/shop');
}
