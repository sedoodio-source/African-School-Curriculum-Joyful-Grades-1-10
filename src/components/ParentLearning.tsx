import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface LearningModule {
  id: string;
  title: string;
  content: string[];
  questions: {
    q: string;
    options: string[];
    a: number;
    explanation: string;
  }[];
}

const MODULES: LearningModule[] = [
  {
    id: 'curriculum',
    title: 'African School Curriculum Overview',
    content: [
      "The African School Curriculum is designed to blend global academic standards with local cultural relevance.",
      "Our curriculum emphasizes the 4Cs: Critical Thinking, Creativity, Collaboration, and Communication.",
      "For Grades 1-3, we focus on foundational literacy and numeracy, integrated with ethics and social values.",
      "As students progress to Grades 4-10, the curriculum deepens in scientific inquiry, historical perspective, and advanced problem-solving."
    ],
    questions: [
      {
        q: "What are the '4Cs' emphasized in the curriculum?",
        options: [
          "Curiosity, Care, Courage, Capability",
          "Critical Thinking, Creativity, Collaboration, Communication",
          "Calculations, Coding, Chemistry, Construction",
          "Culture, Community, Citizenship, Character"
        ],
        a: 1,
        explanation: "The 4Cs are foundational skills for modern learning: Critical Thinking, Creativity, Collaboration, and Communication."
      },
      {
        q: "What is the primary focus for Grades 1-3?",
        options: [
          "Advanced Science",
          "University Preparation",
          "Foundational Literacy and Numeracy",
          "Competitive Sports"
        ],
        a: 2,
        explanation: "Grades 1-3 focus on building the bedrock of education: Literacy and Numeracy."
      },
      {
        q: "How does the curriculum handle transition to Grades 4-10?",
        options: [
          "It remains basic to avoid stress",
          "It shifts focus entirely to extracurriculars",
          "It deepens into scientific inquiry and advanced problem-solving",
          "It removes social studies to focus on math"
        ],
        a: 2,
        explanation: "Older grades engage in deeper inquiry, history, and complex problem-solving to prepare for higher education."
      },
      {
        q: "What is the 'Local Cultural Relevance' goal?",
        options: [
          "To ignore global history",
          "To ensure students understand their own heritage while learning global standards",
          "To prepare students to move abroad",
          "To replace English with local languages only"
        ],
        a: 1,
        explanation: "Blending global standards with local relevance ensures students are culturally grounded and globally competitive."
      },
      {
        q: "What subjects are integrated with ethics in early years?",
        options: [
          "Only Math",
          "Foundational Literacy and Numeracy",
          "Only Physical Education",
          "Alphabet sounds only"
        ],
        a: 1,
        explanation: "Early years integrate core literacy/numeracy with ethics and social values to build character early."
      },
      {
        q: "In which grades does the curriculum introduce university-level complexity for high-achievers?",
        options: [
          "Preschool",
          "Grades 1-3",
          "Grades 8-10",
          "Grades 4-5"
        ],
        a: 2,
        explanation: "For high-achieving older students, Miss Kelechi (AI) provides rigorous, academic, and complex material."
      },
      {
        q: "What characterizes the 'Critical Thinking' pillar?",
        options: [
          "Memorizing everything",
          "Asking questions and analyzing facts",
          "Following instructions without question",
          "Reading only fiction books"
        ],
        a: 1,
        explanation: "Critical thinking is about analysis, questioning, and moving beyond simple rote memorization."
      },
      {
        q: "How are historical perspectives integrated?",
        options: [
          "They are ignored",
          "They deepen as students progress to higher grades",
          "They are only taught via games",
          "Only through math problems"
        ],
        a: 1,
        explanation: "Historical perspective becomes a deeper focus as students move into Grades 4-10."
      },
      {
        q: "What is the ultimate purpose of the curriculum?",
        options: [
          "To pass one test",
          "To nurture the next generation of African leaders",
          "To keep children busy during the day",
          "To sell textbooks"
        ],
        a: 1,
        explanation: "The strategic mission is to produce leaders who can innovate and lead on the continent."
      },
      {
        q: "How does the curriculum view 'Problem-Solving'?",
        options: [
          "As an advanced skill for only a few",
          "As a multi-step inquiry explored in later grades",
          "As something to avoid",
          "As a simple one-step process"
        ],
        a: 1,
        explanation: "Scientific inquiry and multi-step problem-solving are key features of the progression to higher grades."
      }
    ]
  },
  {
    id: 'school',
    title: 'About Our School Philosophy',
    content: [
      "Our school's mission is to nurture the next generation of African leaders through holistic education.",
      "We believe that parents are our primary partners in a child's learning journey.",
      "Technology is used as a tool to enhance learning, not replace traditional teaching methods.",
      "We implement a 'Success for All' policy, where every student is supported regardless of their starting point."
    ],
    questions: [
      {
        q: "In our school's philosophy, who are the primary partners in learning?",
        options: [
          "The Government",
          "Parents",
          "Textbook Publishers",
          "Technology Companies"
        ],
        a: 1,
        explanation: "We believe parents play the most crucial role as partners in their child's education."
      },
      {
        q: "What is 'Holistic Education'?",
        options: [
          "Only teaching math",
          "Nurturing the whole child—academic, ethical, and social",
          "Focusing only on test scores",
          "Teaching history using holes"
        ],
        a: 1,
        explanation: "Holistic education looks at more than just grades; it builds character, social skills, and academic excellence."
      },
      {
        q: "How is technology viewed in the school?",
        options: [
          "As a distraction to be avoided",
          "As a complete replacement for teachers",
          "As a tool to enhance and personalized learning",
          "As just a way to play games"
        ],
        a: 2,
        explanation: "Technology (like our AI Teacher) enhances the experience but supports the overall educational ecosystem."
      },
      {
        q: "What does 'Success for All' mean?",
        options: [
          "Everyone gets a prize regardless of work",
          "Supporting every student from their unique starting point",
          "Only focusing on the top students",
          "Moving everyone to the next grade automatically"
        ],
        a: 1,
        explanation: "Success for All ensures every child—regardless of initial level—receives the support they need to improve."
      },
      {
        q: "What is the mission regarding the next generation?",
        options: [
          "To prepare them for retirement",
          "To nurture African leaders",
          "To teach them how to code only",
          "To win sports competitions"
        ],
        a: 1,
        explanation: "The core mission is nurturing the next generation of leaders for the continent."
      },
      {
        q: "Why is the Parent Portal important?",
        options: [
          "To watch videos",
          "To monitor progress and actively partner in the child's journey",
          "To chat with other parents only",
          "To change the child's grades"
        ],
        a: 1,
        explanation: "The portal allows parents to see analytics, alerts, and learning records to stay involved."
      },
      {
        q: "How are student 'Challenges' handled?",
        options: [
          "By ignoring them",
          "Through specialized alerts and redo-requirements for mastery",
          "By asking parents to find a different school",
          "By reducing the difficulty for everyone"
        ],
        a: 1,
        explanation: "The system uses alerts and redo-thresholds (like the 60% rule) to ensure mastery before moving on."
      },
      {
        q: "What is the '60% Rule' in our philosophy?",
        options: [
          "Students only need 60% to get an A",
          "Students scoring 60% or less must redo the session to ensure mastery",
          "Parents must pay 60% of fees early",
          "We only teach 60% of the curriculum"
        ],
        a: 1,
        explanation: "The 60% threshold ensures that students don't have gaps in their foundational knowledge."
      },
      {
        q: "What kind of environment does the school nurture?",
        options: [
          "Competitive and stressful",
          "Holistic, supportive, and high-standard",
          "Relaxed with no standards",
          "Strictly quiet at all times"
        ],
        a: 1,
        explanation: "The school maintains high standards while providing holistic and supportive guidance."
      },
      {
        q: "What is the primary role of the AI Teacher, Miss Kelechi?",
        options: [
          "To replace the human spirit",
          "To provide strategic, personalized educational guidance",
          "To mark attendance only",
          "To tell jokes"
        ],
        a: 1,
        explanation: "Miss Kelechi is a strategist designed to guide students through complex topics at their own pace."
      }
    ]
  },
  {
    id: 'rigor',
    title: 'Academic Rigor (Grades 8-10)',
    content: [
      "In the senior secondary years, the curriculum transitions into university-level complexity.",
      "High-achieving students are challenged with abstract theories and PhD-level analytical questioning.",
      "Academic vocabulary usage is rigorous, preparing students for global professional environments.",
      "The AI Teacher increases difficulty dynamically based on the student's mastery speed."
    ],
    questions: [
      { q: "At what grades does the curriculum introduce university-level complexity?", options: ["Grade 1-3", "Grade 4-7", "Grade 8-10", "Only for staff"], a: 2, explanation: "Senior students (8-10) are pushed with higher-level academic rigor." },
      { q: "What is the goal of 'Super-Hard' questions?", options: ["To discourage students", "To stretch intellectual boundaries", "To waste time", "To test the internet speed"], a: 1, explanation: "These questions are designed to challenge students to think deeply and abstractly." },
      { q: "How is vocabulary handled in senior grades?", options: ["It is simplified", "It uses academic and technical terminology", "It uses only slang", "It is removed entirely"], a: 1, explanation: "Senior students engage with sophisticated academic language." },
      { q: "What does 'PhD-Level' questioning refer to?", options: ["Questions for doctors", "Abstract and multi-layered analysis", "Reading a medical book", "Simple math"], a: 1, explanation: "It refers to the depth and complexity of the critical thinking required." },
      { q: "Do we simplify concepts for Grade 10 high-achievers?", options: ["Yes", "Only on Fridays", "No, we maintain peak rigor", "Sometimes"], a: 2, explanation: "We do not simplify; we prepare them for the highest academic standards." },
      { q: "What is the primary focus of senior years?", options: ["Basic literacy", "University preparation", "Physical education only", "Learning the alphabet"], a: 1, explanation: "The focus is transitioning students toward university-level thinking." },
      { q: "How does AI respond to high performance?", options: ["By ending the lesson", "By increasing difficulty further", "By ignoring it", "By asking simple questions"], a: 1, explanation: "The AI dynamically scales difficulty to match the student's peak ability." },
      { q: "What is a 'Multi-layered explanation'?", options: ["A very long sentence", "Connecting complex ideas in a structured way", "Saying the same thing twice", "A list of numbers"], a: 1, explanation: "It involves synthesizing different concepts to explain complex phenomena." },
      { q: "Why teach 'Academic Vocabulary' explicitly?", options: ["To sound smart", "To prepare for global professional environments", "To make reading harder", "Because it is required by law"], a: 1, explanation: "Professional terminology is a key tool for global success." },
      { q: "What characterizes the senior curriculum?", options: ["Repetition of basics", "Intellectual rigor and abstraction", "Less work", "Only creative arts"], a: 1, explanation: "Abstraction and rigor define the path to excellence in later grades." }
    ]
  },
  {
    id: 'mastery',
    title: 'Mastery Learning & Redo Policy',
    content: [
      "We believe in 'Mastery Learning'—no student moves on with a gap in their knowledge.",
      "The 60% Rule: A score of 60% or less in any session (AI Teach or Quiz) triggers a mandatory redo.",
      "This policy ensures that students build their education on a rock-solid foundation.",
      "Redo alerts are visible to parents to encourage supportive guidance at home."
    ],
    questions: [
      { q: "What is the '60% Rule'?", options: ["Everyone gets 60 points", "Scores of 60% or less require a full redo", "Parents pay 60% of fees", "Only 60 students per class"], a: 1, explanation: "Mastery is only achieved when students score above 60%." },
      { q: "What happens if a student fails a session threshold?", options: ["They move to the next unit", "They must redo AI Teach, Worksheets, and Activities", "The teacher ignores it", "They skip the quiz"], a: 1, explanation: "Complete re-engagement with the material ensures the gap is closed." },
      { q: "Why is this policy implemented?", options: ["To punish students", "To ensure a solid foundation without knowledge gaps", "To keep kids busy", "To sell more lessons"], a: 1, explanation: "Knowledge gaps lead to systemic failure in later units; we prevent this early." },
      { q: "Who can see the 'Redo Alert'?", options: ["Only the student", "Only the AI", "Parents and the system", "No one"], a: 2, explanation: "Parent transparency is key to supporting a child's mastery journey." },
      { q: "True or False: The rule applies to high-achievers.", options: ["True", "False", "Only for Grade 1", "Only for Bible Study"], a: 0, explanation: "Rigor and mastery are standards for every single student." },
      { q: "What is 'Foundation-First' learning?", options: ["Starting with the roof", "Ensuring basics are perfect before moving forward", "Learning only about buildings", "Skipping the easy parts"], a: 1, explanation: "You cannot build advanced skills on shaky foundational knowledge." },
      { q: "How does this rule help student confidence?", options: ["It provides more work", "It ensures they truly understand before moving on", "It removes the need for tests", "It is only a game"], a: 1, explanation: "True confidence comes from actual mastery, not just moving forward." },
      { q: "When is a session considered complete?", options: ["When the time is up", "When the student achieves >60% and masters the content", "When the student clicks 'End'", "Never"], a: 1, explanation: "Completion is tied to successful assessment and mastery." },
      { q: "What is 'Terminal State Locking'?", options: ["A locked door", "Finalized scores that cannot be skipped", "A type of computer virus", "A math formula"], a: 1, explanation: "In our rules, once a status is reached, it must be resolved properly." },
      { q: "What should a parent do when they see an alert?", options: ["Be angry", "Support and encourage the child to redo the lesson", "Call the government", "Ignore it"], a: 1, explanation: "Alerts are opportunities for partnership and encouragement." }
    ]
  },
  {
    id: 'pedagogy',
    title: 'Personalized AI Pedagogy',
    content: [
      "Miss Kelechi is an AI Teacher designed to provide 24/7 personalized guidance.",
      "She adapts her language, tone, and rigor based on the student's grade and performance.",
      "For Grade 1 students, she focuses on simple words and sounds; for Grade 10, she is a rigorous academician.",
      "The AI facilitates a safe, non-judgmental space for students to try, fail, and master."
    ],
    questions: [
      { q: "Who is Miss Kelechi?", options: ["A human principal", "A specialized AI Educational Strategist", "A robot in the cafeteria", "A mobile app"], a: 1, explanation: "She is a world-class AI teacher designed for strategic educational guidance." },
      { q: "How does she adapt to a Grade 1 student?", options: ["She uses simple words and phonetics", "She uses university jargon", "She speaks in code", "She doesn't talk at all"], a: 0, explanation: "Miss Kelechi matches the developmental level of the student perfectly." },
      { q: "What is 'Personalized Pacing'?", options: ["Walking at the same speed", "The student moves as fast or slow as they need to master the topic", "Every student reads the same page", "Only the AI sets the speed"], a: 1, explanation: "Every child is unique; our system respects and supports individual speed." },
      { q: "What accent does Miss Kelechi use?", options: ["American", "Professional British", "French", "No accent"], a: 1, explanation: "She uses a professional British accent to maintain high-standard communication." },
      { q: "Why use AI instead of just videos?", options: ["Videos are expensive", "AI interacts and responds to specific student inputs", "AI doesn't have a screen", "Videos are too long"], a: 1, explanation: "Interaction is the key to deep learning and engagement." },
      { q: "Is the AI space considered 'Safe for failure'?", options: ["No, failure is bad", "Yes, students can try and redo without judgment", "Only for top students", "Failure is not allowed"], a: 1, explanation: "The AI provides a supportive space for students to learn from their mistakes." },
      { q: "How often does she check for mastery?", options: ["Once at the end of the year", "During every interaction with the student", "Never", "Only if the parent asks"], a: 1, explanation: "Miss Kelechi constantly monitors understanding during the lesson." },
      { q: "Does she handle Math and Science?", options: ["No, only English", "Yes, with tailored rigor for every subject", "Only if they are easy", "Only Grade 5 math"], a: 1, explanation: "Her pedagogy extends across the entire modern curriculum." },
      { q: "What is the 'Mastery Check' part?", options: ["A security guard", "A 3-question evaluation near the end of a lesson", "A list of students", "A physical checkup"], a: 1, explanation: "It ensures the student is ready for the independent activities." },
      { q: "Can Miss Kelechi be 'Mean'?", options: ["Yes, if grades are low", "No, she is always a warm and professional educator", "Sometimes", "Only to older kids"], a: 1, explanation: "She maintains the highest standards of professional and warm guidance." }
    ]
  },
  {
    id: 'heritage',
    title: 'Cultural Heritage & Global Citizenship',
    content: [
      "We produce leaders who are culturally grounded and globally competitive.",
      "The curriculum uses local context—such as the ₦ Naira—to ground academic theories.",
      "Students learn world history alongside African legacy and ancestry.",
      "The goal is global competitiveness with a heart for the continent's growth."
    ],
    questions: [
      { q: "Why use Naira (₦) in Math and Science?", options: ["Because it's the only money that exists", "To ground learning in the local African context", "For decoration", "Because it's easier to type"], a: 1, explanation: "Local context makes abstract concepts more relatable and applicable." },
      { q: "What is 'Cultural Grounding'?", options: ["Ignoring other cultures", "Building a strong identity based on heritage and values", "Staying at home", "Learning only one history book"], a: 1, explanation: "A secure identity is the foundation for a global leader." },
      { q: "Are global standards sacrificed for culture?", options: ["Yes", "No, they are blended together", "Sometimes", "Only in Grades 1-4"], a: 1, explanation: "We maintain global academic standards while ensuring cultural relevance." },
      { q: "What kind of leaders are we nurturing?", options: ["Innovators who stay abroad", "Leaders who can innovate and lead on the continent", "Sports stars only", "Only academic researchers"], a: 1, explanation: "Our strategic mission is the growth and leadership of Africa." },
      { q: "How is 'Legacy' viewed?", options: ["As a boring topic", "As a core pillar of understanding one's impact", "As only for ancestors", "It is not taught"], a: 1, explanation: "Understanding legacy motivates students to create their own." },
      { q: "What is 'Global Citizenship'?", options: ["Living in every country", "Being competitive and impactful on a global stage", "Only reading world news", "Replacing local values"], a: 1, explanation: "It's about being a global player while staying rooted in your identity." },
      { q: "When are ethics taught?", options: ["Only in Grade 10", "Integrated from Grade 1", "Never", "Only if the student is bad"], a: 1, explanation: "Character building is a holistic, long-term process starting early." },
      { q: "What is the 'Mission' of the school?", options: ["To sell computers", "To curate a holistic ecosystem for African growth", "To win a math prize", "To keep kids busy"], a: 1, explanation: "The curriculum is a strategic tool for continental development." },
      { q: "Why learn World History?", options: ["To pass a test", "To understand Africa's place in the global narrative", "To learn about travel", "Because it is required"], a: 1, explanation: "Global context allows students to see their heritage's impact on the world." },
      { q: "What does 'Competitive' mean in our context?", options: ["Beating everyone else", "Meeting and exceeding global standards of excellence", "Only focus on sports", "Ignoring others"], a: 1, explanation: "Excellence is measured against the best global academic benchmarks." }
    ]
  },
  {
    id: 'skills',
    title: 'The 4Cs: Skills for the Future',
    content: [
      "The 4Cs are our core developmental pillars: Critical Thinking, Creativity, Collaboration, and Communication.",
      "Critical Thinking moves students beyond rote memorization into deep analysis.",
      "Creativity involves inventing and innovatively solving real-world problems.",
      "Collaboration and Communication prepare students for effective global leadership."
    ],
    questions: [
      { q: "What does 'Critical Thinking' mean?", options: ["Memorizing every word", "Moving beyond memorization into analysis", "Critically judging others", "Only for math problems"], a: 1, explanation: "Analysis and synthesis are higher-order thinking skills." },
      { q: "What is 'Creativity' in our curriculum?", options: ["Only drawing and painting", "Innovatively solving real-world challenges", "Doing things without rules", "Avoiding math"], a: 1, explanation: "Innovation is the application of creativity to solve problems." },
      { q: "What does 'Collaboration' prepare students for?", options: ["Working alone", "Global teamwork and community building", "Competing for prizes", "Staying quiet"], a: 1, explanation: "Leadership in the modern world requires effective teamwork." },
      { q: "Why are the 4Cs called 'Skills for the Future'?", options: ["Because they use time travel", "Because they are essential for the 21st-century workforce", "Because they are only for grown-ups", "Because robots do them better"], a: 1, explanation: "These soft skills are the most demanded in the global economy." },
      { q: "Which grades learn the 4Cs?", options: ["Only Grades 8-10", "Everyone from Grade 1 upwards", "Only the staff", "No one"], a: 1, explanation: "Skills like communication and creativity are built gradually from the start." },
      { q: "How is 'Communication' practiced?", options: ["Only in English class", "Across all subjects, including Math and Science", "By staying silent", "Only by the teacher"], a: 1, explanation: "Every subject is a chance to articulate and share ideas." },
      { q: "Does technology help with the 4Cs?", options: ["No, it hinders them", "Yes, as a tool for creation and communication", "Only for entertainment", "It replaces the 4Cs"], a: 1, explanation: "Tools (like AI and Portals) are used to stretch and share these skills." },
      { q: "What characterizes 'Synthesis' in learning?", options: ["Splitting things apart", "Combining disparate ideas to create new understanding", "Copying from a book", "Using simple words"], a: 1, explanation: "Synthesis is the peak of critical thinking." },
      { q: "Is 'Collaboration' a grade?", options: ["Yes, on your scorecard", "It is an essential skill monitored by the system", "No, it is just a hobby", "Only if you ask"], a: 1, explanation: "Social and collaborative skills are key indicators of leadership readiness." },
      { q: "What is the result of applying all 4Cs?", options: ["Passing a test", "Producing a holistic, innovative leader", "Being tired", "Winning a game"], a: 1, explanation: "The 4Cs design the modern, impactful person." }
    ]
  }
];

export default function ParentLearning() {
  const [activeModule, setActiveModule] = useState<LearningModule | null>(null);
  const [step, setStep] = useState<'reading' | 'quiz' | 'result'>('reading');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const startModule = (mod: LearningModule) => {
    setActiveModule(mod);
    setStep('reading');
    setCurrentQuestionIdx(0);
    setScore(0);
    setSelectedOption(null);
    setShowExplanation(false);
  };

  const handleAnswer = (idx: number) => {
    if (showExplanation) return;
    setSelectedOption(idx);
    setShowExplanation(true);
    if (idx === activeModule!.questions[currentQuestionIdx].a) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIdx < activeModule!.questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setStep('result');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <header className="text-center md:text-left">
        <h1 className="font-headline text-4xl font-extrabold text-on-surface">Parent Learning Portal</h1>
        <p className="text-on-surface-variant font-medium mt-2 italic">Empowering parents with knowledge of our curriculum and vision.</p>
      </header>

      {!activeModule ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MODULES.map((mod) => (
            <motion.div 
              key={mod.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => startModule(mod)}
              className="bg-white p-8 rounded-3xl shadow-sm border border-surface-container cursor-pointer group hover:border-primary transition-all"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-3xl">
                  {mod.id === 'curriculum' ? 'menu_book' : 'school'}
                </span>
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-2">{mod.title}</h3>
              <p className="text-sm text-on-surface-variant line-clamp-2">Learn about our methodologies and how we support your child's growth.</p>
              <div className="mt-6 flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                Start Learning
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-surface-container overflow-hidden min-h-[500px] flex flex-col">
          <div className="bg-surface-container-low p-6 border-b border-surface-container flex justify-between items-center">
            <button 
              onClick={() => setActiveModule(null)}
              className="flex items-center gap-2 text-primary font-bold text-sm hover:underline"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back to Library
            </button>
            <div className="px-4 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase">
              {step === 'reading' ? 'Education Phase' : 'Assessment Phase'}
            </div>
          </div>

          <div className="flex-1 p-8 md:p-12 overflow-y-auto">
            <AnimatePresence mode="wait">
              {step === 'reading' && (
                <motion.div 
                  key="reading"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <h2 className="text-3xl font-black text-on-surface">{activeModule.title}</h2>
                  <div className="space-y-6">
                    {activeModule.content.map((text, i) => (
                      <div key={i} className="flex gap-4 items-start">
                        <div className="w-8 h-8 rounded-full bg-primary/5 text-primary flex items-center justify-center flex-shrink-0 font-bold text-xs">
                          {i + 1}
                        </div>
                        <p className="text-lg leading-relaxed text-on-surface-variant font-medium italic">
                          {text}
                        </p>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => setStep('quiz')}
                    className="mt-12 group flex items-center gap-4 px-10 py-4 bg-primary text-white rounded-2xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all mx-auto font-headline font-black text-lg"
                  >
                    Take Knowledge Quiz
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">quiz</span>
                  </button>
                </motion.div>
              )}

              {step === 'quiz' && (
                <motion.div 
                  key={`quiz-${currentQuestionIdx}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Question {currentQuestionIdx + 1} of {activeModule.questions.length}</span>
                    <div className="h-2 w-32 bg-surface-container-high rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-500" 
                        style={{ width: `${((currentQuestionIdx + 1) / activeModule.questions.length) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-on-surface leading-tight">
                    {activeModule.questions[currentQuestionIdx].q}
                  </h3>

                  <div className="grid grid-cols-1 gap-4">
                    {activeModule.questions[currentQuestionIdx].options.map((option, i) => (
                      <button
                        key={i}
                        onClick={() => handleAnswer(i)}
                        disabled={showExplanation}
                        className={cn(
                          "p-6 rounded-2xl text-left border-2 transition-all font-medium text-lg",
                          selectedOption === null 
                            ? "border-surface-container hover:border-primary hover:bg-primary/5" 
                            : i === activeModule.questions[currentQuestionIdx].a 
                              ? "border-green-500 bg-green-50 text-green-800"
                              : selectedOption === i 
                                ? "border-red-500 bg-red-50 text-red-800"
                                : "border-surface-container opacity-50"
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>

                  {showExplanation && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 bg-surface-container rounded-2xl border border-surface-container-high"
                    >
                      <h4 className="font-bold flex items-center gap-2 mb-2 text-on-surface">
                        <span className="material-symbols-outlined text-primary">tips_and_updates</span>
                        Review
                      </h4>
                      <p className="text-on-surface-variant italic leading-relaxed">
                        {activeModule.questions[currentQuestionIdx].explanation}
                      </p>
                      <button 
                        onClick={nextQuestion}
                        className="mt-6 w-full py-4 bg-on-surface text-white rounded-xl font-bold"
                      >
                        {currentQuestionIdx < activeModule.questions.length - 1 ? 'Next Question' : 'View Results'}
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {step === 'result' && (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12 space-y-8"
                >
                  <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <span className="material-symbols-outlined text-5xl">verified</span>
                  </div>
                  <div>
                    <h2 className="text-4xl font-black text-on-surface mb-2">Module Complete!</h2>
                    <p className="text-lg font-medium text-on-surface-variant">Congratulations! You've learned more about our African School Curriculum.</p>
                  </div>
                  <div className="bg-primary/5 p-8 rounded-3xl border-2 border-primary/20 max-w-sm mx-auto">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2">Your Knowledge Score</p>
                    <div className="text-7xl font-black text-primary">{Math.round((score / activeModule.questions.length) * 100)}%</div>
                  </div>
                  <button 
                    onClick={() => setActiveModule(null)}
                    className="px-12 py-4 bg-primary text-white rounded-2xl font-black shadow-xl"
                  >
                    Finish Module
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
