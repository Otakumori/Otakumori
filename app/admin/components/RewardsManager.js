'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const initialRewards = [
  {
    id: 1,
    name: 'Welcome Gift',
    type: 'coupon',
    value: 'WELCOME10',
    discount: 10,
    requiredPetals: 0,
    isActive: true,
  },
  {
    id: 2,
    name: 'Spring Special',
    type: 'coupon',
    value: 'SPRING20',
    discount: 20,
    requiredPetals: 100,
    isActive: true,
  },
  {
    id: 3,
    name: 'Premium Content',
    type: 'access',
    value: 'PREMIUM_ACCESS',
    requiredPetals: 500,
    isActive: true,
  },
];

export default function RewardsManager() {
  const [rewards, setRewards] = useState(initialRewards);
  const [newReward, setNewReward] = useState({
    name: '',
    type: 'coupon',
    value: '',
    discount: 0,
    requiredPetals: 0,
    isActive: true,
  });

  const handleAddReward = () => {
    if (!newReward.name || !newReward.value) return;

    setRewards(prev => [
      ...prev,
      {
        id: Date.now(),
        ...newReward,
      },
    ]);

    setNewReward({
      name: '',
      type: 'coupon',
      value: '',
      discount: 0,
      requiredPetals: 0,
      isActive: true,
    });
  };

  const handleToggleReward = id => {
    setRewards(prev =>
      prev.map(reward => (reward.id === id ? { ...reward, isActive: !reward.isActive } : reward))
    );
  };

  const handleDeleteReward = id => {
    setRewards(prev => prev.filter(reward => reward.id !== id));
  };

  return (
    <div className="space-y-8">
      {/* Add New Reward */}
      <div className="rounded-lg bg-gray-800/50 p-6 backdrop-blur-lg">
        <h3 className="mb-4 text-xl font-bold text-pink-400">Add New Reward</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-gray-300">Reward Name</label>
            <input
              type="text"
              value={newReward.name}
              onChange={e => setNewReward(prev => ({ ...prev, name: e.target.value }))}
              className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
            />
          </div>
          <div>
            <label className="mb-2 block text-gray-300">Type</label>
            <select
              value={newReward.type}
              onChange={e => setNewReward(prev => ({ ...prev, type: e.target.value }))}
              className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
            >
              <option value="coupon">Coupon</option>
              <option value="access">Premium Access</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-gray-300">Value</label>
            <input
              type="text"
              value={newReward.value}
              onChange={e => setNewReward(prev => ({ ...prev, value: e.target.value }))}
              className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
            />
          </div>
          {newReward.type === 'coupon' && (
            <div>
              <label className="mb-2 block text-gray-300">Discount (%)</label>
              <input
                type="number"
                value={newReward.discount}
                onChange={e =>
                  setNewReward(prev => ({ ...prev, discount: parseInt(e.target.value) }))
                }
                className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
              />
            </div>
          )}
          <div>
            <label className="mb-2 block text-gray-300">Required Petals</label>
            <input
              type="number"
              value={newReward.requiredPetals}
              onChange={e =>
                setNewReward(prev => ({ ...prev, requiredPetals: parseInt(e.target.value) }))
              }
              className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
            />
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAddReward}
          className="mt-4 rounded-lg bg-pink-500 px-6 py-2 font-semibold text-white hover:bg-pink-600"
        >
          Add Reward
        </motion.button>
      </div>

      {/* Rewards List */}
      <div className="rounded-lg bg-gray-800/50 p-6 backdrop-blur-lg">
        <h3 className="mb-4 text-xl font-bold text-pink-400">Active Rewards</h3>
        <div className="space-y-4">
          {rewards.map(reward => (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between rounded-lg bg-gray-700/50 p-4"
            >
              <div>
                <h4 className="text-lg font-semibold text-pink-300">{reward.name}</h4>
                <p className="text-gray-400">
                  {reward.type === 'coupon' ? `${reward.discount}% off` : 'Premium Access'}
                </p>
                <p className="text-sm text-gray-500">Required Petals: {reward.requiredPetals}</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleToggleReward(reward.id)}
                  className={`rounded-lg px-4 py-2 ${
                    reward.isActive
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-gray-500 hover:bg-gray-600'
                  } text-white`}
                >
                  {reward.isActive ? 'Active' : 'Inactive'}
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDeleteReward(reward.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg bg-gray-800/50 p-6 backdrop-blur-lg">
          <h4 className="mb-2 text-lg font-semibold text-pink-300">Total Rewards</h4>
          <p className="text-3xl font-bold text-white">{rewards.length}</p>
        </div>
        <div className="rounded-lg bg-gray-800/50 p-6 backdrop-blur-lg">
          <h4 className="mb-2 text-lg font-semibold text-pink-300">Active Rewards</h4>
          <p className="text-3xl font-bold text-white">{rewards.filter(r => r.isActive).length}</p>
        </div>
        <div className="rounded-lg bg-gray-800/50 p-6 backdrop-blur-lg">
          <h4 className="mb-2 text-lg font-semibold text-pink-300">Average Required Petals</h4>
          <p className="text-3xl font-bold text-white">
            {Math.round(rewards.reduce((acc, r) => acc + r.requiredPetals, 0) / rewards.length)}
          </p>
        </div>
      </div>
    </div>
  );
}
