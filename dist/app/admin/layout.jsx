'use strict';
'use client';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = AdminLayout;
const react_1 = require('react');
const link_1 = __importDefault(require('next/link'));
const navigation_1 = require('next/navigation');
const utils_1 = require('@/lib/utils');
const lucide_react_1 = require('lucide-react');
const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: lucide_react_1.LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: lucide_react_1.Users },
  { name: 'Analytics', href: '/admin/analytics', icon: lucide_react_1.BarChart3 },
  { name: 'Reports', href: '/admin/reports', icon: lucide_react_1.FileText },
  { name: 'Security', href: '/admin/security', icon: lucide_react_1.Shield },
  { name: 'Settings', href: '/admin/settings', icon: lucide_react_1.Settings },
];
function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = (0, react_1.useState)(false);
  const pathname = (0, navigation_1.usePathname)();
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div
        className={(0, utils_1.cn)(
          'fixed inset-0 z-40 lg:hidden',
          sidebarOpen ? 'block' : 'hidden'
        )}
      >
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold">Admin Panel</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-md p-2 text-gray-500 hover:bg-gray-100"
            >
              <lucide_react_1.X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map(item => {
              const isActive = pathname === item.href;
              return (
                <link_1.default
                  key={item.name}
                  href={item.href}
                  className={(0, utils_1.cn)(
                    'group flex items-center rounded-md px-2 py-2 text-sm font-medium',
                    isActive
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon
                    className={(0, utils_1.cn)(
                      'mr-3 h-6 w-6 flex-shrink-0',
                      isActive ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  {item.name}
                </link_1.default>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
          <div className="flex h-16 items-center px-4">
            <h1 className="text-xl font-bold">Admin Panel</h1>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map(item => {
              const isActive = pathname === item.href;
              return (
                <link_1.default
                  key={item.name}
                  href={item.href}
                  className={(0, utils_1.cn)(
                    'group flex items-center rounded-md px-2 py-2 text-sm font-medium',
                    isActive
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon
                    className={(0, utils_1.cn)(
                      'mr-3 h-6 w-6 flex-shrink-0',
                      isActive ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  {item.name}
                </link_1.default>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
          <button
            type="button"
            className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <lucide_react_1.Menu className="h-6 w-6" />
          </button>
          <div className="flex flex-1 justify-between px-4">
            <div className="flex flex-1">
              <h2 className="my-auto text-2xl font-semibold text-gray-900">
                {navigation.find(item => item.href === pathname)?.name || 'Admin'}
              </h2>
            </div>
          </div>
        </div>

        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
