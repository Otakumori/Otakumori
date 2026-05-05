'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminNav';
// Date formatting helper
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  body?: string | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/blog');
      const data = await res.json();
      if (data.ok) {
        setPosts(data.data);
      } else {
        setError(data.error?.message || 'Failed to load posts');
      }
    } catch (err) {
      setError('Failed to load blog posts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (post: Partial<BlogPost> & { id?: string }) => {
    try {
      setError(null);
      setSuccess(null);
      
      const method = post.id ? 'PUT' : 'POST';
      const url = '/api/admin/blog';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
      });
      
      const data = await res.json();
      if (data.ok) {
        setEditing(null);
        setSuccess('Post saved successfully!');
        loadPosts();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error?.message || data.error || 'Failed to save post');
      }
    } catch (err) {
      setError('Failed to save post');
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post? This cannot be undone.')) return;
    
    try {
      setError(null);
      const res = await fetch(`/api/admin/blog?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.ok) {
        setSuccess('Post deleted successfully');
        loadPosts();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error?.message || 'Failed to delete post');
      }
    } catch (err) {
      setError('Failed to delete post');
      console.error(err);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Blog Posts</h1>
            <p className="text-neutral-300">Create and manage blog posts and content pages</p>
          </div>
          <button
            onClick={() => setEditing({
              id: '',
              slug: '',
              title: '',
              excerpt: '',
              body: '',
              published: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            })}
            className="rounded-lg bg-pink-600 px-6 py-3 text-white font-semibold hover:bg-pink-700 transition-colors"
          >
            New Post
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/20 border border-red-500/50 px-4 py-3 text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg bg-green-500/20 border border-green-500/50 px-4 py-3 text-green-300">
            {success}
          </div>
        )}

        {editing ? (
          <BlogEditor
            post={editing}
            onSave={handleSave}
            onCancel={() => setEditing(null)}
          />
        ) : loading ? (
          <div className="text-neutral-400">Loading posts...</div>
        ) : (
          <div className="grid gap-4">
            {posts.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-black/50 p-8 text-center">
                <p className="text-neutral-400 mb-4">No blog posts yet</p>
                <button
                  onClick={() => setEditing({
                    id: '',
                    slug: '',
                    title: '',
                    excerpt: '',
                    body: '',
                    published: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  })}
                  className="rounded-lg bg-pink-600 px-6 py-2 text-white hover:bg-pink-700"
                >
                  Create Your First Post
                </button>
              </div>
            ) : (
              posts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-xl border border-white/10 bg-black/50 p-6 hover:border-white/20 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">{post.title}</h3>
                        {post.published ? (
                          <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded border border-green-500/30">
                            Published
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-500/20 text-gray-300 text-xs rounded border border-gray-500/30">
                            Draft
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mb-2">
                        <span className="font-mono">/{post.slug}</span>
                        {' • '}
                        {formatDate(post.createdAt)}
                      </p>
                      {post.excerpt && (
                        <p className="text-gray-300 text-sm line-clamp-2">{post.excerpt}</p>
                      )}
                      {post.body && (
                        <p className="text-gray-400 text-xs mt-2 line-clamp-1">
                          {post.body.substring(0, 100)}...
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => setEditing(post)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function BlogEditor({
  post,
  onSave,
  onCancel,
}: {
  post: Partial<BlogPost>;
  onSave: (post: Partial<BlogPost>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    id: post.id || '',
    slug: post.slug || '',
    title: post.title || '',
    excerpt: post.excerpt || '',
    body: post.body || '',
    published: post.published ?? false,
  });

  const [slugError, setSlugError] = useState<string | null>(null);

  const handleSlugChange = (value: string) => {
    const slug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    setFormData({ ...formData, slug });
    
    if (slug.length === 0) {
      setSlugError('Slug cannot be empty');
    } else if (!/^[a-z0-9-]+$/.test(slug)) {
      setSlugError('Slug can only contain lowercase letters, numbers, and hyphens');
    } else {
      setSlugError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (slugError) return;
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-white/10 bg-black/50 p-6 space-y-6">
      <div>
        <label htmlFor="blog-title" className="block text-white text-sm font-medium mb-2">
          Title *
        </label>
        <input
          id="blog-title"
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 bg-black/40 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          required
          placeholder="Enter post title"
        />
      </div>

      <div>
        <label htmlFor="blog-slug" className="block text-white text-sm font-medium mb-2">
          Slug * (URL: /blog/[slug])
        </label>
        <input
          id="blog-slug"
          type="text"
          value={formData.slug}
          onChange={(e) => handleSlugChange(e.target.value)}
          className={`w-full px-4 py-2 bg-black/40 border rounded-lg text-white font-mono focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
            slugError ? 'border-red-500' : 'border-white/20'
          }`}
          required
          placeholder="url-friendly-slug"
        />
        {slugError && (
          <p className="mt-1 text-sm text-red-400">{slugError}</p>
        )}
        <p className="mt-1 text-xs text-gray-400">
          Only lowercase letters, numbers, and hyphens. Auto-generated from title if left empty.
        </p>
      </div>

      <div>
        <label htmlFor="blog-excerpt" className="block text-white text-sm font-medium mb-2">
          Excerpt (optional, max 500 characters)
        </label>
        <textarea
          id="blog-excerpt"
          value={formData.excerpt || ''}
          onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
          className="w-full px-4 py-2 bg-black/40 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          rows={3}
          maxLength={500}
          placeholder="Brief summary of the post (shown in previews)"
        />
        <p className="mt-1 text-xs text-gray-400">
          {(formData.excerpt || '').length}/500 characters
        </p>
      </div>

      <div>
        <label htmlFor="blog-content" className="block text-white text-sm font-medium mb-2">
          Content (Markdown) *
        </label>
        <textarea
          id="blog-content"
          value={formData.body || ''}
          onChange={(e) => setFormData({ ...formData, body: e.target.value })}
          className="w-full px-4 py-2 bg-black/40 border border-white/20 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          rows={25}
          required
          placeholder="Write your post content here using Markdown..."
        />
        <p className="mt-1 text-xs text-gray-400">
          Supports Markdown formatting (headers, lists, links, images, etc.)
        </p>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="published"
          checked={formData.published}
          onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
          className="w-4 h-4 rounded border-white/20 bg-black/40 text-pink-600 focus:ring-pink-500"
        />
        <label htmlFor="published" className="text-white text-sm cursor-pointer">
          Published (visible to public)
        </label>
      </div>

      <div className="flex gap-4 pt-4 border-t border-white/10">
        <button
          type="submit"
          className="px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-semibold transition-colors"
        >
          {formData.id ? 'Update Post' : 'Create Post'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

