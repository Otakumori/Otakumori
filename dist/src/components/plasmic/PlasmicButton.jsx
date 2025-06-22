'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = PlasmicButton;
function PlasmicButton({ children }) {
  return (
    <button className="rounded-lg bg-pink-500 px-4 py-2 text-white transition hover:bg-pink-600">
      {children}
    </button>
  );
}
