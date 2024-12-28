'use client'
import { createContext, ReactNode, useContext, useState } from 'react';

type PlayerContextType = {
  player: number;
  setPlayer: (player: number) => void;
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

type Props = {
  player: number;
  children: ReactNode;
};

export const PlayerProvider = ({ player: initialPlayer, children }: Props) => {
  const [player, setPlayer] = useState(initialPlayer);

  return (
    <PlayerContext.Provider value={{ player, setPlayer }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);

  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }

  return context;
};