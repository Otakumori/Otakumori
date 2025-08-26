/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";

import useSWR from "swr";

const fetcher = (u: string) => fetch(u).then(r => r.json());

export function useAvatarForGame(enabled: boolean = true) {
  const { data } = useSWR(enabled ? "/api/avatars/active" : null, fetcher);
  
  return {
    enabled,
    avatar: data?.ok ? {
      spriteUrl: data.spriteUrl,
      meta: data.meta
    } : null
  };
}
