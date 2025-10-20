'use client';

import React from 'react';
import CharacterEditor from '@/app/components/avatar/CharacterEditor';
import type { AvatarConfiguration } from '@/app/lib/3d/avatar-parts';

export default function CharacterEditorPage() {
  const handleConfigurationChange = (config: AvatarConfiguration) => {
    console.warn('Configuration updated:', config);
  };

  const handleSave = (config: AvatarConfiguration) => {
    console.warn('Saving configuration:', config);
    // Here you would typically save to database or local storage
    alert('Character saved! (Check console for details)');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-black">
      <CharacterEditor
        onConfigurationChange={handleConfigurationChange}
        onSave={handleSave}
        className="h-screen"
      />
    </div>
  );
}
