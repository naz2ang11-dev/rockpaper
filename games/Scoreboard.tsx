import React, { useState, useCallback } from 'react';
import { ArrowLeft, Trophy, Minus, RotateCcw, X } from 'lucide-react';

interface Props {
  onBack: () => void;
}

const TEAM_COLORS = [
  { bg: 'bg-red-500', hover: 'hover:bg-red-600', border: 'border-red-400', name: '빨강', text: 'text-red-900' },
  { bg: 'bg-blue-500', hover: 'hover:bg-blue-600', border: 'border-blue-400', name: '파랑', text: 'text-blue-900' },
  { bg: 'bg-green-500', hover: 'hover:bg-green-600', border: 'border-green-400', name: '초록', text: 'text-green-900' },
  { bg: 'bg-yellow-500', hover: 'hover:bg-yellow-600', border: 'border-yellow-400', name: '노랑', text: 'text-yellow-900' },
  { bg: 'bg-orange-500', hover: 'hover:bg-orange-600', border: 'border-orange-400', name: '주황', text: 'text-orange-900' },
  { bg: 'bg-purple-500', hover: 'hover:bg-purple-600', border: 'border-purple-400', name: '보라', text: 'text-purple-900' },
  { bg: 'bg-teal-400', hover: 'hover:bg-teal-500', border: 'border-teal-300', name: '민트', text: 'text-teal-900' },
  { bg: 'bg-pink-500', hover: 'hover:bg-pink-600', border: 'border-pink-400', name: '핑크', text: 'text-pink-900' }
];

export const Scoreboard: React.FC<Props> = ({ onBack }) => {
  const [step, setStep] = useState<'SETUP' | 'BOARD'>('SETUP');
  const [selectedTeams, setSelectedTeams] = useState<number>(0);
  const [scores, setScores] = useState<number[]>([]);
  const [sets, setSets] = useState<number[]>([]);

  // Sound Effects
  const playTone = useCallback((freq: number, type: OscillatorType, duration: number) => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.value = freq;
      osc.type = type;
      
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const playBeep = () => playTone(800, 'sine', 0.1);
  const playMinusBeep = () => playTone(400, 'sine', 0.15);
  const playSetBeep = () => playTone(1000, 'sine', 0.08);

  const handleStart = () => {
    if (selectedTeams > 0) {
      setScores(new Array(selectedTeams).fill(0));
      setSets(new Array(selectedTeams).fill(0));
      setStep('BOARD');
      playSetBeep();
    }
  };

  const updateScore = (index: number, delta: number) => {
    setScores(prev => {
      const newScores = [...prev];
      const newVal = Math.max(0, newScores[index] + delta);
      if (newVal !== newScores[index]) {
        if (delta > 0) playBeep();
        else playMinusBeep();
      }
      newScores[index] = newVal;
      return newScores;
    });
  };

  const resetScore = (index: number) => {
    setScores(prev => {
      const newScores = [...prev];
      newScores[index] = 0;
      return newScores;
    });
    playMinusBeep();
  };

  const updateSet = (index: number, delta: number) => {
    setSets(prev => {
      const newSets = [...prev];
      const newVal = Math.max(0, newSets[index] + delta);
      if (newVal !== newSets[index]) playSetBeep();
      newSets[index] = newVal;
      return newSets;
    });
  };

  // Use fixed positioning to take over the full screen, bypassing parent padding
  const fullScreenClass = "fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col";

  // Setup Screen
  if (step === 'SETUP') {
    return (
      <div className={`${fullScreenClass} items-center justify-center p-4 animate-fade-in`}>
        <button 
          onClick={onBack}
          className="absolute top-6 left-6 text-white/50 hover:text-white transition-colors flex items-center gap-2 z-10 p-2 rounded-lg hover:bg-white/10"
        >
           <ArrowLeft size={24} /> <span className="text-lg">나가기</span>
        </button>

        <div className="flex flex-col items-center max-w-4xl w-full">
          <h1 className="text-7xl md:text-9xl text-white mb-16 tracking-wider drop-shadow-2xl" style={{ fontFamily: '"Black Han Sans", sans-serif' }}>
            점수판
          </h1>
          
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 w-full max-w-2xl border border-white/20 shadow-2xl">
            <label className="block text-white/90 text-2xl mb-8 flex items-center gap-3">
              <Trophy className="text-yellow-400 w-8 h-8" /> 
              <span className="drop-shadow-md">팀 수 선택</span>
            </label>
            
            <div className="grid grid-cols-4 gap-4 mb-10">
              {[2, 3, 4, 5, 6, 7, 8].map(num => (
                <button
                  key={num}
                  onClick={() => setSelectedTeams(num)}
                  className={`
                    py-6 rounded-2xl text-2xl transition-all duration-200 border-2
                    ${selectedTeams === num 
                      ? 'bg-emerald-500 text-white border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.6)] scale-105 transform -translate-y-1' 
                      : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10 hover:text-white hover:border-white/20'}
                  `}
                >
                  {num}팀
                </button>
              ))}
            </div>

            <button
              onClick={handleStart}
              disabled={selectedTeams === 0}
              className={`
                w-full py-6 rounded-2xl text-3xl transition-all duration-300 transform shadow-xl
                ${selectedTeams > 0 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:scale-[1.02] hover:shadow-emerald-500/40 hover:from-emerald-400 hover:to-teal-400' 
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'}
              `}
            >
              🚀 시작하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Board Screen
  const getGridClass = () => {
    if (selectedTeams === 2) return 'grid-cols-2';
    if (selectedTeams === 3) return 'grid-cols-3';
    if (selectedTeams === 4) return 'grid-cols-2 grid-rows-2';
    if (selectedTeams <= 6) return 'grid-cols-3 grid-rows-2';
    return 'grid-cols-4 grid-rows-2'; // 7, 8
  };

  const getFontSize = (score: number) => {
    const digits = score.toString().length;
    // Massive fonts using container query minimum dimension units (cqmin)
    // This ensures numbers fit regardless of whether the cell is tall or wide
    if (digits === 1) return '50cqmin';
    if (digits === 2) return '35cqmin';
    return '25cqmin';
  };

  return (
    <div className={`${fullScreenClass} animate-fade-in`}>
      {/* Header - Minimalist and transparent */}
      <div className="flex justify-between items-center px-6 py-3 bg-black/30 border-b border-white/5 backdrop-blur-sm z-20">
        <h2 className="text-3xl text-white/90 drop-shadow-md ml-2" style={{ fontFamily: '"Black Han Sans", sans-serif' }}>점수판</h2>
        <div className="flex gap-3">
          <button 
            onClick={() => setStep('SETUP')}
            className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 border border-white/10"
          >
            <RotateCcw size={18} /> <span className="hidden sm:inline">다시하기</span>
          </button>
          <button 
            onClick={onBack}
            className="bg-red-500/20 hover:bg-red-500/40 text-red-100 px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 border border-red-500/20"
          >
            <X size={20} /> <span className="hidden sm:inline">종료</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className={`grid gap-1 p-1 flex-1 w-full h-full ${getGridClass()}`}>
        {Array.from({ length: selectedTeams }).map((_, i) => {
          const color = TEAM_COLORS[i % TEAM_COLORS.length];
          const isTwoTeamsSecond = selectedTeams === 2 && i === 1;

          return (
            <div 
              key={i}
              className={`
                ${color.bg} relative flex flex-col overflow-hidden group
                transition-colors active:brightness-110 cursor-pointer
                border-[3px] border-black/10 hover:border-white/20
                rounded-2xl shadow-inner
              `}
              style={{ containerType: 'size' }} // Enable container queries
              onClick={() => updateScore(i, 1)}
            >
               {/* Team Name Label */}
               <div className="absolute top-4 left-0 right-0 flex justify-center pointer-events-none">
                  <span className="bg-black/20 text-white/90 px-4 py-1 rounded-full text-lg md:text-xl backdrop-blur-sm shadow-sm">
                    {color.name}
                  </span>
               </div>

               {/* Set Score Controls - Enhanced Size */}
               <div 
                 className={`absolute top-4 ${isTwoTeamsSecond ? 'left-4 flex-row-reverse' : 'right-4 flex-row'} flex items-center gap-3 z-10`}
                 onClick={(e) => e.stopPropagation()}
               >
                 <button 
                   onClick={() => updateSet(i, -1)}
                   className="bg-black/20 hover:bg-black/40 text-white w-14 h-14 rounded-2xl flex items-center justify-center transition-colors active:scale-95"
                 >
                   <Minus size={28} strokeWidth={3} />
                 </button>
                 <div 
                   onClick={() => updateSet(i, 1)}
                   className="bg-black/20 hover:bg-black/40 text-white px-6 py-2 rounded-2xl flex flex-col items-center min-w-[5.5rem] cursor-pointer transition-colors active:scale-95 backdrop-blur-sm"
                 >
                   <span className="text-4xl leading-none drop-shadow-md">{sets[i]}</span>
                   <span className="text-xs uppercase tracking-wider opacity-80 mt-1">Set</span>
                 </div>
               </div>

               {/* Main Score Display */}
               <div className="flex-1 flex items-center justify-center w-full h-full pointer-events-none p-4">
                 <div 
                   className="text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.3)] leading-none select-none transition-all duration-100" 
                   style={{ 
                     fontFamily: '"Black Han Sans", sans-serif',
                     fontSize: getFontSize(scores[i]),
                     textShadow: '0 8px 16px rgba(0,0,0,0.2)'
                   }}
                 >
                   {scores[i]}
                 </div>
               </div>

               {/* Bottom Controls */}
               <div 
                 className={`absolute bottom-4 left-0 right-0 flex justify-center gap-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
                 onClick={(e) => e.stopPropagation()}
               >
                 <button 
                   onClick={() => updateScore(i, -1)}
                   className="bg-black/30 hover:bg-black/50 text-white px-6 py-3 rounded-xl text-xl backdrop-blur-md shadow-lg transition-transform hover:scale-105 active:scale-95 border border-white/10"
                 >
                   -1
                 </button>
                 <button 
                   onClick={() => resetScore(i)}
                   className="bg-black/30 hover:bg-black/50 text-white px-6 py-3 rounded-xl text-xl backdrop-blur-md shadow-lg transition-transform hover:scale-105 active:scale-95 border border-white/10"
                 >
                   0
                 </button>
               </div>
               
               {/* Mobile/Touch Hint (Always visible on touch, hidden if hover supported) */}
               <div className="absolute bottom-4 left-0 right-0 flex justify-center md:hidden pointer-events-none opacity-40">
                  <span className="bg-black/20 text-white text-xs px-2 py-1 rounded">터치하여 점수 +1</span>
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};