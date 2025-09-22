'use client';

import dynamic from 'next/dynamic';

const OneTapGamertag = dynamic(() => import('@/app/components/profile/OneTapGamertag'), {
  ssr: false,
});

interface OneTapGamertagWrapperProps {
  initial?: string;
}

export default function OneTapGamertagWrapper({ initial }: OneTapGamertagWrapperProps) {
  return <OneTapGamertag initial={initial} />;
}
