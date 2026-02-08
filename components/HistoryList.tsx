import React from 'react';
import { HistoryItem, MOVES } from '../types';
import { MoveCard } from './MoveCard';

interface HistoryListProps {
  history: HistoryItem[];
  onClear: () => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ history, onClear }) => {
  if (history.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p className="text-lg">아직 기록이 없습니다.</p>
        <p className="text-sm mt-2">버튼을 눌러 시작해보세요!</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg text-slate-700 flex items-center">
          <span className="mr-2">📜</span> 히스토리 ({history.length})
        </h3>
        <button 
          onClick={onClear}
          className="text-xs text-slate-400 hover:text-red-500 px-2 py-1 rounded hover:bg-red-50 transition-colors"
        >
          기록 지우기
        </button>
      </div>
      
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {history.map((item) => (
          <div key={item.id} className="transform transition-all duration-300 hover:-translate-y-1">
             <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center space-x-4">
                  <span className="text-4xl">{MOVES[item.move].emoji}</span>
                  <div>
                    <p className={`text-lg ${MOVES[item.move].color}`}>
                      {MOVES[item.move].label}
                    </p>
                    <p className="text-xs text-slate-400">
                      {item.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className={`w-2 h-12 rounded-full bg-gradient-to-b ${MOVES[item.move].bgStart} ${MOVES[item.move].bgEnd}`}></div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};