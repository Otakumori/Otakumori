'use strict';
'use client';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = SaveFilesPage;
const Header_1 = __importDefault(require('../../components/Header'));
const SaveFiles_1 = __importDefault(require('../../components/SaveFiles'));
function SaveFilesPage() {
  return (
    <main className="min-h-screen bg-pink-50">
      <Header_1.default />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-pink-900">Save Files</h1>
        <SaveFiles_1.default />
      </div>
    </main>
  );
}
