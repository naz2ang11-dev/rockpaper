import React from 'react';
import { MoveConfig } from '../types';

interface MoveCardProps {
  config: MoveConfig;
  isMain?: boolean;
}

export const MoveCard: React.FC<MoveCardProps> = ({ config, isMain = false }) => {
  if (isMain) {
    return (
      <div className={`flex flex-col items-center justify-center p-12 rounded-3xl bg-gradient-to-br ${config.bgStart} ${config.bgEnd} shadow-xl border-4 border-white/50 w-full max-w-sm mx-auto transition-all duration-500 animate-fade-in`}>
        <div className="text-[13rem] mb-6 filter drop-shadow-md transform transition-transform hover:scale-110 duration-300 leading-none">
          {config.emoji}
        </div>
        <h2 className={`text-5xl font-black ${config.color} tracking-tight`}>
          {config.label}
        </h2>
      </div>
    );
  }

  return (
    <div className={`flex items-center p-3 rounded-lg bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow`}>
      <span className="text-3xl mr-3">{config.emoji}</span>
      <div className="flex flex-col">
        <span className={`font-bold ${config.color}`}>{config.label}</span>
      </div>
    </div>
  );
};