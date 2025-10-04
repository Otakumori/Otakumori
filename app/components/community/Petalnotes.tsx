'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  BookOpen,
  Edit,
  Heart,
  Share2,
  User,
  Plus,
  Search,
  Tag,
  Users as UsersIcon,
} from 'lucide-react';

interface Petalnote {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  collaborators: Array<{
    id: string;
    username: string;
    role: string;
  }>;
  likes: number;
  shares: number;
  views: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  category: string;
  isPublic: boolean;
  isLiked: boolean;
}

interface PetalnotesProps {
  className?: string;
}

export default function Petalnotes({ className }: PetalnotesProps) {
  const [petalnotes, setPetalnotes] = useState<Petalnote[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock data
  useEffect(() => {
    const mockPetalnotes: Petalnote[] = [
      {
        id: '1',
        title: 'Complete Guide to Studio Ghibli Films',
        content:
          'A comprehensive guide covering all Studio Ghibli films, their themes, and cultural significance...',
        excerpt:
          'Explore the magical world of Studio Ghibli through this detailed analysis of their most beloved films.',
        author: {
          id: 'user1',
          username: 'GhibliScholar',
          avatarUrl: '/assets/avatars/ghibli.jpg',
        },
        collaborators: [
          { id: 'user2', username: 'AnimeHistorian', role: 'Contributor' },
          { id: 'user3', username: 'FilmCritic', role: 'Editor' },
        ],
        likes: 156,
        shares: 23,
        views: 1247,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-20T14:30:00Z',
        tags: ['studio-ghibli', 'anime', 'guide', 'films'],
        category: 'guides',
        isPublic: true,
        isLiked: false,
      },
      {
        id: '2',
        title: 'Cosplay Photography Tips & Tricks',
        content: 'Master the art of cosplay photography with these professional tips...',
        excerpt:
          'Learn how to capture stunning cosplay photos with proper lighting, angles, and composition.',
        author: {
          id: 'user4',
          username: 'CosplayPhotographer',
          avatarUrl: '/assets/avatars/photographer.jpg',
        },
        collaborators: [],
        likes: 89,
        shares: 15,
        views: 567,
        createdAt: '2024-01-18T16:45:00Z',
        updatedAt: '2024-01-19T09:15:00Z',
        tags: ['cosplay', 'photography', 'tips', 'tutorial'],
        category: 'tutorials',
        isPublic: true,
        isLiked: true,
      },
      {
        id: '3',
        title: 'Anime Soundtrack Analysis: Attack on Titan',
        content: 'Deep dive into the musical genius of Hiroyuki Sawano...',
        excerpt:
          'Analyzing the powerful soundtrack of Attack on Titan and its impact on storytelling.',
        author: {
          id: 'user5',
          username: 'MusicOtaku',
          avatarUrl: '/assets/avatars/music.jpg',
        },
        collaborators: [{ id: 'user6', username: 'SoundDesigner', role: 'Technical Advisor' }],
        likes: 234,
        shares: 45,
        views: 1890,
        createdAt: '2024-01-10T12:00:00Z',
        updatedAt: '2024-01-16T11:20:00Z',
        tags: ['attack-on-titan', 'soundtrack', 'music', 'analysis'],
        category: 'analysis',
        isPublic: true,
        isLiked: false,
      },
    ];

    setPetalnotes(mockPetalnotes);
    setLoading(false);
  }, []);

  const handleLike = (noteId: string) => {
    setPetalnotes((prev) =>
      prev.map((note) => {
        if (note.id === noteId) {
          return {
            ...note,
            likes: note.isLiked ? note.likes - 1 : note.likes + 1,
            isLiked: !note.isLiked,
          };
        }
        return note;
      }),
    );
  };

  const handleShare = (noteId: string) => {
    setPetalnotes((prev) =>
      prev.map((note) => {
        if (note.id === noteId) {
          return { ...note, shares: note.shares + 1 };
        }
        return note;
      }),
    );
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const filteredPetalnotes = petalnotes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.author.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || note.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', name: 'All Notes', icon: BookOpen },
    { id: 'guides', name: 'Guides', icon: BookOpen },
    { id: 'tutorials', name: 'Tutorials', icon: Edit },
    { id: 'analysis', name: 'Analysis', icon: Search },
    { id: 'reviews', name: 'Reviews', icon: Heart },
  ];

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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Petalnotes</h2>
          <p className="text-gray-600 dark:text-gray-400">Collaborative knowledge sharing</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Note
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <Input
            placeholder="Search petalnotes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-md border px-3 py-2"
          aria-label="Select"
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              {category.name}
            </button>
          );
        })}
      </div>

      {/* Petalnotes Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPetalnotes.map((note) => (
          <Card key={note.id} className="cursor-pointer transition-shadow hover:shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-900">
                    <User className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {note.author.username}
                    </p>
                    <p className="text-xs text-gray-500">{formatTimeAgo(note.updatedAt)}</p>
                  </div>
                </div>
                <Badge variant={note.isPublic ? 'default' : 'secondary'}>
                  {note.isPublic ? 'Public' : 'Private'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-gray-900 dark:text-white">
                {note.title}
              </h3>
              <p className="mb-3 line-clamp-3 text-sm text-gray-600 dark:text-gray-400">
                {note.excerpt}
              </p>

              {/* Tags */}
              <div className="mb-3 flex flex-wrap gap-1">
                {note.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    <Tag className="mr-1 h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
                {note.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{note.tags.length - 3}
                  </Badge>
                )}
              </div>

              {/* Collaborators */}
              {note.collaborators.length > 0 && (
                <div className="mb-3 flex items-center gap-1">
                  <UsersIcon className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    {note.collaborators.length} collaborator
                    {note.collaborators.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(note.id);
                    }}
                    className={`flex items-center gap-1 transition-colors ${
                      note.isLiked ? 'text-pink-500' : 'hover:text-pink-500'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${note.isLiked ? 'fill-current' : ''}`} />
                    {note.likes}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare(note.id);
                    }}
                    className="flex items-center gap-1 transition-colors hover:text-blue-500"
                  >
                    <Share2 className="h-4 w-4" />
                    {note.shares}
                  </button>
                </div>
                <span>{note.views} views</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPetalnotes.length === 0 && (
        <div className="py-12 text-center">
          <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <p className="text-gray-500">No petalnotes found. Create the first one!</p>
        </div>
      )}

      {/* Create Modal (simplified) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <Card className="mx-4 w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Create New Petalnote</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Note title..." />
              <textarea
                placeholder="Write your note content..."
                className="w-full resize-none rounded-lg border p-3"
                rows={6}
              />
              <div className="flex gap-2">
                <Button onClick={() => setShowCreateModal(false)} variant="outline">
                  Cancel
                </Button>
                <Button>Create Note</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
