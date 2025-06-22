'use strict';
'use client';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = ClientLayout;
const providers_1 = require('./providers');
const react_hot_toast_1 = require('react-hot-toast');
const Footer_1 = __importStar(require('./components/Footer'));
const FloatingSoapstoneComments_1 = __importDefault(
  require('./components/FloatingSoapstoneComments')
);
const CherryBlossomEffect_1 = __importDefault(require('./components/CherryBlossomEffect'));
const Toast_1 = require('@/components/Toast');
const framer_motion_1 = require('framer-motion');
const SoundSettings_1 = require('@/components/SoundSettings');
function ClientLayout({ children }) {
  return (
    <Toast_1.ToastProvider>
      <framer_motion_1.AnimatePresence mode="wait">
        <CherryBlossomEffect_1.default />
        <providers_1.Providers>
          {children}
          <react_hot_toast_1.Toaster position="bottom-right" />
          <FloatingSoapstoneComments_1.default />
          <Footer_1.BottomLogoAndSocials />
          <Footer_1.default />
          <SoundSettings_1.SoundSettings />
        </providers_1.Providers>
      </framer_motion_1.AnimatePresence>
    </Toast_1.ToastProvider>
  );
}
