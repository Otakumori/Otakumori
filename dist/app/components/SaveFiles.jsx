'use strict';
'use client';
'use client';
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = SaveFiles;
const react_1 = require('react');
const framer_motion_1 = require('framer-motion');
const lucide_react_1 = require('lucide-react');
const initialSaveFiles = [
  {
    id: '1',
    name: 'Save File 1',
    lastModified: new Date(),
    playTime: 120,
    progress: 45,
  },
  {
    id: '2',
    name: 'Save File 2',
    lastModified: new Date(Date.now() - 86400000), // 1 day ago
    playTime: 45,
    progress: 20,
  },
];
function SaveFiles() {
  const [saveFiles, setSaveFiles] = (0, react_1.useState)(initialSaveFiles);
  const formatPlayTime = minutes => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  const formatDate = date => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {saveFiles.map(saveFile => (
        <framer_motion_1.motion.div
          key={saveFile.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          className="relative overflow-hidden rounded-lg border border-pink-200 bg-white p-6"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <lucide_react_1.Save className="h-6 w-6 text-pink-500" />
              <div>
                <h3 className="font-medium text-gray-900">{saveFile.name}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Last modified: {formatDate(saveFile.lastModified)}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                title="Download Save"
              >
                <lucide_react_1.Download className="h-5 w-5" />
              </button>
              <button
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                title="Delete Save"
              >
                <lucide_react_1.Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Play Time: {formatPlayTime(saveFile.playTime)}</span>
              <span>Progress: {saveFile.progress}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-pink-500 transition-all duration-300"
                style={{ width: `${saveFile.progress}%` }}
              />
            </div>
          </div>
        </framer_motion_1.motion.div>
      ))}
      <framer_motion_1.motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        className="flex h-full min-h-[200px] items-center justify-center rounded-lg border-2 border-dashed border-pink-200 bg-white p-6 text-pink-500 hover:border-pink-300 hover:bg-pink-50"
      >
        <div className="flex flex-col items-center space-y-2">
          <lucide_react_1.Plus className="h-8 w-8" />
          <span className="text-sm font-medium">New Save File</span>
        </div>
      </framer_motion_1.motion.button>
    </div>
  );
}
