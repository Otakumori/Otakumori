// lib/shop.ts (server)
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function getProducts(params: {
  category?: string; subcategory?: string; page?: number; pageSize?: number;
}) {
  const sb = createClient(url, anon, { auth: { persistSession: false } });
  const page = params.page ?? 1, pageSize = params.pageSize ?? 24;
  let q = sb.from('products').select('*', { count: 'exact' }).eq('visible', true);
  if (params.category) q = q.eq('category', params.category);
  if (params.subcategory) q = q.eq('subcategory', params.subcategory);
  q = q.order('title', { ascending: true }).range((page-1)*pageSize, page*pageSize - 1);
  const { data, count, error } = await q;
  if (error) throw error;
  return { data: data ?? [], count: count ?? 0, page, pageSize };
}

export async function getProductById(id: string) {
  const sb = createClient(url, anon, { auth: { persistSession: false } });
  const { data: product } = await sb.from('products').select('*').eq('id', id).single();
  if (!product) return null;
  const { data: variants } = await sb.from('variants').select('*').eq('product_id', id).order('price_cents');
  return { product, variants: variants ?? [] };
}
