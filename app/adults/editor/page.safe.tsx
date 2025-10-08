'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { redirect } from 'next/navigation';
import { UltraDetailedCharacterCreator } from '../_components/UltraDetailedCharacterCreator.safe';

export default function AvatarEditorPage() {
  const { user, isLoaded } = useUser();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if user is authenticated
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    redirect('/sign-in?redirect_url=/adults/editor');
  }

  // Load user's existing avatar configuration
  const { data: avatarData, isLoading } = useQuery({
    queryKey: ['user-avatar', user.id],
    queryFn: async () => {
      const response = await fetch('/api/v1/avatar/load');
      if (!response.ok) {
        throw new Error('Failed to load avatar configuration');
      }
      const result = await response.json();
      return result.ok ? result.data : null;
    },
    enabled: !!user.id,
  });

  // Save avatar configuration
  const saveMutation = useMutation({
    mutationFn: async (config: any) => {
      const response = await fetch('/api/v1/avatar/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-idempotency-key': `avatar-save-${Date.now()}-${Math.random()}`,
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save avatar configuration');
      }

      const result = await response.json();
      return result.ok ? result.data : null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-avatar', user.id] });
    },
  });

  // Handle avatar save
  const handleSave = (config: any) => {
    saveMutation.mutate(config);
  };

  // Handle avatar preview
  const handlePreview = (config: any) => {
    // Update preview with new config (trigger re-render with config change)
    console.warn('Preview updated with config:', {
      gender: config.gender,
      hasPhysics: !!config.physics?.softBody?.enable,
    });
  };

  if (!mounted) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your avatar configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-black">
      <UltraDetailedCharacterCreator
        initialConfig={avatarData?.user?.avatarConfig}
        onSave={handleSave}
        onPreview={handlePreview}
      />

      {/* Save Status Indicator */}
      {saveMutation.isPending && (
        <div className="fixed bottom-4 right-4 bg-blue-500/90 text-white px-4 py-2 rounded-lg shadow-lg">
          Saving avatar configuration...
        </div>
      )}

      {saveMutation.isSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-500/90 text-white px-4 py-2 rounded-lg shadow-lg">
          Avatar saved successfully!
        </div>
      )}

      {saveMutation.isError && (
        <div className="fixed bottom-4 right-4 bg-red-500/90 text-white px-4 py-2 rounded-lg shadow-lg">
          Error: {saveMutation.error?.message || 'Failed to save avatar'}
        </div>
      )}
    </div>
  );
}
