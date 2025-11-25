
'use client';

import { useUser } from '@clerk/nextjs';
import { useState } from 'react';
import { useAbyss } from '@/context/AbyssContext';

export default function CommunityPage() {
  const { user, isLoaded } = useUser();
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

  if (!isLoaded) {
    return (
      <div>
        {
          <>
            <span role="img" aria-label="emoji">
              L
            </span>
            <span role="img" aria-label="emoji">
              o
            </span>
            <span role="img" aria-label="emoji">
              a
            </span>
            <span role="img" aria-label="emoji">
              d
            </span>
            <span role="img" aria-label="emoji">
              i
            </span>
            <span role="img" aria-label="emoji">
              n
            </span>
            <span role="img" aria-label="emoji">
              g
            </span>
            ...
          </>
        }
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        {
          <>
            <span role="img" aria-label="emoji">
              P
            </span>
            <span role="img" aria-label="emoji">
              l
            </span>
            <span role="img" aria-label="emoji">
              e
            </span>
            <span role="img" aria-label="emoji">
              a
            </span>
            <span role="img" aria-label="emoji">
              s
            </span>
            <span role="img" aria-label="emoji">
              e
            </span>
            ' '
            <span role="img" aria-label="emoji">
              s
            </span>
            <span role="img" aria-label="emoji">
              i
            </span>
            <span role="img" aria-label="emoji">
              g
            </span>
            <span role="img" aria-label="emoji">
              n
            </span>
            ' '
            <span role="img" aria-label="emoji">
              i
            </span>
            <span role="img" aria-label="emoji">
              n
            </span>
            ' '
            <span role="img" aria-label="emoji">
              t
            </span>
            <span role="img" aria-label="emoji">
              o
            </span>
            ' '
            <span role="img" aria-label="emoji">
              a
            </span>
            <span role="img" aria-label="emoji">
              c
            </span>
            <span role="img" aria-label="emoji">
              c
            </span>
            <span role="img" aria-label="emoji">
              e
            </span>
            <span role="img" aria-label="emoji">
              s
            </span>
            <span role="img" aria-label="emoji">
              s
            </span>
            ' '
            <span role="img" aria-label="emoji">
              t
            </span>
            <span role="img" aria-label="emoji">
              h
            </span>
            <span role="img" aria-label="emoji">
              e
            </span>
            ' '
            <span role="img" aria-label="emoji">
              c
            </span>
            <span role="img" aria-label="emoji">
              o
            </span>
            <span role="img" aria-label="emoji">
              m
            </span>
            <span role="img" aria-label="emoji">
              m
            </span>
            <span role="img" aria-label="emoji">
              u
            </span>
            <span role="img" aria-label="emoji">
              n
            </span>
            <span role="img" aria-label="emoji">
              i
            </span>
            <span role="img" aria-label="emoji">
              t
            </span>
            <span role="img" aria-label="emoji">
              y
            </span>
          </>
        }
      </div>
    );
  }

  const handleLike = (postId) => {
    setPosts(posts.map((post) => (post.id === postId ? { ...post, likes: post.likes + 1 } : post)));
  };

  const handleComment = (_postId) => {
    // Implement comment functionality
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">
        {
          <>
            <span role="img" aria-label="emoji">
              C
            </span>
            <span role="img" aria-label="emoji">
              o
            </span>
            <span role="img" aria-label="emoji">
              m
            </span>
            <span role="img" aria-label="emoji">
              m
            </span>
            <span role="img" aria-label="emoji">
              u
            </span>
            <span role="img" aria-label="emoji">
              n
            </span>
            <span role="img" aria-label="emoji">
              i
            </span>
            <span role="img" aria-label="emoji">
              t
            </span>
            <span role="img" aria-label="emoji">
              y
            </span>
          </>
        }
      </h1>
      <div className="mb-4">
        <p>
          {
            <>
              <span role="img" aria-label="emoji">
                Y
              </span>
              <span role="img" aria-label="emoji">
                o
              </span>
              <span role="img" aria-label="emoji">
                u
              </span>
              <span role="img" aria-label="emoji">
                r
              </span>
              ' '
              <span role="img" aria-label="emoji">
                P
              </span>
              <span role="img" aria-label="emoji">
                e
              </span>
              <span role="img" aria-label="emoji">
                t
              </span>
              <span role="img" aria-label="emoji">
                a
              </span>
              <span role="img" aria-label="emoji">
                l
              </span>
              <span role="img" aria-label="emoji">
                s
              </span>
              <span role="img" aria-label="emoji">
                :
              </span>
              ' '''
            </>
          }
          {petals}
        </p>
      </div>
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="rounded-lg border p-4">
            <div className="mb-2 flex items-center">
              <div className="mr-2 h-8 w-8 rounded-full bg-gray-300" />
              <span className="font-semibold">{post.author}</span>
            </div>
            <p className="mb-2">{post.content}</p>
            <div className="flex space-x-4">
              <button
                onClick={() => handleLike(post.id)}
                className="text-gray-600 hover:text-blue-500"
              >
                ️ {post.likes}
              </button>
              <button
                onClick={() => handleComment(post.id)}
                className="text-gray-600 hover:text-blue-500"
              >
                {post.comments}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
