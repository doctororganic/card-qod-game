
export type QuestionCategory = 'كمي' | 'لفظي';
export type QuestionDifficulty = 'سهل' | 'متوسط' | 'متوسط-صعب' | 'صعب جداً';

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  category: QuestionCategory;
  difficulty: QuestionDifficulty;
  type: string; // e.g., 'تناظر لفظي', 'حساب', etc.
}

export const QUESTIONS: Question[] = [
  // --- Easy Questions (30+) ---
  {
    id: 'e1',
    text: 'قلم : كتابة = مشرط : ___',
    options: ['طبيب', 'جراحة', 'مستشفى', 'علاج'],
    correctIndex: 1,
    category: 'لفظي',
    difficulty: 'سهل',
    type: 'تناظر لفظي'
  },
  {
    id: 'e2',
    text: 'أي هذه الكلمات لا تنتمي للمجموعة؟',
    options: ['سواد', 'بياض', 'حمرة', 'ضوء'],
    correctIndex: 3,
    category: 'لفظي',
    difficulty: 'سهل',
    type: 'المفردة الشاذة'
  },
  {
    id: 'e3',
    text: 'إذا كان ٣س + ٧ = ٢٢، فما قيمة س؟',
    options: ['٣', '٤', '٥', '٦'],
    correctIndex: 2,
    category: 'كمي',
    difficulty: 'سهل',
    type: 'جبر'
  },
  {
    id: 'e4',
    text: 'مثلث قائم الزاوية، ضلعاه ٦ و٨ سم، ما طول الوتر؟',
    options: ['٩', '١٠', '١١', '١٢'],
    correctIndex: 1,
    category: 'كمي',
    difficulty: 'سهل',
    type: 'هندسة'
  },
  {
    id: 'e5',
    text: 'أكمل الجملة: "الجهل بالأشياء يجعل الإنسان _______ عند اتخاذ القرارات"',
    options: ['متسرعاً', 'حكيماً', 'متأنياً', 'بصيراً'],
    correctIndex: 0,
    category: 'لفظي',
    difficulty: 'سهل',
    type: 'إكمال جمل'
  },
  {
    id: 'e6',
    text: 'اشترى محمد ٥ أقلام بـ ٢٠ ريالاً، فكم ثمن ٣ أقلام؟',
    options: ['١٠ ريالات', '١٢ ريالاً', '١٥ ريالاً', '١٨ ريالاً'],
    correctIndex: 1,
    category: 'كمي',
    difficulty: 'سهل',
    type: 'حساب'
  },
  {
    id: 'e7',
    text: 'غابة : أشجار = بحر : ___',
    options: ['ملح', 'سفن', 'أسماك', 'أمواج'],
    correctIndex: 2,
    category: 'لفظي',
    difficulty: 'سهل',
    type: 'تناظر لفظي'
  },
  {
    id: 'e8',
    text: 'ما هو العدد الذي إذا ضرب في ٤ ثم أضيف إليه ٧ كان الناتج ٣١؟',
    options: ['٤', '٥', '٦', '٧'],
    correctIndex: 2,
    category: 'كمي',
    difficulty: 'سهل',
    type: 'حساب'
  },
  {
    id: 'e9',
    text: 'كلمة : جملة = حرف : ___',
    options: ['سطر', 'كلمة', 'فقرة', 'كتاب'],
    correctIndex: 1,
    category: 'لفظي',
    difficulty: 'سهل',
    type: 'تناظر لفظي'
  },
  {
    id: 'e10',
    text: 'أي الأعداد التالية أولي؟',
    options: ['٩', '١٥', '١٧', '٢١'],
    correctIndex: 2,
    category: 'كمي',
    difficulty: 'سهل',
    type: 'حساب'
  },
  {
      id: 'e11',
      text: 'الخطأ السياقي: "من زاد حبه لنفسه زاد كره الناس له، فالطاووس يفتخر بجماله ويخفي قدميه القبيحة."',
      options: ['زاد', 'كره', 'يفتخر', 'يخفي'],
      correctIndex: 3,
      category: 'لفظي',
      difficulty: 'سهل',
      type: 'خطأ سياقي'
  },
  {
      id: 'e12',
      text: 'مساحة مربع محيطه ٢٠ سم تساوي:',
      options: ['١٠ سم٢', '١٥ سم٢', '٢٠ سم٢', '٢٥ سم٢'],
      correctIndex: 3,
      category: 'كمي',
      difficulty: 'سهل',
      type: 'هندسة'
  },
  {
      id: 'e13',
      text: 'أسد : زئير = حمامة : ___',
      options: ['هديل', 'صياح', 'تغريد', 'نقيق'],
      correctIndex: 0,
      category: 'لفظي',
      difficulty: 'سهل',
      type: 'تناظر لفظي'
  },
  {
      id: 'e14',
      text: 'متتابعة: ٢، ٤، ٨، ١٦، ___',
      options: ['١٨', '٢٠', '٢٤', '٣٢'],
      correctIndex: 3,
      category: 'كمي',
      difficulty: 'سهل',
      type: 'حساب'
  },
  {
      id: 'e15',
      text: 'المفردة الشاذة: أي كلمة مختلفة؟',
      options: ['فول', 'عدس', 'قمح', 'حمص'],
      correctIndex: 2,
      category: 'لفظي',
      difficulty: 'سهل',
      type: 'المفردة الشاذة'
  },
  {
      id: 'e16',
      text: 'شمس : نهار = قمر : ___',
      options: ['نور', 'ليل', 'نجم', 'كوكب'],
      correctIndex: 1,
      category: 'لفظي',
      difficulty: 'سهل',
      type: 'تناظر لفظي'
  },
  {
      id: 'e17',
      text: 'إذا كان ثمن ٤ كرات يساوي ٢٠ ريالاً، فكم ثمن ٧ كرات؟',
      options: ['٣٠ ريالاً', '٣٥ ريالاً', '٤٠ ريالاً', '٤٥ ريالاً'],
      correctIndex: 1,
      category: 'كمي',
      difficulty: 'سهل',
      type: 'حساب'
  },
  {
      id: 'e18',
      text: 'أكمل الجملة: "صديقك من _______ لا من _______."',
      options: ['صدقك / صدّقك', 'أعطاك / منعك', 'أحبك / كرهك', 'نصحك / غشك'],
      correctIndex: 0,
      category: 'لفظي',
      difficulty: 'سهل',
      type: 'إكمال جمل'
  },
  {
      id: 'e19',
      text: 'ما هو منوال الأعداد: ٥، ٨، ٥، ٩، ٣، ٥؟',
      options: ['٣', '٥', '٨', '٩'],
      correctIndex: 1,
      category: 'كمي',
      difficulty: 'سهل',
      type: 'إحصاء'
  },
  {
      id: 'e20',
      text: 'المفردة الشاذة: أي فاكهة مختلفة؟',
      options: ['تفاح', 'خيار', 'موز', 'برتقال'],
      correctIndex: 1,
      category: 'لفظي',
      difficulty: 'سهل',
      type: 'المفردة الشاذة'
  },
  {
      id: 'e21',
      text: 'إذا كان طول ضلع مربع ٤ سم، فما هو محيطه؟',
      options: ['٨ سم', '١٢ سم', '١٦ سم', '٢٠ سم'],
      correctIndex: 2,
      category: 'كمي',
      difficulty: 'سهل',
      type: 'هندسة'
  },
  {
      id: 'e22',
      text: 'رئة : تنفس = عين : ___',
      options: ['رؤية', 'نور', 'وجه', 'دموع'],
      correctIndex: 0,
      category: 'لفظي',
      difficulty: 'سهل',
      type: 'تناظر لفظي'
  },
  {
      id: 'e23',
      text: 'ما قيمة ٢٠ + ٢٠ × ٠؟',
      options: ['٠', '٢٠', '٤٠', '٤٠٠'],
      correctIndex: 1,
      category: 'كمي',
      difficulty: 'سهل',
      type: 'حساب'
  },
  {
      id: 'e24',
      text: 'الخطأ السياقي: "المتفائل يرى ضوءاً لا يوجد، والمتشائم يرى ضوءاً في نهاية النفق."',
      options: ['المتفائل', 'ضوءاً', 'المتشائم', 'النفق'],
      correctIndex: 2,
      category: 'لفظي',
      difficulty: 'سهل',
      type: 'خطأ سياقي'
  },
  {
      id: 'e25',
      text: 'كم دقيقة في ٣ ساعات؟',
      options: ['٦٠', '١٢٠', '١٨٠', '٢٤٠'],
      correctIndex: 2,
      category: 'كمي',
      difficulty: 'سهل',
      type: 'حساب'
  },
  {
      id: 'e26',
      text: 'غزال : ريم = أسد : ___',
      options: ['نمر', 'فهد', 'قسورة', 'كلب'],
      correctIndex: 2,
      category: 'لفظي',
      difficulty: 'سهل',
      type: 'تناظر لفظي'
  },
  {
      id: 'e27',
      text: 'إذا كان س + ٥ = ١٢، فما قيمة ٢س؟',
      options: ['٧', '١٠', '١٤', '٢٤'],
      correctIndex: 2,
      category: 'كمي',
      difficulty: 'سهل',
      type: 'جبر'
  },
  {
      id: 'e28',
      text: 'إكمال الجمل: "الحياة مليئة بـ _______، فعلينا أن نتحلى بـ _______."',
      options: ['الصعاب / الصبر', 'الأفراح / الحذر', 'الفرص / السرعة', 'الناس / التجاهل'],
      correctIndex: 0,
      category: 'لفظي',
      difficulty: 'سهل',
      type: 'إكمال جمل'
  },
  {
      id: 'e29',
      text: 'ما هو نصف ربع العشرين؟',
      options: ['١.٥', '٢.٥', '٥', '١٠'],
      correctIndex: 1,
      category: 'كمي',
      difficulty: 'سهل',
      type: 'حساب'
  },
  {
      id: 'e30',
      text: 'أذن : سمع = لسان : ___',
      options: ['كلام', 'تذوق', 'فم', 'أكل'],
      correctIndex: 1,
      category: 'لفظي',
      difficulty: 'سهل',
      type: 'تناظر لفظي'
  },
  // --- Medium Questions (Continued) ---
  {
      id: 'm14',
      text: 'إذا كان سعر لتر البنزين ٢ ريال، فكم لتراً تشتري بـ ١٠٠ ريال؟',
      options: ['٢٥ لتر', '٤٠ لتر', '٥٠ لتر', '٧٥ لتر'],
      correctIndex: 2,
      category: 'كمي',
      difficulty: 'متوسط',
      type: 'حساب'
  },
  {
      id: 'm15',
      text: 'الخطأ السياقي: "الكلام كالدواء، إن أكثرت منه نفع، وإن أقللت منه نفع أيضاً."',
      options: ['الكلام', 'الدواء', 'نفع (الأولى)', 'أقللت'],
      correctIndex: 2,
      category: 'لفظي',
      difficulty: 'متوسط',
      type: 'خطأ سياقي'
  },
  {
      id: 'm16',
      text: 'إذا كان متوسط ٣ أرقام هو ١٥، فما هو مجموع هذه الأرقام؟',
      options: ['٣٠', '٤٥', '٦٠', '٩٠'],
      correctIndex: 1,
      category: 'كمي',
      difficulty: 'متوسط',
      type: 'إحصاء'
  },
  {
      id: 'm17',
      text: 'نحل : عسل = بقرة : ___',
      options: ['حليب', 'لحم', 'مزرعة', 'جلد'],
      correctIndex: 0,
      category: 'لفظي',
      difficulty: 'متوسط',
      type: 'تناظر لفظي'
  },
  {
      id: 'm18',
      text: 'دائرة قطرها ١٠ سم، فما هي مساحتها؟ (باعتبار ط = ٣.١٤)',
      options: ['٣١.٤ سم٢', '٦٢.٨ سم٢', '٧٨.٥ سم٢', '١٥٧ سم٢'],
      correctIndex: 2,
      category: 'كمي',
      difficulty: 'متوسط',
      type: 'هندسة'
  },
  {
      id: 'm19',
      text: 'إكمال الجمل: "من اعتاد على الأخذ، صعب عليه _______."',
      options: ['العطاء', 'الطلب', 'النوم', 'الركض'],
      correctIndex: 0,
      category: 'لفظي',
      difficulty: 'متوسط',
      type: 'إكمال جمل'
  },
  {
      id: 'm20',
      text: 'إذا كان س/٤ = ٥، فما قيمة س + ٤؟',
      options: ['٩', '١٦', '٢٠', '٢٤'],
      correctIndex: 3,
      category: 'كمي',
      difficulty: 'متوسط',
      type: 'جبر'
  },
  {
      id: 'm21',
      text: 'صحفي : جريدة = معلم : ___',
      options: ['قلم', 'مدرسة', 'طالب', 'سبورة'],
      correctIndex: 1,
      category: 'لفظي',
      difficulty: 'متوسط',
      type: 'تناظر لفظي'
  },
  {
      id: 'm22',
      text: 'اشترى فهد جهازاً بـ ٤٠٠٠ ريال وباعه بخسارة ١٠٪، فكم ثمن البيع؟',
      options: ['٣٤٠٠ ريال', '٣٦٠٠ ريال', '٣٨٠٠ ريال', '٣٩٠٠ ريال'],
      correctIndex: 1,
      category: 'كمي',
      difficulty: 'متوسط',
      type: 'حساب'
  },
  {
      id: 'm23',
      text: 'شتاء : برد = صيف : ___',
      options: ['شمس', 'مطر', 'حر', 'بحر'],
      correctIndex: 2,
      category: 'لفظي',
      difficulty: 'متوسط',
      type: 'تناظر لفظي'
  },
  {
      id: 'm24',
      text: 'أي الأعداد التالية يقبل القسمة على ٣؟',
      options: ['١٠', '١٤', '١٨', '٢٠'],
      correctIndex: 2,
      category: 'كمي',
      difficulty: 'متوسط',
      type: 'حساب'
  },
  {
      id: 'm25',
      text: 'الخطأ السياقي: "كن جواداً تغنم بمحبة الناس، فالبخل يرفع قدر الإنسان عند الآخرين."',
      options: ['جواداً', 'الناس', 'يرفع', 'الآخرين'],
      correctIndex: 2,
      category: 'لفظي',
      difficulty: 'متوسط',
      type: 'خطأ سياقي'
  },
  {
      id: 'm26',
      text: 'مثلث متساوي الأضلاع محيطه ١٨ سم، ما طول ضلعه؟',
      options: ['٤ سم', '٦ سم', '٨ سم', '٩ سم'],
      correctIndex: 1,
      category: 'كمي',
      difficulty: 'متوسط',
      type: 'هندسة'
  },
  {
      id: 'm27',
      text: 'إكمال جمل: "العدل أساس _______."',
      options: ['الحكم', 'الحياة', 'الجمال', 'السعادة'],
      correctIndex: 0,
      category: 'لفظي',
      difficulty: 'متوسط',
      type: 'إكمال جمل'
  },
  // --- Medium-Hard Questions (Continued) ---
  {
      id: 'mh8',
      text: 'إذا كان س^٢ = ٤٩ وَ ص^٢ = ٦٤، وس ص < ٠، فما قيمة (س - ص)^٢؟',
      options: ['١', '١٥', '١٤٤', '٢٢٥'],
      correctIndex: 3,
      category: 'كمي',
      difficulty: 'متوسط-صعب',
      type: 'جبر'
  },
  {
      id: 'mh9',
      text: 'غزال : ظبي = سيف : ___',
      options: ['درع', 'خنجر', 'مهند', 'رمح'],
      correctIndex: 2,
      category: 'لفظي',
      difficulty: 'متوسط-صعب',
      type: 'تناظر لفظي'
  },
  {
      id: 'mh10',
      text: 'صندوق يحتوي على ٣ كرات حمراء وَ ٤ كرات زرقاء. ما احتمال سحب كرة حمراء؟',
      options: ['٣/٤', '٤/٧', '٣/٧', '١/٢'],
      correctIndex: 2,
      category: 'كمي',
      difficulty: 'متوسط-صعب',
      type: 'إحصاء'
  },
  {
      id: 'mh11',
      text: 'إكمال الجمل: "الشخص الذي لا يقرأ ليس لديه _______ على الشخص الذي لا يستطيع _______."',
      options: ['فضل / القراءة', 'ميزة / التفكير', 'أفضلية / الكتابة', 'حق / التعلم'],
      correctIndex: 0,
      category: 'لفظي',
      difficulty: 'متوسط-صعب',
      type: 'إكمال جمل'
  },
  {
      id: 'mh12',
      text: 'ما هو العدد الذي إذا ضربناه في نفسه ثم أضفنا إليه مثله كان الناتج ٢٠؟',
      options: ['٢', '٣', '٤', '٥'],
      correctIndex: 2,
      category: 'كمي',
      difficulty: 'متوسط-صعب',
      type: 'جبر'
  },
  {
      id: 'mh13',
      text: 'الخطأ السياقي: "تكلم وسوف تندم، اصمت وسوف تعلم."',
      options: ['تكلم', 'تندم', 'اصمت', 'تعلم'],
      correctIndex: 1,
      category: 'لفظي',
      difficulty: 'متوسط-صعب',
      type: 'خطأ سياقي'
  },
  {
      id: 'mh14',
      text: 'محيط مستطيل يساوي ٤٨ سم، إذا كان طوله ضعفي عرضه، فما هو عرضه؟',
      options: ['٦ سم', '٨ سم', '١٠ سم', '١٢ سم'],
      correctIndex: 1,
      category: 'كمي',
      difficulty: 'متوسط-صعب',
      type: 'هندسة'
  },
  {
      id: 'mh15',
      text: 'حذاء : جلد = خاتم : ___',
      options: ['يد', 'إصبع', 'ذهب', 'جمال'],
      correctIndex: 2,
      category: 'لفظي',
      difficulty: 'متوسط-صعب',
      type: 'تناظر لفظي'
  },
  // --- Hard Questions (Continued) ---
  {
      id: 'h8',
      text: 'إذا كان س^٣ = -٨، فما قيمة س^٢ + س + ١؟',
      options: ['١', '٣', '٥', '٧'],
      correctIndex: 1,
      category: 'كمي',
      difficulty: 'صعب جداً',
      type: 'جبر'
  },
  {
      id: 'h9',
      text: 'إكمال الجمل: "قد ينسى المرء من _______ معه، لكنه لن ينسى من _______ معه."',
      options: ['ضحك / بكى', 'عمل / لعب', 'أكل / شرب', 'سافر / أقام'],
      correctIndex: 0,
      category: 'لفظي',
      difficulty: 'صعب جداً',
      type: 'إكمال جمل'
  },
  {
      id: 'h10',
      text: 'سيارة تقطع مسافة ٤٨٠ كم في ٤ ساعات، فإذا أرادت أن تقطع نفس المسافة في ٥ ساعات، كم يجب أن تنقص سرعتها؟',
      options: ['١٨ كم/س', '٢٠ كم/س', '٢٤ كم/س', '٣٠ كم/س'],
      correctIndex: 2,
      category: 'كمي',
      difficulty: 'صعب جداً',
      type: 'حساب'
  },
  {
      id: 'h11',
      text: 'الخطأ السياقي: "الحكمة هي أن تضع الشيء في مكانه الخطأ، والشجاعة هي الإقدام في موضع الحذر."',
      options: ['الحكمة', 'مكانه', 'الخطأ', 'الحذر'],
      correctIndex: 2,
      category: 'لفظي',
      difficulty: 'صعب جداً',
      type: 'خطأ سياقي'
  },
  {
      id: 'h12',
      text: 'مكعب حجمه ٦٤ سم٣، فما هي مساحة أحد أوجهه؟',
      options: ['٤ سم٢', '٨ سم٢', '١٢ سم٢', '١٦ سم٢'],
      correctIndex: 3,
      category: 'كمي',
      difficulty: 'صعب جداً',
      type: 'هندسة'
  },
  {
      id: 'h13',
      text: 'إذا كان أحمد ينهي عملاً في ٣ ساعات، وخالد ينهي نفس العمل في ٦ ساعات، فكم يحتاجان من وقت لإنهاء العمل معاً؟',
      options: ['ساعة واحدة', 'ساعتان', 'ساعتان ونصف', '٤ ساعات'],
      correctIndex: 1,
      category: 'كمي',
      difficulty: 'صعب جداً',
      type: 'حساب'
  },
  {
      id: 'h14',
      text: 'إكمال جمل: "من عاش بوجهين مات _______."',
      options: ['سعيداً', 'كريماً', 'لا وجه له', 'وحيداً'],
      correctIndex: 2,
      category: 'لفظي',
      difficulty: 'صعب جداً',
      type: 'إكمال جمل'
  },
  {
      id: 'h15',
      text: 'أي الأعداد التالية هو الأكبر؟ (سؤال المليون)',
      options: ['٢^٦٠', '٣^٤٠', '٤^٣٠', '٨^٢٠'],
      correctIndex: 1,
      category: 'كمي',
      difficulty: 'صعب جداً',
      type: 'مقارنات'
  },
  {
      id: 'h16',
      text: 'أسطوانة ممتلئة حتى ربعها، إذا أضفنا ٧٠ لتر أصبحت ممتلئة لثلاثة أرباعها، كم سعة الأسطوانة؟',
      options: ['١٠٠ لتر', '١٢٠ لتر', '١٤٠ لتر', '١٨٠ لتر'],
      correctIndex: 2,
      category: 'كمي',
      difficulty: 'صعب جداً',
      type: 'حساب'
  },
  {
      id: 'h17',
      text: 'إكمال الجمل: "إن المتكبر كواقف على _______، يرى الناس _______ ويراونه _______."',
      options: ['جبل / صغاراً / صغيراً', 'تل / بعيداً / بعيداً', 'طريق / مسرعين / بطيئاً', 'بحر / غارقين / ناجياً'],
      correctIndex: 0,
      category: 'لفظي',
      difficulty: 'صعب جداً',
      type: 'إكمال جمل'
  },
  {
      id: 'm28',
      text: 'إذا كان مجموع عُمُر أب وابنه ٤٥ سنة، وعُمُر الأب ٤ أضعاف عُمُر الابن، فكم عُمُر الابن؟',
      options: ['٧ سنوات', '٨ سنوات', '٩ سنوات', '١٠ سنوات'],
      correctIndex: 2,
      category: 'كمي',
      difficulty: 'متوسط',
      type: 'جبر'
  },
  {
      id: 'm29',
      text: 'المفردة الشاذة: أي كلمة مختلفة؟',
      options: ['السبت', 'الأحد', 'رمضان', 'الثلاثاء'],
      correctIndex: 2,
      category: 'لفظي',
      difficulty: 'متوسط',
      type: 'المفردة الشاذة'
  },
  {
      id: 'e31',
      text: 'الرياض : السعودية = القاهرة : ___',
      options: ['السودان', 'الأردن', 'مصر', 'ليبيا'],
      correctIndex: 2,
      category: 'لفظي',
      difficulty: 'سهل',
      type: 'تناظر لفظي'
  },
  {
      id: 'e32',
      text: 'ما هو باقي قسمة ١٧ على ٥؟',
      options: ['١', '٢', '٣', '٤'],
      correctIndex: 1,
      category: 'كمي',
      difficulty: 'سهل',
      type: 'حساب'
  },
  {
      id: 'e33',
      text: 'إكمال الجمل: "الكتاب _______ خير جليس في الزمان."',
      options: ['الجميل', 'المفيد', 'الكبير', 'القديم'],
      correctIndex: 1,
      category: 'لفظي',
      difficulty: 'سهل',
      type: 'إكمال جمل'
  },
  {
      id: 'mh16',
      text: 'ما هو العدد الذي إذا ضُرب في ٧ كان الناتج مساوياً لنصف الـ ٩٨؟',
      options: ['٥', '٦', '٧', '٨'],
      correctIndex: 2,
      category: 'كمي',
      difficulty: 'متوسط-صعب',
      type: 'حساب'
  },
  {
      id: 'mh17',
      text: 'نور : ضياء = ظلام : ___',
      options: ['ليل', 'عتمة', 'نجم', 'سواد'],
      correctIndex: 1,
      category: 'لفظي',
      difficulty: 'متوسط-صعب',
      type: 'تناظر لفظي'
  },
  {
      id: 'h18',
      text: 'إذا كانت مساحة دائرة هي ط نق^٢، فما هي مساحة ربع دائرة قطرها ٢٠ سم؟',
      options: ['١٠ط', '٢٠ط', '٢٥ط', '٥٠ط'],
      correctIndex: 2,
      category: 'كمي',
      difficulty: 'صعب جداً',
      type: 'هندسة'
  },
  // --- Medium Questions (18+) ---
  {
    id: 'm1',
    text: 'إذا كانت نسبة الطلاب الناجحين ٧٥٪ وعدد الطلاب ٢٨٠، كم عدد الناجحين؟',
    options: ['١٩٠', '٢١٠', '٢٢٠', '٢٤٠'],
    correctIndex: 1,
    category: 'كمي',
    difficulty: 'متوسط',
    type: 'حساب'
  },
  {
    id: 'm2',
    text: 'أكمل الجملة: "إن _______ الصادقة لا تحتاج إلى كلمات _______."',
    options: ['الابتسامة / مصطنعة', 'الدموع / حزينة', 'المشاعر / عميقة', 'النوايا / مخفية'],
    correctIndex: 0,
    category: 'لفظي',
    difficulty: 'متوسط',
    type: 'إكمال جمل'
  },
  {
    id: 'm3',
    text: 'خزان سعته ٦٠٠ لتر، ممتلئ إلى الخمس، فكم لتراً يحتاج ليمتلئ؟',
    options: ['١٢٠', '٤٠٠', '٤٨٠', '٥٠٠'],
    correctIndex: 2,
    category: 'كمي',
    difficulty: 'متوسط',
    type: 'حساب'
  },
  {
    id: 'm4',
    text: 'نوم : ليل = صوم : ___',
    options: ['إفطار', 'رمضان', 'سحور', 'جوع'],
    correctIndex: 1,
    category: 'لفظي',
    difficulty: 'متوسط',
    type: 'تناظر لفظي'
  },
  {
    id: 'm5',
    text: 'ما قيمة ١٠٪ من مبلغ ٥٠٠ ريال؟',
    options: ['٥ ريالات', '١٠ ريالات', '٥٠ ريالاً', '١٠٠ ريال'],
    correctIndex: 2,
    category: 'كمي',
    difficulty: 'متوسط',
    type: 'حساب'
  },
  {
    id: 'm6',
    text: 'الخطأ السياقي: "إن ممارسة الرياضة في الصباح تجعل الإنسان يشعر بالخمول طوال اليوم."',
    options: ['الرياضة', 'الصباح', 'الخمول', 'اليوم'],
    correctIndex: 2,
    category: 'لفظي',
    difficulty: 'متوسط',
    type: 'خطأ سياقي'
  },
  {
    id: 'm7',
    text: 'إذا كان عُمُر خالد الآن ٣ أضعاف عُمُر ابنه، وبعد ١٠ سنوات سيصبح عُمُره ضعفي عُمُر ابنه، فكم عُمُر خالد الآن؟',
    options: ['٢٠', '٢٥', '٣٠', '٣٥'],
    correctIndex: 2,
    category: 'كمي',
    difficulty: 'متوسط',
    type: 'جبر'
  },
  {
    id: 'm8',
    text: 'المفردة الشاذة: أي مدينة مختلفة؟',
    options: ['جدة', 'الدمام', 'الخبر', 'الرياض'],
    correctIndex: 3,
    category: 'لفظي',
    difficulty: 'متوسط',
    type: 'المفردة الشاذة'
  },
  {
    id: 'm9',
    text: 'سلك طوله ٤٠ سم مًثِّل على شكل مستطيل عرضه ٨ سم، فما هو طول المستطيل؟',
    options: ['١٠ سم', '١٢ سم', '١٤ سم', '١٦ سم'],
    correctIndex: 1,
    category: 'كمي',
    difficulty: 'متوسط',
    type: 'هندسة'
  },
  {
    id: 'm10',
    text: 'تنافس : فوز = دراسة : ___',
    options: ['اختبار', 'نجاح', 'مدرسة', 'تخرج'],
    correctIndex: 1,
    category: 'لفظي',
    difficulty: 'متوسط',
    type: 'تناظر لفظي'
  },
  {
      id: 'm11',
      text: 'قارن بين القيمة الأولى: (١/٢ + ١/٤) والقيمة الثانية: (٣/٤)',
      options: ['الأولى أكبر', 'الثانية أكبر', 'القيمتان متساويتان', 'المعطيات غير كافية'],
      correctIndex: 2,
      category: 'كمي',
      difficulty: 'متوسط',
      type: 'مقارنات'
  },
  {
      id: 'm12',
      text: 'أكمل الجملة: "العادات _______ كالحصن المنيع، تحمي صاحبها من _______ الزمان."',
      options: ['السيئة / تقلبات', 'الحسنة / غدر', 'القديمة / نسيان', 'الراسخة / هجمات'],
      correctIndex: 1,
      category: 'لفظي',
      difficulty: 'متوسط',
      type: 'إكمال جمل'
  },
  {
      id: 'm13',
      text: 'إذا تم توزيع ٤٤١ قلم على ١٠٥ طالب بالتساوي، فكم قلماً يتبقى؟',
      options: ['١', '١٠', '٢١', '٣٥'],
      correctIndex: 2,
      category: 'كمي',
      difficulty: 'متوسط',
      type: 'حساب'
  },
  // --- Medium-Hard Questions (10+) ---
  {
    id: 'mh1',
    text: 'إذا اشترى أحمد ٣ سيارات بسعر السيارة الواحدة ٥٠٠ ألف ريال، ثم باعها بربح ٢٠٪، فكم باع السيارة الواحدة؟',
    options: ['٥٥٠ ألف', '٦٠٠ ألف', '٦٥٠ ألف', '٧٠٠ ألف'],
    correctIndex: 1,
    category: 'كمي',
    difficulty: 'متوسط-صعب',
    type: 'حساب'
  },
  {
    id: 'mh2',
    text: 'الخطأ السياقي: "من التناقض أن يطالب الإنسان بالحرية، وهو يرفض الالتزام بالقانون الذي يحمي هذه الحرية لغيره."',
    options: ['التناقض', 'الحرية', 'القانون', 'لغيره'],
    correctIndex: 3,
    category: 'لفظي',
    difficulty: 'متوسط-صعب',
    type: 'خطأ سياقي'
  },
  {
    id: 'mh3',
    text: 'مكعب مساحته السطحية ١٥٠ سم٢، فما هو طول ضلعه؟',
    options: ['٤ سم', '٥ سم', '٦ سم', '٧ سم'],
    correctIndex: 1,
    category: 'كمي',
    difficulty: 'متوسط-صعب',
    type: 'هندسة'
  },
  {
    id: 'mh4',
    text: 'تناظر: زلزال : دمار = نيران : ___',
    options: ['حطب', 'دخان', 'رماد', 'حرارة'],
    correctIndex: 2,
    category: 'لفظي',
    difficulty: 'متوسط-صعب',
    type: 'تناظر لفظي'
  },
  {
    id: 'mh5',
    text: 'متوسط ٥ أرقام هو ٢٠، إذا أضفنا رقم سادس أصبح المتوسط ٢٢، ما هو الرقم السادس؟',
    options: ['٢٤', '٢٨', '٣٢', '٣٦'],
    correctIndex: 2,
    category: 'كمي',
    difficulty: 'متوسط-صعب',
    type: 'إحصاء'
  },
  {
      id: 'mh6',
      text: 'أكمل الجملة: "أن تضيء شمعة _______ خير من أن _______ الظلام."',
      options: ['واحدة / تسب', 'جميلة / ترى', 'منيرة / تطرد', 'صغيرة / تذم'],
      correctIndex: 3,
      category: 'لفظي',
      difficulty: 'متوسط-صعب',
      type: 'إكمال جمل'
  },
  {
      id: 'mh7',
      text: 'ما هي خانة الآحاد للعدد ٣ أس ٢٠؟',
      options: ['١', '٣', '٧', '٩'],
      correctIndex: 0,
      category: 'كمي',
      difficulty: 'متوسط-صعب',
      type: 'حساب'
  },
  // --- Hard Questions (10+) ---
  {
    id: 'h1',
    text: 'الخطأ السياقي: "المباني الجميلة التي نراها في المدن الكبرى، ما هي إلا تجسيد لخيالات المهندسين الذين لم يترجموا أحلامهم إلى واقع ملموس."',
    options: ['المدينة', 'تجسيد', 'المهندسين', 'لم يترجموا'],
    correctIndex: 3,
    category: 'لفظي',
    difficulty: 'صعب جداً',
    type: 'خطأ سياقي'
  },
  {
    id: 'h2',
    text: 'إذا كان س = ١ + ١/س، فأوجد قيمة س تربيـع؟',
    options: ['س + ١', 'س - ١', '٢س', '١/س'],
    correctIndex: 0,
    category: 'كمي',
    difficulty: 'صعب جداً',
    type: 'جبر'
  },
  {
    id: 'h3',
    text: 'ما هو العدد الذي يمثل ٨٪ من ١٥٠٪ من ١٢٠٠؟',
    options: ['١٠٨', '١٢٠', '١٤٤', '١٥٠'],
    correctIndex: 2,
    category: 'كمي',
    difficulty: 'صعب جداً',
    type: 'حساب'
  },
  {
    id: 'h4',
    text: 'أكمل الجملة: "المرء إن كان عاقلاً، لم يفتخر بجماله كما لا يفتخر _______ بجمال ريشه، وإنما يفتخر بما _______ من صفات."',
    options: ['الطاووس / يحمل', 'النسر / يملك', 'الغراب / تعلم', 'الصقر / اكتسب'],
    correctIndex: 0,
    category: 'لفظي',
    difficulty: 'صعب جداً',
    type: 'إكمال جمل'
  },
  {
    id: 'h5',
    text: 'إذا كان متوسط إنتاج مصنع في ٥ أيام هو ١٥٠ وحدة، فإذا زاد الإنتاج بنسبة ١٠٪ في اليوم السادس، فما هو المتوسط الجديد للأيام الستة؟',
    options: ['١٥١', '١٥٢.٥', '١٥٣.٥', '١٥٥'],
    correctIndex: 1,
    category: 'كمي',
    difficulty: 'صعب جداً',
    type: 'إحصاء'
  },
  {
    id: 'h6',
    text: 'أي الكلمات التالية هي المفردة الشاذة؟',
    options: ['أسامة', 'ليث', 'ضرغام', 'فهد'],
    correctIndex: 3,
    category: 'لفظي',
    difficulty: 'صعب جداً',
    type: 'المفردة الشاذة'
  },
  {
      id: 'h7',
      text: 'في الدائرة، إذا كانت الزاوية المركزية المقابلة لقوس طوله ٤ سم تساوي ٩٠ درجة، فما هو محيط الدائرة؟',
      options: ['٨ سم', '١٢ سم', '١٦ سم', '٢٠ سم'],
      correctIndex: 2,
      category: 'كمي',
      difficulty: 'صعب جداً',
      type: 'هندسة'
  }
];
