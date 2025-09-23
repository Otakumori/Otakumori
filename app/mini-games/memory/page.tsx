import MemoryWrapper from './memory-wrapper';

export const metadata = { title: 'Memory | Otakumori' };

export default function Page() {
  return (
    <main className="mx-auto max-w-5xl p-4">
      <MemoryWrapper />
    </main>
  );
}
