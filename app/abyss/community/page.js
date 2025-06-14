'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useAbyss } from '../../context/AbyssContext';

export default function CommunityPage() {
  const { data: session, status } = useSession();
  const { petals } = useAbyss();
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: 'User1',
      content: 'Just collected 100 petals!',
      likes: 5,
      comments: 2,
    },
    {
      id: 2,
      author: 'User2',
      content: 'New artwork in the gallery!',
      likes: 3,
      comments: 1,
    },
    // Add more posts as needed
  ]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>Please sign in to access the community</div>;
  }

  const handleLike = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.likes + 1 }
        : post
    ));
  };

  const handleComment = (postId) => {
    // Implement comment functionality
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Community</h1>
      <div className="mb-4">
        <p>Your Petals: {petals}</p>
      </div>
      <div className="space-y-4">
        {posts.map(post => (
          <div key={post.id} className="border p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="h-8 w-8 rounded-full bg-gray-300 mr-2" />
              <span className="font-semibold">{post.author}</span>
            </div>
            <p className="mb-2">{post.content}</p>
            <div className="flex space-x-4">
              <button
                onClick={() => handleLike(post.id)}
                className="text-gray-600 hover:text-blue-500"
              >
                ❤️ {post.likes}
              </button>
              <button
                onClick={() => handleComment(post.id)}
                className="text-gray-600 hover:text-blue-500"
              >
                💬 {post.comments}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
