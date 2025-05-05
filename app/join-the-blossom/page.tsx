'use client'; // 👈 THIS IS THE FIX

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

export default function JoinTheBlossomPage() {
  const searchParams = useSearchParams()
  const initialEmail = searchParams.get('email') || ''
  const [email, setEmail] = useState(initialEmail)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
      setError('Please enter a valid email address.')
      return
    }
    const { error } = await supabase.from('newsletter_signups').insert({ email })
    if (error) {
      setError('Something went wrong. Please try again!')
    } else {
      setSubmitted(true)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-xl w-full bg-gray-900/90 rounded-3xl shadow-2xl p-8 flex flex-col items-center">
        <h1 className="text-4xl font-bold text-pink-400 mb-4 text-center">Join the Blossom 🌸</h1>
        <p className="text-lg text-pink-100 mb-6 text-center">
          Become part of the Otaku-mori community!<br />
          <span className="text-pink-300 font-semibold">Benefits include:</span>
        </p>
        <ul className="mb-6 text-pink-200 text-base list-disc list-inside space-y-2">
          <li>Earn <span className="text-pink-400 font-bold">more petals</span> for exclusive rewards</li>
          <li>Early access to shop drops & events</li>
          <li>Special community-only giveaways</li>
          <li>Unlock lore, mini-games, and profile perks</li>
          <li>Get the latest blog & newsletter updates</li>
        </ul>
        {!submitted ? (
          <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-4">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Your email address"
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-500 shadow"
              required
            />
            <button
              type="submit"
              className="w-full bg-pink-600 hover:bg-pink-700 text-white rounded-lg px-4 py-2 font-semibold transition"
            >
              Join the Blossom
            </button>
            {error && <div className="text-red-400 text-sm mt-2">{error}</div>}
          </form>
        ) : (
          <div className="text-green-400 text-lg font-semibold mt-4 text-center">
            Thank you for joining! Check your inbox for Otaku-mori updates soon.
          </div>
        )}
      </div>
    </main>
  )
} 