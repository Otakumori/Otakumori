'use strict';
'use client';
'use client';
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = QuickActions;
const react_1 = require('react');
const supabase_1 = require('@/lib/supabase');
const framer_motion_1 = require('framer-motion');
function QuickActions() {
  const [isLoading, setIsLoading] = (0, react_1.useState)(null);
  const quickActions = [
    {
      id: 'clear-messages',
      title: 'Clear Low-Rated Messages',
      description: 'Remove messages with less than 3 stars',
      icon: '🗑️',
      color: 'bg-red-500/20 hover:bg-red-500/30',
      action: async () => {
        setIsLoading('clear-messages');
        try {
          const { error } = await supabase_1.supabase
            .from('soapstone_messages')
            .delete()
            .lt('rating', 3);
          if (error) throw error;
        } finally {
          setIsLoading(null);
        }
      },
    },
    {
      id: 'reset-petals',
      title: 'Reset Petal Economy',
      description: "Set all users' petal counts to 0",
      icon: '🌸',
      color: 'bg-pink-500/20 hover:bg-pink-500/30',
      action: async () => {
        setIsLoading('reset-petals');
        try {
          const { error } = await supabase_1.supabase.from('users').update({ petal_count: 0 });
          if (error) throw error;
        } finally {
          setIsLoading(null);
        }
      },
    },
    {
      id: 'backup-data',
      title: 'Backup Data',
      description: 'Export all user data to CSV',
      icon: '💾',
      color: 'bg-blue-500/20 hover:bg-blue-500/30',
      action: async () => {
        setIsLoading('backup-data');
        try {
          const { data, error } = await supabase_1.supabase.from('users').select('*');
          if (error) throw error;
          // Convert to CSV
          const csv = data.map(row => Object.values(row).join(',')).join('\n');
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'otaku-mori-backup.csv';
          a.click();
        } finally {
          setIsLoading(null);
        }
      },
    },
    {
      id: 'toggle-maintenance',
      title: 'Toggle Maintenance Mode',
      description: 'Enable/disable site maintenance mode',
      icon: '🔧',
      color: 'bg-yellow-500/20 hover:bg-yellow-500/30',
      action: async () => {
        setIsLoading('toggle-maintenance');
        try {
          // TODO: Implement maintenance mode toggle
          alert('Maintenance mode toggle coming soon!');
        } finally {
          setIsLoading(null);
        }
      },
    },
  ];
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {quickActions.map(action => (
        <framer_motion_1.motion.button
          key={action.id}
          onClick={action.action}
          disabled={isLoading === action.id}
          className={`rounded-lg border border-gray-700 p-4 ${action.color} transition-colors disabled:cursor-not-allowed disabled:opacity-50`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{action.icon}</span>
            <div className="text-left">
              <h3 className="font-medium text-white">{action.title}</h3>
              <p className="text-sm text-gray-400">{action.description}</p>
            </div>
          </div>
          {isLoading === action.id && (
            <div className="mt-2">
              <div className="mx-auto h-4 w-4 animate-spin rounded-full border-b-2 border-t-2 border-white"></div>
            </div>
          )}
        </framer_motion_1.motion.button>
      ))}
    </div>
  );
}
