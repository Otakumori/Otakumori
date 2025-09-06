'use client';
import { usePetalContext } from '@/providers';
import PetalIcon from '@/app/components/icons/Petal';

export default function PetalChip() {
  const { petals } = usePetalContext()();
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold">
      <PetalIcon className="h-3.5 w-3.5" />
      <span>{petals}</span>
    </div>
  );
}
