 
 
export interface ApiResult<T> {
  ok: true;
  data: T;
}

export interface ApiError {
  ok: false;
  error: string;
}

export interface OrderSummary {
  id: string;
  stripeId: string;
  totalAmount: number;
  currency: string;
  status: string;
  memoryCardKey: string | null;
  createdAt: string;
  label: string;
}

export interface OrdersListQuery {
  since?: string;
}

export interface OrdersListResult {
  orders: OrderSummary[];
}

export interface CheckoutSessionBody {
  items: Array<{ sku: string; qty: number }>;
  couponCode?: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResult {
  url: string;
}
