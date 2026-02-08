import React, { useState, useEffect, useRef } from 'react';
import { Home, Plus, X, Gift, RotateCcw } from 'lucide-react';
import { db } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface Props {
  onBack: () => void;
}

const DEFAULT_PENALTIES = [
  "검은점 얼굴에 붙이기",
  "슬로우 모션으로 움직이기",
  "어깨로 자기이름 쓰기",
  "얼굴에 꽃받침하고 친구들보기",
  "펭귄처럼 아장아장 걷기",
  "양손으로 토끼 귀 만들고 세 번 뛰기",
  "친구들 향해 윙크 3번하기",
  "앉았다 일어서기 7회",
  "친구들 향해 큰절",
  "내 이름으로 3행시(말이 안되도 됨)"
];

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#FFE66D', '#1A535C', '#FF9F1C', 
  '#FF99C8', '#A9DEF9', '#E4C1F9', '#D0F4DE', '#FCF6BD'
];

export const PenaltyRoulette: React.FC<Props> = ({ onBack }) => {
  const [items, setItems] = useState<string[]>(DEFAULT_PENALTIES);
  const [newItem, setNewItem] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [showWinner, setShowWinner] = useState(false);
  
  // Audio Refs
  const spinAudioRef = useRef<HTMLAudioElement | null>(null);
  const winAudioRef = useRef<HTMLAudioElement | null>(null);

  // Load data from Firebase
  useEffect(() => {
    const loadPenalties = async () => {
      try {
        if (db) {
          const docRef = doc(db, "game_data", "penalty_v1");
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().items) {
            setItems(docSnap.data().items);
          }
        } else {
          // Fallback to localStorage
          const saved = localStorage.getItem('penalty_items');
          if (saved) setItems(JSON.parse(saved));
        }
      } catch (e) {
        console.error("Error loading penalties:", e);
      }
    };
    loadPenalties();
  }, []);

  const saveItems = async (newItems: string[]) => {
    setItems(newItems);
    localStorage.setItem('penalty_items', JSON.stringify(newItems));
    
    if (db) {
      try {
        await setDoc(doc(db, "game_data", "penalty_v1"), { items: newItems }, { merge: true });
      } catch (e) {
        console.error("Error saving penalties:", e);
      }
    }
  };

  const handleAddItem = () => {
    if (newItem.trim()) {
      saveItems([...items, newItem.trim()]);
      setNewItem('');
    }
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 2) {
      alert("최소 2개의 벌칙이 필요합니다!");
      return;
    }
    const newItems = items.filter((_, i) => i !== index);
    saveItems(newItems);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAddItem();
  };

  const spinWheel = () => {
    if (spinning || items.length < 2) return;

    setSpinning(true);
    setShowWinner(false);
    setWinner(null);

    // Random rotation: Current + 5-10 full spins + random offset
    const randomOffset = Math.random() * 360;
    const extraSpins = 360 * 5; // at least 5 spins
    const newRotation = rotation + extraSpins + randomOffset;
    
    setRotation(newRotation);

    // Play spin sound effect (simulated)
    // In a real browser environment without explicit user interaction on Audio, this might be blocked, 
    // but usually allowed inside a click handler. We'll skip complex audio implementation for stability.

    setTimeout(() => {
      setSpinning(false);
      calculateWinner(newRotation);
      setShowWinner(true);
    }, 4000); // 4 seconds spin duration matches CSS transition
  };

  const calculateWinner = (finalRotation: number) => {
    const degrees = finalRotation % 360;
    const sliceAngle = 360 / items.length;
    // The pointer is at the top (0 degrees visual, or -90 math). 
    // If the wheel rotates clockwise, the winning slice is the one that lands at the top.
    // Calculation: (360 - (degrees % 360)) / sliceAngle
    // However, CSS rotation starts at 0 (3 o'clock) usually or requires adjustment.
    // Let's assume standard CSS rotation where 0 is up if we adjust initial SVG.
    // With pointer at TOP:
    // A rotation of 0 means Item 0 is at top (if we render Item 0 starting at -90deg to +slice/2).
    // Let's rely on the visual rendering logic below.
    
    // In our rendering: Item 0 starts at -90deg (Top).
    // Wheel rotates clockwise.
    // effective angle at top pointer = (360 - (degrees % 360)) % 360.
    
    const effectiveAngle = (360 - degrees) % 360;
    const winningIndex = Math.floor(effectiveAngle / sliceAngle);
    setWinner(items[winningIndex]);
  };

  // Render SVG Wheel
  const renderWheel = () => {
    const radius = 200;
    const center = 200;
    const total = items.length;
    const sliceAngle = 360 / total;

    // Helper to calculate coordinates
    const getCoordinatesForPercent = (percent: number) => {
      const x = center + radius * Math.cos(2 * Math.PI * percent);
      const y = center + radius * Math.sin(2 * Math.PI * percent);
      return [x, y];
    };

    return (
      <svg viewBox="0 0 400 400" className="w-full h-full transform transition-transform duration-[4000ms] cubic-bezier(0.25, 0.1, 0.25, 1)" style={{ transform: `rotate(${rotation}deg)` }}>
        {items.map((item, index) => {
          // Adjust start angle so item 0 is centered at top (-90deg)
          // Actually simpler: Start at 0, rotate whole wheel -90deg via CSS parent or SVG transform?
          // Let's just create slices from 0 to 360. Item 0 is from 0 to sliceAngle.
          // Then we rotate the whole SVG -90deg so Item 0 starts at 3 o'clock -> 12 o'clock?
          // No, standard math: 0 is 3 o'clock. -0.25 is 12 o'clock.
          
          const startPercent = index / total;
          const endPercent = (index + 1) / total;
          
          const [startX, startY] = getCoordinatesForPercent(startPercent);
          const [endX, endY] = getCoordinatesForPercent(endPercent);
          
          const largeArcFlag = sliceAngle > 180 ? 1 : 0;
          
          const pathData = [
            `M ${center} ${center}`,
            `L ${startX} ${startY}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
            `Z`
          ].join(' ');

          return (
            <g key={index}>
              <path d={pathData} fill={COLORS[index % COLORS.length]} stroke="white" strokeWidth="2" />
              <text 
                x={center + (radius * 0.65) * Math.cos(2 * Math.PI * (startPercent + endPercent) / 2)} 
                y={center + (radius * 0.65) * Math.sin(2 * Math.PI * (startPercent + endPercent) / 2)} 
                fill="white"
                fontSize="16"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${((startPercent + endPercent) / 2) * 360 + 90}, ${center + (radius * 0.65) * Math.cos(2 * Math.PI * (startPercent + endPercent) / 2)}, ${center + (radius * 0.65) * Math.sin(2 * Math.PI * (startPercent + endPercent) / 2)})`}
                style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}
              >
                {item.length > 7 ? item.substring(0, 6) + '..' : item}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-[#FFF5F5] flex flex-col items-center p-4 md:p-8 animate-fade-in font-jua">
      {/* Header */}
      <div className="w-full max-w-7xl flex items-center justify-between mb-8">
        <button 
          onClick={onBack}
          className="px-5 py-2 bg-white rounded-xl shadow-md hover:shadow-lg text-slate-700 flex items-center gap-2 transition-all hover:scale-105"
        >
          <Home size={20} className="text-rose-500" />
          <span className="font-bold">홈으로</span>
        </button>
        <h1 className="text-4xl md:text-5xl text-rose-500 drop-shadow-sm" style={{ fontFamily: '"Black Han Sans", sans-serif' }}>
          벌칙 룰렛
        </h1>
        <div className="w-24"></div> {/* Spacer */}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl items-start h-full">
        {/* Left: Roulette Wheel */}
        <div className="flex-1 w-full flex flex-col items-center">
          <div className="relative w-[350px] h-[350px] md:w-[500px] md:h-[500px] mb-8">
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-rose-600 drop-shadow-xl"></div>
            
            {/* Wheel Container (Rotates -90deg initially to align Item 0 to right-of-top) */}
            <div className="w-full h-full rounded-full shadow-2xl overflow-hidden border-8 border-white bg-white" style={{ transform: 'rotate(-90deg)' }}>
               {renderWheel()}
            </div>
            
            {/* Center Cap */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full shadow-inner border-4 border-slate-100 z-10 flex items-center justify-center">
               <div className="w-12 h-12 bg-rose-100 rounded-full animate-pulse"></div>
            </div>
          </div>

          <button
            onClick={spinWheel}
            disabled={spinning}
            className={`
              text-3xl font-black-han px-16 py-6 rounded-full shadow-[0_10px_0_rgb(159,18,57)] active:shadow-none active:translate-y-[10px] transition-all
              ${spinning ? 'bg-slate-400 text-slate-200 cursor-not-allowed shadow-none translate-y-[10px]' : 'bg-gradient-to-r from-purple-500 to-rose-500 text-white hover:brightness-110'}
            `}
          >
            {spinning ? '돌아가는 중...' : '벌칙판 돌리기!'}
          </button>
        </div>

        {/* Right: Penalty List */}
        <div className="w-full lg:w-96 bg-white rounded-3xl p-6 shadow-xl border border-rose-100 flex flex-col h-[600px]">
          <div className="flex items-center gap-2 mb-4 text-rose-500 font-bold text-xl border-b border-rose-100 pb-4">
             <Gift />
             <span>벌칙 목록</span>
             <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full text-sm ml-auto">{items.length}개</span>
          </div>

          <div className="flex gap-2 mb-4">
            <input 
              type="text" 
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="새 벌칙 입력"
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
            <button 
              onClick={handleAddItem}
              className="bg-purple-500 hover:bg-purple-600 text-white p-3 rounded-xl transition-colors shadow-md"
            >
              <Plus />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
             {items.map((item, index) => (
               <div key={index} className="group flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-100">
                  <span className="text-slate-700 font-medium">{item}</span>
                  <button 
                    onClick={() => handleRemoveItem(index)}
                    className="text-slate-300 hover:text-rose-500 p-1 rounded-full hover:bg-rose-100 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <X size={18} />
                  </button>
               </div>
             ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-100 text-center">
             <button 
               onClick={() => saveItems(DEFAULT_PENALTIES)}
               className="text-slate-400 hover:text-slate-600 text-sm flex items-center justify-center gap-1 mx-auto"
             >
               <RotateCcw size={14} /> 기본 목록으로 초기화
             </button>
          </div>
        </div>
      </div>

      {/* Winner Modal */}
      {showWinner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
           <div className="bg-white rounded-[3rem] p-10 md:p-16 text-center shadow-2xl max-w-2xl w-full border-8 border-rose-200 animate-bounce-in relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-rose-100 to-transparent -z-10"></div>
              
              <div className="text-8xl mb-6 animate-pulse">🎉</div>
              <h2 className="text-4xl text-slate-400 font-jua mb-4">당첨된 벌칙은...</h2>
              <div className="text-5xl md:text-7xl text-rose-600 font-black-han break-keep leading-tight mb-10 drop-shadow-sm">
                {winner}
              </div>
              
              <button 
                onClick={() => setShowWinner(false)}
                className="bg-rose-500 hover:bg-rose-600 text-white text-2xl px-12 py-4 rounded-full font-bold shadow-lg transition-transform hover:scale-105"
              >
                확인
              </button>
           </div>
        </div>
      )}
    </div>
  );
};