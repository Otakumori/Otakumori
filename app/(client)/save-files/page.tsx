'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import SaveFiles from '@/components/SaveFiles';

export default function SaveFilesPage() {
  return (
    <main className="min-h-screen bg-pink-50">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-pink-900">Save Files</h1>
        <SaveFiles />
      </div>
    </main>
  );
}
