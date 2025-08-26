/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";
import useSWR from "swr";

export default function PostsList(){
  const { data } = useSWR("/api/profile/me", (u)=>fetch(u).then(r=>r.json()));
  const list = data?.posts ?? [];
  return (
    <div className="list">
      {list.map((p:any)=>(
        <article key={p.id} className="post">
          <div className="mb-1 flex items-center justify-between text-xs opacity-70">
            <span>{new Date(p.createdAt).toLocaleString()}</span>
            <span>▲ {p.upvotes}</span>
          </div>
          <div className="whitespace-pre-wrap">{p.content}</div>
          {!!p.isHidden && <div className="mt-2 text-xs text-red-300/80">Hidden by moderation</div>}
          {!!p.isFlagged && <div className="mt-1 text-xs text-yellow-300/80">Flagged</div>}
        </article>
      ))}
      {!list.length && <div className="text-sm opacity-60">You haven't posted any soapstones yet.</div>}
    </div>
  );
}
