'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = ClientPagesLayout;
const _clientLayout_1 = __importDefault(require('@/app/_clientLayout'));
function ClientPagesLayout({ children }) {
  return <_clientLayout_1.default>{children}</_clientLayout_1.default>;
}
