import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '../components/Button';
import { MoveCard } from '../components/MoveCard';
import { HistoryList } from '../components/HistoryList';
import { MOVES, MoveType, HistoryItem } from '../types';

interface Props {
  onBack: () => void;
}

export const RockPaperScissors: React.FC<Props> = ({ onBack }) => {
  const [currentMove, setCurrentMove] = useState<MoveType | null>(null);
  
  // Initialize history lazily from localStorage to prevent overwriting on mount
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const savedHistory = localStorage.getItem('rps_history');
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        return parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
      }
    } catch (e) {
      console.error("Failed to parse history", e);
    }
    return [];
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(true);

  // Sound effect function (Pop sound)
  const playPopSound = useCallback(() => {
    if (!isSoundOn) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;

      const audioCtx = new AudioContext();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

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
  }, [isSoundOn]);

  // Speech Synthesis Helper - Returns a Promise that resolves when speech ends
  const speak = useCallback((text: string, forceCancel: boolean = true, rate: number = 1.0) => {
    return new Promise<void>((resolve) => {
      // If sound is off or unsupported, wait a short moment for suspense then resolve
      if (!isSoundOn || !('speechSynthesis' in window)) {
        setTimeout(resolve, 600);
        return;
      }
      
      if (forceCancel) {
        window.speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = rate; 
      utterance.pitch = 1.0;
      
      // Resolve the promise when speech finishes
      const handleEnd = () => {
        resolve();
      };

      utterance.onend = handleEnd;
      utterance.onerror = handleEnd; // Safety fallback
      
      // Fallback timeout in case onend doesn't fire (e.g. some mobile browsers)
      setTimeout(handleEnd, 3000);
      
      window.speechSynthesis.speak(utterance);
    });
  }, [isSoundOn]);

  // Save history to LocalStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('rps_history', JSON.stringify(history));
  }, [history]);

  const generateRandomMove = useCallback(async () => {
    if (isLoading) return;

    playPopSound();
    setIsLoading(true);
    setCurrentMove(null); // Clear the screen immediately
    
    // 1. Speak "Gawi, Bawi, Bo" 
    // Increased rate to 1.7 (approx 1.2x faster than 1.4)
    // The await ensures we wait until speech finishes before showing result
    await speak("가위, 바위, 보!", true, 1.7);

    const moves = Object.keys(MOVES) as MoveType[];
    const finalMove = moves[Math.floor(Math.random() * moves.length)];
    setCurrentMove(finalMove);

    const newItem: HistoryItem = {
      id: crypto.randomUUID(),
      move: finalMove,
      timestamp: new Date()
    };

    setHistory(prev => [newItem, ...prev]);
    
    setIsLoading(false);
  }, [playPopSound, speak, isLoading]);

  const clearHistory = () => {
    if (window.confirm('정말로 모든 기록을 지우시겠습니까?')) {
      setHistory([]);
      setCurrentMove(null);
      // localStorage is automatically updated by the useEffect
    }
  };

  return (
    <div className="w-full max-w-md flex flex-col items-center space-y-8 animate-fade-in">
      {/* Header with Back Button */}
      <div className="w-full flex items-center justify-between mb-4">
        <button 
          onClick={onBack}
          className="px-4 py-2 text-slate-600 bg-white rounded-lg shadow-sm hover:bg-slate-50 transition-colors font-bold flex items-center"
        >
          ← 뒤로가기
        </button>
        <div className="flex items-center gap-2">
           <button
            onClick={() => setIsSoundOn(!isSoundOn)}
            className={`p-2 rounded-full transition-colors ${isSoundOn ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-400'}`}
            title={isSoundOn ? "음성 끄기" : "음성 켜기"}
          >
            {isSoundOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <span className="font-bold text-slate-400 hidden sm:inline">랜덤 가위바위보</span>
        </div>
      </div>

      <div className="w-full min-h-[500px] flex items-center justify-center relative">
        {currentMove ? (
          <MoveCard config={MOVES[currentMove]} isMain={true} />
        ) : (
          <div className="flex flex-col items-center justify-center p-12 rounded-3xl bg-slate-200 border-4 border-slate-300 border-dashed w-full h-full min-h-[400px] text-slate-400 transition-opacity duration-200">
             {!isLoading && (
               <>
                 <span className="text-8xl mb-6 opacity-50">🎲</span>
                 <span className="font-bold text-2xl">준비 완료</span>
               </>
             )}
          </div>
        )}
      </div>

      <div className="w-full">
        <Button 
          onClick={generateRandomMove} 
          disabled={isLoading}
          fullWidth
          className="text-lg py-4 shadow-xl shadow-indigo-200 disabled:opacity-70"
        >
          {isLoading ? '가위.. 바위.. 보!' : '가위 바위 보!'}
        </Button>
      </div>

      <div className="w-full pt-8 border-t border-slate-200" ref={scrollRef}>
        <HistoryList history={history} onClear={clearHistory} />
      </div>
    </div>
  );
};