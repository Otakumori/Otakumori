'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';

// Remove duplicate gtag declaration - already defined in lib/ga.ts

// L-Room puzzle data
const TIMELINE_OPTIONS = [
  { time: '23:59', label: 'Kira strikes at midnight', order: 5 },
  { time: '14:30', label: 'L begins investigation', order: 2 },
  { time: '09:15', label: 'Death Note discovered', order: 1 },
  { time: '18:45', label: 'Task Force assembled', order: 3 },
  { time: '22:10', label: 'Surveillance initiated', order: 4 },
  { time: '03:20', label: 'Light reveals himself', order: 6 },
];

const CHARACTER_OPTIONS = [
  { name: 'L', frequency: 'most' },
  { name: 'Light', frequency: 'most' },
  { name: 'Misa', frequency: 'most' },
  { name: 'Ryuk', frequency: 'most' },
  { name: 'Watari', frequency: 'least' },
  { name: 'Matsuda', frequency: 'least' },
  { name: 'Near', frequency: 'least' },
  { name: 'Mello', frequency: 'least' },
];

const ANAGRAM_KEYWORD = 'DEATH'; // Or 'SHINIGAMI'

export default function LRoom404() {
  const [phase, setPhase] = useState<'timeline' | 'characters' | 'anagram' | 'complete' | 'skip'>(
    'timeline',
  );
  const [timelineSelected, setTimelineSelected] = useState<string[]>([]);
  const [charactersSelected, setCharactersSelected] = useState<string[]>([]);
  const [anagramInput, setAnagramInput] = useState('');
  const [showFlash, setShowFlash] = useState(false);
  const [folderGreen, setFolderGreen] = useState(false);
  const [skipTimer, setSkipTimer] = useState<number | null>(null);

  // Analytics tracking
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', '404_p1', {
        event_category: 'engagement',
        event_label: 'l_room_timeline_start',
      });
    }
  }, []);

  // Auto-skip after 2 minutes
  useEffect(() => {
    const timer = setTimeout(() => {
      setSkipTimer(120);
    }, 120000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (skipTimer !== null && skipTimer > 0) {
      const countdown = setTimeout(() => {
        setSkipTimer(skipTimer - 1);
      }, 1000);
      return () => clearTimeout(countdown);
    } else if (skipTimer === 0) {
      setPhase('skip');
    }
  }, [skipTimer]);

  const handleTimelineSelect = (time: string) => {
    if (timelineSelected.includes(time)) {
      setTimelineSelected(timelineSelected.filter((t) => t !== time));
    } else if (timelineSelected.length < 5) {
      setTimelineSelected([...timelineSelected, time]);
    }
  };

  const checkTimelineOrder = () => {
    const selectedOptions = TIMELINE_OPTIONS.filter((opt) => timelineSelected.includes(opt.time));
    const sortedBySelection = selectedOptions.sort(
      (a, b) => timelineSelected.indexOf(a.time) - timelineSelected.indexOf(b.time),
    );
    const correctOrder = sortedBySelection.every((opt, index) => opt.order === index + 1);

    if (correctOrder && timelineSelected.length === 5) {
      setPhase('characters');
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', '404_p2', {
          event_category: 'engagement',
          event_label: 'l_room_characters_start',
        });
      }
    }
  };

  const handleCharacterSelect = (name: string) => {
    if (charactersSelected.includes(name)) {
      setCharactersSelected(charactersSelected.filter((n) => n !== name));
    } else if (charactersSelected.length < 4) {
      setCharactersSelected([...charactersSelected, name]);
    }
  };

  const checkCharacters = () => {
    const correctCharacters = CHARACTER_OPTIONS.filter((char) => char.frequency === 'most').map(
      (char) => char.name,
    );

    const isCorrect =
      charactersSelected.length === 4 &&
      charactersSelected.every((char) => correctCharacters.includes(char));

    if (isCorrect) {
      setFolderGreen(true);
      setPhase('anagram');
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', '404_p3', {
          event_category: 'engagement',
          event_label: 'l_room_anagram_start',
        });
      }
    }
  };

  const handleAnagramSubmit = () => {
    if (anagramInput.toUpperCase() === ANAGRAM_KEYWORD) {
      setShowFlash(true);
      setTimeout(() => {
        setPhase('complete');
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', '404_complete', {
            event_category: 'engagement',
            event_label: 'l_room_puzzle_solved',
          });
        }
      }, 1000);
    }
  };

  if (phase === 'skip' || skipTimer === 0) {
    const errorMessage = {
      title: "You've gone hollow, traveler.",
      message: "This path doesn't exist. The bonfire has faded.",
      cta: {
        label: 'Return to Home',
        href: '/',
      },
    };

    return (
      <main className="relative min-h-screen bg-[#080611] text-zinc-100 flex items-center justify-center">
        <Head>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(1200px_circle_at_50%_35%,#1a0f2a,#120b1f_40%,#080611_100%)]" />

        <section className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 text-center">
          <h1 className="text-3xl font-bold md:text-5xl mb-4">{errorMessage.title}</h1>
          <p className="mt-3 text-zinc-300/90 mb-8">{errorMessage.message}</p>
          <Link
            href={errorMessage.cta.href}
            className="rounded-xl bg-pink-500/90 px-6 py-3 text-white hover:bg-pink-500 transition-colors"
          >
            {errorMessage.cta.label}
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden">
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      {/* L-Room atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800" />

      {/* White flash effect */}
      {showFlash && (
        <div
          className="fixed inset-0 bg-white z-50 animate-pulse"
          style={{ animation: 'flash 1s ease-out forwards' }}
        />
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes flash {
            0% { opacity: 0; }
            50% { opacity: 1; }
            100% { opacity: 0; }
          }
        `,
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        {/* Skip timer */}
        {skipTimer && (
          <div className="absolute top-4 right-4 text-xs text-gray-500">
            Auto-skip in {skipTimer}s
          </div>
        )}

        {/* Phase 1: Timeline Anomaly */}
        {phase === 'timeline' && (
          <div className="max-w-4xl w-full">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-mono text-red-400 mb-4">TEMPORAL ANOMALY DETECTED</h1>
              <p className="text-gray-300">
                Arrange these events in chronological order (select 5):
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {TIMELINE_OPTIONS.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleTimelineSelect(option.time)}
                  className={`p-4 border border-gray-600 rounded-lg text-left transition-all
                    ${
                      timelineSelected.includes(option.time)
                        ? 'bg-red-900/50 border-red-500 text-red-200'
                        : 'bg-gray-900/50 hover:bg-gray-800/50 hover:border-gray-500'
                    }
                  `}
                >
                  <div className="font-mono text-red-400 text-sm">{option.time}</div>
                  <div className="text-sm">{option.label}</div>
                  {timelineSelected.includes(option.time) && (
                    <div className="text-xs text-red-400 mt-1">
                      #{timelineSelected.indexOf(option.time) + 1}
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={checkTimelineOrder}
                disabled={timelineSelected.length !== 5}
                className="px-6 py-2 bg-red-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 transition-colors"
              >
                Confirm Sequence ({timelineSelected.length}/5)
              </button>
            </div>
          </div>
        )}

        {/* Phase 2: Red Herring */}
        {phase === 'characters' && (
          <div className="max-w-4xl w-full">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-mono text-yellow-400 mb-4">
                CHARACTER FREQUENCY ANALYSIS
              </h1>
              <p className="text-gray-300">Select the 4 most frequently appearing characters:</p>
              <div className="mt-4 flex items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded border-2 ${folderGreen ? 'bg-green-500 border-green-500' : 'bg-red-500 border-red-500'}`}
                  />
                  <span className="text-sm">Data Folder</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {CHARACTER_OPTIONS.map((character, i) => (
                <button
                  key={i}
                  onClick={() => handleCharacterSelect(character.name)}
                  className={`p-4 border border-gray-600 rounded-lg text-center transition-all
                    ${
                      charactersSelected.includes(character.name)
                        ? 'bg-yellow-900/50 border-yellow-500 text-yellow-200'
                        : 'bg-gray-900/50 hover:bg-gray-800/50 hover:border-gray-500'
                    }
                  `}
                >
                  <div className="font-mono text-lg">{character.name}</div>
                </button>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={checkCharacters}
                disabled={charactersSelected.length !== 4}
                className="px-6 py-2 bg-yellow-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-700 transition-colors"
              >
                Analyze Frequency ({charactersSelected.length}/4)
              </button>
            </div>
          </div>
        )}

        {/* Phase 3: True Name */}
        {phase === 'anagram' && (
          <div className="max-w-2xl w-full">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-mono text-green-400 mb-4">TRUE NAME REQUIRED</h1>
              <p className="text-gray-300 mb-4">Enter the anagram keyword to restore the data:</p>
              <p className="text-xs text-gray-500 font-mono">HATDE → ?</p>
            </div>

            <div className="text-center">
              <input
                type="text"
                value={anagramInput}
                onChange={(e) => setAnagramInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAnagramSubmit()}
                className="bg-gray-900 border border-gray-600 rounded px-4 py-2 text-center font-mono text-lg uppercase tracking-wider focus:border-green-500 focus:outline-none mb-4"
                maxLength={10}
                placeholder="ENTER NAME"
              />
              <br />
              <button
                onClick={handleAnagramSubmit}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Restore Data
              </button>
            </div>
          </div>
        )}

        {/* Phase 4: Resolution */}
        {phase === 'complete' && (
          <div className="max-w-2xl w-full text-center">
            <div className="mb-8 animate-fade-in">
              <h1 className="text-2xl font-mono text-green-400 mb-4">LOGIC RESTORED</h1>
              <p className="text-gray-300 mb-8">
                The logic has been restored. The data can now be recovered.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold">404 - Page Not Found</h2>
              <p className="text-gray-300">The page you were looking for doesn't exist.</p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-pink-500/90 text-white rounded-xl hover:bg-pink-500 transition-colors"
              >
                Return to the Homepage
              </Link>
            </div>
          </div>
        )}

        {/* Skip option */}
        <div className="absolute bottom-4 right-4">
          <button
            onClick={() => setPhase('skip')}
            className="text-xs text-gray-500 hover:text-gray-300 underline"
          >
            Skip puzzle
          </button>
        </div>
      </div>
    </main>
  );
}
