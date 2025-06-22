import React from 'react';
import { motion } from 'framer-motion';

export default function AchievementsLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <div className="animate-pulse">
          <div className="h-8 w-48 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="mt-2 h-4 w-64 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <div className="animate-pulse">
              <div className="h-6 w-32 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="mt-2 h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <div className="animate-pulse space-y-4">
          <div className="h-10 w-full rounded bg-gray-200 dark:bg-gray-700" />
          <div className="flex flex-wrap gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 w-24 rounded-full bg-gray-200 dark:bg-gray-700" />
            ))}
          </div>
        </div>
      </div>

      {/* Achievement Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <div className="animate-pulse space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-700" />
                <div className="flex-1">
                  <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="mt-2 h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>
              <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-2 w-full rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
