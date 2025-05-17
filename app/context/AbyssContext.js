'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const AbyssContext = createContext();

export function AbyssProvider({ children }) {
  const { data: session } = useSession();
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [collectedPetals, setCollectedPetals] = useState(0);
  const [showParticleEffect, setShowParticleEffect] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkVerification = async () => {
      if (session?.user) {
        const { data: preferences } = await supabase
          .from('user_preferences')
          .select('abyss_verified, collected_petals')
          .eq('user_id', session.user.id)
          .single();

        setIsVerified(preferences?.abyss_verified || false);
        setCollectedPetals(preferences?.collected_petals || 0);
      }
      setIsLoading(false);
    };

    checkVerification();
  }, [session, supabase]);

  const handleVerification = async () => {
    if (session?.user) {
      await supabase.from('user_preferences').upsert({
        user_id: session.user.id,
        abyss_verified: true,
        verified_at: new Date().toISOString(),
      });
      setIsVerified(true);
    }
  };

  const collectPetal = async () => {
    if (session?.user) {
      const newCount = collectedPetals + 1;
      await supabase.from('user_preferences').upsert({
        user_id: session.user.id,
        collected_petals: newCount,
      });
      setCollectedPetals(newCount);
      setShowParticleEffect(true);
      setTimeout(() => setShowParticleEffect(false), 2000);
    }
  };

  const value = {
    isVerified,
    isLoading,
    collectedPetals,
    showParticleEffect,
    handleVerification,
    collectPetal,
  };

  return <AbyssContext.Provider value={value}>{children}</AbyssContext.Provider>;
}

export function useAbyss() {
  const context = useContext(AbyssContext);
  if (context === undefined) {
    throw new Error('useAbyss must be used within an AbyssProvider');
  }
  return context;
}
