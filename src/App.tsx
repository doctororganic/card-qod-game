/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Users, 
  Timer, 
  Zap, 
  Shield, 
  Target, 
  AlertTriangle, 
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
const PLAYER_NAMES = ['اللاعب ١', 'اللاعب ٢', 'اللاعب ٣', 'اللاعب ٤']; // P1 & P3 Team A, P2 & P4 Team B

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
      {isCurrentTeam && <span className={`text-[10px] px-2 py-1 rounded font-bold ${color === 'gold' ? 'bg-amber-400 text-black' : 'bg-rose-600 text-white'}`}>الفريق النشط</span>}
    </div>
    <div className={`text-4xl font-black mt-2 ${color === 'gold' ? 'text-amber-400' : 'text-rose-600'}`}>{totalScore.toLocaleString()}</div>
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
  const [deck, setDeck] = useState<Card[]>([]);
  const [hands, setHands] = useState<Card[][]>([[], [], [], []]);
  const [turn, setTurn] = useState(0); // 0-3
  const [scores, setScores] = useState<number[]>([0, 0, 0, 0]); // P1, P2, P3, P4
  const [teamAScore, setTeamAScore] = useState(0);
  const [teamBScore, setTeamBScore] = useState(0);
  
  // Turn State
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [playedCards, setPlayedCards] = useState<(Card | null)[]>([null, null, null, null]);
  
  // Power Effects
  const [multipliers, setMultipliers] = useState<number[]>([1, 1, 1, 1]); // Next turn multiplier
  const [frozen, setFrozen] = useState<boolean[]>([false, false, false, false]);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Game
  const startGame = () => {
    const freshDeck = shuffle(CARDS_CONFIG);
    const newHands: Card[][] = [[], [], [], []];
    
    // Deal cards (Each player gets 15 cards for 60 total)
    for (let i = 0; i < 60; i++) {
      newHands[i % 4].push(freshDeck[i]);
    }
    
    setDeck(freshDeck);
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

    // Remove from hand
    const newHands = [...hands];
    newHands[turn] = newHands[turn].filter((_, i) => i !== cardIndex);
    setHands(newHands);

    // Pick question based on difficulty
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
    
    // Visual: show card on table
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
          // In hot-seat, pass is simplified to sharing points or just a bonus
          finalPts += 100;
          currentScores[teammateTurn] += 50;
          break;
      }
    } else {
      // Nuclear bomb penalty
      if (card.power === SpecialPower.H5_NUKE) {
        finalPts -= 200;
      }
    }

    currentScores[turn] += finalPts;
    setScores(currentScores);
    
    // Clear multiplier after used
    if (multipliers[turn] > 1) {
      const resetMults = [...multipliers];
      resetMults[turn] = 1;
      setMultipliers(resetMults);
    }

    // Recalculate Team Scores
    setTeamAScore(currentScores[0] + currentScores[2]);
    setTeamBScore(currentScores[1] + currentScores[3]);
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

    // Turn transition delay
    setTimeout(() => {
      // Check if game end
      if (hands.every(h => h.length === 0)) {
        setGameState('END');
        return;
      }

      // Next turn logic
      let nextTurn = (turn + 1) % 4;
      
      // If next player is frozen, skip them (unfreeze for next cycle)
      if (frozen[nextTurn]) {
        const newFrozen = [...frozen];
        newFrozen[nextTurn] = false;
        setFrozen(newFrozen);
        nextTurn = (nextTurn + 1) % 4;
      }

      // If round finished (everyone played), clear table
      if (nextTurn === 0) {
        setPlayedCards([null, null, null, null]);
      }

      setTurn(nextTurn);
      setActiveCard(null);
      setActiveQuestion(null);
      setIsAnswering(false);
      setFeedback(null);
    }, 3000);
  };

  return (
    <div className="min-h-screen w-full flex flex-col overflow-hidden bg-[#0A0E2A]" dir="rtl">
      
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full mb-12">
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4">
              <Trophy className="text-amber-400 w-12 h-12 shrink-0" />
              <div className="text-right">
                <h3 className="font-bold text-lg">اربح النقاط</h3>
                <p className="text-sm opacity-60">أجب على أسئلة القسم الكمي واللفظي بشكل صحيح.</p>
              </div>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4">
              <Zap className="text-amber-400 w-12 h-12 shrink-0" />
              <div className="text-right">
                <h3 className="font-bold text-lg">قدرات خاصة</h3>
                <p className="text-sm opacity-60">استخدم البطاقات القوية لتعطيل الخصم أو دعم فريقك.</p>
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startGame}
            className="px-12 py-4 bg-amber-400 text-navy text-2xl font-black rounded-full shadow-[0_0_30px_rgba(255,215,0,0.4)] hover:shadow-[0_0_50px_rgba(255,215,0,0.6)] transition-all"
          >
            ابدأ البطولة الآن
          </motion.button>
        </div>
      )}

      {/* GAME OVER SCREEN */}
      {gameState === 'END' && (
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center z-10">
          <Trophy className="text-amber-400 w-24 h-24 mb-6" />
          <h2 className="text-5xl font-black mb-2">انتهت البطولة!</h2>
          <div className="flex gap-8 mb-12 mt-8">
            <div className="p-8 bg-amber-400/10 border-4 border-amber-400 rounded-3xl">
              <div className="text-xl font-bold opacity-60">فريق أ</div>
              <div className="text-6xl font-black">{teamAScore}</div>
            </div>
            <div className="p-8 bg-rose-600/10 border-4 border-rose-600 rounded-3xl">
              <div className="text-xl font-bold opacity-60">فريق ب</div>
              <div className="text-6xl font-black">{teamBScore}</div>
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-12">
            الفائز هو: {teamAScore > teamBScore ? <span className="text-amber-400">فريق أ 🎉</span> : <span className="text-rose-600">فريق ب 🎉</span>}
          </h3>
          <button
            onClick={() => setGameState('START')}
            className="px-8 py-3 border-2 border-white/20 rounded-full hover:bg-white/10 transition-all font-bold"
          >
            العودة للقائمة
          </button>
        </div>
      )}

      {/* PLAYING SCREEN */}
      {gameState === 'PLAYING' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* HEADER: Geometric Balance Style */}
          <div className="h-12 border-b border-white/10 flex items-center justify-between px-8 bg-black/20 shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm font-bold tracking-widest text-[#FFD700]">البطولة: {activeQuestion ? (activeQuestion.category + ' - ' + activeQuestion.type) : 'انتظار اللاعب'}</span>
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

          <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
            
            {/* TOP ZONE: QUESTION AREA */}
            <div className="h-[340px] bg-white/5 rounded-3xl border border-white/10 p-6 flex flex-col items-center justify-center relative overflow-hidden shrink-0">
              <div className="absolute top-0 right-0 p-4 opacity-5 uppercase font-black text-6xl rotate-12 pointer-events-none">
                {activeQuestion ? activeQuestion.category : 'قياس'}
              </div>
              
              <AnimatePresence mode="wait">
                {activeQuestion ? (
                  <motion.div
                    key={activeQuestion.id}
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    className="z-10 text-center w-full flex flex-col items-center"
                  >
                    <div className={`inline-block px-4 py-1 rounded-full border text-xs font-bold mb-4 ${
                      activeCard?.difficulty === 'Hard' ? 'bg-rose-600/20 border-rose-500 text-rose-400' :
                      activeCard?.difficulty === 'MediumHard' ? 'bg-amber-400/20 border-amber-500 text-amber-400' :
                      'bg-white/10 border-white/20'
                    }`}>
                      سؤال الكرت: {activeCard?.name || activeQuestion.difficulty}
                    </div>
                    
                    <h2 className="text-2xl md:text-3xl font-bold leading-relaxed mb-8 max-w-3xl">
                      {activeQuestion.text}
                    </h2>

                    <div className="grid grid-cols-2 gap-4 w-full max-w-4xl">
                      {activeQuestion.options.map((opt, i) => (
                        <button
                          key={i}
                          disabled={isAnswering}
                          onClick={() => handleAnswer(i)}
                          className={`
                            bg-white/5 transition-all border border-white/10 rounded-xl p-4 text-xl font-bold text-right flex items-center gap-4 group relative overflow-hidden
                            ${isAnswering ? 
                              (i === activeQuestion.correctIndex ? 'bg-green-500/40 border-green-500 glow-green' : 
                               (i === selectedOption ? 'bg-rose-500/40 border-rose-500 glow-crimson' : 'opacity-30'))
                              : 'hover:bg-[#FFD700] hover:text-black hover:border-transparent'}
                          `}
                        >
                          <span className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isAnswering ? 'bg-black/40' : 'bg-black/30 group-hover:bg-black/10'}`}>
                            {['أ', 'ب', 'ج', 'د'][i]}
                          </span>
                          <span className="flex-1">{opt}</span>
                        </button>
                      ))}
                    </div>

                    {feedback && (
                      <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`absolute bottom-4 px-6 py-2 rounded-full font-black text-sm z-20 ${feedback.isCorrect ? 'bg-green-500 text-white shadow-lg' : 'bg-rose-600 text-white shadow-lg'}`}
                      >
                        {feedback.message}
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center z-10"
                  >
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
                       <Zap className="text-amber-400" />
                    </div>
                    <h2 className="text-2xl font-bold opacity-60">بانتظار دور {PLAYER_NAMES[turn]}...</h2>
                    <p className="text-sm opacity-40">اختر بطاقة من يدك لبدء التحدي</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* BOTTOM ZONE: GAME AREA SPLIT */}
            <div className="flex-1 flex gap-4 overflow-hidden">
               
               {/* SIDEBAR: TEAM SCORES */}
               <div className="w-72 flex flex-col gap-4 shrink-0">
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

               {/* MAIN: GAME ZONE */}
               <div className="flex-1 bg-black/40 rounded-3xl border border-white/5 relative p-4 flex flex-col overflow-hidden">
                  
                  {/* Circular Table Area */}
                  <div className="flex-1 flex items-center justify-center relative">
                    <div className="w-[440px] h-[200px] border-2 border-dashed border-white/5 rounded-full flex items-center justify-center gap-4 relative">
                      
                      {/* Player Avatars around the table */}
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center">
                        <div className={`w-12 h-12 rounded-full border-2 bg-slate-800 flex items-center justify-center mb-1 text-xs transition-colors ${turn === 0 ? 'border-amber-400 glow-black scale-110' : 'border-white/20 opacity-50'}`}>P1</div>
                        <span className="text-[10px] text-gray-500 uppercase">فريق أ</span>
                      </div>
                      
                      <div className="absolute top-1/2 -left-12 -translate-y-1/2 flex flex-col items-center">
                        <div className={`w-12 h-12 rounded-full border-2 bg-slate-800 flex items-center justify-center mb-1 text-xs transition-colors ${turn === 1 ? 'border-rose-600 glow-black scale-110' : 'border-white/20 opacity-50'}`}>P2</div>
                        <span className="text-[10px] text-gray-500 uppercase">فريق ب</span>
                      </div>

                      <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center">
                        <div className={`w-12 h-12 rounded-full border-2 bg-slate-800 flex items-center justify-center mb-1 text-xs transition-colors ${turn === 2 ? 'border-amber-400 glow-black scale-110' : 'border-white/20 opacity-50'}`}>P3</div>
                        <span className="text-[10px] text-gray-500 uppercase">فريق أ</span>
                      </div>

                      <div className="absolute top-1/2 -right-12 -translate-y-1/2 flex flex-col items-center">
                        <div className={`w-12 h-12 rounded-full border-2 bg-slate-800 flex items-center justify-center mb-1 text-xs transition-colors ${turn === 3 ? 'border-rose-600 glow-black scale-110' : 'border-white/20 opacity-50'}`}>P4</div>
                        <span className="text-[10px] text-gray-500 uppercase">فريق ب</span>
                      </div>

                      {/* Played Card Slot (Current turn or last play) */}
                      <AnimatePresence>
                        {playedCards.some(pc => pc !== null) && (
                          <div className="flex gap-4">
                            {playedCards.map((pc, i) => pc && (
                              <motion.div
                                key={i}
                                initial={{ scale: 0, opacity: 0, y: 50 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0, opacity: 0 }}
                                className={`w-24 h-36 rounded-lg border-2 shadow-2xl flex flex-col p-2 transition-transform ${
                                  pc.difficulty === 'Hard' ? 'bg-gradient-to-br from-rose-900 to-rose-950 border-rose-500' :
                                  pc.difficulty === 'MediumHard' ? 'bg-gradient-to-br from-amber-700 to-amber-900 border-amber-400' :
                                  'bg-slate-800 border-slate-600'
                                }`}
                                style={{ rotate: `${(i - 1) * 5}deg` }}
                              >
                                <div className="text-[8px] font-bold opacity-50">{pc.difficulty.toUpperCase()}</div>
                                <div className="flex-1 flex items-center justify-center text-center text-[10px] font-bold leading-tight">
                                  {pc.name}
                                </div>
                                <div className={`h-1 w-full ${pc.difficulty === 'Hard' ? 'bg-rose-500' : 'bg-amber-400'}`}></div>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* ACTIVE PLAYER HAND */}
                  <div className="h-48 relative">
                    <div className="absolute inset-0 flex justify-center items-end pb-2 overflow-x-auto no-scrollbar pointer-events-auto">
                      <div className="flex -space-x-10 p-4">
                        {hands[turn].map((card, i) => (
                          <motion.button
                            key={card.id + i}
                            whileHover={{ y: -60, zIndex: 50, scale: 1.1 }}
                            onClick={() => playCard(card, i)}
                            disabled={!!activeQuestion || frozen[turn]}
                            className={`
                              w-24 h-36 md:w-32 md:h-44 rounded-xl border-2 shadow-2xl shrink-0 transition-all duration-300
                              ${card.difficulty === 'Hard' ? 'bg-gradient-to-br from-rose-900 to-rose-950 border-rose-500 glow-crimson' :
                                card.difficulty === 'MediumHard' ? 'bg-gradient-to-br from-amber-700 to-amber-900 border-amber-400 glow-gold' :
                                card.difficulty === 'Medium' ? 'bg-gradient-to-br from-slate-700 to-slate-900 border-slate-400' :
                                'bg-gradient-to-br from-gray-800 to-gray-950 border-gray-600'
                              }
                              ${!!activeQuestion || frozen[turn] ? 'grayscale opacity-50' : 'cursor-pointer'}
                              flex flex-col items-center justify-between p-3 text-center
                            `}
                            style={{ rotate: `${(i - hands[turn].length / 2) * 5}deg` }}
                          >
                            <div className="text-[10px] font-black uppercase opacity-60 tracking-wider">
                               {card.difficulty}
                            </div>
                            <div className="flex-1 flex flex-col items-center justify-center gap-1">
                              <div className="text-sm font-black leading-tight text-white mb-1">
                                {card.name}
                              </div>
                              {card.power !== SpecialPower.NONE && <Zap size={18} className="text-amber-400 animate-pulse" />}
                            </div>
                            <div className="text-xs font-black bg-black/40 px-3 py-1 rounded-full border border-white/10 text-amber-400">
                              +{card.points}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Info Overlay */}
                  {activeCard && activeCard.power !== SpecialPower.NONE && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="absolute bottom-2 right-2 p-3 bg-navy/90 border border-white/20 rounded-xl max-w-[180px] z-20 backdrop-blur-md shadow-2xl"
                    >
                      <div className="flex items-center gap-2 text-amber-400 mb-1">
                        <Sparkles size={14} />
                        <span className="text-[10px] font-black">قدرة البطاقة:</span>
                      </div>
                      <p className="text-[9px] leading-relaxed font-bold opacity-80">{activeCard.description}</p>
                    </motion.div>
                  )}

               </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Aesthetics */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-400/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-600/5 rounded-full blur-[100px]" />
      </div>

    </div>
  );
}
