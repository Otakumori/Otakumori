'use strict';
'use client';
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = CommandAccess;
const react_1 = require('react');
const navigation_1 = require('next/navigation');
const supabaseClient_1 = require('@/lib/supabaseClient');
const framer_motion_1 = require('framer-motion');
function CommandAccess() {
  const [email, setEmail] = (0, react_1.useState)('');
  const [password, setPassword] = (0, react_1.useState)('');
  const [loading, setLoading] = (0, react_1.useState)(false);
  const [errorMsg, setErrorMsg] = (0, react_1.useState)('');
  const router = (0, navigation_1.useRouter)();
  const handleLogin = async e => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    const { error } = await supabaseClient_1.supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setErrorMsg(error.message);
    } else {
      router.push('/dashboard');
    }
    setLoading(false);
  };
  return (
    <framer_motion_1.motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black p-6"
    >
      <div className="w-full max-w-md rounded-xl border border-gray-800 bg-gray-950 p-8 shadow-2xl">
        <h1 className="mb-2 text-center text-3xl font-bold tracking-wide text-pink-400">
          Commander Access
        </h1>
        <p className="mb-6 text-center text-sm text-gray-400">
          Welcome to Otaku-mori’s inner sanctum
        </p>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Email Address</label>
            <input
              type="email"
              required
              className="w-full rounded-md border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="you@otaku.moe"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Password</label>
            <input
              type="password"
              required
              className="w-full rounded-md border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          {errorMsg && <p className="mt-2 text-sm text-red-400">{errorMsg}</p>}

          <framer_motion_1.motion.button
            whileTap={{ scale: 0.95 }}
            disabled={loading}
            className="w-full rounded-md bg-pink-500 px-4 py-2 font-semibold text-white transition hover:bg-pink-600 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </framer_motion_1.motion.button>
        </form>
      </div>
    </framer_motion_1.motion.div>
  );
}
