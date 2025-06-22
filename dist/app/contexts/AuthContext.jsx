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
exports.AuthProvider = AuthProvider;
exports.useAuth = useAuth;
const react_1 = __importStar(require('react'));
const AuthContext = (0, react_1.createContext)(undefined);
function AuthProvider({ children }) {
  const [user, setUser] = (0, react_1.useState)(null);
  const [isAuthenticated, setIsAuthenticated] = (0, react_1.useState)(false);
  const [isAgeVerified, setIsAgeVerified] = (0, react_1.useState)(false);
  (0, react_1.useEffect)(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const session = localStorage.getItem('userSession');
        if (session) {
          const userData = JSON.parse(session);
          setUser(userData);
          setIsAuthenticated(true);
          setIsAgeVerified(userData.ageVerified);
        }
      } catch (error) {
        console.error('Session check failed:', error);
      }
    };
    checkSession();
  }, []);
  const login = async (email, password) => {
    try {
      // TODO: Implement actual API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) throw new Error('Login failed');
      const userData = await response.json();
      setUser(userData);
      setIsAuthenticated(true);
      setIsAgeVerified(userData.ageVerified);
      localStorage.setItem('userSession', JSON.stringify(userData));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setIsAgeVerified(false);
    localStorage.removeItem('userSession');
  };
  const verifyAge = async dateOfBirth => {
    try {
      const birthDate = new Date(dateOfBirth);
      const age = calculateAge(birthDate);
      if (age < 18) {
        throw new Error('Must be 18 or older');
      }
      // TODO: Implement actual API call
      const response = await fetch('/api/auth/verify-age', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateOfBirth }),
      });
      if (!response.ok) throw new Error('Age verification failed');
      const updatedUser = { ...user, ageVerified: true };
      setUser(updatedUser);
      setIsAgeVerified(true);
      localStorage.setItem('userSession', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Age verification failed:', error);
      throw error;
    }
  };
  const updateUserProfile = async data => {
    try {
      // TODO: Implement actual API call
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Profile update failed');
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('userSession', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAgeVerified,
        login,
        logout,
        verifyAge,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
function useAuth() {
  const context = (0, react_1.useContext)(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
function calculateAge(birthDate) {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}
