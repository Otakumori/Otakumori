'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.signOut = exports.signIn = exports.handlers = exports.auth = void 0;
const next_auth_1 = __importDefault(require('next-auth'));
const react_1 = require('react');
const config_1 = require('./config');
const {
  auth: uncachedAuth,
  handlers,
  signIn,
  signOut,
} = (0, next_auth_1.default)(config_1.authConfig);
exports.handlers = handlers;
exports.signIn = signIn;
exports.signOut = signOut;
const auth = (0, react_1.cache)(uncachedAuth);
exports.auth = auth;
