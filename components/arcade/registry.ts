import type { EngineGame } from './types';
import SlapTheOni from './games/SlapTheOni';
import ChokeTheController from './games/ChokeTheController';
import PantyRaid from './games/PantyRaid';
import PetalLick from './games/PetalLick';
import JoJoThrust from './games/JoJoThrust';
import BlossomBounce from './games/BlossomBounce';
import NekoLapDance from './games/NekoLapDance';
import BlowTheCartridge from './games/BlowTheCartridge';
import ThighTrap from './games/ThighTrap';
import ButtonMashersKiss from './games/ButtonMashersKiss';
import TemporalPuzzle from './games/TemporalPuzzle';

export const GAMES: EngineGame[] = [
  { id: 'slap-oni', label: 'Slap the Oni', durationSec: 4, component: SlapTheOni },
  {
    id: 'choke-controller',
    label: 'Choke the Controller',
    durationSec: 5,
    component: ChokeTheController,
  },
  { id: 'panty-raid', label: 'Panty Raid (Pixel Edition)', durationSec: 6, component: PantyRaid },
  { id: 'petal-lick', label: 'Petal Lick', durationSec: 3, component: PetalLick },
  { id: 'jojo-thrust', label: 'JoJo Thrust', durationSec: 7, component: JoJoThrust },
  { id: 'blossom-bounce', label: 'Blossom Bounce', durationSec: 8, component: BlossomBounce },
  { id: 'neko-lap-dance', label: 'Neko Lap Dance', durationSec: 5, component: NekoLapDance },
  {
    id: 'blow-cartridge',
    label: 'Blow the Cartridge',
    durationSec: 4,
    component: BlowTheCartridge,
  },
  { id: 'thigh-trap', label: 'Thigh Trap', durationSec: 6, component: ThighTrap },
  {
    id: 'button-kiss',
    label: "Button Masher's Kiss",
    durationSec: 5,
    component: ButtonMashersKiss,
  },
  {
    id: 'temporal-puzzle',
    label: 'Temporal Puzzle',
    durationSec: 60,
    component: TemporalPuzzle,
  },
];

// Individual game exports for standalone pages
export const STANDALONE_GAMES = {
  'petal-storm-rhythm': {
    id: 'petal-storm',
    label: 'Petal Storm Rhythm',
    durationSec: 120,
    component: SlapTheOni,
  },
  'maid-cafe-manager': {
    id: 'maid-cafe',
    label: 'Maid Café Manager',
    durationSec: 150,
    component: ChokeTheController,
  },
  'thigh-coliseum': {
    id: 'thigh-coliseum',
    label: 'Thigh Coliseum',
    durationSec: 180,
    component: ThighTrap,
  },
  'dungeon-of-desire': {
    id: 'dungeon-desire',
    label: 'Dungeon of Desire',
    durationSec: 210,
    component: ButtonMashersKiss,
  },
};
