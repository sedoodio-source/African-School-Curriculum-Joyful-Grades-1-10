import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Topic, Interaction, Subject, User } from '../types';
import { cn } from '../lib/utils';
import { useUpgradeStatus } from '../utils/upgradeManager';
import AIUpgradeLockedBanner from './AIUpgradeLockedBanner';
import UpgradeButton from './UpgradeButton';

export default function AITeacher({ 
  topic, 
  subject,
  grade,
  user,
  onComplete,
  resetKey
}: { 
  topic: Topic; 
  subject: Subject;
  grade: number;
  user: User;
  onComplete: (score: number) => void;
  resetKey?: number;
}) {
  const status = useUpgradeStatus(user);
  const maxInteractions = subject === 'Spelling' ? 15 : 20;
  const [messages, setMessages] = useState<Interaction[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(user.isBeginner && (user.loginMethod === 'Google' || user.loginMethod === 'ClassLink'));
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset state when resetKey changes
    setMessages([]);
    setInput('');
    setIsLoading(false);
    setIsListening(false);
    setIsSpeaking(false);
    window.speechSynthesis.cancel();
  }, [resetKey]);

  // Text to Speech
  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    
    // Clean text for speech: remove asterisks (Markdown), extra symbols, and backslashes
    const cleanText = text.replace(/[*_#\\]/g, '');
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-GB'; // British accent
    utterance.rate = 0.9;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // Speech to Text
  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-GB';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      // For younger students, we can optionally auto-send if they stop speaking
      // but let's stick to manual send for control
    };

    recognition.start();
  };

  useEffect(() => {
    if (!status.isUpgraded) {
      setMessages([]);
      return;
    }
    if (messages.length === 0) {
      startLesson();
    } else {
      // Automatically speak teacher messages for Grade 1 or "Alphabet" subject to help with literacy
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'teacher' && (grade === 1 || subject === 'Alphabet')) {
        speak(lastMsg.content);
      }
    }
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, grade, status.isUpgraded]);

  useEffect(() => {
    const handleCloudEvent = () => {
      startLesson();
    };
    window.addEventListener('miss_kelechi_cloud_refreshed', handleCloudEvent);
    return () => {
      window.removeEventListener('miss_kelechi_cloud_refreshed', handleCloudEvent);
    };
  }, [subject, topic.id, grade]);

  const startLesson = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/kelechi/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Start a lesson on "${topic.title}" in ${subject}.` }],
          subject,
          grade,
          topicTitle: topic.title,
          studentName: user.name
        })
      });
      const data = await res.json();
      const teacherMsg: Interaction = {
        role: 'teacher',
        content: data.reply || "Hello! I am Miss Kelechi. Ready to start our lesson?",
        timestamp: Date.now()
      };
      setMessages([teacherMsg]);
    } catch (err) {
      console.error("AI Teacher Error, executing robust Miss Kelechi backup start:", err);
      
      let intro = "";
      if (subject === 'Literature' && grade >= 2) {
        if (grade === 2) {
          intro = `Hello there, my brilliant young scholar! Today in Literature, we are seeing the true art of reading. Please bring your own copy of "The Cat in the Hat" by Dr. Seuss, and read it beautifully. Once you are done reading, tell me here and I will ask you questions from the book, like about the Cat, Sally, the Fish, or Thing 1 and Thing 2! Are you ready?`;
        } else if (grade === 3) {
          intro = `Welcome, smart student! In Literature today, we are studying the wonderful art of reading with the masterpiece "Animal Farm" by George Orwell. I want you to read the book, and then tell me what you think. I will then ask you questions about Napoleon, Snowball, Boxer, and other characters on the farm. Let me know when you've started reading!`;
        } else if (grade === 4) {
          intro = `Greetings! In Literature today, we explore the spectacular art of reading with Enid Blyton's classic adventure book, "The Famous Five". Go ahead and read about Julian, Dick, Anne, George, and Timmy the dog, and then tell me so I can ask you quiz questions from the book!`;
        } else if (grade === 5) {
          intro = `Hello, deep reader! Today in Literature, we are diving into the art of reading with C.S. Lewis's famous classic, "The Chronicles of Narnia". Please find your copy and read it, then let me know so I can ask you questions about Lucy, Peter, Susan, Edmund, and Aslan the great Lion!`;
        } else if (grade === 6) {
          intro = `Welcome! Today, we study the art of reading in Literature with John Bunyan's magnificent spiritual/allegorical classic, "The Pilgrim's Progress". Read about Christian's pilgrimage to the Celestial City, and then let me know so I can ask you some reflective questions about his heavy burden, Evangelist, the Slough of Despond, and more!`;
        } else if (grade === 7) {
          intro = `Salutations, scholar! In Literature, we explore the art of reading through "Ben Carson" and his life stories (like Gifted Hands or Think Big). Let's read about how he grew up to become a world-renowned neurosurgeon. Tell me when you are ready, and I will ask you analytical questions from his life!`;
        } else {
          // Grade 8-10
          intro = `Good day, mature scholar! Today in Grade ${grade} Literature, we elevate our understanding of the 'Art of Reading' by exploring exemplary Christian Books, such as "The Purpose Driven Life" by Rick Warren or "In His Steps" by Charles Sheldon. Go ahead and start reading these profound chapters, and let me know so I can ask you reflective, moral, and theological analysis questions!`;
        }
      } else if (grade >= 8) {
        intro = `Salutations, scholar! I am Miss Kelechi, your educational strategist. Today, we shall embark on an extremely sophisticated, rigorous, and university-level analysis of "${topic.title}" in ${subject}. We'll explore complex academic definitions, theoretical frameworks, and abstract philosophical systems. Let's begin our high-standard dialogue: what is your preliminary evaluation of this topic's foundations?`;
      } else if (grade === 7) {
        intro = `Hello there! I am Miss Kelechi, your teacher. Today, we are exploring "${topic.title}" in ${subject} using precise academic vocabulary and "big hard words" to expand your intellectual horizon. Let's stretch our critical thinking together! To begin, tell me what you already know about this topic, or pose an initial analytical question.`;
      } else if (grade === 1 || subject === 'Alphabet') {
        intro = `Hello, sweet child! I am Miss Kelechi, your teacher. I am so happy to be here with you! Today we are learning about our lesson: "${topic.title}". We will speak clearly, use simple words, and sound out sounds. Are you ready for a joyful adventure? Tell me 'Yes!' and let's get started!`;
      } else {
        intro = `Hello! I am Miss Kelechi, your teacher, and I am so glad to see you. Today we are learning about "${topic.title}" in ${subject}. We'll use clear, helpful language to master this together. To begin, tell me: what comes to your mind when you think of this topic?`;
      }
      
      setMessages([{
        role: 'teacher',
        content: intro,
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || messages.length >= maxInteractions) return;

    const studentMsg: Interaction = {
      role: 'student',
      content: input,
      timestamp: Date.now()
    };

    const newMessages = [...messages, studentMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    try {
      const formattedMsgs = newMessages.map(m => ({
        role: m.role === 'teacher' ? ('model' as const) : ('user' as const),
        content: m.content
      }));

      const res = await fetch('/api/kelechi/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: formattedMsgs,
          subject,
          grade,
          topicTitle: topic.title,
          studentName: user.name
        })
      });
      const data = await res.json();
      const teacherMsg: Interaction = {
        role: 'teacher',
        content: data.reply || "That's interesting! Let's keep going.",
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, teacherMsg]);
    } catch (err) {
      console.error("AI Teacher Error, executing robust Miss Kelechi backup send:", err);
      
      let content = "";
      const text = input.trim().toLowerCase();
      const count = newMessages.filter(m => m.role === 'teacher').length;
      
      if (subject === 'Literature' && grade >= 2) {
        if (grade === 2) {
          if (text.includes("yes") || text.includes("ready") || text.includes("read") || text.includes("done")) {
            content = `Splendid! Now, let me ask you our first question about the book "The Cat in the Hat" by Dr. Seuss: When the Cat first walks into the house on that cold, wet day, which pet is very angry and tells him he should not be there? Is it the Dog or the Fish?`;
          } else if (text.includes("fish")) {
            content = `Correct! High five! The Fish is very wise. Now, what are the names of those two playful, messy creatures in red suits that the Cat brings out of his big blue box? Are they Thing 1 and Thing 2?`;
          } else if (text.includes("thing 1") || text.includes("thing 1 and thing 2") || text.includes("thing one") || text.includes("yes")) {
            content = `Exactly! You are a brilliant reader! This is the art of reading at its finest! Let's get ready for the lesson quiz to show your ultimate mastery. Tell me when you are ready to start the quiz!`;
          } else {
            content = `Wonderful reading page! To understand the art of reading, bring "The Cat in the Hat" by Dr. Seuss and tell me when you are ready or have read some. What happened in the house while Mother was away?`;
          }
        } else if (grade === 3) {
          if (text.includes("yes") || text.includes("ready") || text.includes("read") || text.includes("done")) {
            content = `Marvellous! Let's check your understanding of "Animal Farm" by George Orwell. Can you tell me: who is the loyal, hard-working horse who always says, "I will work harder!" and "Napoleon is always right!"? Is it Boxer or Benjamin?`;
          } else if (text.includes("boxer")) {
            content = `Brilliant! Boxer is correct. For our next reading comprehension check: what are the names of the two rival pigs who fought for leadership of the farm after Old Major passed away?`;
          } else {
            content = `Excellent choice! Keep exploring "Animal Farm" and tell me if you have questions or what you think of Napoleon's rules. Ready for our quiz check?`;
          }
        } else if (grade === 4) {
          if (text.includes("yes") || text.includes("ready") || text.includes("read") || text.includes("done") || text.includes("famous")) {
            content = `Adventure awaits! From Enid Blyton's "The Famous Five", can you tell me the name of the loyal dog who goes on all the adventures with Julian, Dick, Anne, and George?`;
          } else if (text.includes("timmy")) {
            content = `Incredible! Timmy is the best dog companion! Next: what is the actual name of "George" who hates being called a girl? (Hint: starts with G!). Let's discuss!`;
          } else {
            content = `The Famous Five is full of mysteries! Keep reading and tell me about the adventures of Julian, Dick, Anne, George, and Timmy!`;
          }
        } else if (grade === 5) {
          if (text.includes("lucy") || text.includes("aslan") || text.includes("yes") || text.includes("ready") || text.includes("read")) {
            content = `Amazing! In C.S. Lewis's "The Chronicles of Narnia", what is the special wooden item in the spare room that Lucy walks through to enter the cold world of Narnia?`;
          } else if (text.includes("wardrobe")) {
            content = `Spot on! The wardrobe is correct! Who is the glorious creator lion who represents goodness in Narnia? Is it Aslan?`;
          } else {
            content = `The Chronicles of Narnia has so many deep morals. Let's practice the art of reading by keeping up! Ready to showcase your knowledge on the quiz?`;
          }
        } else if (grade === 6) {
          if (text.includes("burden") || text.includes("yes") || text.includes("ready") || text.includes("read") || text.includes("christian")) {
            content = `Wonderful selection! In "The Pilgrim's Progress" by John Bunyan, what does Christian carry on his back that represents his sins, and exactly where does it fall off?`;
          } else if (text.includes("cross") || text.includes("tomb")) {
            content = `Splendid! It falls off at the Cross! This is a deep allegory of faith. Let's prepare to take our knowledge test. Type "ready" to begin!`;
          } else {
            content = `Christian's journey in "The Pilgrim's Progress" is filled with trials. Keep reading Christian's story. What happens at the Slough of Despond?`;
          }
        } else if (grade === 7) {
          content = `Inspiring brain studies! Let's reflect on Ben Carson (such as in "Gifted Hands" or "Think Big"). How did his mother Sonya encourage her boys' education? How many books did she make young Ben read every single week? Tell me!`;
        } else {
          content = `Superb Christian reading reflections! Let's look at moral and spiritual purpose in Rick Warren's "The Purpose Driven Life" or "In His Steps" by Charles Sheldon. How do these books help us discover our God-given purpose on earth? Share your view with me!`;
        }
      } else if (grade >= 8) {
        if (text.includes("explain") || text.includes("why") || text.includes("how") || text.includes("what")) {
          content = `Fascinating analytical query. From an advanced pedagogical standpoint, ${topic.title} operates on several dense, multi-layered layers. When we analyze its structural foundations in ${subject}, we find complex, abstract systems intersecting. For a Grade ${grade} scholar, this demands a rigorous examination of etymological and technical dynamics. Let's delve into these abstract dimensions. Do you think this structural optimization outweighs the preliminary theoretical drawbacks? Try starting your response with an evaluation of the system's core tenets!`;
        } else if (text.includes("help") || text.includes("don't know") || text.includes("stuck") || text.includes("hard")) {
          content = `Deep intellectual struggle is the hallmark of a Great Scholar, especially in Grade ${grade}. Let us dissect this complexity together. Specifically, when analyzing "${topic.title}", we must abstract the underlying variables in ${subject}. Think of it as a dense multi-step system. Let's break it down: what specific academic parameter of this topic is causing intellectual friction? Or would you prefer a Super-Hard analytical challenge question from me to test your mastery?`;
        } else if (count >= maxInteractions - 6) {
          content = `Brilliant! We have reached the critical "Mastery Check" stage of our session on "${topic.title}". I have prepared a PhD-level critical thinking challenge for you: How do the primary facets of this topic adapt to high-dimensional systems in ${subject}, and what is your overall evaluation of its structural limits? Note that a score ≤ 60% leads to a full redo of AI Teach, Worksheets, and Activities, so answer with extreme academic rigor!`;
        } else {
          content = `Great synthesis. Your evaluation of ${topic.title} reflects solid critical thinking. To extend your intellectual boundaries, let us consider the abstract dynamics: how do you believe these principles in ${subject} synthesize under extreme or high-dimensional conditions? Please provide a detailed, dense explanation, utilizing your best academic and technical terminology.`;
        }
      } else if (grade === 7) {
        if (text.includes("explain") || text.includes("why") || text.includes("how") || text.includes("what")) {
          content = `Excellent question! In Grade 7, we want to expand our thinking with "big hard words". ${topic.title} can be defined as a foundational structure in ${subject} that governs several interrelated variables. Explaining this requires us to employ precise academic vocabulary. Let's look at the underlying mechanics. Does this explanation make sense, or would you like me to elaborate on its secondary facets?`;
        } else if (count >= maxInteractions - 6) {
          content = `Outstanding progress! We are approaching our 3-question "Mastery Check" for "${topic.title}". Here is your first stretch challenge: Can you explain the primary purpose of this topic in ${subject} using your most advanced academic vocabulary? Remember, completing this successfully is necessary, as a score ≤ 60% requires redoing AI Teach, worksheets, and activities to ensure complete mastery!`;
        } else {
          content = `Impressive vocabulary and insight! You are stretching your thinking beautifully. To continue our exploration of "${topic.title}", how do you think we can apply these concepts in a practical, real-world scenario? Be detailed and clear in your explanation!`;
        }
      } else if (grade === 1 || subject === 'Alphabet') {
        if (text.includes("explain") || text.includes("why") || text.includes("how") || text.includes("what")) {
          content = `Oh, that is a super-duper question! Let's sound it out together. Column by column, line by line, we are learning about "${topic.title}". We use simple, clear words to understand ${subject}. Can you say the word '${topic.title.split(' ')[0]}' with me? What sound do you hear at the start?`;
        } else if (count >= maxInteractions - 6) {
          content = `You have done such an awesome job learning with me! Let's do a quick fun question to finish our lesson on "${topic.title}". What is your absolute favorite thing about ${subject}? Tell me, and then we are ready for the fun quiz!`;
        } else {
          content = `Yay! That is absolutely correct and so fun! You are doing a wonderful job. Let's keep learning more about "${topic.title}". Can you give me another example or tell me a happy story about this? I am Listening carefully!`;
        }
      } else {
        if (text.includes("explain") || text.includes("why") || text.includes("how") || text.includes("what")) {
          content = `That is a wonderful and smart question to ask! Let's break down "${topic.title}" in ${subject}. It is all about exploring how these elements work together to help us discover new ideas. We do not need overly complex "big words" here; instead, let's look at a clear custom example. Does this clear example help you understand?`;
        } else if (count >= maxInteractions - 6) {
          content = `Splendid effort! We are getting close to finishing our ${maxInteractions} interactions. Let's check our mastery of "${topic.title}". In your own words, can you explain the main idea of our lesson today? Remember that we need to score over 60% on our quizzes, or we get to redo AI Teach, worksheets, and activities together to master it!`;
        } else {
          content = `Fantastic! I am so proud of your answers. You understand "${topic.title}" so well. Let's think about this: what is one way that you can practice this lesson on ${subject} in your everyday life? Share with me!`;
        }
      }
      
      const teacherMsg: Interaction = {
        role: 'teacher',
        content,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, teacherMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const isLessonComplete = messages.length >= maxInteractions;

  const getSubjectVisualData = () => {
    switch (subject) {
      case 'Math':
        return {
          label: 'Number Matrix',
          content: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '+', '-', '×', '÷', '=', '%'],
          color: 'bg-primary/5 text-primary'
        };
      case 'English':
        return {
          label: 'Action Verb Wall',
          content: ['Run', 'Jump', 'Read', 'Speak', 'Think', 'Write', 'Eat', 'Play', 'Laugh', 'Sing', 'Create', 'Study'],
          color: 'bg-secondary/5 text-secondary'
        };
      case 'Science':
        return {
          label: 'Creation Wonders',
          content: ['Cells', 'Light', 'Gravity', 'Stars', 'Atoms', 'Life', 'Growth', 'Energy', 'Nature', 'Complexity'],
          color: 'bg-tertiary/5 text-tertiary'
        };
      case 'Social Studies':
        return {
          label: 'Historical Focus',
          content: ['Empires', 'Leaders', 'Culture', 'Freedom', 'Ancestry', 'Legacy', 'Heritage', 'Unity', 'History'],
          color: 'bg-primary/5 text-primary'
        };
      case 'Bible Study':
        return {
          label: 'Spiritual Pillars',
          content: ['Faith', 'Love', 'Wisdom', 'Truth', 'Grace', 'Peace', 'Kindness', 'Strength', 'Parables'],
          color: 'bg-secondary/5 text-secondary'
        };
      case 'Literature':
        return {
          label: 'Narrative Elements',
          content: ['Plot', 'Themes', 'Moral', 'Metaphor', 'Simile', 'Heroes', 'Conflict', 'Setting', 'Symbolism'],
          color: 'bg-tertiary/5 text-tertiary'
        };
      case 'Spelling':
        return {
          label: 'Spelling Mastery Wall',
          content: ['Letter Sounds', 'Compound Words', 'Prefixes', 'Suffixes', 'Dictionary Meanings', 'Vowels', 'Consonants'],
          color: 'bg-primary/5 text-primary'
        };
      default:
        return null;
    }
  };

  const visualData = getSubjectVisualData();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8 flex flex-col h-[600px] bg-white rounded-2xl shadow-xl overflow-hidden border border-surface-container relative">
        <AnimatePresence>
          {showOnboarding && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[60] bg-primary/95 flex items-center justify-center p-8 backdrop-blur-sm"
            >
              <div className="max-w-md text-center text-white space-y-6">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-4xl">face_3</span>
                </div>
                <h3 className="text-3xl font-headline font-black">Meet Miss Kelechi</h3>
                <p className="text-lg opacity-90 leading-relaxed">
                  I am your AI Teacher! I'm here to guide you through {subject} with interactive lessons. 
                  You can type your answers or speak to me. I'll ask questions to make sure you're becoming a master of {topic.title}!
                </p>
                <button 
                  onClick={() => setShowOnboarding(false)}
                  className="w-full py-4 bg-white text-primary rounded-xl font-headline font-bold text-lg shadow-xl active:scale-95 transition-all"
                >
                  Start My Lesson
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-primary p-4 text-white flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined">face_3</span>
          </div>
          <div>
            <h3 className="font-headline font-bold flex items-center gap-2">
              Miss Kelechi
              {subject === 'Spelling' && (
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
                  15 Interactions Max
                </span>
              )}
            </h3>
            <p className="text-xs opacity-80">
              {status.isUpgraded 
                ? `Interaction ${messages.length} / ${maxInteractions}`
                : "AI Paused (Upgrade Required)"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <UpgradeButton user={user} variant="pill" />
          <AnimatePresence>
            {isSpeaking && (grade === 1 || subject === 'Alphabet') && (
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onClick={stopSpeaking}
                className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold transition-all border border-white/20 active:scale-95"
              >
                <span className="material-symbols-outlined text-sm animate-pulse">stop_circle</span>
                Stop
              </motion.button>
            )}
          </AnimatePresence>
          {status.isUpgraded && (
            <div className="flex gap-1">
              {Array.from({ length: maxInteractions }).map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all",
                    i < messages.length ? "bg-white" : "bg-white/30"
                  )} 
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-surface-container-lowest">
        {!status.isUpgraded ? (
          <div className="py-6">
            <AIUpgradeLockedBanner user={user} featureName="Miss Kelechi AI Teacher" />
          </div>
        ) : (
          <>
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={msg.timestamp}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={cn(
                    "flex items-start gap-3",
                    msg.role === 'student' ? "flex-row-reverse" : ""
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    msg.role === 'teacher' ? "bg-primary-container text-primary" : "bg-tertiary-container text-tertiary"
                  )}>
                    <span className="material-symbols-outlined text-sm">
                      {msg.role === 'teacher' ? 'face' : 'person'}
                    </span>
                  </div>
                  <div className={cn(
                    "max-w-[80%] p-4 rounded-2xl text-sm font-medium leading-relaxed relative group/msg",
                    msg.role === 'teacher' 
                      ? "bg-surface-container-low text-on-surface rounded-tl-none" 
                      : "bg-primary text-white rounded-tr-none"
                  )}>
                    {msg.content}
                    {msg.role === 'teacher' && (grade === 1 || subject === 'Alphabet') && (
                      <button 
                        onClick={() => speak(msg.content)}
                        className="absolute -right-10 top-0 p-2 rounded-full bg-primary/10 text-primary opacity-0 group-hover/msg:opacity-100 transition-opacity hover:bg-primary/20"
                        title="Listen Again"
                      >
                        <span className="material-symbols-outlined text-sm">volume_up</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isLoading && (
              <div className="flex items-center gap-2 text-primary animate-pulse">
                <span className="material-symbols-outlined spin">sync</span>
                <span className="text-xs font-bold uppercase tracking-widest">Miss Kelechi is thinking...</span>
              </div>
            )}
            <div ref={scrollRef} />
            
            {isLessonComplete && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center p-8 bg-primary/5 rounded-2xl border-2 border-dashed border-primary/20 space-y-4"
              >
                <span className="material-symbols-outlined text-4xl text-primary">assignment_turned_in</span>
                <div className="text-center">
                  <h4 className="font-headline font-bold text-on-surface">Lesson Content Complete!</h4>
                  <p className="text-sm text-on-surface-variant">You've finished your session with Miss Kelechi. Ready for the quiz?</p>
                </div>
                <button 
                  onClick={() => onComplete(100)}
                  className="bg-primary text-white px-8 py-3 rounded-xl font-headline font-bold shadow-lg active:scale-95 transition-all flex items-center gap-2"
                >
                  Take the Quiz
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>

      <div className="p-4 bg-surface-container-low border-t border-surface-container">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex gap-2 items-center"
        >
          <div className="flex-1 relative">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading || isLessonComplete || !status.isUpgraded}
              placeholder={
                !status.isUpgraded 
                  ? "🔒 AI Teacher is paused. Please upgrade your monthly curriculum." 
                  : isLessonComplete 
                    ? "Lesson Complete! Take the quiz above." 
                    : "Type your answer here..."
              }
              className="w-full bg-white border-none rounded-xl pl-6 pr-14 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all shadow-inner disabled:bg-slate-100 disabled:text-slate-400"
            />
            {status.isUpgraded && !isLessonComplete && (grade === 1 || subject === 'Alphabet') && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {!input && !isListening && (
                  <span className="text-[10px] font-bold text-primary animate-bounce hidden sm:block mr-1">
                    Press to speak!
                  </span>
                )}
                <button
                  type="button"
                  onClick={startListening}
                  className={cn(
                    "p-2.5 rounded-lg transition-all",
                    isListening ? "bg-red-500 text-white animate-pulse" : "text-primary hover:bg-primary/10"
                  )}
                  title="Speak your answer"
                >
                  <span className="material-symbols-outlined text-2xl">
                    {isListening ? 'mic' : 'mic_none'}
                  </span>
                </button>
              </div>
            )}
          </div>
          {status.isUpgraded ? (
            <button 
              type="submit"
              disabled={isLoading || !input.trim() || isLessonComplete}
              className="bg-primary text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-lg active:scale-95 disabled:opacity-50 transition-all flex-shrink-0"
            >
              <span className="material-symbols-outlined">send</span>
            </button>
          ) : (
            <UpgradeButton user={user} variant="pill" />
          )}
        </form>
      </div>
    </div>

      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-surface-container overflow-hidden h-full flex flex-col">
          <h4 className="font-headline font-bold text-on-surface mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">auto_awesome</span>
            Lesson Illustrations
          </h4>
          
          <div className="space-y-8 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {/* Concluding Illustration (New) */}
            {isLessonComplete && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-1 px-1 rounded-3xl bg-gradient-to-br from-secondary/20 to-primary/20 border-2 border-primary/30 overflow-hidden shadow-xl"
              >
                <div className="bg-white/40 p-4 backdrop-blur-sm">
                  <h5 className="text-[11px] font-black uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">stars</span>
                    Lesson Conclusion Illustration
                  </h5>
                  <div className="aspect-square bg-white rounded-2xl overflow-hidden border-2 border-white shadow-inner relative group">
                    <img 
                      src={`https://picsum.photos/seed/${topic.id}-concluding/800/800`} 
                      alt="Concluding Lesson Concept" 
                      className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-[10px] font-bold leading-tight">
                        Everything Miss Kelechi taught about {topic.title} shown in one concluding picture.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Subject Specific Visual Data (New) */}
            {visualData && (
              <div className="space-y-4">
                <div className={cn("p-4 rounded-2xl border border-primary/10", visualData.color)}>
                  <h5 className="text-[10px] font-black uppercase tracking-tighter mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">visibility</span>
                    {visualData.label}
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {visualData.content.map((item, i) => (
                      <span 
                        key={i} 
                        className="bg-white/50 px-2 py-1 rounded-md text-xs font-bold shadow-sm border border-black/5"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Main Topic Illustration */}
            <div className="space-y-4">
              <div className="aspect-[4/3] bg-surface-container-low rounded-2xl overflow-hidden border-2 border-primary/10 transition-all hover:shadow-lg">
                <img 
                  src={`https://picsum.photos/seed/${topic.id}-edu/600/450`} 
                  alt="Lesson Concept" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest text-center leading-relaxed">
                Topic Visual: {topic.title}
              </p>
            </div>

            {/* Subject Detail Illustration */}
            <div className="space-y-4">
              <div className="aspect-[4/3] bg-surface-container-low rounded-2xl overflow-hidden border-2 border-secondary/10 transition-all hover:shadow-lg">
                <img 
                  src={`https://picsum.photos/seed/${subject}-diagram/600/451`} 
                  alt="Subject Detail" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest text-center leading-relaxed">
                {subject} Fundamentals
              </p>
            </div>

            {/* Note taking illustration */}
            <div className="p-6 bg-primary/5 rounded-2xl border-2 border-dashed border-primary/20">
              <p className="text-[11px] font-medium text-primary text-center leading-relaxed italic">
                "Look at these illustrations carefully. They help you understand how {topic.title} works in the real world!"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
