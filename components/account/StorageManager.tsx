'use client';
import { useEffect, useState } from 'react';

type UserFile = {
  key: string;
  url: string;
  size: number;
  mimeType: string;
  createdAt: string;
};

export default function StorageManager() {
  const [files, setFiles] = useState<UserFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function fetchFiles() {
    setLoading(true);
    try {
      const res = await fetch('/api/user/files');
      const json = await res.json();
      if (json.ok) setFiles(json.files);
    } catch (error) {
      console.error('Failed to fetch files:', error);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchFiles();
  }, []);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files.item(0);
    if (!file) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/storage/upload-url', {
        method: 'POST',
        body: formData,
      });

      const { file: meta } = await res.json();
      if (!meta) throw new Error('Upload failed');

      setFiles((prev) => [...prev, meta]);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  async function onDelete(key: string) {
    try {
      const res = await fetch('/api/storage/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });

      if (res.ok) {
        setFiles((prev) => prev.filter((f) => f.key !== key));
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Delete failed. Please try again.');
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-4">
        <input
          type="file"
          onChange={onUpload}
          disabled={uploading}
          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-500/20 file:text-pink-200 hover:file:bg-pink-500/30 transition-colors"
        />
        {uploading && <span className="text-sm text-pink-200">Uploading...</span>}
      </div>

      {loading && <div className="text-center py-4 text-pink-200">Loading files…</div>}

      {files.length === 0 && !loading && (
        <div className="text-center py-8 text-pink-200/60">
          No files uploaded yet. Start by uploading your first file above.
        </div>
      )}

      <ul className="space-y-2">
        {files.map((f) => (
          <li key={f.key} className="glass neon-edge p-3 rounded flex justify-between items-center">
            <div className="flex-1 min-w-0">
              <a
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-sm underline text-pink-200 hover:text-pink-100 transition-colors block"
              >
                {f.key.split('/').pop()}
              </a>
              <div className="text-xs text-pink-200/60 mt-1">
                {formatFileSize(f.size)} • {f.mimeType}
              </div>
            </div>
            <div className="flex gap-3 items-center ml-4">
              <button
                onClick={() => onDelete(f.key)}
                className="text-xs px-3 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-200 hover:text-red-100 transition-colors"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
