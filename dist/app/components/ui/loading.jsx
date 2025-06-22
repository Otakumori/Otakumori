'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = Loading;
function Loading() {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="relative">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-pink-500/30">
          <div className="absolute left-0 top-0 h-12 w-12 animate-spin rounded-full border-4 border-pink-500 border-t-transparent"></div>
        </div>
      </div>
    </div>
  );
}
