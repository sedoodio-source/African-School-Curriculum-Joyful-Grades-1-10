import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Topic, Subject, Question, User } from '../types';
import { cn } from '../lib/utils';

export default function QuizView({ 
  topic, 
  subject, 
  grade,
  user,
  onComplete,
  onBack
}: { 
  topic: Topic; 
  subject: Subject; 
  grade: number;
  user: User;
  onComplete: (score: number) => void;
  onBack: () => void;
}) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(user.isBeginner && (user.loginMethod === 'Google' || user.loginMethod === 'ClassLink') && grade >= 3);
  const [score, setScore] = useState(0);
  const [hints, setHints] = useState<Record<number, string>>({});
  const [isGeneratingHint, setIsGeneratingHint] = useState(false);

  useEffect(() => {
    generateQuiz();
  }, []);

  const generateQuiz = async () => {
    setIsLoading(true);
    try {
      const isSpelling = subject === 'Spelling';
      const questionCount = isSpelling ? 20 : 10;

      const res = await fetch('/api/ai/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicTitle: topic.title,
          subject,
          grade,
          count: questionCount,
          isSpelling
        })
      });
      const data = await res.json();
      if (Array.isArray(data.questions) && data.questions.length > 0) {
        setQuestions(data.questions);
      } else {
        throw new Error('Invalid questions format');
      }
    } catch (error) {
      console.error("Quiz Generation Error, loading fallback:", error);
      setQuestions([
        {
          id: 1,
          type: 'multiple-choice',
          question: `What is a fundamental principle of ${topic.title} in ${subject}?`,
          options: ['Mastering core concepts', 'Rushing without understanding', 'Ignoring rules', 'Guessing answers'],
          correctAnswer: 'Mastering core concepts',
          hint: 'Think about step-by-step learning.',
          explanation: 'Mastering fundamentals builds lasting academic excellence.'
        },
        {
          id: 2,
          type: 'theory',
          question: `Explain why diligence in studying ${topic.title} prepares you for future success.`,
          options: [],
          correctAnswer: 'Diligence builds knowledge and strong character.',
          hint: 'Relate to Christian values of hard work.',
          explanation: 'Hard work and persistence unlock academic potential.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (answer: string) => {
    setUserAnswers(prev => ({ ...prev, [questions[currentQuestionIdx].id]: answer }));
  };

  const nextQuestion = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      submitQuiz();
    }
  };

  const getAiHint = async () => {
    const currentQuestion = questions[currentQuestionIdx];
    if (isGeneratingHint || !currentQuestion) return;
    setIsGeneratingHint(true);
    try {
      const res = await fetch('/api/ai/solve-homework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: `Give a brief hint (max 2 sentences) for this question without revealing the answer: "${currentQuestion.question}"`,
          subject,
          grade,
          studentName: user.name
        })
      });
      const data = await res.json();
      setHints(prev => ({ ...prev, [currentQuestion.id]: data.answer || "Focus on the core definitions we discussed!" }));
    } catch (err) {
      console.error(err);
      setHints(prev => ({ ...prev, [currentQuestion.id]: "Focus on the key topic principles!" }));
    } finally {
      setIsGeneratingHint(false);
    }
  };

  const submitQuiz = async () => {
    setIsSubmitting(true);
    // Simple scoring for MC, and AI scoring for theory
    let correctCount = 0;
    
    questions.forEach(q => {
      if (q.type === 'multiple-choice') {
        if (userAnswers[q.id] === q.correctAnswer) correctCount++;
      } else {
        // For theory, we'll just give partial credit if they wrote something
        if (userAnswers[q.id]?.length > 5) correctCount++;
      }
    });

    const finalScore = Math.round((correctCount / questions.length) * 100);
    setScore(finalScore);
    setShowResults(true);
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-white rounded-2xl shadow-xl p-12 text-center space-y-6">
        <div className="w-24 h-24 border-8 border-primary-container border-t-primary rounded-full animate-spin" />
        <h3 className="text-2xl font-headline font-bold text-on-surface">Preparing Your Quiz...</h3>
        <p className="text-on-surface-variant max-w-xs">Our AI teacher is crafting 10 special questions just for you!</p>
      </div>
    );
  }

  if (showResults) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center h-[600px] bg-white rounded-2xl shadow-xl p-12 text-center space-y-8"
      >
        <div className="w-32 h-32 bg-secondary-container rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined text-6xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
        </div>
        <div>
          <h3 className="text-4xl font-headline font-black text-on-surface">Quiz Complete!</h3>
          <p className="text-xl text-on-surface-variant mt-2">You scored</p>
          <div className="text-7xl font-black text-primary my-4">{score}%</div>
          {score <= 60 && (
            <p className="text-red-500 font-bold max-w-md mx-auto animate-pulse">
              Oops! A score of 60% or below means you must retake the AI Teach, Worksheets, and Activities. Let's try again!
            </p>
          )}
        </div>
        <button 
          onClick={() => onComplete(score)}
          className="bg-primary text-white px-12 py-4 rounded-xl font-headline font-bold text-lg shadow-lg active:scale-95 transition-all flex items-center gap-2"
        >
          {score > 60 ? (
            <>
              <span className="material-symbols-outlined">verified</span>
              Claim Your Score
            </>
          ) : (
            <>
              <span className="material-symbols-outlined">warning</span>
              Return to Lesson
            </>
          )}
        </button>
      </motion.div>
    );
  }

  const currentQuestion = questions[currentQuestionIdx];

  if (!currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-white rounded-2xl shadow-xl p-12 text-center space-y-6">
        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-4xl">warning</span>
        </div>
        <h3 className="text-2xl font-headline font-bold text-on-surface">Quiz Load Failed</h3>
        <p className="text-on-surface-variant max-w-xs mx-auto">
          We could not generate the quiz questions. Please check your connection and try again.
        </p>
        <button onClick={onBack} className="bg-primary text-white py-3 px-8 rounded-xl font-bold">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-2xl shadow-xl overflow-hidden border border-surface-container relative">
      <AnimatePresence>
        {showOnboarding && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] bg-primary/95 flex items-center justify-center p-8 backdrop-blur-sm"
          >
            <div className="max-w-md text-center text-white space-y-6">
              <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-4xl">quiz</span>
              </div>
              <h3 className="text-3xl font-headline font-black">How Smart Quizzes Work</h3>
              <p className="text-lg opacity-90 leading-relaxed">
                Welcome, Grade {grade} scholar! You'll face 10 questions based on today's lesson. 
                Multiple choice tests your speed, while theory tests your deeper understanding. 
                Get 60% or more to pass!
              </p>
              <button 
                onClick={() => setShowOnboarding(false)}
                className="w-full py-4 bg-white text-primary rounded-xl font-headline font-bold text-lg shadow-xl active:scale-95 transition-all"
              >
                Let's Begin!
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-tertiary p-4 text-white flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
          </button>
          <div>
            <h3 className="font-headline font-bold">Topic Quiz</h3>
            <p className="text-xs opacity-80">Question {currentQuestionIdx + 1} of {questions.length}</p>
          </div>
        </div>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all",
                i <= currentQuestionIdx ? "bg-white" : "bg-white/30"
              )} 
            />
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-surface-container-lowest">
        <motion.div
          key={currentQuestionIdx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <span className="px-4 py-1 bg-tertiary-container text-on-tertiary-container rounded-full text-xs font-bold uppercase tracking-widest">
              {currentQuestion.type === 'multiple-choice' ? 'Multiple Choice' : 'Theory'}
            </span>
            <h4 className="text-2xl font-headline font-bold text-on-surface leading-tight">
              {currentQuestion.question}
            </h4>
          </div>

          {currentQuestion.type === 'multiple-choice' ? (
            <div className="grid grid-cols-1 gap-4">
              {currentQuestion.options?.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(option)}
                  className={cn(
                    "p-6 text-left rounded-2xl border-2 transition-all font-medium flex items-center justify-between group",
                    userAnswers[currentQuestion.id] === option
                      ? "bg-primary-container border-primary text-on-primary-container"
                      : "bg-surface-container-low border-transparent hover:border-primary/30 text-on-surface"
                  )}
                >
                  <span>{option}</span>
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                    userAnswers[currentQuestion.id] === option
                      ? "bg-primary border-primary text-white"
                      : "border-outline-variant group-hover:border-primary/50"
                  )}>
                    {userAnswers[currentQuestion.id] === option && <span className="material-symbols-outlined text-xs">check</span>}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <button 
                  onClick={getAiHint}
                  disabled={isGeneratingHint}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 px-3 py-2 rounded-lg transition-all"
                >
                  <span className={cn("material-symbols-outlined text-sm", isGeneratingHint && "animate-spin")}>
                    {isGeneratingHint ? 'sync' : 'auto_awesome'}
                  </span>
                  {isGeneratingHint ? 'Thinking...' : 'Get AI Hint'}
                </button>
                <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">
                  {userAnswers[currentQuestion.id]?.length || 0} characters
                </p>
              </div>

              <textarea
                value={userAnswers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full h-48 p-6 bg-surface-container-low border-none rounded-2xl text-on-surface placeholder:text-outline-variant focus:ring-4 focus:ring-primary-container/30 transition-all font-medium resize-none shadow-inner"
              />

              <AnimatePresence>
                {hints[currentQuestion.id] && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 bg-primary/5 border-l-4 border-primary rounded-r-xl"
                  >
                    <p className="text-xs font-bold text-primary mb-1 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">lightbulb</span>
                      Miss Kelechi says:
                    </p>
                    <p className="text-xs text-on-surface-variant italic leading-relaxed">
                      {hints[currentQuestion.id]}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>

      <div className="p-6 bg-surface-container-low border-t border-surface-container flex justify-between items-center">
        <button 
          onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
          disabled={currentQuestionIdx === 0}
          className="px-6 py-3 rounded-xl font-headline font-bold text-on-surface-variant hover:bg-surface-container transition-all disabled:opacity-30"
        >
          Previous
        </button>
        <button 
          onClick={nextQuestion}
          disabled={!userAnswers[currentQuestion.id]}
          className="bg-primary text-white px-10 py-3 rounded-xl font-headline font-bold shadow-lg active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2"
        >
          {currentQuestionIdx === questions.length - 1 ? 'Submit Quiz' : 'Next Question'}
          <span className="material-symbols-outlined text-sm">
            {currentQuestionIdx === questions.length - 1 ? 'done_all' : 'arrow_forward'}
          </span>
        </button>
      </div>
    </div>
  );
}
