import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Home } from 'lucide-react';

interface Props {
  onBack: () => void;
}

const WORDS = [
  "고슴도치", "나무늘보", "개미핥기", "바다사자", "바다표범", "불가사리", "미꾸라지", "카멜레온", 
  "이구아나", "귀뚜라미", "딱정벌레", "무당벌레", "쇠똥구리", "반딧불이", "바퀴벌레", "하루살이", 
  "소금쟁이", "장구벌레", "진달래꽃", "무궁화꽃", "민들레꽃", "채송화꽃", "해바라기", "코스모스", 
  "장미꽃밭", "초등학교", "백과사전", "국어사전", "영어사전", "수학여행", "현장학습", "여름방학", 
  "겨울방학", "어린이날", "어버이날", "스승의날", "생일파티", "선물상자", "스케치북", "크레파스", 
  "연필꽂이", "샤프펜슬", "세계지도", "우리나라", "대한민국", "텔레비전", "스마트폰", "슈퍼마켓", 
  "전통시장", "가전제품", "전자시계", "프라이팬", "탁상시계", "손목시계", "드라이버", "수도꼭지", 
  "비누방울", "횡단보도", "오토바이", "머리카락", "할머니집", "인공지능", "아나운서", "호두과자", 
  "삼각김밥", "샌드위치", "요구르트", "감자튀김", "막대사탕", "김치찌개", "된장찌개", "미역국밥", 
  "옥수수빵", "포도주스", "미끄럼틀", "회전목마", "바이올린", "전자기타", "하모니카", "아코디언", 
  "사물놀이", "축구선수", "야구선수", "농구선수", "배구선수", "실내수영", "얼음낚시", "수수께끼", 
  "끝말잇기", "보물찾기", "연날리기", "팽이치기", "딱지치기", "제기차기", "받아쓰기", "분필가루", 
  "단풍나무", "은행나무", "군고구마", "치즈케익", "딸기케익", "블루투스", "사자성어", "와이파이", 
  "짜파게티", "로그아웃", "데스노트", "모나리자", "도라에몽", "고추냉이", "놀이동산", "발레리나", 
  "체육대회", "신체검사", "대중교통", "자일리톨", "교통카드", "초등학생", "시험문제", "신용카드", 
  "배드민턴", "만루홈런", "노상방뇨", "테트리스", "신랑신부", "프로포즈", "트와이스", "스케이트", 
  "대리운전", "포장마차", "국어시간", "휴대전화", "꼬마김밥", "다이어리", "국가대표", "대형마트", 
  "동그라미", "일기예보", "플라스틱", "카페라떼", "세종대왕", "레스토랑", "업데이트", "즐겨찾기", 
  "훈민정음", "신데렐라", "모차르트", "막상막하", "수행평가", "메추리알", "모래시계", "물레방아", 
  "비닐봉투", "알쏭달쏭", "전자렌지", "경상남도", "비빔국수", "어벤져스", "코카콜라", "소녀시대", 
  "스파게티", "요술램프", "피노키오", "만리장성", "장난감", "허수아비", "아이스티", "인어공주", 
  "아프리카", "악세서리", "전래동화", "마카로니", "마요네즈", "스테이크", "파인애플", "아보카도", 
  "블루베리", "라즈베리", "선글라스", "에메랄드", "알레르기", "아스팔트", "아이디어", "아기랑이", 
  "가로세로", "동서남북", "안절부절", "천방지축", "호랑나비", "개구쟁이", "두꺼비집", "소방대원",
  "우체국장", "도서관장", "박물관장", "음악감상", "영화감독", "만화영화", "컴퓨터실", "과학실험",
  "수학공부", "국어공부", "사회공부", "영어공부", "체육시간", "급식시간", "쉬는시간", "돌봄교실",
  "체험학습", "가족여행", "캠핑장비", "낚시도구", "등산장비", "스키장비", "수영장비", "야구배트",
  "농구골대", "배구네트", "훌라후프", "뜀틀넘기", "철봉운동", "구름다리", "시소타기", "그네타기",
  "모래놀이", "순대볶음", "튀김만두", "어묵꼬치", "피자배달", "치킨배달", "짬뽕국물", "김밥말이",
  "유부초밥", "사과주스", "딸기우유", "초코우유", "사탕봉지", "젤리푸딩", "과자봉지", "문구센터",
  "장난감차", "인형놀이", "로봇친구", "비행기표", "기차여행", "버스여행", "택시운전", "자전거길"
];

const styles = `
  @keyframes bounce-in {
    0% { transform: scale(0.3); opacity: 0; }
    50% { transform: scale(1.05); }
    70% { transform: scale(0.9); }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes countdown-bounce {
    0% { transform: scale(1); }
    30% { transform: scale(1.3); }
    50% { transform: scale(0.9); }
    70% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
  @keyframes timer-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }
  .animate-bounce-in {
    animation: bounce-in 0.5s ease-out forwards;
  }
  .animate-countdown-bounce {
    animation: countdown-bounce 0.6s ease-out;
  }
  .animate-timer-pulse {
    animation: timer-pulse 0.5s ease-in-out;
  }
  .animate-shake {
    animation: shake 0.5s ease-in-out;
  }
  .timer-ring {
    transition: stroke-dashoffset 0.1s linear;
  }
  .super-large-text {
    font-size: 8rem;
    line-height: 1.1;
  }
  @media (min-width: 768px) {
    .super-large-text {
      font-size: 10rem;
    }
  }
`;

const TEAM_COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export const FourLetterQuiz: React.FC<Props> = ({ onBack }) => {
  // Game State
  const [screen, setScreen] = useState<'START' | 'READY' | 'QUIZ' | 'ANSWER_WAIT' | 'ANSWER_REVEAL'>('START');
  const [teamCount, setTeamCount] = useState(4);
  const [scores, setScores] = useState<number[]>([]);
  const [questionNum, setQuestionNum] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [usedWords, setUsedWords] = useState<string[]>([]);
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(3);
  const [dashOffset, setDashOffset] = useState(0);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Animation Triggers
  const [timerAnimClass, setTimerAnimClass] = useState('');
  const [scoreAnimClass, setScoreAnimClass] = useState<Record<number, string>>({});

  const circumference = 552.9; // 2 * PI * 88

  useEffect(() => {
    if (teamCount > 0 && scores.length !== teamCount) {
      setScores(new Array(teamCount).fill(0));
    }
  }, [teamCount]);

  const getRandomWord = useCallback(() => {
    let available = WORDS.filter(w => !usedWords.includes(w));
    if (available.length === 0) {
      // Reset used words if all used
      available = WORDS;
      setUsedWords([]);
    }
    const randomIndex = Math.floor(Math.random() * available.length);
    const word = available[randomIndex];
    setUsedWords(prev => [...prev, word]);
    return word;
  }, [usedWords]);

  const startGame = () => {
    setQuestionNum(0);
    setUsedWords([]);
    setScores(new Array(teamCount).fill(0));
    prepareQuiz();
  };

  const prepareQuiz = () => {
    setQuestionNum(prev => prev + 1);
    setCurrentWord(getRandomWord());
    setScreen('READY');
  };

  const startQuiz = () => {
    setScreen('QUIZ');
    startTimer();
  };

  const startTimer = () => {
    setTimeLeft(3);
    setDashOffset(0);
    
    let elapsed = 0;
    const step = circumference / 30; // 3 seconds * 10 ticks/sec

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    timerIntervalRef.current = setInterval(() => {
      elapsed++;
      setDashOffset(step * elapsed);

      // Every 1 second (10 ticks)
      if (elapsed % 10 === 0) {
        setTimeLeft(prev => {
           const newVal = prev - 1;
           // Trigger animation logic
           setTimerAnimClass('animate-countdown-bounce');
           if (newVal === 1) {
             setTimerAnimClass('animate-countdown-bounce animate-shake');
           }
           setTimeout(() => setTimerAnimClass(''), 600);
           return newVal;
        });
      }

      if (elapsed >= 30) {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        showAnswerScreen();
      }
    }, 100);
  };

  const showAnswerScreen = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setScreen('ANSWER_WAIT');
  };

  const revealAnswer = () => {
    setScreen('ANSWER_REVEAL');
  };

  const restartGame = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setScreen('START');
  };

  const updateScore = (index: number, delta: number) => {
    setScores(prev => {
      const newScores = [...prev];
      newScores[index] = Math.max(0, newScores[index] + delta);
      return newScores;
    });
    
    // Trigger animation for this score
    setScoreAnimClass(prev => ({ ...prev, [index]: 'animate-countdown-bounce' }));
    setTimeout(() => {
      setScoreAnimClass(prev => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
    }, 600);
  };

  const resetScore = (index: number) => {
    setScores(prev => {
      const newScores = [...prev];
      newScores[index] = 0;
      return newScores;
    });
    setScoreAnimClass(prev => ({ ...prev, [index]: 'animate-countdown-bounce' }));
    setTimeout(() => {
        setScoreAnimClass(prev => {
          const next = { ...prev };
          delete next[index];
          return next;
        });
      }, 600);
  };

  // --- Render Components ---

  const renderStartScreen = () => (
    <div className="h-full flex flex-col items-center justify-center p-6 animate-fade-in relative">
       {/* Home Button for Start Screen */}
       <button 
          onClick={onBack}
          className="absolute top-6 left-6 px-6 py-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white text-lg font-bold backdrop-blur-md border border-white/20 shadow-lg hover:scale-105 transition-all flex items-center gap-2 z-20"
          style={{ fontFamily: '"Jua", sans-serif' }}
       >
          <Home size={24} /> <span>홈으로</span>
       </button>

       <div className="text-center">
         <div className="text-8xl mb-4">🎯</div>
         <h1 className="text-5xl md:text-6xl text-white mb-4 drop-shadow-lg" style={{ fontFamily: '"Black Han Sans", sans-serif' }}>네글자 퀴즈</h1>
         <p className="text-xl text-white/90 mb-8" style={{ fontFamily: '"Jua", sans-serif' }}>초등학생을 위한 재미있는 단어 맞추기!</p>
         
         <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-8 max-w-md mx-auto text-left">
            <p className="text-white text-lg mb-2" style={{ fontFamily: '"Jua", sans-serif' }}>📝 게임 방법</p>
            <p className="text-white/90" style={{ fontFamily: '"Jua", sans-serif' }}>❓ 두 글자를 보고 네 글자 단어를 맞춰보세요!</p>
            <p className="text-white/80 text-sm mt-2" style={{ fontFamily: '"Jua", sans-serif' }}>⏱️ 제한시간: 3초</p>
         </div>

         <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-8 max-w-md mx-auto">
            <p className="text-white text-xl mb-4" style={{ fontFamily: '"Jua", sans-serif' }}>👥 팀 개수 선택</p>
            <div className="grid grid-cols-4 gap-3 mb-3">
              {[2, 3, 4, 5].map(num => (
                <button 
                  key={num}
                  onClick={() => setTeamCount(num)}
                  className={`text-xl px-4 py-3 rounded-xl transition-all duration-200 ${teamCount === num ? 'bg-yellow-400 text-purple-800 font-bold ring-4 ring-yellow-300' : 'bg-white/30 hover:bg-white/50 text-white'}`}
                  style={{ fontFamily: '"Jua", sans-serif' }}
                >
                  {num}팀
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
               {[6, 7, 8].map(num => (
                <button 
                  key={num}
                  onClick={() => setTeamCount(num)}
                  className={`text-xl px-4 py-3 rounded-xl transition-all duration-200 ${teamCount === num ? 'bg-yellow-400 text-purple-800 font-bold ring-4 ring-yellow-300' : 'bg-white/30 hover:bg-white/50 text-white'}`}
                  style={{ fontFamily: '"Jua", sans-serif' }}
                >
                  {num}팀
                </button>
              ))}
            </div>
            <p className="text-white/90 mt-4" style={{ fontFamily: '"Jua", sans-serif' }}>선택한 팀: <span className="text-yellow-300 font-bold text-2xl">{teamCount}팀</span></p>
         </div>

         <button 
            onClick={startGame}
            className="text-2xl px-12 py-4 bg-yellow-400 hover:bg-yellow-300 text-purple-800 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
            style={{ fontFamily: '"Jua", sans-serif' }}
         > 
           🎮 게임 시작 
         </button>
       </div>
    </div>
  );

  const renderReadyScreen = () => (
    <div className="h-full flex flex-col items-center justify-start pt-10 pb-48 px-6 animate-fade-in overflow-y-auto">
       <div className="text-center">
          <div className="text-7xl mb-4">🎯</div>
          <h2 className="text-5xl text-white mb-4 drop-shadow-lg" style={{ fontFamily: '"Black Han Sans", sans-serif' }}>준비</h2>
          <p className="text-xl text-white/90 mb-8" style={{ fontFamily: '"Jua", sans-serif' }}>문제를 풀 준비가 되셨나요?</p>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-8 max-w-md mx-auto">
             <p className="text-white text-lg mb-2" style={{ fontFamily: '"Jua", sans-serif' }}>📋 현재 문제</p>
             <p className="text-4xl text-yellow-300 mb-2" style={{ fontFamily: '"Black Han Sans", sans-serif' }}>{questionNum}</p>
             <p className="text-white/80 text-base" style={{ fontFamily: '"Jua", sans-serif' }}>번 문제</p>
          </div>

          <button 
             onClick={startQuiz}
             className="text-2xl px-12 py-4 bg-green-500 hover:bg-green-400 text-white rounded-full shadow-lg transform hover:scale-105 transition-all duration-200 mb-8"
             style={{ fontFamily: '"Jua", sans-serif' }}
          > 
             📝 문제 제시 
          </button>
       </div>
    </div>
  );

  const renderQuizScreen = () => (
    <div className="h-full flex flex-col items-center justify-start pt-4 pb-48 px-6 overflow-y-auto">
       <div className="text-center w-full max-w-7xl">
          {/* Header */}
          <div className="flex justify-center items-center mb-4 px-4 relative">
             <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-2">
                <span className="text-white text-xl" style={{ fontFamily: '"Jua", sans-serif' }}>
                  📊 문제 <span className="text-2xl">{questionNum}</span>
                </span>
             </div>
             <button 
                onClick={restartGame}
                className="absolute right-4 text-base px-3 py-1 bg-red-500 hover:bg-red-400 text-white rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
                style={{ fontFamily: '"Jua", sans-serif' }}
             > 
               🔄 처음부터 
             </button>
          </div>

          {/* Timer */}
          <div className="relative w-32 h-32 mx-auto mb-4">
             <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r="58" stroke="rgba(255,255,255,0.2)" strokeWidth="8" fill="none" />
                <circle 
                  className="timer-ring" 
                  cx="64" cy="64" r="58" 
                  stroke="#fbbf24" strokeWidth="8" fill="none" strokeLinecap="round" 
                  strokeDasharray={364.4} 
                  strokeDashoffset={(364.4 / circumference) * dashOffset} 
                />
             </svg>
             <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-6xl text-white drop-shadow-lg ${timerAnimClass}`} style={{ fontFamily: '"Black Han Sans", sans-serif' }}>
                   {timeLeft}
                </span>
             </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-4 animate-bounce-in">
             <p className="text-gray-500 text-2xl mb-2" style={{ fontFamily: '"Jua", sans-serif' }}>이 단어는 무엇일까요?</p>
             <div className="super-large-text text-purple-600 tracking-wider" style={{ fontFamily: '"Black Han Sans", sans-serif' }}>
                {currentWord.substring(0, 2)}<span className="text-gray-300">○○</span>
              </div>
          </div>
          <p className="text-white/80 text-2xl" style={{ fontFamily: '"Jua", sans-serif' }}>정답을 생각해보세요! 🤔</p>
       </div>
    </div>
  );

  const renderAnswerScreen = () => (
     <div className="h-full flex flex-col items-center justify-start pt-10 px-6 pb-48 overflow-y-auto">
        <button 
           onClick={restartGame}
           className="absolute top-6 right-6 text-base px-3 py-1 bg-red-500 hover:bg-red-400 text-white rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 z-10"
           style={{ fontFamily: '"Jua", sans-serif' }}
        > 
           🔄 처음부터 
        </button>

        <div className="text-center w-full max-w-7xl">
           {screen === 'ANSWER_WAIT' ? (
              <div className="animate-bounce-in">
                 <div className="text-7xl mb-4">⏰</div>
                 <p className="text-white/90 text-3xl mb-6" style={{ fontFamily: '"Jua", sans-serif' }}>시간이 끝났습니다!</p>
                 <button 
                    onClick={revealAnswer}
                    className="text-3xl px-12 py-4 bg-blue-500 hover:bg-blue-400 text-white rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
                    style={{ fontFamily: '"Jua", sans-serif' }}
                 > 
                    👀 정답 보기 
                 </button>
              </div>
           ) : (
              <div className="animate-bounce-in">
                 <div className="text-7xl mb-4">✨</div>
                 <p className="text-white/90 text-3xl mb-4" style={{ fontFamily: '"Jua", sans-serif' }}>정답은...</p>
                 <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
                    <div className="super-large-text text-purple-600" style={{ fontFamily: '"Black Han Sans", sans-serif' }}>
                       {currentWord}
                    </div>
                 </div>
                 <button 
                    onClick={prepareQuiz}
                    className="text-2xl px-10 py-4 bg-yellow-400 hover:bg-yellow-300 text-purple-800 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
                    style={{ fontFamily: '"Jua", sans-serif' }}
                 > 
                    다음 문제 ➡️ 
                 </button>
              </div>
           )}
        </div>
     </div>
  );

  return (
    <>
      <style>{styles}</style>
      <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-[#667eea] to-[#764ba2] flex flex-col">
         {/* Home Button (Always visible unless in start screen) */}
         {screen !== 'START' && (
            <button 
               onClick={onBack}
               className="absolute top-6 left-6 px-6 py-3 rounded-2xl bg-gray-600 hover:bg-gray-500 text-white text-lg font-bold shadow-lg hover:scale-105 transition-all flex items-center gap-2 z-20"
               style={{ fontFamily: '"Jua", sans-serif' }}
            > 
               <Home size={22} /> <span>홈으로</span> 
            </button>
         )}

         {/* Screens */}
         {screen === 'START' && renderStartScreen()}
         {screen === 'READY' && renderReadyScreen()}
         {screen === 'QUIZ' && renderQuizScreen()}
         {(screen === 'ANSWER_WAIT' || screen === 'ANSWER_REVEAL') && renderAnswerScreen()}

         {/* Scoreboard (Visible if not START) */}
         {screen !== 'START' && (
            <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md border-t-2 border-yellow-400 py-2 px-4 overflow-x-auto z-30">
               <div className="flex justify-center items-center gap-2 min-w-max mx-auto">
                  {scores.map((score, idx) => (
                     <div key={idx} className="rounded-lg shadow-md p-2 flex flex-col items-center gap-1 min-w-[100px]" style={{ backgroundColor: TEAM_COLORS[idx % TEAM_COLORS.length] }}>
                        <div className="flex items-center gap-2">
                           <span className="text-white/90 text-sm font-bold" style={{ fontFamily: '"Jua", sans-serif' }}>{idx + 1}팀</span>
                           <span className={`text-white font-bold text-2xl ${scoreAnimClass[idx] || ''}`}>{score}</span>
                        </div>
                        <div className="flex gap-1">
                           <button onClick={() => updateScore(idx, -10)} className="text-xs px-2 py-1 bg-red-500 hover:bg-red-400 text-white rounded shadow active:scale-95 transition-transform" style={{ fontFamily: '"Jua", sans-serif' }}>-10</button>
                           <button onClick={() => updateScore(idx, 10)} className="text-xs px-2 py-1 bg-green-500 hover:bg-green-400 text-white rounded shadow active:scale-95 transition-transform" style={{ fontFamily: '"Jua", sans-serif' }}>+10</button>
                           <button onClick={() => resetScore(idx)} className="text-xs px-2 py-1 bg-white/30 hover:bg-white/50 text-white rounded shadow active:scale-95 transition-transform" style={{ fontFamily: '"Jua", sans-serif' }}>초기화</button>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         )}
      </div>
    </>
  );
};