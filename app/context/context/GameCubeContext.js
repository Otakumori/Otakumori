/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
'use client';

import { createContext, useState, useContext } from 'react';

const GameCubeContext = createContext();

export function GameCubeProvider({ children }) {
  const [unlocks, setUnlocks] = useState([]);

  const unlockItem = item => {
    setUnlocks([...unlocks, item]);
  };

  return (
    <GameCubeContext.Provider value={{ unlocks, unlockItem }}>{children}</GameCubeContext.Provider>
  );
}

export const useGameCube = () => useContext(GameCubeContext);
