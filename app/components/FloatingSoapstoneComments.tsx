/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
// import { createClient } from '@supabase/supabase-js';

interface SoapstoneMessage {
  id: string;
  content: string;
  created_at: string;
}

export default function FloatingSoapstoneComments() {
  // Temporarily disabled - migrating from Supabase to Prisma
  return null;
  
  const [comments, setComments] = useState<SoapstoneMessage[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Create Supabase client for client-side use
  // const supabase = createClient(
  //   process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  //   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  // );

  // useEffect(() => {
  //   const fetchComments = async () => {
  //     try {
  //       const { data, error } = await supabase
  //         .from('soapstone_messages')
  //         .select('id, content, created_at')
  //         .order('created_at', { ascending: false })
  //         .limit(10);

  //       if (error) {
  //         console.error('Error fetching comments:', error);
  //         return;
  //       }

  //       setComments(data || []);
  //     } catch (error) {
  //       console.error('Error fetching comments:', error);
  //     }
  //   };

  //   fetchComments();
  // }, [supabase]);

  // const handleSubmitComment = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!newComment.trim()) return;

  //   setIsLoading(true);
  //   try {
  //     const { error } = await supabase
  //       .from('soapstone_messages')
  //       .insert([{ content: newComment.trim() }]);

  //     if (error) {
  //       console.error('Error submitting comment:', error);
  //       return;
  //     }

  //     setNewComment('');
  //     // Refresh comments
  //     const { data, error: fetchError } = await supabase
  //       .from('soapstone_messages')
  //       .select('id, content, created_at')
  //       .order('created_at', { ascending: false })
  //       .limit(10);

  //       if (!fetchError && data) {
  //         setComments(data);
  //     }
  //   } catch (error) {
  //     console.error('Error submitting comment:', error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-6 right-6 z-50 bg-pink-500 hover:bg-pink-600 text-white rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110"
        aria-label="Toggle comments"
      >
        💬
      </button>

      {/* Comments Panel */}
      {isVisible && (
        <div className="fixed bottom-20 right-6 z-40 w-80 max-h-96 bg-white rounded-lg shadow-xl border border-pink-200 overflow-hidden">
          <div className="bg-pink-500 text-white p-3">
            <h3 className="font-semibold">Soapstone Messages</h3>
          </div>
          
          <div className="p-4 max-h-64 overflow-y-auto">
            {comments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No messages yet. Be the first!</p>
            ) : (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-800">{comment.content}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={() => {}} className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Leave a message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                maxLength={200}
              />
              <button
                type="submit"
                disabled={isLoading || !newComment.trim()}
                className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '...' : 'Send'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
