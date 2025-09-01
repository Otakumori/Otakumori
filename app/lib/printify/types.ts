 
 
export type PrintifyAddress = {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address1: string;
  address2?: string;
  city: string;
  region?: string;
  state?: string; // some webhooks use region vs state
  country: string;
  zip: string;
};

export type PrintifyLineItem = {
  product_id: string; // blueprint product id
  variant_id: number;
  quantity: number;
  print_provider_id?: number;
  blueprint_id?: number;
};

export type PrintifyOrder = {
  id: string;
  shop_id: string | number;
  address_to: PrintifyAddress;
  line_items: PrintifyLineItem[];
  status?: string;
  metadata?: Record<string, unknown>;
};
