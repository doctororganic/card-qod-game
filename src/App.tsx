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
const PLAYER_NAMES = ['أنت (اللاعب ١)', 'الكمبيوتر ٢', 'الكمبيوتر ٣', 'الكمبيوتر ٤']; // P1 & P3 Team A, P2 & P4 Team B

type AIDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

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
  const [multipliers, setMultipliers] = useState<number[]>([1, 1, 1, 1]); // Next turn multiplier
  const [frozen, setFrozen] = useState<boolean[]>([false, false, false, false]);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Game
  const startGame = (level: AIDifficulty) => {
    setAiLevel(level);
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

  const nextTurn = () => {
    // Check if game end
    if (hands.every(h => h.length === 0)) {
      setGameState('END');
      return;
    }

    // Next turn logic
    let nTurn = (turn + 1) % 4;
    
    // If next player is frozen, skip them (unfreeze for next cycle)
    if (frozen[nTurn]) {
      const newFrozen = [...frozen];
      newFrozen[nTurn] = false;
      setFrozen(newFrozen);
      nTurn = (nTurn + 1) % 4;
    }

    // If round finished (everyone played), clear table
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

  // AI Logic Effect
  useEffect(() => {
    if (gameState !== 'PLAYING' || turn === 0 || isAiThinking) return;

    // AI thinking process
    setIsAiThinking(true);
    
    const thinkTimeout = setTimeout(() => {
      // Step 1: Play a card
      const aiHand = hands[turn];
      if (aiHand.length === 0) {
        nextTurn();
        return;
      }

      // Simple AI card selection: Prefer high points or random
      const cardIdx = Math.floor(Math.random() * aiHand.length);
      const selectedCard = aiHand[cardIdx];
      playCard(selectedCard, cardIdx);

      // AI Delay for answering: at least 15 seconds
      // Handled by the other useEffect
    }, 3000);

    return () => clearTimeout(thinkTimeout);
  }, [turn, gameState, hands, isAiThinking]);

  // Refined AI Answer Effect
  useEffect(() => {
    if (gameState === 'PLAYING' && turn !== 0 && activeQuestion && !isAnswering) {
      const delay = 15000 + (Math.random() * 3000); // 15s+ delay
      const aiTimer = setTimeout(() => {
        let selectedIdx = -1;
        const roll = Math.random() * 100;
        
        let successChance = 50;
        if (aiLevel === 'EASY') successChance = 30;
        if (aiLevel === 'MEDIUM') successChance = 65;
        if (aiLevel === 'HARD') successChance = 95;

        if (roll < successChance) {
          selectedIdx = activeQuestion.correctIndex;
        } else {
          // Choose a wrong answer
          const wrongIndices = [0, 1, 2, 3].filter(i => i !== activeQuestion.correctIndex);
          selectedIdx = wrongIndices[Math.floor(Math.random() * wrongIndices.length)];
        }
        handleAnswer(selectedIdx);
      }, delay);
      
      return () => clearTimeout(aiTimer);
    }
  }, [activeQuestion, turn, gameState, aiLevel, isAnswering]);

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

          <div className="flex flex-col gap-4 mb-12">
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
            <div className="min-h-[380px] flex-grow bg-white/5 rounded-3xl border border-white/10 p-6 flex flex-col items-center justify-center relative overflow-hidden shrink-0">
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
                    className="z-10 text-center w-full flex flex-col items-center py-4"
                  >
                    <div className={`inline-block px-4 py-1 rounded-full border text-xs font-bold mb-4 ${
                      activeCard?.difficulty === 'Hard' ? 'bg-rose-600/20 border-rose-500 text-rose-400' :
                      activeCard?.difficulty === 'MediumHard' ? 'bg-amber-400/20 border-amber-500 text-amber-400' :
                      'bg-white/10 border-white/20'
                    }`}>
                      سؤال الكرت: {activeCard?.name || activeQuestion.difficulty}
                    </div>
                    
                    <h2 className="text-xl md:text-2xl font-bold leading-relaxed mb-6 max-w-3xl">
                      {activeQuestion.text}
                    </h2>

                    <div className="grid grid-cols-2 gap-3 w-full max-w-4xl">
                      {activeQuestion.options.map((opt, i) => (
                        <button
                          key={i}
                          disabled={isAnswering}
                          onClick={() => handleAnswer(i)}
                          className={`
                            bg-white/5 transition-all border border-white/10 rounded-xl p-3 text-lg font-bold text-right flex items-center gap-3 group relative overflow-hidden
                            ${isAnswering ? 
                              (i === activeQuestion.correctIndex ? 'bg-green-500/40 border-green-500 glow-green' : 
                               (i === selectedOption ? 'bg-rose-500/40 border-rose-500 glow-crimson' : 'opacity-30'))
                              : 'hover:bg-[#FFD700] hover:text-black hover:border-transparent'}
                          `}
                        >
                          <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm ${isAnswering ? 'bg-black/40' : 'bg-black/30 group-hover:bg-black/10'}`}>
                            {['أ', 'ب', 'ج', 'د'][i]}
                          </span>
                          <span className="flex-1 line-clamp-1">{opt}</span>
                        </button>
                      ))}
                    </div>

                    {isAnswering && (
                      <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="mt-6 w-full max-w-4xl bg-black/60 backdrop-blur-xl border border-white/20 rounded-3xl p-6 text-right relative overflow-hidden"
                      >
                         <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                         <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2">
                               <Sparkles className="text-amber-400" size={18} />
                               <span className="text-amber-400 font-extrabold text-lg">تحليل الإجابة والشرح:</span>
                            </div>
                            <button 
                               onClick={nextTurn}
                               className="bg-white/10 hover:bg-rose-600 p-2 rounded-full transition-all hover:scale-110 active:scale-95 group"
                               title="إغلاق والانتقال للدور التالي"
                            >
                               <XCircle size={24} className="group-hover:text-white" />
                            </button>
                         </div>
                         <p className="text-base md:text-lg opacity-90 leading-relaxed font-medium">
                            {activeQuestion.explanation}
                         </p>
                         
                         {/* Visual Feedback Badge */}
                         <div className={`absolute -top-0 right-12 px-6 py-1 rounded-b-xl font-black text-sm shadow-lg ${feedback?.isCorrect ? 'bg-green-500 text-white' : 'bg-rose-600 text-white'}`}>
                            {feedback?.isCorrect ? '✓ إجابة صحيحة' : '✗ إجابة خاطئة'}
                         </div>
                         
                         <div className="mt-4 flex justify-end">
                            <button 
                               onClick={nextTurn}
                               className="px-6 py-2 bg-amber-400 text-black font-black rounded-full hover:bg-amber-300 transition-all flex items-center gap-2"
                            >
                               <span>متابعة اللعب</span>
                               <ArrowLeftRight size={16} />
                            </button>
                         </div>
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
                  <div className="flex-1 flex items-center justify-center relative py-8">
                    <div className="w-full max-w-[500px] min-h-[300px] border-2 border-dashed border-white/5 rounded-full flex items-center justify-center gap-4 relative">
                      
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
                          <div className="flex gap-4 flex-wrap justify-center p-4">
                            {playedCards.map((pc, i) => pc && (
                              <motion.div
                                key={i}
                                initial={{ scale: 0, opacity: 0, y: 50, rotate: -20 }}
                                animate={{ scale: 1, opacity: 1, y: 0, rotate: (i - 1) * 8 }}
                                exit={{ scale: 0, opacity: 0 }}
                                className={`w-28 h-40 md:w-32 md:h-48 rounded-xl border-2 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col p-3 transition-transform ${
                                  pc.difficulty === 'Hard' ? 'bg-gradient-to-br from-rose-900 to-rose-950 border-rose-500' :
                                  pc.difficulty === 'MediumHard' ? 'bg-gradient-to-br from-amber-700 to-amber-900 border-amber-400' :
                                  'bg-slate-800 border-slate-600'
                                }`}
                              >
                                <div className="text-[10px] font-black opacity-50 mb-1">{pc.difficulty.toUpperCase()}</div>
                                <div className="flex-1 flex items-center justify-center text-center text-xs md:text-sm font-black leading-tight">
                                  {pc.name}
                                </div>
                                <div className={`h-1.5 w-full rounded-full mt-2 ${pc.difficulty === 'Hard' ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e]' : 'bg-amber-400 shadow-[0_0_10px_#fbbf24]'}`}></div>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* ACTIVE PLAYER HAND */}
                  <div className="h-64 relative mt-auto border-t border-white/5 pt-4">
                    <div className="absolute inset-0 flex justify-center items-end pb-4 overflow-x-auto no-scrollbar pointer-events-auto">
                      <div className="flex -space-x-12 p-6">
                        {turn === 0 ? hands[turn].map((card, i) => (
                          <motion.button
                            key={card.id + i}
                            whileHover={{ y: -80, zIndex: 100, scale: 1.2 }}
                            onClick={() => playCard(card, i)}
                            disabled={!!activeQuestion || frozen[turn]}
                            className={`
                              w-28 h-40 md:w-36 md:h-52 rounded-xl border-2 shadow-2xl shrink-0 transition-all duration-300
                              ${card.difficulty === 'Hard' ? 'bg-gradient-to-br from-rose-900 to-rose-950 border-rose-500 glow-crimson' :
                                card.difficulty === 'MediumHard' ? 'bg-gradient-to-br from-amber-700 to-amber-900 border-amber-400 glow-gold' :
                                card.difficulty === 'Medium' ? 'bg-gradient-to-br from-slate-700 to-slate-900 border-slate-400' :
                                'bg-gradient-to-br from-gray-800 to-gray-950 border-gray-600'
                              }
                              ${!!activeQuestion || frozen[turn] ? 'grayscale opacity-50' : 'cursor-pointer'}
                              flex flex-col items-center justify-between p-4 text-center
                            `}
                            style={{ 
                              rotate: `${(i - hands[turn].length / 2) * 4}deg`,
                            }}
                          >
                            <div className="text-[10px] font-black uppercase opacity-60 tracking-wider">
                               {card.difficulty}
                            </div>
                            <div className="flex-1 flex flex-col items-center justify-center gap-1">
                              <div className="text-sm md:text-base font-black leading-tight text-white mb-1">
                                {card.name}
                              </div>
                              {card.power !== SpecialPower.NONE && <Zap size={20} className="text-amber-400 animate-pulse" />}
                            </div>
                            <div className="text-xs font-black bg-black/40 px-3 py-1 rounded-full border border-white/10 text-amber-400">
                              +{card.points}
                            </div>
                          </motion.button>
                        )) : (
                          <div className="text-amber-400 font-black animate-pulse text-lg flex items-center gap-2">
                            <Clock className="animate-spin" />
                            بانتظار حركة {PLAYER_NAMES[turn]}...
                          </div>
                        )}
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
