import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Topic, WorksheetProgress, User } from '../types';
import { cn } from '../lib/utils';

interface Exercise {
  id: number;
  question: string;
  type: 'multiple-choice' | 'short-answer';
  options?: string[];
  correctAnswer?: string;
}

export default function WorksheetView({ 
  topic,
  savedProgress,
  onSave,
  subject,
  grade,
  user
}: { 
  topic: Topic;
  savedProgress?: WorksheetProgress;
  onSave: (progress: WorksheetProgress) => void;
  subject?: string;
  grade?: number;
  user: User;
}) {
  const [answers, setAnswers] = useState<Record<number, string>>(savedProgress?.answers || {});
  const [reflection, setReflection] = useState(savedProgress?.reflection || '');
  const [showResults, setShowResults] = useState(savedProgress?.isCompleted || false);
  const [showOnboarding, setShowOnboarding] = useState(user.isBeginner && (user.loginMethod === 'Google' || user.loginMethod === 'ClassLink'));
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [currentPage, setCurrentPage] = useState(0);
  const [expandedExplanations, setExpandedExplanations] = useState<Record<number, boolean>>({});

  const isSpelling = subject === 'Spelling';

  // Sync state with incoming savedProgress when the topic changes or when savedProgress changes
  useEffect(() => {
    const savedAnswersJson = JSON.stringify(savedProgress?.answers || {});
    const currentAnswersJson = JSON.stringify(answers);
    const savedReflection = savedProgress?.reflection || '';
    const savedCompleted = savedProgress?.isCompleted || false;

    if (savedAnswersJson !== currentAnswersJson) {
      setAnswers(savedProgress?.answers || {});
    }
    if (savedReflection !== reflection) {
      setReflection(savedReflection);
    }
    if (savedCompleted !== showResults) {
      setShowResults(savedCompleted);
    }
    if (!savedProgress) {
      setCurrentPage(0);
    }
  }, [savedProgress?.topicId, savedProgress?.answers, savedProgress?.reflection, savedProgress?.isCompleted]);

  // Debounced auto-save of current work
  useEffect(() => {
    if (showResults) return; // Do not auto-save after submission

    const hasAnswers = Object.keys(answers).length > 0;
    const hasReflection = reflection.trim().length > 0;
    if (!hasAnswers && !hasReflection) return;

    const timer = setTimeout(() => {
      onSave({
        topicId: topic.id,
        answers,
        reflection,
        isCompleted: false
      });
    }, 1500); // 1.5 seconds of inactivity auto-saves to parent and localStorage

    return () => clearTimeout(timer);
  }, [answers, reflection, showResults]);

  useEffect(() => {
    if (saveStatus === 'saved') {
      const timer = setTimeout(() => setSaveStatus('idle'), 2000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  const handleSave = () => {
    setSaveStatus('saving');
    onSave({
      topicId: topic.id,
      answers,
      reflection,
      isCompleted: showResults,
      score: showResults ? score : undefined
    });
    setSaveStatus('saved');
  };

  // Generate 20 pages for Spelling, or fallback to standard exercises
  const generateExercises = (): Exercise[] => {
    if (isSpelling) {
      const g = grade || 1;
      let prompt = '';
      if (g <= 3) {
        // Grades 1-3: Simple words with meaning
        prompt = `Write a simple word from this lesson. (Meaning provided: This word relates to ${topic.title})`;
      } else if (g <= 7) {
        // Grades 4-7: Bit complex words with dictionary instruction and hints
        prompt = `Write a bit complex word from this lesson. **Please use your dictionary to look it up!** Hint: It represents an action or object within the ${topic.title} context.`;
      } else {
        // Grades 8-10: Academic words with full definitions
        prompt = `Write an academic vocabulary word from this lesson. Provide its precise dictionary definition, etymology, and use it in a complex sentence.`;
      }

      return Array.from({ length: 20 }).map((_, i) => ({
        id: i + 1,
        question: `Page ${i + 1}: ${prompt}`,
        type: 'short-answer'
      }));
    }

    const g = grade || 1;
    const cleanSubject = (subject || '').trim();

    if (cleanSubject === 'Math') {
      if (g >= 7) {
        return [
          {
            id: 1,
            question: `Practical Money & Math Challenge for ${topic.title}: A vendor sells premium workbook sets in Lagos. If one set costs ₦4,500 and a geometry pack costs ₦3,500, what is the total cost? Write your final calculated answer in the blank: ₦_______`,
            type: 'short-answer'
          },
          {
            id: 2,
            question: `Algebraic Logic Question for ${topic.title}: If a variable expression is given as (3x + y) / 2, where x = 12 and y = 4 representing relationships in our lesson, what is the correct value?`,
            type: 'multiple-choice',
            options: ['20', '16', '12', '24'],
            correctAnswer: '20'
          },
          {
            id: 3,
            question: `Measurement & Geometry Worksheet Blank: Let's calculate the surface size for ${topic.title}. If a rectangular study desk has a length of 8 meters and a width of 5 meters, what is its total surface area? Write your answer in the blank: _______ square meters`,
            type: 'short-answer'
          },
          {
            id: 4,
            question: `Real-life Multi-step Problem: How can we apply the calculation structures of "${topic.title}" to coordinate planning for a school budget with ₦25,000 in total funds? Explain your steps below:`,
            type: 'short-answer'
          }
        ];
      } else {
        return [
          {
            id: 1,
            question: `Practical Money & Math Challenge for ${topic.title}: A vendor sells workbook sets in Lagos. If one set costs ₦1,500 and a pencil pack costs ₦500, what is the total cost? Write your final calculated answer in the blank: ₦_______`,
            type: 'short-answer'
          },
          {
            id: 2,
            question: `Arithmetic Operations for ${topic.title}: If you multiply 12 by 4 and then divide the result by 2, what is the correct value?`,
            type: 'multiple-choice',
            options: ['24', '16', '12', '48'],
            correctAnswer: '24'
          },
          {
            id: 3,
            question: `Measurement & Perimeter Worksheet Blank: Let's calculate the perimeter for ${topic.title}. If a study desk has a length of 8 meters and a width of 5 meters, what is its total perimeter (2 times length + 2 times width)? Write your answer in the blank: _______ meters`,
            type: 'short-answer'
          },
          {
            id: 4,
            question: `Real-life Multi-step Problem: If a student has ₦2,000 to buy notebooks that cost ₦400 each, how many notebooks can they buy in total? Explain your steps below:`,
            type: 'short-answer'
          }
        ];
      }
    }

    if (cleanSubject === 'English') {
      return [
        {
          id: 1,
          question: `Grammar & Sentence Worksheet Blank: Complete the sentence with the correct form of the verb: 'The brilliant scholars _______ (has read / have read) all their reading assignments before class started.'`,
          type: 'short-answer'
        },
        {
          id: 2,
          question: `Word Recognition & Parts of Speech: In the sentence 'Miss Kelechi's ENTHUSIASTIC teaching guides us perfectly', what part of speech is the word in capitalized letters?`,
          type: 'multiple-choice',
          options: ['Noun', 'Verb', 'Adjective', 'Adverb'],
          correctAnswer: 'Adjective'
        },
        {
          id: 3,
          question: `Preposition Worksheet Blank: Choose the appropriate preposition to fill the blank: 'Our school textbooks are located _______ the top shelf of the library classroom.' (on / under / behind / with)`,
          type: 'short-answer'
        },
        {
          id: 4,
          question: `Writing Expression & Grammar Logic: Under the theme of "${topic.title}", write three beautiful sentences describing how reading opens up new horizons. Use at least one adjective and one adverb in your response:`,
          type: 'short-answer'
        }
      ];
    }

    if (cleanSubject === 'Science') {
      return [
        {
          id: 1,
          question: `Matter & Elements Worksheet: Green plants require sunlight to live. What gas do plants take in from the air to perform photosynthesis? Fill in the blank: Plants use sunlight, water, and _______ gas to make food.`,
          type: 'short-answer'
        },
        {
          id: 2,
          question: `Observation Question on "${topic.title}": Which state of matter has a definite volume but takes the exact shape of whatever container you pour it into?`,
          type: 'multiple-choice',
          options: ['Solid', 'Liquid', 'Gas', 'Plasma'],
          correctAnswer: 'Liquid'
        },
        {
          id: 3,
          question: `Scientific Fact Blank: What pull keeps our feet on the ground and attracts objects to the Earth's center? Complete this statement: The force of gravity pulls all apple falls towards the _______.`,
          type: 'short-answer'
        },
        {
          id: 4,
          question: `Inquiry & Adaptation: In your own words, explain how the scientific concepts of "${topic.title}" help humans design cleaner energy systems or protect nature:`,
          type: 'short-answer'
        }
      ];
    }

    if (cleanSubject === 'Social Studies') {
      return [
        {
          id: 1,
          question: `History & Citations Worksheet: Our nation has a rich timeline of leaders and landmarks. Write the year Nigeria achieved its full independence in this blank: October 1, _______`,
          type: 'short-answer'
        },
        {
          id: 2,
          question: `Civics & Landmarks on "${topic.title}": Which Nigerian city is famous for being the historic birthplace of the confluence where the River Niger and River Benue meet?`,
          type: 'multiple-choice',
          options: ['Lagos', 'Lokoja', 'Abuja', 'Enugu'],
          correctAnswer: 'Lokoja'
        },
        {
          id: 3,
          question: `Heritage & Ancient African Kingdoms: Complete this historic statement: The ancient African civilization known for beautiful brass carvings and the legendary Oba palace is the _______ Kingdom.`,
          type: 'short-answer'
        },
        {
          id: 4,
          question: `Leadership Reflection: How can we use the courageous lessons from our African heroes studied in "${topic.title}" to build a peaceable, progressive society today?`,
          type: 'short-answer'
        }
      ];
    }

    if (cleanSubject === 'Literature') {
      if (g === 2) {
        return [
          {
            id: 1,
            question: `The Art of Reading - "The Cat in the Hat" by Dr. Seuss: Complete the blank with the correct names of the playful characters in red suits: The Cat brings out Thing _______ and Thing _______.`,
            type: 'short-answer'
          },
          {
            id: 2,
            question: `Who watches the Cat play inside the house on that cold, wet day and tells him he must go away because Mother is not home?`,
            type: 'multiple-choice',
            options: ['The Fish', 'Sally', 'The Dog', 'The Toy'],
            correctAnswer: 'The Fish'
          },
          {
            id: 3,
            question: `The Cat plays a balancing game called UP-UP-UP. Fill in the blank: He balances a cup, a cake, and a book on top of his _______!`,
            type: 'short-answer'
          },
          {
            id: 4,
            question: `Reading Comprehension Moral: When Mother comes back home, she asks what they did. Explain what of the "art of reading" tells us about honesty. Should the children tell their mother?`,
            type: 'short-answer'
          }
        ];
      } else if (g === 3) {
        return [
          {
            id: 1,
            question: `The Art of Reading - "Animal Farm" by George Orwell: What is the name of the strong, hard-working cartoon horse whose noble motto is 'I will work harder'? Fill in the blank: _______`,
            type: 'short-answer'
          },
          {
            id: 2,
            question: `Which clever but power-hungry pig takes complete control of the farm and alters the original seven animal rules?`,
            type: 'multiple-choice',
            options: ['Snowball', 'Squealer', 'Napoleon', 'Old Major'],
            correctAnswer: 'Napoleon'
          },
          {
            id: 3,
            question: `Political Allegory check: Fill in the blank with the modified rule: 'All animals are equal, but some animals are more _______ than others.'`,
            type: 'short-answer'
          },
          {
            id: 4,
            question: `Literary Synthesis: Animal Farm is a famous allegory of historical power shifts. Explain how the changing commandments relate to the theme of "${topic.title}":`,
            type: 'short-answer'
          }
        ];
      } else if (g === 4) {
        return [
          {
            id: 1,
            question: `The Art of Reading - "The Famous Five" by Enid Blyton: What is the name of the brave, loyal dog who protects the children on all their holiday adventures? Fill in the blank: _______`,
            type: 'short-answer'
          },
          {
            id: 2,
            question: `Which of the children loves dressing in active clothes, hates being called Georgina, and insists on going by a boy's name?`,
            type: 'multiple-choice',
            options: ['Julian', 'Anne', 'Dick', 'George'],
            correctAnswer: 'George'
          },
          {
            id: 3,
            question: `Adventure Settings: Complete this landmark sentence: The Famous Five children spend their holidays exploring caves on Kirrin _______!`,
            type: 'short-answer'
          },
          {
            id: 4,
            question: `Comprehension Analysis: Write down how the Famous Five use cooperation and loyalty to solve mysteries in Blyton's adventure world:`,
            type: 'short-answer'
          }
        ];
      } else if (g === 5) {
        return [
          {
            id: 1,
            question: `The Art of Reading - "The Chronicles of Narnia" by C.S. Lewis: What is the name of the sweet-hearted youngest child who is the first to step into the snowy world of Narnia? Fill in the blank: _______`,
            type: 'short-answer'
          },
          {
            id: 2,
            question: `Who is the glorious, golden lion creator who represents hope, kindness, and eternal truth in Narnia?`,
            type: 'multiple-choice',
            options: ['Aslan', 'Edmund', 'Tumnus', 'Caspian'],
            correctAnswer: 'Aslan'
          },
          {
            id: 3,
            question: `Entrance into fantasy: Complete the blank expressing the art of reading: To enter Narnia, the kids must crawl through a large wooden _______.`,
            type: 'short-answer'
          },
          {
            id: 4,
            question: `Moral Analysis: Why does Edmund get lured by the White Witch's Turkish Delight, and what does this teach us about greed in "${topic.title}"?`,
            type: 'short-answer'
          }
        ];
      } else if (g === 6) {
        return [
          {
            id: 1,
            question: `The Art of Reading - "The Pilgrim's Progress" by John Bunyan: What is the name of the pilgrim who goes on a long journey to get rid of his huge burden? Fill in the blank: _______`,
            type: 'short-answer'
          },
          {
            id: 2,
            question: `What represents Christian's burden on his back in this famous spiritual allegory?`,
            type: 'multiple-choice',
            options: ['A sack of stones', 'His burden of sin and struggle', 'A bag of golden coins', 'An old heavy shield'],
            correctAnswer: 'His burden of sin and struggle'
          },
          {
            id: 3,
            question: `Pilgrim Milestones: Complete the blank: Christian walks carefully along the straight path leading all the way to the beautiful _______ City.`,
            type: 'short-answer'
          },
          {
            id: 4,
            question: `Allegorical Deconstruction: Describe what Christian's journey teaches us about overcoming the 'Slough of Despond' or self-doubt:`,
            type: 'short-answer'
          }
        ];
      } else if (g === 7) {
        return [
          {
            id: 1,
            question: `The Art of Reading - "Ben Carson" (Gifted Hands / Think Big): What world-renowned scientific profession did Ben Carson grow up to specialize in? Fill in the blank: A famous _______`,
            type: 'short-answer'
          },
          {
            id: 2,
            question: `What strict rule did Ben Carson's mother, Sonya Carson, implement to help her young boys succeed academically?`,
            type: 'multiple-choice',
            options: [
              'She made them do farm labor',
              'She limited television and made them read two library books weekly with written reports',
              'She hired four expensive tutors from Europe',
              'She made them work in a hospital'
            ],
            correctAnswer: 'She limited television and made them read two library books weekly with written reports'
          },
          {
            id: 3,
            question: `Medical Milestones: Complete the blank: Ben Carson achieved historical fame for operating on conjoined _______ twins at the head.`,
            type: 'short-answer'
          },
          {
            id: 4,
            question: `Carson "THINK BIG" philosophy: Explain in your own words how reading books transformed Carson from a bottom-of-class student to a genius surgeon:`,
            type: 'short-answer'
          }
        ];
      } else {
        // Grades 8-10 Literature - Christian Books
        return [
          {
            id: 1,
            question: `The Art of Reading - Christian Literature ("The Purpose Driven Life" by Rick Warren / "In His Steps" by Charles Sheldon): What is the first line of the first chapter of 'The Purpose Driven Life'? Fill in the blank: 'It is not about _______.'`,
            type: 'short-answer'
          },
          {
            id: 2,
            question: `In Charles Sheldon's famous book, 'In His Steps', what is the central, dramatic pledge that parishioners take before making any daily choice?`,
            type: 'multiple-choice',
            options: ['What would Jesus do?', 'How can I double my income?', 'Where is the easiest path?', 'What will others think of me?'],
            correctAnswer: 'What would Jesus do?'
          },
          {
            id: 3,
            question: `Character Development Blank: Complete this moral thought: In Christian literature, aligning our daily steps with service to God teaches us that we are created for a divine _______ on earth.`,
            type: 'short-answer'
          },
          {
            id: 4,
            question: `In His Steps Essay Analysis: How should a modern student implement the ethical question of Sheldon's book inside their academic, family, and community circles? Write your reflection below:`,
            type: 'short-answer'
          }
        ];
      }
    }

    if (cleanSubject === 'Bible Study') {
      return [
        {
          id: 1,
          question: `Biblical Foundations: In the beginning, God created the heavens and the earth. How many total days did God take to create all things before resting? Write your answer in the blank: _______ days`,
          type: 'short-answer'
        },
        {
          id: 2,
          question: `Who was instructed by God to construct the massive wooden Ark that saved his immediate family and multiple animal species from the heavy flood of rain?`,
          type: 'multiple-choice',
          options: ['Abraham', 'Moses', 'Noah', 'Daniel'],
          correctAnswer: 'Noah'
        },
        {
          id: 3,
          question: `Scripture Blank Exercise: Fill in the missing word from Psalm 23:1: 'The Lord is my _______; I shall not want.'`,
          type: 'short-answer'
        },
        {
          id: 4,
          question: `Parable Application: How can we use the Parable of the Good Samaritan studied in "${topic.title}" to show neighborly kindness and supportive charity inside our communities?`,
          type: 'short-answer'
        }
      ];
    }

    if (cleanSubject === 'Alphabet') {
      return [
        {
          id: 1,
          question: `Alphabet Basics: Fill in the missing capital letter that sits directly in the alphabet between 'B' and 'D': _______`,
          type: 'short-answer'
        },
        {
          id: 2,
          question: `Vowel identification: Which of the following letters is recognized as a primary vocal vowel in English spelling?`,
          type: 'multiple-choice',
          options: ['B', 'P', 'E', 'M'],
          correctAnswer: 'E'
        },
        {
          id: 3,
          question: `Short sounds spelling blank: Complete the three-letter word for a tiny pet that meows: C A _______`,
          type: 'short-answer'
        },
        {
          id: 4,
          question: `Pronunciation and phonetics: Say the short sound of the letter 'A' as in 'Apple'. Write two other simple words that start with this same short 'A' sound below:`,
          type: 'short-answer'
        }
      ];
    }

    // Fallback exercises
    return [
      {
        id: 1,
        question: grade >= 8 
          ? `Deconstruct the foundational axioms of ${topic.title}. What are the primary logical inconsistencies or complex interdependencies inherent in this field?`
          : `What is the primary focus of ${topic.title}?`,
        type: 'multiple-choice',
        options: grade >= 8 
          ? ['Systemic Interconnectivity', 'Axiomatic Pluralism', 'Dialectical Synthesis', 'Empirical Reductivism']
          : ['The Basics', 'Key Concepts', 'History', 'Applications'],
        correctAnswer: grade >= 8 ? 'Systemic Interconnectivity' : 'Key Concepts'
      },
      {
        id: 2,
        question: grade >= 8
          ? `Provide a comparative analysis of ${topic.title} relative to contemporary theoretical frameworks. How does it withstand rigorous academic scrutiny in a modern context?`
          : `In your own words, explain the most important concept in ${topic.title}.`,
        type: 'short-answer'
      },
      {
        id: 3,
        question: grade >= 8
          ? `True or False: The heuristic application of ${topic.title} inevitably leads to a paradigm shift in socio-cultural dynamics.`
          : `True or False: ${topic.title} is a core part of the British Curriculum.`,
        type: 'multiple-choice',
        options: ['True', 'False'],
        correctAnswer: 'True'
      },
      {
        id: 4,
        question: grade >= 8
          ? `Synthesize a novel application for ${topic.title} that addresses a multi-dimensional global challenge. Detail the potential second-order effects.`
          : `How would you apply ${topic.title} in a real-life situation?`,
        type: 'short-answer'
      }
    ];
  };

  const getExplanationContent = (ex: Exercise): string => {
    const qText = ex.question.toLowerCase();
    
    if (isSpelling) {
      if ((grade || 1) === 1) {
        return `This exercise is designed to help you practice spelling letters and phonics! Sound out the word slowly. Notice the letters that make up the start, middle, and end sounds. Repeat the sounds to yourself and type the letters on the screen.`;
      }
      return `For older students, spelling requires understanding the word in a complete reading context. We want you to copy the spelling list words and write out complete, beautifully constructed sentences using those words. Ensure you capitalize the start of your sentences and add ending punctuation like a period.`;
    }

    if (qText.includes('₦4,500') || qText.includes('₦3,500') || qText.includes(' lagos.')) {
      return `To find the total cost of two things sold together, we use addition (combining values). Imagine a vendor in Lagos is selling a workbook for ₦4,500 and a geometry pack for ₦3,500. Underneath, think: "How much do both cost together?". You should carry out the operation of combining: 4,500 + 3,500. Add the thousands, hundreds, and tens carefully!`;
    }
    if (qText.includes('₦1,500') || qText.includes('₦500')) {
      return `To find the total cost, we add the two amounts together! Imagine a vendor in Lagos selling a workbook for ₦1,500 and a pencil pack for ₦500. If you buy both, add ₦1,500 + ₦500. What is 1,500 plus 500? Write your chemical/arithmetic sum in the blank!`;
    }
    if (qText.includes('(3x + y)') || qText.includes('x = 12')) {
      return `This is a substitution problem in algebra! Here is how to approach it step-by-step:
1. Replace 'x' with the number 12, so '3x' becomes 3 times 12.
2. Replace 'y' with the number 4.
3. Multiply first (3 times 12), then add the value of y (which is 4) to that result.
4. Finally, take that sum and divide the entire thing by 2.
Remember to follow the order of mathematical operations!`;
    }
    if (qText.includes('multiply 12 by 4 and then divide')) {
      return `This is a standard multi-step arithmetic problem! Follow these steps:
1. First, carry out the multiplication: 12 times 4.
2. Second, take that multiplication result and divide it exactly by 2.
What is half of that multiplied number? Select the correct option from the choices!`;
    }
    if (qText.includes('surface size') || qText.includes('rectangular study desk')) {
      return `To calculate the surface area of a rectangular object like a desk, we use the formula: Area = Length × Width. Imagine a flat grid floor that is 8 meters long and 5 meters wide. To find the total space inside this rectangle, multiply the length of 8 meters by the width of 5 meters. What do you get when you multiply those two numbers?`;
    }
    if (qText.includes('perimeter for') || qText.includes('total perimeter (2 times length')) {
      return `To calculate the perimeter (the total boundary line around the outside), we add up all the four sides of the desk!
The formula matches: Perimeter = 2 × (Length + Width).
First, add the length (8) and width (5) together. Then, multiply that answer by 2 to find the total meters around the desk.`;
    }
    if (qText.includes('budget with ₦25,000')) {
      return `Planning a school budget is about distributing your funds wisely. Think about how you would divide ₦25,000. You need to outline steps:
- First, list all the necessary school categories (e.g., writing tools, books, desk supplies).
- Second, decide how much money goes into each category.
- Third, check that the sum of all categories does not exceed your total spending limit of ₦25,000. 
Explain this process in your own words!`;
    }
    if (qText.includes('notebooks that cost ₦400 each')) {
      return `To find out how many notebooks you can purchase within your total budget:
1. Divide your total funds (₦2,000) by the price of a single notebook (₦400).
2. Think: how many times does 400 go into 2,000? (Hint: 20 divided by 4 gets you the same answer!).
Explain your simple steps clearly below!`;
    }

    if (qText.includes('_______ (has read / have read)')) {
      return `This touches on subject-verb agreement! 
- Singular subjects (e.g., 'The student') go with 'has read'.
- Plural subjects (e.g., 'The students' or 'The brilliant scholars') go with 'have read'.
Identify whether 'The brilliant scholars' is one person or more than one person, and choose the matching verb form!`;
    }
    if (qText.includes('enthusiastic teaching')) {
      return `Let's review our parts of speech:
- Nouns: Naming words representing objects, people, or places (e.g., 'scholars', 'teaching').
- Verbs: Action words (e.g., 'guides').
- Adverbs: Describe how actions are done (e.g., 'perfectly').
- Adjectives: Words that describe or give qualities to a noun. Since 'ENTHUSIASTIC' describes the quality of the teaching, check which of these categories fits best!`;
    }
    if (qText.includes('_______ the top shelf')) {
      return `Prepositions show us where objects are located in space! Think about the shelf. Books usually rest flat on the physical surface of a shelf. Which word describes resting on top of a flat surface: on, under, behind, or with? Choose the one that indicates surface contact.`;
    }
    if (qText.includes('three beautiful sentences describing how reading opens up new horizons')) {
      return `To write beautiful and descriptive sentences:
1. Think of how reading books lets you travel to imaginary places or learn amazing truths.
2. Use descriptive words: Add an adjective to describe a noun (like "inspiring books" or "endless pathways") and an adverb to describe an action (like "joyfully discover" or "carefully read"). Write three separate lines describing this adventure!`;
    }

    if (qText.includes('photosynthesis') || qText.includes('green plants require sunlight')) {
      return `Photosynthesis is the process green plants use to manufacture their food using light energy. During this process:
- Plants take in water from their roots and a specific air gas we exhale (breathed out by humans and animals) through tiny pores in their leaves.
- Think about what gas humans exhale that plants absorb. It starts with "Carbon...". Plants then release clean oxygen for us to breathe!`;
    }
    if (qText.includes('definite volume but takes the exact shape')) {
      return `Let's examine the three states of matter:
- Solids: Have a fixed shape and a fixed volume (like a block or a pencil).
- Liquids: Have a definite volume but no fixed shape—they flow and take the exact contour of whatever glass or jar you pour them into (like water or juice).
- Gases: Have no fixed shape and no fixed volume—they expand completely to fill their container.
Choose the correct state of matter based on these definitions!`;
    }
    if (qText.includes('pull keeps our feet') || qText.includes('force of gravity')) {
      return `Gravity is an invisible pulling force exerted by massive bodies like the Earth. This natural force pulls everything downward—towards the middle of our planet. When an apple ripens on a tree and detaches, gravity pulls it directly toward the ground. Complete the sentence by stating what physical direction or ground center the apple is drawn to.`;
    }
    if (qText.includes('energy systems or protect nature')) {
      return `Think about how scientific knowledge helps us protect our environment. For example:
- Understanding greenhouse gases allows us to design cleaner cars.
- Understanding energy conversion lets us use solar panels and wind turbines instead of burning dirty fuels.
Write down a simple explanation of how learning science helps people build a cleaner, safer world!`;
    }

    if (qText.includes('nigeria achieved its full independence')) {
      return `Nigeria gained its sovereign independence from British colonial rule on October 1st of a very famous year in the mid-20th century. Here is a hint: it is the same year many West African nations celebrated independence, and it lies exactly entry-wise between 1959 and 1961. Fill in the blank with this historic four-digit year!`;
    }
    if (qText.includes('confluence where the River Niger and River Benue meet') || qText.includes('birthplace of the confluence')) {
      return `The confluence is the geographical point where Nigeria's two largest rivers, the River Niger and the River Benue, merge into one. This historic confluence is located in a famous Nigerian city whose name starts with 'L'. It was also a highly significant base during early colonial administration. Pick the option representing this confluence city!`;
    }
    if (qText.includes('ancient african civilization') || qText.includes('legendary oba palace') || qText.includes('brass carvings')) {
      return `This question asks about a legendary historical empire in southern Nigeria famed for its sophisticated cast-bronze and brass plaques and its regal rulers (called Obas). The palace was a magnificent site of culture. This kingdom is named '_______ Kingdom', which shares its name with a modern neighboring country but was historically centered in Edo State.`;
    }
    if (qText.includes('courageous lessons from our african heroes')) {
      return `African history is filled with leaders who demonstrated immense bravery, compassion, and resilience to protect their people and foster unity. Think about how values like unity, standing up for fair treatment, and serving others can guide us at home, in our classrooms, and in our neighborhoods today.`;
    }

    if (qText.includes('the cat in the hat') || qText.includes('thing _______ and thing')) {
      return `In Dr. Seuss's "The Cat in the Hat", when the Cat brings out his big blue box, he opens it and two extremely playful characters in red jumpsuits run out to play. Their names are very simple number names—just look at their suits which label them. Fill in the blanks with those two numbers!`;
    }
    if (qText.includes('watches the cat play') || qText.includes('tells him he must go away')) {
      return `In the story, while Mother is away, there is an animal keeping watch in the house who is very worried about the rules and safety. This character is inside a small bowl of water and keeps speaking up to warn the kids. Think about what kind of pet lives in a water bowl and is very angry at the Cat's tricks!`;
    }
    if (qText.includes('balances a cup, a cake')) {
      return `In the balancing game, the Cat climbs onto a ball and balances several household tools on his body. He holds a cup, a cake, an umbrella, and some books. He even tries to balance these items on the very top of his head, right on top of his signature striped accessory! What does he wear on his head?`;
    }
    if (qText.includes('hates being called georgina') || qText.includes('famous five') || qText.includes('dressing in active clothes')) {
      return `In Enid Blyton's adventure books, one of the famous children loves wearing active clothes, cuts her hair short, refuses to answer to her feminine birth name "Georgina", and insists everyone calls her by a boy's nickname. Which of the names starting with 'G' matches this?`;
    }
    if (qText.includes('loyal dog who protects')) {
      return `The Famous Five includes four children (Julian, Dick, Anne, and George) and one very loyal, clever canine companion who accompanies them on every single mystery, sniffing out clues and guarding them. What is this brave dog's name? Hint: starts with 'T'!`;
    }
    if (qText.includes('kirrin _______')) {
      return `The children spend their holidays visiting George's family island off the coast of Dorset. This island has old castle ruins and secret caves, and it is called Kirrin _______. Complete the blank with the word that refers to a piece of land completely surrounded by water.`;
    }
    if (qText.includes('animal farm') || qText.includes('work harder')) {
      return `In "Animal Farm", there is an extremely dedicated, strong, loyal horse who represents the hard-working working class. He never complains, wakes up early to pull cartloads of stone, and constantly repeats two phrases: 'I will work harder' and 'Napoleon is always right'. What is his name? Hint: starts with 'B'!`;
    }
    if (qText.includes('power-hungry pig')) {
      return `This question examines the main leader of the animal revolt who consolidates ultimate power, banishes his rival Snowball, and begins walking on two legs. What is the name of this pig, who is named after a actual historical French emperor?`;
    }
    if (qText.includes('all animals are equal')) {
      return `As the pigs become more corrupt, they secretly paint over the seven commandments. They replace them with one final, contradictory rule: 'All animals are equal, but some animals are more _______ than others.' Think about what word means having special status, privileges, or superiority.`;
    }
    if (qText.includes('narnia') || qText.includes('youngest child') || qText.includes('step into the snowy world')) {
      return `In "The Chronicles of Narnia: The Lion, the Witch and the Wardrobe", the kids are playing hide-and-seek. The youngest, most pure-hearted sister explores a spare room and decides to hide inside large hanging coats, only to find real pine branches and cold snow under her feet. What is her name?`;
    }
    if (qText.includes('golden lion creator')) {
      return `In this masterpiece, Narnia is ruled by a majestic, wise, and magnificent lion. He is the true king of Narnia, representing supreme goodness and light. What is his name? Hint: it starts with 'A'.`;
    }
    if (qText.includes('wooden _______')) {
      return `To enter the wondrous land of Narnia, the children must step into a large piece of furniture in the spare room where heavy fur coats are kept. Fill in the blank with the name of this wooden cabinet or closet!`;
    }
    if (qText.includes('pilgrim\'s progress') || qText.includes('pilgrim who goes on a long journey')) {
      return `In John Bunyan's religious allegory, the main traveler represents an ordinary person seeking salvation. His name is a direct match for the word used to describe a follower of Christ. What is his name? Hint: it starts with 'C'.`;
    }
    if (qText.includes('represents christian\'s burden')) {
      return `In 'The Pilgrim's Progress', the traveler starts out with an incredibly heavy sack strapped to his back, which represents all his moral failings, guilt, and spiritual struggles. Think about what this pack allegorically stands for as he heads toward the Wicket Gate.`;
    }
    if (qText.includes('straight path leading')) {
      return `Christian travels through many lands to reach his ultimate resting place where he will live in eternal peace and light of the King. This city is called the '_______ City'. Think of a word associated with the heavens, stars, or spiritual realms.`;
    }
    if (qText.includes('ben carson') || qText.includes('scientific profession')) {
      return `Dr. Ben Carson grew up in Detroit and overcame massive academic struggles to become one of the most famous medical doctors in the world, specifically operating on the nervous system and brain in pediatric patients. What type of scientist/doctor is this? Hint: A famous neuro_______`;
    }
    if (qText.includes('sonya carson') || qText.includes('strict rule')) {
      return `Sonya Carson only had a third-grade education herself, but she was determined to see her boys succeed. To do this, she turned off the TV, made them read two books every week from the public library, and write reports about them. Choose the option that describes this library rule!`;
    }
    if (qText.includes('conjoined _______ twins')) {
      return `In 1987, Dr. Ben Carson made medical history by leading a 70-member surgical team in a 22-hour operation to successfully separate seven-month-old twins who were joined at the back of the head. These twins were born together at the same time. Fill in the blank with this word!`;
    }
    if (qText.includes('christian literature') || qText.includes('purpose driven life')) {
      return `Our Christian reading studies show us how to look beyond ourselves! In Rick Warren's famous book 'The Purpose Driven Life', the absolute first line of the first chapter reminds us that discovering our life's purpose has to start with God, not our own desires. Complete the sentence by writing the topic of the book's first line: 'It is not about _______.'`;
    }
    if (qText.includes('in his steps') || qText.includes('dramatic pledge')) {
      return `In Charles Sheldon's classic book 'In His Steps', a community is transformed when the members promise to spend a whole year asking themselves one vital, ethical question before making any single decision in their work, family, or social life. What is that simple question?`;
    }

    if (qText.includes('god created the heavens') || qText.includes('how many total days')) {
      return `In the Genesis creation record, God spoke light, land, sea, sun, plants, animals, and humans into existence sequentially over a set number of days before dedicating the final day for absolute rest. How many days did the active creation work take in total?`;
    }
    if (qText.includes('construct the massive wooden ark')) {
      return `In Genesis, when the world was filled with violence, God decided to purify the earth with a flood. He selected one righteous man to build a colossal vessel out of gopher wood to shelter his family and pairs of every living land animal. Who was this ark builder?`;
    }
    if (qText.includes('psalm 23:1')) {
      return `This is one of the most beloved passages of scripture. Think about how a loving guide watches over, feeds, and protects a flock of gentle sheep. The verse says, 'The Lord is my _______; I shall not want.' Write this guiding title in the blank!`;
    }
    if (qText.includes('good samaritan')) {
      return `In the famous Parable of the Good Samaritan, Jesus teaches us who our neighbor is. A traveler was hurt on the roadside, and several people walked right past him. It was a kind foreigner (the Samaritan) who stopped, bandaged his wounds, and paid for his housing. How can you demonstrate that same care in modern life?`;
    }

    if (qText.includes('alphabet between \'b\' and \'d\'')) {
      return `This is a fundamental alphabet check! Recite the alphabet song from the very beginning: A, B... what letter comes right next before we hit D? Write the uppercase version of that letter!`;
    }
    if (qText.includes('primary vocal vowel')) {
      return `English letters are split into vowels and consonants. The five primary vowels are those that carry vocal sounds: A, E, I, O, and U. All other letters are consonants. Look at the options and find which one is one of these five vowels!`;
    }
    if (qText.includes('three-letter word for a tiny pet that meows') || qText.includes('c a _______')) {
      return `The question asks for the name of a playful four-legged animal that meows, chases mice, and purrs when happy. The spelling is C - A - _______. What is the final sound and letter in this word?`;
    }
    if (qText.includes('short sound of the letter \'a\'')) {
      return `The short 'A' sound makes a sound like the 'a' in 'cat' or 'apple'. To complete this prompt, write down two other very simple words that start with this same starting sound, like 'ant', 'axe', or 'bag'. Can you write down two?`;
    }

    if (qText.includes('deconstruct the foundational axioms')) {
      return `This advanced analytical question asks about the core underlying principles connecting everything in study. Rather than focusing on a single detail, consider how different parts of this field interact as a whole system. Look for options that express this big-picture, systemic view of the academic subject.`;
    }
    if (qText.includes('explain the most important concept')) {
      return `To explain the most important concept in your own words, think back to Miss Kelechi's explanation of this topic. What was the central term or definition that she emphasized the most? Explain it simply, as if explaining it to a younger sibling!`;
    }
    if (qText.includes('heuristics') || qText.includes('is a core part of the british curriculum')) {
      return `This is a quick verification check of our educational standards. Our lessons are aligned with high international and national benchmarks. Reflect on what we discussed in the curriculum intro and select the best True/False answer!`;
    }
    if (qText.includes('synthesize a novel application') || qText.includes('how would you apply')) {
      return `Applying knowledge means taking a concept out of the textbook and using it to solve a real-life problem. Think about how a scientist, doctor, or everyday citizen could use this topic to make their community better, safer, or more efficient. Write down your ideas!`;
    }

    return `Let's break down this question conceptually:
- First, re-read the question carefully and look for key terms.
- Second, connect it back to Miss Kelechi's lessons on "${topic.title}".
- Think about what core idea, story, or rule governs this subject.
Try your best to answer without worrying about being perfect—learning is a gradual process of discovery!`;
  };

  const exercises = generateExercises();
  const paginatedExercises = isSpelling ? [exercises[currentPage]] : exercises;
  const totalPages = isSpelling ? exercises.length : 1;

  const handleSelect = (id: number, option: string) => {
    if (showResults) return;
    setAnswers(prev => ({ ...prev, [id]: option }));
  };

  const handleTextChange = (id: number, text: string) => {
    if (showResults) return;
    setAnswers(prev => ({ ...prev, [id]: text }));
  };

  const score = Object.entries(answers).reduce((acc, [id, ans]) => {
    const answerText = ans as string;
    if (id === '999') return acc + (answerText.length > 10 ? 1 : 0); // Teacher's question
    const exercise = exercises.find(e => e.id === Number(id));
    if (exercise?.type === 'short-answer') {
      if (isSpelling && (grade || 1) === 1) return acc + (answerText.trim().length >= 1 ? 1 : 0);
      return acc + (answerText.trim().length > 5 ? 1 : 0);
    }
    return acc + (exercise?.correctAnswer === answerText ? 1 : 0);
  }, 0);

  const totalPossible = exercises.length + (isSpelling ? 0 : 1); // No teacher question for spelling

  const allAnswered = exercises.every(ex => {
    const val = answers[ex.id]?.trim() || '';
    if (isSpelling) {
      if ((grade || 1) === 1) return val.length >= 1;
      return val.length > 10;
    }
    return val.length > 0;
  });

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-surface-container space-y-10 relative">
      <AnimatePresence>
        {showOnboarding && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] bg-primary/95 flex items-center justify-center p-8 backdrop-blur-sm rounded-2xl"
          >
            <div className="max-w-md text-center text-white space-y-6">
              <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-4xl">edit_note</span>
              </div>
              <h3 className="text-3xl font-headline font-black">How Worksheets Work</h3>
              <p className="text-lg opacity-90 leading-relaxed">
                Worksheets are where you practice what you've learned. {isSpelling ? 'For Spelling, you have 20 pages of words and sentences to complete!' : 'Answer questions, log what you learned, and answer my special teacher question.'} 
                <br /><br />
                <strong>Activities:</strong> Once finished here, check the Activities tab for creative projects!
              </p>
              <button 
                onClick={() => setShowOnboarding(false)}
                className="w-full py-4 bg-white text-primary rounded-xl font-headline font-bold text-lg shadow-xl active:scale-95 transition-all"
              >
                Got it, let's work!
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {isSpelling && (
        <div className="absolute top-0 left-0 w-full h-1 bg-surface-container overflow-hidden rounded-t-2xl">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
          />
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-headline font-bold text-on-surface">
            {isSpelling ? `Spelling Worksheet - ${topic.title}` : "Interactive Worksheet"}
          </h3>
          <p className="text-on-surface-variant text-sm">
            {isSpelling ? `Page ${currentPage + 1} of 20` : "Practice what you've learned and share your thoughts!"}
          </p>
        </div>
        <div className="flex gap-2">
          {isSpelling && (
            <div className="flex bg-surface-container-low rounded-xl p-1">
              <button 
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="p-2 rounded-lg hover:bg-white disabled:opacity-20 transition-all"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage === totalPages - 1}
                className="p-2 rounded-lg hover:bg-white disabled:opacity-20 transition-all"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          )}
          <button 
            onClick={handleSave}
            disabled={saveStatus !== 'idle'}
            className={cn(
              "px-6 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all active:scale-95",
              saveStatus === 'saved' 
                ? "bg-green-500 text-white" 
                : "bg-primary text-white hover:bg-primary/90"
            )}
          >
            <span className="material-symbols-outlined text-sm">
              {saveStatus === 'saving' ? 'sync' : saveStatus === 'saved' ? 'check_circle' : 'save'}
            </span>
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Progress'}
          </button>
        </div>
      </div>

      {!isSpelling && (
        <>
          {/* Reflection Section */}
          <section className="space-y-4 p-6 bg-primary/5 rounded-2xl border-2 border-primary/10">
            <div className="flex items-center gap-3 text-primary">
              <span className="material-symbols-outlined">edit_note</span>
              <h4 className="font-headline font-bold text-lg">My Learning Log</h4>
            </div>
            <p className="text-sm font-medium text-on-surface-variant">Type what you learned in today's lesson about <strong>{topic.title}</strong>:</p>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              disabled={showResults}
              placeholder="Today I learned that..."
              className="w-full h-32 p-4 rounded-xl border-2 border-surface-container bg-white focus:ring-2 focus:ring-primary transition-all font-medium text-on-surface"
            />
          </section>

          {/* Teacher's Question Section */}
          <section className="space-y-4 p-6 bg-secondary/5 rounded-2xl border-2 border-secondary/10">
            <div className="flex items-center gap-3 text-secondary">
              <span className="material-symbols-outlined">question_answer</span>
              <h4 className="font-headline font-bold text-lg">Teacher's Special Question</h4>
            </div>
            <div className="p-4 bg-white rounded-xl border border-secondary/20 italic text-on-surface font-medium">
              "If you had to explain {topic.title} to a friend who missed class today, what would you say is the most important part?"
            </div>
            <textarea
              value={answers[999] || ''}
              onChange={(e) => handleTextChange(999, e.target.value)}
              disabled={showResults}
              placeholder="I would tell my friend that..."
              className="w-full h-24 p-4 rounded-xl border-2 border-surface-container bg-white focus:ring-2 focus:ring-secondary transition-all font-medium text-on-surface"
            />
          </section>
        </>
      )}

      {/* Exercises Section */}
      <div className="space-y-8">
        <h4 className="font-headline font-bold text-xl text-on-surface border-b pb-2">
          {isSpelling ? "Spelling Exercises" : "Practice Questions"}
        </h4>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            {paginatedExercises.map((ex) => (
              <div key={ex.id} className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {ex.id}
                  </span>
                  <p className="font-bold text-on-surface pt-1">{ex.question}</p>
                </div>
                
                <div className="pl-11">
                  {ex.type === 'multiple-choice' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {ex.options?.map(option => {
                        const isSelected = answers[ex.id] === option;
                        const isCorrect = ex.correctAnswer === option;
                        const isWrong = isSelected && !isCorrect;

                        return (
                          <button
                            key={option}
                            onClick={() => handleSelect(ex.id, option)}
                            className={cn(
                              "p-4 rounded-xl border-2 text-left font-medium transition-all",
                              showResults
                                ? isCorrect
                                  ? "border-secondary bg-secondary/10 text-secondary"
                                  : isWrong
                                    ? "border-red-500 bg-red-50 text-red-500"
                                    : "border-surface-container opacity-50"
                                : isSelected
                                  ? "border-primary bg-primary/5 text-primary"
                                  : "border-surface-container hover:border-primary/30"
                            )}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <textarea
                      value={answers[ex.id] || ''}
                      onChange={(e) => handleTextChange(ex.id, e.target.value)}
                      disabled={showResults}
                      placeholder={isSpelling 
                        ? (grade || 1) === 1 
                          ? "Type the word here..." 
                          : "Word 1: ...\nSentence 1: ...\n\nWord 2: ...\nSentence 2: ...\n\nWord 3: ...\nSentence 3: ..." 
                        : "Type your answer here..."}
                      className={cn(
                        "w-full h-48 p-4 rounded-xl border-2 transition-all font-medium text-on-surface",
                        showResults 
                          ? "bg-surface-container-low border-surface-container opacity-70"
                          : "bg-white border-surface-container focus:ring-2 focus:ring-primary"
                      )}
                    />
                  )}

                  {/* Explain / Conceptual help button and content */}
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => setExpandedExplanations(prev => ({ ...prev, [ex.id]: !prev[ex.id] }))}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-secondary/10 hover:bg-secondary/20 text-secondary"
                      id={`explain-btn-${ex.id}`}
                    >
                      <span className="material-symbols-outlined text-sm">lightbulb</span>
                      {expandedExplanations[ex.id] ? "Hide Explanation" : "Stuck? Explain this Problem"}
                    </button>

                    <AnimatePresence>
                      {expandedExplanations[ex.id] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-2.5 overflow-hidden"
                          id={`explain-content-${ex.id}`}
                        >
                          <div className="p-4 bg-secondary/5 rounded-xl border border-secondary/20 text-on-surface text-sm leading-relaxed space-y-2">
                            <div className="flex items-center gap-1.5 text-secondary font-bold text-xs uppercase tracking-wider">
                              <span className="material-symbols-outlined text-sm">auto_stories</span>
                              Reading & Conceptual Context
                            </div>
                            <p className="font-semibold text-on-surface/85 whitespace-pre-line text-xs">
                              {getExplanationContent(ex)}
                            </p>
                            <p className="text-[10px] text-on-surface-variant font-bold italic pt-1 border-t border-secondary/10">
                              *Keep reading! The exact answer is not shown above. Try applying this lesson to solve the problem!
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {showResults ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 bg-surface-container-low rounded-3xl text-center space-y-4 border-2 border-primary/10"
        >
          <div className="text-4xl font-black text-primary">
            {isSpelling ? "Worksheet Finished!" : `${score} / ${totalPossible} Completed!`}
          </div>
          <p className="text-on-surface-variant font-medium">Great job reflecting on your learning and answering the questions!</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => { setShowResults(false); setAnswers({}); setReflection(''); setCurrentPage(0); }}
              className="bg-surface-container-high text-on-surface px-10 py-3 rounded-xl font-bold shadow-sm hover:bg-surface-container transition-all"
            >
              Reset Worksheet
            </button>
            <button 
              onClick={handleSave}
              className="bg-primary text-white px-10 py-3 rounded-xl font-bold shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              Finalize & Save
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="text-center text-xs font-semibold text-on-surface-variant flex items-center justify-center gap-1.5 opacity-75">
            <span className="material-symbols-outlined text-[14px] text-green-500 animate-pulse">sync</span>
            Answers are automatically saved to your profile in the background as you write!
          </div>

          {isSpelling && currentPage < totalPages - 1 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={saveStatus !== 'idle'}
                className={cn(
                  "py-5 rounded-2xl font-headline font-bold shadow-xl transition-all flex items-center justify-center gap-2",
                  saveStatus === 'saved'
                    ? "bg-green-600 text-white"
                    : "bg-surface-container-high text-on-surface hover:bg-surface-container hover:shadow-2xl active:scale-95"
                )}
              >
                <span className="material-symbols-outlined">
                  {saveStatus === 'saving' ? 'sync' : saveStatus === 'saved' ? 'check_circle' : 'save'}
                </span>
                {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Progress'}
              </button>
              <button
                onClick={() => setCurrentPage(p => p + 1)}
                className="sm:col-span-2 bg-secondary text-white py-5 rounded-2xl font-headline font-bold shadow-xl active:scale-95 hover:shadow-2xl transition-all flex items-center justify-center gap-3"
              >
                Next Page
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={saveStatus !== 'idle'}
                className={cn(
                  "py-5 rounded-2xl font-headline font-bold shadow-xl transition-all flex items-center justify-center gap-2",
                  saveStatus === 'saved'
                    ? "bg-green-600 text-white"
                    : "bg-surface-container-high text-on-surface hover:bg-surface-container hover:shadow-2xl active:scale-95"
                )}
              >
                <span className="material-symbols-outlined">
                  {saveStatus === 'saving' ? 'sync' : saveStatus === 'saved' ? 'check_circle' : 'save'}
                </span>
                {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Progress'}
              </button>
              <button
                disabled={!allAnswered || (!isSpelling && !reflection.trim())}
                onClick={() => {
                  setShowResults(true);
                  onSave({
                    topicId: topic.id,
                    answers,
                    reflection,
                    isCompleted: true,
                    score: score
                  });
                }}
                className="sm:col-span-2 bg-primary text-white py-5 rounded-2xl font-headline font-bold shadow-xl active:scale-95 disabled:opacity-50 disabled:pointer-events-none hover:shadow-2xl transition-all flex items-center justify-center gap-3"
              >
                <span className="material-symbols-outlined">task_alt</span>
                Submit Worksheet
              </button>
            </div>
          )}

          {!allAnswered && (
            <p className="text-center text-xs font-bold text-red-500 uppercase tracking-widest mt-1">
              {isSpelling 
                ? `You must complete all 20 pages with meaningful content to submit!` 
                : `You must answer all questions and fill your learning log to submit!`}
            </p>
          )}
          {!isSpelling && allAnswered && !reflection.trim() && (
            <p className="text-center text-xs font-bold text-red-500 uppercase tracking-widest mt-1">
              Please enter what you learned in your learning log above to submit!
            </p>
          )}
          {isSpelling && (
             <div className="flex justify-between items-center px-4 mt-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="text-primary font-bold text-sm disabled:opacity-20 flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  Previous Page
                </button>
                <span className="text-xs font-black text-outline-variant uppercase tracking-widest">
                  Page {currentPage + 1} of {totalPages}
                </span>
             </div>
          )}
        </div>
      )}
    </div>
  );
}
