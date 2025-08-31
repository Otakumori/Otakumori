/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
import { initPlasmicLoader } from '@plasmicapp/loader-nextjs';
import PlasmicButton from './app/components/components/plasmic/PlasmicButton';

export const PLASMIC = initPlasmicLoader({
  projects: [
    {
      id: 'mrP2zECHvrcQqHfC1qmoVY', // ID of a project you are using
      token: 'dAgMEOlClx38YqcNB9PI2NCeN6FzuQ9035OIDGSTkFMnf5tX9NhtdtNLJuHNPoanZLcEoBdSiCGmrDVBWg', // API token for that project
    },
  ],
  preview: true,
});

// Register a custom button for use in Plasmic Studio
PLASMIC.registerComponent(PlasmicButton, {
  name: 'PlasmicButton',
  props: {
    children: 'slot',
  },
});
