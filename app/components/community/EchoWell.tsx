'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  MessageCircle,
  Heart,
  Share2,
  Flag,
  User,
  Clock,
  Send,
  Filter,
  Search,
} from 'lucide-react';

interface Echo {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  likes: number;
  shares: number;
  replies: number;
  createdAt: string;
  tags: string[];
  isLiked: boolean;
  isFlagged: boolean;
}

interface EchoWellProps {
  className?: string;
}

export default function EchoWell({ className }: EchoWellProps) {
  const [echoes, setEchoes] = useState<Echo[]>([]);
  const [newEcho, setNewEcho] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Mock data
  useEffect(() => {
    const mockEchoes: Echo[] = [
      {
        id: '1',
        content:
          'Just finished watching the latest episode of Demon Slayer! The animation quality is absolutely stunning. What did everyone think? 🌸',
        author: {
          id: 'user1',
          username: 'SakuraFan',
          avatarUrl: '/assets/avatars/sakura.jpg',
        },
        likes: 24,
        shares: 5,
        replies: 8,
        createdAt: '2024-01-21T14:30:00Z',
        tags: ['anime', 'demon-slayer', 'discussion'],
        isLiked: false,
        isFlagged: false,
      },
      {
        id: '2',
        content:
          'Found this amazing cosplay at the convention today! The attention to detail is incredible. Anyone else going to AnimeCon next month? 🎭',
        author: {
          id: 'user2',
          username: 'CosplayQueen',
          avatarUrl: '/assets/avatars/cosplay.jpg',
        },
        likes: 67,
        shares: 12,
        replies: 15,
        createdAt: '2024-01-21T12:15:00Z',
        tags: ['cosplay', 'convention', 'animecon'],
        isLiked: true,
        isFlagged: false,
      },
      {
        id: '3',
        content:
          'Working on a new fan art piece inspired by Studio Ghibli. The process is so therapeutic! Anyone else love drawing anime characters? ✏️',
        author: {
          id: 'user3',
          username: 'ArtOtaku',
          avatarUrl: '/assets/avatars/artist.jpg',
        },
        likes: 89,
        shares: 23,
        replies: 31,
        createdAt: '2024-01-21T10:45:00Z',
        tags: ['fanart', 'studio-ghibli', 'drawing'],
        isLiked: false,
        isFlagged: false,
      },
    ];

    setEchoes(mockEchoes);
    setLoading(false);
  }, []);

  const handleLike = (echoId: string) => {
    setEchoes((prev) =>
      prev.map((echo) => {
        if (echo.id === echoId) {
          return {
            ...echo,
            likes: echo.isLiked ? echo.likes - 1 : echo.likes + 1,
            isLiked: !echo.isLiked,
          };
        }
        return echo;
      }),
    );
  };

  const handleShare = (echoId: string) => {
    setEchoes((prev) =>
      prev.map((echo) => {
        if (echo.id === echoId) {
          return { ...echo, shares: echo.shares + 1 };
        }
        return echo;
      }),
    );
  };

  const handleFlag = (echoId: string) => {
    setEchoes((prev) =>
      prev.map((echo) => {
        if (echo.id === echoId) {
          return { ...echo, isFlagged: !echo.isFlagged };
        }
        return echo;
      }),
    );
  };

  const handleSubmitEcho = () => {
    if (!newEcho.trim()) return;

    const echo: Echo = {
      id: Date.now().toString(),
      content: newEcho,
      author: {
        id: 'currentUser',
        username: 'CurrentUser',
        avatarUrl: '/assets/avatars/default.jpg',
      },
      likes: 0,
      shares: 0,
      replies: 0,
      createdAt: new Date().toISOString(),
      tags: selectedTags,
      isLiked: false,
      isFlagged: false,
    };

    setEchoes((prev) => [echo, ...prev]);
    setNewEcho('');
    setSelectedTags([]);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const filteredEchoes = echoes.filter((echo) => {
    const matchesSearch =
      echo.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      echo.author.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || echo.tags.includes(filter);
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Echo Well</h2>
          <p className="text-gray-600 dark:text-gray-400">Share your thoughts with the community</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* Create New Echo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Share Your Echo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-900">
              <User className="h-5 w-5 text-pink-600 dark:text-pink-400" />
            </div>
            <div className="flex-1">
              <textarea
                value={newEcho}
                onChange={(e) => setNewEcho(e.target.value)}
                placeholder="What's on your mind, otaku?"
                className="w-full resize-none rounded-lg border p-3 focus:border-transparent focus:ring-2 focus:ring-pink-500"
                rows={3}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {['anime', 'manga', 'cosplay', 'gaming', 'fanart', 'discussion'].map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  if (selectedTags.includes(tag)) {
                    setSelectedTags(selectedTags.filter((t) => t !== tag));
                  } else {
                    setSelectedTags([...selectedTags, tag]);
                  }
                }}
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">{newEcho.length}/500 characters</div>
            <Button onClick={handleSubmitEcho} disabled={!newEcho.trim()}>
              <Send className="mr-2 h-4 w-4" />
              Echo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <Input
            placeholder="Search echoes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-md border px-3 py-2"
          aria-label="Select"
        >
          <option value="all">All Echoes</option>
          <option value="anime">Anime</option>
          <option value="manga">Manga</option>
          <option value="cosplay">Cosplay</option>
          <option value="gaming">Gaming</option>
          <option value="fanart">Fan Art</option>
          <option value="discussion">Discussion</option>
        </select>
      </div>

      {/* Echoes Feed */}
      <div className="space-y-4">
        {filteredEchoes.map((echo) => (
          <Card key={echo.id} className="transition-shadow hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-900">
                  <User className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {echo.author.username}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="h-3 w-3" />
                      {formatTimeAgo(echo.createdAt)}
                    </span>
                  </div>

                  <p className="mb-3 leading-relaxed text-gray-800 dark:text-gray-200">
                    {echo.content}
                  </p>

                  {/* Tags */}
                  <div className="mb-4 flex flex-wrap gap-1">
                    {echo.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => handleLike(echo.id)}
                      className={`flex items-center gap-2 text-sm transition-colors ${
                        echo.isLiked ? 'text-pink-500' : 'text-gray-500 hover:text-pink-500'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${echo.isLiked ? 'fill-current' : ''}`} />
                      {echo.likes}
                    </button>

                    <button className="flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-blue-500">
                      <MessageCircle className="h-4 w-4" />
                      {echo.replies}
                    </button>

                    <button
                      onClick={() => handleShare(echo.id)}
                      className="flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-green-500"
                    >
                      <Share2 className="h-4 w-4" />
                      {echo.shares}
                    </button>

                    <button
                      onClick={() => handleFlag(echo.id)}
                      className={`flex items-center gap-2 text-sm transition-colors ${
                        echo.isFlagged ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                      }`}
                    >
                      <Flag className="h-4 w-4" />
                      Report
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEchoes.length === 0 && (
        <div className="py-12 text-center">
          <MessageCircle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <p className="text-gray-500">No echoes found. Be the first to share something!</p>
        </div>
      )}
    </div>
  );
}
