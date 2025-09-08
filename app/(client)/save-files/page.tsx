// DEPRECATED: This component is a duplicate. Use app\sign-in\[[...sign-in]]\page.tsx instead.
'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import SaveFiles from '@/components/SaveFiles';

export default function SaveFilesPage() {
  return (
    <main className="min-h-screen bg-pink-50">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-pink-900">{<><span role='img' aria-label='emoji'>S</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>v</span><span role='img' aria-label='emoji'>e</span>' '<span role='img' aria-label='emoji'>F</span><span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>l</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>s</span></>}</h1>
        <SaveFiles />
      </div>
    </main>
  );
}
