import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Home, Users, Clock } from 'lucide-react';

interface Props {
  onBack: () => void;
}

const TOPICS = [
  "산", "직업", "색깔", "우리반 친구 이름(내이름빼고)", "다른반 친구 이름", 
  "교과서 종류", "지금까지 담임선생님 이름", "과자", "브랜드이름", "연예인", 
  "교실에 있는 물건", "나라 이름", "수도 이름", "과일", "채소", "육상 동물", 
  "바다 생물", "곤충 이름", "꽃 이름", "나무 이름", "운동 종목", "필통 속 학용품", 
  "학교 특별실 이름", "급식 메뉴", "라면 종류", "아이스크림 이름", "음료수 이름", 
  "편의점 물건", "게임 캐릭터 이름", "만화", "영화", "교통수단", "가전제품", 
  "몸 부위 명칭", "감정 단어", "악기 이름", "우리나라 도시 이름", "위인 이름", 
  "전래동화 제목", "사계절 단어", "태양계 행성", "열두 띠 동물", "옷 종류", 
  "가구 이름", "주방 용품", "욕실 용품", "날씨 관련 단어", "취미", 
  "유튜브 채널 이름", "가고 싶은 여행지", "무서운 것", "내가 잘하는 것", 
  "아침에 일어나서 하는 일", "가방 속에 있는 것", "어제 먹은 음식", 
  "내가 좋아하는 게임", "나중에 사고 싶은 것", "우리 동네 맛집 이름", 
  "보드게임 종류", "칭찬할 때 쓰는 말", "햄버거 브랜드", "피자 브랜드", 
  "카페 음료 메뉴", "스마트폰 앱 이름", "웹툰", "담임선생님과 닮은 연예인"
];

const styles = `
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 20px rgba(255, 107, 107, 0.5); }
    50% { box-shadow: 0 0 40px rgba(255, 107, 107, 0.8); }
  }
  @keyframes bounce-in {
    0% { transform: scale(0.3); opacity: 0; }
    50% { transform: scale(1.05); }
    70% { transform: scale(0.9); }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }
  .animate-pulse-glow {
    animation: pulse-glow 1s ease-in-out infinite;
  }
  .animate-bounce-in {
    animation: bounce-in 0.5s ease-out;
  }
  .animate-shake {
    animation: shake 0.5s ease-in-out;
  }
  .timer-critical {
    color: #ef4444;
    animation: shake 0.3s ease-in-out infinite;
  }
`;

export const RelayTalk: React.FC<Props> = ({ onBack }) => {
  // Game States
  const [gameState, setGameState] = useState<'INTRO' | 'PLAYING'>('INTRO');
  const [teamCount, setTeamCount] = useState(4);
  const [targetCount, setTargetCount] = useState(5); // Difficulty: Word Count & Seconds (Default 5)
  const [scores, setScores] = useState<number[]>([]);
  const [currentTopic, setCurrentTopic] = useState('');
  
  // Timer States
  const [timeLeft, setTimeLeft] = useState(5);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [showTimeout, setShowTimeout] = useState(false);
  const [showAnswerBtns, setShowAnswerBtns] = useState(false);
  const [showNextBtns, setShowNextBtns] = useState(false);
  const [showReady, setShowReady] = useState(false);
  const [animateQuiz, setAnimateQuiz] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getTeamColor = (index: number) => {
    const colors = [
      'from-red-500/80 to-red-700/80',
      'from-blue-500/80 to-blue-700/80',
      'from-green-500/80 to-green-700/80',
      'from-yellow-500/80 to-yellow-700/80',
      'from-purple-500/80 to-purple-700/80',
      'from-pink-500/80 to-pink-700/80',
      'from-cyan-500/80 to-cyan-700/80',
      'from-orange-500/80 to-orange-700/80'
    ];
    return colors[index % colors.length];
  };

  // Audio Logic
  const playTimeoutSound = useCallback(() => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.5);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      console.error("Audio play failed", e);
    }
  }, []);

  // Logic
  const generateQuiz = () => {
    return TOPICS[Math.floor(Math.random() * TOPICS.length)];
  };

  const initScores = () => {
    setScores(Array(teamCount).fill(0));
  };

  const startGame = () => {
    setGameState('PLAYING');
    initScores();
    showQuiz();
  };

  const showQuiz = () => {
    const newTopic = generateQuiz();
    setCurrentTopic(newTopic);
    setAnimateQuiz(true);
    setTimeout(() => setAnimateQuiz(false), 500);
    
    // Reset view states
    setShowReady(false);
    setShowNextBtns(false);
    setShowTimeout(false);
    setShowAnswerBtns(false);
    setShowTimer(false);
  };

  const startTimer = () => {
    setTimeLeft(targetCount); // Use the selected difficulty time
    setShowTimer(true);
    setIsTimerRunning(true);
    setShowReady(false);
    setShowAnswerBtns(false);
    setShowNextBtns(false);
    setShowTimeout(false);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsTimerRunning(false);
  };

  const handleTimeout = () => {
    stopTimer();
    playTimeoutSound();
    setShowTimeout(true);
    setShowTimer(false);
    setShowAnswerBtns(true);
  };

  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      handleTimeout();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, timeLeft]);

  const handleCorrect = () => {
    stopTimer();
    setShowAnswerBtns(false);
    setShowReady(true);
    setShowNextBtns(true);
    setShowTimeout(false);
  };

  const handleWrong = () => {
    stopTimer();
    setShowAnswerBtns(false);
    setShowReady(true);
    setShowNextBtns(true);
    setShowTimeout(false);
  };

  const updateScore = (idx: number, delta: number) => {
    setScores(prev => {
      const newScores = [...prev];
      newScores[idx] += delta;
      return newScores;
    });
  };

  const resetTeamScore = (idx: number) => {
    setScores(prev => {
      const newScores = [...prev];
      newScores[idx] = 0;
      return newScores;
    });
  };

  // Render Helpers
  const renderIntro = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-6 animate-fade-in relative">
      <button 
        onClick={onBack}
        className="absolute top-6 left-6 px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-lg font-bold backdrop-blur-md border border-white/20 shadow-lg hover:scale-105 transition-all flex items-center gap-2"
      >
        <Home size={24} /> <span>홈으로</span>
      </button>

      <h1 className="text-5xl md:text-7xl text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-rose-300 to-yellow-300 drop-shadow-lg" style={{ fontFamily: '"Black Han Sans", sans-serif' }}>
        줄줄이 말해요
      </h1>
      
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 md:p-8 max-w-2xl w-full mb-6 border border-white/20">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-yellow-300">📖 게임 규칙</h2>
        <ul className="space-y-3 text-lg md:text-xl text-white">
          <li className="flex items-start gap-3">
            <span className="text-pink-400">🗣️</span> 
            <span>주제가 제시되면 <strong>{targetCount}명이 줄줄이</strong> 말해야 합니다.<br/>
              <span className="text-yellow-200 text-base">예) 주제 '산' → 백두산, 한라산, 지리산, 설악산...</span>
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-pink-400">⏱️</span> 
            <span>난이도 설정에 따라 <strong>{targetCount}초 내에 {targetCount}명</strong>이 말해야 합니다.<br/>
            <span className="text-sm opacity-80">(기본 설정: 5명 / 5초)</span>
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-pink-400">⚠️</span> 
            <span>앞 사람이 말한 것과 <strong>중복된 정답</strong>은 인정되지 않습니다.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-pink-400">🏆</span> 
            <span>성공 시 <strong className="text-green-400">+10점</strong>, 경기 진행 방해 시 <strong className="text-red-400">-10점</strong></span>
          </li>
        </ul>
      </div>

      <div className="flex gap-6 mb-8 w-full max-w-2xl justify-center">
        {/* Team Count Setting */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 flex-1 border border-white/20 flex flex-col items-center">
          <h3 className="text-xl font-bold mb-4 text-center text-yellow-300 flex items-center gap-2">
            <Users size={24}/> 팀 수
          </h3>
          <div className="flex items-center justify-center gap-4">
            <button 
              onClick={() => teamCount > 2 && setTeamCount(c => c - 1)}
              className="w-12 h-12 rounded-full bg-pink-500 hover:bg-pink-600 text-white text-2xl font-bold transition-all hover:scale-110 active:scale-95 flex items-center justify-center pb-1"
            >−</button>
            <div className="text-4xl w-16 text-center text-white" style={{ fontFamily: '"Black Han Sans", sans-serif' }}>
              {teamCount}
            </div>
            <button 
              onClick={() => teamCount < 8 && setTeamCount(c => c + 1)}
              className="w-12 h-12 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-2xl font-bold transition-all hover:scale-110 active:scale-95 flex items-center justify-center pb-1"
            >+</button>
          </div>
          <p className="text-center mt-2 text-white/70 text-sm">2팀 ~ 8팀</p>
        </div>

        {/* Difficulty Setting */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 flex-1 border border-white/20 flex flex-col items-center">
          <h3 className="text-xl font-bold mb-4 text-center text-green-300 flex items-center gap-2">
            <Clock size={24}/> 난이도(초/개수)
          </h3>
          <div className="flex items-center justify-center gap-4">
            <button 
              onClick={() => targetCount > 4 && setTargetCount(c => c - 1)}
              className="w-12 h-12 rounded-full bg-teal-500 hover:bg-teal-600 text-white text-2xl font-bold transition-all hover:scale-110 active:scale-95 flex items-center justify-center pb-1"
            >−</button>
            <div className="text-4xl w-16 text-center text-white" style={{ fontFamily: '"Black Han Sans", sans-serif' }}>
              {targetCount}
            </div>
            <button 
              onClick={() => targetCount < 8 && setTargetCount(c => c + 1)}
              className="w-12 h-12 rounded-full bg-cyan-500 hover:bg-cyan-600 text-white text-2xl font-bold transition-all hover:scale-110 active:scale-95 flex items-center justify-center pb-1"
            >+</button>
          </div>
          <p className="text-center mt-2 text-white/70 text-sm">{targetCount}명 / {targetCount}초</p>
        </div>
      </div>

      <button 
        onClick={startGame}
        className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white text-3xl px-12 py-4 rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
        style={{ fontFamily: '"Black Han Sans", sans-serif' }}
      > 
        🎮 게임 시작! 
      </button>
    </div>
  );

  const renderGame = () => (
    <div className="flex-1 flex flex-col h-full animate-fade-in">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-4 bg-black/20">
        <button 
          onClick={onBack} 
          className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold text-lg px-6 py-2 rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg flex items-center gap-2"
        > 
          <Home size={20} /> <span>홈으로</span> 
        </button>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Quiz Display */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 md:p-12 border-4 border-rose-400/50 mb-6 min-w-[300px] text-center w-full max-w-5xl">
          <p className="text-yellow-300 text-2xl mb-4 font-jua">이번 주제</p>
          <div 
            className={`text-[5rem] md:text-[8rem] text-center text-white drop-shadow-lg ${animateQuiz ? 'animate-bounce-in' : ''} break-keep leading-tight`}
            style={{ fontFamily: '"Jua", sans-serif' }}
          >
            {currentTopic}
          </div>
        </div>

        {/* Timer */}
        {showTimer && (
          <div className="flex flex-col items-center mb-6">
            <div className="text-2xl mb-2 text-white">남은 시간</div>
            <div 
              className={`text-8xl text-yellow-300 ${timeLeft <= 2 ? 'timer-critical' : ''}`}
              style={{ fontFamily: '"Black Han Sans", sans-serif' }}
            >
              {timeLeft}
            </div>
          </div>
        )}

        {/* Messages */}
        {showReady && (
          <div className="text-center mb-6">
            <div className="text-5xl text-yellow-300 animate-bounce-in" style={{ fontFamily: '"Black Han Sans", sans-serif' }}>
              준비!
            </div>
          </div>
        )}

        {showTimeout && (
          <div className="text-center mb-6">
            <div className="text-6xl md:text-8xl text-red-500 animate-bounce-in drop-shadow-2xl" style={{ fontFamily: '"Black Han Sans", sans-serif' }}>
              ⏰ 시간 종료!
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap justify-center gap-4 min-h-[80px]">
          {/* Default State */}
          {!isTimerRunning && !showAnswerBtns && !showNextBtns && !showTimeout && (
            <>
              <button 
                onClick={showQuiz}
                className="bg-purple-500 hover:bg-purple-600 text-white font-bold text-xl px-8 py-3 rounded-full transition-all hover:scale-105 active:scale-95"
              > 
                🔄 다른 주제 
              </button> 
              <button 
                onClick={startTimer}
                className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-bold text-xl px-8 py-3 rounded-full transition-all hover:scale-105 active:scale-95"
              > 
                ▶️ 타이머 시작 
              </button>
            </>
          )}

          {/* Answer State */}
          {showAnswerBtns && (
            <>
              <button 
                onClick={() => handleCorrect()}
                className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-bold text-2xl px-10 py-4 rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg"
              > 
                ⭕ 성공! 
              </button> 
              <button 
                onClick={handleWrong}
                className="bg-gradient-to-r from-red-400 to-rose-500 hover:from-red-500 hover:to-rose-600 text-white font-bold text-2xl px-10 py-4 rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg"
              > 
                ✖️ 실패! 
              </button>
            </>
          )}

          {/* Next State */}
          {showNextBtns && (
            <>
              {!showAnswerBtns && (
                 <button 
                   onClick={showQuiz}
                   className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white font-bold text-2xl px-10 py-4 rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg"
                 > 
                   ➡️ 다음 주제 제시 
                 </button>
              )}
               {showReady && (
                 <button 
                   onClick={startTimer}
                   className="bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 text-white font-bold text-2xl px-10 py-4 rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg ml-4"
                 > 
                   🔁 같은 문제로 다시 도전 
                 </button>
               )}
            </>
          )}
        </div>
      </div>

      {/* Scoreboard */}
      <div className="bg-black/40 backdrop-blur-md border-t-2 border-white/20 p-4">
        <div className="flex flex-wrap justify-center gap-3 max-w-6xl mx-auto">
          {scores.map((score, i) => (
            <div key={i} className={`bg-gradient-to-b ${getTeamColor(i)} rounded-xl p-3 min-w-[140px] transition-all text-white`}>
              <div className="text-center">
                <div className="font-bold text-lg mb-1">{i + 1}팀</div>
                <div className="text-3xl mb-2" style={{ fontFamily: '"Black Han Sans", sans-serif' }}>{score}점</div>
                <div className="flex justify-center gap-1">
                  <button onClick={() => updateScore(i, 10)} className="bg-green-500 hover:bg-green-600 text-white text-sm px-2 py-1 rounded transition-all hover:scale-105 active:scale-95">+10</button>
                  <button onClick={() => updateScore(i, -10)} className="bg-red-500 hover:bg-red-600 text-white text-sm px-2 py-1 rounded transition-all hover:scale-105 active:scale-95">-10</button>
                  <button onClick={() => resetTeamScore(i)} className="bg-gray-500 hover:bg-gray-600 text-white text-sm px-2 py-1 rounded transition-all hover:scale-105 active:scale-95">↺</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <style>{styles}</style>
      <div className="min-h-screen w-full bg-gradient-to-br from-rose-900 via-pink-900 to-purple-900 font-jua text-white flex flex-col">
        {gameState === 'INTRO' ? renderIntro() : renderGame()}
      </div>
    </>
  );
};