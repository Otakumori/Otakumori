/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import "../_shared/cohesion.css";

export default function MemoryMatch() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [gameWon, setGameWon] = useState(false);

  // Simple card data
  const cardData = [
    { id: 1, emoji: "🌸", matched: false },
    { id: 2, emoji: "🌸", matched: false },
    { id: 3, emoji: "⭐", matched: false },
    { id: 4, emoji: "⭐", matched: false },
    { id: 5, emoji: "🎮", matched: false },
    { id: 6, emoji: "🎮", matched: false },
    { id: 7, emoji: "🎯", matched: false },
    { id: 8, emoji: "🎯", matched: false },
  ];

  const handleCardClick = (cardId: number) => {
    if (selectedCards.length === 2 || selectedCards.includes(cardId) || matchedPairs.includes(cardId)) {
      return;
    }

    const newSelected = [...selectedCards, cardId];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      const [first, second] = newSelected;
      const firstCard = cardData.find(c => c.id === first);
      const secondCard = cardData.find(c => c.id === second);

      if (firstCard?.emoji === secondCard?.emoji) {
        setMatchedPairs(prev => [...prev, first, second]);
        if (matchedPairs.length + 2 === cardData.length) {
          setGameWon(true);
        }
      }

      setTimeout(() => setSelectedCards([]), 1000);
    }
  };

  const isCardVisible = (cardId: number) => {
    return selectedCards.includes(cardId) || matchedPairs.includes(cardId);
  };

  return (
    <div ref={hostRef} className="gc-viewport mg-crt mg-tint relative w-full h-full p-4">
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-pink-100 mb-2">Find the Pairs</h2>
          <p className="text-pink-200">Matched: {matchedPairs.length / 2} / {cardData.length / 2}</p>
        </div>

        <div className="grid grid-cols-4 gap-3 max-w-md">
          {cardData.map((card) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={`
                w-16 h-20 rounded-lg border-2 transition-all duration-200 flex items-center justify-center text-2xl
                ${isCardVisible(card.id)
                  ? 'bg-pink-300/20 border-pink-400 text-pink-100'
                  : 'bg-pink-300/10 border-pink-300/30 text-transparent hover:bg-pink-300/20'
                }
              `}
            >
              {isCardVisible(card.id) ? card.emoji : '?'}
            </button>
          ))}
        </div>

        {gameWon && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="bg-pink-300/20 border border-pink-400 rounded-2xl p-6 text-center">
              <h3 className="text-2xl font-bold text-pink-100 mb-2">🎉 You Won! 🎉</h3>
              <p className="text-pink-200">All pairs matched!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
