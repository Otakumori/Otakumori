export type DigitalItem = { 
  id: string; 
  sku: string; 
  name: string; 
  desc?: string; 
  icon?: string 
};

export type Grant = { 
  userId: string; 
  itemId: string; 
  qty: number; 
  issuedAt: string; 
  source: "stripe" | "admin" | "promo" 
};
