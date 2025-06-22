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
Object.defineProperty(exports, '__esModule', { value: true });
const react_1 = __importStar(require('react'));
const framer_motion_1 = require('framer-motion');
const SoapstoneMessage = ({ message, duration = 5000, position = 'center', type = 'praise' }) => {
  const [isVisible, setIsVisible] = (0, react_1.useState)(true);
  (0, react_1.useEffect)(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration]);
  const getPositionStyles = () => {
    switch (position) {
      case 'top':
        return 'top-4';
      case 'bottom':
        return 'bottom-4';
      default:
        return 'top-1/2 -translate-y-1/2';
    }
  };
  const getTypeStyles = () => {
    switch (type) {
      case 'warning':
        return 'bg-red-900/90 text-red-100';
      case 'help':
        return 'bg-blue-900/90 text-blue-100';
      case 'invasion':
        return 'bg-purple-900/90 text-purple-100';
      default:
        return 'bg-yellow-900/90 text-yellow-100';
    }
  };
  return (
    <framer_motion_1.AnimatePresence>
      {isVisible && (
        <framer_motion_1.motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed left-1/2 -translate-x-1/2 ${getPositionStyles()} z-50`}
        >
          <div
            className={`${getTypeStyles()} transform cursor-pointer select-none rounded-lg border border-white/20 px-6 py-3 font-medieval text-lg tracking-wider shadow-lg backdrop-blur-sm transition-transform duration-300 hover:scale-105`}
            onClick={() => setIsVisible(false)}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">✧</span>
              <span>{message}</span>
              <span className="text-2xl">✧</span>
            </div>
          </div>
        </framer_motion_1.motion.div>
      )}
    </framer_motion_1.AnimatePresence>
  );
};
exports.default = SoapstoneMessage;
