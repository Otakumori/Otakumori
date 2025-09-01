 
 
'use client';
import { useState } from 'react';
import { type PetalShopItem } from '@prisma/client';

interface ShopItemCardProps {
  item: PetalShopItem;
  onPurchase: (sku: string) => void;
}

export default function ShopItemCard({ item, onPurchase }: ShopItemCardProps) {
  const [open, setOpen] = useState(false);

  // Handle nullable price fields safely - preserve petal economy logic
  const priceRunes = item.priceRunes ?? 0;
  const pricePetals = item.pricePetals ?? 0;
  const price = priceRunes > 0 ? `${priceRunes} Runes` : `${pricePetals} Petals`;

  const kindLabels: Record<string, string> = {
    COSMETIC: 'Avatar',
    OVERLAY: 'Overlay',
    TEXT: 'Text',
    CURSOR: 'Cursor',
  };

  const kindLabel = kindLabels[item.kind] ?? item.kind;

  return (
    <div className="card">
      <div className="card-header">
        <h3>{item.name}</h3>
        <span className="badge">{kindLabel}</span>
      </div>
      <div className="card-body">
        <p>{price}</p>
        {item.metadata && <div className="metadata">{/* Add metadata display logic here */}</div>}
      </div>
      <div className="card-footer">
        <button onClick={() => onPurchase(item.sku)} className="btn btn-primary">
          Purchase
        </button>
      </div>
    </div>
  );
}
