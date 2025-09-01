 
 
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  // Temporarily disabled during Supabase to Prisma migration
  return { title: 'Post', description: undefined };
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  // Temporarily disabled during Supabase to Prisma migration
  return notFound();
}
