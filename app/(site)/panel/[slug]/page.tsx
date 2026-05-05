import React from 'react';
import { generateSEO } from '@/app/lib/seo';
import PanelPageClient from './PanelPageClient';
import ClientErrorBoundary from '@/app/components/util/ClientErrorBoundary';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  return generateSEO({
    title: 'Page',
    description: 'Anime x gaming shop + play — petals, runes, rewards.',
    url: `/panel/${slug}`,
  });
}

export default function PanelPage() {
  return (
    <ClientErrorBoundary>
      <PanelPageClient />
    </ClientErrorBoundary>
  );
}

