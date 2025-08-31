/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
import StorageManager from '@/components/account/StorageManager';

export const metadata = {
  title: 'Your Storage | Otaku-mori',
  description: 'Upload and manage your files in your personal storage space.',
};

export default function StoragePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold text-pink-200">Your Storage</h1>
      <p className="opacity-80 mt-1 text-pink-200/60">
        Upload and manage your files here. All files are stored securely and can be shared via
        public URLs.
      </p>
      <StorageManager />
    </div>
  );
}
