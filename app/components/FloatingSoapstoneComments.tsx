'use client';
'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiX } from 'react-icons/fi';

interface SoapstoneComment {
  id: string;
  content: string;
  created_at: string;
}

const MAX_VISIBLE = 4;
const CYCLE_INTERVAL = 5000; // ms
const COLORS = [
  'bg-gray-800/90 text-pink-100 shadow-pink-900/40',
  'bg-pink-900/90 text-pink-200 shadow-pink-700/40',
  'bg-black/90 text-pink-300 shadow-black/40',
];

export default function FloatingSoapstoneComments() {
  const [comments, setComments] = useState<SoapstoneComment[]>([]);
  const [visibleIdx, setVisibleIdx] = useState(0);
  const [input, setInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch recent comments
  useEffect(() => {
    const fetchComments = async () => {
      const { data, error } = await supabase
        .from('soapstone_messages')
        .select('id, content, created_at')
        .order('created_at', { ascending: false })
        .limit(20);
      if (!error && data) setComments(data);
    };
    fetchComments();
    const sub = supabase
      .channel('soapstone:realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'soapstone_messages' },
        fetchComments
      )
      .subscribe();
    return () => {
      supabase.removeChannel(sub);
    };
  }, []);

  // Cycle visible comments
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setVisibleIdx(idx => (idx + 1) % Math.max(1, comments.length - MAX_VISIBLE + 1));
    }, CYCLE_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [comments]);

  // Submit new comment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setSubmitting(true);
    await supabase
      .from('soapstone_messages')
      .insert({ content: input.trim(), author: 'Anonymous' });
    setInput('');
    setSubmitting(false);
  };

  // Responsive random positions
  function getRandomPosition(idx: number) {
    // For mobile, stack at bottom; for desktop, randomize
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      return { left: `${10 + idx * 22}%`, bottom: `${10 + idx * 8}%` };
    }
    return {
      left: `${Math.random() * 70 + 10}%`,
      top: `${Math.random() * 60 + 10}%`,
    };
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-40 select-none">
      {/* Floating comments */}
      <AnimatePresence>
        {comments.slice(visibleIdx, visibleIdx + MAX_VISIBLE).map((c, i) => (
          <motion.div
            key={c.id}
            drag
            dragConstraints={{
              left: 0,
              right: window.innerWidth - 220,
              top: 0,
              bottom: window.innerHeight - 80,
            }}
            initial={{ opacity: 0, scale: 0.8, ...getRandomPosition(i) }}
            animate={{ opacity: 1, scale: 1, ...getRandomPosition(i) }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className={`pointer-events-auto absolute min-w-[160px] max-w-xs cursor-pointer rounded-2xl border-2 border-pink-700/40 p-4 text-base font-semibold shadow-2xl ${COLORS[i % COLORS.length]} animate-pulse`}
            style={{ zIndex: 50 + i }}
            whileTap={{ scale: 1.08 }}
            onClick={e => {
              // Bring to center on click
              e.currentTarget.style.left = '50%';
              e.currentTarget.style.top = '60%';
              e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.1)';
            }}
          >
            {c.content}
          </motion.div>
        ))}
      </AnimatePresence>
      {/* Floating soapstone button and form */}
      <div className="pointer-events-auto fixed bottom-24 right-4 z-50 sm:bottom-12">
        {!formOpen ? (
          <button
            aria-label="Leave a soapstone message"
            className="flex items-center justify-center rounded-full bg-pink-600 p-4 text-white shadow-lg hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-400"
            onClick={() => setFormOpen(true)}
          >
            <FiMessageCircle size={28} />
          </button>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            onSubmit={handleSubmit}
            className="flex items-center gap-2 rounded-full bg-black/90 px-4 py-2 shadow-2xl"
            style={{ maxWidth: 400, minWidth: 220 }}
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              maxLength={200}
              placeholder="Leave a soapstone message..."
              className="w-32 bg-transparent px-2 py-1 text-white placeholder-pink-300 outline-none sm:w-48"
              disabled={submitting}
              autoFocus
            />
            <button
              type="submit"
              disabled={submitting || !input.trim()}
              className="rounded-full bg-pink-600 px-4 py-1 font-semibold text-white transition hover:bg-pink-700 disabled:opacity-50"
            >
              Send
            </button>
            <button
              type="button"
              aria-label="Close"
              className="ml-1 text-gray-400 hover:text-pink-400"
              onClick={() => setFormOpen(false)}
            >
              <FiX size={22} />
            </button>
          </motion.form>
        )}
      </div>
      {/* Mobile full-width form */}
      {formOpen && (
        <div className="pointer-events-auto fixed bottom-0 left-0 right-0 z-50 sm:hidden">
          <motion.form
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            onSubmit={handleSubmit}
            className="flex w-full items-center gap-2 rounded-t-2xl bg-black/90 px-4 py-3 shadow-2xl"
            style={{ maxWidth: '100vw' }}
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              maxLength={200}
              placeholder="Leave a soapstone message..."
              className="w-full bg-transparent px-2 py-1 text-white placeholder-pink-300 outline-none"
              disabled={submitting}
              autoFocus
            />
            <button
              type="submit"
              disabled={submitting || !input.trim()}
              className="rounded-full bg-pink-600 px-4 py-1 font-semibold text-white transition hover:bg-pink-700 disabled:opacity-50"
            >
              Send
            </button>
            <button
              type="button"
              aria-label="Close"
              className="ml-1 text-gray-400 hover:text-pink-400"
              onClick={() => setFormOpen(false)}
            >
              <FiX size={22} />
            </button>
          </motion.form>
        </div>
      )}
    </div>
  );
}
