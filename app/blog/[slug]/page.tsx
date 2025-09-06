// DEPRECATED: This component is a duplicate. Use app\sign-in\[[...sign-in]]\page.tsx instead.
import { notFound } from 'next/navigation';
// import ReactMarkdown from 'react-markdown';
// import remarkGfm from 'remark-gfm';

export async function generateMetadata({ params: _params }: { params: { slug: string } }) {
  // Temporarily disabled during Supabase to Prisma migration
  return { title: 'Post', description: undefined };
}

export default async function BlogPost({ params: _params }: { params: { slug: string } }) {
  // Temporarily disabled during Supabase to Prisma migration
  return notFound();
}
