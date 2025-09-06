/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/app/hooks/hooks/useLocalStorage';

interface PetalReward {
  count: number;
  reward: string;
  claimed: boolean;
}

const PETAL_REWARDS: PetalReward[] = [
  { count: 10, reward: 'WELCOME10', claimed: false },
  { count: 50, reward: 'BLOOM25', claimed: false },
  { count: 100, reward: 'SAKURA50', claimed: false },
  { count: 500, reward: 'LEGENDARY100', claimed: false },
];

export const usePetals = () => {
  const [totalPetals, setTotalPetals] = useLocalStorage('totalPetals', 0);
  const [rewards, setRewards] = useLocalStorage('petalRewards', PETAL_REWARDS);
  const [showReward, setShowReward] = useState<string | null>(null);

  const addPetal = () => {
    setTotalPetals((prev) => prev + 1);
  };

  const checkRewards = (count: number) => {
    const newRewards = rewards.map((reward) => {
      if (count >= reward.count && !reward.claimed) {
        setShowReward(reward.reward);
        return { ...reward, claimed: true };
      }
      return reward;
    });
    setRewards(newRewards);
  };

  const claimReward = (code: string) => {
    // Here you would typically make an API call to validate and apply the discount
    console.log(`Claiming reward: ${code}`);
    setShowReward(null);
  };

  useEffect(() => {
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
