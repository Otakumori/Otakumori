'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type BlobItem = {
  url: string;
  pathname: string;
  size?: number;
  contentType?: string;
  uploadedAt?: number;
};

interface MediaResponse {
  ok: boolean;
  error?: string;
  blobs?: BlobItem[];
}

export default function AdminMediaPage() {
  const [blobs, setBlobs] = useState<BlobItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/media/list', { cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to fetch media list');

      const payload = (await response.json()) as MediaResponse;
      if (!payload.ok || !Array.isArray(payload.blobs)) {
        throw new Error(payload.error ?? 'Invalid media response');
      }

      setBlobs(payload.blobs);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unexpected error';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  const handleUpload = useCallback(
    async (file: File) => {
      setUploading(true);
      setError(null);
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/admin/media/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Upload failed');
        const payload = (await response.json()) as MediaResponse;
        if (!payload.ok) throw new Error(payload.error ?? 'Upload failed');

        await fetchList();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unexpected error';
        setError(message);
      } finally {
        setUploading(false);
        if (inputRef.current) {
          inputRef.current.value = '';
        }
      }
    },
    [fetchList],
  );

  const handleDelete = useCallback(async (url: string) => {
    if (!window.confirm('Delete this asset? This cannot be undone.')) {
      return;
    }

    setError(null);
    try {
      const response = await fetch('/api/admin/media/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) throw new Error('Delete failed');
      const payload = (await response.json()) as MediaResponse;
      if (!payload.ok) throw new Error(payload.error ?? 'Delete failed');

      setBlobs((current) => current.filter((item) => item.url !== url));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unexpected error';
      setError(message);
    }
  }, []);

  const totalSize = useMemo(() => {
    const bytes = blobs.reduce((sum, blob) => sum + (blob.size ?? 0), 0);
    return (bytes / (1024 * 1024)).toFixed(2);
  }, [blobs]);

  return (
    <main className="mx-auto max-w-5xl p-6 text-neutral-900 dark:text-neutral-100">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Media Manager</h1>
        <button
          type="button"
          onClick={() => fetchList()}
          className="rounded-xl border px-4 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </header>

      <section className="mb-8 rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800">
        <h2 className="mb-2 text-lg font-semibold">Upload</h2>
        <p className="mb-4 text-sm text-neutral-500 dark:text-neutral-400">
          Use for blog headers, hero art, and site images. Public CDN URLs are returned.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="media-upload-input" className="sr-only">
            Upload media file
          </label>
          <input
            id="media-upload-input"
            ref={inputRef}
            type="file"
            accept="image/*,video/*"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void handleUpload(file);
              }
            }}
            className="block w-full cursor-pointer rounded-lg border border-neutral-200 p-2 text-sm dark:border-neutral-700"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-xl bg-neutral-900 px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50 dark:bg-white dark:text-neutral-900"
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Select File'}
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
      </section>

      <section className="rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Library</h2>
          <div className="text-sm text-neutral-500 dark:text-neutral-400">
            {blobs.length} item{blobs.length === 1 ? '' : 's'} • {totalSize} MB total
          </div>
        </div>

        {blobs.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No media yet. Upload your first file above.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {blobs.map((blob) => {
              const isImage = (blob.contentType ?? '').startsWith('image/');
              const fileName = blob.pathname.split('/').pop() ?? blob.pathname;
              const uploadedAt = blob.uploadedAt ? new Date(blob.uploadedAt).toLocaleString() : '';

              return (
                <li
                  key={blob.url}
                  className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-800"
                >
                  <div className="mb-2 aspect-video overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-900">
                    {isImage ? (
                      <img src={blob.url} alt={fileName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-neutral-500 dark:text-neutral-400">
                        {blob.contentType ?? 'binary'}
                      </div>
                    )}
                  </div>
                  <div className="mb-1 truncate text-sm font-medium">{fileName}</div>
                  <div className="mb-3 truncate text-xs text-neutral-500 dark:text-neutral-400">
                    {blob.url}
                  </div>
                  <div className="mb-3 text-xs text-neutral-500 dark:text-neutral-400">
                    {uploadedAt}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => navigator.clipboard?.writeText(blob.url)}
                      className="rounded-lg border border-neutral-200 px-3 py-1 text-sm hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                    >
                      Copy URL
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(blob.url)}
                      className="rounded-lg border border-red-200 px-3 py-1 text-sm text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
