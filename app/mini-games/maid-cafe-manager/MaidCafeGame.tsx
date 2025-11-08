'use client';

import { useEffect, useState, useCallback } from 'react';
import { useGameSave } from '../_shared/SaveSystem';
import { RUNTIME_FLAGS } from '@/constants.client';

interface Customer {
  id: number;
  tableId: number;
  patience: number;
  maxPatience: number;
  order: MenuItem;
  status: 'waiting' | 'ordering' | 'eating' | 'paying' | 'leaving';
  arrivalTime: number;
  orderTime?: number;
  serveTime?: number;
  tips: number;
}

interface MenuItem {
  id: string;
  name: string;
  prepTime: number; // in seconds
  price: number;
  emoji: string;
}

interface Table {
  id: number;
  x: number;
  y: number;
  occupied: boolean;
  needsCleaning: boolean;
}

interface Order {
  id: number;
  customerId: number;
  item: MenuItem;
  status: 'preparing' | 'ready' | 'served';
  startTime: number;
  readyTime: number;
}

export default function MaidCafeGame() {
  // Game state
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameOver'>('menu');
  const [score, setScore] = useState(0);
  const [money, setMoney] = useState(50);
  const [level, setLevel] = useState(1);
  const [gameTime, setGameTime] = useState(0);
  const [gameSpeed, setGameSpeed] = useState(1);

  // Game objects
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<'classic' | 'gothic' | 'modern'>('classic');

  // Player state
  const [playerX, setPlayerX] = useState(400);
  const [playerY, setPlayerY] = useState(300);
  const [isMoving, _setIsMoving] = useState(false);

  // Game timing
  const [customerSpawnTimer, setCustomerSpawnTimer] = useState(0);
  const [nextCustomerId, setNextCustomerId] = useState(1);

  const { saveOnExit, autoSave } = useGameSave('maid-cafe-manager');

  // Menu items
  const menuItems: MenuItem[] = [
    { id: 'tea', name: 'Earl Grey Tea', prepTime: 3, price: 8, emoji: '' },
    { id: 'coffee', name: 'Mocha Latte', prepTime: 4, price: 10, emoji: '' },
    { id: 'cake', name: 'Strawberry Cake', prepTime: 6, price: 15, emoji: '' },
    { id: 'sandwich', name: 'Club Sandwich', prepTime: 8, price: 18, emoji: '' },
    { id: 'parfait', name: 'Berry Parfait', prepTime: 5, price: 12, emoji: '' },
    { id: 'curry', name: 'Maid Special Curry', prepTime: 10, price: 25, emoji: '' },
  ];

  // Initialize tables
  useEffect(() => {
    const initialTables: Table[] = [
      { id: 1, x: 100, y: 150, occupied: false, needsCleaning: false },
      { id: 2, x: 300, y: 150, occupied: false, needsCleaning: false },
      { id: 3, x: 500, y: 150, occupied: false, needsCleaning: false },
      { id: 4, x: 700, y: 150, occupied: false, needsCleaning: false },
      { id: 5, x: 100, y: 350, occupied: false, needsCleaning: false },
      { id: 6, x: 300, y: 350, occupied: false, needsCleaning: false },
      { id: 7, x: 500, y: 350, occupied: false, needsCleaning: false },
      { id: 8, x: 700, y: 350, occupied: false, needsCleaning: false },
    ];
    setTables(initialTables);
  }, []);

  // Avatar options
  const avatarOptions = {
    classic: { emoji: '‍', outfit: 'Classic Maid' },
    gothic: { emoji: '‍️', outfit: 'Gothic Lolita' },
    modern: { emoji: '‍', outfit: 'Modern Casual' },
  };

  // Start game
  const startGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setMoney(50);
    setLevel(1);
    setGameTime(0);
    setGameSpeed(1);
    setCustomers([]);
    setOrders([]);
    setCustomerSpawnTimer(0);
    setNextCustomerId(1);
    setPlayerX(400);
    setPlayerY(300);

    // Reset tables
    setTables((prev) =>
      prev.map((table) => ({
        ...table,
        occupied: false,
        needsCleaning: false,
      })),
    );
  }, []);

  // Spawn customer
  const spawnCustomer = useCallback(() => {
    const availableTable = tables.find((table) => !table.occupied && !table.needsCleaning);
    if (!availableTable) return;

    const randomItem = menuItems[Math.floor(Math.random() * Math.min(menuItems.length, 2 + level))];
    const basePatience = 30000; // 30 seconds base
    const levelAdjustment = Math.max(15000, basePatience - (level - 1) * 2000);

    const newCustomer: Customer = {
      id: nextCustomerId,
      tableId: availableTable.id,
      patience: levelAdjustment,
      maxPatience: levelAdjustment,
      order: randomItem,
      status: 'waiting',
      arrivalTime: gameTime,
      tips: Math.floor(randomItem.price * 0.2) + Math.floor(Math.random() * 5),
    };

    setCustomers((prev) => [...prev, newCustomer]);
    setTables((prev) =>
      prev.map((table) => (table.id === availableTable.id ? { ...table, occupied: true } : table)),
    );
    setNextCustomerId((prev) => prev + 1);
  }, [tables, nextCustomerId, gameTime, level]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = setInterval(() => {
      const deltaTime = 100;
      setGameTime((prev) => prev + deltaTime);

      // Update customer spawn timer
      setCustomerSpawnTimer((prev) => {
        const spawnRate = Math.max(3000, 8000 - level * 500); // Faster spawning each level
        if (prev <= 0) {
          spawnCustomer();
          return spawnRate;
        }
        return prev - deltaTime;
      });

      // Update customer patience
      setCustomers((prev) =>
        prev.map((customer) => {
          const newPatience = customer.patience - deltaTime;
          if (newPatience <= 0 && customer.status !== 'leaving') {
            // Customer leaves angry
            setScore((s) => Math.max(0, s - 50));
            setTables((tables) =>
              tables.map((table) =>
                table.id === customer.tableId
                  ? { ...table, occupied: false, needsCleaning: true }
                  : table,
              ),
            );
            return { ...customer, status: 'leaving' as const, patience: 0 };
          }
          return { ...customer, patience: newPatience };
        }),
      );

      // Update orders
      setOrders((prev) =>
        prev.map((order) => {
          if (order.status === 'preparing' && gameTime >= order.readyTime) {
            return { ...order, status: 'ready' };
          }
          return order;
        }),
      );

      // Check level progression
      if (score >= level * 500) {
        setLevel((l) => l + 1);
        setGameSpeed((s) => Math.min(2, s + 0.1));
      }
    }, 100);

    return () => clearInterval(gameLoop);
  }, [gameState, gameTime, level, score, spawnCustomer]);

  // Auto-save progress
  useEffect(() => {
    if (gameState === 'playing' && score > 0 && score % 200 === 0) {
      autoSave({
        score,
        level,
        progress: Math.min(1.0, score / 2000),
        stats: { money, gameTime, avatar: selectedAvatar },
      }).catch(() => {}); // Ignore save errors during gameplay
    }
  }, [score, level, money, gameTime, selectedAvatar, autoSave, gameState]);

  // Player actions
  const takeOrder = useCallback(
    (customerId: number) => {
      const customer = customers.find((c) => c.id === customerId);
      if (!customer || customer.status !== 'waiting') return;

      const newOrder: Order = {
        id: Date.now(),
        customerId,
        item: customer.order,
        status: 'preparing',
        startTime: gameTime,
        readyTime: gameTime + customer.order.prepTime * 1000,
      };

      setOrders((prev) => [...prev, newOrder]);
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === customerId ? { ...c, status: 'ordering', orderTime: gameTime } : c,
        ),
      );
    },
    [customers, gameTime],
  );

  const serveOrder = useCallback(
    (orderId: number) => {
      const order = orders.find((o) => o.id === orderId);
      if (!order || order.status !== 'ready') return;

      const customer = customers.find((c) => c.id === order.customerId);
      if (!customer) return;

      // Calculate tips based on speed
      const serviceTime = gameTime - customer.arrivalTime;
      const speedBonus = Math.max(0, customer.maxPatience - serviceTime) / customer.maxPatience;
      const finalTips = Math.floor(customer.tips * (0.5 + speedBonus * 0.5));

      setMoney((prev) => prev + order.item.price + finalTips);
      setScore((prev) => prev + order.item.price + finalTips);

      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: 'served' } : o)));

      setCustomers((prev) =>
        prev.map((c) =>
          c.id === customer.id ? { ...c, status: 'eating', serveTime: gameTime } : c,
        ),
      );

      // Customer leaves after eating
      setTimeout(() => {
        setCustomers((prev) => prev.filter((c) => c.id !== customer.id));
        setOrders((prev) => prev.filter((o) => o.customerId !== customer.id));
        setTables((prev) =>
          prev.map((table) =>
            table.id === customer.tableId
              ? { ...table, occupied: false, needsCleaning: true }
              : table,
          ),
        );
      }, 3000);
    },
    [orders, customers, gameTime],
  );

  const cleanTable = useCallback((tableId: number) => {
    setTables((prev) =>
      prev.map((table) => (table.id === tableId ? { ...table, needsCleaning: false } : table)),
    );
    setScore((prev) => prev + 10); // Small bonus for cleaning
  }, []);

  // Remove leaving customers
  useEffect(() => {
    const leavingCustomers = customers.filter((c) => c.status === 'leaving');
    leavingCustomers.forEach((customer) => {
      setTimeout(() => {
        setCustomers((prev) => prev.filter((c) => c.id !== customer.id));
        setOrders((prev) => prev.filter((o) => o.customerId !== customer.id));
      }, 1000);
    });
  }, [customers]);

  // Save on game end
  useEffect(() => {
    if (gameState === 'gameOver') {
      saveOnExit({
        score,
        level,
        progress: Math.min(1.0, score / 2000),
        stats: {
          finalMoney: money,
          gameTime,
          avatar: selectedAvatar,
          customersServed: nextCustomerId - 1,
          lastPlayed: Date.now(),
        },
      }).catch(console.error);
    }
  }, [gameState, score, level, money, gameTime, selectedAvatar, nextCustomerId, saveOnExit]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000) % 60;
    const minutes = Math.floor(ms / 60000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (gameState === 'menu') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900">
        <div className="text-center text-white max-w-md">
          <div className="text-6xl mb-6"></div>
          <h2 className="text-3xl font-bold mb-4">Maid Café Manager</h2>
          <p className="text-gray-300 mb-8">Manage shifts and keep guests smiling.</p>

          {/* Avatar Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Choose Your Maid</h3>
            <div className="flex justify-center gap-4">
              {Object.entries(avatarOptions).map(([key, avatar]) => (
                <button
                  key={key}
                  onClick={() => setSelectedAvatar(key as any)}
                  className={`p-3 rounded-xl border-2 transition-colors ${
                    selectedAvatar === key
                      ? 'border-pink-400 bg-pink-500/20'
                      : 'border-gray-600 hover:border-pink-500'
                  }`}
                >
                  <div className="text-2xl mb-1">{avatar.emoji}</div>
                  <div className="text-xs">{avatar.outfit}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startGame}
            className="px-8 py-3 bg-pink-600 hover:bg-pink-700 rounded-xl transition-colors text-lg font-semibold mb-6"
          >
            Start Shift
          </button>

          <div className="text-sm text-gray-400 space-y-1">
            <p> Click customers to take orders</p>
            <p>️ Click ready orders to serve</p>
            <p> Click dirty tables to clean</p>
            <p> Earn money and tips for good service</p>
          </div>

          <p className="text-sm text-gray-400 mt-6">
            "I didn't lose. Just ran out of health." – Edward Elric
          </p>
        </div>
      </div>
    );
  }

  if (gameState === 'paused') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black/80">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Paused</h2>
          <button
            onClick={() => setGameState('playing')}
            className="px-6 py-3 bg-pink-600 hover:bg-pink-700 rounded-xl transition-colors"
          >
            Resume Shift
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'gameOver') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-900 via-purple-900 to-black">
        <div className="text-center text-white">
          <div className="text-6xl mb-4"></div>
          <h2 className="text-3xl font-bold mb-4">Shift Ended</h2>
          <div className="space-y-2 mb-6">
            <div className="text-xl">Final Score: {score.toLocaleString()}</div>
            <div className="text-lg text-gray-300">Money Earned: ${money}</div>
            <div className="text-lg text-gray-300">Level Reached: {level}</div>
            <div className="text-lg text-gray-300">Time Worked: {formatTime(gameTime)}</div>
          </div>
          <div className="space-x-4">
            <button
              onClick={startGame}
              className="px-6 py-3 bg-pink-600 hover:bg-pink-700 rounded-xl transition-colors"
            >
              New Shift
            </button>
            <a
              href="/mini-games"
              className="inline-block px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-xl transition-colors"
            >
              Back to Hub
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-pink-100 via-purple-50 to-blue-50 relative overflow-hidden">
      {/* UI Header */}
      <div className="absolute top-0 left-0 right-0 bg-black/80 text-white p-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-6">
          <div>Score: {score.toLocaleString()}</div>
          <div>Money: ${money}</div>
          <div>Level: {level}</div>
          <div>Time: {formatTime(gameTime)}</div>
          {RUNTIME_FLAGS.isDev && (
            <>
              <div className="text-gray-400">Speed: {gameSpeed.toFixed(1)}x</div>
              <div className="text-gray-400">
                Next: {Math.max(0, Math.floor(customerSpawnTimer / 100))}
              </div>
            </>
          )}
        </div>
        <button
          onClick={() => setGameState('paused')}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded transition-colors"
        >
          Pause
        </button>
      </div>

      {/* Game Area */}
      <div className="pt-20 p-4 relative h-full">
        {/* Kitchen/Order Area */}
        <div className="absolute top-24 right-4 bg-gray-800 text-white p-4 rounded-xl w-64">
          <h3 className="font-bold mb-2">Kitchen Orders</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {orders.map((order) => (
              <div
                key={order.id}
                className={`p-2 rounded cursor-pointer transition-colors ${
                  order.status === 'ready' ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600'
                }`}
                onClick={() => order.status === 'ready' && serveOrder(order.id)}
                onKeyDown={(e) =>
                  e.key === 'Enter' && order.status === 'ready' && serveOrder(order.id)
                }
                role="button"
                tabIndex={0}
                aria-label={`Serve order ${order.id}`}
              >
                <div className="flex items-center justify-between">
                  <span>
                    {order.item.emoji} {order.item.name}
                  </span>
                  <span className="text-xs">
                    {order.status === 'ready' ? ' Ready!' : '⏱️ Cooking...'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tables */}
        {tables.map((table) => (
          <div
            key={table.id}
            className={`absolute w-16 h-16 rounded-lg border-2 flex items-center justify-center text-2xl cursor-pointer transition-all ${
              table.needsCleaning
                ? 'bg-red-200 border-red-400 hover:bg-red-300'
                : table.occupied
                  ? 'bg-blue-200 border-blue-400'
                  : 'bg-green-200 border-green-400'
            }`}
            style={{ left: table.x, top: table.y }}
            onClick={() => table.needsCleaning && cleanTable(table.id)}
            onKeyDown={(e) => e.key === 'Enter' && table.needsCleaning && cleanTable(table.id)}
            role="button"
            tabIndex={0}
            aria-label={`Clean table ${table.id}`}
          >
            {table.needsCleaning ? '' : table.occupied ? '' : ''}
          </div>
        ))}

        {/* Customers */}
        {customers.map((customer) => {
          const table = tables.find((t) => t.id === customer.tableId);
          if (!table) return null;

          return (
            <div
              key={customer.id}
              className="absolute cursor-pointer transition-all hover:scale-110"
              style={{
                left: table.x - 10,
                top: table.y - 30,
                opacity: customer.status === 'leaving' ? 0.5 : 1,
              }}
              onClick={() => customer.status === 'waiting' && takeOrder(customer.id)}
              onKeyDown={(e) =>
                e.key === 'Enter' && customer.status === 'waiting' && takeOrder(customer.id)
              }
              role="button"
              tabIndex={0}
              aria-label={`Take order from customer ${customer.id}`}
            >
              {/* Customer */}
              <div className="text-2xl mb-1">
                {customer.status === 'waiting'
                  ? '‍️'
                  : customer.status === 'ordering'
                    ? ''
                    : customer.status === 'eating'
                      ? ''
                      : ''}
              </div>

              {/* Order bubble */}
              {customer.status === 'waiting' && (
                <div className="absolute -top-8 -right-8 bg-white rounded-full w-8 h-8 flex items-center justify-center border-2 border-gray-300">
                  <span className="text-sm">{customer.order.emoji}</span>
                </div>
              )}

              {/* Patience bar */}
              <div className="w-12 h-1 bg-gray-300 rounded">
                <div
                  className={`h-full rounded transition-all ${
                    customer.patience / customer.maxPatience > 0.6
                      ? 'bg-green-500'
                      : customer.patience / customer.maxPatience > 0.3
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                  }`}
                  style={{
                    width: `${(customer.patience / customer.maxPatience) * 100}%`,
                  }}
                />
              </div>
            </div>
          );
        })}

        {/* Player Avatar */}
        <div
          className="absolute text-3xl transition-all z-20"
          style={{
            left: playerX,
            top: playerY,
            transform: isMoving ? 'scale(1.1)' : 'scale(1)',
          }}
        >
          {avatarOptions[selectedAvatar].emoji}
        </div>

        {/* Café Decoration */}
        <div className="absolute bottom-4 left-4 text-6xl opacity-20"></div>
        <div className="absolute bottom-4 right-4 text-6xl opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 text-8xl opacity-10 transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>
    </div>
  );
}
