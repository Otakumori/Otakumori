'use strict';
'use client';
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = MobileNavigation;
const react_1 = require('react');
const lucide_react_1 = require('lucide-react');
const button_1 = require('../ui/button');
function MobileNavigation({ className }) {
  const [isMenuOpen, setIsMenuOpen] = (0, react_1.useState)(false);
  const [activeTab, setActiveTab] = (0, react_1.useState)('home');
  const navigationItems = [
    { id: 'home', label: 'Home', icon: lucide_react_1.Home },
    { id: 'community', label: 'Community', icon: lucide_react_1.Users },
    { id: 'shop', label: 'Shop', icon: lucide_react_1.ShoppingCart },
    { id: 'profile', label: 'Profile', icon: lucide_react_1.User },
  ];
  const quickActions = [
    { id: 'search', label: 'Search', icon: lucide_react_1.Search },
    { id: 'notifications', label: 'Notifications', icon: lucide_react_1.Bell },
    { id: 'favorites', label: 'Favorites', icon: lucide_react_1.Heart },
    { id: 'petalnotes', label: 'Petalnotes', icon: lucide_react_1.BookOpen },
    { id: 'echoes', label: 'Echoes', icon: lucide_react_1.MessageCircle },
  ];
  return (
    <>
      {/* Top Navigation Bar */}
      <div
        className={`fixed left-0 right-0 top-0 z-50 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 ${className}`}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button_1.Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2"
            >
              {isMenuOpen ? (
                <lucide_react_1.X className="h-5 w-5" />
              ) : (
                <lucide_react_1.Menu className="h-5 w-5" />
              )}
            </button_1.Button>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Otaku-mori</h1>
          </div>

          <div className="flex items-center gap-2">
            <button_1.Button variant="ghost" size="sm" className="p-2">
              <lucide_react_1.Search className="h-5 w-5" />
            </button_1.Button>
            <button_1.Button variant="ghost" size="sm" className="relative p-2">
              <lucide_react_1.Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                3
              </span>
            </button_1.Button>
          </div>
        </div>
      </div>

      {/* Side Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl dark:bg-gray-900">
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Menu</h2>
                <button_1.Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(false)}>
                  <lucide_react_1.X className="h-5 w-5" />
                </button_1.Button>
              </div>

              {/* User Profile Section */}
              <div className="mb-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-900">
                    <lucide_react_1.User className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">SakuraFan</p>
                    <p className="text-sm text-gray-500">Level 15 • 1,247 petals</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mb-6">
                <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-gray-500">
                  Quick Actions
                </h3>
                <div className="space-y-1">
                  {quickActions.map(action => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.id}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <Icon className="h-5 w-5 text-gray-500" />
                        <span className="text-gray-900 dark:text-white">{action.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Items */}
              <div>
                <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-gray-500">
                  Navigation
                </h3>
                <div className="space-y-1">
                  {navigationItems.map(item => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsMenuOpen(false);
                        }}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                          activeTab === item.id
                            ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400'
                            : 'text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center justify-around py-2">
          {navigationItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 rounded-lg p-2 transition-colors ${
                  activeTab === item.id
                    ? 'bg-pink-50 text-pink-500 dark:bg-pink-900/20'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-20 right-4 z-50">
        <button_1.Button size="lg" className="h-14 w-14 rounded-full shadow-lg">
          <lucide_react_1.Plus className="h-6 w-6" />
        </button_1.Button>
      </div>

      {/* Content Padding for Mobile */}
      <div className="pb-20 pt-16">{/* Your page content goes here */}</div>
    </>
  );
}
