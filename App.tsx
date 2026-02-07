import React, { useState, useCallback, useRef } from 'react';
import { Button } from './components/Button';
import { MoveCard } from './components/MoveCard';
import { HistoryList } from './components/HistoryList';
import { MOVES, MoveType, HistoryItem } from './types';

const App: React.FC = () => {
  const [currentMove, setCurrentMove] = useState<MoveType | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sound effect function using Web Audio API
  const playPopSound = useCallback(() => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;

      const audioCtx = new AudioContext();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      // "Pop" sound configuration
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.15);

      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  }, []);

  const generateRandomMove = useCallback(() => {
    // Play sound
    playPopSound();

    // Generate random move immediately without animation
    const moves = Object.keys(MOVES) as MoveType[];
    const finalMove = moves[Math.floor(Math.random() * moves.length)];
    setCurrentMove(finalMove);

    // Add to history
    const newItem: HistoryItem = {
      id: crypto.randomUUID(),
      move: finalMove,
      timestamp: new Date()
    };
    setHistory(prev => [newItem, ...prev]);
  }, [playPopSound]);

  const clearHistory = () => {
    if (window.confirm('정말로 모든 기록을 지우시겠습니까?')) {
      setHistory([]);
      setCurrentMove(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4">
      {/* Header */}
      <header className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-2 tracking-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">랜덤</span> 가위바위보
        </h1>
        <p className="text-slate-500 font-medium">
          버튼을 눌러 행운을 시험해보세요!
        </p>
      </header>

      {/* Main Game Area */}
      <main className="w-full max-w-md flex flex-col items-center space-y-8">
        
        {/* Display Area */}
        <div className="w-full min-h-[500px] flex items-center justify-center relative">
          {currentMove ? (
            <MoveCard config={MOVES[currentMove]} isMain={true} />
          ) : (
            <div className="flex flex-col items-center justify-center p-12 rounded-3xl bg-slate-200 border-4 border-slate-300 border-dashed w-full h-full min-h-[400px] text-slate-400">
               <span className="text-8xl mb-6 opacity-50">🎲</span>
               <span className="font-bold text-2xl">준비 완료</span>
            </div>
          )}
        </div>

        {/* Control */}
        <div className="w-full">
          <Button 
            onClick={generateRandomMove} 
            fullWidth
            className="text-lg py-4 shadow-xl shadow-indigo-200"
          >
            가위 바위 보!
          </Button>
        </div>

        {/* History Area */}
        <div className="w-full pt-8 border-t border-slate-200" ref={scrollRef}>
          <HistoryList history={history} onClear={clearHistory} />
        </div>

      </main>

      {/* Footer */}
      <footer className="mt-auto pt-10 text-center text-slate-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Random RPS Generator.</p>
      </footer>
    </div>
  );
};

export default App;