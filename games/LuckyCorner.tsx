import React, { useState, useEffect, useRef } from 'react';
import { Home, Bomb, Skull, RotateCcw, Play } from 'lucide-react';

interface Props {
  onBack: () => void;
}

type Step = 'INTRO' | 'CHOICE' | 'EXPLOSION';

const CORNERS = [
  { id: 1, color: 'bg-red-600', label: '구석 1', positionClass: 'top-[20%] left-[5%]' },
  { id: 2, color: 'bg-yellow-500', label: '구석 2', positionClass: 'top-[20%] right-[5%]' },
  { id: 3, color: 'bg-green-600', label: '구석 3', positionClass: 'bottom-[10%] left-[5%]' },
  { id: 4, color: 'bg-blue-600', label: '구석 4', positionClass: 'bottom-[10%] right-[5%]' },
];

export const LuckyCorner: React.FC<Props> = ({ onBack }) => {
  const [step, setStep] = useState<Step>('INTRO');
  const [explodedId, setExplodedId] = useState<number | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const [round, setRound] = useState(1);
  const [showExplosionText, setShowExplosionText] = useState(false);

  const handleStart = () => {
    setStep('CHOICE');
    setExplodedId(null);
    setRound(1);
    setShowExplosionText(false);
  };

  const playExplosionSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const bufferSize = ctx.sampleRate * 2; // 2 seconds
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      // Generate white noise
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      
      // Filter for explosion sound (Lowpass)
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 1);
      
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      noise.start();
    } catch (e) {
      console.error("Audio play failed", e);
    }
  };

  const triggerExplosion = () => {
    setIsShuffling(true);
    setShowExplosionText(false);
    
    // Shuffle animation effect
    let count = 0;
    const interval = setInterval(() => {
      setExplodedId(Math.floor(Math.random() * 4) + 1);
      count++;
      if (count > 20) {
        clearInterval(interval);
        const finalId = Math.floor(Math.random() * 4) + 1;
        setExplodedId(finalId);
        setIsShuffling(false);
        setStep('EXPLOSION');
        setShowExplosionText(true);
        playExplosionSound();
      }
    }, 100);
  };

  const nextRound = () => {
    setStep('CHOICE');
    setExplodedId(null);
    setRound(prev => prev + 1);
    setShowExplosionText(false);
  };

  // --- Renders ---

  const renderIntro = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-6 animate-fade-in text-center relative bg-slate-900 text-white">
       <button 
          onClick={onBack}
          className="absolute top-6 left-6 px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-lg font-bold backdrop-blur-md border border-white/20 shadow-lg hover:scale-105 transition-all flex items-center gap-2 z-20"
          style={{ fontFamily: '"Jua", sans-serif' }}
       >
          <Home size={24} /> <span>홈으로</span>
       </button>
       
       <div className="text-9xl mb-6 animate-bounce">💣</div>
       <h1 className="text-6xl md:text-8xl text-white mb-6 drop-shadow-[0_0_15px_rgba(255,0,0,0.5)]" style={{ fontFamily: '"Black Han Sans", sans-serif' }}>
         나의 행운은?
       </h1>
       <p className="text-2xl text-slate-300 mb-10 font-jua">
         운명의 구석을 선택하고 끝까지 살아남으세요!
       </p>
       
       <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 max-w-3xl w-full mb-10 text-left border border-white/10 shadow-xl">
          <h3 className="text-3xl text-yellow-400 mb-6 font-black-han">📜 게임 규칙</h3>
          <ul className="space-y-4 text-xl text-slate-200 font-jua">
            <li className="flex items-start gap-3">
              <span className="text-2xl">1️⃣</span>
              <span>교실의 네 구석(1, 2, 3, 4번) 중 마음이 끌리는 한 곳으로 이동합니다.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">2️⃣</span>
              <span>선생님이 버튼을 누르면 <strong>한 구석에서 폭발</strong>이 일어납니다!</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">3️⃣</span>
              <span><strong className="text-red-400">폭발한 구석</strong>에 있는 학생들은 <strong className="text-red-400">자동 탈락</strong>하여 자기 자리에 앉습니다.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">4️⃣</span>
              <span>최후의 <strong>3인</strong>이 남을 때까지 게임을 계속 진행합니다.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <span className="text-yellow-200">주의: 구석 사이 애매한 위치에 서 있으면 탈락 처리됩니다! 확실하게 이동하세요.</span>
            </li>
          </ul>
       </div>

       <button
         onClick={handleStart}
         className="bg-red-600 text-white text-3xl px-16 py-6 rounded-full font-black-han hover:bg-red-500 hover:scale-105 transition-all shadow-[0_0_30px_rgba(220,38,38,0.6)] flex items-center gap-4"
       >
         <Play fill="currentColor" /> 게임 시작
       </button>
    </div>
  );

  const renderGameBoard = () => {
    return (
      <div className="flex-1 flex flex-col w-full h-full p-4 animate-fade-in relative bg-black text-white overflow-hidden">
         {/* Header */}
         <div className="flex justify-between items-center mb-4 z-20">
            <button 
               onClick={onBack}
               className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold flex items-center gap-2 border border-white/10"
               style={{ fontFamily: '"Jua", sans-serif' }}
            >
               <Home size={20} /> 홈으로
            </button>
            <div className="text-3xl font-black-han text-white drop-shadow-md">
               Round {round}
            </div>
            <div className="w-24"></div> {/* Spacer */}
         </div>

         {/* Classroom Layout */}
         <div className="flex-1 relative border-4 border-slate-700 rounded-3xl bg-slate-900/50 backdrop-blur-sm m-2 overflow-hidden shadow-2xl">
            
            {/* Blackboard Area */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-20 bg-slate-800 border-b-4 border-x-4 border-slate-600 rounded-b-xl flex items-center justify-center z-10">
               <span className="text-3xl font-jua text-slate-400 tracking-widest">칠 판</span>
            </div>

            {/* Teacher's Desk */}
            <div className="absolute top-32 left-12 w-40 h-24 bg-slate-700 border-2 border-slate-500 rounded-lg flex items-center justify-center z-10 transform -rotate-2 shadow-lg">
               <span className="text-xl font-jua text-slate-400">선생님 책상</span>
            </div>

            {/* Corners - Positioned Absolutely */}
            {CORNERS.map((corner) => {
              const isExploded = step === 'EXPLOSION' && explodedId === corner.id;
              const isSafe = step === 'EXPLOSION' && explodedId !== corner.id;
              const isHighlight = isShuffling && explodedId === corner.id;

              return (
                <div 
                  key={corner.id}
                  className={`
                    absolute w-64 h-64 rounded-full flex items-center justify-center transition-all duration-200 border-4 border-white/20 shadow-2xl
                    ${corner.positionClass}
                    ${isExploded ? 'bg-red-600 z-20 scale-125 shadow-[0_0_80px_rgba(220,38,38,0.9)]' : ''}
                    ${isSafe ? 'opacity-40 grayscale-[0.5]' : ''}
                    ${!isExploded && !isSafe ? corner.color : ''}
                    ${isHighlight ? 'brightness-150 scale-110' : ''}
                  `}
                >
                   {/* Corner Label */}
                   <div className="flex flex-col items-center">
                      <div className="text-7xl md:text-9xl font-black-han text-white drop-shadow-lg mb-2">
                         {corner.id}
                      </div>
                      <div className="text-3xl font-jua text-white/90">{corner.label}</div>
                   </div>

                   {/* Explosion Graphic */}
                   {isExploded && showExplosionText && (
                     <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="relative animate-bounce-in">
                           <Bomb size={200} className="text-black drop-shadow-2xl animate-pulse" />
                           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-yellow-400 font-black text-9xl whitespace-nowrap drop-shadow-[0_0_20px_rgba(0,0,0,1)] animate-ping-once">
                              펑!!
                           </div>
                        </div>
                     </div>
                   )}
                   
                   {/* Safe Graphic */}
                   {isSafe && (
                     <div className="absolute top-0 right-0 bg-green-500/90 text-white px-4 py-2 rounded-full text-xl font-bold shadow-lg transform translate-x-2 -translate-y-2">
                        생존
                     </div>
                   )}
                </div>
              );
            })}

            {/* Center Overlay for Instructions/Button */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <div className="pointer-events-auto z-30">
                  {step === 'CHOICE' && (
                    <div className="text-center animate-fade-in">
                       <div className="bg-black/70 backdrop-blur-md p-10 rounded-[3rem] border-2 border-white/20 shadow-2xl">
                          <h2 className="text-5xl font-black-han text-white mb-8">
                             이동해 주세요!
                          </h2>
                          <p className="text-2xl text-yellow-300 font-jua mb-10 animate-pulse">
                             네 구석 중 한 곳을 선택하세요
                          </p>
                          <button
                             onClick={triggerExplosion}
                             className="bg-red-600 text-white text-5xl px-16 py-8 rounded-full font-black-han hover:bg-red-500 hover:scale-110 transition-all shadow-[0_0_40px_rgba(220,38,38,0.6)] flex items-center gap-4 mx-auto"
                          >
                             <Bomb size={48} /> 폭발!
                          </button>
                       </div>
                    </div>
                  )}

                  {step === 'EXPLOSION' && !isShuffling && (
                    <div className="text-center animate-bounce-in mt-20">
                       <div className="bg-black/80 backdrop-blur-md p-10 rounded-[3rem] border-4 border-red-500 shadow-[0_0_60px_rgba(220,38,38,0.4)]">
                          <h2 className="text-6xl font-black-han text-red-500 mb-6 flex items-center justify-center gap-4">
                             <Skull size={64} /> {explodedId}번 구석 탈락!
                          </h2>
                          <p className="text-3xl text-white font-jua mb-10">
                             탈락한 학생들은 자리에 앉아주세요.
                          </p>
                          <button
                             onClick={nextRound}
                             className="bg-blue-600 text-white text-4xl px-12 py-6 rounded-full font-black-han hover:bg-blue-500 hover:scale-105 transition-all shadow-xl flex items-center gap-4 mx-auto"
                          >
                             <RotateCcw size={40} /> 다음 라운드
                          </button>
                       </div>
                    </div>
                  )}
               </div>
            </div>
         </div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Jua&family=Black+Han+Sans&display=swap');
        .font-jua { font-family: 'Jua', sans-serif; }
        .font-black-han { font-family: 'Black Han Sans', sans-serif; }
        @keyframes bounce-in {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); opacity: 1; }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        .animate-bounce-in { animation: bounce-in 0.6s cubic-bezier(0.215, 0.610, 0.355, 1.000) both; }
        
        @keyframes ping-once {
          0% { transform: scale(1); opacity: 1; }
          75% { transform: scale(2); opacity: 0; }
          100% { transform: scale(2); opacity: 0; }
        }
        .animate-ping-once { animation: ping-once 1s cubic-bezier(0, 0, 0.2, 1) forwards; }
      `}</style>
      <div className="min-h-screen w-full bg-black flex flex-col font-sans overflow-hidden">
        {step === 'INTRO' ? renderIntro() : renderGameBoard()}
      </div>
    </>
  );
};
