export type PetalStormDifficulty = 'easy' | 'normal' | 'hard' | 'expert';

export interface PetalStormTrackDefinition {
  id: string;
  bpm: number;
  duration: number;
  difficulty: PetalStormDifficulty;
}

export interface PetalStormNote {
  id: string;
  lane: number;
  time: number;
  type: 'normal' | 'hold' | 'slide';
  duration?: number;
  direction?: 'left' | 'right';
  hit?: boolean;
  accuracy?: 'perfect' | 'great' | 'good' | 'miss';
}

export const PETAL_STORM_CHART_VERSION = 'standard-v1';

function hashSeed(seed: string) {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandom(seed: string) {
  let state = hashSeed(seed);
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function density(difficulty: PetalStormDifficulty) {
  return { easy: 0.3, normal: 0.5, hard: 0.7, expert: 0.9 }[difficulty];
}

export function buildPetalStormChart(
  track: PetalStormTrackDefinition,
  options: { laneCount: number; preparationDelay: number },
): PetalStormNote[] {
  const random = seededRandom(`${track.id}:${track.difficulty}:${PETAL_STORM_CHART_VERSION}`);
  const noteInterval = 60_000 / track.bpm;
  const totalBeats = Math.floor((track.duration * 1000) / noteInterval);
  const notes: PetalStormNote[] = [];
  let sequence = 0;

  const addNote = (beat: number, lane: number, type: PetalStormNote['type'] = 'normal') => {
    const note: PetalStormNote = {
      id: `${PETAL_STORM_CHART_VERSION}:${track.id}:${sequence}`,
      lane,
      time: beat * noteInterval + options.preparationDelay,
      type,
    };
    sequence += 1;
    if (type === 'hold') note.duration = noteInterval * 2;
    if (type === 'slide') note.direction = random() < 0.5 ? 'left' : 'right';
    notes.push(note);
  };

  if (track.id === 'sakura-dreams') {
    const pattern = [[0, 2, 4], [1, 3], [0, 1, 2, 3, 4], [2]];
    for (let beat = 0; beat < totalBeats; beat += 1) {
      const beatInMeasure = beat % 4;
      if (beatInMeasure === 0 || beatInMeasure === 2 || random() < density(track.difficulty)) {
        for (const lane of pattern[beatInMeasure]) {
          if (lane < options.laneCount && random() < 0.7) addNote(beat, lane);
        }
      }
      if (beat % 8 === 7 && track.difficulty !== 'easy') {
        for (let lane = 0; lane < options.laneCount; lane += 1) addNote(beat, lane);
      }
    }
  } else {
    for (let beat = 0; beat < totalBeats; beat += 1) {
      if (random() >= density(track.difficulty)) continue;
      let type: PetalStormNote['type'] = 'normal';
      if (track.difficulty === 'hard' || track.difficulty === 'expert') {
        const typeRoll = random();
        if (typeRoll < 0.1) type = 'hold';
        else if (typeRoll < 0.15) type = 'slide';
      }
      addNote(beat, Math.floor(random() * options.laneCount), type);
    }
  }

  return notes.sort((left, right) => left.time - right.time || left.lane - right.lane);
}

export function validatePetalStormChart(notes: readonly PetalStormNote[], laneCount: number) {
  const errors: string[] = [];
  const ids = new Set<string>();
  let previousTime = -1;

  for (const note of notes) {
    if (ids.has(note.id)) errors.push(`Duplicate note ID: ${note.id}`);
    ids.add(note.id);
    if (!Number.isFinite(note.time) || note.time < previousTime) {
      errors.push(`Invalid note time: ${note.id}`);
    }
    if (!Number.isInteger(note.lane) || note.lane < 0 || note.lane >= laneCount) {
      errors.push(`Invalid lane: ${note.id}`);
    }
    previousTime = note.time;
  }

  return errors;
}
