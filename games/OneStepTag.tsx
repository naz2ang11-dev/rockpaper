import React, { useState, useCallback, useEffect } from 'react';
import { RefreshCw, Volume2, VolumeX, Swords, Shuffle, Repeat, ArrowLeft } from 'lucide-react';
import { Team, GameMode, TagHistoryItem } from '../types';

interface Props {
  onBack: () => void;
}

// Inline Footprints icon to avoid import issues with CDN
const FootprintsIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 11 3.8 11 8c0 2.85-1.67 5.12-4 5.89V16h2v2h-2v2H4v-2H2v-2h2z" />
    <path d="M14 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C8.63 6 7 7.8 7 12c0 2.85 1.67 5.12 4 5.89V20h-2v2h2v2h3v-2h2v-2h-2z" transform="translate(6, 2)" />
  </svg>
);

// --- Local Components ---

const GameCard = ({ team, isActive, isAnimating }: { team: 'RED' | 'BLUE'; isActive: boolean; isAnimating: boolean }) => {
  const isRed = team === 'RED';
  
  // Base styles
  const containerBase = `
    relative w-full aspect-square max-w-[450px] rounded-[3rem] flex flex-col items-center justify-center transition-all duration-300 ease-in-out border-8
  `;
  
  // Active vs Inactive styles
  const activeStyle = isRed 
    ? 'bg-red-600 shadow-xl shadow-red-200 scale-100 opacity-100 z-10 border-red-400/50' 
    : 'bg-blue-500 shadow-xl shadow-blue-200 scale-100 opacity-100 z-10 border-blue-400/50';

  const inactiveStyle = `bg-gray-100 shadow-inner scale-95 opacity-40 grayscale border-transparent`;

  const appliedStyle = isActive ? activeStyle : inactiveStyle;

  return (
    <div className={`${containerBase} ${appliedStyle} ${isAnimating && isActive ? 'animate-pulse' : ''}`}>
      {/* Decorative Stars (Only visible when active for flavor) */}
      {isActive && (
        <>
          <span className="absolute top-10 left-8 text-yellow-300 text-5xl animate-bounce" style={{ animationDelay: '0s' }}>✦</span>
          <span className="absolute top-16 right-10 text-yellow-300 text-4xl animate-bounce" style={{ animationDelay: '0.2s' }}>✦</span>
        </>
      )}

      {/* Main Text */}
      <h2 className={`font-jua text-5xl md:text-8xl tracking-tight mb-4 md:mb-8 ${isActive ? 'text-white drop-shadow-md' : 'text-gray-300'}`}>
        {isRed ? '빨강' : '파랑'}
      </h2>

      {/* Action Pill */}
      {isActive && (
        <div className={`
          flex items-center gap-2 md:gap-3 px-4 md:px-8 py-2 md:py-4 rounded-full 
          ${isRed ? 'bg-red-700/50 text-red-50' : 'bg-blue-700/50 text-blue-50'}
          backdrop-blur-sm border-2 border-white/20 shadow-sm
        `}>
          <FootprintsIcon className="w-4 h-4 md:w-6 md:h-6" />
          <span className="font-bold text-sm md:text-xl whitespace-nowrap">한 걸음 전진!</span>
        </div>
      )}
    </div>
  );
};

const HistoryLog = ({ history }: { history: TagHistoryItem[] }) => {
  const displayHistory = [...history].slice(0, 7); 

  return (
    <div className="w-full flex flex-col items-center space-y-4 mt-8">
      <span className="text-gray-500 font-semibold text-sm">이전 순서 (최신순)</span>
      
      {history.length === 0 ? (
        <div className="h-10 text-gray-400 text-sm flex items-center">기록이 없습니다</div>
      ) : (
        <div className="flex gap-3 justify-center flex-wrap px-4">
          {displayHistory.map((item, index) => (
            <div
              key={item.id}
              className={`
                w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md transition-all
                ${item.team === 'RED' ? 'bg-red-500' : 'bg-blue-500'}
                ${index === 0 ? 'scale-110 ring-2 ring-offset-2 ring-gray-300' : 'opacity-80'}
              `}
            >
              {item.turnNumber}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Main Component ---

export const OneStepTag: React.FC<Props> = ({ onBack }) => {
  const [currentTeam, setCurrentTeam] = useState<Team>(null);
  const [history, setHistory] = useState<TagHistoryItem[]>([]);
  const [mode, setMode] = useState<GameMode>(GameMode.SEQUENTIAL);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Calculate turn number based on history
  const turnCount = history.length;

  // Load history from LocalStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('tag_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse tag history", e);
      }
    }
  }, []);

  // Save history to LocalStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('tag_history', JSON.stringify(history));
  }, [history]);

  const handleReset = () => {
    if (window.confirm('정말로 모든 기록을 지우시겠습니까?')) {
      setHistory([]);
      setCurrentTeam(null);
      localStorage.removeItem('tag_history');
      if (isSoundOn) playClickSound();
    }
  };

  const getNextRandomTeam = (historyData: TagHistoryItem[]): Team => {
    // 1. Constraint: No more than 3 consecutive same colors (so max streak is 3)
    if (historyData.length >= 3) {
      const lastThree = historyData.slice(0, 3); // index 0 is newest
      const allRed = lastThree.every(h => h.team === 'RED');
      const allBlue = lastThree.every(h => h.team === 'BLUE');
      
      if (allRed) return 'BLUE';
      if (allBlue) return 'RED';
    }

    // 2. Constraint: Balanced distribution (Last 20 turns)
    const recentHistory = historyData.slice(0, 20);
    const redCount = recentHistory.filter(h => h.team === 'RED').length;
    const blueCount = recentHistory.filter(h => h.team === 'BLUE').length;
    
    // Base probability for Red
    let redChance = 0.5;

    // Adjust probability to restore balance (5% per unit of imbalance)
    const imbalance = redCount - blueCount;
    redChance -= (imbalance * 0.05);

    // Clamp between 20% and 80%
    redChance = Math.max(0.2, Math.min(0.8, redChance));

    return Math.random() < redChance ? 'RED' : 'BLUE';
  };

  const playClickSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      // Ignore audio errors
    }
  };

  const speakResult = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 1.0; 
    utterance.pitch = 1.0; 
    
    window.speechSynthesis.speak(utterance);
  };

  const handleAttack = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    if (isSoundOn) playClickSound();

    setTimeout(() => {
      let nextTeam: Team = 'RED';

      if (mode === GameMode.SEQUENTIAL) {
        const lastTeam = history.length > 0 ? history[0].team : null;
        nextTeam = lastTeam === 'RED' ? 'BLUE' : 'RED';
      } else {
        nextTeam = getNextRandomTeam(history);
      }

      const newItem: TagHistoryItem = {
        id: Date.now().toString(),
        team: nextTeam,
        turnNumber: turnCount + 1
      };

      setCurrentTeam(nextTeam);
      setHistory(prev => [newItem, ...prev]);
      
      if (isSoundOn) {
        speakResult(nextTeam === 'RED' ? '빨강 한걸음' : '파랑 한걸음');
      }

      setIsAnimating(false);
    }, 250);
  }, [history, mode, turnCount, isSoundOn, isAnimating]);

  return (
    <div className="w-full max-w-4xl flex flex-col items-center animate-fade-in px-4">
       {/* Header with Back Button */}
       <div className="w-full flex items-center justify-between mb-8">
        <button 
          onClick={onBack}
          className="px-4 py-2 text-slate-600 bg-white rounded-lg shadow-sm hover:bg-slate-50 transition-colors font-bold flex items-center"
        >
          <ArrowLeft className="w-5 h-5 mr-1" /> 뒤로가기
        </button>
        <span className="font-bold text-slate-400">체스 술래잡기</span>
      </div>

      {/* Main Game Area */}
      <div className="flex flex-row justify-center items-center gap-4 md:gap-8 w-full mb-10">
        <GameCard 
          team="RED" 
          isActive={currentTeam === 'RED'} 
          isAnimating={isAnimating && currentTeam === 'RED'}
        />
        <GameCard 
          team="BLUE" 
          isActive={currentTeam === 'BLUE'} 
          isAnimating={isAnimating && currentTeam === 'BLUE'}
        />
      </div>

      {/* Control Panel */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-6 flex flex-col gap-4 border border-gray-100">
        
        {/* Mode Toggles */}
        <div className="flex p-1 bg-gray-100 rounded-xl relative">
          <div 
            className={`absolute top-1 bottom-1 w-1/2 bg-white rounded-lg shadow-sm transition-all duration-300 ease-out ${mode === GameMode.SEQUENTIAL ? 'left-1' : 'left-[calc(50%-4px)] translate-x-[calc(0%+4px)]'}`}
          />
          <button 
            onClick={() => { if(isSoundOn) playClickSound(); setMode(GameMode.SEQUENTIAL); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold z-10 transition-colors ${mode === GameMode.SEQUENTIAL ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <Repeat className="w-4 h-4" />
            순서대로
          </button>
          <button 
            onClick={() => { if(isSoundOn) playClickSound(); setMode(GameMode.RANDOM); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold z-10 transition-colors ${mode === GameMode.RANDOM ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <Shuffle className="w-4 h-4" />
            랜덤
          </button>
        </div>

        {/* Attack Button */}
        <button
          onClick={handleAttack}
          disabled={isAnimating}
          className={`
            group relative overflow-hidden w-full py-5 rounded-2xl
            bg-gradient-to-r from-red-500 to-blue-600
            hover:from-red-600 hover:to-blue-700
            text-white shadow-lg shadow-blue-200
            transform transition-all duration-150 active:scale-95
            disabled:opacity-80 disabled:cursor-not-allowed
          `}
        >
          <div className="relative z-10 flex items-center justify-center gap-3">
            <Swords className={`w-8 h-8 ${isAnimating ? 'animate-spin' : ''}`} />
            <span className="text-3xl font-black font-jua tracking-wide">공격!</span>
          </div>
          {/* Shine effect */}
          <div className="absolute top-0 -left-full w-full h-full bg-white/20 skew-x-[-20deg] group-hover:animate-[shimmer_1s_infinite]" />
        </button>

        {/* Bottom Controls */}
        <div className="flex gap-3">
          <button
            onClick={() => { playClickSound(); setIsSoundOn(!isSoundOn); }}
            className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-colors ${isSoundOn ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}
          >
            {isSoundOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            {isSoundOn ? '음성 켜짐' : '음성 꺼짐'}
          </button>
          <button
            onClick={handleReset}
            className="w-14 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
            aria-label="Reset History"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* History */}
      <HistoryLog history={history} />
    </div>
  );
};