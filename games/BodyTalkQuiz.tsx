import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Home, Timer, Check, XCircle, Lock, Trophy, ArrowRight, AlertCircle, RefreshCw, Play } from 'lucide-react';
import { Button } from '../components/Button';

interface Props {
  onBack: () => void;
}

// --- Data ---
const TOPICS = [
  {
    id: 'animal',
    title: '동물',
    emoji: '🦁',
    words: [
      '토끼', '코끼리', '사자', '펭귄', '기린', '판다', '개구리', '독수리', '캥거루', '뱀', 
      '원숭이', '호랑이', '고릴라', '얼룩말', '하마', '악어', '타조', '부엉이', '다람쥐', '거북이', 
      '고래', '상어', '문어', '불가사리', '해파리', '카멜레온', '공룡', '닭', '병아리', '돼지', 
      '소', '양', '염소', '말', '당나귀', '낙타', '곰', '북극곰', '여우', '늑대', 
      '너구리', '두더지', '박쥐', '달팽이', '나비', '벌', '잠자리', '개미', '메뚜기', '무당벌레'
    ]
  },
  {
    id: 'food',
    title: '음식',
    emoji: '🍕',
    words: [
      '떡볶이', '스파게티', '아이스크림', '수박', '탕수육', '피자', '레몬', '솜사탕', '라면', '치킨', 
      '김밥', '비빔밥', '불고기', '만두', '햄버거', '샌드위치', '핫도그', '도넛', '케이크', '초콜릿', 
      '사탕', '젤리', '팝콘', '붕어빵', '호떡', '스테이크', '카레', '돈가스', '짜장면', '짬뽕', 
      '계란후라이', '미역국', '된장찌개', '김치찌개', '포도', '딸기', '바나나', '사과', '오렌지', '멜론', 
      '파인애플', '복숭아', '감자튀김', '옥수수', '고구마', '우유', '주스', '콜라', '팥빙수', '와플'
    ]
  },
  {
    id: 'sports',
    title: '스포츠',
    emoji: '⚽',
    words: [
      '축구', '야구', '농구', '수영', '태권도', '피겨 스케이팅', '양궁', '역도', '탁구', '볼링', 
      '배구', '테니스', '배드민턴', '골프', '육상', '멀리뛰기', '높이뛰기', '씨름', '유도', '검도', 
      '펜싱', '복싱', '레슬링', '스키', '스노보드', '스케이트', '사이클', '마라톤', '체조', '봅슬레이', 
      '컬링', '핸드볼', '하키', '미식축구', '럭비', '서핑', '다이빙', '카누', '조정', '승마', 
      '사격', '줄다리기', '피구', '발야구', '티볼', '족구', '셔틀콕', '스쿼시', '요가', '에어로빅'
    ]
  },
  {
    id: 'job',
    title: '직업',
    emoji: '👨‍⚕️',
    words: [
      '경찰관', '소방관', '의사', '요리사', '유튜버', '선생님', '우주비행사', '마술사', '화가', '가수', 
      '간호사', '치과의사', '과학자', '운동선수', '군인', '조종사', '승무원', '아나운서', '기상캐스터', '배우', 
      '모델', '사진작가', '미용사', '패션디자이너', '프로그래머', '요리연구가', '제빵사', '농부', '어부', '환경미화원', 
      '집배원', '판사', '변호사', '사육사', '수의사', '작가', '만화가', '건축가', '탐정', '로봇공학자', 
      '드론조종사', '보디가드', '통역사', '고고학자', '도서관사서', '성우', '발레리나', '지휘자', '작곡가', '피아니스트'
    ]
  },
  {
    id: 'object',
    title: '물건',
    emoji: '🎁',
    words: [
      '우산', '안경', '스마트폰', '가위', '청소기', '자전거', '칫솔', '선풍기', '카메라', '배낭', 
      '연필', '지우개', '필통', '공책', '가방', '신발', '모자', '장갑', '목도리', '시계', 
      '거울', '빗', '드라이기', '컵', '숟가락', '젓가락', '텔레비전', '냉장고', '세탁기', '컴퓨터', 
      '마우스', '키보드', '책상', '의자', '침대', '베개', '이불', '인형', '주전자', '냄비', 
      '프라이팬', '다리미', '손전등', '돋보기', '자', '풀', '테이프', '계산기', '리모컨', '우표'
    ]
  },
  {
    id: 'character',
    title: '캐릭터',
    emoji: '🦸',
    words: [
      '피카츄', '도라에몽', '짱구', '엘사', '아이언맨', '스파이더맨', '루피', '뽀로로', '미니언즈', '티니핑', 
      '헬로키티', '마이멜로디', '시나모롤', '쿠로미', '폼폼푸린', '배트맨', '슈퍼맨', '헐크', '캡틴 아메리카', '토르', 
      '겨울왕국 안나', '올라프', '신데렐라', '백설공주', '인어공주', '라푼젤', '미키마우스', '미니마우스', '곰돌이 푸', '스폰지밥', 
      '뚱이', '징징이', '뽀로로 크롱', '잔망루피', '패티', '포비', '해리', '에디', '타요', '라바', 
      '카봇', '또봇', '파이리', '꼬부기', '잠만보', '뮤츠', '소닉', '마리오', '루이지', '샌즈'
    ]
  },
  {
    id: 'place',
    title: '장소',
    emoji: '🏰',
    words: [
      '놀이공원', '도서관', '수영장', '편의점', '학교', '병원', '캠핑장', '제주도', '화장실', '공항', 
      '영화관', '동물원', '식물원', '박물관', '미술관', '빵집', '은행', '경찰서', '소방서', '시장', 
      '마트', '카페', '산', '바다', '강', '공원', '운동장', '교실', '급식실', '음악실', 
      '과학실', '보건실', '지하철역', '기차역', '버스정류장', '아파트', '우리집', '문구점', '약국', '미용실', 
      '세탁소', '주차장', '서점', '등대', '남산타워', '63빌딩', '야구장', '축구경기장', '갯벌', '동굴'
    ]
  },
  {
    id: 'emotion',
    title: '감정/상태',
    emoji: '😊',
    words: [
      '졸림', '화남', '슬픔', '무서움', '부끄러움', '배고픔', '신남', '놀람', '피곤함', '간지러움', 
      '기쁨', '행복함', '짜증남', '귀찮음', '심심함', '궁금함', '답답함', '억울함', '얄미움', '사랑스러움', 
      '자랑스러움', '든든함', '편안함', '긴장됨', '떨림', '당황함', '외로움', '서운함', '미안함', '고마움', 
      '덥다', '춥다', '아프다', '쓰리다', '따갑다', '가렵다', '무겁다', '가볍다', '딱딱하다', '말랑하다', 
      '매끄럽다', '거칠다', '밝다', '어둡다', '멀다', '가깝다', '빠르다', '느리다', '강하다', '약하다'
    ]
  },
  {
    id: 'movie',
    title: '영화/만화',
    emoji: '🎬',
    words: [
      '겨울왕국', '알라딘', '토이스토리', '라이온킹', '슈렉', '쿵푸팬더', '이웃집 토토로', '센과 치히로의 행방불명', '귀멸의 칼날', '원피스', 
      '드래곤볼', '나루토', '명탐정 코난', '포켓몬스터', '짱구는 못말려', '도라에몽', '인사이드 아웃', '코코', '소울', '주토피아', 
      '모아나', '라푼젤', '신데렐라', '백설공주', '인어공주', '해리포터', '어벤져스', '스파이더맨', '아이언맨', '배트맨', 
      '슈퍼맨', '트랜스포머', '쥬라기 공원', '나홀로 집에', '아바타', '타이타닉', '스타워즈', '미니언즈', '마다가스카', '아이스 에이지', 
      '정글북', '피터팬', '피노키오', '덤보', '밤비', '타잔', '뮬란', '메리 포핀스', '니모를 찾아서', '몬스터 주식회사'
    ]
  },
  {
    id: 'school',
    title: '학교생활',
    emoji: '🏫',
    words: [
      '급식 시간', '받아쓰기', '체육 대회', '쉬는 시간', '숙제', '발표하기', '복도에서 뛰기', '우유 급식', '교장 선생님', '짝꿍', 
      '담임 선생님', '교문', '실내화', '가방걸이', '사물함', '알림장', '받아쓰기 공책', '수학 익힘책', '과학 실험', '음악 시간', 
      '미술 시간', '영어 시간', '학급 회의', '1인 1역', '청소 당번', '우유 상자', '급식판', '수저통', '교과서', '칠판', 
      '분필', '화이트보드', 'TV 화면', '태블릿 수업', '현장학습', '수학여행', '학예회', '졸업식', '입학식', '방학', 
      '개학', '시험', '받아쓰기 100점', '칭찬 스티커', '벌점', '반장 선거', '전교 회장', '짝피구', '이어달리기', '애국가'
    ]
  }
];

const TEAM_NAMES = ['1팀', '2팀', '3팀', '4팀', '5팀', '6팀', '7팀', '8팀'];
const TEAM_COLORS = [
  'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
  'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500'
];

type Step = 'INTRO' | 'TEAM_SELECT' | 'TOPIC_SELECT' | 'READY' | 'PLAYING' | 'RESULT';

interface TeamResult {
  teamIndex: number;
  timeTaken: number; // milliseconds
  score: number; // Correct answers
  topicTitle: string;
}

export const BodyTalkQuiz: React.FC<Props> = ({ onBack }) => {
  // Global State
  const [step, setStep] = useState<Step>('INTRO');
  const [teamCount, setTeamCount] = useState(2);
  const [currentTeamIdx, setCurrentTeamIdx] = useState(0);
  const [teamResults, setTeamResults] = useState<TeamResult[]>([]);
  const [takenTopics, setTakenTopics] = useState<Set<string>>(new Set());
  
  // Game Play State
  const [currentTopic, setCurrentTopic] = useState<typeof TOPICS[0] | null>(null);
  const [gameWords, setGameWords] = useState<string[]>([]); // Current pool
  const [currentWord, setCurrentWord] = useState('');
  const [correctCount, setCorrectCount] = useState(0);
  const [passCount, setPassCount] = useState(0);
  const [questionCount, setQuestionCount] = useState(0); // Track number of questions attempted (max 10)
  
  // Timing
  const [startTime, setStartTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(0);
  const [passUnlockProgress, setPassUnlockProgress] = useState(0); // 0 to 100
  const [questionTimeProgress, setQuestionTimeProgress] = useState(100); // 100 to 0 (40s)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Constants
  const TOTAL_QUESTIONS = 10;
  const WORD_TIME_LIMIT = 40000; // 40 seconds per word
  const PASS_UNLOCK_TIME = 20000; // 20 seconds to unlock pass

  // --- Helpers ---
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    const centis = Math.floor((ms % 1000) / 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${centis.toString().padStart(2, '0')}`;
  };

  const shuffle = (array: string[]) => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  // --- Effects ---

  // Main Timer & Game Loop
  useEffect(() => {
    if (step === 'PLAYING') {
      timerRef.current = setInterval(() => {
        const now = Date.now();
        setCurrentTime(now);
        
        const elapsedSinceQuestion = now - questionStartTime;

        // 1. Calculate Pass Unlock Progress (20s)
        const passProgress = Math.min(100, (elapsedSinceQuestion / PASS_UNLOCK_TIME) * 100);
        setPassUnlockProgress(passProgress);

        // 2. Calculate Question Time Progress (40s limit)
        const qProgress = Math.max(0, 100 - (elapsedSinceQuestion / WORD_TIME_LIMIT) * 100);
        setQuestionTimeProgress(qProgress);

        // 3. Auto-skip if time runs out
        if (elapsedSinceQuestion >= WORD_TIME_LIMIT) {
           handleTimeoutSkip();
        }
        
      }, 50);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step, questionStartTime]);

  // --- Handlers ---

  const handleStartGame = () => {
    setStep('TEAM_SELECT');
  };

  const confirmTeamCount = (count: number) => {
    setTeamCount(count);
    setCurrentTeamIdx(0);
    setTeamResults([]);
    setTakenTopics(new Set());
    setStep('TOPIC_SELECT');
  };

  const selectTopic = (topic: typeof TOPICS[0]) => {
    if (takenTopics.has(topic.id)) return;
    
    // Setup Game
    setCurrentTopic(topic);
    const shuffled = shuffle(topic.words);
    const initialPool = shuffled.slice(0, 50); // Take enough words
    setGameWords(initialPool);
    setCurrentWord(initialPool[0]);
    
    // Reset Counters
    setCorrectCount(0);
    setPassCount(0);
    setQuestionCount(0);
    
    // Mark Topic as Taken
    const newTaken = new Set(takenTopics);
    newTaken.add(topic.id);
    setTakenTopics(newTaken);
    
    setStep('READY'); // Go to Ready screen first
  };

  const startRound = () => {
    setStep('PLAYING');
    
    // Start Timers
    const now = Date.now();
    setStartTime(now);
    setCurrentTime(now);
    setQuestionStartTime(now);
  };

  const finishTurn = (finalCorrect: number) => {
    const finalTime = Date.now() - startTime;
    const result: TeamResult = {
      teamIndex: currentTeamIdx,
      timeTaken: finalTime,
      score: finalCorrect,
      topicTitle: currentTopic?.title || ''
    };
    
    const newResults = [...teamResults, result];
    setTeamResults(newResults);
    setStep('RESULT');
  };

  const moveToNextQuestion = (isCorrect: boolean) => {
    const newCorrectCount = isCorrect ? correctCount + 1 : correctCount;
    setCorrectCount(newCorrectCount);

    const nextQuestionCount = questionCount + 1;
    setQuestionCount(nextQuestionCount);

    if (nextQuestionCount >= TOTAL_QUESTIONS) {
      finishTurn(newCorrectCount);
    } else {
      // Next Word
      const nextWords = gameWords.slice(1);
      setGameWords(nextWords);
      setCurrentWord(nextWords[0]);
      setQuestionStartTime(Date.now()); 
    }
  };

  const handleCorrect = () => {
    moveToNextQuestion(true);
  };

  // Timeout acts as a wrong answer (count increases, but score doesn't)
  const handleTimeoutSkip = () => {
    moveToNextQuestion(false);
  };

  // Pass acts as a wrong answer (count increases, but score doesn't)
  const handlePass = () => {
    if (passCount >= 2) return;
    if (passUnlockProgress < 100) return; // Locked

    setPassCount(prev => prev + 1);
    moveToNextQuestion(false);
  };

  // Teacher Swap: Changes the word but DOES NOT count as pass or move to next question index.
  // It effectively "rerolls" the current question slot.
  const handleSwapWord = () => {
    // Get next word from pool but don't increment questionCount
    const nextWords = gameWords.slice(1);
    setGameWords(nextWords);
    setCurrentWord(nextWords[0]);
    // Reset timer for this specific question since it's a new word
    setQuestionStartTime(Date.now());
  };

  const handleNextTeam = () => {
    setCurrentTeamIdx(prev => prev + 1);
    setStep('TOPIC_SELECT');
  };

  const getPassButtonText = () => {
    if (passCount >= 2) return '패스 소진';
    const remainingSeconds = Math.ceil((PASS_UNLOCK_TIME - (Date.now() - questionStartTime)) / 1000);
    if (remainingSeconds > 0) return `${remainingSeconds}초 대기`;
    return '패스 사용';
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
       
       <div className="text-9xl mb-6 animate-bounce">🕺</div>
       <h1 className="text-6xl md:text-8xl text-white mb-6 drop-shadow-lg" style={{ fontFamily: '"Black Han Sans", sans-serif' }}>
         몸으로 말해요
       </h1>
       <p className="text-2xl text-white/90 mb-10 font-jua">
         말하지 않고 몸짓으로만 단어를 설명하세요!
       </p>
       
       <div className="bg-white/20 backdrop-blur-md rounded-3xl p-8 max-w-2xl w-full mb-10 text-left border border-white/10 shadow-xl">
          <h3 className="text-3xl text-yellow-300 mb-6 font-black-han">📜 게임 규칙</h3>
          <ul className="space-y-4 text-xl text-white font-jua">
            <li className="flex items-start gap-3">
              <span className="text-2xl">⚡</span>
              <span>총 <strong>10문제</strong>가 제시됩니다. 많이 맞히는 팀이 승리!</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">🏆</span>
              <span>순위 기준: <strong>1순위 정답 개수</strong>, 2순위 소요 시간</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">⏳</span>
              <span>한 문제당 <strong>40초</strong>가 지나면 <span className="text-red-300">오답</span> 처리됩니다.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">🔄</span>
              <span><strong>패스</strong>는 <span className="text-yellow-300">팀당 2회</span> 사용 가능하며, 사용 시 <span className="text-red-300">오답</span> 처리됩니다.</span>
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
      <div className="grid grid-cols-4 gap-6 max-w-4xl w-full">
        {[2, 3, 4, 5, 6, 7, 8].map(num => (
          <button
            key={num}
            onClick={() => confirmTeamCount(num)}
            className={`
               aspect-square rounded-3xl text-5xl font-black-han shadow-lg transition-all
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

  const renderTopicSelect = () => {
    // Current Rankings Component
    const Rankings = () => {
      const sorted = [...teamResults].sort((a, b) => b.score - a.score || a.timeTaken - b.timeTaken);
      return (
        <div className="bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-white/10 w-full h-full flex flex-col">
          <div className="flex items-center gap-2 text-yellow-400 mb-4 border-b border-white/10 pb-2">
             <Trophy size={20} /> <span className="font-bold font-jua text-lg">실시간 순위</span>
          </div>
          {sorted.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-white/40 font-jua">
              아직 기록이 없습니다
            </div>
          ) : (
            <div className="flex flex-col gap-2 overflow-y-auto pr-1 custom-scrollbar">
               {sorted.map((res, i) => (
                 <div key={i} className="flex items-center justify-between bg-white/10 rounded-lg p-2 text-sm">
                    <div className="flex items-center gap-2">
                       <span className="font-bold text-white/50 w-4 text-center">{i + 1}</span>
                       <span className={`w-2 h-2 rounded-full ${TEAM_COLORS[res.teamIndex]}`} />
                       <span className="text-white font-jua">{TEAM_NAMES[res.teamIndex]}</span>
                    </div>
                    <div className="text-white text-right">
                       <span className="text-yellow-300 font-bold mr-2">{res.score}점</span>
                       <span className="text-xs text-white/50">{formatTime(res.timeTaken)}</span>
                    </div>
                 </div>
               ))}
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="flex-1 flex flex-col p-6 animate-fade-in w-full max-w-7xl mx-auto relative pt-20">
        <button 
            onClick={onBack}
            className="absolute top-6 left-6 px-6 py-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white text-lg font-bold backdrop-blur-md border border-white/20 shadow-lg hover:scale-105 transition-all flex items-center gap-2 z-20"
            style={{ fontFamily: '"Jua", sans-serif' }}
         >
            <Home size={24} /> <span>홈으로</span>
        </button>

        <div className="w-full flex flex-col lg:flex-row gap-6 h-full min-h-[500px]">
           {/* Left: Topic Grid */}
           <div className="flex-[3] flex flex-col">
              <div className="w-full flex justify-between items-center mb-6 bg-black/20 p-4 rounded-2xl backdrop-blur-sm">
                 <h2 className="text-3xl md:text-4xl text-white font-jua">
                   <span className={`${TEAM_COLORS[currentTeamIdx]} px-4 py-1 rounded-lg mr-3 shadow-sm`}>{TEAM_NAMES[currentTeamIdx]}</span> 
                   주제를 선택하세요
                 </h2>
                 <div className="text-white/80 font-jua">
                   {currentTeamIdx + 1} / {teamCount} 팀 순서
                 </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 w-full auto-rows-fr">
                {TOPICS.map(topic => {
                  const isTaken = takenTopics.has(topic.id);
                  return (
                    <button
                      key={topic.id}
                      onClick={() => selectTopic(topic)}
                      disabled={isTaken}
                      className={`
                        relative rounded-2xl p-4 flex flex-col items-center justify-center gap-3 transition-all min-h-[140px]
                        border-4 shadow-lg
                        ${isTaken 
                          ? 'bg-slate-700/50 border-slate-600 grayscale opacity-60 cursor-not-allowed' 
                          : 'bg-white hover:bg-yellow-50 hover:scale-[1.02] border-yellow-400 cursor-pointer'}
                      `}
                    >
                      <span className="text-5xl">{topic.emoji}</span>
                      <span className={`text-xl font-black-han ${isTaken ? 'text-slate-400' : 'text-slate-800'}`}>
                        {topic.title}
                      </span>
                      {isTaken && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
                          <span className="bg-red-500 text-white px-3 py-1 rounded font-bold">선택완료</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
           </div>

           {/* Right: Rankings (Sidebar) */}
           <div className="flex-1 min-w-[280px] lg:max-w-xs">
              <Rankings />
           </div>
        </div>
      </div>
    );
  };

  const renderReady = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-6 animate-fade-in relative">
      <button 
          onClick={() => setStep('TOPIC_SELECT')}
          className="absolute top-6 left-6 px-6 py-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white text-lg font-bold backdrop-blur-md border border-white/20 shadow-lg hover:scale-105 transition-all flex items-center gap-2 z-20"
          style={{ fontFamily: '"Jua", sans-serif' }}
       >
          <ArrowRight className="rotate-180" size={24} /> <span>주제 다시 선택</span>
      </button>

      <div className="text-center animate-bounce-in">
         <div className="mb-6">
            <span className={`text-3xl md:text-5xl font-black-han text-white px-8 py-3 rounded-full ${TEAM_COLORS[currentTeamIdx]} shadow-lg`}>
               {TEAM_NAMES[currentTeamIdx]}
            </span>
         </div>
         
         <h2 className="text-7xl md:text-9xl text-white font-black-han mb-4 drop-shadow-xl">
            준비
         </h2>
         <p className="text-3xl text-yellow-300 font-jua mb-12">
            주제: {currentTopic?.emoji} {currentTopic?.title}
         </p>

         <button
            onClick={startRound}
            className="group relative bg-white text-indigo-600 text-4xl md:text-5xl px-16 py-8 rounded-full font-black-han shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:scale-105 hover:shadow-[0_0_60px_rgba(255,255,255,0.6)] transition-all overflow-hidden"
         >
            <span className="relative z-10 flex items-center gap-4">
               <Play fill="currentColor" size={48} /> 도전하기
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-200 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
         </button>
      </div>
    </div>
  );

  const renderPlaying = () => {
    const isPassLocked = passUnlockProgress < 100;
    const canPass = passCount < 2;
    const isUrgent = questionTimeProgress < 12.5; // Less than 5 seconds (12.5% of 40s)

    return (
      <div className={`flex-1 flex flex-col w-full h-full animate-fade-in relative overflow-hidden transition-colors duration-500 ${isUrgent ? 'bg-red-900/30' : ''}`}>
        {/* Urgent Overlay Flash */}
        {isUrgent && (
           <div className="absolute inset-0 border-[20px] border-red-500/50 animate-pulse pointer-events-none z-0" />
        )}
        
        {/* Question Time Limit Bar */}
        <div className="absolute top-0 left-0 w-full h-3 bg-slate-800 z-20">
           <div 
             className={`h-full transition-all duration-100 linear ${isUrgent ? 'bg-red-500' : 'bg-green-500'}`}
             style={{ width: `${questionTimeProgress}%` }}
           />
        </div>

        {/* Top Bar */}
        <div className="flex justify-between items-center p-6 z-10 pt-8">
          <div className="flex items-center gap-4">
             <button 
               onClick={onBack}
               className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold flex items-center gap-2"
               style={{ fontFamily: '"Jua", sans-serif' }}
             >
                <Home size={20} />
             </button>
             <span className={`text-3xl text-white font-black-han px-6 py-2 rounded-full ${TEAM_COLORS[currentTeamIdx]} shadow-lg`}>
               {TEAM_NAMES[currentTeamIdx]}
             </span>
             <span className="text-2xl text-white/80 font-jua bg-black/30 px-4 py-2 rounded-full hidden md:inline">
               주제: {currentTopic?.title}
             </span>
          </div>
          <div className={`flex items-center gap-2 bg-black/40 px-6 py-3 rounded-2xl border border-white/10 transition-transform ${isUrgent ? 'scale-110 border-red-500 bg-red-900/50' : ''}`}>
             {isUrgent ? <AlertCircle className="text-red-400 w-8 h-8 animate-bounce" /> : <Timer className="text-yellow-400 w-8 h-8" />}
             <span className={`text-4xl text-white font-mono font-bold tracking-wider ${isUrgent ? 'text-red-300' : ''}`}>
               {formatTime(currentTime - startTime)}
             </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center z-10">
           {/* Question Counter */}
           <div className="text-white/60 font-jua text-xl mb-4">
              문제 {questionCount + 1} / {TOTAL_QUESTIONS}
           </div>

           {/* Progress Dots */}
           <div className="flex gap-2 mb-8">
              {Array.from({ length: TOTAL_QUESTIONS }).map((_, i) => (
                <div 
                  key={i} 
                  className={`w-4 h-4 rounded-full border border-white/30 transition-all 
                    ${i < correctCount ? 'bg-green-500 border-green-400' : i < questionCount ? 'bg-red-500 border-red-400' : 'bg-white/10'}
                  `}
                />
              ))}
           </div>

           {/* The Word */}
           <div className={`bg-white rounded-[3rem] shadow-2xl px-12 md:px-20 py-16 mb-12 border-8 border-indigo-200 transform hover:scale-[1.01] transition-transform relative overflow-hidden ${isUrgent ? 'animate-pulse' : ''} min-w-[80%] max-w-[95%] text-center`}>
              {/* Swap Button for Teacher */}
              <button 
                 onClick={handleSwapWord}
                 className="absolute top-4 right-4 text-white bg-rose-500 hover:bg-rose-600 p-3 rounded-full transition-all shadow-lg hover:scale-110 z-20 border-4 border-rose-200"
                 title="문제 교체 (점수/카운트 영향 없음)"
              >
                 <RefreshCw size={32} strokeWidth={3} />
              </button>

              <h1 className="text-[10rem] md:text-[13rem] leading-none font-black-han text-slate-800 tracking-tight text-center relative z-10 break-keep">
                {currentWord}
              </h1>
           </div>

           {/* Controls */}
           <div className="flex gap-8 w-full max-w-4xl px-6">
              <button
                 onClick={handlePass}
                 disabled={!canPass || isPassLocked}
                 className={`
                   flex-1 py-8 rounded-3xl text-3xl font-black-han flex flex-col items-center justify-center gap-2 transition-all border-b-8 active:border-b-0 active:translate-y-2 relative overflow-hidden
                   ${!canPass 
                      ? 'bg-slate-500 border-slate-700 text-slate-300 cursor-not-allowed' 
                      : isPassLocked 
                        ? 'bg-slate-600 border-slate-800 text-slate-400 cursor-not-allowed'
                        : 'bg-yellow-400 border-yellow-600 text-yellow-900 hover:bg-yellow-300'
                   }
                 `}
              > 
                {isPassLocked && canPass && (
                   <div 
                     className="absolute bottom-0 left-0 h-2 bg-white/50 transition-all duration-100 ease-linear" 
                     style={{ width: `${passUnlockProgress}%` }}
                   />
                )}
                <div className="flex items-center gap-2">
                   {isPassLocked && canPass && <Lock size={28} />}
                   {!canPass && <XCircle size={28} />}
                   <span>{getPassButtonText()}</span>
                </div>
                <span className="text-lg opacity-70 font-sans">({2 - passCount}회 남음)</span>
              </button>

              <button
                 onClick={handleCorrect}
                 className="flex-[2] bg-green-500 border-green-700 text-white py-8 rounded-3xl text-5xl font-black-han flex items-center justify-center gap-4 transition-all border-b-8 hover:bg-green-400 active:border-b-0 active:translate-y-2 shadow-xl"
              >
                 <Check size={48} strokeWidth={4} />
                 정답!
              </button>
           </div>
        </div>
      </div>
    );
  };

  const renderResult = () => {
    // Sort results: Correct Count (desc) -> Time (asc)
    const sortedResults = [...teamResults].sort((a, b) => b.score - a.score || a.timeTaken - b.timeTaken);
    
    // Check if current team just finished
    const justFinished = teamResults.length > currentTeamIdx; 
    // Check if game is completely over
    const isGameOver = teamResults.length === teamCount;

    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 animate-fade-in relative">
         <button 
            onClick={onBack}
            className="absolute top-6 left-6 px-6 py-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white text-lg font-bold backdrop-blur-md border border-white/20 shadow-lg hover:scale-105 transition-all flex items-center gap-2 z-20"
            style={{ fontFamily: '"Jua", sans-serif' }}
         >
            <Home size={24} /> <span>홈으로</span>
         </button>

         <h2 className="text-6xl text-white font-black-han mb-8 drop-shadow-lg">🎉 경기 결과</h2>

         <div className="flex flex-col gap-4 w-full max-w-3xl mb-8">
            {sortedResults.length === 0 ? (
               <div className="text-center text-white/50 text-2xl py-10 font-jua">아직 경기 기록이 없습니다</div>
            ) : sortedResults.map((result, idx) => {
               const rank = idx + 1;
               const isWinner = rank === 1;
               return (
                  <div 
                    key={result.teamIndex}
                    className={`
                      flex items-center p-6 rounded-3xl border-4 shadow-lg transform transition-all
                      ${isWinner ? 'bg-white border-yellow-400 z-10 scale-105' : 'bg-white/90 border-transparent'}
                    `}
                  >
                     <div className={`
                       w-16 h-16 rounded-full flex items-center justify-center text-3xl font-black mr-6
                       ${isWinner ? 'bg-yellow-400 text-yellow-900' : 'bg-slate-200 text-slate-500'}
                     `}>
                       {rank}
                     </div>
                     <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                           <span className={`px-3 py-1 rounded-lg text-white font-bold ${TEAM_COLORS[result.teamIndex]}`}>
                             {TEAM_NAMES[result.teamIndex]}
                           </span>
                           <span className="text-slate-500 font-jua text-sm">({result.topicTitle})</span>
                        </div>
                        <div className="flex items-end gap-2">
                           <span className="text-4xl font-black-han text-indigo-900">{result.score}점</span>
                           <span className="text-lg text-slate-500 font-mono mb-1">({formatTime(result.timeTaken)})</span>
                        </div>
                     </div>
                     {isWinner && <div className="text-5xl animate-bounce">🏆</div>}
                  </div>
               );
            })}
         </div>

         {/* Navigation Buttons based on state */}
         <div className="flex gap-4">
             {!isGameOver && justFinished && (
               <button 
                 onClick={handleNextTeam}
                 className="bg-green-500 text-white px-12 py-5 rounded-full text-2xl font-black-han hover:bg-green-400 transition-colors shadow-lg flex items-center gap-3 animate-pulse"
               >
                 다음 팀 도전하기 <ArrowRight />
               </button>
             )}
             
             {!isGameOver && !justFinished && (
               <button 
                 onClick={() => setStep('TOPIC_SELECT')}
                 className="bg-slate-600 text-white px-10 py-4 rounded-full text-xl font-jua hover:bg-slate-500 transition-colors shadow-lg"
               >
                 주제 선택으로 돌아가기
               </button>
             )}

             {isGameOver && (
               <button 
                 onClick={() => setStep('INTRO')}
                 className="bg-slate-800 text-white px-12 py-4 rounded-full text-xl font-jua hover:bg-slate-700 transition-colors shadow-lg"
               >
                 최종 결과 / 처음으로
               </button>
             )}
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
      `}</style>
      <div className="min-h-screen w-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex flex-col font-sans overflow-hidden">
        {step === 'INTRO' && renderIntro()}
        {step === 'TEAM_SELECT' && renderTeamSelect()}
        {step === 'TOPIC_SELECT' && renderTopicSelect()}
        {step === 'READY' && renderReady()}
        {step === 'PLAYING' && renderPlaying()}
        {step === 'RESULT' && renderResult()}
      </div>
    </>
  );
};