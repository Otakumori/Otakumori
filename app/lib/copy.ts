// app/lib/copy.ts
export const COPY = {
  loading: {
    summon: 'Summoning your character...',
    error: 'Something went wrong while loading.',
  },
  character: {
    create: 'Create Character',
    edit: 'Edit Character',
    save: 'Save Character',
    reset: 'Reset to Default',
    delete: 'Delete Character',
  },
  ui: {
    close: 'Close',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    loading: 'Loading...',
  },
  errors: {
    generic: 'Something went wrong. Please try again.',
    network: 'Network error. Please check your connection.',
    validation: 'Please check your input and try again.',
  },
  games: {
    backToHub: 'Back to Hub',
    bubbleGirl: 'Pop bubbles and collect rewards in this relaxing gacha-style game!',
    memoryMatch: 'Test your memory with anime character pairs. Find all matches to win!',
    petalSamurai: 'Slice falling petals with perfect timing. Chain combos for bonus rewards!',
    puzzleReveal:
      'Solve puzzles to reveal hidden anime artwork. Each piece brings you closer to victory!',
    minigamesIntro: 'Welcome to the mini-games hub! Choose your adventure and test your skills.',
  },
  site: {
    subtleMove: 'A subtle move in the right direction...',
  },
} as const;
