import { redirect } from 'next/navigation';

export default function LegacyProductRoute({ params }: { params: { id: string } }) {
  redirect(`/shop/${params.id}`);
}

