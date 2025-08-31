/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
// TODO: Update this file to use the new mini-games API structure
// This file is temporarily disabled until the new API structure is implemented

/*
// Keys
const k = {
  me: ["me"] as const,
  ledger: ["petals","ledger"] as const,
  products: ["products"] as const,
};

// Queries
export function useMe() {
  return useQuery({
    queryKey: k.me,
    queryFn: () => apiFetch({ path: "/api/v1/account/me", schema: Api(UserPublic) }),
  });
}
export function usePetalLedger() {
  return useQuery({
    queryKey: k.ledger,
    queryFn: () => apiFetch({ path: "/api/v1/petals/ledger", schema: Api(PetalLedger) }),
  });
}
export function useProducts() {
  return useQuery({
    queryKey: k.products,
    queryFn: () => apiFetch({ path: "/api/v1/products", schema: Api(z.array(ProductCard)) }),
  });
}

// Mutations
export function useUpdateDisplayName() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (displayName: string) =>
      apiFetch({
        path: "/api/v1/account/display-name",
        schema: Api(z.object({ updated: z.boolean() })),
        method: "PATCH",
        body: { displayName },
        idempotencyKey: crypto.randomUUID(),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: k.me }),
  });
}
export function useSpendPetals() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { amount: number; reason: string }) =>
      apiFetch({
        path: "/api/v1/petals/spend",
        schema: Api(PetalLedger),
        method: "POST",
        body: payload,
        idempotencyKey: crypto.randomUUID(),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: k.ledger });
      qc.invalidateQueries({ queryKey: k.me });
    },
  });
}
*/
