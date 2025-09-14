'use client';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function SoapstoneList({ postId }: { postId?: string }) {
  const { data } = useSWR(`/api/soapstone${postId ? `?postId=${postId}` : ''}`, fetcher, { revalidateOnFocus: true });
  const items = data?.messages ?? [];
  
  return (
    <ul className="space-y-3">
      {items.map((m: any) => (
        <li key={m.id} className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur">
          <p className="whitespace-pre-wrap text-sm leading-6">{m.text}</p>
          <div className="mt-2 text-xs text-white/50 flex items-center gap-3">
            <span>▲ {m.appraises}</span>
            <span>report · {m.reports}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
