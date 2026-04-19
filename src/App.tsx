/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Users, 
  Zap, 
  Target, 
  CheckCircle2, 
  XCircle,
  Clock,
  ArrowLeftRight,
  User,
  Sparkles,
  Play
} from 'lucide-react';
import { QUESTIONS, Question, QuestionDifficulty } from './questions';
import { Card, CardDifficulty, CARDS_CONFIG, SpecialPower } from './types';

// Helper to shuffle arrays
const shuffle = <T,>(array: T[]): T[] => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

// Player Names
const PLAYER_NAMES = ['أنت', 'كمبيوتر ٢', 'صديقك ٣', 'كمبيوتر ٤']; // P1 & P3 Team A, P2 & P4 Team B

type AIDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

const OpponentHand = ({ count, isActive, team }: { count: number; isActive: boolean; team: 'A' | 'B' }) => (
  <div className="flex -space-x-8 mt-2">
    {Array.from({ length: Math.min(count, 4) }).map((_, i) => (
      <motion.div
        key={i}
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`w-12 h-16 md:w-16 md:h-24 rounded-lg border border-white/10 shadow-xl ${
          team === 'A' ? 'bg-gradient-to-br from-amber-600 to-[#b45309]' : 'bg-gradient-to-br from-rose-700 to-[#be123c]'
        } ${isActive ? 'ring-2 ring-white scale-110 z-10 shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'opacity-40'}`}
        style={{ rotate: `${(i - 1.5) * 10}deg` }}
      />
    ))}
  </div>
);

interface TeamScoreCardProps {
  teamName: string;
  totalScore: number;
  player1Name: string;
  player1Score: number;
  player2Name: string;
  player2Score: number;
  isCurrentTeam: boolean;
  color: 'gold' | 'crimson';
}

const TeamScoreCard = ({ teamName, totalScore, player1Name, player1Score, player2Name, player2Score, isCurrentTeam, color }: TeamScoreCardProps) => (
  <div className={`p-4 rounded-3xl border-2 transition-all duration-500 overflow-hidden relative ${
    color === 'gold' ? 'bg-amber-400/5 border-amber-400/20' : 'bg-rose-600/5 border-rose-600/20'
  } ${isCurrentTeam ? 'scale-105 border-opacity-100 shadow-2xl' : 'opacity-60 scale-95'}`}>
    <div className="flex justify-between items-center mb-1">
      <span className={`text-[10px] font-black uppercase tracking-widest ${color === 'gold' ? 'text-amber-400' : 'text-rose-600'}`}>{teamName}</span>
      {isCurrentTeam && <div className={`w-2 h-2 rounded-full animate-pulse ${color === 'gold' ? 'bg-amber-400' : 'bg-rose-600'}`}></div>}
    </div>
    <div className={`text-4xl font-black ${color === 'gold' ? 'text-amber-400' : 'text-rose-600'}`}>
      {totalScore}
    </div>
    <div className="flex gap-4 mt-3 text-[10px] font-bold opacity-70">
      <div>{player1Name}: {player1Score}</div>
      <div>{player2Name}: {player2Score}</div>
    </div>
  </div>
);

export default function App() {
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'END'>('START');
  const [hands, setHands] = useState<Card[][]>([[], [], [], []]);
  const [turn, setTurn] = useState(0); 
  const [scores, setScores] = useState<number[]>([0, 0, 0, 0]); 
  const [teamAScore, setTeamAScore] = useState(0);
  const [teamBScore, setTeamBScore] = useState(0);
  const [aiLevel, setAiLevel] = useState<AIDifficulty>('MEDIUM');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [playedCards, setPlayedCards] = useState<(Card | null)[]>([null, null, null, null]);
  const [multipliers, setMultipliers] = useState<number[]>([1, 1, 1, 1]);
  const [frozen, setFrozen] = useState<boolean[]>([false, false, false, false]);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startGame = (level: AIDifficulty) => {
    setAiLevel(level);
    const freshDeck = shuffle(CARDS_CONFIG);
    const newHands: Card[][] = [[], [], [], []];
    for (let i = 0; i < freshDeck.length; i++) {
        newHands[i % 4].push(freshDeck[i]);
    }
    setHands(newHands);
    setScores([0, 0, 0, 0]);
    setTeamAScore(0);
    setTeamBScore(0);
    setTurn(0);
    setGameState('PLAYING');
    setMultipliers([1, 1, 1, 1]);
    setFrozen([false, false, false, false]);
    setPlayedCards([null, null, null, null]);
  };

  useEffect(() => {
    if (activeQuestion && timeLeft > 0 && !isAnswering) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (activeQuestion && timeLeft === 0 && !isAnswering) {
      handleAnswer(-1);
    }
  }, [activeQuestion, timeLeft, isAnswering]);

  const playCard = (card: Card, cardIndex: number) => {
    if (isAnswering || activeQuestion || frozen[turn]) return;

    const newHands = [...hands];
    newHands[turn] = newHands[turn].filter((_, i) => i !== cardIndex);
    setHands(newHands);

    const diffMap: Record<CardDifficulty, QuestionDifficulty> = {
      'Hard': 'صعب جداً',
      'MediumHard': 'متوسط-صعب',
      'Medium': 'متوسط',
      'Easy': 'سهل'
    };
    
    const possibleQuestions = QUESTIONS.filter(q => q.difficulty === diffMap[card.difficulty]);
    const question = possibleQuestions[Math.floor(Math.random() * possibleQuestions.length)] || QUESTIONS[0];
    
    setActiveCard(card);
    setActiveQuestion(question);
    setTimeLeft(60);
    setSelectedOption(null);
    setIsAnswering(false);
    setFeedback(null);
    
    const newPlayed = [...playedCards];
    newPlayed[turn] = card;
    setPlayedCards(newPlayed);
    setIsAiThinking(false); 
  };

  const applyPower = (card: Card, isCorrect: boolean, pts: number) => {
    let finalPts = isCorrect ? pts * multipliers[turn] : 0;
    const currentScores = [...scores];
    const prevTurn = (turn + 3) % 4;
    const teammateTurn = (turn + 2) % 4;
    const opp1Turn = (turn + 1) % 4;
    const opp2Turn = (turn + 3) % 4;

    if (isCorrect) {
      switch (card.power) {
        case SpecialPower.H1_AVENGE:
          currentScores[prevTurn] = Math.max(0, currentScores[prevTurn] - 200);
          finalPts += 300;
          break;
        case SpecialPower.H2_TRIPLE_NEXT:
          const newMults = [...multipliers];
          newMults[teammateTurn] = 3;
          setMultipliers(newMults);
          break;
        case SpecialPower.H3_STEAL_ALL:
          const target = Math.random() > 0.5 ? opp1Turn : opp2Turn;
          const stolen = Math.floor(currentScores[target] * 0.5);
          finalPts += stolen;
          currentScores[target] -= stolen;
          break;
        case SpecialPower.H4_DOUBLE_HIT:
          const targetHit = Math.random() > 0.5 ? opp1Turn : opp2Turn;
          currentScores[targetHit] = Math.max(0, currentScores[targetHit] - 100);
          finalPts += 200;
          const newFrozen = [...frozen];
          newFrozen[targetHit] = true;
          setFrozen(newFrozen);
          break;
        case SpecialPower.H5_NUKE:
          finalPts += 500;
          currentScores[teammateTurn] += 150;
          break;
      }
    }

    currentScores[turn] += finalPts;
    setScores(currentScores);
    if (multipliers[turn] > 1) {
      const resetMults = [...multipliers];
      resetMults[turn] = 1;
      setMultipliers(resetMults);
    }
    setTeamAScore(currentScores[0] + currentScores[2]);
    setTeamBScore(currentScores[1] + currentScores[3]);
  };

  const handleAnswer = (index: number) => {
    if (isAnswering || !activeQuestion || !activeCard) return;
    setIsAnswering(true);
    setSelectedOption(index);
    const isCorrect = index === activeQuestion.correctIndex;
    setFeedback({ isCorrect, message: isCorrect ? 'إجابة صحيحة!' : 'إجابة خاطئة' });
    applyPower(activeCard, isCorrect, activeCard.points);
  };

  const nextTurn = () => {
    if (hands.every(h => h.length === 0)) {
       setGameState('END');
       return;
    }
    let nTurn = (turn + 1) % 4;
    while (frozen[nTurn]) {
        const newFrozen = [...frozen];
        newFrozen[nTurn] = false;
        setFrozen(newFrozen);
        nTurn = (nTurn + 1) % 4;
    }
    if (nTurn === 0) setPlayedCards([null, null, null, null]);
    setTurn(nTurn);
    setActiveCard(null);
    setActiveQuestion(null);
    setIsAnswering(false);
    setFeedback(null);
    setIsAiThinking(false);
  };

  // AI Card Play Effect
  useEffect(() => {
    if (gameState === 'PLAYING' && turn !== 0 && !activeQuestion && !isAiThinking) {
      setIsAiThinking(true);
      const playTimer = setTimeout(() => {
        const aiHand = hands[turn];
        if (aiHand.length > 0) {
          const idx = Math.floor(Math.random() * aiHand.length);
          playCard(aiHand[idx], idx);
        } else {
          nextTurn();
        }
      }, 3000);
      return () => clearTimeout(playTimer);
    }
  }, [turn, gameState, activeQuestion, isAiThinking]);

  // AI Answer Effect
  useEffect(() => {
    if (gameState === 'PLAYING' && turn !== 0 && activeQuestion && !isAnswering) {
      const delay = 17000; 
      const answerTimer = setTimeout(() => {
        let successChance = 65;
        if (aiLevel === 'EASY') successChance = 25;
        if (aiLevel === 'HARD') successChance = 95;
        const roll = Math.random() * 100;
        let choice = -1;
        if (roll < successChance) {
          choice = activeQuestion.correctIndex;
        } else {
          const wrong = [0,1,2,3].filter(i => i !== activeQuestion.correctIndex);
          choice = wrong[Math.floor(Math.random()*wrong.length)];
        }
        handleAnswer(choice);
      }, delay);
      return () => clearTimeout(answerTimer);
    }
  }, [turn, activeQuestion, isAnswering, gameState, aiLevel]);

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#0A0E2A] text-white font-sans overflow-x-hidden no-scrollbar" dir="rtl">
      
      {/* START SCREEN */}
      {gameState === 'START' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10 bg-gradient-to-b from-navy to-black">
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <h1 className="text-7xl md:text-9xl font-black text-amber-400 mb-6 drop-shadow-2xl">قُدرَات بُطولَة</h1>
            <p className="text-xl md:text-2xl text-off-white/70 max-w-2xl mx-auto leading-relaxed mb-12">
               بطولة القدرات الكبرى قد بدأت! استعد لتحدي أصدقائك في عالم يجمع بين الذكاء، الاستراتيجية، والمعرفة. هل أنت مستعد للقب؟
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
            {(['EASY', 'MEDIUM', 'HARD'] as AIDifficulty[]).map(level => (
              <button 
                key={level} 
                onClick={() => startGame(level)}
                className="group relative h-48 bg-white/5 border-2 border-white/10 rounded-[2.5rem] overflow-hidden transition-all hover:border-amber-400/50 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-transparent group-hover:opacity-100 opacity-0 transition-opacity"></div>
                <div className="relative z-10 flex flex-col items-center justify-center p-6 gap-3">
                   <Users className={`w-12 h-12 ${level === 'EASY' ? 'text-green-400' : level === 'MEDIUM' ? 'text-amber-400' : 'text-rose-600'}`} />
                   <span className="text-2xl font-black">{level === 'EASY' ? 'مستوى ناشئ' : level === 'MEDIUM' ? 'مستوى متوسط' : 'مستوى المحترفين'}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* GAME OVER */}
      {gameState === 'END' && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-black">
           <Trophy className="w-40 h-40 text-amber-400 mb-8 animate-bounce" />
           <h2 className="text-6xl font-black mb-12">النتائج النهائية للبطولة</h2>
           <div className="flex gap-12 mb-16">
              <div className="p-12 bg-amber-400/10 border-4 border-amber-400 rounded-[3rem] text-center">
                 <div className="text-2xl font-black text-amber-400 mb-2">فريق أ</div>
                 <div className="text-8xl font-black">{teamAScore}</div>
              </div>
              <div className="p-12 bg-rose-600/10 border-4 border-rose-600 rounded-[3rem] text-center">
                 <div className="text-2xl font-black text-rose-600 mb-2">فريق ب</div>
                 <div className="text-8xl font-black">{teamBScore}</div>
              </div>
           </div>
           <button onClick={() => setGameState('START')} className="px-16 py-6 bg-white text-black font-black text-2xl rounded-full hover:bg-amber-400 transition-all flex items-center gap-4">
              <Play fill="black" /> العودة للبداية
           </button>
        </div>
      )}

      {/* PLAYING */}
      {gameState === 'PLAYING' && (
        <div className="flex-1 flex flex-col relative">
          
          {/* HEADER */}
          <div className="h-20 bg-black/50 backdrop-blur-2xl border-b border-white/10 flex items-center justify-between px-10 z-50 shrink-0">
             <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                   <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse"></div>
                   <span className="text-xl font-black text-white/40 uppercase tracking-widest">البطولة شغالة</span>
                </div>
                <div className="h-8 w-px bg-white/10"></div>
                <div className="text-lg font-black text-amber-400">
                   {activeQuestion ? `${activeQuestion.category}` : 'بانتظار حركة'}
                </div>
             </div>
             
             <h2 className="text-3xl font-black tracking-tighter">قُدرَات بُطولَة</h2>
             
             <div className="flex items-center gap-8">
                <div className="flex flex-col items-end">
                   <span className="text-[10px] font-black opacity-30 uppercase">الزمن المتبقي</span>
                   <span className={`text-3xl font-mono font-black ${timeLeft < 10 ? 'text-rose-600 animate-pulse' : 'text-white'}`}>00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                   <Clock className={timeLeft < 10 ? 'text-rose-600' : 'text-white'} size={24} />
                </div>
             </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
             
             {/* TOP: QUESTION/INFO AREA */}
             <div className="min-h-[220px] md:min-h-[260px] shrink-0 border-b border-white/5 bg-gradient-to-b from-navy/30 to-transparent relative p-6 flex flex-col items-center justify-center">
                <AnimatePresence mode="wait">
                  {activeQuestion ? (
                    <motion.div key={activeQuestion.id} initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-6xl flex flex-col items-center">
                       <div className="flex items-center gap-4 mb-4">
                          <span className="px-4 py-1 rounded-full bg-amber-400/10 border border-amber-400/40 text-amber-400 text-xs font-black uppercase">
                             {activeCard?.difficulty} - {activeQuestion.type}
                          </span>
                       </div>
                       <h3 className="text-3xl md:text-5xl font-black text-center leading-tight mb-12 max-w-5xl">
                          {activeQuestion.text}
                       </h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                          {activeQuestion.options.map((opt, i) => (
                             <button 
                                key={i} 
                                disabled={isAnswering} 
                                onClick={() => handleAnswer(i)}
                                className={`
                                  group relative p-4 rounded-[2rem] border-2 transition-all text-xl font-bold flex items-center gap-6 text-right
                                  ${isAnswering ? 
                                    (i === activeQuestion.correctIndex ? 'bg-green-500/20 border-green-500 text-green-400' : 
                                     (i === selectedOption ? 'bg-rose-600/20 border-rose-600 text-rose-500' : 'opacity-20'))
                                    : 'bg-white/5 border-white/10 hover:border-amber-400 hover:bg-amber-400/5'}
                                `}
                             >
                                <span className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-black text-2xl ${isAnswering ? 'bg-white/10' : 'bg-white/5 group-hover:bg-amber-400 group-hover:text-black'}`}>
                                   {['أ', 'ب', 'ج', 'د'][i]}
                                </span>
                                <span>{opt}</span>
                             </button>
                          ))}
                       </div>
                    </motion.div>
                  ) : (
                    <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
                       <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center animate-pulse">
                          <Zap size={40} className="text-amber-400" />
                       </div>
                       <h3 className="text-5xl font-black opacity-10">
                          {turn === 0 ? 'ابدأ حركتك يا بطل!' : `بانتظار حركة ${PLAYER_NAMES[turn]}`}
                       </h3>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* EXPLANATION OVERLAY */}
                <AnimatePresence>
                   {isAnswering && (
                     <motion.div 
                       initial={{ opacity: 0, y: 100 }} 
                       animate={{ opacity: 1, y: 0 }} 
                       className="absolute inset-0 z-50 bg-black/95 backdrop-blur-3xl p-10 flex flex-col items-center justify-center text-center"
                     >
                        <div className={`mb-10 p-6 rounded-full inline-flex items-center gap-4 ${feedback?.isCorrect ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-rose-600/10 text-rose-500 border border-rose-600/30'}`}>
                           {feedback?.isCorrect ? <CheckCircle2 size={48} /> : <XCircle size={48} />}
                           <span className="text-5xl font-black">{feedback?.isCorrect ? 'إجابة عبقرية!' : 'حظاً أوفر فالك الفوز'}</span>
                        </div>
                        <div className="max-w-4xl mb-12">
                           <h4 className="text-amber-400 font-black text-2xl mb-4 flex items-center justify-center gap-3">
                              <Sparkles /> شرح السؤال الممتع:
                           </h4>
                           <p className="text-3xl font-bold leading-relaxed opacity-90">{activeQuestion?.explanation}</p>
                        </div>
                        <button onClick={nextTurn} className="px-20 py-6 bg-amber-400 text-black font-black text-3xl rounded-[3rem] shadow-2xl hover:bg-amber-300 transition-all flex items-center gap-4 group">
                           <span>مواصلة التحدي</span>
                           <ArrowLeftRight className="group-hover:rotate-180 transition-transform duration-500" />
                        </button>
                        <button onClick={nextTurn} className="absolute top-10 right-10 w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-rose-600 hover:bg-rose-600 hover:text-white transition-all">
                           <XCircle size={40} />
                        </button>
                     </motion.div>
                   )}
                </AnimatePresence>
             </div>

             {/* MIDDLE: GAME TABLE */}
             <div className="flex-1 flex gap-8 p-4 md:p-6 items-stretch overflow-hidden">
                
                {/* SCORE SIDEBAR */}
                <div className="w-80 flex flex-col gap-6 shrink-0">
                   <TeamScoreCard 
                      teamName="فريق أ (الذهب)"
                      totalScore={teamAScore}
                      player1Name={PLAYER_NAMES[0]}
                      player1Score={scores[0]}
                      player2Name={PLAYER_NAMES[2]}
                      player2Score={scores[2]}
                      isCurrentTeam={turn === 0 || turn === 2}
                      color="gold"
                   />
                   <TeamScoreCard 
                      teamName="فريق ب (القوة)"
                      totalScore={teamBScore}
                      player1Name={PLAYER_NAMES[1]}
                      player1Score={scores[1]}
                      player2Name={PLAYER_NAMES[3]}
                      player2Score={scores[3]}
                      isCurrentTeam={turn === 1 || turn === 3}
                      color="crimson"
                   />
                </div>

                {/* THE TABLE */}
                <div className="flex-1 rounded-[3rem] md:rounded-[4rem] border-2 border-white/5 bg-black/40 relative flex flex-col items-center justify-center p-6 overflow-hidden">
                   
                   {/* Table Visuals */}
                   <div className="absolute w-[70%] h-[70%] max-w-[500px] border-2 border-dashed border-white/5 rounded-full pointer-events-none"></div>
                   
                   {/* Player positions around the circular table */}
                   <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                      
                      {/* P3 - TOP */}
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
                         <OpponentHand count={hands[2].length} isActive={turn === 2} team="A" />
                         <div className={`w-16 h-16 md:w-20 md:h-20 rounded-3xl border-4 bg-slate-900 flex items-center justify-center mt-2 md:mt-4 transition-all ${turn === 2 ? 'border-amber-400 ring-[8px] md:ring-[12px] ring-amber-400/10 scale-110 md:scale-125' : 'border-white/5'}`}>
                            <Users size={24} className={turn === 2 ? 'text-amber-400' : 'opacity-20'} />
                         </div>
                         <span className="text-[10px] md:text-xs font-black mt-2 text-amber-400">صديقك ٣</span>
                      </div>

                      {/* P4 - RIGHT */}
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-4 md:gap-6 z-20">
                         <div className="flex flex-col items-center">
                            <div className={`w-16 h-16 md:w-20 md:h-20 rounded-3xl border-4 bg-slate-900 flex items-center justify-center transition-all ${turn === 3 ? 'border-rose-600 ring-[8px] md:ring-[12px] ring-rose-600/10 scale-110 md:scale-125' : 'border-white/5'}`}>
                               <Target size={24} className={turn === 3 ? 'text-rose-600' : 'opacity-20'} />
                            </div>
                            <span className="text-[10px] md:text-xs font-black mt-2 text-rose-600">كمبيوتر ٤</span>
                         </div>
                         <div className="rotate-90 origin-center hidden md:block">
                            <OpponentHand count={hands[3].length} isActive={turn === 3} team="B" />
                         </div>
                      </div>

                      {/* P2 - LEFT */}
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-4 md:gap-6 z-20">
                         <div className="-rotate-90 origin-center hidden md:block">
                            <OpponentHand count={hands[1].length} isActive={turn === 1} team="B" />
                         </div>
                         <div className="flex flex-col items-center">
                            <div className={`w-16 h-16 md:w-20 md:h-20 rounded-3xl border-4 bg-slate-900 flex items-center justify-center transition-all ${turn === 1 ? 'border-rose-600 ring-[8px] md:ring-[12px] ring-rose-600/10 scale-110 md:scale-125' : 'border-white/5'}`}>
                               <Zap size={24} className={turn === 1 ? 'text-rose-600' : 'opacity-20'} />
                            </div>
                            <span className="text-[10px] md:text-xs font-black mt-2 text-rose-600">كمبيوتر ٢</span>
                         </div>
                      </div>

                      {/* P1 - BOTTOM */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
                         <span className="text-[10px] md:text-xs font-black mb-2 text-amber-400 uppercase">أنت</span>
                         <div className={`w-16 h-16 md:w-20 md:h-20 rounded-3xl border-4 bg-slate-900 flex items-center justify-center transition-all ${turn === 0 ? 'border-amber-400 ring-[8px] md:ring-[12px] ring-amber-400/10 scale-110 md:scale-125' : 'border-white/5'}`}>
                            <User size={24} className={turn === 0 ? 'text-amber-400' : 'opacity-20'} />
                         </div>
                      </div>
                   </div>

                   {/* THE CENTRAL PLAYS */}
                   <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 z-10 p-4 md:p-12 relative mt-16 md:mt-0">

                         <AnimatePresence>
                            {playedCards.map((pc, i) => pc && (
                               <motion.div 
                                  key={`${i}-${pc.id}`} 
                                  initial={{ scale: 0, opacity: 0, y: 100, rotate: -45 }} 
                                  animate={{ scale: 1, opacity: 1, y: 0, rotate: (i - 1.5) * 15 }} 
                                  className={`w-32 h-44 md:w-40 md:h-56 rounded-3xl border-4 shadow-2xl relative flex flex-col items-center justify-center p-4 ${
                                    pc.difficulty === 'Hard' ? 'bg-gradient-to-br from-rose-900 to-rose-950 border-rose-500' :
                                    pc.difficulty === 'MediumHard' ? 'bg-gradient-to-br from-amber-700 to-amber-900 border-amber-400' :
                                    'bg-slate-800 border-slate-600'
                                  }`}
                               >
                                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black border-2 border-white/20 px-4 py-1 rounded-full text-xs font-black whitespace-nowrap shadow-xl">
                                     {PLAYER_NAMES[i]}
                                  </div>
                                  <div className="text-[10px] font-black opacity-40 uppercase mb-2">{pc.difficulty}</div>
                                  <div className="text-sm font-black text-center leading-tight">{pc.name}</div>
                                  <div className="text-amber-400 font-black mt-2">+{pc.points}</div>
                               </motion.div>
                            ))}
                         </AnimatePresence>
                         
                         {/* EMPTY SLOT / THINKING INDICATOR */}
                         {isAiThinking && !activeQuestion && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute flex flex-col items-center gap-4">
                               <Clock className="w-16 h-16 text-amber-400 animate-spin-slow" />
                               <div className="px-6 py-2 bg-amber-400/10 border border-amber-400/40 rounded-full text-amber-400 font-black animate-pulse">
                                  {PLAYER_NAMES[turn]} يفكر...
                               </div>
                            </motion.div>
                         )}
                      </div>
                   </div>
                </div>

             {/* BOTTOM: PLAYER HAND AREA */}
             <div className="h-[280px] shrink-0 border-t-2 border-white/5 bg-gradient-to-t from-black to-transparent relative pt-12">
                <div className="absolute inset-0 flex items-end justify-center pb-12 pointer-events-none">
                   <div className="flex -space-x-16 pointer-events-auto items-end overflow-visible px-40">
                      {turn === 0 ? hands[0].map((card, i) => (
                        <motion.button 
                           key={card.id + i} 
                           whileHover={{ y: -120, zIndex: 100, scale: 1.5, rotate: 0 }} 
                           onClick={() => playCard(card, i)}
                           disabled={!!activeQuestion}
                           className={`
                             w-32 h-44 md:w-44 md:h-64 rounded-[2.5rem] border-4 shadow-2xl transition-all duration-300 relative group
                             ${card.difficulty === 'Hard' ? 'bg-gradient-to-br from-rose-900 to-rose-950 border-rose-500 shadow-rose-600/20' :
                               card.difficulty === 'MediumHard' ? 'bg-gradient-to-br from-amber-700 to-amber-900 border-amber-400 shadow-amber-400/20' :
                               card.difficulty === 'Medium' ? 'bg-gradient-to-br from-slate-700 to-slate-900 border-slate-400' :
                               'bg-gradient-to-br from-gray-800 to-gray-950 border-gray-600'
                             }
                             ${!!activeQuestion ? 'opacity-30 grayscale' : 'hover:border-white'}
                             flex flex-col items-center justify-between p-6 text-center
                           `}
                           style={{ rotate: `${(i - hands[0].length / 2) * 2}deg`, transformOrigin: 'bottom center' }}
                        >
                           <div className="text-[10px] font-black opacity-50 uppercase tracking-widest">{card.difficulty}</div>
                           <div className="flex-1 flex flex-col items-center justify-center gap-2">
                              <span className="text-xl font-black group-hover:text-amber-400">{card.name}</span>
                              {card.power !== SpecialPower.NONE && <Zap className="text-amber-400 animate-pulse" size={24} />}
                           </div>
                           <div className="w-full flex justify-between border-t border-white/10 pt-4 mt-2">
                              <span className="text-[10px] font-black opacity-30">نقاط</span>
                              <span className="text-xl font-black text-amber-400">+{card.points}</span>
                           </div>
                        </motion.button>
                      )) : (
                        <div className="flex flex-col items-center gap-4 py-12">
                           <Clock className="w-12 h-12 text-amber-400 animate-spin" />
                           <span className="text-4xl font-black opacity-10 uppercase">{PLAYER_NAMES[turn]} يلعب الآن</span>
                        </div>
                      )}
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* BACKGROUND EFFECTS */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-400/5 rounded-full blur-[200px]"></div>
         <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-rose-600/5 rounded-full blur-[150px]"></div>
      </div>

    </div>
  );
}
