'use strict';
'use client';
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = Error;
const react_1 = require('react');
function Error({ error, reset }) {
  (0, react_1.useEffect)(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="rounded-lg bg-red-50 p-8 text-center">
        <h2 className="mb-4 text-2xl font-bold text-red-700">Something went wrong!</h2>
        <p className="mb-6 text-red-600">{error.message}</p>
        <button
          onClick={reset}
          className="rounded-lg bg-red-500 px-6 py-3 text-white hover:bg-red-600"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
