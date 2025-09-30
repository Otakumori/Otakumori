'use client';

import { useEffect, useRef, useState } from 'react';

type OrderCard = {
  id: string;
  label: string;
  createdAt: string;
};

export default function MemoryCardsDock() {
  const [cards, setCards] = useState<OrderCard[]>([]);
  const [newestCard, setNewestCard] = useState<string | null>(null);
  const intervalRef = useRef<any>(undefined);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await fetch('/api/orders');
        if (response.ok) {
          const data = await response.json();
          if (data.ok && data.data.orders) {
            const newCards = data.data.orders.map(
              (order: {
                id: string;
                label?: string;
                displayNumber: number;
                createdAt: string;
              }) => ({
                id: order.id,
                label: order.label || `Order #${order.displayNumber}`,
                createdAt: order.createdAt,
              }),
            );

            setCards((prevCards) => {
              if (prevCards.length === 0) return newCards;

              // Check for new cards
              const newCardIds = new Set(newCards.map((c: OrderCard) => c.id));
              const oldCardIds = new Set(prevCards.map((c: OrderCard) => c.id));
              const addedCards = newCards.filter((c: OrderCard) => !oldCardIds.has(c.id));

              if (addedCards.length > 0) {
                setNewestCard(addedCards[0].id);
                setTimeout(() => setNewestCard(null), 2000);
              }

              return newCards;
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      }
    };

    fetchCards();
    intervalRef.current = setInterval(fetchCards, 30000); // Poll every 30 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const bumpNewest = (cardId: string) => {
    if (newestCard === cardId) {
      return 'animate-bounce';
    }
    return '';
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4 border border-pink-500/30">
        <h3 className="text-white text-sm font-bold mb-3">Memory Cards</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {cards.length === 0 ? (
            <div className="text-gray-400 text-xs">No orders yet</div>
          ) : (
            cards.map((card) => (
              <div
                key={card.id}
                className={`bg-gradient-to-r from-pink-500/20 to-purple-500/20 
                          border border-pink-500/30 rounded p-2 text-white text-xs
                          transition-all duration-300 ${bumpNewest(card.id)}`}
              >
                <div className="font-medium">{card.label}</div>
                <div className="text-gray-300 text-xs">
                  {new Date(card.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
