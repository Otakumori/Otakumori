"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AchievementsAlias() {
  const router = useRouter();
  const params = useSearchParams();
  useEffect(() => {
    const next = new URLSearchParams(params.toString());
    next.set('face', '1');
    router.replace(`/mini-games?${next.toString()}`);
  }, [params, router]);
  return null;
}
