import React, { useState } from 'react';
import { GameId, GameInfo } from './types';
import { RockPaperScissors } from './games/RockPaperScissors';
import { OneStepTag } from './games/OneStepTag';
import { Scoreboard } from './games/Scoreboard';

// 게임 목록 정의
const GAMES: GameInfo[] = [
  {
    id: 'SCOREBOARD',
    title: '점수판',
    description: '교실놀이나 체육시간에 활용하세요',
    emoji: '🏆',
    color: 'from-emerald-400 to-teal-500'
  },
  {
    id: 'RPS',
    title: '랜덤 가위바위보',
    description: '랜덤으로 가위바위보가 제시됩니다',
    emoji: '✌️',
    color: 'from-yellow-400 to-orange-500'
  },
  {
    id: 'TAG',
    title: '체스 술래잡기',
    description: '이종대왕 체스 술래잡기때 활용하세요',
    emoji: '🏃',
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
      case 'RPS':
        return <RockPaperScissors onBack={goHome} />;
      case 'TAG':
        return <OneStepTag onBack={goHome} />;
      default:
        return (
          <div className="flex flex-col items-center w-full max-w-4xl animate-fade-in">
            <header className="mb-12 text-center">
              <h1 className="text-4xl md:text-6xl font-black text-slate-800 mb-4 tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">미니게임</span> 천국
              </h1>
              <p className="text-slate-500 text-lg">
                심심할 때 즐기는 초간단 웹 게임 모음집
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full px-4">
              {GAMES.map((game) => (
                <button
                  key={game.id}
                  onClick={() => handleGameSelect(game.id)}
                  className="group relative flex flex-col items-center p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-slate-100 overflow-hidden text-left"
                >
                  {/* Decorative Background */}
                  <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${game.color}`} />
                  <div className={`absolute -right-10 -bottom-10 w-40 h-40 bg-gradient-to-br ${game.color} opacity-10 rounded-full group-hover:scale-150 transition-transform duration-500`} />

                  <div className="text-7xl mb-6 transform group-hover:scale-110 transition-transform duration-300 filter drop-shadow-sm">
                    {game.emoji}
                  </div>
                  
                  <h2 className="text-2xl font-black text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
                    {game.title}
                  </h2>
                  <p className="text-slate-500 text-center px-4 font-medium">
                    {game.description}
                  </p>
                  
                  <div className="mt-8 px-6 py-2 rounded-full bg-slate-100 text-slate-600 font-bold text-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    게임 시작하기 →
                  </div>
                </button>
              ))}
            </div>
            
            <div className="mt-16 p-6 bg-indigo-50 rounded-2xl border border-indigo-100 text-center max-w-lg">
              <p className="text-indigo-800 font-bold mb-1">✨ 새로운 게임이 추가될 예정입니다!</p>
              <p className="text-indigo-600 text-sm">자주 방문해서 확인해주세요.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4">
      {renderContent()}

      <footer className="mt-auto pt-10 text-center text-slate-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Mini Game Portal. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;