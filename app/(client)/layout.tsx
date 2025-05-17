import ClientLayout from '@/app/_clientLayout';

export default function ClientPagesLayout({ children }: { children: React.ReactNode }) {
  return <ClientLayout>{children}</ClientLayout>;
}
