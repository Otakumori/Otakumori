/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState } from "react";

type UserTitle = {
  id: string;
  title: string;
  awardedAt: string;
};

export default function ProfileTitles() {
  const [titles, setTitles] = useState<UserTitle[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchTitles() {
    setLoading(true);
    try {
      const res = await fetch("/api/user/titles");
      const json = await res.json();
      if (json.ok) setTitles(json.titles);
    } catch (error) {
      console.error("Failed to fetch titles:", error);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchTitles();
  }, []);

  if (loading) {
    return <div className="text-center py-4 text-pink-200">Loading titles…</div>;
  }

  if (titles.length === 0) {
    return (
      <div className="text-center py-8 text-pink-200/60">
        No titles earned yet. Participate in contests and events to earn special titles!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-pink-200">Earned Titles</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {titles.map((title) => (
          <div 
            key={title.id} 
            className="glass neon-edge p-3 rounded border border-pink-400/20"
          >
            <div className="text-pink-200 font-medium">{title.title}</div>
            <div className="text-xs text-pink-200/60 mt-1">
              Awarded {new Date(title.awardedAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
