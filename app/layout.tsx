import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import PetalLayer from '@/app/components/PetalLayer';
import TreeAligner from '@/app/components/TreeAligner';

export const metadata = { title: 'Otaku-mori' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="bg-black text-gray-100">
          <TreeAligner />
          <PetalLayer />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
