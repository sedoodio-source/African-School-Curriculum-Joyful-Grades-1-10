export interface WaecJambSubject {
  id: string;
  name: string;
  shortCode: string;
  icon: string;
  color: string;
  category: 'General' | 'Sciences' | 'Arts & Humanities' | 'Commercial';
  jambQuestionCount: number;
  waecDuration: string;
  jambDuration: string;
  description: string;
  syllabusHighlights: string[];
}

export interface ExamQuestion {
  id: string;
  examType: 'WAEC' | 'JAMB' | 'BOTH';
  subjectId: string;
  subjectName: string;
  year: number;
  questionNumber: number;
  paperType: 'Paper 1 (Objective)' | 'Paper 2 (Theory/Essay)';
  topic: string;
  question: string;
  passage?: string; // For English comprehension
  options?: string[]; // Multiple choice options
  correctAnswer: string;
  explanation: string;
  markingGuide?: string[]; // Step-by-step marks award (e.g. "M1 for formula, A1 for answer")
  difficulty: 'Standard' | 'Challenging' | 'Advanced';
}

export interface JambCourseTrack {
  id: string;
  faculty: string;
  name: string;
  targetCutoff: number;
  subjects: string[];
  topUniversities: string[];
  careerProspects: string;
}

export const WAEC_JAMB_SUBJECTS: WaecJambSubject[] = [
  {
    id: 'english',
    name: 'English Language / Use of English',
    shortCode: 'ENG',
    icon: 'menu_book',
    color: 'from-blue-600 to-indigo-700',
    category: 'General',
    jambQuestionCount: 60,
    waecDuration: '2 hrs 30 mins',
    jambDuration: '40 mins',
    description: 'Compulsory for ALL candidates in both WAEC and JAMB. Covers Lexis & Structure, Comprehension passages, Synonyms & Antonyms, and Oral Phonetics (vowel/consonant sounds).',
    syllabusHighlights: [
      'Reading Comprehension & Summary Writing',
      'Lexis and Structure (Idioms, Prepositions, Phrasal Verbs)',
      'Antonyms & Synonyms in context',
      'Oral English: Vowel sounds, Consonants, Rhymes, Stress & Intonation'
    ]
  },
  {
    id: 'mathematics',
    name: 'General Mathematics',
    shortCode: 'MTH',
    icon: 'calculate',
    color: 'from-emerald-600 to-teal-700',
    category: 'General',
    jambQuestionCount: 40,
    waecDuration: '2 hrs 30 mins (Paper 1 & 2)',
    jambDuration: '40 mins',
    description: 'Core requirement across all faculties. Tests Algebraic manipulation, Quadratic equations, Geometry, Trigonometry, Statistics & Probability, and Nigerian Commercial Arithmetic (₦).',
    syllabusHighlights: [
      'Number Bases, Modular Arithmetic, Indices & Logarithms',
      'Quadratic & Simultaneous Linear Equations',
      'Euclidean Geometry, Circle Theorems & Trigonometry',
      'Statistics, Probability, and Commercial Mathematics (Naira ₦)'
    ]
  },
  {
    id: 'biology',
    name: 'Biology',
    shortCode: 'BIO',
    icon: 'psychology',
    color: 'from-green-600 to-emerald-800',
    category: 'Sciences',
    jambQuestionCount: 40,
    waecDuration: '2 hrs (Obj & Theory)',
    jambDuration: '30 mins',
    description: 'Essential for Medicine, Pharmacy, Nursing, Agriculture, and Natural Sciences. Focuses on Cell Physiology, Genetics, Ecology, and Human Anatomy.',
    syllabusHighlights: [
      'Cell Structure, Tissues, and Nutrition in Organisms',
      'Mendelian Genetics, DNA & Evolution',
      'Ecology, Energy Flow, and Biomes in Nigeria/West Africa',
      'Transport, Circulatory, and Excretory Systems in Mammals'
    ]
  },
  {
    id: 'physics',
    name: 'Physics',
    shortCode: 'PHY',
    icon: 'bolt',
    color: 'from-amber-600 to-orange-700',
    category: 'Sciences',
    jambQuestionCount: 40,
    waecDuration: '2 hrs 45 mins',
    jambDuration: '35 mins',
    description: 'Mandatory for Engineering, Computer Science, Architecture, and Physical Sciences. Tests Mechanics, Waves, Electricity, Magnetism, and Modern Quantum Physics.',
    syllabusHighlights: [
      'Motion, Projectiles, Newton\'s Laws & Equilibrium',
      'Work, Energy, Power & Machines',
      'Waves, Sound, Optics & Lenses',
      'Current Electricity, Magnetic Fields & Radioactivity'
    ]
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    shortCode: 'CHM',
    icon: 'science',
    color: 'from-purple-600 to-indigo-800',
    category: 'Sciences',
    jambQuestionCount: 40,
    waecDuration: '2 hrs 30 mins',
    jambDuration: '35 mins',
    description: 'Key subject for Health and Engineering fields. Covers Atomic Structure, Chemical Bonding, Stoichiometry, Organic Chemistry, and Electrolysis.',
    syllabusHighlights: [
      'Particulate Nature of Matter, Atomic Structure & Periodic Table',
      'Stoichiometry, Mole Concept & Volumetric Analysis',
      'Acids, Bases, Salts, pH & Redox Reactions',
      'Hydrocarbons, Functional Groups & Industrial Chemistry'
    ]
  },
  {
    id: 'literature',
    name: 'Literature-in-English',
    shortCode: 'LIT',
    icon: 'auto_stories',
    color: 'from-rose-600 to-pink-700',
    category: 'Arts & Humanities',
    jambQuestionCount: 40,
    waecDuration: '2 hrs 15 mins',
    jambDuration: '30 mins',
    description: 'Crucial for Law, Mass Communication, Theatre Arts, and English. Tests African & Non-African Prose, Drama, Shakespearean plays, and Poetry.',
    syllabusHighlights: [
      'Literary Principles, Figures of Speech & Literary Appreciation',
      'Prescribed African Prose & Drama texts (Wole Soyinka, Chinua Achebe)',
      'Prescribed Non-African Drama (Shakespeare & Contemporary)',
      'Selected African and Commonwealth Poems'
    ]
  },
  {
    id: 'crs',
    name: 'Christian Religious Studies (CRS)',
    shortCode: 'CRS',
    icon: 'church',
    color: 'from-yellow-600 to-amber-700',
    category: 'Arts & Humanities',
    jambQuestionCount: 40,
    waecDuration: '2 hrs 30 mins',
    jambDuration: '30 mins',
    description: 'Deep exploration of biblical narratives, God’s covenants with Israel, the teachings of Christ, Apostolic missions in Acts, and Christian ethics in modern society.',
    syllabusHighlights: [
      'Creation, Sovereignty of God, and the Covenants (Abraham & Moses)',
      'Leadership in Israel (Joseph, Joshua, Deborah, David, Solomon)',
      'The Gospels: Sermon on the Mount, Miracles & Parables of Jesus',
      'Apostolic Ministry in Acts of the Apostles & Pauline Epistles'
    ]
  },
  {
    id: 'economics',
    name: 'Economics',
    shortCode: 'ECO',
    icon: 'trending_up',
    color: 'from-cyan-600 to-blue-800',
    category: 'Commercial',
    jambQuestionCount: 40,
    waecDuration: '2 hrs 40 mins',
    jambDuration: '35 mins',
    description: 'Required for Accounting, Banking, Business Administration, and Economics. Tests Microeconomics, Macroeconomics, Public Finance, and West African Economic Development.',
    syllabusHighlights: [
      'Price Theory, Elasticity of Demand & Supply',
      'Production, Cost Curves & Market Structures',
      'National Income Accounting, Inflation & Fiscal Policy',
      'Money, Banking, Central Bank of Nigeria (CBN) & International Trade'
    ]
  },
  {
    id: 'government',
    name: 'Government & Civic Education',
    shortCode: 'GOV',
    icon: 'account_balance',
    color: 'from-slate-700 to-slate-900',
    category: 'Arts & Humanities',
    jambQuestionCount: 40,
    waecDuration: '2 hrs 30 mins',
    jambDuration: '30 mins',
    description: 'Crucial for Law, Political Science, International Relations, and Public Administration. Focuses on Nigerian Political Systems, Constitution, and Democratic institutions.',
    syllabusHighlights: [
      'Basic Concepts in Political Science (Sovereignty, Rule of Law)',
      'Structures of Government: Legislature, Executive & Judiciary',
      'Pre-Colonial Administration in Nigeria (Hausa/Fulani, Yoruba, Igbo)',
      'Constitutional Development in Nigeria (1922 to 1999 Constitution)'
    ]
  }
];

export const JAMB_COURSE_TRACKS: JambCourseTrack[] = [
  {
    id: 'medicine-health',
    faculty: 'College of Medicine & Health Sciences',
    name: 'Medicine & Surgery (MBBS) / Pharmacy / Nursing',
    targetCutoff: 285,
    subjects: ['English Language / Use of English', 'Biology', 'Chemistry', 'Physics'],
    topUniversities: ['University of Ibadan (UI)', 'University of Lagos (UNILAG)', 'Obafemi Awolowo University (OAU)', 'University of Nigeria, Nsukka (UNN)', 'Ahmadu Bello University (ABU Zaria)'],
    careerProspects: 'Medical Doctor, Surgeon, Clinical Pharmacist, Research Immunologist, Healthcare Administrator.'
  },
  {
    id: 'engineering-tech',
    faculty: 'Faculty of Engineering & Technology',
    name: 'Software Engineering / Computer Science / Mechanical / Electrical',
    targetCutoff: 275,
    subjects: ['English Language / Use of English', 'General Mathematics', 'Physics', 'Chemistry'],
    topUniversities: ['UNILAG', 'FUTA Akure', 'Covenant University', 'University of Ilorin (UNILORIN)', 'ABU Zaria'],
    careerProspects: 'AI & Software Engineer, Robotics Specialist, Power Systems Engineer, Infrastructure Architect.'
  },
  {
    id: 'law-humanities',
    faculty: 'Faculty of Law & Jurisprudence',
    name: 'Law (LL.B) / International Relations / Mass Communication',
    targetCutoff: 270,
    subjects: ['English Language / Use of English', 'Literature-in-English', 'Christian Religious Studies (CRS)', 'Government & Civic Education'],
    topUniversities: ['University of Ibadan', 'UNILAG', 'University of Nigeria Nsukka', 'OAU Ile-Ife', 'University of Benin'],
    careerProspects: 'Advocate, Corporate Solicitor, International Diplomat, Human Rights Counsel, Media Executive.'
  },
  {
    id: 'commercial-business',
    faculty: 'Faculty of Administration & Management',
    name: 'Accounting / Economics / Finance & Banking',
    targetCutoff: 255,
    subjects: ['English Language / Use of English', 'General Mathematics', 'Economics', 'Government & Civic Education'],
    topUniversities: ['UNILAG', 'UI Ibadan', 'Covenant University', 'UNN', 'Babcock University'],
    careerProspects: 'Chartered Accountant (ICAN/ACCA), Investment Banker, Chief Financial Officer, Economic Policy Analyst.'
  }
];

export const WAEC_CHIEF_EXAMINER_TIPS = [
  {
    subject: 'General Mathematics',
    tip: 'Show every step clearly! In WAEC Paper 2 Theory, method marks (M1, M2) are awarded even if the final calculation has an arithmetic slip. Always state the formula first and specify units (e.g., ₦, cm², kg).',
    badge: 'Formula First'
  },
  {
    subject: 'English Language',
    tip: 'In Essay Writing, never use informal chat contractions (like "u", "wanna", "gonna", or "don\'t" in formal letters). In Summary questions, write your answers in single, grammatically complete sentences. Lifting verbatim lines from the passage will attract a penalty for lifting!',
    badge: 'No Verbatim Lifting'
  },
  {
    subject: 'Biology',
    tip: 'Drawings in Paper 2 must be made with a sharp HB pencil. Every biological drawing must carry a clear title at the top, magnification (e.g., ×2), and continuous, uncrossed label lines touching the exact structure with no arrowheads!',
    badge: 'Sharp Pencil Diagrams'
  },
  {
    subject: 'Christian Religious Studies',
    tip: 'State the exact biblical narrative accurately before explaining moral lessons for contemporary Christians. For questions on the Sermon on the Mount, cite Jesus’s teachings on love of enemies and secret prayer clearly.',
    badge: 'Biblical Grounding'
  },
  {
    subject: 'JAMB CBT 8-Key Navigation',
    tip: 'Master the 8-key system on the keyboard without touching the mouse: A, B, C, D to pick options; N for Next; P for Previous; S to Submit; R to Return. This saves you up to 15 minutes of precious exam time!',
    badge: 'Speed Strategy'
  }
];

export const AUTHENTIC_EXAM_QUESTIONS: ExamQuestion[] = [
  // MATHEMATICS
  {
    id: 'mth-2024-q1',
    examType: 'JAMB',
    subjectId: 'mathematics',
    subjectName: 'General Mathematics',
    year: 2024,
    questionNumber: 1,
    paperType: 'Paper 1 (Objective)',
    topic: 'Commercial Arithmetic & Currency',
    question: 'A trader in Alaba International Market bought 50 solar calculators at ₦4,500 each. If she sold 35 of them at ₦5,200 each and the remaining 15 at ₦4,000 each, calculate her overall percentage profit or loss to 1 decimal place.',
    options: [
      '7.6% profit',
      '8.4% profit',
      '6.2% loss',
      '9.1% profit'
    ],
    correctAnswer: '7.6% profit',
    explanation: 'Total Cost Price (CP) = 50 × ₦4,500 = ₦225,000.\nSelling Price 1 = 35 × ₦5,200 = ₦182,000.\nSelling Price 2 = 15 × ₦4,000 = ₦60,000.\nTotal Selling Price (SP) = ₦182,000 + ₦60,000 = ₦242,000.\nProfit = SP - CP = ₦242,000 - ₦225,000 = ₦17,000.\nPercentage Profit = (₦17,000 / ₦225,000) × 100% = 7.555% ≈ 7.6% profit.',
    difficulty: 'Standard'
  },
  {
    id: 'mth-2023-q14',
    examType: 'WAEC',
    subjectId: 'mathematics',
    subjectName: 'General Mathematics',
    year: 2023,
    questionNumber: 14,
    paperType: 'Paper 1 (Objective)',
    topic: 'Quadratic Equations & Roots',
    question: 'If α and β are the roots of the quadratic equation 2x² - 7x + 3 = 0, find the value of (α / β) + (β / α).',
    options: [
      '37 / 6',
      '49 / 12',
      '37 / 12',
      '25 / 6'
    ],
    correctAnswer: '37 / 6',
    explanation: 'For ax² + bx + c = 0:\nSum of roots (α + β) = -b/a = -(-7)/2 = 7/2.\nProduct of roots (αβ) = c/a = 3/2.\nNow, (α / β) + (β / α) = (α² + β²) / (αβ) = [(α + β)² - 2αβ] / (αβ).\n[(7/2)² - 2(3/2)] / (3/2) = [49/4 - 3] / (3/2) = [37/4] / (3/2) = (37/4) × (2/3) = 37 / 6.',
    difficulty: 'Challenging'
  },
  {
    id: 'mth-waec-theory-1',
    examType: 'WAEC',
    subjectId: 'mathematics',
    subjectName: 'General Mathematics',
    year: 2024,
    questionNumber: 1,
    paperType: 'Paper 2 (Theory/Essay)',
    topic: 'Simultaneous Equations & Word Problems',
    question: 'Three textbooks and four exercise books cost ₦6,800. Two of the same textbooks and five exercise books cost ₦5,900. \n(a) Form a pair of simultaneous linear equations to represent this information.\n(b) Find the cost of one textbook and the cost of one exercise book.\n(c) How much will a student pay for 5 textbooks and 2 exercise books?',
    correctAnswer: 'Textbook = ₦1,600, Exercise book = ₦500; Total for (c) = ₦9,000',
    explanation: 'Let cost of textbook = t and exercise book = e.\nEquation 1: 3t + 4e = 6,800\nEquation 2: 2t + 5e = 5,900\nMultiplying Eq 1 by 2: 6t + 8e = 13,600\nMultiplying Eq 2 by 3: 6t + 15e = 17,700\nSubtracting: 7e = 4,100 => e = ₦500 (exercise book).\nSubstitute e = 500 into Eq 2: 2t + 5(500) = 5,900 => 2t = 5,900 - 2,500 = 3,400 => t = ₦1,600 (textbook).\nFor 5 textbooks & 2 exercise books: 5(1,600) + 2(500) = ₦8,000 + ₦1,000 = ₦9,000.',
    markingGuide: [
      'B1: Correct formulation of simultaneous equations (3t + 4e = 6,800 and 2t + 5e = 5,900)',
      'M1: Elimination or substitution method correctly applied',
      'A1: Correct cost of exercise book (₦500)',
      'A1: Correct cost of textbook (₦1,600)',
      'M1, A1: Calculating 5(1,600) + 2(500) = ₦9,000'
    ],
    difficulty: 'Standard'
  },

  // ENGLISH LANGUAGE
  {
    id: 'eng-2024-q1',
    examType: 'JAMB',
    subjectId: 'english',
    subjectName: 'English Language / Use of English',
    year: 2024,
    questionNumber: 1,
    paperType: 'Paper 1 (Objective)',
    topic: 'Lexis & Structure (Idiomatic Expressions)',
    question: 'The young scholar took the criticism of her essay in good part. This means she:',
    options: [
      'accepted the criticism without becoming upset or offended',
      'refused to listen to any part of the criticism',
      'accepted only a pleasant fraction of the criticism',
      'blamed the teacher for harsh judgment'
    ],
    correctAnswer: 'accepted the criticism without becoming upset or offended',
    explanation: 'To "take something in good part" is an English idiom meaning to accept a remark, joke, or criticism cheerfully and without taking offense.',
    difficulty: 'Standard'
  },
  {
    id: 'eng-2024-q12',
    examType: 'JAMB',
    subjectId: 'english',
    subjectName: 'English Language / Use of English',
    year: 2024,
    questionNumber: 12,
    paperType: 'Paper 1 (Objective)',
    topic: 'Antonyms (Opposite in Meaning)',
    question: 'Choose the option that is OPPOSITE in meaning to the underlined word:\n"The judge praised the witness for giving a candid account of what happened at the scene."',
    options: [
      'deceitful',
      'frank',
      'accurate',
      'lengthy'
    ],
    correctAnswer: 'deceitful',
    explanation: '"Candid" means truthful, honest, and straightforward. The opposite of honest and candid is "deceitful" (dishonest or misleading).',
    difficulty: 'Standard'
  },
  {
    id: 'eng-waec-oral-1',
    examType: 'WAEC',
    subjectId: 'english',
    subjectName: 'English Language / Use of English',
    year: 2023,
    questionNumber: 45,
    paperType: 'Paper 1 (Objective)',
    topic: 'Oral English: Vowel Sounds',
    question: 'From the words lettered A to D, choose the word that has the SAME vowel sound as the one represented by the underlined letter(s):\n"c<u>ou</u>rt"',
    options: [
      'caught',
      'cut',
      'clout',
      'curse'
    ],
    correctAnswer: 'caught',
    explanation: 'The word "court" contains the long back vowel sound /ɔː/. The word "caught" also contains the exact same vowel sound /ɔː/ (/kɔːt/). "Cut" has /ʌ/, "clout" has /aʊ/, and "curse" has /ɜː/.',
    difficulty: 'Challenging'
  },

  // BIOLOGY
  {
    id: 'bio-2024-q8',
    examType: 'JAMB',
    subjectId: 'biology',
    subjectName: 'Biology',
    year: 2024,
    questionNumber: 8,
    paperType: 'Paper 1 (Objective)',
    topic: 'Genetics & Heredity',
    question: 'In humans, a father with blood group A (heterozygous) and a mother with blood group B (heterozygous) can produce children with which blood groups?',
    options: [
      'A, B, AB, and O',
      'Only AB',
      'Only A and B',
      'Only AB and O'
    ],
    correctAnswer: 'A, B, AB, and O',
    explanation: 'Heterozygous A father has genotype Iᴬi. Heterozygous B mother has genotype Iᴮi.\nPunnett square combinations:\n1. Iᴬ × Iᴮ = IᴬIᴮ (Blood Group AB)\n2. Iᴬ × i = Iᴬi (Blood Group A)\n3. i × Iᴮ = Iᴮi (Blood Group B)\n4. i × i = ii (Blood Group O)\nAll four major blood groups are possible, with a 25% chance for each.',
    difficulty: 'Challenging'
  },
  {
    id: 'bio-waec-2023-q4',
    examType: 'WAEC',
    subjectId: 'biology',
    subjectName: 'Biology',
    year: 2023,
    questionNumber: 4,
    paperType: 'Paper 1 (Objective)',
    topic: 'Cell Physiology & Osmosis',
    question: 'When red blood cells are placed in a concentrated (hypertonic) salt solution, they shrink and become crinkled. This phenomenon is known as:',
    options: [
      'crenation',
      'plasmolysis',
      'haemolysis',
      'turgidity'
    ],
    correctAnswer: 'crenation',
    explanation: 'In animal cells (like red blood cells without a cell wall), loss of water by osmosis in a hypertonic medium causes the cell to shrink and wrinkle, a process called crenation. In plant cells, it is termed plasmolysis. Haemolysis is the bursting of red blood cells in hypotonic solution.',
    difficulty: 'Standard'
  },

  // CHRISTIAN RELIGIOUS STUDIES (CRS)
  {
    id: 'crs-2024-q5',
    examType: 'BOTH',
    subjectId: 'crs',
    subjectName: 'Christian Religious Studies (CRS)',
    year: 2024,
    questionNumber: 5,
    paperType: 'Paper 1 (Objective)',
    topic: 'Faith and Courage: David and Goliath',
    question: 'According to 1 Samuel 17, what weapon did David state he came with against Goliath who approached with a sword, spear, and javelin?',
    options: [
      'In the name of the LORD of hosts, the God of the armies of Israel',
      'With King Saul\'s bronze helmet and coat of mail',
      'With the sharpest forged iron sword from Bethlehem',
      'With a troop of 500 valiant warriors'
    ],
    correctAnswer: 'In the name of the LORD of hosts, the God of the armies of Israel',
    explanation: 'In 1 Samuel 17:45, David boldly declared to Goliath: "Thou comest to me with a sword, and with a spear, and with a shield: but I come to thee in the name of the LORD of hosts, the God of the armies of Israel, whom thou hast defied."',
    difficulty: 'Standard'
  },
  {
    id: 'crs-waec-2023-q19',
    examType: 'WAEC',
    subjectId: 'crs',
    subjectName: 'Christian Religious Studies (CRS)',
    year: 2023,
    questionNumber: 19,
    paperType: 'Paper 1 (Objective)',
    topic: 'Christian Living in the Epistles',
    question: 'In Ephesians 6:1-3, Saint Paul commands children to obey their parents in the Lord because:',
    options: [
      'it is right and is the first commandment with a promise of long life and well-being',
      'parents are wealthier and pay school tuition',
      'children do not have civic legal rights',
      'it guarantees immediate earthly riches and political power'
    ],
    correctAnswer: 'it is right and is the first commandment with a promise of long life and well-being',
    explanation: 'Ephesians 6:1-3 teaches: "Children, obey your parents in the Lord: for this is right. Honour thy father and mother; which is the first commandment with promise; That it may be well with thee, and thou mayest live long on the earth."',
    difficulty: 'Standard'
  },

  // PHYSICS
  {
    id: 'phy-2024-q3',
    examType: 'JAMB',
    subjectId: 'physics',
    subjectName: 'Physics',
    year: 2024,
    questionNumber: 3,
    paperType: 'Paper 1 (Objective)',
    topic: 'Linear Motion & Kinematics',
    question: 'A car accelerates uniformly from rest at 2.5 m/s² for 12 seconds along a straight highway in Abuja. Calculate the total distance covered during this time.',
    options: [
      '180 m',
      '150 m',
      '360 m',
      '240 m'
    ],
    correctAnswer: '180 m',
    explanation: 'Using the second equation of motion:\ns = ut + ½at²\nSince the car starts from rest, initial velocity u = 0 m/s.\ns = (0 × 12) + ½ × (2.5) × (12)²\ns = 0 + 0.5 × 2.5 × 144 = 1.25 × 144 = 180 metres.',
    difficulty: 'Standard'
  },

  // CHEMISTRY
  {
    id: 'chm-2024-q7',
    examType: 'JAMB',
    subjectId: 'chemistry',
    subjectName: 'Chemistry',
    year: 2024,
    questionNumber: 7,
    paperType: 'Paper 1 (Objective)',
    topic: 'Periodic Table & Chemical Bonding',
    question: 'Which of the following electronic configurations represents an element that forms an electrovalent (ionic) bond with Chlorine (atomic number 17)?',
    options: [
      '2, 8, 1',
      '2, 8, 4',
      '2, 8, 7',
      '2, 8, 8'
    ],
    correctAnswer: '2, 8, 1',
    explanation: 'Chlorine (2, 8, 7) has 7 valence electrons and requires 1 electron to achieve octet stability. The element with configuration 2, 8, 1 (Sodium, Na) readily donates its single valence electron to Chlorine, forming an electrovalent (ionic) bond (NaCl).',
    difficulty: 'Standard'
  },

  // LITERATURE IN ENGLISH
  {
    id: 'lit-2024-q11',
    examType: 'JAMB',
    subjectId: 'literature',
    subjectName: 'Literature-in-English',
    year: 2024,
    questionNumber: 11,
    paperType: 'Paper 1 (Objective)',
    topic: 'Literary Devices & Poetic Terms',
    question: '"The merciless sun beat down on the parched Sahel soil like a blacksmith’s hammer." The literary device used in this sentence is:',
    options: [
      'Simile and Personification',
      'Oxymoron and Synecdoche',
      'Hyperbole and Metonymy',
      'Euphemism and Apostrophe'
    ],
    correctAnswer: 'Simile and Personification',
    explanation: '"The merciless sun beat down" gives human attribute (merciless beating) to the inanimate sun (Personification), while "like a blacksmith’s hammer" uses the word "like" to draw a direct comparison (Simile).',
    difficulty: 'Standard'
  },

  // GOVERNMENT
  {
    id: 'gov-2024-q4',
    examType: 'JAMB',
    subjectId: 'government',
    subjectName: 'Government & Civic Education',
    year: 2024,
    questionNumber: 4,
    paperType: 'Paper 1 (Objective)',
    topic: 'Constitutional History of Nigeria',
    question: 'Which Nigerian constitutional conference introduced the elective principle for the first time in Nigeria, allowing 4 elected representatives (3 from Lagos and 1 from Calabar)?',
    options: [
      'Clifford Constitution of 1922',
      'Richards Constitution of 1946',
      'Macpherson Constitution of 1951',
      'Lyttelton Constitution of 1954'
    ],
    correctAnswer: 'Clifford Constitution of 1922',
    explanation: 'The Hugh Clifford Constitution of 1922 introduced the historic Elective Principle for the first time in British colonial Nigeria, allowing four elected Africans (three representing Lagos and one representing Calabar) into the Legislative Council.',
    difficulty: 'Standard'
  }
];
