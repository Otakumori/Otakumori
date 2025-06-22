import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

interface GalleryPost {
  id: string;
  image: string;
  caption: string;
  author: {
    name: string;
    avatar: string;
  };
  likes: number;
  comments: number;
  createdAt: string;
  type: 'cosplay' | 'purchase';
}

export function CommunityGallery() {
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = React.useState<GalleryPost[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedType, setSelectedType] = React.useState<'all' | 'cosplay' | 'purchase'>('all');

  React.useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/community/posts');
        if (!response.ok) throw new Error('Failed to fetch posts');
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const filteredPosts =
    selectedType === 'all' ? posts : posts.filter(post => post.type === selectedType);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse rounded-lg bg-gray-800/50 p-4">
            <div className="mb-4 aspect-square rounded-lg bg-gray-700" />
            <div className="mb-2 h-6 w-3/4 rounded bg-gray-700" />
            <div className="h-4 w-1/2 rounded bg-gray-700" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex justify-center gap-4">
        <button
          onClick={() => setSelectedType('all')}
          className={`rounded-full px-4 py-2 transition-colors duration-300 ${
            selectedType === 'all'
              ? 'bg-pink-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          All Posts
        </button>
        <button
          onClick={() => setSelectedType('cosplay')}
          className={`rounded-full px-4 py-2 transition-colors duration-300 ${
            selectedType === 'cosplay'
              ? 'bg-pink-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Cosplay
        </button>
        <button
          onClick={() => setSelectedType('purchase')}
          className={`rounded-full px-4 py-2 transition-colors duration-300 ${
            selectedType === 'purchase'
              ? 'bg-pink-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Purchases
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {filteredPosts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group overflow-hidden rounded-lg bg-gray-800/50 transition-colors duration-300 hover:bg-gray-800/70"
          >
            <div className="relative aspect-square">
              <Image
                src={post.image}
                alt={post.caption}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </div>
            <div className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <div className="relative h-8 w-8">
                  <Image
                    src={post.author.avatar}
                    alt={post.author.name}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <span className="text-sm text-gray-300">{post.author.name}</span>
                <span className="text-xs text-gray-400">
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="mb-2 line-clamp-2 text-sm text-gray-300">{post.caption}</p>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <span>{post.likes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <span>{post.comments}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {isAuthenticated && (
        <div className="mt-8 text-center">
          <button className="transform rounded-full bg-pink-600 px-8 py-3 text-white transition-colors duration-300 hover:scale-105 hover:bg-pink-700">
            Share Your Post
          </button>
        </div>
      )}
    </div>
  );
}
