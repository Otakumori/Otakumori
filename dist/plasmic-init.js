'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.PLASMIC = void 0;
const loader_nextjs_1 = require('@plasmicapp/loader-nextjs');
const PlasmicButton_1 = __importDefault(require('./src/components/plasmic/PlasmicButton'));
exports.PLASMIC = (0, loader_nextjs_1.initPlasmicLoader)({
  projects: [
    {
      id: 'mrP2zECHvrcQqHfC1qmoVY', // ID of a project you are using
      token: 'dAgMEOlClx38YqcNB9PI2NCeN6FzuQ9035OIDGSTkFMnf5tX9NhtdtNLJuHNPoanZLcEoBdSiCGmrDVBWg', // API token for that project
    },
  ],
  preview: true,
});
// Register a custom button for use in Plasmic Studio
exports.PLASMIC.registerComponent(PlasmicButton_1.default, {
  name: 'PlasmicButton',
  props: {
    children: 'slot',
  },
});
