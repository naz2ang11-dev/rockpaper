import React, { useState, useEffect } from 'react';
import { Home, Trophy, AlertCircle, CheckCircle2, Star, Zap, UserPlus, RefreshCw } from 'lucide-react';

interface Props {
  onBack: () => void;
}

type MissionType = 'SPEED' | 'QUALITY';

interface Mission {
  id: number;
  content: string;
  type: MissionType;
}

const MISSIONS: Mission[] = [
  // Speed Missions
  { id: 1, type: 'SPEED', content: '30cm 자 가져오기' },
  { id: 2, type: 'SPEED', content: '화장실에서 손 씻고 오기 (물기 있는 손 인증)' },
  { id: 3, type: 'SPEED', content: '국어 교과서 150쪽 펼쳐서 가져오기' },
  { id: 4, type: 'SPEED', content: '검은색 양말 한 짝 가져오기' },
  { id: 5, type: 'SPEED', content: '내년에도 같은 반 하고 싶은 친구와 손잡고 나오기' },
  { id: 6, type: 'SPEED', content: '이름에 "ㄱ"이 들어가는 친구 3명 모아오기' },
  { id: 7, type: 'SPEED', content: '빨간색 펜 가져오기' },
  { id: 8, type: 'SPEED', content: '딱풀 뚜껑 닫힌 상태로 3개 모아오기' },
  { id: 9, type: 'SPEED', content: '필통 속에 든 짧은 몽당연필 가져오기' },
  { id: 10, type: 'SPEED', content: '안경 쓴 친구 4명 데려오기' },
  { id: 11, type: 'SPEED', content: '교실 바닥에 떨어진 쓰레기 3개 먼저 줍기' },
  { id: 12, type: 'SPEED', content: '이성친구와 하이파이브하고 돌아오기' },
  { id: 13, type: 'SPEED', content: '머리카락이 가장 긴 친구 데려오기' },
  { id: 14, type: 'SPEED', content: '파란색 아이템(옷, 필통 등) 5개 모으기' },

  // Quality Missions
  { id: 15, type: 'QUALITY', content: '"나 꿈꿨어 귀신 꿈꿨어" 역대급 애교 보여주기' },
  { id: 16, type: 'QUALITY', content: '우리 모둠의 "이쁜 모습" 사진 찍어오기' },
  { id: 17, type: 'QUALITY', content: '강아지를 가장 닮은 학생 데려오기 (표정 연기)' },
  { id: 18, type: 'QUALITY', content: '구구단 7단을 가장 리드미컬하게 외우기' },
  { id: 19, type: 'QUALITY', content: '우리 모둠에서 제일 똑똑한 학생 데려오기' },
  { id: 20, type: 'QUALITY', content: '아이돌 댄스 한 소절 가장 똑같이 추기' },
  { id: 21, type: 'QUALITY', content: '땀' },
  { id: 22, type: 'QUALITY', content: '냄새' },
  { id: 23, type: 'QUALITY', content: '공책에 가장 예쁜 글씨' },
  { id: 24, type: 'QUALITY', content: '손을 가장 깨끗하게 씻고 온 팀' },
  { id: 25, type: 'QUALITY', content: '교실 구석에서 먼지 가장 많이 모아오기' },
  { id: 26, type: 'QUALITY', content: '몸으로 "선생님에 대한 사랑" 표현하기' },
  { id: 27, type: 'QUALITY', content: '물티슈 한 장을 가장 더럽게 만들어오기' },
  { id: 28, type: 'QUALITY', content: '선생님 초상화 1분 안에 가장 닮게 그리기' },
  { id: 29, type: 'QUALITY', content: '모둠원 전체가 합심하여 가장 큰 함성 지르기' },
  { id: 30, type: 'QUALITY', content: '"세상에서 가장 슬픈 표정" 짓기' },
  { id: 31, type: 'QUALITY', content: '몸에 있는 것 활용해서 "가장 긴 줄" 만들기' },
  { id: 32, type: 'QUALITY', content: '서로 눈을 마주본 상태에서 안웃고 끝까지 살아남기' },
  { id: 33, type: 'QUALITY', content: '교실 사물함 정리가 가장 잘 친구 사물함' },
  { id: 34, type: 'QUALITY', content: '가장 웃긴 얼굴 표정 짓기' },
];

const TEAM_COLORS = [
  'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'
];
const TEAM_NAMES = ['1팀', '2팀', '3팀', '4팀'];

type Step = 'INTRO' | 'TEAM_SELECT' | 'PLAYING' | 'RESULT';

export const MissionFactory: React.FC<Props> = ({ onBack }) => {
  const [step, setStep] = useState<Step>('INTRO');
  const [teamCount, setTeamCount] = useState(2);
  const [scores, setScores] = useState<number[]>([0, 0, 0, 0]);
  const [chances, setChances] = useState<number[]>([2, 2, 2, 2]);
  
  const [currentMission, setCurrentMission] = useState<Mission | null>(null);
  const [missionHistory, setMissionHistory] = useState<number[]>([]);
  const [isRevealed, setIsRevealed] = useState(false);

  // --- Handlers ---

  const handleStartGame = () => {
    setStep('TEAM_SELECT');
  };

  const confirmTeamCount = (count: number) => {
    setTeamCount(count);
    setScores(Array(count).fill(0));
    setChances(Array(count).fill(2));
    setMissionHistory([]);
    pickNewMission();
    setStep('PLAYING');
  };

  const pickNewMission = () => {
    setIsRevealed(false);
    // Filter out used missions
    const available = MISSIONS.filter(m => !missionHistory.includes(m.id));
    
    if (available.length === 0) {
      // All missions done, maybe reset or end game? For now, reset history
      setMissionHistory([]);
      const random = MISSIONS[Math.floor(Math.random() * MISSIONS.length)];
      setCurrentMission(random);
      setMissionHistory([random.id]);
    } else {
      const random = available[Math.floor(Math.random() * available.length)];
      setCurrentMission(random);
      setMissionHistory(prev => [...prev, random.id]);
    }
  };

  const handleScoreChange = (teamIdx: number, delta: number) => {
    const newScores = [...scores];
    newScores[teamIdx] = Math.max(0, newScores[teamIdx] + delta);
    setScores(newScores);
  };

  const useChance = (teamIdx: number) => {
    if (chances[teamIdx] > 0) {
      const newChances = [...chances];
      newChances[teamIdx] -= 1;
      setChances(newChances);
    }
  };

  const handleEndGame = () => {
    setStep('RESULT');
  };

  // --- Renders ---

  const renderIntro = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-6 animate-fade-in text-center relative">
       <button 
          onClick={onBack}
          className="absolute top-6 left-6 px-6 py-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white text-lg font-bold backdrop-blur-md border border-white/20 shadow-lg hover:scale-105 transition-all flex items-center gap-2 z-20"
          style={{ fontFamily: '"Jua", sans-serif' }}
       >
          <Home size={24} /> <span>홈으로</span>
       </button>
       
       <div className="text-9xl mb-6 animate-bounce">🏭</div>
       <h1 className="text-6xl md:text-8xl text-white mb-6 drop-shadow-lg" style={{ fontFamily: '"Black Han Sans", sans-serif' }}>
         미션 팩토리
       </h1>
       <p className="text-2xl text-white/90 mb-10 font-jua">
         다양한 미션을 수행하며 승리를 쟁취하세요!
       </p>
       
       <div className="bg-white/20 backdrop-blur-md rounded-3xl p-8 max-w-3xl w-full mb-10 text-left border border-white/10 shadow-xl">
          <h3 className="text-3xl text-yellow-300 mb-6 font-black-han">📜 게임 규칙</h3>
          <ul className="space-y-4 text-xl text-white font-jua">
            <li className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <strong>게임 방법</strong>
                <p className="text-base opacity-80">화면에 미션이 나오고 그 미션을 빨리 수행하거나 완성도 있게 수행하는 팀이 이깁니다.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">⭐</span>
              <div>
                <strong>점수 획득</strong>
                <p className="text-base opacity-80">
                  일반적인 미션 성공은 <strong>1점</strong><br/>
                  아주 창의적이거나 반 친구들에게 즐거움을 주면 <strong>2점</strong><br/>
                  경기진행을 방해하면 <strong>-1점</strong>
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">🆘</span>
              <div>
                <strong>찬스 사용 (팀당 2회)</strong>
                <p className="text-base opacity-80">도저히 할 수 없을 때 다른 친구가 대신 해주는 찬스!</p>
              </div>
            </li>
          </ul>
       </div>

       <button
         onClick={handleStartGame}
         className="bg-yellow-400 text-yellow-900 text-3xl px-16 py-6 rounded-full font-black-han hover:bg-yellow-300 hover:scale-105 transition-all shadow-xl"
       >
         시작하기
       </button>
    </div>
  );

  const renderTeamSelect = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-6 animate-fade-in relative">
      <button 
          onClick={onBack}
          className="absolute top-6 left-6 px-6 py-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white text-lg font-bold backdrop-blur-md border border-white/20 shadow-lg hover:scale-105 transition-all flex items-center gap-2 z-20"
          style={{ fontFamily: '"Jua", sans-serif' }}
       >
          <Home size={24} /> <span>홈으로</span>
      </button>

      <h2 className="text-5xl text-white mb-12 font-black-han drop-shadow-md">참여할 팀 수를 선택하세요</h2>
      <div className="grid grid-cols-3 gap-8 max-w-4xl w-full">
        {[2, 3, 4].map(num => (
          <button
            key={num}
            onClick={() => confirmTeamCount(num)}
            className={`
               aspect-square rounded-3xl text-6xl font-black-han shadow-lg transition-all
               hover:scale-105 active:scale-95 border-4 border-white/30
               ${TEAM_COLORS[num - 1]} text-white
            `}
          >
            {num}팀
          </button>
        ))}
      </div>
    </div>
  );

  const renderPlaying = () => {
    if (!currentMission) return null;

    return (
      <div className="flex-1 flex flex-col w-full h-full p-6 animate-fade-in relative pt-20">
         <button 
            onClick={onBack}
            className="absolute top-6 left-6 px-6 py-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white text-lg font-bold backdrop-blur-md border border-white/20 shadow-lg hover:scale-105 transition-all flex items-center gap-2 z-20"
            style={{ fontFamily: '"Jua", sans-serif' }}
         >
            <Home size={24} /> <span>홈으로</span>
         </button>

         <button 
            onClick={handleEndGame}
            className="absolute top-6 right-6 px-6 py-3 rounded-2xl bg-red-500/80 hover:bg-red-600 text-white text-lg font-bold backdrop-blur-md border border-white/20 shadow-lg hover:scale-105 transition-all flex items-center gap-2 z-20"
            style={{ fontFamily: '"Jua", sans-serif' }}
         >
            <Trophy size={24} /> <span>게임 종료</span>
         </button>

         {/* Scoreboard */}
         <div className="flex gap-4 justify-center mb-8 w-full max-w-5xl mx-auto">
            {Array.from({ length: teamCount }).map((_, i) => (
              <div key={i} className={`flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-4 border-2 ${scores[i] >= Math.max(...scores) && scores[i] > 0 ? 'border-yellow-400 bg-white/20' : 'border-white/10'} flex flex-col items-center relative`}>
                 <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-white ${TEAM_COLORS[i]}`}>
                   {TEAM_NAMES[i]}
                 </div>
                 <div className="text-4xl font-black-han text-white mt-2 mb-2">{scores[i]}점</div>
                 
                 {/* Chance Button */}
                 <button
                   onClick={() => useChance(i)}
                   disabled={chances[i] <= 0}
                   className={`
                     w-full py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-1 transition-colors mb-2
                     ${chances[i] > 0 ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-black/20 text-white/30 cursor-not-allowed'}
                   `}
                 >
                   <UserPlus size={16} /> 찬스 ({chances[i]})
                 </button>

                 {/* Score Buttons */}
                 <div className="flex gap-1 w-full">
                   <button
                     onClick={() => handleScoreChange(i, 1)}
                     className="flex-1 py-2 rounded-lg bg-green-500 hover:bg-green-400 text-white font-bold shadow-md active:scale-95 transition-all text-sm"
                   >
                     +1
                   </button>
                   <button
                     onClick={() => handleScoreChange(i, 2)}
                     className="flex-1 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-white font-bold shadow-md active:scale-95 transition-all text-sm"
                   >
                     +2
                   </button>
                   <button
                     onClick={() => handleScoreChange(i, -1)}
                     className="flex-1 py-2 rounded-lg bg-red-500 hover:bg-red-400 text-white font-bold shadow-md active:scale-95 transition-all text-sm"
                   >
                     -1
                   </button>
                 </div>
              </div>
            ))}
         </div>

         {/* Mission Card */}
         <div className="flex-1 flex items-center justify-center w-full max-w-5xl mx-auto mb-8">
            <div 
              className="relative w-full aspect-video md:aspect-[2/1] bg-white rounded-[3rem] shadow-2xl flex flex-col items-center justify-center p-8 text-center cursor-pointer group perspective-1000"
              onClick={() => setIsRevealed(true)}
            >
               {!isRevealed ? (
                 <div className="flex flex-col items-center animate-bounce">
                    <div className="text-9xl mb-4">❓</div>
                    <div className="text-4xl font-black-han text-slate-400">터치하여 미션 공개</div>
                 </div>
               ) : (
                 <div className="animate-flip-in flex flex-col items-center w-full h-full justify-center">
                    <div className={`
                      px-6 py-2 rounded-full text-white font-bold text-2xl mb-6 flex items-center gap-2 shadow-lg
                      ${currentMission.type === 'SPEED' ? 'bg-blue-500' : 'bg-purple-500'}
                    `}>
                      {currentMission.type === 'SPEED' ? <Zap size={24} fill="currentColor" /> : <Star size={24} fill="currentColor" />}
                      {currentMission.type === 'SPEED' ? '스피드 미션' : '퀄리티 미션'}
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black-han text-slate-800 leading-tight break-keep drop-shadow-sm">
                      {currentMission.content}
                    </h2>
                 </div>
               )}

               {/* Reroll Button */}
               <button 
                 onClick={(e) => {
                   e.stopPropagation();
                   pickNewMission();
                 }}
                 className="absolute top-6 right-6 p-3 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:rotate-180 transition-all shadow-md"
                 title="미션 패스 (점수 없음)"
               >
                 <RefreshCw size={24} />
               </button>
            </div>
         </div>
      </div>
    );
  };

  const renderResult = () => {
    const maxScore = Math.max(...scores);
    const winners = scores.map((s, i) => s === maxScore ? i : -1).filter(i => i !== -1);

    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 animate-fade-in relative">
         <button 
            onClick={onBack}
            className="absolute top-6 left-6 px-6 py-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white text-lg font-bold backdrop-blur-md border border-white/20 shadow-lg hover:scale-105 transition-all flex items-center gap-2 z-20"
            style={{ fontFamily: '"Jua", sans-serif' }}
         >
            <Home size={24} /> <span>홈으로</span>
         </button>

         <h2 className="text-6xl text-white font-black-han mb-12 drop-shadow-lg">🎉 최종 결과</h2>

         <div className="flex flex-wrap justify-center gap-6 w-full max-w-5xl mb-12">
            {scores.map((score, i) => {
               const isWinner = winners.includes(i);
               return (
                  <div 
                    key={i}
                    className={`
                      flex flex-col items-center p-8 rounded-3xl border-4 shadow-xl min-w-[200px] transition-all
                      ${isWinner ? 'bg-white border-yellow-400 scale-110 z-10' : 'bg-white/80 border-transparent'}
                    `}
                  >
                     <div className={`
                       px-4 py-1 rounded-full text-white font-bold mb-4 shadow-md
                       ${TEAM_COLORS[i]}
                     `}>
                       {TEAM_NAMES[i]}
                     </div>
                     <div className="text-6xl font-black-han text-slate-800 mb-2">{score}점</div>
                     {isWinner && <div className="text-4xl animate-bounce mt-2">🏆</div>}
                  </div>
               );
            })}
         </div>

         <button 
           onClick={() => setStep('INTRO')}
           className="bg-slate-800 text-white px-12 py-5 rounded-full text-2xl font-jua hover:bg-slate-700 transition-colors shadow-lg"
         >
           처음으로 돌아가기
         </button>
      </div>
    );
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Jua&family=Black+Han+Sans&display=swap');
        .font-jua { font-family: 'Jua', sans-serif; }
        .font-black-han { font-family: 'Black Han Sans', sans-serif; }
        .perspective-1000 { perspective: 1000px; }
        @keyframes flip-in {
          from { transform: rotateX(-90deg); opacity: 0; }
          to { transform: rotateX(0); opacity: 1; }
        }
        .animate-flip-in { animation: flip-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}</style>
      <div className="min-h-screen w-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex flex-col font-sans overflow-hidden">
        {step === 'INTRO' && renderIntro()}
        {step === 'TEAM_SELECT' && renderTeamSelect()}
        {step === 'PLAYING' && renderPlaying()}
        {step === 'RESULT' && renderResult()}
      </div>
    </>
  );
};
