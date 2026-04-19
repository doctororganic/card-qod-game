
import { QuestionDifficulty } from './questions';

export type CardDifficulty = 'Hard' | 'MediumHard' | 'Medium' | 'Easy';

export enum SpecialPower {
  H1_AVENGE = 'H1_AVENGE', // Deduct prev opponent all pts, +300 self
  H2_TRIPLE_NEXT = 'H2_TRIPLE_NEXT', // Triple teammate next turn
  H3_STEAL_ALL = 'H3_STEAL_ALL', // Steal all pts from one opponent
  H4_DOUBLE_HIT = 'H4_DOUBLE_HIT', // -100 opponent, +200 self, freeze opponent
  H5_NUKE = 'H5_NUKE', // +500 team on correct, -200 self on wrong, +150 teammate on correct
  MH_S1_PENALTY = 'MH_S1_PENALTY', // -100 opponent choice
  MH_S2_PASS = 'MH_S2_PASS', // Pass to teammate, share pts
  MH_S3_STRATEGIC_PASS = 'MH_S3_STRATEGIC_PASS', // Pass to teammate, steal bonus if opponent played
  NONE = 'NONE'
}

export interface Card {
  id: string;
  name: string;
  difficulty: CardDifficulty;
  power: SpecialPower;
  description: string;
  points: number;
  isArmed?: boolean;
}

export const CARDS_CONFIG: Card[] = [
  // --- HARD (5 Cards) ---
  { id: 'h1', name: 'الخصم الانتقامي', difficulty: 'Hard', power: SpecialPower.H1_AVENGE, points: 300, description: 'يخصم نقاط الخصم الذي لعب قبلك مباشرةً ويعطيك +٣٠٠ نقطة' },
  { id: 'h2', name: 'المضاعف الذهبي', difficulty: 'Hard', power: SpecialPower.H2_TRIPLE_NEXT, points: 250, description: 'يضاعف إجابة صديقك ٣ أضعاف في دوره القادم مباشرةً لو أجاب صح' },
  { id: 'h3', name: 'السارق الكبير', difficulty: 'Hard', power: SpecialPower.H3_STEAL_ALL, points: 250, description: 'يخصم كل نقاط خصمك ويحولها لرصيدك' },
  { id: 'h4', name: 'الضربة المزدوجة', difficulty: 'Hard', power: SpecialPower.H4_DOUBLE_HIT, points: 200, isArmed: true, description: 'يخصم ١٠٠ من خصمك ويعطيك ٢٠٠، ومسلّح: يجمّد دور الخصم' },
  { id: 'h5', name: 'القنبلة النووية', difficulty: 'Hard', power: SpecialPower.H5_NUKE, points: 500, isArmed: true, description: 'الإجابة الصحيحة تعطي ٥٠٠ لفريقك، الخطأ يخصم ٢٠٠ منك' },

  // --- MEDIUM HARD (7 Cards) ---
  { id: 'mh-s1', name: 'العقوبة الخفيفة', difficulty: 'MediumHard', power: SpecialPower.MH_S1_PENALTY, points: 150, description: 'يخصم ١٠٠ نقطة من خصم تختاره' },
  { id: 'mh-s2', name: 'التحويل الذكي', difficulty: 'MediumHard', power: SpecialPower.MH_S2_PASS, points: 150, description: 'يسمح بتحويل السؤال لصديقك المقابل، وعند الإجابة الصحيحة تتقاسمون النقاط' },
  { id: 'mh-s3', name: 'التحويل الاستراتيجي', difficulty: 'MediumHard', power: SpecialPower.MH_S3_STRATEGIC_PASS, points: 150, description: 'تحويل للصديق مع سرقة مكافأة إضافية إن لعب الخصم كرته في نفس الجولة' },
  { id: 'mh-4', name: 'بطاقة متوسطة-صعبة', difficulty: 'MediumHard', power: SpecialPower.NONE, points: 150, description: 'سؤال متوسط-صعب' },
  { id: 'mh-5', name: 'بطاقة متوسطة-صعبة', difficulty: 'MediumHard', power: SpecialPower.NONE, points: 175, description: 'سؤال متوسط-صعب' },
  { id: 'mh-6', name: 'بطاقة متوسطة-صعبة', difficulty: 'MediumHard', power: SpecialPower.NONE, points: 200, description: 'سؤال متوسط-صعب' },
  { id: 'mh-7', name: 'بطاقة متوسطة-صعبة', difficulty: 'MediumHard', power: SpecialPower.NONE, points: 200, description: 'سؤال متوسط-صعب' },

  // --- MEDIUM (18 Cards) ---
  ...Array.from({ length: 18 }, (_, i) => ({
    id: `m-${i}`,
    name: 'بطاقة متوسطة',
    difficulty: 'Medium' as CardDifficulty,
    power: SpecialPower.NONE,
    points: 100,
    description: 'سؤال متوسط بـ ١٠٠ نقطة'
  })),

  // --- EASY (30 Cards) ---
  ...Array.from({ length: 30 }, (_, i) => ({
    id: `e-${i}`,
    name: 'بطاقة سهلة',
    difficulty: 'Easy' as CardDifficulty,
    power: SpecialPower.NONE,
    points: 50,
    description: 'سؤال سهل بـ ٥٠ نقطة'
  }))
];
