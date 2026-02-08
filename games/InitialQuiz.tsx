import React, { useState, useEffect, useCallback, useRef } from 'react';

interface Props {
  onBack: () => void;
}

// Styles for custom animations
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

export const InitialQuiz: React.FC<Props> = ({ onBack }) => {
  // Game States
  const [gameState, setGameState] = useState<'INTRO' | 'PLAYING'>('INTRO');
  const [teamCount, setTeamCount] = useState(4);
  const [scores, setScores] = useState<number[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState('ㄱㅂ');
  
  // Timer States
  const [timeLeft, setTimeLeft] = useState(10);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [showTimeout, setShowTimeout] = useState(false);
  const [showAnswerBtns, setShowAnswerBtns] = useState(false);
  const [showNextBtns, setShowNextBtns] = useState(false);
  const [showReady, setShowReady] = useState(false);
  const [animateQuiz, setAnimateQuiz] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Constants
  const consonants = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
  const vowels = ['ㅓ', 'ㅏ', 'ㅣ', 'ㅡ', 'ㅜ', 'ㅗ'];

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
    const isConsonant = Math.random() > 0.5;
    let quiz = '';
    
    if (isConsonant) {
      quiz = consonants[Math.floor(Math.random() * consonants.length)] + 
             consonants[Math.floor(Math.random() * consonants.length)];
    } else {
      quiz = vowels[Math.floor(Math.random() * vowels.length)] + 
             vowels[Math.floor(Math.random() * vowels.length)];
    }
    
    return quiz;
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
    const newQuiz = generateQuiz();
    setCurrentQuiz(newQuiz);
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
    setTimeLeft(10);
    setShowTimer(true);
    setIsTimerRunning(true);
    setShowReady(false);
    setShowAnswerBtns(false);
    setShowNextBtns(false);
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
    
    setTimeout(() => {
      setShowTimeout(false);
      setShowAnswerBtns(true);
    }, 1500);
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

  const handleCorrect = (teamIdx?: number) => {
    stopTimer();
    // If called from the main correct button (current turn logic omitted for simplicity in port, 
    // but we can add points manually via scoreboard). 
    // The original code Logic: answer-buttons hidden -> ready-message shown -> next-buttons shown
    
    setShowAnswerBtns(false);
    setShowReady(true);
    setShowNextBtns(true);
  };

  const handleWrong = () => {
    stopTimer();
    setShowAnswerBtns(false);
    setShowReady(true);
    setShowNextBtns(true);
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
    <div className="flex-1 flex flex-col items-center justify-center p-6 animate-fade-in">
      <h1 className="text-5xl md:text-7xl text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-300 to-cyan-300 drop-shadow-lg" style={{ fontFamily: '"Black Han Sans", sans-serif' }}>
        자음모음 맞추기 퀴즈
      </h1>
      
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 md:p-8 max-w-2xl w-full mb-8 border border-white/20">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-yellow-300">📖 게임 규칙</h2>
        <ul className="space-y-3 text-lg md:text-xl text-white">
          <li className="flex items-start gap-3">
            <span className="text-pink-400">🎲</span> 
            <span>자음이나 모음이 무작위로 나옵니다<br/>
              <span className="text-cyan-300 text-base">예) ㄹㅂ → 리본, 로봇, 루비 등등...</span><br/>
              <span className="text-cyan-300 text-base">예) ㅗㅗ → 로고, 보도, 조조, 고도, 포도 등등...</span> 
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-pink-400">⏱️</span> 
            <span>제한시간 <strong className="text-yellow-300">10초</strong> 안에 모둠원이 연달아서 새로운 단어를 말해야 합니다</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-pink-400">❌</span> 
            <span>10초 안에 대답을 못하거나 중복된 답을 말하면 다른 모둠이 같은 문제로 도전!</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-pink-400">🏆</span> 
            <span>정답을 맞출 시 <strong className="text-green-400">+10점</strong>, 게임 진행을 방해하면 <strong className="text-red-400">-10점</strong></span>
          </li>
        </ul>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 max-w-md w-full mb-8 border border-white/20">
        <h3 className="text-xl font-bold mb-4 text-center text-yellow-300">👥 팀 수 설정</h3>
        <div className="flex items-center justify-center gap-4">
          <button 
            onClick={() => teamCount > 2 && setTeamCount(c => c - 1)}
            className="w-14 h-14 rounded-full bg-pink-500 hover:bg-pink-600 text-white text-3xl font-bold transition-all hover:scale-110 active:scale-95 flex items-center justify-center pb-1"
          >−</button>
          <div className="text-5xl w-20 text-center text-white" style={{ fontFamily: '"Black Han Sans", sans-serif' }}>
            {teamCount}
          </div>
          <button 
            onClick={() => teamCount < 8 && setTeamCount(c => c + 1)}
            className="w-14 h-14 rounded-full bg-cyan-500 hover:bg-cyan-600 text-white text-3xl font-bold transition-all hover:scale-110 active:scale-95 flex items-center justify-center pb-1"
          >+</button>
        </div>
        <p className="text-center mt-3 text-white/70">2팀 ~ 8팀</p>
      </div>

      <button 
        onClick={startGame}
        className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 text-3xl px-12 py-4 rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
        style={{ fontFamily: '"Black Han Sans", sans-serif' }}
      > 
        🎮 게임 시작! 
      </button>
      
      <button 
        onClick={onBack}
        className="mt-6 text-white/60 hover:text-white underline"
      >
        뒤로 가기
      </button>
    </div>
  );

  const renderGame = () => (
    <div className="flex-1 flex flex-col h-full animate-fade-in">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-4 bg-black/20">
        <button 
          onClick={onBack} 
          className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold text-lg px-6 py-2 rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg"
        > 
          🏠 처음으로 
        </button>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Quiz Display */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 md:p-12 border-4 border-yellow-400/50 mb-6 min-w-[300px] text-center">
          <div 
            className={`text-7xl md:text-9xl text-center tracking-widest text-white drop-shadow-lg ${animateQuiz ? 'animate-bounce-in' : ''}`}
            style={{ fontFamily: '"Black Han Sans", sans-serif' }}
          >
            {currentQuiz}
          </div>
        </div>

        {/* Timer */}
        {showTimer && (
          <div className="flex flex-col items-center mb-6">
            <div className="text-2xl mb-2 text-white">남은 시간</div>
            <div 
              className={`text-8xl text-yellow-300 ${timeLeft <= 3 ? 'timer-critical' : ''}`}
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
          {!isTimerRunning && !showAnswerBtns && !showNextBtns && (
            <>
              <button 
                onClick={showQuiz}
                className="bg-purple-500 hover:bg-purple-600 text-white font-bold text-xl px-8 py-3 rounded-full transition-all hover:scale-105 active:scale-95"
              > 
                🔄 다른 문제 
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
                ⭕ 정답! 
              </button> 
              <button 
                onClick={handleWrong}
                className="bg-gradient-to-r from-red-400 to-rose-500 hover:from-red-500 hover:to-rose-600 text-white font-bold text-2xl px-10 py-4 rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg"
              > 
                ✖️ 틀림! 
              </button>
            </>
          )}

          {/* Next State */}
          {showNextBtns && (
            <>
              {!showAnswerBtns && ( // Show next quiz if correct
                 <button 
                   onClick={showQuiz}
                   className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white font-bold text-2xl px-10 py-4 rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg"
                 > 
                   ➡️ 다음 문제 제시 
                 </button>
              )}
               {/* Show retry if needed (Logic adapted: Original showed both differently based on correct/wrong)
                   Here simplified to show "Next" mainly, but can add "Retry" if wrong logic requires it specifically.
                   Actually let's stick to original behavior: 
                   Correct -> Next Quiz
                   Wrong -> Retry (Same Quiz)
               */}
               {showReady && ( // If ready message is showing, it means we just finished a round
                 <button 
                   onClick={startTimer}
                   className="bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 text-white font-bold text-2xl px-10 py-4 rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg ml-4"
                 > 
                   🔁 다시 도전 
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
      <div className="min-h-screen w-full bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 font-jua text-white flex flex-col">
        {gameState === 'INTRO' ? renderIntro() : renderGame()}
      </div>
    </>
  );
};