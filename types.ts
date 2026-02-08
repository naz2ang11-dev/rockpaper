
export type MoveType = 'SCISSORS' | 'ROCK' | 'PAPER';

export interface MoveConfig {
  type: MoveType;
  label: string;
  emoji: string;
  color: string;
  bgStart: string;
  bgEnd: string;
}

export interface HistoryItem {
  id: string;
  move: MoveType;
  timestamp: Date;
}

// Types for One Step Tag Game
export type Team = 'RED' | 'BLUE' | null;

export enum GameMode {
  SEQUENTIAL = 'SEQUENTIAL',
  RANDOM = 'RANDOM'
}

export interface TagHistoryItem {
  id: string;
  team: Team;
  turnNumber: number;
}

export type GameId = 'HOME' | 'RPS' | 'TAG' | 'SCOREBOARD';

export interface GameInfo {
  id: GameId;
  title: string;
  description: string;
  emoji: string;
  color: string;
}

export const MOVES: Record<MoveType, MoveConfig> = {
  SCISSORS: {
    type: 'SCISSORS',
    label: '가위',
    emoji: '✌️',
    color: 'text-yellow-600',
    bgStart: 'from-yellow-100',
    bgEnd: 'to-yellow-200'
  },
  ROCK: {
    type: 'ROCK',
    label: '바위',
    emoji: '✊',
    color: 'text-stone-600',
    bgStart: 'from-stone-100',
    bgEnd: 'to-stone-200'
  },
  PAPER: {
    type: 'PAPER',
    label: '보',
    emoji: '✋',
    color: 'text-blue-600',
    bgStart: 'from-blue-100',
    bgEnd: 'to-blue-200'
  }
};