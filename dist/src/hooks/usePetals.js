'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.usePetals = void 0;
const react_1 = require('react');
const useLocalStorage_1 = require('./useLocalStorage');
const PETAL_REWARDS = [
  { count: 10, reward: 'WELCOME10', claimed: false },
  { count: 50, reward: 'BLOOM25', claimed: false },
  { count: 100, reward: 'SAKURA50', claimed: false },
  { count: 500, reward: 'LEGENDARY100', claimed: false },
];
const usePetals = () => {
  const [totalPetals, setTotalPetals] = (0, useLocalStorage_1.useLocalStorage)('totalPetals', 0);
  const [rewards, setRewards] = (0, useLocalStorage_1.useLocalStorage)(
    'petalRewards',
    PETAL_REWARDS
  );
  const [showReward, setShowReward] = (0, react_1.useState)(null);
  const addPetal = () => {
    setTotalPetals(prev => prev + 1);
  };
  const checkRewards = count => {
    const newRewards = rewards.map(reward => {
      if (count >= reward.count && !reward.claimed) {
        setShowReward(reward.reward);
        return { ...reward, claimed: true };
      }
      return reward;
    });
    setRewards(newRewards);
  };
  const claimReward = code => {
    // Here you would typically make an API call to validate and apply the discount
    console.log(`Claiming reward: ${code}`);
    setShowReward(null);
  };
  (0, react_1.useEffect)(() => {
    checkRewards(totalPetals);
  }, [totalPetals]);
  return {
    totalPetals,
    rewards,
    showReward,
    addPetal,
    claimReward,
  };
};
exports.usePetals = usePetals;
