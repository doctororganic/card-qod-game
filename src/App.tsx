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
  Sparkles
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
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`w-10 h-14 md:w-12 md:h-16 rounded-lg border border-white/10 shadow-xl ${
          team === 'A' ? 'bg-gradient-to-br from-amber-600 to-[#b45309]' : 'bg-gradient-to-br from-rose-700 to-[#be123c]'
        } ${isActive ? 'ring-2 ring-white scale-110 z-10' : 'opacity-40'}`}
        style={{ rotate: `${(i - 1.5) * 12}deg` }}
      />
    ))}
    {count > 4 && (
      <div className="w-8 h-14 md:w-10 md:h-16 flex items-center justify-center text-[10px] font-black bg-white/5 rounded-lg border border-white/10 self-end ml-1">
        +{count - 4}
      </div>
    )}
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
  <div className={`flex-1 rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 ${color === 'gold' ? 'team-a-gradient' : 'team-b-gradient'} ${isCurrentTeam ? 'ring-2 ring-white scale-[1.02]' : 'opacity-80'}`}>
    <div className="flex justify-between items-start">
      <span className={`font-black ${color === 'gold' ? 'text-amber-400' : 'text-rose-600'}`}>{teamName}</span>
      {isCurrentTeam && <span className={`text-[10px] ml-auto px-2 py-1 rounded font-bold ${color === 'gold' ? 'bg-amber-400 text-black' : 'bg-rose-600 text-white'}`}>الفريق النشط</span>}
    </div>
    <div className={`text-4xl md:text-5xl font-black mt-2 tracking-tight ${color === 'gold' ? 'text-amber-400' : 'text-rose-600'}`}>
       {totalScore.toLocaleString()}
       <span className="text-[10px] font-bold opacity-40 mr-2 uppercase tracking-widest">مجموع النقاط</span>
    </div>
    <div className="mt-4 space-y-2 text-xs">
      <div className="flex justify-between">
        <span className="opacity-60">{player1Name}:</span>
        <span className="font-bold">{player1Score}</span>
      </div>
      <div className="flex justify-between">
        <span className="opacity-60">{player2Name}:</span>
        <span className="font-bold">{player2Score}</span>
      </div>
    </div>
  </div>
);

export default function App() {
  // Game State
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'END'>('START');
  const [hands, setHands] = useState<Card[][]>([[], [], [], []]);
  const [turn, setTurn] = useState(0); // 0-3
  const [scores, setScores] = useState<number[]>([0, 0, 0, 0]); // P1, P2, P3, P4
  const [teamAScore, setTeamAScore] = useState(0);
  const [teamBScore, setTeamBScore] = useState(0);
  
  // AI State
  const [aiLevel, setAiLevel] = useState<AIDifficulty>('MEDIUM');
  const [isAiThinking, setIsAiThinking] = useState(false);
  
  // Turn State
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [playedCards, setPlayedCards] = useState<(Card | null)[]>([null, null, null, null]);
  
  // Power Effects
  const [multipliers, setMultipliers] = useState<number[]>([1, 1, 1, 1]);
  const [frozen, setFrozen] = useState<boolean[]>([false, false, false, false]);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Game
  const startGame = (level: AIDifficulty) => {
    setAiLevel(level);
    const freshDeck = shuffle(CARDS_CONFIG);
    const newHands: Card[][] = [[], [], [], []];
    for (let i = 0; i < 60; i++) {
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
    setIsAiThinking(false);
  };

  // Timer logic
  useEffect(() => {
    if (activeQuestion && timeLeft > 0 && !isAnswering) {
      timerRef.current = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && !isAnswering) {
      handleAnswer(-1); // Time out
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [activeQuestion, timeLeft, isAnswering]);

  const playCard = (card: Card, cardIndex: number) => {
    if (isAnswering || frozen[turn]) return;

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
          currentScores[prevTurn] = 0;
          finalPts += 300;
          break;
        case SpecialPower.H2_TRIPLE_NEXT:
          const newMults = [...multipliers];
          newMults[teammateTurn] = 3;
          setMultipliers(newMults);
          break;
        case SpecialPower.H3_STEAL_ALL:
          const target = Math.random() > 0.5 ? opp1Turn : opp2Turn;
          finalPts += currentScores[target];
          currentScores[target] = 0;
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
        case SpecialPower.MH_S1_PENALTY:
          const targetPen = Math.random() > 0.5 ? opp1Turn : opp2Turn;
          currentScores[targetPen] = Math.max(0, currentScores[targetPen] - 100);
          break;
        case SpecialPower.MH_S2_PASS:
        case SpecialPower.MH_S3_STRATEGIC_PASS:
          finalPts += 100;
          currentScores[teammateTurn] += 50;
          break;
      }
    } else {
      if (card.power === SpecialPower.H5_NUKE) {
        finalPts -= 200;
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

  const nextTurn = () => {
    if (hands.every(h => h.length === 0)) {
      setGameState('END');
      return;
    }

    let nTurn = (turn + 1) % 4;
    
    if (frozen[nTurn]) {
      const newFrozen = [...frozen];
      newFrozen[nTurn] = false;
      setFrozen(newFrozen);
      nTurn = (nTurn + 1) % 4;
    }

    if (nTurn === 0) {
      setPlayedCards([null, null, null, null]);
    }

    setTurn(nTurn);
    setActiveCard(null);
    setActiveQuestion(null);
    setIsAnswering(false);
    setFeedback(null);
    setIsAiThinking(false);
  };

  const handleAnswer = (index: number) => {
    if (isAnswering || !activeQuestion || !activeCard) return;

    setIsAnswering(true);
    setSelectedOption(index);
    
    const isCorrect = index === activeQuestion.correctIndex;
    
    setFeedback({
      isCorrect,
      message: isCorrect ? 'أحسنت! إجابة صحيحة وتم تفعيل قدرة البطاقة.' : 'للأسف، إجابة خاطئة.'
    });

    applyPower(activeCard, isCorrect, activeCard.points);
  };

  // AI Play Action Effect
  useEffect(() => {
    if (gameState !== 'PLAYING' || turn === 0 || isAiThinking || activeQuestion) return;

    setIsAiThinking(true);
    const thinkTimeout = setTimeout(() => {
      const aiHand = hands[turn];
      if (aiHand.length === 0) {
        nextTurn();
        return;
      }
      const cardIdx = Math.floor(Math.random() * aiHand.length);
      const selectedCard = aiHand[cardIdx];
      playCard(selectedCard, cardIdx);
    }, 2500);

    return () => clearTimeout(thinkTimeout);
  }, [turn, gameState, hands, isAiThinking, activeQuestion]);

  // AI Answer Action Effect
  useEffect(() => {
    if (gameState === 'PLAYING' && turn !== 0 && activeQuestion && !isAnswering) {
      setIsAiThinking(true);
      const delay = 17000; // Strictly 17s delay
      const aiTimer = setTimeout(() => {
        setIsAiThinking(false);
        let selectedIdx = -1;
        const roll = Math.random() * 100;
        
        let successChance = 50;
        if (aiLevel === 'EASY') successChance = 25;
        if (aiLevel === 'MEDIUM') successChance = 65;
        if (aiLevel === 'HARD') successChance = 98;

        if (roll < successChance) {
          selectedIdx = activeQuestion.correctIndex;
        } else {
          const wrongIndices = [0, 1, 2, 3].filter(i => i !== activeQuestion.correctIndex);
          selectedIdx = wrongIndices[Math.floor(Math.random() * wrongIndices.length)];
        }
        handleAnswer(selectedIdx);
      }, delay);
      
      return () => clearTimeout(aiTimer);
    }
  }, [activeQuestion, turn, gameState, aiLevel, isAnswering]);

  return (
    <div className="min-h-screen w-full flex flex-col overflow-y-auto no-scrollbar bg-[#0A0E2A]" dir="rtl">
      
      {/* START SCREEN */}
      {gameState === 'START' && (
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center z-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-8"
          >
            <h1 className="text-6xl md:text-8xl font-black text-amber-400 mb-4 drop-shadow-[0_5px_15px_rgba(255,215,0,0.5)]">قدرات بطولة</h1>
            <p className="text-xl text-off-white/80 max-w-md mx-auto">لعبة البطاقات الاستراتيجية لطلاب القدرات. تحدَّ أصدقاءك، اختبر معلوماتك، وسيطر على البطولة!</p>
          </motion.div>
          
          <div className="flex flex-col gap-6 mb-12">
            <h3 className="text-xl font-bold opacity-60">اختر مستوى الذكاء الاصطناعي (الخصم):</h3>
            <div className="flex gap-4 justify-center">
              {(['EASY', 'MEDIUM', 'HARD'] as AIDifficulty[]).map((level) => (
                <button
                  key={level}
                  onClick={() => startGame(level)}
                  className={`px-8 py-3 rounded-xl border-2 transition-all font-black ${
                    level === 'EASY' ? 'border-green-500 text-green-400 hover:bg-green-500/20' :
                    level === 'MEDIUM' ? 'border-amber-400 text-amber-400 hover:bg-amber-400/20' :
                    'border-rose-600 text-rose-500 hover:bg-rose-600/20'
                  }`}
                >
                  {level === 'EASY' ? 'سهل' : level === 'MEDIUM' ? 'متوسط' : 'صعب جداً'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* GAME OVER SCREEN */}
      {gameState === 'END' && (
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center z-10">
          <Trophy className="text-amber-400 w-24 h-24 mb-6" />
          <h2 className="text-5xl font-black mb-2 text-white">انتهت البطولة!</h2>
          <div className="flex gap-8 mb-12 mt-8">
            <div className="p-8 bg-amber-400/10 border-4 border-amber-400 rounded-3xl">
              <div className="text-xl font-bold opacity-60 text-amber-400">فريق أ</div>
              <div className="text-6xl font-black text-amber-400">{teamAScore}</div>
            </div>
            <div className="p-8 bg-rose-600/10 border-4 border-rose-600 rounded-3xl">
              <div className="text-xl font-bold opacity-60 text-rose-600">فريق ب</div>
              <div className="text-6xl font-black text-rose-600">{teamBScore}</div>
            </div>
          </div>
          <button
            onClick={() => setGameState('START')}
            className="px-8 py-3 border-2 border-white/20 rounded-full hover:bg-white/10 transition-all font-bold text-white text-xl"
          >
            العودة للقائمة
          </button>
        </div>
      )}

      {/* PLAYING SCREEN */}
      {gameState === 'PLAYING' && (
        <div className="flex-1 flex flex-col relative overflow-hidden">
          
          {/* HEADER */}
          <div className="h-12 border-b border-white/10 flex items-center justify-between px-8 bg-black/40 backdrop-blur-md sticky top-0 z-50">
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm font-bold tracking-widest text-amber-400">البطولة: {activeQuestion ? `${activeQuestion.category} - ${activeQuestion.type}` : 'انتظار اللاعب'}</span>
            </div>
            <h1 className="text-xl font-black text-white">قُدرَات بُطولَة</h1>
            <div className="flex items-center gap-6">
              <div className="text-left">
                <span className="block text-[8px] text-gray-400 uppercase tracking-tighter">الوقت المتبقي</span>
                <span className={`block text-lg font-mono font-bold leading-none ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-amber-400'}`}>
                  00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden relative">
            
            {/* TOP ZONE: QUESTION AREA */}
            <div className="min-h-[420px] bg-white/5 rounded-3xl border border-white/10 p-6 flex flex-col items-center justify-center relative overflow-hidden shrink-0">
              <AnimatePresence mode="wait">
                {activeQuestion ? (
                  <motion.div
                    key={activeQuestion.id}
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    className="z-10 text-center w-full flex flex-col items-center py-4"
                  >
                    <div className={`inline-block px-4 py-1 rounded-full border text-xs font-bold mb-4 ${
                      activeCard?.difficulty === 'Hard' ? 'bg-rose-600/20 border-rose-500 text-rose-400' :
                      activeCard?.difficulty === 'MediumHard' ? 'bg-amber-400/20 border-amber-500 text-amber-400' :
                      'bg-white/10 border-white/20 text-white'
                    }`}>
                      سؤال الكرت: {activeCard?.name || activeQuestion.difficulty}
                    </div>
                    
                    <h2 className="text-xl md:text-3xl font-black leading-relaxed mb-8 max-w-4xl text-white">
                      {activeQuestion.text}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl px-4">
                      {activeQuestion.options.map((opt, i) => (
                        <button
                          key={i}
                          disabled={isAnswering}
                          onClick={() => handleAnswer(i)}
                          className={`
                            bg-white/5 transition-all border-2 border-white/10 rounded-2xl p-4 text-xl font-bold text-right flex items-center gap-4 group relative overflow-hidden text-white
                            ${isAnswering ? 
                              (i === activeQuestion.correctIndex ? 'bg-green-500/30 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 
                               (i === selectedOption ? 'bg-rose-600/30 border-rose-600' : 'opacity-20 animate-pulse'))
                              : 'hover:bg-amber-400 hover:text-black hover:border-transparent'}
                          `}
                        >
                          <span className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-lg ${isAnswering ? 'bg-black/40' : 'bg-black/30 group-hover:bg-black/10'}`}>
                            {['أ', 'ب', 'ج', 'د'][i]}
                          </span>
                          <span className="flex-1">{opt}</span>
                        </button>
                      ))}
                    </div>

                    {isAnswering && (
                      <motion.div 
                        initial={{ y: 50, opacity: 0, scale: 0.9 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        className="mt-8 w-full max-w-5xl bg-navy border-2 border-amber-400/30 rounded-[2.5rem] p-8 text-right relative shadow-[0_30px_100px_rgba(0,0,0,0.9)] overflow-hidden"
                      >
                         <div className="absolute top-0 left-0 w-3 h-full bg-amber-400"></div>
                         <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                               <div className="p-3 bg-amber-400 rounded-2xl text-black shadow-lg">
                                  <Sparkles size={24} />
                                </div>
                               <span className="text-amber-400 font-black text-2xl md:text-3xl">تحليل الإجابة والشرح:</span>
                            </div>
                            <button 
                               onClick={nextTurn}
                               className="bg-rose-600 hover:bg-rose-500 text-white p-4 rounded-3xl transition-all hover:rotate-90 active:scale-90 shadow-2xl flex items-center gap-3"
                               title="تخطي"
                            >
                               <span className="text-xs font-black">إغلاق وتخطي</span>
                               <XCircle size={32} />
                            </button>
                         </div>
                         <div className="max-h-[200px] overflow-y-auto no-scrollbar mb-8 pr-2">
                            <p className="text-lg md:text-2xl text-white opacity-95 leading-loose font-bold">
                                {activeQuestion.explanation}
                            </p>
                         </div>
                         <div className={`absolute top-0 right-48 px-10 py-3 rounded-b-3xl font-black text-lg shadow-2xl flex items-center gap-3 ${feedback?.isCorrect ? 'bg-green-500 text-white animate-bounce' : 'bg-rose-600 text-white animate-pulse'}`}>
                            {feedback?.isCorrect ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                            {feedback?.isCorrect ? 'أحسنت، إجابة صحيحة!' : 'للأسف، إجابة خاطئة'}
                         </div>
                         <div className="flex justify-end">
                            <button 
                               onClick={nextTurn}
                               className="px-12 py-4 bg-amber-400 text-black font-black text-xl rounded-full hover:bg-amber-300 transition-all flex items-center gap-4 shadow-[0_10px_30px_rgba(251,191,36,0.5)] hover:-translate-y-1 active:translate-y-0"
                            >
                               <span>متابعة البطولة</span>
                               <ArrowLeftRight size={24} />
                            </button>
                         </div>
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center z-10"
                  >
                    <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 shadow-2xl">
                       <Zap className="text-amber-400 w-12 h-12 animate-pulse" />
                    </div>
                    {isAiThinking && (
                       <motion.div 
                         initial={{ y: 20, opacity: 0 }}
                         animate={{ y: 0, opacity: 1 }}
                         className="absolute inset-x-0 -top-32 z-40 flex items-center justify-center pointer-events-none"
                       >
                         <div className="bg-navy/90 backdrop-blur-2xl px-12 py-8 rounded-[3rem] border-2 border-amber-400/40 flex flex-col items-center gap-4 shadow-[0_0_80px_rgba(251,191,36,0.3)]">
                            <Clock className="w-16 h-16 text-amber-400 animate-spin-slow" />
                            <div className="text-3xl font-black text-amber-400 tracking-tight">الكمبيوتر يحلل السؤال...</div>
                            <div className="flex gap-3">
                               <div className="w-3 h-3 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                               <div className="w-3 h-3 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                               <div className="w-3 h-3 bg-amber-400 rounded-full animate-bounce"></div>
                            </div>
                         </div>
                       </motion.div>
                    )}
                    <h2 className="text-4xl md:text-5xl font-black text-white/30 tracking-tight">
                       {turn === 0 ? 'دورك الآن.. ألقِ ورقتك!' : `بانتظار دور ${PLAYER_NAMES[turn]}...`}
                    </h2>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* BOTTOM ZONE */}
            <div className="flex-1 flex gap-4 overflow-hidden relative mt-8">
               
               {/* SIDEBAR */}
               <div className="w-80 flex flex-col gap-4 shrink-0">
                  <TeamScoreCard 
                    teamName="الفريق أ (ذهبي)"
                    totalScore={teamAScore}
                    player1Name={PLAYER_NAMES[0]}
                    player1Score={scores[0]}
                    player2Name={PLAYER_NAMES[2]}
                    player2Score={scores[2]}
                    isCurrentTeam={turn === 0 || turn === 2}
                    color="gold"
                  />
                  <TeamScoreCard 
                    teamName="الفريق ب (كرمزي)"
                    totalScore={teamBScore}
                    player1Name={PLAYER_NAMES[1]}
                    player1Score={scores[1]}
                    player2Name={PLAYER_NAMES[3]}
                    player2Score={scores[3]}
                    isCurrentTeam={turn === 1 || turn === 3}
                    color="crimson"
                  />
               </div>

               {/* MAIN TABLE */}
               <div className="flex-1 bg-black/40 rounded-[3rem] border border-white/5 relative p-4 flex flex-col overflow-hidden">
                  <div className="flex-1 flex items-center justify-center relative py-12">
                    <div className="w-full max-w-[600px] aspect-[4/3] md:aspect-square border-2 border-dashed border-white/10 rounded-full flex items-center justify-center relative">
                      
                      {/* P3 - TOP */}
                      <div className="absolute -top-20 left-1/2 -translate-x-1/2 flex flex-col items-center">
                        <OpponentHand count={hands[2].length} isActive={turn === 2} team="A" />
                        <div className={`w-16 h-16 rounded-full border-4 bg-slate-800 flex items-center justify-center transition-all mt-3 ${turn === 2 ? 'border-amber-400 ring-8 ring-amber-400/20 scale-125' : 'border-white/10 opacity-40'}`}>
                           <Users size={24} className={turn === 2 ? 'text-amber-400' : 'text-gray-500'} />
                        </div>
                        <span className="text-xs font-black text-amber-500 mt-2">صديقك</span>
                      </div>
                      
                      {/* P2 - LEFT */}
                      <div className="absolute top-1/2 -left-24 -translate-y-1/2 flex flex-col items-center">
                        <div className={`w-16 h-16 rounded-full border-4 bg-slate-800 flex items-center justify-center transition-all ${turn === 1 ? 'border-rose-600 ring-8 ring-rose-600/20 scale-125' : 'border-white/10 opacity-40'}`}>
                           <Zap size={24} className={turn === 1 ? 'text-rose-600' : 'text-gray-500'} />
                        </div>
                        <span className="text-xs font-black text-rose-500 mt-2">الخصم</span>
                        <OpponentHand count={hands[1].length} isActive={turn === 1} team="B" />
                      </div>

                      {/* P4 - RIGHT */}
                      <div className="absolute top-1/2 -right-24 -translate-y-1/2 flex flex-col items-center">
                        <div className={`w-16 h-16 rounded-full border-4 bg-slate-800 flex items-center justify-center transition-all ${turn === 3 ? 'border-rose-600 ring-8 ring-rose-600/20 scale-125' : 'border-white/10 opacity-40'}`}>
                           <Target size={24} className={turn === 3 ? 'text-rose-600' : 'text-gray-500'} />
                        </div>
                        <span className="text-xs font-black text-rose-500 mt-2">الخصم</span>
                        <OpponentHand count={hands[3].length} isActive={turn === 3} team="B" />
                      </div>

                      {/* P1 - BOTTOM */}
                      <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center">
                         <div className={`w-16 h-16 rounded-full border-4 bg-slate-800 flex items-center justify-center transition-all mb-3 ${turn === 0 ? 'border-amber-400 ring-8 ring-amber-400/20 scale-125' : 'border-white/10 opacity-40'}`}>
                           <User size={24} className={turn === 0 ? 'text-amber-400' : 'text-gray-500'} />
                        </div>
                        <span className="text-xs font-black text-amber-500 uppercase">أنت</span>
                      </div>

                      {/* Played Cards Grid */}
                      <div className="flex gap-6 flex-wrap justify-center items-center z-10 w-full px-12">
                        <AnimatePresence>
                          {playedCards.map((pc, i) => pc && (
                            <motion.div
                              key={`${i}-${pc.id}`}
                              initial={{ scale: 0, opacity: 0, y: 50, rotate: -20 }}
                              animate={{ scale: 1, opacity: 1, y: 0, rotate: (i - 1.5) * 10 }}
                              exit={{ scale: 0, opacity: 0 }}
                              className={`w-32 h-44 md:w-40 md:h-56 rounded-2xl border-4 shadow-[0_20px_60px_rgba(0,0,0,0.7)] flex flex-col p-4 relative ${
                                pc.difficulty === 'Hard' ? 'bg-gradient-to-br from-rose-900 to-rose-950 border-rose-500' :
                                pc.difficulty === 'MediumHard' ? 'bg-gradient-to-br from-amber-700 to-amber-900 border-amber-400' :
                                'bg-slate-800 border-slate-600'
                              }`}
                            >
                              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-navy border-2 border-white/20 px-4 py-1 rounded-full text-xs font-black whitespace-nowrap z-20 text-white">
                                 {PLAYER_NAMES[i]}
                              </div>
                              <div className="text-[10px] font-black opacity-60 text-white mb-2">{pc.difficulty.toUpperCase()}</div>
                              <div className="flex-1 flex items-center justify-center text-center text-sm md:text-lg font-black leading-tight text-white">
                                {pc.name}
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  {/* ACTIVE PLAYER HAND */}
                  <div className="h-[400px] relative mt-auto border-t-2 border-white/5 pt-12 bg-gradient-to-t from-black/80 to-transparent overflow-visible">
                    <div className="absolute inset-0 flex justify-center items-end pb-12 overflow-visible pointer-events-none">
                      <div className="flex -space-x-12 md:-space-x-16 p-8 px-24 pointer-events-auto overflow-visible items-end">
                        {turn === 0 ? hands[turn].map((card, i) => (
                          <motion.button
                            key={card.id + i}
                            whileHover={{ y: -180, zIndex: 100, scale: 1.6, rotate: 0 }}
                            onClick={() => playCard(card, i)}
                            disabled={!!activeQuestion || frozen[turn]}
                            className={`
                              w-36 h-52 md:w-52 md:h-80 rounded-[2rem] border-4 shadow-2xl shrink-0 transition-all duration-500 relative group overflow-hidden
                              ${card.difficulty === 'Hard' ? 'bg-gradient-to-br from-rose-900 to-rose-950 border-rose-500 glow-crimson' :
                                card.difficulty === 'MediumHard' ? 'bg-gradient-to-br from-amber-700 to-amber-900 border-amber-400 glow-gold' :
                                card.difficulty === 'Medium' ? 'bg-gradient-to-br from-slate-700 to-slate-900 border-slate-400' :
                                'bg-gradient-to-br from-gray-800 to-gray-950 border-gray-600'
                              }
                              ${!!activeQuestion || frozen[turn] ? 'grayscale opacity-30 cursor-not-allowed' : 'cursor-pointer hover:border-white hover:shadow-amber-400/20'}
                              flex flex-col items-center justify-between p-6 text-center
                            `}
                            style={{ 
                              rotate: `${(i - hands[turn].length / 2) * 2}deg`,
                              transformOrigin: 'bottom center'
                            }}
                          >
                            <div className="text-xs font-black uppercase opacity-60 text-white tracking-widest">{card.difficulty}</div>
                            <div className="flex-1 flex flex-col items-center justify-center gap-4">
                              <div className="text-lg md:text-2xl font-black leading-tight text-white group-hover:text-amber-400 transition-colors uppercase">
                                {card.name}
                              </div>
                              {card.power !== SpecialPower.NONE && (
                                <div className="p-3 bg-white/10 rounded-full border border-white/20 animate-pulse">
                                   <Zap size={32} className="text-amber-400" />
                                </div>
                              )}
                            </div>
                            <div className="w-full flex justify-between items-center mt-6 pt-4 border-t-2 border-white/10">
                               <span className="text-xs font-bold opacity-60 text-white">النقاط</span>
                               <span className="text-2xl font-black text-amber-400">+{card.points}</span>
                            </div>
                          </motion.button>
                        )) : (
                          <div className="flex flex-col items-center gap-6 py-12 w-full">
                            <Clock className="w-12 h-12 text-amber-400 animate-spin-slow" />
                            <div className="text-amber-400 font-black animate-pulse text-3xl tracking-tight">
                              بانتظار حركة {PLAYER_NAMES[turn]}...
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-amber-400/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-rose-600/5 rounded-full blur-[150px]" />
      </div>
    </div>
  );
}
