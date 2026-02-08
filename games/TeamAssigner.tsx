import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Users, Save, Trash2, Shuffle, Plus, Settings, X, Loader2, UserMinus, ShieldAlert, CheckCircle2, UserPlus } from 'lucide-react';
import { Button } from '../components/Button';
import { db } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface Props {
  onBack: () => void;
}

type Gender = 'MALE' | 'FEMALE';

interface Student {
  id: string;
  name: string;
  gender: Gender;
}

type TeamMode = '2TEAM' | '4TEAM';

interface ConditionPair {
  id: string;
  studentIds: string[]; // 2 students who must be separated
  type: 'PAIR_SEPARATE';
}

interface ConditionGroup {
  id: string;
  studentIds: string[]; // 4 students who must be separated
  type: 'GROUP_SEPARATE';
}

// Simplified steps: MAIN (Dashboard) | SETTINGS (Manage) | RESULT
type ViewState = 'MAIN' | 'SETTINGS' | 'RESULT';
type SettingsTab = 'STUDENTS' | 'CONDITIONS';

interface TeamConfig {
  name: string;
  bg: string;
  text: string;
  sub?: string;
  border?: string;
}

const TEAM_CONFIGS: Record<TeamMode, TeamConfig[]> = {
  '2TEAM': [
    { name: '빨강팀', bg: 'bg-red-600', text: 'text-white', sub: 'bg-red-700/50' },
    { name: '파랑팀', bg: 'bg-blue-600', text: 'text-white', sub: 'bg-blue-700/50' }
  ],
  '4TEAM': [
    { name: '빨강팀', bg: 'bg-red-100', text: 'text-red-900', border: 'border-red-300' },
    { name: '파랑팀', bg: 'bg-blue-100', text: 'text-blue-900', border: 'border-blue-300' },
    { name: '초록팀', bg: 'bg-green-100', text: 'text-green-900', border: 'border-green-300' },
    { name: '투명팀', bg: 'bg-slate-200', text: 'text-slate-800', border: 'border-slate-400' }
  ]
};

export const TeamAssigner: React.FC<Props> = ({ onBack }) => {
  // --- State ---
  const [view, setView] = useState<ViewState>('MAIN');
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('STUDENTS');
  
  const [students, setStudents] = useState<Student[]>([]);
  const [absenteeIds, setAbsenteeIds] = useState<Set<string>>(new Set());
  
  // Data State
  const [pairConditions, setPairConditions] = useState<ConditionPair[]>([]);
  const [groupConditions, setGroupConditions] = useState<ConditionGroup[]>([]);
  
  // Inputs
  const [inputName, setInputName] = useState('');
  const [inputGender, setInputGender] = useState<Gender>('MALE');
  
  // Seperate selection states for conditions
  const [tempPairSelection, setTempPairSelection] = useState<string[]>([]);
  const [tempGroupSelection, setTempGroupSelection] = useState<string[]>([]);

  // Execution State
  const [selectedMode, setSelectedMode] = useState<TeamMode>('2TEAM');
  const [teams, setTeams] = useState<Student[][]>([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isLoadingFire, setIsLoadingFire] = useState(false);

  // CRITICAL: Keep this ID same as before to ensure data persistence
  const DOC_ID = 'my_classroom_v3'; 

  // Sorted Students (Ga-Na-Da)
  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  }, [students]);

  // --- Persistence ---
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingFire(true);
      try {
        if (db) {
          const docRef = doc(db, "students_list", DOC_ID);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.students) setStudents(data.students);
            if (data.pairConditions) setPairConditions(data.pairConditions);
            if (data.groupConditions) setGroupConditions(data.groupConditions);
            setIsLoadingFire(false);
            return;
          }
        }
        // Fallback LocalStorage (CRITICAL: Keep same key)
        const saved = localStorage.getItem('team_data_v3');
        if (saved) {
          const parsed = JSON.parse(saved);
          setStudents(parsed.students || []);
          setPairConditions(parsed.pairConditions || []);
          setGroupConditions(parsed.groupConditions || []);
        }
      } catch (e) {
        console.error("Load Error", e);
      } finally {
        setIsLoadingFire(false);
      }
    };
    loadData();
  }, []);

  const saveData = async (
    newStudents: Student[], 
    newPairs: ConditionPair[], 
    newGroups: ConditionGroup[]
  ) => {
    setStudents(newStudents);
    setPairConditions(newPairs);
    setGroupConditions(newGroups);

    const dataToSave = {
      students: newStudents,
      pairConditions: newPairs,
      groupConditions: newGroups,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem('team_data_v3', JSON.stringify(dataToSave));

    if (db) {
      try {
        await setDoc(doc(db, "students_list", DOC_ID), dataToSave);
      } catch (e) {
        console.error("Save Error", e);
      }
    }
  };

  // --- Wrappers for saving specific parts ---
  const updateStudents = (s: Student[]) => saveData(s, pairConditions, groupConditions);
  const updateConditions = (p: ConditionPair[], g: ConditionGroup[]) => saveData(students, p, g);


  // --- Handlers: Registration ---
  const addStudent = () => {
    if (!inputName.trim()) return;
    const newStudent: Student = {
      id: crypto.randomUUID(),
      name: inputName.trim(),
      gender: inputGender
    };
    updateStudents([...students, newStudent]);
    setInputName('');
  };

  const removeStudent = (id: string) => {
    // Remove from conditions too
    const newPairs = pairConditions.filter(p => !p.studentIds.includes(id));
    const newGroups = groupConditions.filter(g => !g.studentIds.includes(id));
    
    // Also remove from temp selections if present
    setTempPairSelection(prev => prev.filter(pid => pid !== id));
    setTempGroupSelection(prev => prev.filter(gid => gid !== id));

    // Save all
    saveData(students.filter(s => s.id !== id), newPairs, newGroups);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      addStudent();
    }
  };

  // --- Handlers: Conditions ---
  const addPairCondition = () => {
    if (tempPairSelection.length !== 2) return;
    const newCondition: ConditionPair = {
      id: crypto.randomUUID(),
      studentIds: [...tempPairSelection],
      type: 'PAIR_SEPARATE'
    };
    updateConditions([...pairConditions, newCondition], groupConditions);
    setTempPairSelection([]);
  };

  const addGroupCondition = () => {
    if (tempGroupSelection.length !== 4) return;
    const newCondition: ConditionGroup = {
      id: crypto.randomUUID(),
      studentIds: [...tempGroupSelection],
      type: 'GROUP_SEPARATE'
    };
    updateConditions(pairConditions, [...groupConditions, newCondition]);
    setTempGroupSelection([]);
  };

  const togglePairSelection = (id: string) => {
    if (tempPairSelection.includes(id)) {
      setTempPairSelection(prev => prev.filter(sid => sid !== id));
    } else {
      if (tempPairSelection.length < 2) {
        setTempPairSelection(prev => [...prev, id]);
      }
    }
  };

  const toggleGroupSelection = (id: string) => {
    if (tempGroupSelection.includes(id)) {
      setTempGroupSelection(prev => prev.filter(sid => sid !== id));
    } else {
      if (tempGroupSelection.length < 4) {
        setTempGroupSelection(prev => [...prev, id]);
      }
    }
  };

  const toggleAbsentee = (id: string) => {
    const newSet = new Set(absenteeIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setAbsenteeIds(newSet);
  };

  // --- Logic: Shuffle ---
  const shuffleAndAssign = () => {
    setIsShuffling(true);
    setView('RESULT');
    
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setTimeout(() => {
      // 1. Filter active students
      const activeStudents = sortedStudents.filter(s => !absenteeIds.has(s.id));
      const teamCount = selectedMode === '2TEAM' ? 2 : 4;
      
      const buckets: Student[][] = Array.from({ length: teamCount }, () => []);
      const assignedIds = new Set<string>();

      const shuffle = <T,>(arr: T[]) => {
        const newArr = [...arr];
        for (let i = newArr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
        }
        return newArr;
      };

      // 2. Handle Group Conditions (4 Team)
      if (selectedMode === '4TEAM') {
        groupConditions.forEach(cond => {
          const presentMembers = cond.studentIds.filter(id => !absenteeIds.has(id));
          // If we have at least some members, try to spread them
          if (presentMembers.length > 0) {
            const bucketIndices = shuffle([0, 1, 2, 3]);
            presentMembers.forEach((pid, idx) => {
              if (idx < 4 && !assignedIds.has(pid)) {
                const s = activeStudents.find(s => s.id === pid);
                if (s) {
                  buckets[bucketIndices[idx]].push(s);
                  assignedIds.add(pid);
                }
              }
            });
          }
        });
      }

      // 3. Handle Pair Conditions (2 Team)
      if (selectedMode === '2TEAM') {
        pairConditions.forEach(cond => {
          const presentMembers = cond.studentIds.filter(id => !absenteeIds.has(id));
          if (presentMembers.length === 2) {
             const s1 = activeStudents.find(s => s.id === presentMembers[0]);
             const s2 = activeStudents.find(s => s.id === presentMembers[1]);
             if (Math.random() > 0.5) {
                if(s1 && !assignedIds.has(s1.id)) { buckets[0].push(s1); assignedIds.add(s1.id); }
                if(s2 && !assignedIds.has(s2.id)) { buckets[1].push(s2); assignedIds.add(s2.id); }
             } else {
                if(s2 && !assignedIds.has(s2.id)) { buckets[0].push(s2); assignedIds.add(s2.id); }
                if(s1 && !assignedIds.has(s1.id)) { buckets[1].push(s1); assignedIds.add(s1.id); }
             }
          }
        });
      }

      // 4. Fill remaining
      const remaining = shuffle(activeStudents.filter(s => !assignedIds.has(s.id)));
      remaining.forEach(s => {
        let minIdx = 0;
        for(let i=1; i<teamCount; i++) {
          if (buckets[i].length < buckets[minIdx].length) minIdx = i;
        }
        buckets[minIdx].push(s);
      });

      // 5. Final Sort within buckets (Ga-Na-Da)
      const finalTeams = buckets.map(b => b.sort((x, y) => x.name.localeCompare(y.name, 'ko')));
      
      setTeams(finalTeams);
      setIsShuffling(false);
    }, 1200);
  };

  // --- Render Views ---

  // 1. Dashboard View (Main)
  const renderDashboard = () => (
    <div className="flex flex-col w-full max-w-6xl mx-auto h-full space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600">
          <ArrowLeft /> 홈으로
        </button>
        <h1 className="text-3xl text-slate-800" style={{ fontFamily: '"Black Han Sans", sans-serif' }}>팀 랜덤 배정</h1>
        <div className="w-20"></div> {/* Spacer */}
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-6">
        
        {/* Left: Absentee Selection (Grid) */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl flex items-center gap-2 text-slate-700">
              <UserMinus className="text-orange-500" /> 결석생 선택
            </h2>
            <span className="text-sm text-slate-400">
              총 {students.length}명 / 출석 {students.length - absenteeIds.size}명
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
            {students.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                  <Users size={40} />
                  <p>등록된 학생이 없습니다.</p>
                  <p className="text-sm">아래 '설정' 버튼을 눌러 학생을 등록하세요.</p>
               </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {sortedStudents.map(s => {
                  const isAbsent = absenteeIds.has(s.id);
                  const isMale = s.gender === 'MALE';
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggleAbsentee(s.id)}
                      className={`
                        relative py-3 px-1 rounded-xl border-2 transition-all text-sm sm:text-base
                        ${isAbsent 
                          ? 'bg-slate-100 border-slate-200 text-slate-300 grayscale' 
                          : isMale 
                            ? 'bg-blue-50 border-blue-200 text-blue-900 hover:bg-blue-100 hover:border-blue-300' 
                            : 'bg-pink-50 border-pink-200 text-pink-900 hover:bg-pink-100 hover:border-pink-300'
                        }
                      `}
                    >
                      {s.name}
                      {isAbsent && <div className="absolute inset-0 flex items-center justify-center bg-white/60"><X className="text-slate-400"/></div>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Mode & Start */}
        <div className="w-full md:w-96 flex flex-col gap-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-xl flex items-center gap-2 text-slate-700 mb-4">
              <Shuffle className="text-indigo-500" /> 팀 모드 선택
            </h2>
            <div className="flex gap-3 h-28">
              <button 
                onClick={() => setSelectedMode('2TEAM')}
                className={`flex-1 rounded-2xl border-4 transition-all flex flex-col items-center justify-center gap-2
                  ${selectedMode === '2TEAM' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-white text-slate-400 hover:border-slate-300'}
                `}
              >
                <div className="flex gap-1">
                   <div className="w-4 h-4 rounded-full bg-red-500"/>
                   <div className="w-4 h-4 rounded-full bg-blue-500"/>
                </div>
                <span className="text-xl">2팀</span>
              </button>
              <button 
                onClick={() => setSelectedMode('4TEAM')}
                className={`flex-1 rounded-2xl border-4 transition-all flex flex-col items-center justify-center gap-2
                  ${selectedMode === '4TEAM' ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-100 bg-white text-slate-400 hover:border-slate-300'}
                `}
              >
                <div className="flex gap-1">
                   <div className="w-3 h-3 rounded-full bg-red-500"/>
                   <div className="w-3 h-3 rounded-full bg-blue-500"/>
                   <div className="w-3 h-3 rounded-full bg-green-500"/>
                   <div className="w-3 h-3 rounded-full bg-slate-300"/>
                </div>
                <span className="text-xl">4팀</span>
              </button>
            </div>
          </div>

          <Button 
            onClick={shuffleAndAssign} 
            className="w-full text-xl shadow-xl shadow-indigo-200 py-4 h-auto"
            disabled={students.length < 2}
          >
            🎲 팀 배정 시작
          </Button>

          <button 
            onClick={() => setView('SETTINGS')}
            className="w-full py-4 bg-slate-200 text-slate-600 rounded-2xl hover:bg-slate-300 transition-colors flex items-center justify-center gap-2"
          >
            <Settings size={20} /> 학생 관리 및 조건 설정
          </button>
        </div>
      </div>
    </div>
  );

  // 2. Settings View (Management)
  const renderSettings = () => (
    <div className="flex flex-col w-full max-w-5xl mx-auto h-full animate-fade-in bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden my-4">
      {/* Header */}
      <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
        <h2 className="text-xl text-slate-700 flex items-center gap-2">
          <Settings className="text-slate-500" /> 설정
        </h2>
        <button onClick={() => setView('MAIN')} className="bg-white border px-4 py-2 rounded-lg hover:bg-slate-100">
           저장 후 닫기
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setSettingsTab('STUDENTS')}
          className={`flex-1 py-4 text-lg transition-colors ${settingsTab === 'STUDENTS' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'bg-slate-50 text-slate-400'}`}
        >
          👨‍🎓 학생 명단 관리
        </button>
        <button 
          onClick={() => setSettingsTab('CONDITIONS')}
          className={`flex-1 py-4 text-lg transition-colors ${settingsTab === 'CONDITIONS' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'bg-slate-50 text-slate-400'}`}
        >
          ⚠️ 같은 팀 금지 조건
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-white">
        {settingsTab === 'STUDENTS' ? (
          <div className="flex flex-col gap-6">
             {/* Add Form */}
             <div className="flex gap-3 items-end bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex-1">
                  <label className="text-xs text-slate-400 ml-1">이름 입력</label>
                  <input
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="예: 김철수"
                    className="w-full px-4 py-3 text-lg border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="flex bg-white p-1 rounded-lg border border-slate-200">
                   <button onClick={() => setInputGender('MALE')} className={`px-4 py-2 rounded ${inputGender === 'MALE' ? 'bg-blue-100 text-blue-700' : 'text-slate-300'}`}>남학생</button>
                   <button onClick={() => setInputGender('FEMALE')} className={`px-4 py-2 rounded ${inputGender === 'FEMALE' ? 'bg-pink-100 text-pink-700' : 'text-slate-300'}`}>여학생</button>
                </div>
                <Button onClick={addStudent} className="py-3 px-6 h-[54px]"><Plus size={24} /></Button>
             </div>

             {/* List */}
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
               {sortedStudents.map(s => (
                 <div key={s.id} className={`flex items-center justify-between p-3 rounded-lg border ${s.gender === 'MALE' ? 'bg-blue-50 border-blue-100' : 'bg-pink-50 border-pink-100'}`}>
                    <span className={`${s.gender === 'MALE' ? 'text-blue-900' : 'text-pink-900'}`}>{s.name}</span>
                    <button onClick={() => removeStudent(s.id)} className="text-slate-400 hover:text-red-500 p-1"><Trash2 size={16}/></button>
                 </div>
               ))}
             </div>
             {students.length === 0 && <p className="text-center text-slate-400 py-10">등록된 학생이 없습니다.</p>}
          </div>
        ) : (
          <div className="flex flex-col gap-8">
             {/* 2 Team Conditions */}
             <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
                <h3 className="text-red-700 flex items-center gap-2 text-lg mb-2"><ShieldAlert /> 2팀 모드 조건 (같은 팀 금지)</h3>
                <p className="text-sm text-red-400 mb-4">선택한 2명은 서로 다른 팀(빨강 vs 파랑)으로 배정됩니다.</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {pairConditions.map(cond => {
                     const s1 = students.find(s => s.id === cond.studentIds[0]);
                     const s2 = students.find(s => s.id === cond.studentIds[1]);
                     return (
                       <div key={cond.id} className="bg-white px-3 py-1 rounded-full border border-red-200 text-red-600 text-sm flex items-center gap-2 shadow-sm">
                         {s1?.name} <span className="text-xs text-red-300">⚡</span> {s2?.name}
                         <button onClick={() => updateConditions(pairConditions.filter(c => c.id !== cond.id), groupConditions)}><X size={14}/></button>
                       </div>
                     );
                  })}
                </div>

                {/* Picker */}
                <div className="bg-white p-4 rounded-xl border border-red-100">
                   <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-slate-500">2명을 선택하세요 ({tempPairSelection.length}/2)</span>
                      {tempPairSelection.length === 2 && (
                        <button onClick={addPairCondition} className="bg-red-500 text-white px-4 py-1 rounded-lg text-sm shadow-sm hover:bg-red-600">조건 추가</button>
                      )}
                   </div>
                   <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {sortedStudents.map(s => (
                        <button 
                          key={s.id} 
                          onClick={() => togglePairSelection(s.id)}
                          className={`text-sm py-1 rounded border ${tempPairSelection.includes(s.id) ? 'bg-red-500 text-white border-red-500' : 'bg-slate-50 text-slate-500 border-slate-200'}`}
                        >
                          {s.name}
                        </button>
                      ))}
                   </div>
                </div>
             </div>

             {/* 4 Team Conditions */}
             <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                <h3 className="text-green-700 flex items-center gap-2 text-lg mb-2"><CheckCircle2 /> 4팀 모드 조건 (분산 배정)</h3>
                <p className="text-sm text-green-600 mb-4">선택한 4명은 서로 다른 4개의 팀으로 흩어집니다.</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {groupConditions.map(cond => (
                       <div key={cond.id} className="bg-white px-3 py-1 rounded-full border border-green-200 text-green-600 text-sm flex items-center gap-2 shadow-sm">
                         {cond.studentIds.map(id => students.find(s => s.id === id)?.name).join(', ')}
                         <button onClick={() => updateConditions(pairConditions, groupConditions.filter(c => c.id !== cond.id))}><X size={14}/></button>
                       </div>
                  ))}
                </div>

                <div className="bg-white p-4 rounded-xl border border-green-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-slate-500">4명을 선택하세요 ({tempGroupSelection.length}/4)</span>
                      {tempGroupSelection.length === 4 && (
                        <button onClick={addGroupCondition} className="bg-green-500 text-white px-4 py-1 rounded-lg text-sm shadow-sm hover:bg-green-600">조건 추가</button>
                      )}
                   </div>
                   <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {sortedStudents.map(s => (
                        <button 
                          key={s.id} 
                          onClick={() => toggleGroupSelection(s.id)}
                          className={`text-sm py-1 rounded border ${tempGroupSelection.includes(s.id) ? 'bg-green-500 text-white border-green-500' : 'bg-slate-50 text-slate-500 border-slate-200'}`}
                        >
                          {s.name}
                        </button>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );

  // 3. Result View
  const renderResult = () => {
    if (isShuffling) {
       return (
         <div className="flex flex-col items-center justify-center h-[80vh]">
            <Loader2 className="w-32 h-32 text-indigo-500 animate-spin mb-8" />
            <h2 className="text-5xl text-slate-700 animate-pulse" style={{ fontFamily: '"Black Han Sans", sans-serif' }}>팀을 섞고 있습니다...</h2>
         </div>
       );
    }

    return (
      <div className="w-full h-full flex flex-col p-4 animate-fade-in">
         <div className="text-center mb-6">
            <h2 className="text-5xl text-indigo-900 drop-shadow-sm" style={{ fontFamily: '"Black Han Sans", sans-serif' }}>
               🎉 팀 배정 결과
            </h2>
         </div>

         <div className={`flex-1 grid gap-4 pb-8 ${selectedMode === '2TEAM' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2'}`}>
            {teams.map((members, idx) => {
              const config = TEAM_CONFIGS[selectedMode][idx];
              const isTransparent = selectedMode === '4TEAM' && idx === 3;
              
              // Big card styles
              const containerStyle = isTransparent 
                 ? "bg-slate-100 border-4 border-slate-300" 
                 : `${config.bg} ${config.border || ''} border-4`;
                 
              return (
                <div key={idx} className={`${containerStyle} rounded-3xl p-6 shadow-xl flex flex-col overflow-hidden`}>
                   <div className="flex justify-between items-center mb-6 border-b border-black/10 pb-4">
                      <h3 className={`text-6xl ${config.text} drop-shadow-sm`} style={{ fontFamily: '"Black Han Sans", sans-serif' }}>{config.name}</h3>
                      <span className="text-3xl opacity-60 bg-white/30 px-4 py-1 rounded-full">{members.length}명</span>
                   </div>
                   <div className="flex-1 content-start overflow-y-auto grid grid-cols-1 xl:grid-cols-2 gap-3 pr-2 custom-scrollbar">
                      {members.map(m => (
                         <div key={m.id} className={`
                           rounded-xl p-4 text-center flex items-center justify-center gap-4 shadow-sm
                           ${isTransparent ? 'bg-white text-slate-800' : 'bg-white/90 text-slate-900'}
                         `}>
                            {/* Gender Indicator Dot */}
                            <div className={`w-6 h-6 rounded-full ${m.gender === 'MALE' ? 'bg-blue-500' : 'bg-pink-500'}`} />
                            <span className="text-6xl md:text-7xl lg:text-8xl tracking-tight leading-tight" style={{ fontFamily: '"Black Han Sans", sans-serif' }}>{m.name}</span>
                         </div>
                      ))}
                   </div>
                </div>
              );
            })}
         </div>
         
         <div className="flex justify-center gap-4 py-6">
            <Button onClick={shuffleAndAssign} className="bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 text-xl px-10 py-4">
               <Shuffle className="mr-2 h-6 w-6" /> 다시 섞기
            </Button>
            <button 
               onClick={() => setView('MAIN')}
               className="bg-slate-800 text-white px-10 py-4 rounded-xl hover:bg-slate-900 transition-colors text-xl"
            >
               닫기
            </button>
         </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 w-full flex flex-col p-4">
      {view === 'MAIN' && renderDashboard()}
      {view === 'SETTINGS' && renderSettings()}
      {view === 'RESULT' && renderResult()}
    </div>
  );
};