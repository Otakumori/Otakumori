'use client';
import useSWR from 'swr';

export default function PetalProgress() {
  const { data } = useSWR('/api/profile/me', (u) => fetch(u).then((r) => r.json()));
  const used = data?.daily?.used ?? 0,
    limit = data?.daily?.limit ?? 500;
  const pct = Math.max(0, Math.min(100, Math.round((used / limit) * 100)));
  return (
    <div>
      <div className="mb-1 text-sm opacity-80">{<><span role='img' aria-label='emoji'>D</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>l</span><span role='img' aria-label='emoji'>y</span>' '<span role='img' aria-label='emoji'>P</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>l</span>' '<span role='img' aria-label='emoji'>P</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>g</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>s</span><span role='img' aria-label='emoji'>s</span></>}</div>
      <div className="progress">
        <span style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1 text-xs opacity-70">
        {used} / {limit}{<>''' '<span role='img' aria-label='emoji'>p</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>l</span><span role='img' aria-label='emoji'>s</span>' '<span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>d</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>y</span>
        ''</>}</div>
    </div>
  );
}
