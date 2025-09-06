/* eslint-disable react-hooks/exhaustive-deps */

'use client';

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

type Track = { id: string; title: string; artist: string; url: string };
type Playlist = { id: string; name: string; tracks: Track[] };

type Ctx = {
  playlist: Playlist | null;
  current: number;
  playing: boolean;
  volume: number;
  setVolume: (v: number) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  setOptIn: (b: boolean) => void;
  optIn: boolean;
};

const MusicCtx = createContext<Ctx | null>(null);

export function useMusic() {
  const c = useContext(MusicCtx);
  if (!c) throw new Error('useMusic must be used within GlobalMusicProvider');
  return c;
}

export default function GlobalMusicProvider({ children }: { children: React.ReactNode }) {
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState<number>(0.6);
  const [optIn, setOptIn] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load localStorage values only on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedVolume = localStorage.getItem('music:vol');
      const savedOptIn = localStorage.getItem('music:optin');
      if (savedVolume) setVolume(Number(savedVolume));
      if (savedOptIn === '1') setOptIn(true);
    }
  }, []);

  useEffect(() => {
    fetch('/api/music/playlist', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        const pl = d?.playlist;
        if (pl && Array.isArray(pl.tracks) && pl.tracks.length > 0) {
          setPlaylist(pl);
        } else {
          setPlaylist(null);
        }
      })
      .catch(() => setPlaylist(null));
  }, []);

  useEffect(() => {
    localStorage.setItem('music:vol', String(volume));
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    localStorage.setItem('music:optin', optIn ? '1' : '0');
    if (!optIn && audioRef.current) {
      audioRef.current.pause();
      setPlaying(false);
    }
  }, [optIn]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onEnded = () => next();
    a.addEventListener('ended', onEnded);
    return () => a.removeEventListener('ended', onEnded);
  }, [current, playlist]);

  const src = useMemo(() => {
    const t = playlist?.tracks?.[current];
    return t?.url ?? '';
  }, [playlist, current]);

  const toggle = () => {
    if (!optIn) return;
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play()
        .then(() => setPlaying(true))
        .catch(() => {});
    }
  };

  const next = () => {
    if (!playlist?.tracks?.length) return;
    setCurrent((i) => (i + 1) % playlist.tracks.length);
  };
  const prev = () => {
    if (!playlist?.tracks?.length) return;
    setCurrent((i) => (i - 1 + playlist.tracks.length) % playlist.tracks.length);
  };

  return (
    <MusicCtx.Provider
      value={{ playlist, current, playing, volume, setVolume, toggle, next, prev, optIn, setOptIn }}
    >
      {children}
      {/* Hidden audio element */}
      <audio ref={audioRef} src={src} preload="none" />
    </MusicCtx.Provider>
  );
}
