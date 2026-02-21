import React, { useState, useEffect, useRef } from 'react';
import { Home, Timer, Check, XCircle, Lock, Trophy, ArrowRight, AlertCircle, RefreshCw, Play, Mic } from 'lucide-react';

interface Props {
  onBack: () => void;
}

// --- Data ---
type Difficulty = '상' | '중' | '하';

interface Topic {
  id: string;
  title: string;
  emoji: string;
  difficulty: Difficulty;
  words: string[];
}

const TOPICS: Topic[] = [
  {
    id: 'animal',
    title: '동물',
    emoji: '🦁',
    difficulty: '하',
    words: [
      '사자', '호랑이', '코끼리', '기린', '판다', '펭귄', '캥거루', '독수리', '타조', '카피바라', 
      '수달', '고래', '상어', '해파리', '거북이', '카멜레온', '나무늘보', '하마', '악어', '얼룩말', 
      '고슴도치', '다람쥐', '미어캣', '북극곰', '낙타', '코뿔소', '공룡', '앵무새', '부엉이', '박쥐', 
      '지렁이', '달팽이', '개구리', '도마뱀', '불가사리', '가오리', '물개', '해마', '오리너구리', '알파카', 
      '치타', '하이에나', '늑대', '여우', '너구리', '햄스터', '토끼', '사슴', '멧돼지', '고릴라'
    ]
  },
  {
    id: 'food',
    title: '음식',
    emoji: '🍕',
    difficulty: '하',
    words: [
      '떡볶이', '마라탕', '탕후루', '비빔밥', '돈가스', '피자', '치킨', '짜장면', '짬뽕', '햄버거', 
      '삼겹살', '김밥', '라면', '불닭볶음면', '스테이크', '초밥', '샌드위치', '샐러드', '카레', '샤브샤브', 
      '붕어빵', '호떡', '츄러스', '마카롱', '빙수', '아이스크림', '푸딩', '젤리', '솜사탕', '팝콘', 
      '미역국', '된장찌개', '김치찌개', '계란말이', '감자튀김', '닭강정', '족발', '보쌈', '냉면', '콩국수', 
      '만두', '꽈배기', '소떡소떡', '핫도그', '시리얼', '토스트', '요거트', '샤인머스캣', '망고', '수박'
    ]
  },
  {
    id: 'sports',
    title: '스포츠/취미',
    emoji: '⚽',
    difficulty: '중',
    words: [
      '축구', '야구', '농구', '배구', '피구', '배드민턴', '테니스', '탁구', '골프', '볼링', 
      '양궁', '사격', '펜싱', '태권도', '유도', '레슬링', '씨름', '복싱', '수영', '다이빙', 
      '피겨 스케이팅', '쇼트트랙', '스키', '스노보드', '봅슬레이', '컬링', '육상', '높이뛰기', '멀리뛰기', '마라톤', 
      '체조', '리듬체조', '발레', '힙합댄스', '등산', '낚시', '캠핑', '자전거', '인라인 스케이트', '스케이트보드', 
      '줄넘기', '요가', '필라테스', '바둑', '장기', '체스', '독서', '영화감상', '사진찍기', '악기연주'
    ]
  },
  {
    id: 'school',
    title: '학교생활',
    emoji: '🏫',
    difficulty: '하',
    words: [
      '급식', '쉬는 시간', '점심 시간', '체육대회', '현장체험학습', '수학여행', '방학', '개학', '짝꿍', '담임 선생님', 
      '교실', '운동장', '강당', '도서관', '보건실', '과학실', '음악실', '교무실', '교과서', '공책', 
      '필통', '연필', '지우개', '샤프', '형광펜', '자', '컴퍼스', '색종이', '풀', '가위', 
      '칠판', '분필', '시간표', '알림장', '숙제', '받아쓰기', '단원평가', '성적표', '반장', '주번', 
      '실내화', '책가방', '사물함', '청소 시간', '우유 급식', '방송부', '동아리', '교복', '졸업식', '입학식'
    ]
  },
  {
    id: 'job',
    title: '직업',
    emoji: '👨‍⚕️',
    difficulty: '중',
    words: [
      '유튜버', '프로게이머', '웹툰 작가', '의사', '간호사', '요리사', '소방관', '경찰관', '군인', '판사', 
      '변호사', '선생님', '과학자', '우주비행사', '비행기 조종사', '승무원', '가수', '아이돌', '배우', '개그맨', 
      '운동선수', '피아니스트', '화가', '건축가', '외교관', '대통령', '아나운서', '기자', '기상캐스터', '사진작가', 
      '수의사', '사육사', '제빵사', '미용사', '마술사', '탐정', '고고학자', '프로그래머', 'AI 개발자', '로봇 공학자', 
      '패션 디자이너', '모델', '성우', '작곡가', '통역사', '농부', '어부', '환경미화원', '택배 기사', '은행원'
    ]
  },
  {
    id: 'place',
    title: '장소/나라',
    emoji: '🌏',
    difficulty: '중',
    words: [
      '공항', '기차역', '지하철', '편의점', '마트', '백화점', '영화관', '놀이공원', '동물원', '수족관', 
      '은행', '병원', '약국', '우체국', '경찰서', '소방서', '도서관', '박물관', '미술관', '해수욕장', 
      '산', '강', '바다', '폭포', '동굴', '제주도', '독도', '경주', '서울', '부산', 
      '대한민국', '미국', '일본', '중국', '영국', '프랑스', '이탈리아', '독일', '브라질', '호주', 
      '에펠탑', '자유의 여신상', '피라미드', '만리장성', '콜로세움', '남산타워', '롯데월드', '에버랜드', '우주 정거장', '무인도'
    ]
  },
  {
    id: 'movie',
    title: '영화/캐릭터',
    emoji: '🎬',
    difficulty: '중',
    words: [
      '피카츄', '파이리', '꼬부기', '시나모롤', '쿠로미', '마이멜로디', '짱구', '도라에몽', '명탐정 코난', '귀멸의 칼날', 
      '아이언맨', '스파이더맨', '헐크', '캡틴 아메리카', '배트맨', '슈퍼맨', '엘사', '안나', '올라프', '미키마우스', 
      '곰돌이 푸', '해리포터', '헤르미온느', '볼드모트', '루피', '쵸파', '나루토', '슬램덩크', '이웃집 토토로', '센과 치히로', 
      '미니언즈', '슈렉', '쿵푸팬더', '인사이드 아웃', '기쁨이', '슬픔이', '까칠이', '소심이', '버럭이', '포켓몬스터', 
      '신비아파트', '캐치 티니핑', '하츄핑', '브레드 이발소', '펭수', '뽀로로', '타요', '카봇', '스타워즈', '아바타'
    ]
  },
  {
    id: 'science',
    title: '과학/상식',
    emoji: '🔬',
    difficulty: '상',
    words: [
      '태양', '지구', '달', '화성', '목성', '토성', '수성', '금성', '천왕성', '해왕성', 
      '블랙홀', '은하수', '별똥별', '북극성', '광합성', '산소', '이산화탄소', '수소', '질소', '중력', 
      '자석', '전기', '정전기', '화산', '지진', '쓰나미', '태풍', '토네이도', '오로라', '무지개', 
      '현미경', '망원경', '돋보기', '소화기', '화석', '공룡', '진화', '인공지능', '로봇', '드론', 
      '가상현실', '메타버스', '3D 프린터', '코딩', '알고리즘', '박테리아', '바이러스', '백신', '혈액형', '유전자'
    ]
  },
  {
    id: 'digital',
    title: '디지털/IT',
    emoji: '💻',
    difficulty: '중',
    words: [
      '스마트폰', '태블릿', '노트북', '컴퓨터', '와이파이', '블루투스', '배터리', '충전기', '이어폰', '스마트워치', 
      '유튜브', '틱톡', '인스타그램', '카카오톡', '네이버', '구글', '넷플릭스', '로블록스', '마인크래프트', '브롤스타즈', 
      '챗GPT', '검색', '로그인', '비밀번호', '아이디', '해킹', '보안', '업데이트', '앱스토어', '이모티콘', 
      '구독', '좋아요', '알림설정', '댓글', '공유하기', '캡처', '링크', '폴더', '바탕화면', '마우스', 
      '키보드', '스피커', '카메라', '셀카', '필터', '영상통화', '온라인 수업', '줌', '키오스크', '코딩'
    ]
  },
  {
    id: 'action',
    title: '행동/동사',
    emoji: '🏃',
    difficulty: '중',
    words: [
      '양치하기', '세수하기', '머리감기', '졸음 참기', '라면 먹기', '뜨거운 것 먹기', '매운 것 먹기', '레몬 먹기', '요리하기', '설거지하기', 
      '빨래 널기', '청소기 돌리기', '바닥 닦기', '옷 입기', '신발 끈 묶기', '가방 메기', '자전거 타기', '줄넘기 하기', '수영하기', '달리기', 
      '춤추기', '노래하기', '피아노 치기', '기타 치기', '드럼 치기', '사진 찍기', '셀카 찍기', '게임하기', '문자 보내기', '전화하기', 
      '책 읽기', '공부하기', '시험 보기', '하품하기', '기지개 켜기', '소름 돋기', '부끄러워하기', '화내기', '울기', '크게 웃기', 
      '낚시하기', '야구 배트 휘두르기', '축구공 차기', '농구 슛 하기', '볼링 치기', '스키 타기', '썰매 타기', '역기 들기', '명상하기', '보물찾기'
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
  timeTaken: number; // milliseconds (adjusted)
  realTimeTaken: number; // milliseconds (actual duration)
  score: number; // Correct answers
  topicTitle: string;
  difficulty: Difficulty;
}

export const SpeedQuiz: React.FC<Props> = ({ onBack }) => {
  // Global State
  const [step, setStep] = useState<Step>('INTRO');
  const [teamCount, setTeamCount] = useState(2);
  const [currentTeamIdx, setCurrentTeamIdx] = useState(0);
  const [teamResults, setTeamResults] = useState<TeamResult[]>([]);
  const [takenTopics, setTakenTopics] = useState<Set<string>>(new Set());
  
  // Game Play State
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
  const [gameWords, setGameWords] = useState<string[]>([]); // Current pool
  const [currentWord, setCurrentWord] = useState('');
  const [correctCount, setCorrectCount] = useState(0);
  const [passCount, setPassCount] = useState(0);
  const [questionCount, setQuestionCount] = useState(0); // Track number of questions attempted (max 10)
  
  // Timing
  const [startTime, setStartTime] = useState(0); // Adjusted start time (includes handicap)
  const [realStartTime, setRealStartTime] = useState(0); // Actual start time
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

  const getHandicapTime = (difficulty: Difficulty) => {
    switch (difficulty) {
      case '하': return 60000; // 1 minute
      case '중': return 30000; // 30 seconds
      case '상': return 0;     // 0 seconds
      default: return 0;
    }
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

  const selectTopic = (topic: Topic) => {
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
    const handicap = currentTopic ? getHandicapTime(currentTopic.difficulty) : 0;
    
    setRealStartTime(now);
    setStartTime(now - handicap); // Shift start time back by handicap
    setCurrentTime(now);
    setQuestionStartTime(now);
  };

  const finishTurn = (finalCorrect: number) => {
    const now = Date.now();
    const finalTime = now - startTime; // Includes handicap
    const realDuration = now - realStartTime; // Actual duration

    const result: TeamResult = {
      teamIndex: currentTeamIdx,
      timeTaken: finalTime,
      realTimeTaken: realDuration,
      score: finalCorrect,
      topicTitle: currentTopic?.title || '',
      difficulty: currentTopic?.difficulty || '중'
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
  const handleSwapWord = () => {
    const nextWords = gameWords.slice(1);
    setGameWords(nextWords);
    setCurrentWord(nextWords[0]);
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
       
       <div className="text-9xl mb-6 animate-bounce">🎤</div>
       <h1 className="text-6xl md:text-8xl text-white mb-6 drop-shadow-lg" style={{ fontFamily: '"Black Han Sans", sans-serif' }}>
         스피드 퀴즈
       </h1>
       <p className="text-2xl text-white/90 mb-10 font-jua">
         말을 할 수 있는 스피드 퀴즈! 난이도에 따라 시작 시간이 다릅니다.
       </p>
       
       <div className="bg-white/20 backdrop-blur-md rounded-3xl p-8 max-w-2xl w-full mb-10 text-left border border-white/10 shadow-xl">
          <h3 className="text-3xl text-yellow-300 mb-6 font-black-han">📜 게임 규칙</h3>
          <ul className="space-y-4 text-xl text-white font-jua">
            <li className="flex items-start gap-3">
              <span className="text-2xl">⚡</span>
              <span>총 <strong>10문제</strong>가 제시됩니다. 많이 맞히는 팀이 승리!</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">⏱️</span>
              <span><strong>난이도별 핸디캡</strong>: 하(1분), 중(30초), 상(0초) 부터 시작!</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">🏆</span>
              <span>순위 기준: <strong>1순위 정답 개수</strong>, 2순위 기록(짧은 순)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">⏳</span>
              <span>한 문제당 <strong>40초</strong> 제한, 패스는 <strong>팀당 2회</strong></span>
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
                  let diffColor = 'bg-green-500';
                  if (topic.difficulty === '중') diffColor = 'bg-yellow-500';
                  if (topic.difficulty === '상') diffColor = 'bg-red-500';

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
                      <div className={`absolute top-2 right-2 px-2 py-0.5 rounded text-xs text-white font-bold ${diffColor}`}>
                        {topic.difficulty}
                      </div>
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
         <p className="text-3xl text-yellow-300 font-jua mb-4">
            주제: {currentTopic?.emoji} {currentTopic?.title}
         </p>
         <div className="inline-block bg-black/30 px-6 py-2 rounded-full text-white text-xl font-jua mb-12">
            난이도: {currentTopic?.difficulty} (시작 시간: {formatTime(getHandicapTime(currentTopic?.difficulty || '중'))})
         </div>

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
               주제: {currentTopic?.title} ({currentTopic?.difficulty})
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
                           <span className="text-slate-500 font-jua text-sm">({result.topicTitle} - {result.difficulty})</span>
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
      <div className="min-h-screen w-full bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500 flex flex-col font-sans overflow-hidden">
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
