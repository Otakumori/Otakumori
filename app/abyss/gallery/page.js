'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function AbyssGallery() {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Fetch R18 artworks
    const fetchArtworks = async () => {
      try {
        // TODO: Implement API integration for R18 artworks
        // For now, using mock data
        setArtworks([
          {
            id: 1,
            title: 'Midnight Sakura',
            artist: 'Artist1',
            image: '/abyss/gallery/art1.jpg',
            category: 'digital',
            tags: ['anime', 'nsfw'],
            likes: 234,
            comments: 45
          },
          {
            id: 2,
            title: 'Eternal Night',
            artist: 'Artist2',
            image: '/abyss/gallery/art2.jpg',
            category: 'traditional',
            tags: ['manga', 'nsfw'],
            likes: 189,
            comments: 32
          },
          // Add more artworks as needed
        ]);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching artworks:', error);
        setLoading(false);
      }
    };

    fetchArtworks();
  }, []);

  const filteredArtworks = artworks.filter(artwork => 
    filter === 'all' ? true : artwork.category === filter
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h1 className="text-4xl font-bold text-pink-500 mb-8">Abyss Gallery</h1>

      {/* Filter Controls */}
      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'all'
              ? 'bg-pink-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:text-pink-500'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('digital')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'digital'
              ? 'bg-pink-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:text-pink-500'
          }`}
        >
          Digital
        </button>
        <button
          onClick={() => setFilter('traditional')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'traditional'
              ? 'bg-pink-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:text-pink-500'
          }`}
        >
          Traditional
        </button>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArtworks.map((artwork) => (
          <motion.div
            key={artwork.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-lg overflow-hidden shadow-xl cursor-pointer"
            onClick={() => setSelectedArtwork(artwork)}
          >
            <div className="relative h-64">
              <Image
                src={artwork.image}
                alt={artwork.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h2 className="text-xl font-bold text-pink-500 mb-2">{artwork.title}</h2>
              <p className="text-gray-400 mb-2">by {artwork.artist}</p>
              <div className="flex space-x-2 mb-2">
                {artwork.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-gray-700 text-gray-300 text-sm px-2 py-1 rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>❤️ {artwork.likes}</span>
                <span>💬 {artwork.comments}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Artwork Modal */}
      {selectedArtwork && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-lg max-w-4xl w-full overflow-hidden"
          >
            <div className="relative h-[60vh]">
              <Image
                src={selectedArtwork.image}
                alt={selectedArtwork.title}
                fill
                className="object-contain"
              />
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-pink-500">{selectedArtwork.title}</h2>
                  <p className="text-gray-400">by {selectedArtwork.artist}</p>
                </div>
                <button
                  onClick={() => setSelectedArtwork(null)}
                  className="text-gray-400 hover:text-pink-500"
                >
                  ✕
                </button>
              </div>
              <div className="flex space-x-2 mb-4">
                {selectedArtwork.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-gray-700 text-gray-300 text-sm px-2 py-1 rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="flex justify-between items-center">
                <div className="flex space-x-4">
                  <button className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg">
                    ❤️ Like
                  </button>
                  <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg">
                    💬 Comment
                  </button>
                </div>
                <div className="text-gray-400">
                  <span className="mr-4">❤️ {selectedArtwork.likes}</span>
                  <span>💬 {selectedArtwork.comments}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Content Warning */}
      <div className="mt-8 p-4 bg-gray-800 rounded-lg">
        <p className="text-gray-400 text-sm">
          All artwork in the Abyss Gallery contains explicit content. By viewing, you confirm that you are 18 or older.
        </p>
      </div>
    </div>
  );
} 