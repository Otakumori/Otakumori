import React, { useState, useEffect, useCallback } from 'react';
import { useAchievements } from '../lib/hooks/useAchievements';
import Image from 'next/image';

interface Ingredient {
  id: number;
  name: string;
  imageSrc: string;
  points: number;
  type: 'rice' | 'protein' | 'vegetable' | 'garnish';
  rarity: 'common' | 'rare' | 'epic';
}

interface BentoSlot {
  id: number;
  ingredient: Ingredient | null;
  type: Ingredient['type'];
  x: number;
  y: number;
}

interface FallingIngredient {
  id: number;
  ingredient: Ingredient;
  x: number;
  y: number;
  speed: number;
  rotation: number;
}

// Use real images instead of emojis
const INGREDIENTS: Ingredient[] = [
  // Rice types
  {
    id: 1,
    name: 'White Rice',
    imageSrc: '/assets/images/rice-white.png',
    points: 10,
    type: 'rice',
    rarity: 'common',
  },
  {
    id: 2,
    name: 'Brown Rice',
    imageSrc: '/assets/images/rice-brown.png',
    points: 15,
    type: 'rice',
    rarity: 'common',
  },
  {
    id: 3,
    name: 'Sushi Rice',
    imageSrc: '/assets/images/rice-sushi.png',
    points: 20,
    type: 'rice',
    rarity: 'rare',
  },

  // Proteins
  {
    id: 4,
    name: 'Salmon',
    imageSrc: '/assets/images/protein-salmon.png',
    points: 25,
    type: 'protein',
    rarity: 'rare',
  },
  {
    id: 5,
    name: 'Chicken',
    imageSrc: '/assets/images/protein-chicken.png',
    points: 20,
    type: 'protein',
    rarity: 'common',
  },
  {
    id: 6,
    name: 'Tofu',
    imageSrc: '/assets/images/protein-tofu.png',
    points: 15,
    type: 'protein',
    rarity: 'common',
  },
  {
    id: 7,
    name: 'Wagyu Beef',
    imageSrc: '/assets/images/protein-wagyu.png',
    points: 50,
    type: 'protein',
    rarity: 'epic',
  },

  // Vegetables
  {
    id: 8,
    name: 'Broccoli',
    imageSrc: '/assets/images/veg-broccoli.png',
    points: 10,
    type: 'vegetable',
    rarity: 'common',
  },
  {
    id: 9,
    name: 'Carrots',
    imageSrc: '/assets/images/veg-carrots.png',
    points: 8,
    type: 'vegetable',
    rarity: 'common',
  },
  {
    id: 10,
    name: 'Edamame',
    imageSrc: '/assets/images/veg-edamame.png',
    points: 12,
    type: 'vegetable',
    rarity: 'common',
  },
  {
    id: 11,
    name: 'Mushrooms',
    imageSrc: '/assets/images/veg-mushrooms.png',
    points: 15,
    type: 'vegetable',
    rarity: 'rare',
  },

  // Garnishes
  {
    id: 12,
    name: 'Nori',
    imageSrc: '/assets/images/garnish-nori.png',
    points: 5,
    type: 'garnish',
    rarity: 'common',
  },
  {
    id: 13,
    name: 'Sesame Seeds',
    imageSrc: '/assets/images/garnish-sesame.png',
    points: 3,
    type: 'garnish',
    rarity: 'common',
  },
  {
    id: 14,
    name: 'Wasabi',
    imageSrc: '/assets/images/garnish-wasabi.png',
    points: 8,
    type: 'garnish',
    rarity: 'rare',
  },
  {
    id: 15,
    name: 'Truffle',
    imageSrc: '/assets/images/garnish-truffle.png',
    points: 30,
    type: 'garnish',
    rarity: 'epic',
  },
];

const BENTO_BOX_IMAGE = '/assets/images/bento-box.png';

export default function BentoBoss() {
  const { unlockAchievement } = useAchievements();
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [fallingIngredients, setFallingIngredients] = useState<FallingIngredient[]>([]);
  const [bentoSlots, setBentoSlots] = useState<BentoSlot[]>([]);
  const [combo, setCombo] = useState(0);
  const [perfectBentos, setPerfectBentos] = useState(0);

  const GAME_WIDTH = 800;
  const GAME_HEIGHT = 600;
  const BENTO_WIDTH = 400;
  const BENTO_HEIGHT = 300;
  const BENTO_X = (GAME_WIDTH - BENTO_WIDTH) / 2;
  const BENTO_Y = GAME_HEIGHT - BENTO_HEIGHT - 50;

  // Initialize bento slots
  const initializeBentoSlots = useCallback(() => {
    const slots: BentoSlot[] = [
      // Rice section (top left)
      { id: 1, ingredient: null, type: 'rice', x: BENTO_X + 50, y: BENTO_Y + 50 },
      { id: 2, ingredient: null, type: 'rice', x: BENTO_X + 120, y: BENTO_Y + 50 },

      // Protein section (top right)
      { id: 3, ingredient: null, type: 'protein', x: BENTO_X + 250, y: BENTO_Y + 50 },
      { id: 4, ingredient: null, type: 'protein', x: BENTO_X + 320, y: BENTO_Y + 50 },

      // Vegetable section (bottom left)
      { id: 5, ingredient: null, type: 'vegetable', x: BENTO_X + 50, y: BENTO_Y + 150 },
      { id: 6, ingredient: null, type: 'vegetable', x: BENTO_X + 120, y: BENTO_Y + 150 },

      // Garnish section (bottom right)
      { id: 7, ingredient: null, type: 'garnish', x: BENTO_X + 250, y: BENTO_Y + 150 },
      { id: 8, ingredient: null, type: 'garnish', x: BENTO_X + 320, y: BENTO_Y + 150 },
    ];
    setBentoSlots(slots);
  }, []);

  // Initialize game
  const initializeGame = useCallback(() => {
    setScore(0);
    setLevel(1);
    setTimeLeft(60);
    setCombo(0);
    setPerfectBentos(0);
    setFallingIngredients([]);
    setIsGameActive(true);
    setIsGameOver(false);
    initializeBentoSlots();
  }, [initializeBentoSlots]);

  // Game timer
  useEffect(() => {
    if (!isGameActive || isGameOver) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsGameOver(true);
          setIsGameActive(false);
          if (score > 500) unlockAchievement('bento_boss_master');
          if (perfectBentos >= 3) unlockAchievement('bento_boss_perfectionist');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameActive, isGameOver, score, perfectBentos, unlockAchievement]);

  // Spawn falling ingredients
  useEffect(() => {
    if (!isGameActive || isGameOver) return;

    const spawnInterval = setInterval(
      () => {
        const ingredient = INGREDIENTS[Math.floor(Math.random() * INGREDIENTS.length)];
        const newFallingIngredient: FallingIngredient = {
          id: Date.now() + Math.random(),
          ingredient,
          x: Math.random() * (GAME_WIDTH - 50),
          y: -50,
          speed: 1 + Math.random() * 2 + level * 0.5,
          rotation: 0,
        };
        setFallingIngredients(prev => [...prev, newFallingIngredient]);
      },
      2000 - level * 100
    ); // Faster spawning as level increases

    return () => clearInterval(spawnInterval);
  }, [isGameActive, isGameOver, level]);

  // Update falling ingredients
  useEffect(() => {
    if (!isGameActive || isGameOver) return;

    const updateInterval = setInterval(() => {
      setFallingIngredients(prev =>
        prev
          .map(ingredient => ({
            ...ingredient,
            y: ingredient.y + ingredient.speed,
            rotation: ingredient.rotation + 2,
          }))
          .filter(ingredient => ingredient.y < GAME_HEIGHT + 50)
      );
    }, 16);

    return () => clearInterval(updateInterval);
  }, [isGameActive, isGameOver]);

  // Handle ingredient collection
  const handleIngredientClick = useCallback(
    (fallingIngredient: FallingIngredient) => {
      if (!isGameActive) return;

      // Find matching empty slot
      const matchingSlot = bentoSlots.find(
        slot => slot.type === fallingIngredient.ingredient.type && !slot.ingredient
      );

      if (matchingSlot) {
        // Place ingredient in slot
        setBentoSlots(prev =>
          prev.map(slot =>
            slot.id === matchingSlot.id
              ? { ...slot, ingredient: fallingIngredient.ingredient }
              : slot
          )
        );

        // Add points
        const points = fallingIngredient.ingredient.points * (1 + combo * 0.1);
        setScore(prev => prev + points);
        setCombo(prev => prev + 1);

        // Check for perfect bento
        const filledSlots = bentoSlots.filter(slot => slot.ingredient).length + 1;
        if (filledSlots === 8) {
          setPerfectBentos(prev => prev + 1);
          setScore(prev => prev + 100); // Bonus for complete bento
          unlockAchievement('bento_boss_complete');

          // Clear bento and start new level
          setTimeout(() => {
            setLevel(prev => prev + 1);
            setTimeLeft(prev => prev + 30); // Bonus time
            initializeBentoSlots();
          }, 1000);
        }

        // Remove falling ingredient
        setFallingIngredients(prev => prev.filter(i => i.id !== fallingIngredient.id));
      } else {
        // No matching slot - lose combo
        setCombo(0);
        setFallingIngredients(prev => prev.filter(i => i.id !== fallingIngredient.id));
      }
    },
    [isGameActive, bentoSlots, combo, unlockAchievement, initializeBentoSlots]
  );

  const startGame = () => {
    initializeGame();
  };

  const getRarityColor = (rarity: Ingredient['rarity']) => {
    switch (rarity) {
      case 'common':
        return '#6B7280';
      case 'rare':
        return '#3B82F6';
      case 'epic':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  return (
    <div
      style={{
        background: '#181818',
        minHeight: '100vh',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      {/* GameCube-style header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
          borderRadius: '12px',
          padding: '16px 24px',
          marginBottom: '24px',
          border: '2px solid #F59E0B',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#fff',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              background: '#F59E0B',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#000',
            }}
          >
            GC
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>Bento Boss</h1>
          <div
            style={{
              fontSize: '12px',
              color: '#F59E0B',
              fontFamily: 'monospace',
            }}
          >
            GAME CUBE
          </div>
        </div>
      </div>

      <p style={{ fontSize: 18, marginBottom: 32, textAlign: 'center' }}>
        Stack ingredients in the correct bento sections! Build combos for bonus points.
      </p>

      {/* Game Stats */}
      <div
        style={{
          display: 'flex',
          gap: '20px',
          marginBottom: '20px',
          fontSize: '18px',
          fontWeight: 'bold',
          background: 'rgba(139, 92, 246, 0.1)',
          padding: '12px 20px',
          borderRadius: '8px',
          border: '1px solid #8B5CF6',
        }}
      >
        <div>Time: {timeLeft}s</div>
        <div>Score: {score}</div>
        <div>Level: {level}</div>
        <div>Combo: {combo}</div>
        <div>Perfect: {perfectBentos}</div>
      </div>

      {/* Game Area */}
      <div
        style={{
          position: 'relative',
          width: GAME_WIDTH,
          height: GAME_HEIGHT,
          background: 'rgba(139, 92, 246, 0.05)',
          borderRadius: '12px',
          border: '2px solid #8B5CF6',
          overflow: 'hidden',
          marginBottom: '20px',
        }}
      >
        {/* Bento Box */}
        <div
          style={{
            position: 'absolute',
            left: BENTO_X,
            top: BENTO_Y,
            width: BENTO_WIDTH,
            height: BENTO_HEIGHT,
            background: 'linear-gradient(135deg, #8B4513, #A0522D)',
            border: '3px solid #654321',
            borderRadius: '8px',
            display: 'flex',
            flexWrap: 'wrap',
            padding: '20px',
          }}
        >
          {/* Bento slots */}
          {bentoSlots.map(slot => (
            <div
              key={slot.id}
              style={{
                width: '60px',
                height: '60px',
                margin: '5px',
                border: '2px dashed #654321',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: slot.ingredient ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              }}
            >
              {slot.ingredient && (
                <div style={{ textAlign: 'center' }}>
                  <Image
                    src={slot.ingredient.imageSrc}
                    alt={slot.ingredient.name}
                    width={40}
                    height={40}
                    style={{
                      objectFit: 'cover',
                      borderRadius: '4px',
                      border: `2px solid ${getRarityColor(slot.ingredient.rarity)}`,
                    }}
                  />
                  <div style={{ fontSize: '8px', marginTop: '2px' }}>{slot.ingredient.points}</div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Falling Ingredients */}
        {fallingIngredients.map(ingredient => (
          <div
            key={ingredient.id}
            onClick={() => handleIngredientClick(ingredient)}
            style={{
              position: 'absolute',
              left: ingredient.x,
              top: ingredient.y,
              width: '40px',
              height: '40px',
              cursor: 'pointer',
              transform: `rotate(${ingredient.rotation}deg)`,
              transition: 'transform 0.1s ease',
            }}
          >
            <Image
              src={ingredient.ingredient.imageSrc}
              alt={ingredient.ingredient.name}
              width={40}
              height={40}
              style={{
                objectFit: 'cover',
                borderRadius: '4px',
                border: `2px solid ${getRarityColor(ingredient.ingredient.rarity)}`,
                boxShadow: `0 0 10px ${getRarityColor(ingredient.ingredient.rarity)}`,
              }}
            />
          </div>
        ))}

        {/* Game Over Overlay */}
        {!isGameActive && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                background: '#333',
                padding: '40px',
                borderRadius: '16px',
                textAlign: 'center',
                border: '2px solid #8B5CF6',
              }}
            >
              <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>
                {isGameOver ? "⏰ Time's Up! ⏰" : '🍱 Ready to Cook! 🍱'}
              </h2>
              <p style={{ fontSize: '18px', marginBottom: '20px' }}>Final Score: {score}</p>
              <p style={{ fontSize: '16px', marginBottom: '30px' }}>
                Level: {level} | Perfect Bentos: {perfectBentos}
              </p>
              <button
                onClick={startGame}
                style={{
                  fontSize: '18px',
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  marginRight: '10px',
                  fontWeight: 'bold',
                }}
              >
                {isGameOver ? 'Play Again' : 'Start Game'}
              </button>
              <button
                onClick={() => window.history.back()}
                style={{
                  fontSize: '18px',
                  padding: '12px 24px',
                  background: '#6B7280',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                Back to Menu
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <button
          onClick={startGame}
          style={{
            fontSize: '16px',
            padding: '10px 20px',
            background: '#10B981',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Restart Game
        </button>

        <button
          onClick={() => window.history.back()}
          style={{
            fontSize: '16px',
            padding: '10px 20px',
            background: '#6B7280',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Back to Menu
        </button>
      </div>

      {/* Instructions */}
      <div style={{ fontSize: '14px', textAlign: 'center', maxWidth: '600px' }}>
        <p>
          <strong>How to play:</strong>
        </p>
        <p>• Click falling ingredients to place them in the correct bento sections</p>
        <p>
          • Rice goes in top-left, Protein in top-right, Vegetables in bottom-left, Garnish in
          bottom-right
        </p>
        <p>• Complete bentos for bonus points and time</p>
        <p>• Build combos for multiplier bonuses!</p>
        <p>
          <strong>Rarity:</strong> <span style={{ color: '#6B7280' }}>Common</span> |{' '}
          <span style={{ color: '#3B82F6' }}>Rare</span> |{' '}
          <span style={{ color: '#8B5CF6' }}>Epic</span>
        </p>
      </div>
    </div>
  );
}
