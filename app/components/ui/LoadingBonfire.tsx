import React from 'react';

const LoadingBonfire: React.FC = () => (
  <div className="flex items-center justify-center p-8">
    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-pink-500"></div>
    <span className="ml-2 text-pink-500">Loading...</span>
  </div>
);

export default LoadingBonfire;
