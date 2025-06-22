'use strict';
'use client';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = BonfirePage;
const react_1 = __importDefault(require('react'));
const LoadingBonfire_1 = __importDefault(require('@/components/ui/LoadingBonfire'));
function BonfirePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-900 via-black to-gray-900 p-4">
      <h1 className="mb-8 text-4xl font-bold text-pink-400">Bonfire</h1>
      <p className="mb-8 max-w-md text-center text-white/70">
        "In the depths of darkness, the bonfire stands as a beacon of hope. Rest here, gather your
        strength, and prepare for the journey ahead."
      </p>
      <LoadingBonfire_1.default />
    </div>
  );
}
