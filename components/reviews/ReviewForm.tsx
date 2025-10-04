'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

type Props = { productId: string };

export default function ReviewForm({ productId }: Props) {
  const [rating, setRating] = useState<number>(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const maxImages = 3;

  async function handlePickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    setError(null);

    const toUpload = Array.from(files).slice(0, maxImages - imageUrls.length);
    if (toUpload.length === 0) return;

    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const f of toUpload) {
        const fd = new FormData();
        fd.append('file', f);
        const res = await fetch('/api/reviews/upload', { method: 'POST', body: fd });
        const json = await res.json();
        if (!json.ok) throw new Error(json.error || 'Upload failed');
        uploaded.push(json.url as string);
      }
      setImageUrls((prev) => [...prev, ...uploaded]);
    } catch (err: any) {
      setError(err?.message ?? 'Upload error');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function removeImage(url: string) {
    setImageUrls((prev) => prev.filter((u) => u !== url));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, rating, title, body, imageUrls }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Failed to submit review');

      // Reset UI and optionally refresh page or a list
      setTitle('');
      setBody('');
      setImageUrls([]);
      setRating(5);
      // You can trigger a router.refresh() here if you render reviews on the same page
      // or emit an event to update list.
      alert('Review submitted. Thank you!');
    } catch (err: any) {
      setError(err?.message ?? 'Submit error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-zinc-800/60 p-4">
      <h3 className="text-lg font-semibold">Write a Review</h3>

      <div className="grid gap-2">
        <label htmlFor="rating" className="text-sm text-zinc-400">
          Rating
        </label>
        <select
          id="rating"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="rounded-md border border-zinc-700 bg-black p-2"
        >
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>
              {r} 
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <label htmlFor="title" className="text-sm text-zinc-400">
          Title (optional)
        </label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-md border border-zinc-700 bg-black p-2"
          placeholder="Summarize your experience"
        />
      </div>

      <div className="grid gap-2">
        <label htmlFor="review" className="text-sm text-zinc-400">
          Review
        </label>
        <textarea
          id="review"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="min-h-[120px] rounded-md border border-zinc-700 bg-black p-2"
          placeholder="What did you like or dislike?"
        />
      </div>

      <div className="grid gap-2">
        <label htmlFor="photos" className="text-sm text-zinc-400">
          Photos (up to {maxImages}) — JPG/PNG/WebP, &lt; 3MB each
        </label>
        <input
          id="photos"
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handlePickFiles}
          disabled={uploading || imageUrls.length >= maxImages}
          className="block"
        />

        {imageUrls.length > 0 && (
          <div className="mt-2 flex gap-3">
            {imageUrls.map((url) => (
              <div
                key={url}
                className="relative h-20 w-20 overflow-hidden rounded-lg border border-zinc-700"
              >
                <Image src={url} alt="upload preview" fill sizes="80px" className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute right-1 top-1 rounded bg-black/70 px-1 text-xs"
                  aria-label="Remove image"
                >
                  <span role="img" aria-label="Close">
                    
                  </span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={submitting || uploading || !body.trim()}
        className="rounded-md bg-pink-600 px-4 py-2 font-medium hover:bg-pink-500 disabled:opacity-50"
      >
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}
