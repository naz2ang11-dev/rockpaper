import React, { useState } from 'react';
import { GameId, GameInfo } from './types';
import { RockPaperScissors } from './games/RockPaperScissors';
import { OneStepTag } from './games/OneStepTag';
import { Scoreboard } from './games/Scoreboard';
import { TeamAssigner } from './games/TeamAssigner';
import { InitialQuiz } from './games/InitialQuiz';
import { FourLetterQuiz } from './games/FourLetterQuiz';
import { BodyTalkQuiz } from './games/BodyTalkQuiz';
import { RelayTalk } from './games/RelayTalk';
import { PenaltyRoulette } from './games/PenaltyRoulette';
import { User, Users, PersonStanding, ListOrdered, Dices } from 'lucide-react';

// Custom Icons Components
const ScoreboardIcon = () => (
  <div className="flex gap-2 items-center justify-center w-24 h-24">
    <div className="w-10 h-14 bg-red-500 rounded-lg border-2 border-white/50 shadow-md flex flex-col items-center justify-center">
      <div className="w-2 h-2 rounded-full bg-white/30 mb-1"></div>
      <span className="text-white text-xl leading-none">A</span>
    </div>
    <div className="text-slate-300 text-lg">VS</div>
    <div className="w-10 h-14 bg-blue-500 rounded-lg border-2 border-white/50 shadow-md flex flex-col items-center justify-center">
      <div className="w-2 h-2 rounded-full bg-white/30 mb-1"></div>
      <span className="text-white text-xl leading-none">B</span>
    </div>
  </div>
);

const TeamMatchIcon = () => (
  <div className="relative w-24 h-24 flex items-center justify-center">
    <div className="absolute left-2 top-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center border-2 border-red-200 z-10">
       <User className="w-8 h-8 text-red-500" />
    </div>
    <div className="absolute right-2 bottom-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center border-2 border-blue-200 z-20">
       <User className="w-8 h-8 text-blue-500" />
    </div>
    <div className="absolute top-2 right-4 text-2xl">⚡️</div>
  </div>
);

const ChessTagIcon = () => (
  <div className="w-20 h-20 bg-slate-800 rounded-lg p-1 shadow-lg transform rotate-3">
    <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-0.5 bg-slate-400 border border-slate-500">
      <div className="bg-slate-200 flex items-center justify-center">
         <div className="w-5 h-5 rounded-full bg-red-500 shadow-sm border border-red-600 inset-0"></div>
      </div>
      <div className="bg-slate-500"></div>
      <div className="bg-slate-500"></div>
      <div className="bg-slate-200 flex items-center justify-center">
         <div className="w-5 h-5 rounded-full bg-blue-500 shadow-sm border border-blue-600 inset-0"></div>
      </div>
    </div>
  </div>
);

const RpsIcon = () => (
  <div className="text-7xl filter drop-shadow-sm">✌️</div>
);

const InitialQuizIcon = () => (
  <div className="relative w-24 h-24 flex items-center justify-center bg-gradient-to-br from-yellow-300 to-orange-400 rounded-2xl shadow-lg transform -rotate-2">
    <div className="absolute -top-2 -right-2 text-4xl animate-bounce">❓</div>
    <span className="text-5xl font-black text-white drop-shadow-md" style={{ fontFamily: '"Black Han Sans", sans-serif' }}>ㄱㅂ</span>
  </div>
);

const FourLetterQuizIcon = () => (
  <div className="w-20 h-20 grid grid-cols-2 grid-rows-2 gap-1 bg-white/20 p-2 rounded-xl backdrop-blur-sm border-2 border-white/50 transform rotate-2">
    <div className="bg-purple-500 rounded-md flex items-center justify-center text-white font-bold">?</div>
    <div className="bg-indigo-500 rounded-md flex items-center justify-center text-white font-bold">?</div>
    <div className="bg-blue-500 rounded-md flex items-center justify-center text-white font-bold">?</div>
    <div className="bg-green-500 rounded-md flex items-center justify-center text-white font-bold">?</div>
  </div>
);

const BodyTalkIcon = () => (
  <div className="relative w-24 h-24 flex items-center justify-center bg-gradient-to-br from-orange-400 to-red-500 rounded-full shadow-lg border-4 border-white/20">
     <PersonStanding size={64} className="text-white animate-pulse" strokeWidth={2} />
  </div>
);

const RelayTalkIcon = () => (
  <div className="relative w-24 h-24 flex items-center justify-center bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl shadow-lg transform rotate-1">
     <div className="flex -space-x-3">
        <div className="w-10 h-10 rounded-full bg-white border-2 border-pink-200 flex items-center justify-center text-pink-500 z-30">1</div>
        <div className="w-10 h-10 rounded-full bg-white/80 border-2 border-pink-200 flex items-center justify-center text-pink-500 z-20">2</div>
        <div className="w-10 h-10 rounded-full bg-white/60 border-2 border-pink-200 flex items-center justify-center text-pink-500 z-10">3</div>
     </div>
  </div>
);

const PenaltyRouletteIcon = () => (
  <div className="relative w-24 h-24 flex items-center justify-center">
    <div className="w-20 h-20 rounded-full border-4 border-white/50 bg-[conic-gradient(var(--tw-gradient-stops))] from-red-400 via-yellow-400 via-green-400 via-blue-400 to-red-400 shadow-lg animate-[spin_10s_linear_infinite]"></div>
    <div className="absolute top-0 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[16px] border-t-red-600 drop-shadow-md"></div>
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-6 h-6 bg-white rounded-full shadow-inner border border-gray-200"></div>
    </div>
  </div>
);

// 게임 목록 정의
const GAMES: GameInfo[] = [
  {
    id: 'SCOREBOARD',
    title: '점수판',
    description: '교실놀이나 체육시간에 활용하세요',
    icon: <ScoreboardIcon />,
    color: 'from-emerald-400 to-teal-500'
  },
  {
    id: 'TEAM_MATCH',
    title: '팀 랜덤 배정',
    description: '교실놀이때 팀 짤때 활용하세요',
    icon: <TeamMatchIcon />,
    color: 'from-blue-400 to-indigo-500'
  },
  {
    id: 'RPS',
    title: '랜덤 가위바위보',
    description: '랜덤으로 가위바위보가 제시됩니다',
    icon: <RpsIcon />,
    color: 'from-yellow-400 to-orange-500'
  },
  {
    id: 'PENALTY_ROULETTE',
    title: '벌칙 룰렛',
    description: '복불복 벌칙 정하기! 새로운 벌칙을 추가해보세요',
    icon: <PenaltyRouletteIcon />,
    color: 'from-rose-400 to-red-500'
  },
  {
    id: 'INITIAL_QUIZ',
    title: '자음모음 퀴즈',
    description: '제시된 자음이나 모음으로 단어를 맞추는 스피드 퀴즈입니다',
    icon: <InitialQuizIcon />,
    color: 'from-purple-400 to-pink-500'
  },
  {
    id: 'FOUR_LETTER_QUIZ',
    title: '네글자 퀴즈',
    description: '앞의 두 글자를 보고 뒤의 두 글자를 이어 말하는 게임입니다',
    icon: <FourLetterQuizIcon />,
    color: 'from-[#667eea] to-[#764ba2]'
  },
  {
    id: 'BODY_TALK',
    title: '몸으로 말해요',
    description: '말하지 않고 몸짓으로만 단어를 설명하여 맞추는 스피드 게임입니다',
    icon: <BodyTalkIcon />,
    color: 'from-orange-400 to-red-500'
  },
  {
    id: 'RELAY_TALK',
    title: '줄줄이 말해요',
    description: '주제가 나오면 5명이 5초 내에 순서대로 정답을 말하는 게임입니다',
    icon: <RelayTalkIcon />,
    color: 'from-pink-400 to-rose-500'
  },
  {
    id: 'TAG',
    title: '체스 술래잡기',
    description: '두 팀이 번갈아 한 발씩 움직이며, 상대방을 터치해 아웃시키는 게임입니다.',
    icon: <ChessTagIcon />,
    color: 'from-green-400 to-emerald-500'
  }
];

const App: React.FC = () => {
  const [currentGame, setCurrentGame] = useState<GameId>('HOME');

  // 게임 선택 핸들러
  const handleGameSelect = (id: GameId) => {
    setCurrentGame(id);
  };

  // 홈으로 돌아가기
  const goHome = () => {
    setCurrentGame('HOME');
  };

  // 현재 상태에 따라 화면 렌더링
  const renderContent = () => {
    switch (currentGame) {
      case 'SCOREBOARD':
        return <Scoreboard onBack={goHome} />;
      case 'TEAM_MATCH':
        return <TeamAssigner onBack={goHome} />;
      case 'RPS':
        return <RockPaperScissors onBack={goHome} />;
      case 'PENALTY_ROULETTE':
        return <PenaltyRoulette onBack={goHome} />;
      case 'TAG':
        return <OneStepTag onBack={goHome} />;
      case 'INITIAL_QUIZ':
        return <InitialQuiz onBack={goHome} />;
      case 'FOUR_LETTER_QUIZ':
        return <FourLetterQuiz onBack={goHome} />;
      case 'BODY_TALK':
        return <BodyTalkQuiz onBack={goHome} />;
      case 'RELAY_TALK':
        return <RelayTalk onBack={goHome} />;
      default:
        return (
          <div className="flex flex-col items-center w-full max-w-7xl animate-fade-in">
            <header className="mb-12 text-center">
              <h1 className="text-5xl md:text-7xl text-slate-800 mb-6 tracking-tight" style={{ fontFamily: '"Black Han Sans", sans-serif' }}>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">교실놀이</span> 도우미
              </h1>
              <p className="text-slate-500 text-xl">
                교실놀이 할때 도움을 줄 도구 모음
              </p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full px-4 mb-16">
              {GAMES.map((game) => (
                <button
                  key={game.id}
                  onClick={() => handleGameSelect(game.id)}
                  className="group relative flex flex-col items-center p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-slate-100 overflow-hidden text-left h-full"
                >
                  {/* Decorative Background */}
                  <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${game.color}`} />
                  <div className={`absolute -right-10 -bottom-10 w-40 h-40 bg-gradient-to-br ${game.color} opacity-10 rounded-full group-hover:scale-150 transition-transform duration-500`} />

                  <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                    {game.icon}
                  </div>
                  
                  <h2 className="text-2xl text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors text-center w-full" style={{ fontFamily: '"Black Han Sans", sans-serif' }}>
                    {game.title}
                  </h2>
                  <p className="text-slate-500 text-center px-2 break-keep text-sm">
                    {game.description}
                  </p>
                  
                  <div className="mt-auto pt-6">
                    <div className="px-6 py-2 rounded-full bg-slate-100 text-slate-600 text-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      게임 시작하기 →
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="mt-8 p-6 bg-indigo-50 rounded-2xl border border-indigo-100 text-center max-w-lg mx-auto">
              <p className="text-indigo-800 mb-1">✨ 새로운 도구가 추가될 예정입니다!</p>
              <p className="text-indigo-600 text-sm">선생님들의 편의를 위해 계속 업데이트 됩니다.</p>
            </div>
          </div>
        );
    }
  };

  const isFullScreenGame = currentGame === 'INITIAL_QUIZ' || currentGame === 'FOUR_LETTER_QUIZ' || currentGame === 'BODY_TALK' || currentGame === 'RELAY_TALK';

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col items-center ${isFullScreenGame ? 'p-0' : 'py-10 px-4'}`}>
      {renderContent()}

      {currentGame === 'HOME' && (
        <footer className="mt-auto pt-10 text-center text-slate-400 text-sm pb-8">
          <p>&copy; {new Date().getFullYear()} Class Play Tools. All rights reserved.</p>
        </footer>
      )}
    </div>
  );
};

export default App;