'use strict';
'use client';
'use client';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = AdminPage;
const react_1 = require('react');
const navigation_1 = require('next/navigation');
const supabase_1 = require('@/lib/supabase');
const LoadingBonfire_1 = __importDefault(require('@/components/ui/LoadingBonfire'));
const framer_motion_1 = require('framer-motion');
const QuickActions_1 = __importDefault(require('@/components/admin/QuickActions'));
const MessageManager_1 = __importDefault(require('@/components/admin/MessageManager'));
function AdminPage() {
  const router = (0, navigation_1.useRouter)();
  const [isLoading, setIsLoading] = (0, react_1.useState)(true);
  const [isAuthorized, setIsAuthorized] = (0, react_1.useState)(false);
  const [stats, setStats] = (0, react_1.useState)({
    totalUsers: 0,
    totalPetals: 0,
    activeUsers: 0,
    totalMessages: 0,
    topRatedMessage: '',
  });
  const [activeTab, setActiveTab] = (0, react_1.useState)('dashboard');
  (0, react_1.useEffect)(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase_1.supabase.auth.getSession();
        if (!session?.user?.email) {
          router.push('/login');
          return;
        }
        const isAdmin = await supabase_1.supabase.rpc('is_admin', {
          user_email: session.user.email,
        });
        if (!isAdmin) {
          router.push('/');
          return;
        }
        // Fetch all admin stats
        const [{ data: userStats }, { data: messageStats }, { data: topMessage }] =
          await Promise.all([
            supabase_1.supabase.from('users').select('count, sum(petal_count)').single(),
            supabase_1.supabase.from('soapstone_messages').select('count').single(),
            supabase_1.supabase
              .from('soapstone_messages')
              .select('content')
              .order('rating', { ascending: false })
              .limit(1)
              .single(),
          ]);
        setStats({
          totalUsers: userStats?.count || 0,
          totalPetals: Number(userStats?.sum) || 0,
          activeUsers: 0, // TODO: Implement active users tracking
          totalMessages: messageStats?.count || 0,
          topRatedMessage: topMessage?.content || 'No messages yet',
        });
        setIsAuthorized(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [router]);
  if (isLoading) {
    return <LoadingBonfire_1.default />;
  }
  if (!isAuthorized) {
    return null;
  }
  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-pink-400">Princess Admin General's Throne</h1>
            <p className="mt-2 text-gray-400">Welcome to your domain, Your Highness</p>
          </div>
          <button
            onClick={() => supabase_1.supabase.auth.signOut()}
            className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium transition-colors hover:bg-pink-700"
          >
            Leave the Throne
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8 flex space-x-4 border-b border-gray-700">
          {['dashboard', 'messages', 'users', 'settings'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-pink-400 text-pink-400'
                  : 'text-gray-400 hover:text-pink-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Dashboard Content */}
        {activeTab === 'dashboard' && (
          <framer_motion_1.motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Quick Actions */}
            <div>
              <h2 className="mb-4 text-2xl font-bold text-pink-400">Quick Actions</h2>
              <QuickActions_1.default />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* User Statistics Card */}
              <div className="rounded-lg border border-pink-500/20 bg-gray-800 p-6 shadow-lg transition-colors hover:border-pink-500/40">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-pink-400">Ashen Ones</h2>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-500/20">
                    <span className="text-pink-400">👥</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-3xl font-bold">{stats.totalUsers}</p>
                  <p className="text-gray-400">Total Ashen Ones</p>
                </div>
              </div>

              {/* Petal Economy Card */}
              <div className="rounded-lg border border-pink-500/20 bg-gray-800 p-6 shadow-lg transition-colors hover:border-pink-500/40">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-pink-400">Petal Economy</h2>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-500/20">
                    <span className="text-pink-400">🌸</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-3xl font-bold">{stats.totalPetals}</p>
                  <p className="text-gray-400">Total Petals Collected</p>
                </div>
              </div>

              {/* Messages Card */}
              <div className="rounded-lg border border-pink-500/20 bg-gray-800 p-6 shadow-lg transition-colors hover:border-pink-500/40">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-pink-400">Soapstone Messages</h2>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-500/20">
                    <span className="text-pink-400">💬</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-3xl font-bold">{stats.totalMessages}</p>
                  <p className="text-gray-400">Total Messages</p>
                </div>
              </div>
            </div>

            {/* Top Message Card */}
            <div className="rounded-lg border border-pink-500/20 bg-gray-800 p-6 shadow-lg transition-colors hover:border-pink-500/40">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-pink-400">Most Praised Message</h2>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-500/20">
                  <span className="text-pink-400">👑</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-lg italic text-pink-200">"{stats.topRatedMessage}"</p>
                <p className="text-gray-400">Most Praised by the Community</p>
              </div>
            </div>
          </framer_motion_1.motion.div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <framer_motion_1.motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <MessageManager_1.default />
          </framer_motion_1.motion.div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <framer_motion_1.motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* User management features will go here */}
            <div className="rounded-lg border border-pink-500/20 bg-gray-800 p-6 shadow-lg">
              <h2 className="mb-4 text-xl font-semibold text-pink-400">User Management</h2>
              <p className="text-gray-400">
                Coming soon: User management tools, permissions, and more!
              </p>
            </div>
          </framer_motion_1.motion.div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <framer_motion_1.motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Site settings will go here */}
            <div className="rounded-lg border border-pink-500/20 bg-gray-800 p-6 shadow-lg">
              <h2 className="mb-4 text-xl font-semibold text-pink-400">Site Settings</h2>
              <p className="text-gray-400">
                Coming soon: Site configuration, theme settings, and more!
              </p>
            </div>
          </framer_motion_1.motion.div>
        )}
      </div>
    </div>
  );
}
