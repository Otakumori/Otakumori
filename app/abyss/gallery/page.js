'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function AbyssGallery() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [artworks, setArtworks] = useState([]);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkAccess = async () => {
      if (status === 'authenticated' && session?.user) {
        const { data: preferences } = await supabase
          .from('user_preferences')
          .select('abyss_verified')
          .eq('user_id', session.user.id)
          .single();

        if (!preferences?.abyss_verified) {
          router.push('/abyss');
          return;
        }
      } else {
        router.push('/auth/signin');
        return;
      }
    };

    checkAccess();
  }, [status, session, router, supabase]);

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const { data, error } = await supabase
          .from('abyss_artworks')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setArtworks(data || []);
      } catch (error) {
        console.error('Error fetching artworks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtworks();
  }, [supabase]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="h-16 w-16 rounded-full border-4 border-pink-500 border-t-transparent"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-4xl font-bold text-pink-500"
        >
          Abyss Gallery
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {artworks.map(artwork => (
            <motion.div
              key={artwork.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedArtwork(artwork)}
              className="cursor-pointer overflow-hidden rounded-lg bg-gray-900 shadow-xl"
            >
              <div className="relative aspect-square">
                <img
                  src={artwork.image_url}
                  alt={artwork.title}
                  className="h-full w-full object-cover"
                />
                {artwork.is_new && (
                  <div className="absolute right-2 top-2 rounded-full bg-pink-500 px-2 py-1 text-sm text-white">
                    New
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="mb-2 text-xl font-bold text-pink-500">{artwork.title}</h3>
                <p className="mb-2 text-gray-400">by {artwork.artist}</p>
                <p className="line-clamp-2 text-sm text-gray-400">{artwork.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <AnimatePresence>
          {selectedArtwork && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
              onClick={() => setSelectedArtwork(null)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="w-full max-w-4xl overflow-hidden rounded-lg bg-gray-900"
                onClick={e => e.stopPropagation()}
              >
                <div className="relative aspect-video">
                  <img
                    src={selectedArtwork.image_url}
                    alt={selectedArtwork.title}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="p-6">
                  <h2 className="mb-2 text-2xl font-bold text-pink-500">{selectedArtwork.title}</h2>
                  <p className="mb-4 text-gray-400">by {selectedArtwork.artist}</p>
                  <p className="mb-6 text-gray-300">{selectedArtwork.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                      Added {new Date(selectedArtwork.created_at).toLocaleDateString()}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedArtwork(null)}
                      className="rounded-lg bg-pink-600 px-6 py-2 font-bold text-white hover:bg-pink-700"
                    >
                      Close
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
