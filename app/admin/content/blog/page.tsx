'use client';

import { useEffect, useMemo, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminNav';

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

function blankPost(): BlogPost {
  const now = new Date().toISOString();
  return {
    id: '',
    slug: '',
    title: '',
    excerpt: '',
    body: '',
    published: false,
    createdAt: now,
    updatedAt: now,
  };
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    void loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/blog');
      const data = await res.json();
      if (data.ok) setPosts(data.data);
      else setError(data.error?.message || 'Failed to load posts');
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
      const res = await fetch('/api/admin/blog', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
      });
      const data = await res.json();
      if (data.ok) {
        setEditing(null);
        setSuccess('Post saved successfully.');
        await loadPosts();
        window.setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error?.message || data.error || 'Failed to save post');
      }
    } catch (err) {
      setError('Failed to save post');
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setError(null);
      const res = await fetch(`/api/admin/blog?id=${deleteTarget.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.ok) {
        setSuccess('Post deleted successfully.');
        setDeleteTarget(null);
        await loadPosts();
        window.setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error?.message || 'Failed to delete post');
      }
    } catch (err) {
      setError('Failed to delete post');
      console.error(err);
    }
  };

  const publishedCount = posts.filter((post) => post.published).length;

  return (
    <AdminLayout>
      <main className="p-5 sm:p-7 lg:p-9">
        <div className="mx-auto max-w-7xl">
          <header className="mb-7 flex flex-col gap-5 border-b border-white/[0.08] pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-display text-3xl font-semibold text-[#f5eee9]">Blog</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#9f9490]">
                Draft, preview, and publish stories without leaving the operations console.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="text-xs text-[#756b67]">
                {publishedCount} published · {Math.max(0, posts.length - publishedCount)} drafts
              </div>
              <button type="button" onClick={() => setEditing(blankPost())} className="mori-button-primary">
                New post
              </button>
            </div>
          </header>

          {error && (
            <div className="mb-5 rounded-xl border border-[#b66b66]/25 bg-[#5e2d2b]/16 px-4 py-3 text-sm text-[#e2aaa5]">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-5 rounded-xl border border-[#819477]/22 bg-[#42513b]/16 px-4 py-3 text-sm text-[#c3d5bf]">
              {success}
            </div>
          )}

          {editing ? (
            <BlogEditor post={editing} onSave={handleSave} onCancel={() => setEditing(null)} />
          ) : loading ? (
            <div className="mori-admin-panel p-8 text-sm text-[#827873]">Loading posts…</div>
          ) : posts.length === 0 ? (
            <div className="mori-admin-panel p-10 text-center">
              <h2 className="font-display text-xl text-[#f5eee9]">The archive is empty.</h2>
              <p className="mt-2 text-sm text-[#827873]">Create the first post when you are ready.</p>
              <button type="button" onClick={() => setEditing(blankPost())} className="mori-button-secondary mt-5">
                Create first post
              </button>
            </div>
          ) : (
            <div className="mori-admin-panel overflow-hidden">
              <div className="hidden grid-cols-[minmax(0,1fr)_9rem_8rem_10rem] gap-4 border-b border-white/[0.07] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#625a57] md:grid">
                <span>Story</span>
                <span>Status</span>
                <span>Updated</span>
                <span className="text-right">Actions</span>
              </div>
              <div className="divide-y divide-white/[0.07]">
                {posts.map((post) => (
                  <article key={post.id} className="grid gap-4 px-5 py-5 md:grid-cols-[minmax(0,1fr)_9rem_8rem_10rem] md:items-center">
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-semibold text-[#f5eee9]">{post.title}</h2>
                      <div className="mt-1 truncate font-mono text-xs text-[#756b67]">/blog/{post.slug}</div>
                      {post.excerpt && <p className="mt-2 line-clamp-1 text-sm text-[#9f9490]">{post.excerpt}</p>}
                    </div>
                    <div>
                      <span className="mori-status" data-tone={post.published ? 'ready' : 'draft'}>
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <div className="text-xs text-[#827873]">{formatDate(post.updatedAt || post.createdAt)}</div>
                    <div className="flex gap-2 md:justify-end">
                      <button type="button" onClick={() => setEditing(post)} className="mori-button-secondary !min-h-9 !px-3 !py-1.5 text-xs">
                        Edit
                      </button>
                      <button type="button" onClick={() => setDeleteTarget(post)} className="mori-button-danger !min-h-9 !px-3 !py-1.5 text-xs">
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="presentation">
          <div className="mori-admin-panel w-full max-w-md p-6" role="dialog" aria-modal="true" aria-labelledby="delete-post-title">
            <h2 id="delete-post-title" className="font-display text-xl font-semibold text-[#f5eee9]">Delete this post?</h2>
            <p className="mt-3 text-sm leading-6 text-[#9f9490]">
              <span className="font-semibold text-[#e8dfda]">{deleteTarget.title}</span> will be permanently removed. This cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setDeleteTarget(null)} className="mori-button-secondary">Cancel</button>
              <button type="button" onClick={handleDelete} className="mori-button-danger">Delete post</button>
            </div>
          </div>
        </div>
      )}
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

  const previewBody = useMemo(() => {
    const body = (formData.body || '').trim();
    return body ? body.split(/\n\s*\n/).slice(0, 3) : [];
  }, [formData.body]);

  const normalizeSlug = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

  const handleTitleChange = (value: string) => {
    const shouldGenerateSlug = !formData.id && (!formData.slug || formData.slug === normalizeSlug(formData.title));
    setFormData({
      ...formData,
      title: value,
      slug: shouldGenerateSlug ? normalizeSlug(value) : formData.slug,
    });
  };

  const handleSlugChange = (value: string) => {
    const slug = normalizeSlug(value);
    setFormData({ ...formData, slug });
    if (slug.length === 0) setSlugError('Slug cannot be empty');
    else if (!/^[a-z0-9-]+$/.test(slug)) setSlugError('Use lowercase letters, numbers, and hyphens only');
    else setSlugError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (slugError || !formData.slug) {
      if (!formData.slug) setSlugError('Slug cannot be empty');
      return;
    }
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(24rem,0.95fr)]">
      <section className="mori-admin-panel p-5 sm:p-6">
        <div className="mb-6 flex items-start justify-between gap-4 border-b border-white/[0.07] pb-5">
          <div>
            <h2 className="font-display text-xl font-semibold text-[#f5eee9]">{formData.id ? 'Edit post' : 'New post'}</h2>
            <p className="mt-1 text-xs text-[#756b67]">Markdown body · public preview at right</p>
          </div>
          <span className="mori-status" data-tone={formData.published ? 'ready' : 'draft'}>
            {formData.published ? 'Published' : 'Draft'}
          </span>
        </div>

        <div className="space-y-5">
          <div>
            <label htmlFor="blog-title" className="mb-2 block text-sm font-medium text-[#ddd4cf]">Title</label>
            <input
              id="blog-title"
              type="text"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="mori-field w-full px-4 py-3"
              required
              placeholder="Post title"
            />
          </div>

          <div>
            <label htmlFor="blog-slug" className="mb-2 block text-sm font-medium text-[#ddd4cf]">URL slug</label>
            <div className="flex items-center rounded-xl border border-white/[0.09] bg-[#060506] pl-3 focus-within:border-[#c7a97f]/30">
              <span className="text-xs text-[#625a57]">/blog/</span>
              <input
                id="blog-slug"
                type="text"
                value={formData.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                className="min-w-0 flex-1 bg-transparent px-1 py-3 font-mono text-sm text-[#eee6e1] outline-none"
                required
                placeholder="url-friendly-slug"
              />
            </div>
            {slugError && <p className="mt-2 text-xs text-[#e2aaa5]">{slugError}</p>}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label htmlFor="blog-excerpt" className="text-sm font-medium text-[#ddd4cf]">Excerpt</label>
              <span className="text-[11px] text-[#625a57]">{(formData.excerpt || '').length}/500</span>
            </div>
            <textarea
              id="blog-excerpt"
              value={formData.excerpt || ''}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              className="mori-field w-full resize-y px-4 py-3"
              rows={3}
              maxLength={500}
              placeholder="Short summary used in blog previews"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label htmlFor="blog-content" className="text-sm font-medium text-[#ddd4cf]">Content</label>
              <span className="text-[11px] text-[#625a57]">Markdown</span>
            </div>
            <textarea
              id="blog-content"
              value={formData.body || ''}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              className="mori-field min-h-[30rem] w-full resize-y px-4 py-3 font-mono text-sm leading-6"
              required
              placeholder="Write your post in Markdown…"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3">
            <input
              type="checkbox"
              checked={formData.published}
              onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
              className="h-4 w-4 rounded border-white/20 bg-black/40 text-[#a9855f] focus:ring-[#c7a97f]/40"
            />
            <span>
              <span className="block text-sm font-medium text-[#ddd4cf]">Visible to the public</span>
              <span className="mt-0.5 block text-xs text-[#756b67]">Leave off to save as a draft.</span>
            </span>
          </label>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 border-t border-white/[0.07] pt-5">
          <button type="submit" className="mori-button-primary">{formData.id ? 'Save changes' : 'Create post'}</button>
          <button type="button" onClick={onCancel} className="mori-button-secondary">Cancel</button>
        </div>
      </section>

      <aside className="mori-admin-panel self-start overflow-hidden xl:sticky xl:top-6" aria-label="Post preview">
        <div className="border-b border-white/[0.07] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#625a57]">Public preview</div>
        <div className="min-h-[36rem] bg-[radial-gradient(circle_at_20%_0%,rgba(100,61,73,0.12),transparent_19rem),linear-gradient(180deg,#0b080d,#070608)] p-6 sm:p-8">
          {formData.published ? <span className="mori-status" data-tone="ready">Published</span> : <span className="mori-status" data-tone="draft">Draft</span>}
          <h2 className="font-display mt-6 text-3xl font-semibold leading-tight text-[#fff1e4]">
            {formData.title || 'Untitled story'}
          </h2>
          {formData.excerpt ? (
            <p className="mt-4 text-base leading-7 text-[#cdbbb7]">{formData.excerpt}</p>
          ) : (
            <p className="mt-4 text-sm italic text-[#756b67]">Your excerpt will appear here.</p>
          )}
          <div className="my-7 border-t border-white/[0.08]" />
          <div className="space-y-4 text-sm leading-7 text-[#b9aeaa]">
            {previewBody.length ? previewBody.map((paragraph, index) => <p key={`${paragraph.slice(0, 24)}-${index}`}>{paragraph}</p>) : <p className="italic text-[#756b67]">The opening paragraphs of your post will preview here as you write.</p>}
          </div>
          <div className="mt-8 font-mono text-xs text-[#625a57]">/blog/{formData.slug || 'your-slug'}</div>
        </div>
      </aside>
    </form>
  );
}
