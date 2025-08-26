/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import axios from "axios";
import { env } from "@/env.mjs";
import type { PrintifyOrder } from "./types";

const client = axios.create({
  baseURL: "https://api.printify.com/v1",
  timeout: 15_000,
  headers: { Authorization: `Bearer ${env.PRINTIFY_API_KEY}` },
});

export async function getPrintifyOrder(shopId: string, printifyOrderId: string): Promise<PrintifyOrder> {
  const { data } = await client.get(`/shops/${shopId}/orders/${printifyOrderId}.json`);
  return data;
}

export async function createPrintifyOrder(shopId: string, payload: unknown): Promise<PrintifyOrder> {
  const { data } = await client.post(`/shops/${shopId}/orders.json`, payload);
  return data;
}

export async function getShops(): Promise<unknown> {
  const { data } = await client.get(`/shops.json`);
  return data;
}

export * from "./types";
