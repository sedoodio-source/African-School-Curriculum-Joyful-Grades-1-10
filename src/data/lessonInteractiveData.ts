import { Subject, Topic } from '../types';

export interface MatchingPair {
  id: string;
  term: string;
  match: string;
  hint?: string;
  icon?: string;
}

export interface VideoTakeaway {
  timestamp: string;
  label: string;
  detail: string;
}

export interface VideoActivity {
  title: string;
  videoUrl: string;
  source: string;
  duration: string;
  summary: string;
  takeaways: VideoTakeaway[];
  comprehensionQuestion: {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  };
}

export interface ShortQuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  moralTakeaway?: string;
}

export interface LessonInteractiveContent {
  matching: {
    title: string;
    instruction: string;
    pairs: MatchingPair[];
  };
  video: VideoActivity;
  shortQuiz: {
    title: string;
    description: string;
    questions: ShortQuizQuestion[];
  };
  creativePrompt: {
    mission: string;
    guidingQuestions: string[];
    starterIdea: string;
  };
}

// Curated high-fidelity database for core subject topics across all terms and grades
const SUBJECT_TOPIC_DATA: Record<string, Partial<LessonInteractiveContent>> = {
  // MATH TOPICS
  'Math-Numbers': {
    matching: {
      title: "Place Value & Number Theory Matching",
      instruction: "Match each mathematical concept with its precise definition or property.",
      pairs: [
        { id: 'm1', term: 'Prime Number', match: 'A whole number greater than 1 with only two factors: 1 and itself', hint: 'Examples: 2, 3, 5, 7, 11' },
        { id: 'm2', term: 'Composite Number', match: 'A positive integer having at least one divisor other than 1 and itself', hint: 'Examples: 4, 6, 8, 9, 10' },
        { id: 'm3', term: 'Place Value', match: 'The numerical value a digit has by virtue of its position in a number', hint: 'Units, Tens, Hundreds, Thousands' },
        { id: 'm4', term: 'Expanded Form', match: 'Writing a number as the sum of the value of each individual digit', hint: '345 = 300 + 40 + 5' },
        { id: 'm5', term: 'Even Number', match: 'An integer divisible by 2 with zero remainder, ending in 0, 2, 4, 6, or 8', hint: 'Can always be split into two equal halves' }
      ]
    },
    video: {
      title: "Understanding Place Value & Number Sense",
      videoUrl: "https://www.youtube-nocookie.com/embed/a4FXl4zb3E4",
      source: "Math Antics & Khan Academy",
      duration: "4:45",
      summary: "Explore how digits shift value exponentially by powers of ten. Discover the base-10 numerical system and how ancient civilizations developed place-holding systems to count God's vast creation with precision.",
      takeaways: [
        { timestamp: "0:45", label: "Base-10 Foundation", detail: "Every position to the left is ten times greater than the position to its right." },
        { timestamp: "2:15", label: "Zero as a Place Holder", detail: "Zero ensures digits remain in their correct column (e.g. 502 vs 52)." },
        { timestamp: "3:50", label: "Real-World Application", detail: "Place value is essential in currency, scientific measurement, and engineering." }
      ],
      comprehensionQuestion: {
        question: "In the number 4,729, what is the true place value of the digit 7?",
        options: ["7 units", "70 tens", "700 hundreds", "7,000 thousands"],
        correctAnswer: "700 hundreds",
        explanation: "The digit 7 is in the hundreds column, giving it a value of 7 × 100 = 700."
      }
    },
    shortQuiz: {
      title: "Numbers Rapid Knowledge Check",
      description: "Test your quick calculation and conceptual understanding.",
      questions: [
        {
          id: 1,
          question: "Which of the following numbers is prime?",
          options: ["9", "15", "17", "21"],
          correctAnswer: "17",
          explanation: "17 can only be divided evenly by 1 and 17. 9 (3×3), 15 (3×5), and 21 (3×7) are composite.",
          moralTakeaway: "Just as prime numbers have pure integrity, Christians are called to honest, undivided hearts."
        },
        {
          id: 2,
          question: "What is the standard form of (5 × 1,000) + (3 × 100) + (8 × 1)?",
          options: ["5,380", "5,308", "5,038", "538"],
          correctAnswer: "5,308",
          explanation: "There are 5 thousands, 3 hundreds, 0 tens, and 8 units, producing 5,308.",
          moralTakeaway: "Orderliness in numbers reflects God's orderly creation (1 Corinthians 14:40)."
        },
        {
          id: 3,
          question: "What is the smallest positive even prime number?",
          options: ["0", "1", "2", "4"],
          correctAnswer: "2",
          explanation: "2 is the only even prime number, as all higher even numbers are divisible by 2.",
          moralTakeaway: "Unique gifts are given by God for unique divine purposes."
        }
      ]
    },
    creativePrompt: {
      mission: "Design a 'Secret Code Number System' using place values from units to millions.",
      guidingQuestions: ["How does your code prevent confusion between 40 and 400?", "Can you write today's date in expanded form?"],
      starterIdea: "Create 3 mathematical riddles where your family must find the hidden number using your clues."
    }
  },

  'Math-Fractions': {
    matching: {
      title: "Fractions & Proportions Match",
      instruction: "Connect each fraction term with its correct visual meaning.",
      pairs: [
        { id: 'f1', term: 'Numerator', match: 'The top number representing how many equal parts you have', hint: 'The counter of parts' },
        { id: 'f2', term: 'Denominator', match: 'The bottom number indicating the total equal parts in the whole', hint: 'The namer of the fraction' },
        { id: 'f3', term: 'Improper Fraction', match: 'A fraction where the numerator is greater than or equal to the denominator', hint: 'Example: 7/4 or 5/2' },
        { id: 'f4', term: 'Mixed Number', match: 'A value expressed as an integer alongside a proper fraction', hint: 'Example: 1 3/4' },
        { id: 'f5', term: 'Equivalent Fractions', match: 'Different fractions that name the exact same quantity or proportion', hint: 'Example: 1/2 = 2/4 = 4/8' }
      ]
    },
    video: {
      title: "Mastering Fractions Visually",
      videoUrl: "https://www.youtube-nocookie.com/embed/n0FZhQ_GkKw",
      source: "Crash Course Kids & Math Antics",
      duration: "5:12",
      summary: "Understand how fractions represent fair sharing and division of whole units. Learn how to find common denominators and simplify fractions effortlessly.",
      takeaways: [
        { timestamp: "1:10", label: "Parts of a Whole", detail: "Fractions require parts to be strictly equal in size." },
        { timestamp: "2:40", label: "Simplifying", detail: "Divide numerator and denominator by their greatest common factor." },
        { timestamp: "4:10", label: "Fractions in Baking", detail: "Chefs rely on fractions to adjust recipes proportionally." }
      ],
      comprehensionQuestion: {
        question: "What is an equivalent fraction to 3/4 with a denominator of 12?",
        options: ["6/12", "9/12", "8/12", "10/12"],
        correctAnswer: "9/12",
        explanation: "Multiply both numerator and denominator by 3: (3×3)/(4×3) = 9/12."
      }
    },
    shortQuiz: {
      title: "Fractions Rapid Knowledge Check",
      description: "Quick-fire fraction comparison and simplification questions.",
      questions: [
        {
          id: 1,
          question: "Which fraction is equivalent to 2/5?",
          options: ["4/10", "3/10", "4/15", "5/2"],
          correctAnswer: "4/10",
          explanation: "Multiplying numerator and denominator by 2 gives 4/10.",
          moralTakeaway: "Fair sharing with our brothers and sisters reflects the love of Christ."
        },
        {
          id: 2,
          question: "Convert the improper fraction 9/4 into a mixed number:",
          options: ["2 1/4", "1 3/4", "3 1/4", "2 3/4"],
          correctAnswer: "2 1/4",
          explanation: "9 divided by 4 equals 2 with a remainder of 1, so 2 and 1/4.",
          moralTakeaway: "Patience in working step-by-step turns difficult tasks into clear victories."
        }
      ]
    },
    creativePrompt: {
      mission: "Draw a 'Fraction Pizza Bakery' displaying pizzas divided into halves, thirds, fourths, and eighths.",
      guidingQuestions: ["Which pizza slice is bigger: 1/3 or 1/4?", "How many eighths equal one half?"],
      starterIdea: "Show how sharing 3 pizzas among 6 friends ensures everyone gets an equal 1/2 share."
    }
  },

  // SCIENCE TOPICS
  'Science-God\'s Creation': {
    matching: {
      title: "Creation Days & Divine Order Match",
      instruction: "Match each day of Genesis Creation with what God commanded into being.",
      pairs: [
        { id: 'c1', term: 'Day 1', match: 'God said "Let there be light", separating light from darkness', hint: 'Genesis 1:3-5' },
        { id: 'c2', term: 'Day 2', match: 'The expanse / atmosphere separating waters above from waters below', hint: 'The sky and clouds' },
        { id: 'c3', term: 'Day 3', match: 'Dry land, seas, and plant life yielding seeds according to their kind', hint: 'Genesis 1:9-13' },
        { id: 'c4', term: 'Day 4', match: 'The sun, moon, and stars to mark seasons, days, and years', hint: 'Heavenly luminaries' },
        { id: 'c5', term: 'Day 5', match: 'Living creatures in the oceans and winged birds across the sky', hint: 'Sea life & birds' },
        { id: 'c6', term: 'Day 6', match: 'Land animals and mankind created in the image and likeness of God', hint: 'Genesis 1:26-27' }
      ]
    },
    video: {
      title: "The Wonder of God's Natural World",
      videoUrl: "https://www.youtube-nocookie.com/embed/KOUV7mW49Co",
      source: "SciShow Kids & Bible Discovery",
      duration: "4:30",
      summary: "Marvel at the extraordinary biological design, mathematical harmony (Fibonacci sequences in flowers), and atmospheric shields that make planet Earth uniquely suited for living beings.",
      takeaways: [
        { timestamp: "0:50", label: "The Goldilocks Zone", detail: "Earth is at the exact distance from the Sun for liquid water and life." },
        { timestamp: "2:10", label: "Atmospheric Shield", detail: "The ozone layer and magnetic field filter harmful radiation." },
        { timestamp: "3:40", label: "Stewardship Mandate", detail: "God entrusted humans to cultivate and protect our environment." }
      ],
      comprehensionQuestion: {
        question: "According to Genesis 1:27, in whose image was mankind created?",
        options: ["The angels", "The image of God", "The animal kingdom", "The stars"],
        correctAnswer: "The image of God",
        explanation: "Genesis 1:27 teaches that God created mankind in His own image, bestowing infinite dignity and moral purpose."
      }
    },
    shortQuiz: {
      title: "Creation & Nature Quick Check",
      description: "Answer questions honoring God's architectural genius in nature.",
      questions: [
        {
          id: 1,
          question: "What is the primary gas produced by plants during daylight that humans and animals breathe?",
          options: ["Carbon Dioxide", "Oxygen", "Nitrogen", "Helium"],
          correctAnswer: "Oxygen",
          explanation: "Through photosynthesis, plants convert water, sunlight, and carbon dioxide into glucose and release oxygen.",
          moralTakeaway: "Nature displays symbiotic harmony created by our loving Heavenly Father."
        },
        {
          id: 2,
          question: "Which scripture proclaims: 'The heavens declare the glory of God; the skies proclaim the work of his hands'?",
          options: ["Psalm 19:1", "John 3:16", "Genesis 12:1", "Proverbs 3:5"],
          correctAnswer: "Psalm 19:1",
          explanation: "King David wrote Psalm 19:1 to celebrate how cosmic creation continually bears witness to God's majesty.",
          moralTakeaway: "Every sunrise is a reminder of God's renewed mercies."
        }
      ]
    },
    creativePrompt: {
      mission: "Collect 3 different leaves or natural items and sketch their intricate vein patterns.",
      guidingQuestions: ["How does water travel through the plant's veins?", "What praise prayer can you write for God's creation?"],
      starterIdea: "Write a short prayer of gratitude thanking God for oxygen, clean water, and green plants."
    }
  },

  'Science-The Human Body': {
    matching: {
      title: "Human Anatomy & Body Systems Match",
      instruction: "Connect each vital body system with its life-sustaining role.",
      pairs: [
        { id: 'hb1', term: 'Circulatory System', match: 'The heart and blood vessels pumping oxygen and nutrients to every cell', hint: 'The heart beats ~100,000 times a day' },
        { id: 'hb2', term: 'Respiratory System', match: 'The lungs taking in oxygen and expelling carbon dioxide waste', hint: 'Trachea, bronchi, and alveoli' },
        { id: 'hb3', term: 'Skeletal System', match: '206 bones providing structural framework, protecting organs, and storing minerals', hint: 'Protects the brain and heart' },
        { id: 'hb4', term: 'Nervous System', match: 'Brain, spinal cord, and nerves transmitting electrical signals instantaneously', hint: 'Controls thoughts and reflexes' },
        { id: 'hb5', term: 'Digestive System', match: 'Breaks down consumed food into fuel that our bodies use for energy and growth', hint: 'Stomach, intestines, liver' }
      ]
    },
    video: {
      title: "Fearfully & Wonderfully Made: Human Anatomy",
      videoUrl: "https://www.youtube-nocookie.com/embed/gEUu-A2wfSE",
      source: "SciShow Kids & CrashCourse Biology",
      duration: "5:20",
      summary: "See how billions of cells work in synchrony inside your body. Psalm 139:14 declares 'I am fearfully and wonderfully made'. Discover the marvel of your beating heart and rapid nerve impulses.",
      takeaways: [
        { timestamp: "1:00", label: "The Mighty Heart", detail: "Your heart pumps about 2,000 gallons of blood every single day." },
        { timestamp: "2:30", label: "Brain Power", detail: "Neurons send messages at speeds up to 250 miles per hour." },
        { timestamp: "4:00", label: "Health & Honor", detail: "Caring for our body with wholesome nutrition honors God." }
      ],
      comprehensionQuestion: {
        question: "How many bones are in the adult human body?",
        options: ["106", "206", "306", "406"],
        correctAnswer: "206",
        explanation: "Babies are born with approximately 300 bones, which fuse as they grow into 206 adult bones."
      }
    },
    shortQuiz: {
      title: "Human Body Rapid Check",
      description: "Test your knowledge of the marvelous human anatomy.",
      questions: [
        {
          id: 1,
          question: "Which organ acts as the command center for the entire nervous system?",
          options: ["Heart", "Lungs", "Brain", "Kidney"],
          correctAnswer: "Brain",
          explanation: "The brain processes all sensory inputs, memories, and muscular commands.",
          moralTakeaway: "Philippians 4:8 encourages us to fix our minds on whatever is pure, lovely, and admirable."
        },
        {
          id: 2,
          question: "Which red fluid delivers oxygen from your lungs to your muscles?",
          options: ["Saliva", "Blood", "Lymph", "Water"],
          correctAnswer: "Blood",
          explanation: "Red blood cells contain hemoglobin, which binds to oxygen and distributes it throughout the body.",
          moralTakeaway: "Our physical health enables us to serve God and love our neighbors with energy."
        }
      ]
    },
    creativePrompt: {
      mission: "Measure your resting heart rate by counting pulses for 60 seconds. Then do 20 jumping jacks and measure again!",
      guidingQuestions: ["Why did your heart speed up after exercise?", "How does your body supply oxygen to working muscles?"],
      starterIdea: "Record both numbers and write a thank-you note to God for your beating heart."
    }
  },

  // SOCIAL STUDIES TOPICS
  'Social Studies-Ancient African Empires': {
    matching: {
      title: "Great African Empires & Civilizations",
      instruction: "Match each illustrious African kingdom with its historical legacy.",
      pairs: [
        { id: 'ae1', term: 'Mali Empire', match: 'Famed for legendary wealth, the great university of Timbuktu, and Mansa Musa', hint: 'Flourished along the Niger River' },
        { id: 'ae2', term: 'Kingdom of Benin', match: 'Celebrated for world-renowned bronze casting, advanced city walls, and the Oba', hint: 'Located in southern Nigeria' },
        { id: 'ae3', term: 'Songhai Empire', match: 'A dominant West African trading powerhouse with vast centers of Islamic & African scholarship', hint: 'Led by Askia the Great' },
        { id: 'ae4', term: 'Great Zimbabwe', match: 'A majestic southern African stone city built with mortarless granite walls and towers', hint: 'Thrived from gold and cattle trade' },
        { id: 'ae5', term: 'Kush (Nubia)', match: 'Nile river civilization famed for archers, iron smelting, and towering pyramids', hint: 'Neighbors and rulers of Egypt' }
      ]
    },
    video: {
      title: "History of West African Kingdoms",
      videoUrl: "https://www.youtube-nocookie.com/embed/8w1bJv_21mI",
      source: "Crash Course World History & BBC Africa",
      duration: "6:15",
      summary: "Journey through pre-colonial African trade routes, scholarship, and advanced metallurgy. Discover how ancient African civilizations pioneered architecture, astronomy, and trans-Saharan commerce.",
      takeaways: [
        { timestamp: "1:20", label: "Timbuktu Libraries", detail: "Contained hundreds of thousands of manuscripts in science, law, and theology." },
        { timestamp: "3:00", label: "Benin Bronzes", detail: "Demonstrated master metallurgy and sophisticated lost-wax casting technique." },
        { timestamp: "4:50", label: "African Trade Networks", detail: "Gold, salt, textiles, and ivory connected Africa across continents." }
      ],
      comprehensionQuestion: {
        question: "Which historic university in the Mali Empire was a famous center of learning?",
        options: ["University of Oxford", "University of Timbuktu (Sankore)", "University of Cairo", "Alexandria Library"],
        correctAnswer: "University of Timbuktu (Sankore)",
        explanation: "Sankore University in Timbuktu housed world-famous scholars, doctors, jurists, and extensive manuscript collections."
      }
    },
    shortQuiz: {
      title: "African Empires Quick Check",
      description: "Test your knowledge of Africa's rich historical heritage.",
      questions: [
        {
          id: 1,
          question: "Which valuable mineral was exchanged equally with gold in ancient West African trade?",
          options: ["Salt", "Coal", "Copper", "Wood"],
          correctAnswer: "Salt",
          explanation: "Salt was essential for preserving food, retaining hydration in the heat, and was valued equally with gold.",
          moralTakeaway: "Jesus called His followers to be 'the salt of the earth', bringing preservation and goodness."
        },
        {
          id: 2,
          question: "The famous Benin Bronzes were crafted primarily using which metallurgical technique?",
          options: ["Lost-wax casting", "Carving from stone", "Clay molding only", "Electric welding"],
          correctAnswer: "Lost-wax casting",
          explanation: "Benin artisans sculpted detailed wax models, encased them in clay, melted the wax out, and poured molten bronze.",
          moralTakeaway: "Excellence in craftsmanship honors God with our creative talents (Exodus 35:35)."
        }
      ]
    },
    creativePrompt: {
      mission: "Design a commemorative museum postcard illustrating an ancient African kingdom's greatest invention or artifact.",
      guidingQuestions: ["What architectural or artistic feature stands out most?", "What message about African excellence will you share?"],
      starterIdea: "Draw the walls of Great Zimbabwe or a Benin bronze royal pendant with gold accents."
    }
  },

  // BIBLE STUDY TOPICS
  'Bible Study-Creation': {
    matching: {
      title: "Genesis & The Creation Week Match",
      instruction: "Pair each creation detail with its biblical meaning and scripture reference.",
      pairs: [
        { id: 'b1', term: 'Genesis 1:1', match: '"In the beginning God created the heavens and the earth"', hint: 'The foundation of all history' },
        { id: 'b2', term: 'Ex Nihilo', match: 'Creation out of nothing by the sovereign Word of the Almighty God', hint: 'Hebrews 11:3' },
        { id: 'b3', term: 'Imago Dei', match: 'Mankind formed in the image and likeness of God with moral consciousness', hint: 'Genesis 1:26-27' },
        { id: 'b4', term: 'Garden of Eden', match: 'The paradise of fellowship, tree of life, and purposeful stewardship', hint: 'Genesis 2:8' },
        { id: 'b5', term: 'Sabbath Rest', match: 'God ceased from creating on the 7th day, blessing and sanctifying it', hint: 'Genesis 2:2-3' }
      ]
    },
    video: {
      title: "Genesis 1: The Grand Narrative of Creation",
      videoUrl: "https://www.youtube-nocookie.com/embed/KOUV7mW49Co",
      source: "The Bible Project & Superbook",
      duration: "5:00",
      summary: "Witness the poetic majesty of Genesis 1. God brings light into darkness, order out of chaos, and crowns creation with human beings destined to reflect His holy character.",
      takeaways: [
        { timestamp: "0:45", label: "Power of God's Word", detail: "God spoke, and the universe leapt into existence." },
        { timestamp: "2:00", label: "It Was Very Good", detail: "Every element of creation was crafted with perfection and purpose." },
        { timestamp: "3:30", label: "Our Divine Calling", detail: "We are called to love God and be faithful caretakers of His world." }
      ],
      comprehensionQuestion: {
        question: "What did God declare after creating all things on the sixth day?",
        options: ["It was okay", "It was very good", "It was unfinished", "It was mysterious"],
        correctAnswer: "It was very good",
        explanation: "Genesis 1:31 states: 'God saw all that he had made, and it was very good.'"
      }
    },
    shortQuiz: {
      title: "Creation Scripture Check",
      description: "Reflect on foundational biblical truths of origins and purpose.",
      questions: [
        {
          id: 1,
          question: "How did God create the universe in Genesis 1?",
          options: ["By speaking His Word", "By random chance", "By physical tools", "By angelic workers"],
          correctAnswer: "By speaking His Word",
          explanation: "God said 'Let there be light' and it was so. His Word carries sovereign creative authority.",
          moralTakeaway: "Our words also have power; let us speak life, truth, and kindness (Proverbs 18:21)."
        },
        {
          id: 2,
          question: "What task did God give Adam in Genesis 2 regarding the animals?",
          options: ["To avoid them", "To name each creature", "To build cages", "To count stars"],
          correctAnswer: "To name each creature",
          explanation: "God brought each creature to Adam to see what he would name them, demonstrating human stewardship.",
          moralTakeaway: "Diligence in our daily responsibilities honors God's trust in us."
        }
      ]
    },
    creativePrompt: {
      mission: "Write an illustrated 'Creation Journal' entry describing what it would have been like to stand on Day 4 under the first stars.",
      guidingQuestions: ["How does looking at the night sky make you feel about God's power?", "Which verse will you memorize?"],
      starterIdea: "Memorize Psalm 8:3-4: 'When I consider your heavens, the work of your fingers... what is mankind that you are mindful of them?'"
    }
  },

  // ENGLISH / GRAMMAR TOPICS
  'English-Grammar': {
    matching: {
      title: "Parts of Speech & Sentence Building",
      instruction: "Match each grammatical component with its essential function.",
      pairs: [
        { id: 'g1', term: 'Noun', match: 'A word naming a person, place, thing, or abstract idea', hint: 'Examples: Samuel, Abuja, Bible, Wisdom' },
        { id: 'g2', term: 'Verb', match: 'A word expressing an action, state of being, or occurrence', hint: 'Examples: prays, sings, runs, is' },
        { id: 'g3', term: 'Adjective', match: 'A word that modifies, describes, or quantifies a noun or pronoun', hint: 'Examples: diligent, peaceful, bright' },
        { id: 'g4', term: 'Adverb', match: 'A word describing how, when, where, or to what degree an action happens', hint: 'Examples: softly, joyfully, yesterday' },
        { id: 'g5', term: 'Conjunction', match: 'A linking word connecting clauses, sentences, or coordinating words', hint: 'Examples: and, but, because, although' }
      ]
    },
    video: {
      title: "Mastering Parts of Speech with Fun",
      videoUrl: "https://www.youtube-nocookie.com/embed/n35p8oF4N4M",
      source: "Grammaropolis & FreeSchool",
      duration: "4:15",
      summary: "Discover how every English sentence is a cooperative team of nouns, verbs, and descriptive modifiers. Learn how clear grammar empowers you to communicate truth effectively.",
      takeaways: [
        { timestamp: "0:45", label: "Nouns & Verbs Core", detail: "Every complete sentence requires a subject noun and a predicate verb." },
        { timestamp: "2:00", label: "Vivid Adjectives", detail: "Descriptive adjectives paint vivid mental pictures for your readers." },
        { timestamp: "3:15", label: "Adverb Clues", detail: "Many adverbs end in '-ly' and explain how an action is performed." }
      ],
      comprehensionQuestion: {
        question: "In the sentence 'Samuel faithfully read his Bible every morning', what part of speech is 'faithfully'?",
        options: ["Noun", "Adverb", "Preposition", "Conjunction"],
        correctAnswer: "Adverb",
        explanation: "'Faithfully' describes how Samuel read, making it an adverb modifying the verb 'read'."
      }
    },
    shortQuiz: {
      title: "Grammar Rapid Knowledge Check",
      description: "Quick-fire identification of parts of speech in inspirational sentences.",
      questions: [
        {
          id: 1,
          question: "Identify the verb in this sentence: 'Miss Kelechi teaches mathematics with great enthusiasm.'",
          options: ["Miss Kelechi", "teaches", "mathematics", "enthusiasm"],
          correctAnswer: "teaches",
          explanation: "'Teaches' is the action verb performed by the subject Miss Kelechi.",
          moralTakeaway: "Teaching and learning are noble callings that bless future generations."
        },
        {
          id: 2,
          question: "Which of the following is a proper noun that must always begin with a capital letter?",
          options: ["school", "country", "Nigeria", "student"],
          correctAnswer: "Nigeria",
          explanation: "Nigeria is a specific country name (proper noun), whereas school and student are common nouns.",
          moralTakeaway: "Honoring our nation and leaders in our prayers reflects godly citizenship (1 Timothy 2:1-2)."
        }
      ]
    },
    creativePrompt: {
      mission: "Write a 5-sentence story where you highlight every noun in blue, verb in green, and adjective in yellow.",
      guidingQuestions: ["Can you include words that describe godly courage?", "How do strong verbs make your story exciting?"],
      starterIdea: "Write about a young student who stood up for a classmate on the playground with kindness."
    }
  },

  // BIOLOGY (Advanced Grades 8-10)
  'Biology-Cellular Ultrastructure & Biochemistry': {
    matching: {
      title: "Cellular Organelles & Biochemical Roles",
      instruction: "Connect each cellular organelle with its precise molecular function.",
      pairs: [
        { id: 'bio1', term: 'Mitochondria', match: 'Site of aerobic cellular respiration generating adenosine triphosphate (ATP)', hint: 'The powerhouse of eukaryotic cells' },
        { id: 'bio2', term: 'Ribosome', match: 'Molecular machine translating mRNA transcripts into polypeptide chains', hint: 'Protein synthesis factory' },
        { id: 'bio3', term: 'Endoplasmic Reticulum', match: 'Membranous network for lipid synthesis (smooth) and protein folding (rough)', hint: 'Continuous with the nuclear envelope' },
        { id: 'bio4', term: 'Golgi Apparatus', match: 'Modifies, sorts, packages, and tags macromolecules for secretion or lysosomal delivery', hint: 'The cellular shipping department' },
        { id: 'bio5', term: 'Chloroplast', match: 'Double-membraned plastid containing chlorophyll for solar energy transduction', hint: 'Site of light and dark photosynthesis reactions' }
      ]
    },
    video: {
      title: "Inside the Living Cell: Molecular Marvels",
      videoUrl: "https://www.youtube-nocookie.com/embed/8IlzKri08kk",
      source: "CrashCourse Biology & Nucleus Medical Media",
      duration: "6:40",
      summary: "Step inside the bustling microscopic metropolis of eukaryotic cells. Observe molecular motors (kinesin), lipid bilayer fluid mosaics, and the astounding biochemical choreography that sustains physical life.",
      takeaways: [
        { timestamp: "1:15", label: "Fluid Mosaic Model", detail: "Phospholipid bilayers with embedded transport proteins maintain homeostasis." },
        { timestamp: "3:00", label: "ATP Synthase", detail: "A literal molecular rotary engine generating cellular fuel." },
        { timestamp: "5:10", label: "Irreducible Complexity", detail: "Interlocking cellular systems point to intentional, divine architecture." }
      ],
      comprehensionQuestion: {
        question: "Which high-energy molecule is the primary universal energy currency synthesized by mitochondria?",
        options: ["DNA", "ATP (Adenosine Triphosphate)", "Glucose", "RNA"],
        correctAnswer: "ATP (Adenosine Triphosphate)",
        explanation: "ATP stores and transports chemical energy within cells for metabolic reactions."
      }
    },
    shortQuiz: {
      title: "Advanced Cellular Biochemistry Check",
      description: "University-level cellular biology conceptual check.",
      questions: [
        {
          id: 1,
          question: "Which organelle contains hydrolytic digestive enzymes responsible for intracellular degradation and autophagy?",
          options: ["Peroxisome", "Lysosome", "Centrosome", "Vacuole"],
          correctAnswer: "Lysosome",
          explanation: "Lysosomes maintain an acidic interior packed with acid hydrolases to digest polymers and damaged organelles.",
          moralTakeaway: "Order and self-cleaning in the cell remind us of spiritual renewal and cleansing through Christ."
        },
        {
          id: 2,
          question: "What macromolecule makes up the primary structural scaffolding of bacterial cell walls, absent in animal cells?",
          options: ["Cellulose", "Peptidoglycan (Murein)", "Chitin", "Glycogen"],
          correctAnswer: "Peptidoglycan (Murein)",
          explanation: "Peptidoglycan forms a mesh-like polymer of sugars and amino acids targeted by beta-lactam antibiotics.",
          moralTakeaway: "God's wisdom engineered distinct defense barriers for every organism."
        }
      ]
    },
    creativePrompt: {
      mission: "Draft a 3D structural schematic mapping the endomembrane pathway from nucleus to cell membrane.",
      guidingQuestions: ["How does a vesicle bud off the ER and fuse with the Golgi?", "What role do signal peptides play?"],
      starterIdea: "Color-code the journey of an insulin protein molecule from gene transcription to exocytosis."
    }
  },

  // ETYMOLOGY (Advanced Grades 8-10)
  'Etymology-Proto-Indo-European Roots & Sound Laws': {
    matching: {
      title: "Historical Linguistics & Proto-Roots",
      instruction: "Match each ancient root with its modern cognates across European & Semitic tongues.",
      pairs: [
        { id: 'ety1', term: 'PIE *genh₁- (to produce)', match: 'Genesis, generation, gene, gentle, kin, knight', hint: 'Signifies birth and family' },
        { id: 'ety2', term: 'PIE *dʰeh₁- (to place/do)', match: 'Thesis, deed, doom, theme, edifice', hint: 'Signifies establishing or putting' },
        { id: 'ety3', term: 'PIE *h₁ed- (to eat)', match: 'Edible, eat, etch, tooth (odont-)', hint: 'Nutritional sustenance' },
        { id: 'ety4', term: 'PIE *bʰer- (to carry)', match: 'Bear, burden, fertile, transfer, circumference', hint: 'Bearing weight or yield' },
        { id: 'ety5', term: 'Grimm\'s Law', match: 'Systematic historical shift of Proto-Indo-European stops in Germanic tongues', hint: 'PIE *p becomes Germanic *f (pater -> father)' }
      ]
    },
    video: {
      title: "The Tree of Languages: Exploring Proto-Indo-European",
      videoUrl: "https://www.youtube-nocookie.com/embed/tW3k_b8I3l4",
      source: "NativeLang & Oxford Philology",
      duration: "7:00",
      summary: "Trace how ancient languages dispersed across Eurasia from the Tower of Babel to modern times. Witness how Greek, Latin, Sanskrit, and English share common linguistic ancestry preserved across millennia.",
      takeaways: [
        { timestamp: "1:30", label: "Cognate Clues", detail: "Words like 'mother' (mater, madre, matar) reveal shared historical ancestry." },
        { timestamp: "3:40", label: "Sound Shift Regularity", detail: "Grimm's Law proves that phonetic changes happen predictably across whole vocabularies." },
        { timestamp: "5:20", label: "Biblical Reflection", detail: "Language is God's gift for divine communion and righteous fellowship." }
      ],
      comprehensionQuestion: {
        question: "Under Grimm's Law, what does the Proto-Indo-European voiceless stop *p shift to in Proto-Germanic?",
        options: ["*b", "*f", "*d", "*m"],
        correctAnswer: "*f",
        explanation: "PIE *p regularly shifted to Germanic *f, as seen in Latin 'piscis' becoming English 'fish', or Latin 'pater' becoming 'father'."
      }
    },
    shortQuiz: {
      title: "Etymology & Sound Laws Check",
      description: "Analyze the architectural origins of academic words.",
      questions: [
        {
          id: 1,
          question: "The Latin root 'bene' (as in benefit, benevolent, benediction) means:",
          options: ["Bad or ill", "Good or well", "Fast or sudden", "High or exalted"],
          correctAnswer: "Good or well",
          explanation: "'Bene' is the Latin adverb for well/good, opposite of 'mal' (malicious, malevolent).",
          moralTakeaway: "Speaking a benediction (good word) over others brings healing and encouragement."
        },
        {
          id: 2,
          question: "Which linguistic discipline studies how word meanings change and evolve across centuries?",
          options: ["Semantics", "Phonetics", "Syntax", "Morphology"],
          correctAnswer: "Semantics",
          explanation: "Historical semantics investigates the shifts, narrowing, broadening, and pejorations of word meanings over time.",
          moralTakeaway: "Proverbs 25:11: 'A word fitly spoken is like apples of gold in settings of silver.'"
        }
      ]
    },
    creativePrompt: {
      mission: "Construct an Etymological Family Tree for the root *spek- (to observe).",
      guidingQuestions: ["How did *spek- give birth to spectator, inspect, respect, and telescope?", "What does 'respect' literally mean (re-spect = to look back at)?"],
      starterIdea: "Show how 'respecting' someone means looking at them with careful regard as God's creation."
    }
  }
};

// Fallback procedural generator to guarantee high-quality interactive elements for EVERY lesson
export function getLessonInteractiveData(subject: Subject, grade: number, topic: Topic): LessonInteractiveContent {
  // Check exact key match
  const rawBaseKey = topic.title.split(' - Part')[0].trim();
  const directKey = `${subject}-${rawBaseKey}`;
  if (SUBJECT_TOPIC_DATA[directKey]) {
    const data = SUBJECT_TOPIC_DATA[directKey]!;
    return enrichProceduralTopic(data, subject, grade, topic);
  }

  // Check prefix match
  const matchedKey = Object.keys(SUBJECT_TOPIC_DATA).find(k => k.startsWith(`${subject}-`));
  if (matchedKey && SUBJECT_TOPIC_DATA[matchedKey]) {
    return enrichProceduralTopic(SUBJECT_TOPIC_DATA[matchedKey]!, subject, grade, topic);
  }

  // Fully procedural generator tailored for the subject and grade
  return generateProceduralContent(subject, grade, topic);
}

function enrichProceduralTopic(
  base: Partial<LessonInteractiveContent>, 
  subject: Subject, 
  grade: number, 
  topic: Topic
): LessonInteractiveContent {
  const partMatch = topic.title.match(/Part (\d+)/i);
  const partNumber = partMatch ? parseInt(partMatch[1], 10) : 1;

  // Clone and enrich with the specific lesson title
  const matchingPairs = (base.matching?.pairs || []).map((p, idx) => ({
    ...p,
    id: `${topic.id}-p${idx}`,
    term: partNumber > 1 && idx === 0 ? `${p.term} (Advanced Part ${partNumber})` : p.term
  }));

  const takeaways: VideoTakeaway[] = base.video?.takeaways || [
    { timestamp: "0:45", label: "Fundamental Principles", detail: `Core axioms of ${topic.title} in Grade ${grade}.` },
    { timestamp: "2:00", label: "Interactive Case Study", detail: "Examining practical applications and step-by-step methodology." },
    { timestamp: "3:30", label: "Moral & Intellectual Mastery", detail: "Applying diligence and Christian excellence to academic growth." }
  ];

  return {
    matching: {
      title: `${topic.title}: Concept Matching Activity`,
      instruction: base.matching?.instruction || "Drag each term from the left onto its matching definition on the right, or click a card on each side to pair them!",
      pairs: matchingPairs.length >= 4 ? matchingPairs : generateSubjectPairs(subject, grade, topic)
    },
    video: {
      title: base.video?.title || `Educational Exploration: ${topic.title}`,
      videoUrl: base.video?.videoUrl || getDefaultVideoUrlForSubject(subject),
      source: base.video?.source || "Curriculum Educational Studio",
      duration: base.video?.duration || "4:30",
      summary: base.video?.summary || `Watch this curated lesson on ${topic.title} in Grade ${grade}. Learn fundamental definitions, clear diagrams, and real-world examples explained with clarity.`,
      takeaways,
      comprehensionQuestion: base.video?.comprehensionQuestion || {
        question: `What is the most crucial skill developed while studying ${topic.title}?`,
        options: ["Step-by-step analytical reasoning", "Rushing through questions", "Guessing without reading", "Skipping difficult concepts"],
        correctAnswer: "Step-by-step analytical reasoning",
        explanation: "True academic mastery comes from patient, step-by-step reasoning and deep conceptual understanding."
      }
    },
    shortQuiz: {
      title: `${topic.title}: Rapid Knowledge Check`,
      description: "Answer these interactive check questions to solidify your learning.",
      questions: base.shortQuiz?.questions && base.shortQuiz.questions.length > 0 
        ? base.shortQuiz.questions 
        : generateSubjectQuestions(subject, grade, topic)
    },
    creativePrompt: base.creativePrompt || {
      mission: `Create an interactive mind-map or poster summarizing the key principles of ${topic.title}.`,
      guidingQuestions: [
        `What are the 3 most important facts you learned in ${topic.title}?`,
        `How does this knowledge help you serve others or glorify God?`
      ],
      starterIdea: `Share your summary with a parent or teacher to demonstrate your Grade ${grade} mastery!`
    }
  };
}

function generateProceduralContent(subject: Subject, grade: number, topic: Topic): LessonInteractiveContent {
  return {
    matching: {
      title: `${topic.title}: Interactive Matching Challenge`,
      instruction: "Connect each key concept with its accurate definition or explanation.",
      pairs: generateSubjectPairs(subject, grade, topic)
    },
    video: {
      title: `Educational Video: ${topic.title}`,
      videoUrl: getDefaultVideoUrlForSubject(subject),
      source: `${subject} Academy for Scholars`,
      duration: "4:30",
      summary: `Watch this engaging visual introduction to ${topic.title} for Grade ${grade}. Gain insights into core definitions, illustrated examples, and practical real-world applications.`,
      takeaways: [
        { timestamp: "0:30", label: "Core Foundations", detail: `Discover how ${topic.title} fits into the ${subject} curriculum.` },
        { timestamp: "1:45", label: "Worked Example", detail: "Step-by-step breakdown showing how to solve problems and understand concepts." },
        { timestamp: "3:15", label: "Key Conclusion", detail: "Summarizing the central takeaway for student mastery." }
      ],
      comprehensionQuestion: {
        question: `In studying ${topic.title}, what principle ensures highest retention?`,
        options: ["Active practice and reflection", "Passive memorization only", "Ignoring explanations", "Skipping review"],
        correctAnswer: "Active practice and reflection",
        explanation: "Active practice, solving exercises, and discussing what you learned cements knowledge in long-term memory."
      }
    },
    shortQuiz: {
      title: `${topic.title} Quick Knowledge Check`,
      description: "Interactive check questions with immediate answers and feedback.",
      questions: generateSubjectQuestions(subject, grade, topic)
    },
    creativePrompt: {
      mission: `Design an explanatory diagram or written synthesis of ${topic.title}.`,
      guidingQuestions: [
        "What are the main principles you discovered today?",
        "How can you explain this topic to someone younger than you?"
      ],
      starterIdea: "Use clear titles, bullet points, and an encouraging moral reflection."
    }
  };
}

function generateSubjectPairs(subject: Subject, grade: number, topic: Topic): MatchingPair[] {
  switch (subject) {
    case 'Alphabet':
      return [
        { id: 'alp-1', term: 'Vowel', match: 'Letters A, E, I, O, U that make open vocal sounds', hint: 'Every English word has at least one vowel' },
        { id: 'alp-2', term: 'Consonant', match: 'All 21 letters of the alphabet that are not vowels', hint: 'Examples: B, C, D, F, G, M, P, T' },
        { id: 'alp-3', term: 'Phoneme', match: 'The smallest individual unit of sound in spoken language', hint: 'The /k/ sound in cat' },
        { id: 'alp-4', term: 'Letter Blending', match: 'Combining two or more letter sounds together smoothly to read a word', hint: 'b + a + t = bat' },
        { id: 'alp-5', term: 'Capital Letter', match: 'Uppercase letter used at the start of sentences and names of people or God', hint: 'A, B, C' }
      ];

    case 'Math':
      return [
        { id: 'm-p1', term: 'Sum', match: 'The total result obtained by adding two or more numbers together', hint: '3 + 5 = 8 (8 is the sum)' },
        { id: 'm-p2', term: 'Difference', match: 'The quantity by which one number is greater or less than another in subtraction', hint: '10 - 4 = 6 (6 is the difference)' },
        { id: 'm-p3', term: 'Product', match: 'The result of multiplying numbers together', hint: '6 × 7 = 42' },
        { id: 'm-p4', term: 'Quotient', match: 'The answer produced by dividing one quantity by another', hint: '20 ÷ 4 = 5' },
        { id: 'm-p5', term: 'Variable', match: 'A symbol or letter representing an unknown quantity in an expression', hint: 'x, y, or n in algebra' }
      ];

    case 'Science':
      return [
        { id: 's-p1', term: 'Hypothesis', match: 'An educated, testable prediction formulated before conducting an experiment', hint: 'An if-then statement' },
        { id: 's-p2', term: 'Photosynthesis', match: 'The biochemical process by which plants use sunlight to produce glucose and oxygen', hint: 'Water + Sunlight + CO2' },
        { id: 's-p3', term: 'Gravity', match: 'The fundamental force of attraction pulling objects toward the center of mass', hint: 'Keeps planets in orbit' },
        { id: 's-p4', term: 'Ecosystem', match: 'A biological community of interacting organisms and their physical environment', hint: 'Living and non-living components' },
        { id: 's-p5', term: 'Condensation', match: 'The physical change of gas vapor cooling and transforming into liquid water', hint: 'Forms clouds in the sky' }
      ];

    case 'Social Studies':
      return [
        { id: 'ss-p1', term: 'Citizenship', match: 'The legal status, rights, duties, and responsibilities of belonging to a nation', hint: 'Voting, obeying laws, civic service' },
        { id: 'ss-p2', term: 'Constitution', match: 'The supreme fundamental law establishing the framework of government and rights', hint: 'The highest legal document' },
        { id: 'ss-p3', term: 'Democracy', match: 'Government by the people, exercised either directly or through elected representatives', hint: 'Of the people, by the people, for the people' },
        { id: 'ss-p4', term: 'Heritage', match: 'Traditions, culture, achievements, and beliefs inherited from past generations', hint: 'African languages, art, and values' },
        { id: 'ss-p5', term: 'Topography', match: 'The physical arrangement of natural and artificial surface features of an area', hint: 'Mountains, rivers, valleys' }
      ];

    case 'Bible Study':
      return [
        { id: 'bs-p1', term: 'Faith', match: 'Confidence in what we hope for and assurance about what we do not see (Hebrews 11:1)', hint: 'Trusting God completely' },
        { id: 'bs-p2', term: 'Grace', match: 'God\'s unmerited, undeserved favor, forgiveness, and love through Jesus Christ', hint: 'Ephesians 2:8-9' },
        { id: 'bs-p3', term: 'Righteousness', match: 'Moral purity, upright conduct, and being in right standing before God', hint: 'Following God\'s holy will' },
        { id: 'bs-p4', term: 'Covenant', match: 'A sacred, solemn promise and binding agreement established by God with His people', hint: 'Noah, Abraham, New Covenant' },
        { id: 'bs-p5', term: 'Gospel', match: 'The Good News of salvation, redemption, and eternal life in Christ Jesus', hint: 'Matthew, Mark, Luke, John' }
      ];

    case 'Literature':
      return [
        { id: 'lit-p1', term: 'Theme', match: 'The underlying moral message, central insight, or universal truth of a literary work', hint: 'E.g., love, courage, forgiveness' },
        { id: 'lit-p2', term: 'Protagonist', match: 'The main character around whom the central narrative or conflict revolves', hint: 'The hero or central figure' },
        { id: 'lit-p3', term: 'Metaphor', match: 'A direct figure of speech comparing two unlike things without using "like" or "as"', hint: '"The Lord is my shepherd"' },
        { id: 'lit-p4', term: 'Allegory', match: 'A story with a hidden deeper meaning, where characters represent spiritual truths', hint: 'E.g., The Pilgrim\'s Progress' },
        { id: 'lit-p5', term: 'Conflict', match: 'The primary struggle between opposing forces that drives the narrative plot forward', hint: 'Internal or external struggle' }
      ];

    case 'Spelling':
      return [
        { id: 'sp-p1', term: 'Prefix', match: 'An affix attached to the beginning of a root word to alter its meaning', hint: 'un-, re-, pre-, dis-' },
        { id: 'sp-p2', term: 'Suffix', match: 'A morpheme added at the end of a word to form a derivative or indicate tense', hint: '-ful, -ly, -ment, -tion' },
        { id: 'sp-p3', term: 'Homophone', match: 'Words having the exact same sound but differing in spelling and meaning', hint: 'there / their / they\'re' },
        { id: 'sp-p4', term: 'Compound Word', match: 'A single word created by joining two complete independent words together', hint: 'sunlight, notebook, lighthouse' },
        { id: 'sp-p5', term: 'Root Word', match: 'The foundational base part of a word containing its core semantic meaning', hint: 'bio, graph, tele, tract' }
      ];

    case 'Biology':
      return [
        { id: 'b-p1', term: 'Homeostasis', match: 'The maintenance of a stable internal physiological state despite external fluctuations', hint: 'Thermoregulation, pH balance' },
        { id: 'b-p2', term: 'Genotype', match: 'The complete genetic makeup and allele combination of an individual organism', hint: 'Homozygous or heterozygous' },
        { id: 'b-p3', term: 'Phenotype', match: 'The observable physical, biochemical, and behavioral traits of an organism', hint: 'Eye color, height, blood group' },
        { id: 'b-p4', term: 'Osmosis', match: 'The spontaneous net movement of water molecules through a semipermeable membrane', hint: 'From low solute to high solute concentration' },
        { id: 'b-p5', term: 'Enzyme', match: 'A biological catalyst (usually a globular protein) accelerating biochemical reaction rates', hint: 'Lowers activation energy' }
      ];

    case 'Etymology':
      return [
        { id: 'e-p1', term: 'Etymon', match: 'The primitive or ancestral word from which a modern derivative develops', hint: 'The historical source word' },
        { id: 'e-p2', term: 'Cognate', match: 'Words in different languages descending from a common ancestral parent tongue', hint: 'Night (Eng), Noche (Span), Nacht (Ger)' },
        { id: 'e-p3', term: 'Loanword', match: 'A term directly adopted from another language with little or no modification', hint: 'Bazaar, safari, kindergarten' },
        { id: 'e-p4', term: 'Portmanteau', match: 'A blended word formed by merging the sounds and meanings of two distinct words', hint: 'Smog (smoke + fog), Brunch' },
        { id: 'e-p5', term: 'Eponym', match: 'A word derived from the proper name of a real person or mythical character', hint: 'Volt (Volta), Sandwich, Atlas' }
      ];

    default:
      return [
        { id: 'def-1', term: 'Core Concept', match: `The foundational principle that anchors this lesson in ${subject}`, hint: 'Key understanding' },
        { id: 'def-2', term: 'Application', match: 'Putting theoretical knowledge into real-world action and problem solving', hint: 'Practice' },
        { id: 'def-3', term: 'Analysis', match: 'Breaking down a complex topic into smaller parts to understand how they connect', hint: 'Investigation' },
        { id: 'def-4', term: 'Synthesis', match: 'Combining different ideas into a cohesive, original understanding', hint: 'Creation' },
        { id: 'def-5', term: 'Mastery', match: 'Demonstrating consistent accuracy, speed, and confidence in the subject', hint: 'Excellence' }
      ];
  }
}

function generateSubjectQuestions(subject: Subject, grade: number, topic: Topic): ShortQuizQuestion[] {
  return [
    {
      id: 1,
      question: `What is the central focus of ${topic.title} in Grade ${grade}?`,
      options: [
        `Building step-by-step understanding of ${subject}`,
        "Rushing ahead without reading instructions",
        "Memorizing words without knowing their meaning",
        "Avoiding practice exercises"
      ],
      correctAnswer: `Building step-by-step understanding of ${subject}`,
      explanation: "Mastery begins with patient, clear study of foundational principles.",
      moralTakeaway: "Proverbs 4:7: 'Wisdom is the principal thing; therefore get wisdom. And in all your getting, get understanding.'"
    },
    {
      id: 2,
      question: "Which habit is most helpful when solving complex problems in this topic?",
      options: [
        "Breaking the problem into smaller, manageable steps",
        "Giving up if the answer isn't immediately obvious",
        "Skipping the explanation notes",
        "Guessing the first option"
      ],
      correctAnswer: "Breaking the problem into smaller, manageable steps",
      explanation: "Deconstructing problems systematically eliminates confusion and builds confidence.",
      moralTakeaway: "Diligence and perseverance always produce sweet fruit in the classroom and in life."
    },
    {
      id: 3,
      question: `How does mastering ${topic.title} reflect Christian character?`,
      options: [
        "It demonstrates diligence, honesty, and stewardship of our God-given minds",
        "It allows us to boast over other classmates",
        "It proves we never need to ask questions again",
        "It is only about getting high marks"
      ],
      correctAnswer: "It demonstrates diligence, honesty, and stewardship of our God-given minds",
      explanation: "Colossians 3:23 reminds us: 'Whatever you do, work at it with all your heart, as working for the Lord, not for human masters.'",
      moralTakeaway: "God is honored when we do our schoolwork with excellence and integrity."
    }
  ];
}

function getDefaultVideoUrlForSubject(subject: Subject): string {
  switch (subject) {
    case 'Math':
      return "https://www.youtube-nocookie.com/embed/a4FXl4zb3E4";
    case 'Science':
      return "https://www.youtube-nocookie.com/embed/KOUV7mW49Co";
    case 'English':
      return "https://www.youtube-nocookie.com/embed/n35p8oF4N4M";
    case 'Social Studies':
      return "https://www.youtube-nocookie.com/embed/8w1bJv_21mI";
    case 'Bible Study':
      return "https://www.youtube-nocookie.com/embed/KOUV7mW49Co";
    case 'Literature':
      return "https://www.youtube-nocookie.com/embed/8s_GkZtVl20";
    case 'Alphabet':
      return "https://www.youtube-nocookie.com/embed/ffeZXPtTGC4";
    case 'Biology':
      return "https://www.youtube-nocookie.com/embed/8IlzKri08kk";
    case 'Etymology':
      return "https://www.youtube-nocookie.com/embed/tW3k_b8I3l4";
    default:
      return "https://www.youtube-nocookie.com/embed/ncORPosDrjI";
  }
}
