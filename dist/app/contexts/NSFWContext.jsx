'use strict';
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
exports.NSFWProvider = exports.useNSFW = void 0;
const react_1 = __importStar(require('react'));
const NSFWContext = (0, react_1.createContext)(undefined);
const useNSFW = () => {
  const ctx = (0, react_1.useContext)(NSFWContext);
  if (!ctx) throw new Error('useNSFW must be used within NSFWProvider');
  return ctx;
};
exports.useNSFW = useNSFW;
const NSFWProvider = ({ children }) => {
  const [isNSFWAllowed, setIsNSFWAllowed] = (0, react_1.useState)(false);
  const [showModal, setShowModal] = (0, react_1.useState)(false);
  (0, react_1.useEffect)(() => {
    const allowed = localStorage.getItem('otakumori_nsfw_allowed');
    setIsNSFWAllowed(allowed === 'true');
  }, []);
  const verifyAge = age => {
    if (age >= 18) {
      setIsNSFWAllowed(true);
      localStorage.setItem('otakumori_nsfw_allowed', 'true');
      setShowModal(false);
    } else {
      setIsNSFWAllowed(false);
      localStorage.setItem('otakumori_nsfw_allowed', 'false');
      setShowModal(true);
    }
  };
  const resetAge = () => {
    setIsNSFWAllowed(false);
    localStorage.setItem('otakumori_nsfw_allowed', 'false');
    setShowModal(true);
  };
  return (
    <NSFWContext.Provider value={{ isNSFWAllowed, verifyAge, resetAge }}>
      {children}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-full max-w-xs rounded-xl border border-pink-400/30 bg-[#2d2233] p-8 text-center shadow-lg">
            <h2 className="font-cormorant-garamond mb-4 text-xl text-pink-200">Age Verification</h2>
            <p className="mb-4 text-pink-100">
              You must be 18+ to access NSFW content. Please enter your age:
            </p>
            <input
              type="number"
              min={0}
              max={120}
              className="mb-4 w-20 rounded bg-pink-400/10 px-2 text-pink-100"
              onKeyDown={e => e.stopPropagation()}
              onChange={e => verifyAge(Number(e.target.value))}
            />
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 rounded bg-pink-400/20 px-4 py-2 font-bold text-pink-100 transition hover:bg-pink-400/40"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </NSFWContext.Provider>
  );
};
exports.NSFWProvider = NSFWProvider;
