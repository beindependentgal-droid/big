import { useState, useMemo, type Dispatch, type SetStateAction } from 'react';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Clock, 
  Users, 
  Star, 
  PlayCircle, 
  ChevronRight, 
  Award, 
  TrendingUp, 
  GraduationCap,
  Lightbulb,
  ShieldCheck,
  Target,
  ArrowLeft,
  CheckCircle2,
  Lock,
  ExternalLink,
  MessageSquare,
  FileText,
  DollarSign,
  Briefcase,
  Heart,
  Sparkles,
  Laptop,
  Mail,
  Calendar,
  Flame,
  Shield,
  Activity,
  FileSpreadsheet,
  Layers,
  Download,
  Smartphone,
  Video,
  ArrowRight,
  HelpCircle,
  Check
} from 'lucide-react';
import { Course, Lesson, INITIAL_COURSES } from '../data';
import { motion, AnimatePresence } from 'motion/react';
import { AcademyProgressState, getDefaultAcademyProgressState, mergeAcademyProgressState } from '../lib/stateHelpers';

interface AcademyViewProps {
  addPoints: (pts: number, badgeCode?: string) => void;
  onJoinCircle: (circleId: string) => void;
  isAuthenticated?: boolean;
  setCurrentView?: (view: string) => void;
  academyProgress?: AcademyProgressState;
  setAcademyProgress?: Dispatch<SetStateAction<AcademyProgressState>>;
}

type AcademyTab = 'explore' | 'my-learning';

export function AcademyView({ addPoints, onJoinCircle, isAuthenticated = false, setCurrentView, academyProgress, setAcademyProgress }: AcademyViewProps) {
  const [courses] = useState<Course[]>(INITIAL_COURSES);
  const [activeTab, setActiveTab] = useState<AcademyTab>('explore');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  
  // Marketing State
  const [previewCourse, setPreviewCourse] = useState<Course | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [subscriberEmail, setSubscriberEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Learning State
  const [localAcademyProgress, setLocalAcademyProgress] = useState<AcademyProgressState>(() => getDefaultAcademyProgressState());
  const resolvedAcademyProgress = academyProgress ?? localAcademyProgress;
  const setResolvedAcademyProgress = setAcademyProgress ?? setLocalAcademyProgress;
  const enrolledIds = resolvedAcademyProgress.enrolledCourseIds;
  const completedLessonIds = resolvedAcademyProgress.completedLessonIds;
  const lessonNotes = resolvedAcademyProgress.lessonNotes;
  const earnedCertificates = resolvedAcademyProgress.earnedCertificateIds;
  const activeCourseId = resolvedAcademyProgress.activeCourseId;
  const activeLessonId = resolvedAcademyProgress.activeLessonId;

  // Advanced Academy State
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [quizResult, setQuizResult] = useState<{ score: number; passed: boolean } | null>(null);
  const [showCertificate, setShowCertificate] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Courses', icon: BookOpen },
    { id: 'finance', label: 'Finance', icon: TrendingUp },
    { id: 'tech', label: 'Technology', icon: GraduationCap },
    { id: 'marketing', label: 'Marketing', icon: Target },
    { id: 'leadership', label: 'Leadership', icon: ShieldCheck },
    { id: 'creative', label: 'Creative', icon: Lightbulb }
  ];

  const filteredCourses = useMemo(() => {
    const list = activeTab === 'explore' 
      ? courses 
      : courses.filter(c => enrolledIds.includes(c.id));

    return list.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           course.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
      const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [courses, activeTab, enrolledIds, searchQuery, selectedCategory, selectedLevel]);

  const activeCourse = useMemo(() => 
    courses.find(c => c.id === activeCourseId) || null
  , [courses, activeCourseId]);

  const activeLesson = useMemo(() => 
    activeCourse?.lessons.find(l => l.id === activeLessonId) || activeCourse?.lessons[0] || null
  , [activeCourse, activeLessonId]);

  const updateAcademyProgress = (updates: Partial<AcademyProgressState>) => {
    setResolvedAcademyProgress(prev => mergeAcademyProgressState(prev, updates));
  };

  const handleEnroll = (courseId: string) => {
    if (!enrolledIds.includes(courseId)) {
      updateAcademyProgress({ enrolledCourseIds: [...enrolledIds, courseId] });
      addPoints(100); // Points for taking the first step
    }
    updateAcademyProgress({ activeCourseId: courseId, activeLessonId: courses.find(c => c.id === courseId)?.lessons[0].id || null });
  };

  const toggleLessonCompletion = (lessonId: string) => {
    const isCompleting = !completedLessonIds.includes(lessonId);
    if (isCompleting) {
      addPoints(50); // Points per lesson
      updateAcademyProgress({ completedLessonIds: [...completedLessonIds, lessonId] });
    } else {
      updateAcademyProgress({ completedLessonIds: completedLessonIds.filter(id => id !== lessonId) });
    }
  };

  const handleLessonNoteChange = (lessonId: string, note: string) => {
    updateAcademyProgress({ lessonNotes: { ...lessonNotes, [lessonId]: note } });
  };

  const startQuiz = () => {
    if (activeCourse?.quiz) {
      setIsQuizMode(true);
      setQuizStep(0);
      setUserAnswers([]);
      setQuizResult(null);
    }
  };

  const handleQuizAnswer = (answerIdx: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[quizStep] = answerIdx;
    setUserAnswers(newAnswers);

    if (activeCourse?.quiz && quizStep < activeCourse.quiz.questions.length - 1) {
      setQuizStep(prev => prev + 1);
    } else {
      // Calculate Result
      const quiz = activeCourse?.quiz;
      if (quiz) {
        let score = 0;
        newAnswers.forEach((ans, i) => {
          if (ans === quiz.questions[i].correctAnswer) score++;
        });
        const passed = score >= quiz.passingScore;
        setQuizResult({ score, passed });
        if (passed && activeCourseId) {
          updateAcademyProgress({ earnedCertificateIds: Array.from(new Set([...earnedCertificates, activeCourseId])) });
          addPoints(1000, 'ACADEMY_GRADUATE');
        }
      }
    }
  };

  const getCourseProgress = (course: Course) => {
    const courseLessonIds = course.lessons.map(l => l.id);
    const completedInCourse = completedLessonIds.filter(id => courseLessonIds.includes(id));
    return Math.round((completedInCourse.length / course.lessons.length) * 100);
  };

  // LESSON PLAYER VIEW
  if (activeCourse && activeLesson) {
    if (isQuizMode && activeCourse.quiz) {
      const quiz = activeCourse.quiz;
      const currentQuestion = quiz.questions[quizStep];

      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
          <div className="w-full max-w-2xl bg-slate-900 rounded-[3rem] border border-white/10 p-10 shadow-3xl space-y-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
              <div 
                className="h-full bg-secondary transition-all duration-500" 
                style={{ width: `${((quizStep + (quizResult ? 1 : 0)) / quiz.questions.length) * 100}%` }}
              />
            </div>

            {!quizResult ? (
              <motion.div 
                key={quizStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Question {quizStep + 1} of {quiz.questions.length}</span>
                  <h2 className="text-2xl font-heading font-black uppercase tracking-tight">{currentQuestion.question}</h2>
                </div>

                <div className="grid gap-3">
                  {currentQuestion.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuizAnswer(idx)}
                      className="w-full text-left p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-secondary/50 transition-all font-bold text-sm"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="text-center space-y-8">
                <div className="mx-auto h-24 w-24 rounded-full bg-white/5 flex items-center justify-center">
                  {quizResult.passed ? (
                    <Award className="h-12 w-12 text-secondary animate-bounce" />
                  ) : (
                    <Lock className="h-12 w-12 text-slate-500" />
                  )}
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-heading font-black uppercase tracking-tight">
                    {quizResult.passed ? 'Certification Earned!' : 'Keep Learning!'}
                  </h2>
                  <p className="text-slate-400 font-medium">
                    You scored {quizResult.score} out of {quiz.questions.length}.
                    {quizResult.passed ? " You've mastered this module." : " Review the material and try again to earn your certificate."}
                  </p>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      setIsQuizMode(false);
                      if (quizResult.passed) {
                        updateAcademyProgress({ activeCourseId: null, activeLessonId: null });
                        setShowCertificate(activeCourseId);
                      }
                    }}
                    className="flex-grow rounded-2xl bg-primary py-4 text-[10px] font-black uppercase tracking-widest"
                  >
                    {quizResult.passed ? 'Back to Academy' : 'Review Lessons'}
                  </button>
                  {!quizResult.passed && (
                    <button 
                      onClick={startQuiz}
                      className="flex-grow rounded-2xl bg-secondary py-4 text-[10px] font-black uppercase tracking-widest"
                    >
                      Retry Quiz
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-950 text-white">
        {/* PLAYER HEADER */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => updateAcademyProgress({ activeCourseId: null, activeLessonId: null })}
              className="rounded-full bg-white/5 p-2 hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-sm font-black uppercase tracking-tight line-clamp-1">{activeCourse.title}</h2>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                <span>{activeCourse.instructor.name}</span>
                <span className="h-1 w-1 rounded-full bg-slate-700" />
                <span>{activeLesson.title}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden sm:flex flex-col items-end">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
               <div className="mt-1 h-1.5 w-32 rounded-full bg-slate-800">
                 <div 
                  className="h-full rounded-full bg-secondary transition-all duration-1000" 
                  style={{ width: `${getCourseProgress(activeCourse)}%` }}
                 />
               </div>
             </div>
             {getCourseProgress(activeCourse) === 100 && activeCourse.quiz ? (
               <button 
                onClick={startQuiz}
                className="rounded-full bg-accent px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-primary shadow-xl shadow-accent/20 hover:scale-105 transition-all"
               >
                 Take Final Quiz
               </button>
             ) : (
               <button className="rounded-full bg-secondary px-6 py-2.5 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-secondary/20 hover:scale-105 active:scale-95 transition-all">
                 Next Lesson
               </button>
             )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row h-[calc(100vh-73px)]">
          {/* MAIN PLAYER AREA */}
          <div className="flex-grow overflow-y-auto custom-scrollbar p-6 lg:p-10">
            <div className="mx-auto max-w-4xl space-y-8">
              {/* VIDEO PLACEHOLDER */}
              <div className="relative aspect-video overflow-hidden rounded-[2.5rem] bg-slate-900 border border-white/5 shadow-2xl group">
                 <img 
                   src={activeCourse.thumbnail}
                   className="h-full w-full object-cover opacity-40 blur-sm scale-105"
                   alt="background"
                 />
                 <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                    <div className="h-24 w-24 rounded-full bg-secondary flex items-center justify-center shadow-3xl group-hover:scale-110 transition-transform cursor-pointer">
                      <PlayCircle className="h-12 w-12 text-white" />
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-heading font-black uppercase tracking-tight">{activeLesson.title}</h3>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Masterclass Lesson • {activeLesson.duration}</p>
                    </div>
                 </div>
                 {/* Video Controls Fake */}
                 <div className="absolute bottom-6 left-6 right-6 flex items-center gap-4">
                    <div className="h-1.5 flex-grow rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full w-1/3 bg-secondary rounded-full" />
                    </div>
                    <span className="text-[10px] font-mono text-white/50">04:20 / {activeLesson.duration}</span>
                 </div>
              </div>

              {/* CONTENT INFO */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
                <div className="md:col-span-2 space-y-8">
                  <div className="space-y-2">
                    <h1 className="text-3xl font-heading font-black uppercase tracking-tight">{activeLesson.title}</h1>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-slate-400 leading-relaxed text-sm font-medium">
                        {activeLesson.content || "In this core module, we dive deep into the specific strategies that differentiate high-income specialists from generalists. We'll cover the architectural frameworks, negotiation triggers, and regional supply chain nuances mentioned in the syllabus."}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <button className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                      <FileText className="h-4 w-4 text-secondary" />
                      Resources
                    </button>
                    <button className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                      <MessageSquare className="h-4 w-4 text-accent" />
                      Discussion
                    </button>
                  </div>

                  {/* NOTES PANEL */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">My Study Notes</h3>
                       <span className="text-[10px] font-medium text-slate-600">Saved automatically</span>
                    </div>
                    <textarea 
                      value={lessonNotes[activeLesson.id] || ''}
                      onChange={(e) => handleLessonNoteChange(activeLesson.id, e.target.value)}
                      placeholder="Type your notes here... (e.g. key takeaways, questions for your mentor)"
                      className="w-full h-40 rounded-[2rem] bg-white/5 border border-white/10 p-6 text-sm font-medium outline-none focus:border-secondary/50 focus:ring-1 focus:ring-secondary/50 transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-2xl bg-white/5 p-5 border border-white/5">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Instructor</h4>
                    <div className="flex items-center gap-3">
                      <img src={activeCourse.instructor.avatar || null} className="h-12 w-12 rounded-full border-2 border-secondary object-cover" alt={activeCourse.instructor.name} />
                      <div>
                        <p className="text-xs font-black uppercase tracking-tight">{activeCourse.instructor.name}</p>
                        <p className="text-[9px] font-bold text-secondary uppercase tracking-widest">{activeCourse.instructor.rank}</p>
                      </div>
                    </div>
                    <p className="mt-4 text-[10px] leading-relaxed text-slate-400 font-medium">{activeCourse.instructor.bio}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PLAYLIST SIDEBAR */}
          <div className="w-full lg:w-96 border-l border-white/10 bg-slate-900/30 overflow-y-auto custom-scrollbar">
            <div className="p-6 border-b border-white/10">
               <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                 <GraduationCap className="h-4 w-4 text-secondary" />
                 Course Content
               </h3>
            </div>
            <div className="divide-y divide-white/5">
              {activeCourse.lessons.map((lesson, idx) => {
                const isCompleted = completedLessonIds.includes(lesson.id);
                const isActive = activeLessonId === lesson.id;
                return (
                  <button
                    key={lesson.id}
                    onClick={() => updateAcademyProgress({ activeLessonId: lesson.id })}
                    className={`w-full flex items-start gap-4 p-5 text-left transition-all hover:bg-white/5 ${isActive ? 'bg-secondary/10 border-l-4 border-secondary' : ''}`}
                  >
                    <div className="relative shrink-0 mt-0.5">
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-secondary" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-slate-700 flex items-center justify-center text-[8px] font-black text-slate-500">
                          {idx + 1}
                        </div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <p className={`text-[11px] font-black uppercase tracking-tight leading-tight ${isActive ? 'text-secondary' : 'text-slate-200'}`}>
                        {lesson.title}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                        <Clock className="h-3 w-3" />
                        <span>{lesson.duration}</span>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLessonCompletion(lesson.id);
                      }}
                      className={`p-1 rounded-md transition-colors ${isCompleted ? 'text-secondary' : 'text-slate-700 hover:text-slate-500'}`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const marketingFilteredCourses = courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           course.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    const faqs = [
      {
        question: "How long do I have access?",
        answer: "Once enrolled, you secure lifetime access to all learning materials, templates, and recorded masterclasses. Learn at your own pace with zero pressure or algorithmic timeline feeds."
      },
      {
        question: "Do I receive certificates?",
        answer: "Absolutely. Pass the interactive final quiz at the end of each masterclass to unlock your cryptographic, verified completion certificate. These certificates are LinkedIn-ready, portfolio-ready, and verified."
      },
      {
        question: "Can beginners join?",
        answer: "Yes, our masterclasses are structured to go from fundamental concepts up to advanced, high-ticket execution strategies. No previous experience is required to start your sovereign journey."
      },
      {
        question: "Can I learn on mobile?",
        answer: "Yes! BIG Academy is built on clean, modern responsive design parameters. Access your classes, study notes, templates, and circles beautifully from any modern mobile device."
      },
      {
        question: "Are mentors available?",
        answer: "Yes, our certified female industry guides actively monitor study circles, participate in live events, and provide comprehensive feedback on your assignments."
      }
    ];

    const learningPaths = [
      {
        title: "Financial Independence",
        icon: DollarSign,
        courses: "3 Masterclasses",
        desc: "Take control of cash flow forecasting, unit economics, personal credit, and grant proposals.",
        color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
      },
      {
        title: "Career Growth",
        icon: Briefcase,
        courses: "4 Masterclasses",
        desc: "Build high-income tech skills, master copywriting, resume building, and digital negotiations.",
        color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20"
      },
      {
        title: "Entrepreneurship",
        icon: TrendingUp,
        courses: "3 Masterclasses",
        desc: "Plan, launch, register, and scale your brand with proven direct-to-consumer and B2B blueprints.",
        color: "bg-rose-500/10 text-rose-600 border-rose-500/20"
      },
      {
        title: "Digital Skills",
        icon: Smartphone,
        courses: "4 Masterclasses",
        desc: "Master social commerce, video marketing, modern web technologies, and AI leverage tools.",
        color: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20"
      },
      {
        title: "Leadership",
        icon: GraduationCap,
        courses: "2 Masterclasses",
        desc: "Step into public speaking, emotional resilience, project management, and sovereign decision-making.",
        color: "bg-purple-500/10 text-purple-600 border-purple-500/20"
      },
      {
        title: "Wellbeing",
        icon: Heart,
        courses: "2 Masterclasses",
        desc: "Balance high achievement with mental clarity, study boundaries, somatic stress relief, and alignment.",
        color: "bg-amber-500/10 text-amber-600 border-amber-500/20"
      }
    ];

    const resourcesList = [
      { name: "Business Templates", type: "Notion & PDF", size: "4.8 MB" },
      { name: "Budget Planners", type: "Google Sheets", size: "1.2 MB" },
      { name: "Resume Templates", type: "Word & Canva", size: "2.1 MB" },
      { name: "Pitch Decks", type: "Google Slides", size: "15.4 MB" },
      { name: "Grant Templates", type: "PDF Guide", size: "3.7 MB" },
      { name: "Marketing Kits", type: "Canva Templates", size: "8.9 MB" },
      { name: "Canva Templates", type: "Direct Access", size: "Online" },
      { name: "Financial Trackers", type: "Excel / Sheets", size: "2.4 MB" },
      { name: "Workbooks", type: "Printable PDF", size: "10.2 MB" },
      { name: "Notion Templates", type: "Workspace Link", size: "Online" },
      { name: "Google Sheets", type: "Direct Copy", size: "Online" }
    ];

    const timelineSteps = [
      { id: "01", step: "Discover", title: "Analyze and Align", desc: "Evaluate your passions and market demands. Find the exact high-ticket domain aligned with your personal sovereignty." },
      { id: "02", step: "Choose Path", title: "Define Curriculum", desc: "Lock in a curated, self-paced curriculum path designed to build highly sought-after expertise with clear milestones." },
      { id: "03", step: "Enroll", title: "Claim Your Seat", desc: "Unlock premium student features and secure immediate placement in a supportive peer accountability cohort." },
      { id: "04", step: "Learn", title: "Absorb Masterclasses", desc: "Gain highly specific operational knowledge through clean, distractions-free interactive masterclasses." },
      { id: "05", step: "Practice", title: "Execute Action-Steps", desc: "Utilize beautiful downloadable workbooks and fillable sheets to implement your learnings instantly." },
      { id: "06", step: "Mentorship", title: "Receive Coach Feedback", desc: "Submit course assignments directly to our certified mentors for constructive, personal feedback circles." },
      { id: "07", step: "Certificate", title: "Secure Cryptographic Proof", desc: "Test your mastery on high-integrity end-of-module quizzes to generate a beautiful, LinkedIn-ready shareable badge." },
      { id: "08", step: "Apply Skills", title: "Launch and Scale", desc: "Deploy your high-income skills immediately by launching digital funnels, pitching to clients, or registering LLCs." },
      { id: "09", step: "Grow", title: "Pave Financial Sovereignty", desc: "Sustain your long-term success with continuing mentorship, alumni networks, and direct grant fund match eligibility." }
    ];

    return (
      <div className="bg-slate-50 min-h-screen py-12 sm:py-20 animate-fade-in text-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* HERO SECTION */}
          <div className="relative rounded-[3rem] bg-gradient-to-tr from-primary to-slate-900 text-white p-8 sm:p-16 overflow-hidden mb-20 shadow-2xl border border-white/5">
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="absolute -top-32 -left-32 h-96 w-96 bg-secondary/15 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -right-32 h-96 w-96 bg-accent/10 rounded-full blur-3xl" />
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6 text-left">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-secondary">
                  <GraduationCap className="h-4 w-4" />
                  BIG Academy
                </span>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-black uppercase tracking-tight leading-none text-white">
                  Learn the Skills <br />
                  That <span className="text-secondary text-glow-sm">Change Your Life</span>.
                </h1>
                <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl leading-relaxed font-medium">
                  Build financial independence, grow your career, launch your business, and become the sovereign, empowered woman you are meant to be. Simple tools, expert mentorship, and sisterhood support.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    onClick={() => setCurrentView?.('auth')}
                    className="rounded-full bg-secondary hover:bg-white hover:text-primary transition-all px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-secondary/20 active:scale-95 cursor-pointer"
                  >
                    Start Learning
                  </button>
                  <button
                    onClick={() => {
                      const el = document.getElementById('featured-syllabus');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="rounded-full border border-white/20 bg-white/5 px-8 py-4 text-xs font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all active:scale-95 cursor-pointer"
                  >
                    Explore Courses
                  </button>
                </div>
              </div>
              
              <div className="lg:col-span-5 relative">
                <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-slate-800 border border-white/10 shadow-2xl relative group">
                  <img 
                    src="/images/african_woman_masterclass.jpg" 
                    alt="African Women Learning" 
                    className="h-full w-full object-cover opacity-80" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/30 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-left">
                    <p className="text-[10px] font-black text-secondary uppercase tracking-widest">Active Mentorship</p>
                    <p className="text-base font-heading font-black text-white uppercase tracking-tight">Professional workspace and peer synergy</p>
                  </div>
                </div>

                {/* Floating Info Cards */}
                <div className="absolute -top-6 -left-6 bg-white text-primary rounded-2xl p-4 shadow-xl border border-slate-100 hidden sm:flex items-center gap-3" style={{ animationDuration: '6s' }}>
                  <div className="h-9 w-9 bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center justify-center">
                    <Check className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Flexibility</p>
                    <p className="text-xs font-black text-primary">Self-paced Learning</p>
                  </div>
                </div>

                <div className="absolute -bottom-6 -right-4 bg-white text-primary rounded-2xl p-4 shadow-xl border border-slate-100 hidden sm:flex items-center gap-3" style={{ animationDuration: '8s' }}>
                  <div className="h-9 w-9 bg-indigo-500/10 text-indigo-600 rounded-xl flex items-center justify-center">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Guaranteed</p>
                    <p className="text-xs font-black text-primary">Expert Mentors</p>
                  </div>
                </div>

                <div className="absolute top-1/2 -right-12 -translate-y-1/2 bg-white text-primary rounded-2xl p-4 shadow-xl border border-slate-100 hidden md:flex items-center gap-3">
                  <div className="h-9 w-9 bg-rose-500/10 text-rose-600 rounded-xl flex items-center justify-center">
                    <Award className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Certified</p>
                    <p className="text-xs font-black text-primary">Verified Certificates</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SOCIAL PROOF SECTION */}
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 sm:p-12 shadow-xl shadow-slate-100/50 mb-20 max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
              <div className="space-y-1">
                <p className="text-3xl sm:text-4xl font-heading font-black text-primary">38+</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Practical Courses</p>
              </div>
              <div className="space-y-1 pt-6 md:pt-0">
                <p className="text-3xl sm:text-4xl font-heading font-black text-secondary">100+</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Women Learning</p>
              </div>
              <div className="space-y-1 pt-6 md:pt-0">
                <p className="text-3xl sm:text-4xl font-heading font-black text-primary">9</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Learning Tracks</p>
              </div>
              <div className="space-y-1 pt-6 md:pt-0">
                <p className="text-3xl sm:text-4xl font-heading font-black text-accent">12</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Industry Mentors</p>
              </div>
              <div className="col-span-2 md:col-span-1 space-y-1 pt-6 md:pt-0">
                <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Growing Every Month</p>
                <p className="text-[9px] font-bold text-slate-400">Supportive Community</p>
              </div>
            </div>
          </div>

          {/* WHY BIG ACADEMY */}
          <div className="max-w-6xl mx-auto mb-20 sm:mb-28 space-y-12">
            <div className="text-center space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-secondary">A Custom Environment</span>
              <h2 className="text-2xl sm:text-4xl font-heading font-black text-primary uppercase tracking-tight">Why Women Choose BIG Academy</h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto font-medium">
                We design with structural discipline to help African women secure lasting financial leverage and personal sovereignty.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: Sparkles,
                  title: "Practical Skills",
                  desc: "Learn things that improve your real life. Skip academic filler and master concrete templates, budgets, and plans."
                },
                {
                  icon: Users,
                  title: "Mentorship",
                  desc: "Learn from women who've done it. Access certified female leaders who've successfully scaled corporate portfolios and startups."
                },
                {
                  icon: Heart,
                  title: "Community",
                  desc: "Grow alongside ambitious women. Form deep study circles, collaborate on assignments, and eliminate isolation."
                },
                {
                  icon: Laptop,
                  title: "Flexible Learning",
                  desc: "Study anywhere, anytime. Designed to seamlessly fit your schedule with recorded, high-definition classes."
                }
              ].map((card, idx) => {
                const Icon = card.icon;
                return (
                  <div key={idx} className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-xl shadow-slate-100/30 flex flex-col items-start gap-6 hover:-translate-y-1 transition-all text-left">
                    <div className="h-12 w-12 rounded-2xl bg-secondary/5 flex items-center justify-center text-secondary border border-secondary/10">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-base font-heading font-black text-primary uppercase tracking-tight">{card.title}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">{card.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* LEARNING PATHS SECTION */}
          <div className="max-w-6xl mx-auto mb-20 sm:mb-28 space-y-12">
            <div className="text-center space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Comprehensive Tracks</span>
              <h2 className="text-2xl sm:text-4xl font-heading font-black text-primary uppercase tracking-tight">Curated Learning Paths</h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto font-medium">
                Sovereignty requires multiple disciplines. Explore our high-ticket structured pathways.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {learningPaths.map((path, idx) => {
                const Icon = path.icon;
                return (
                  <div key={idx} className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-lg shadow-slate-100/50 flex flex-col justify-between hover:shadow-xl transition-all text-left">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className={`h-11 w-11 rounded-xl flex items-center justify-center border ${path.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="text-[9px] font-black bg-slate-100 text-primary uppercase tracking-widest px-3 py-1 rounded-full">
                          {path.courses}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        <h3 className="text-lg font-heading font-black text-primary uppercase tracking-tight">{path.title}</h3>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">{path.desc}</p>
                      </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-50">
                      <button 
                        onClick={() => setCurrentView?.('auth')}
                        className="w-full text-center py-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-secondary hover:border-secondary hover:text-white text-[9px] font-black uppercase tracking-widest text-primary transition-all cursor-pointer"
                      >
                        View Learning Path
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FEATURED COURSES SECTION */}
          <div id="featured-syllabus" className="max-w-6xl mx-auto mb-20 sm:mb-28 space-y-12">
            <div className="text-center space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Active Syllabus</span>
              <h2 className="text-2xl sm:text-4xl font-heading font-black text-primary uppercase tracking-tight">Featured Courses</h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto font-medium">
                Our core, highly action-oriented training curriculums designed to empower women with practical skills.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {marketingFilteredCourses.map((course) => (
                <div 
                  key={course.id}
                  className="group bg-white border border-slate-100 rounded-[2.5rem] p-5 shadow-xl shadow-slate-100/50 hover:-translate-y-1 transition-all flex flex-col justify-between text-left"
                >
                  <div className="space-y-4">
                    {/* Course Image & Badge Overlays */}
                    <div className="relative aspect-video overflow-hidden rounded-3xl bg-slate-100 border border-slate-100">
                      <img 
                        src={course.thumbnail || undefined} 
                        alt={course.title} 
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Top Overlay: Level & Free Status */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="bg-white/95 backdrop-blur-md text-[8px] font-black uppercase tracking-widest text-primary px-3 py-1 rounded-full shadow-sm">
                          {course.level}
                        </span>
                        <span className="bg-secondary text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                          Free for Members
                        </span>
                      </div>

                      {/* Top Right Overlay: Rating with Star */}
                      <div className="absolute top-3 right-3">
                        <span className="bg-amber-500/95 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm flex items-center gap-1 font-bold">
                          <Star className="h-2.5 w-2.5 fill-current text-white" /> {course.rating || '4.9'}
                        </span>
                      </div>

                      {/* Bottom Overlay: Certificate Badge */}
                      <div className="absolute bottom-3 left-3">
                        <span className="bg-emerald-600/90 backdrop-blur-sm text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm flex items-center gap-1 font-bold">
                          <Award className="h-3 w-3" /> Certificate Included
                        </span>
                      </div>
                    </div>

                    {/* Course Details */}
                    <div className="space-y-2 px-1">
                      <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-secondary">
                        <span className="bg-secondary/5 border border-secondary/10 px-2.5 py-1 rounded-lg">{course.category}</span>
                        <span className="flex items-center gap-1 text-slate-400 font-bold">
                          <Clock className="h-3 w-3" /> {course.duration}
                        </span>
                      </div>
                      <h3 className="text-lg font-heading font-black text-primary uppercase tracking-tight group-hover:text-secondary transition-colors line-clamp-1">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 font-medium">
                        {course.description}
                      </p>
                      
                      {/* Lesson Count and Stats */}
                      <div className="pt-2 flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                        <span className="flex items-center gap-1 font-bold">
                          <BookOpen className="h-3 w-3 text-secondary" /> {course.lessons.length} Lessons
                        </span>
                        <span className="flex items-center gap-1 font-bold">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Lifetime Access
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Mentor Profile / Instructor Section */}
                  <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-3 px-1">
                    <img 
                      src={course.instructor.avatar || undefined} 
                      className="h-9 w-9 rounded-full object-cover border border-slate-200 shadow-sm animate-fade-in" 
                      alt={course.instructor.name}
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-black text-primary leading-none">{course.instructor.name}</span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">{course.instructor.rank}</span>
                    </div>
                  </div>

                  {/* Price & Call-To-Action Explore Button */}
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between px-1">
                    <div className="flex flex-col text-left">
                      <span className="text-[7px] font-black uppercase tracking-widest text-slate-400">One-time Purchase</span>
                      <span className="text-sm font-black text-secondary">
                        $19.00 <span className="text-[8px] text-slate-400 font-medium lowercase">/ lifetime</span>
                      </span>
                    </div>

                    <button 
                      onClick={() => setPreviewCourse(course)}
                      className="rounded-xl bg-slate-50 border border-slate-200 hover:bg-secondary hover:border-secondary hover:text-white px-5 py-3 text-[8px] font-black uppercase tracking-widest text-primary transition-all cursor-pointer font-bold hover:scale-105 active:scale-[0.98] shadow-sm hover:shadow"
                    >
                      Explore Course
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* THE TIMELINE EXPERIENCE */}
          <div className="max-w-4xl mx-auto mb-20 sm:mb-28 space-y-16">
            <div className="text-center space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-secondary">The Pathway</span>
              <h2 className="text-2xl sm:text-4xl font-heading font-black text-primary uppercase tracking-tight">Learning Experience</h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto font-medium">
                Step-by-step vertical curriculum timelines designed to ensure seamless consistency.
              </p>
            </div>

            {/* Vertical Timeline */}
            <div className="relative border-l-2 border-slate-200 ml-4 md:ml-32 space-y-12">
              {timelineSteps.map((item, idx) => (
                <div key={idx} className="relative pl-8 md:pl-12 group text-left">
                  <div className="absolute -left-[11px] top-1.5 h-5 w-5 rounded-full border-4 border-white bg-secondary group-hover:bg-primary transition-colors shadow-sm" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                    <div className="md:col-span-3">
                      <span className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">{item.id} / {item.step}</span>
                      <h4 className="text-sm font-heading font-black text-primary uppercase tracking-tight">{item.title}</h4>
                    </div>
                    <p className="md:col-span-9 text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MEET OUR MENTORS */}
          <div className="max-w-6xl mx-auto mb-20 sm:mb-28 space-y-12">
            <div className="text-center space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Our Guides</span>
              <h2 className="text-2xl sm:text-4xl font-heading font-black text-primary uppercase tracking-tight">Meet Our Mentors</h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto font-medium">
                Learn from certified, experienced female practitioners who live and design the methods they teach.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "Fatma J.",
                  role: "Mentor",
                  experience: "12+ Years Experience",
                  expertise: "Business Architecture & Operations",
                  avatar: "/images/african_woman_portrait.jpg",
                  bio: "Experienced entrepreneur and designer helping women launch sustainable ventures with practical operational plans."
                },
                {
                  name: "Wanjiku K.",
                  role: "Member Practitioner",
                  experience: "8+ Years Experience",
                  expertise: "SEO Content Architecture & Funnels",
                  avatar: "/images/african_woman_portrait.jpg",
                  bio: "Growth marketer and search optimization specialist dedicated to helping female entrepreneurs establish organic digital pull."
                },
                {
                  name: "Dr. Amina",
                  role: "Coach",
                  experience: "15+ Years Experience",
                  expertise: "Unit Economics & Sovereign Credit",
                  avatar: "/images/african_woman_portrait.jpg",
                  bio: "Doctoral researcher and capital advisor training founders to build sovereign balance sheets and secure growth funding."
                }
              ].map((mentor, idx) => (
                <div key={idx} className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-lg shadow-slate-100/50 flex flex-col justify-between text-left">
                  <div className="space-y-4">
                    <div className="relative aspect-square max-h-48 rounded-3xl overflow-hidden bg-slate-100">
                      <img src={mentor.avatar} alt={mentor.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md text-[8px] font-black uppercase tracking-widest text-primary px-3 py-1 rounded-full">
                        {mentor.experience}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <h3 className="text-lg font-heading font-black text-primary uppercase tracking-tight">{mentor.name}</h3>
                        <p className="text-[9px] font-black text-secondary uppercase tracking-widest">{mentor.role}</p>
                      </div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{mentor.expertise}</p>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">{mentor.bio}</p>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-50">
                    <button 
                      onClick={() => setCurrentView?.('auth')}
                      className="w-full text-center py-3 text-[9px] font-black uppercase tracking-widest text-primary hover:text-secondary transition-colors cursor-pointer font-bold"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SUCCESS STORIES */}
          <div className="max-w-5xl mx-auto mb-20 sm:mb-28 space-y-12">
            <div className="text-center space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Alumni Spotlights</span>
              <h2 className="text-2xl sm:text-4xl font-heading font-black text-primary uppercase tracking-tight">Success Stories</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              {[
                {
                  quote: "I started with no business idea. Today I employ three people and run a high-ticket sustainable trade brand.",
                  name: "Njeri W.",
                  location: "Nairobi, Kenya",
                  role: "Founder, Green Retail Group",
                  before: "No business idea, insecure financial future",
                  after: "Employs three people, stable revenue"
                },
                {
                  quote: "The direct-response copywriting track and study circles helped me secure stable international retainers with absolute confidence.",
                  name: "Amina O.",
                  location: "Lagos, Nigeria",
                  role: "Sovereign Copywriter",
                  before: "Random low-paid freelance gigs, insecure billing",
                  after: "Premium retainer clients, 3x income increase"
                }
              ].map((story, idx) => (
                <div key={idx} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-100/30 relative overflow-hidden">
                  <span className="text-7xl text-secondary/5 absolute -top-4 left-6 font-serif select-none pointer-events-none">“</span>
                  <div className="relative z-10 space-y-6">
                    <p className="text-sm sm:text-base text-primary font-bold italic leading-relaxed">{story.quote}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 rounded-2xl p-4 border border-slate-100 text-[11px] font-medium leading-relaxed text-slate-500">
                      <div>
                        <span className="block text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Before</span>
                        <p className="text-red-500 font-bold">{story.before}</p>
                      </div>
                      <div>
                        <span className="block text-[8px] font-black uppercase tracking-widest text-secondary mb-1">After</span>
                        <p className="text-emerald-600 font-bold">{story.after}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <div className="h-10 w-10 rounded-full bg-secondary/15 flex items-center justify-center font-heading font-black text-secondary text-sm">
                        {story.name[0]}
                      </div>
                      <div>
                        <p className="text-xs font-black text-primary uppercase tracking-tight leading-none">{story.name}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{story.role} • {story.location}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CERTIFICATE SECTION */}
          <div className="max-w-6xl mx-auto rounded-[3rem] bg-white border border-slate-100 shadow-xl p-8 sm:p-14 mb-20 text-left">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              <div className="lg:col-span-6 space-y-6">
                <span className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/5 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-secondary">
                  <Award className="h-4 w-4" />
                  Credentials
                </span>
                <h2 className="text-3xl sm:text-4xl font-heading font-black text-primary uppercase tracking-tight leading-none">
                  Graduate With <br /><span className="text-secondary">Confidence</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                  Test your technical expertise through challenging end-of-module interactive quizzes. Earn cryptography-ready, validated digital certifications that confirm your real competence.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    "Verified certificates",
                    "LinkedIn ready",
                    "Employer friendly",
                    "Portfolio ready"
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3" />
                      </div>
                      <span className="text-xs font-black text-primary uppercase tracking-tight">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="bg-slate-50 border-4 border-slate-200 rounded-2xl p-6 sm:p-8 text-center space-y-6 relative overflow-hidden shadow-lg aspect-[1.4/1]">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary to-primary" />
                  <div className="absolute -top-16 -right-16 h-36 w-36 bg-secondary/5 rounded-full blur-xl" />
                  
                  <div className="space-y-1">
                    <Award className="h-10 w-10 text-secondary mx-auto" />
                    <p className="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em]">Believe In Girls Academy</p>
                    <h3 className="text-lg font-heading font-black text-primary uppercase tracking-tight">Sovereign Financial Analyst</h3>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[8px] text-slate-400 font-medium">This is to verify that the sister-scholar has mastered the core frameworks of</p>
                    <p className="text-xs font-black text-primary uppercase tracking-wide">Financial Cash Flow Strategy & Raising Capital</p>
                  </div>

                  <div className="flex justify-between items-end pt-4 border-t border-slate-100">
                    <div className="text-left">
                      <p className="text-[6px] font-bold text-slate-400 uppercase tracking-widest">Admissions Director</p>
                      <p className="font-serif text-[10px] text-primary italic">Fatma J.</p>
                    </div>
                    <div className="h-10 w-10 rounded-full border border-secondary/20 bg-secondary/5 flex items-center justify-center">
                      <Award className="h-5 w-5 text-secondary" />
                    </div>
                    <div className="text-right text-left">
                      <p className="text-[6px] font-bold text-slate-400 uppercase tracking-widest">Valid Registration</p>
                      <p className="text-[8px] font-black text-primary">BIG-0842-2026</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* THE RESOURCES HUB */}
          <div className="max-w-6xl mx-auto mb-20 sm:mb-28 space-y-12 text-left">
            <div className="text-center space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Downloadable Tools</span>
              <h2 className="text-2xl sm:text-4xl font-heading font-black text-primary uppercase tracking-tight">Ready-To-Use Resources</h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto font-medium">
                Ditch empty notebooks. Download high-converting templates directly to save time and secure deals.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {resourcesList.map((res, idx) => (
                <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-all flex flex-col justify-between items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-primary uppercase tracking-tight leading-tight line-clamp-1">{res.name}</h4>
                    <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest block mt-1">{res.type}</span>
                  </div>
                  <button 
                    onClick={() => setCurrentView?.('auth')}
                    className="rounded-lg bg-slate-50 text-[7px] font-black uppercase tracking-widest text-secondary px-3 py-1.5 hover:bg-secondary hover:text-white transition-all cursor-pointer"
                  >
                    Get Template
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* THE MORE THAN COURSES COMMUNITY */}
          <div className="max-w-6xl mx-auto mb-20 sm:mb-28 space-y-12">
            <div className="text-center space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-secondary">The Sisterhood Ecosystem</span>
              <h2 className="text-2xl sm:text-4xl font-heading font-black text-primary uppercase tracking-tight">More Than Just Online Courses</h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto font-medium">
                Isolation is the primary blocker of progress. Our learning platform is coupled with peer accountability mechanics.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              {[
                { title: "Discussion Groups", desc: "Engage in continuous, helpful discussions. Connect, share news, and ask questions to specialized domain spaces." },
                { title: "Mentorship", desc: "Gain advice directly from certified coaches. Submit mock plans, outline business decks, and secure code-review feedback." },
                { title: "Events", desc: "Attend live masterclasses, interactive strategy roundtables, global virtual meetups, and member networking circles." },
                { title: "Networking", desc: "Instantly locate and form joint-alliances with other motivated entrepreneurs inside the Global BIG Club platform." },
                { title: "Study Circles", desc: "Collaborate directly in private virtual study rooms designed for cohort-by-cohort assignment accountability." },
                { title: "Accountability", desc: "Establish stable streaks, tracking checkboxes, and continuous peer-reviews to maintain daily consistency." }
              ].map((item, idx) => (
                <div key={idx} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-3">
                  <div className="h-9 w-9 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                    <Check className="h-4 w-4" />
                  </div>
                  <h4 className="text-sm font-heading font-black text-primary uppercase tracking-tight">{item.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* PRICING SECTION */}
          <div className="max-w-5xl mx-auto mb-20 sm:mb-28 space-y-12">
            <div className="text-center space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Zero Surprises</span>
              <h2 className="text-2xl sm:text-4xl font-heading font-black text-primary uppercase tracking-tight">Simple, Clear Pricing</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              {[
                {
                  tier: "Free Courses",
                  price: "Free",
                  period: "Forever",
                  desc: "Start exploring our high-integrity learning ecosystems.",
                  feats: [
                    "Select introductory masterclass lessons",
                    "Public general community spaces",
                    "Basic completion digital badges",
                    "Standard workbook file templates"
                  ],
                  cta: "Explore Free Content",
                  popular: false
                },
                {
                  tier: "Premium Courses",
                  price: "$19",
                  period: "Per masterclass",
                  desc: "Master specific technical business systems step-by-step.",
                  feats: [
                    "Complete lifetime access to select masterclass",
                    "All lessons, interactive exercises & resources",
                    "Verified cryptographic completion badge",
                    "Intimate study accountability circles"
                  ],
                  cta: "Enroll Premium Module",
                  popular: true
                },
                {
                  tier: "Full Membership",
                  price: "$149",
                  period: "Per year",
                  desc: "Unlock maximum sovereign leverage inside the ecosystem.",
                  feats: [
                    "Uncapped access to all 38+ masterclasses",
                    "1-on-1 certified mentor matched checkins",
                    "Unlimited downloads of all templates & trackers",
                    "Direct eligibility for BIG Fund grant matching",
                    "Priority invitations to live networking meetups"
                  ],
                  cta: "Claim Full Membership",
                  popular: false
                }
              ].map((tier, idx) => (
                <div 
                  key={idx} 
                  className={`bg-white border rounded-[2.5rem] p-8 flex flex-col justify-between relative ${
                    tier.popular ? 'border-secondary ring-2 ring-secondary/20 shadow-xl' : 'border-slate-100 shadow-md'
                  }`}
                >
                  {tier.popular && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-secondary text-white text-[8px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                      Most Popular
                    </span>
                  )}
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-lg font-heading font-black text-primary uppercase tracking-tight">{tier.tier}</h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-heading font-black text-primary">{tier.price}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">/ {tier.period}</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed font-medium">{tier.desc}</p>
                    </div>

                    <div className="h-px bg-slate-100" />

                    <div className="space-y-3">
                      {tier.feats.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-500 leading-relaxed font-medium">
                          <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={() => setCurrentView?.('auth')}
                    className={`mt-8 w-full text-center py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer font-bold ${
                      tier.popular 
                        ? 'bg-secondary text-white hover:bg-primary shadow-lg shadow-secondary/15' 
                        : 'bg-slate-50 text-primary border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {tier.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ADMISSION FAQS */}
          <div className="max-w-3xl mx-auto mb-20 sm:mb-28 space-y-8">
            <h2 className="text-center text-xl sm:text-3xl font-heading font-black text-primary uppercase tracking-tight">Admissions FAQs</h2>
            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={idx} className="bg-white border border-slate-100 rounded-2xl overflow-hidden transition-all shadow-sm">
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full text-left p-6 font-heading font-black text-sm uppercase tracking-tight text-primary flex justify-between items-center hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <span>{faq.question}</span>
                      <span className="text-slate-400 text-lg font-normal leading-none">{isOpen ? '−' : '+'}</span>
                    </button>
                    {isOpen && (
                      <div className="p-6 pt-0 text-xs sm:text-sm text-slate-500 leading-relaxed border-t border-slate-50 font-medium text-left">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* FINAL HIGH-IMPACT CTA */}
          <div className="max-w-4xl mx-auto rounded-[3rem] bg-gradient-to-br from-primary to-slate-900 p-8 sm:p-14 text-center border border-white/5 shadow-2xl relative overflow-hidden mb-20 text-white">
            <div className="absolute -top-32 -left-32 h-64 w-64 bg-secondary/15 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -right-32 h-64 w-64 bg-accent/5 rounded-full blur-3xl" />
            
            <div className="relative z-10 space-y-6">
              <h2 className="text-2xl sm:text-4xl font-heading font-black uppercase tracking-tight text-white leading-none">
                Your Future Starts With One Decision.
              </h2>
              <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed font-medium">
                Every successful woman starts somewhere. Choose one course. Build one skill. Take one step. We'll walk the journey with you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <button
                  onClick={() => setCurrentView?.('auth')}
                  className="rounded-full bg-secondary px-10 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-secondary/25 hover:bg-white hover:text-primary transition-all active:scale-95 cursor-pointer font-bold"
                >
                  Start Learning
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById('featured-syllabus');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="rounded-full border border-white/20 bg-white/5 px-10 py-4 text-xs font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all active:scale-95 cursor-pointer font-bold"
                >
                  Browse Courses
                </button>
              </div>
            </div>
          </div>

          {/* STAY UPDATED NEWSLETTER */}
          <div className="max-w-4xl mx-auto rounded-[3rem] bg-gradient-to-br from-[#1a0b33] to-[#0c051a] p-8 sm:p-14 text-center border border-[#3c1e6e] shadow-2xl relative overflow-hidden mb-20 text-white">
            <div className="absolute -top-32 -left-32 h-64 w-64 bg-secondary/15 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -right-32 h-64 w-64 bg-accent/5 rounded-full blur-3xl" />
            
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-secondary">
                <Sparkles className="h-4 w-4" />
                Stay Updated
              </span>
              <h2 className="text-2xl sm:text-4xl font-heading font-black uppercase tracking-tight text-white leading-none">
                Step Into Your <span className="text-glow-sm text-secondary">Sovereign Growth</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed font-medium">
                Subscribe to our newsletter and get weekly business templates, direct grant opportunity alerts, and early masterclass seat notifications delivered straight to your inbox.
              </p>

              <AnimatePresence mode="wait">
                {!isSubscribed ? (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (subscriberEmail.trim()) {
                        setIsSubscribed(true);
                        addPoints(50);
                      }
                    }}
                    className="flex flex-col sm:flex-row gap-3 pt-4 max-w-md mx-auto animate-fade-in"
                  >
                    <div className="relative flex-grow">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        type="email"
                        required
                        placeholder="Enter your email address"
                        value={subscriberEmail}
                        onChange={(e) => setSubscriberEmail(e.target.value)}
                        className="w-full rounded-2xl border border-[#3c1e6e] bg-slate-950/50 py-4 pl-12 pr-4 text-xs font-bold text-white placeholder-slate-500 outline-none transition-all focus:border-secondary focus:ring-1 focus:ring-secondary"
                      />
                    </div>
                    <button
                      type="submit"
                      className="rounded-2xl bg-secondary hover:bg-white hover:text-primary transition-all px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-secondary/25 active:scale-95 cursor-pointer flex items-center justify-center gap-2 shrink-0"
                    >
                      <span>Join Now</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="pt-4 text-center space-y-3"
                  >
                    <div className="h-12 w-12 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                      <Check className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-black text-white uppercase tracking-wider">Welcome to the Sisterhood!</p>
                    <p className="text-xs text-slate-300 max-w-sm mx-auto font-medium leading-relaxed">
                      We've sent a confirmation email to <span className="text-secondary font-bold">{subscriberEmail}</span>. Get ready for your weekly blueprints and sovereign keys!
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>

        {/* INTERACTIVE PREVIEW MODAL */}
        <AnimatePresence>
          {previewCourse && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl relative border border-slate-100"
              >
                {/* Header Banner */}
                <div className="relative aspect-video max-h-56 overflow-hidden bg-slate-900">
                  <img src={previewCourse.thumbnail || undefined} className="w-full h-full object-cover opacity-80" alt="" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                  <button 
                    onClick={() => setPreviewCourse(null)}
                    className="absolute top-4 right-4 bg-black/40 text-white rounded-full p-2.5 hover:bg-black/60 transition-colors cursor-pointer"
                  >
                    ✕
                  </button>
                  <div className="absolute bottom-4 left-6 right-6 text-left">
                    <span className="text-[8px] font-black bg-secondary text-white uppercase tracking-widest px-2.5 py-1 rounded-full">
                      {previewCourse.level}
                    </span>
                    <h2 className="text-xl font-heading font-black text-white uppercase tracking-tight mt-1.5">{previewCourse.title}</h2>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-6 sm:p-8 space-y-6 max-h-[50vh] overflow-y-auto custom-scrollbar text-left">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Class Details</p>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">{previewCourse.description}</p>
                  </div>

                  {/* Instructor Bio */}
                  <div className="bg-slate-50 rounded-2xl p-4 flex gap-4 items-start border border-slate-100">
                    <img src={previewCourse.instructor.avatar || undefined} className="h-11 w-11 rounded-full object-cover border border-slate-200 shrink-0" alt="" referrerPolicy="no-referrer" />
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-primary uppercase tracking-tight leading-none">{previewCourse.instructor.name}</p>
                      <p className="text-[8px] font-black text-secondary uppercase tracking-widest leading-none">{previewCourse.instructor.rank}</p>
                      <p className="text-[10px] text-slate-500 leading-relaxed pt-1 font-medium">{previewCourse.instructor.bio || 'Certified expert and mentor guiding cohorts inside the BIG sisterhood.'}</p>
                    </div>
                  </div>

                  {/* Lessons syllabus list */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syllabus ({previewCourse.lessons.length} Modules)</p>
                    <div className="divide-y divide-slate-100">
                      {previewCourse.lessons.map((les, index) => (
                        <div key={les.id} className="py-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-heading font-black text-slate-300">{(index + 1).toString().padStart(2, '0')}</span>
                            <span className="text-xs font-black text-primary uppercase tracking-tight">{les.title}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{les.duration}</span>
                            <Lock className="h-3.5 w-3.5 text-slate-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setPreviewCourse(null)}
                    className="flex-grow rounded-full border border-slate-200 bg-white hover:bg-slate-50 px-6 py-3.5 text-xs font-black uppercase tracking-widest text-slate-600 transition-colors cursor-pointer font-bold"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setPreviewCourse(null);
                      setCurrentView?.('auth');
                    }}
                    className="flex-grow rounded-full bg-secondary text-white hover:bg-primary px-6 py-3.5 text-xs font-black uppercase tracking-widest transition-colors shadow-lg shadow-secondary/15 cursor-pointer font-bold"
                  >
                    Unlock Full Course
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 bg-slate-50/30">
      {/* CERTIFICATE MODAL */}
      <AnimatePresence>
        {showCertificate && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-4xl bg-white rounded-[3rem] p-12 text-center space-y-10 relative overflow-hidden"
            >
               {/* Decorative elements */}
               <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-secondary via-primary to-accent" />
               <div className="absolute -top-24 -right-24 h-64 w-64 bg-secondary/5 rounded-full blur-3xl" />
               
               <div className="space-y-4">
                 <div className="mx-auto h-20 w-20 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                    <Award className="h-10 w-10 text-secondary" />
                 </div>
                 <h2 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">Official Certification</h2>
                 <h1 className="text-4xl font-heading font-black text-primary uppercase tracking-tight">
                   {courses.find(c => c.id === showCertificate)?.title}
                 </h1>
               </div>

               <div className="max-w-2xl mx-auto space-y-6">
                 <p className="text-lg font-medium text-slate-500 italic">"This certificate verifies that the recipient has successfully mastered the high-income competencies defined in the curriculum of Believe In Girls Academy."</p>
                 <div className="flex items-center justify-center gap-12 pt-8">
                   <div className="text-center">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Issue Date</p>
                     <p className="text-xs font-black text-primary">July 2026</p>
                   </div>
                   <div className="h-12 w-[1px] bg-slate-100" />
                   <div className="text-center">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Credentials ID</p>
                     <p className="text-xs font-black text-primary">BIG-GRAD-{showCertificate?.toUpperCase()}</p>
                   </div>
                 </div>
               </div>

               <div className="flex gap-4">
                 <button 
                  onClick={() => setShowCertificate(null)}
                  className="flex-grow rounded-2xl border border-slate-200 py-4 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50"
                 >
                   Close
                 </button>
                 <button className="flex-grow rounded-2xl bg-primary py-4 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-primary/20 flex items-center justify-center gap-2">
                   <ExternalLink className="h-4 w-4" />
                   Share Certification
                 </button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER SECTION */}
      <header className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-secondary ring-1 ring-secondary/20">
              <GraduationCap className="h-3 w-3" />
              <span>BIG Academy</span>
            </div>
            <h1 className="text-4xl font-heading font-black text-primary uppercase tracking-tight sm:text-5xl">
              Knowledge is <span className="text-secondary text-glow-sm">Leverage</span>
            </h1>
            <p className="text-base font-medium text-slate-500 leading-relaxed">
              Access the specific modules required to master high-income skills and build generational independent wealth.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-secondary" />
              <input
                type="text"
                placeholder="Search masterclasses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-80 rounded-2xl border border-slate-200 bg-white py-4 pl-11 pr-4 text-xs font-bold text-primary shadow-sm outline-none ring-primary/5 transition-all focus:border-secondary focus:ring-4"
              />
            </div>
          </div>
        </div>

        {/* TOP TABS */}
        <div className="mt-12 flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('explore')}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all ${
              activeTab === 'explore' ? 'bg-white text-primary shadow-md scale-[1.02]' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Explore Courses
          </button>
          <button
            onClick={() => setActiveTab('my-learning')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all ${
              activeTab === 'my-learning' ? 'bg-white text-primary shadow-md scale-[1.02]' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            My Learning
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[8px] text-white">{enrolledIds.length}</span>
          </button>
        </div>
      </header>

      {/* CONTINUE LEARNING QUICK ACCESS */}
      {enrolledIds.length > 0 && activeTab === 'explore' && (
        <section className="mb-12">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
            <PlayCircle className="h-3.5 w-3.5 text-secondary" />
            Continue Learning
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.filter(c => enrolledIds.includes(c.id)).slice(0, 3).map(course => {
              const progress = getCourseProgress(course);
              return (
                <div key={course.id} className="group flex items-center gap-4 rounded-3xl bg-white p-4 shadow-xl shadow-slate-200/40 border border-slate-100 transition-all hover:border-secondary/20">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                    <img src={course.thumbnail || null} className="h-full w-full object-cover" alt="" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-grow space-y-1.5">
                    <h4 className="text-[11px] font-black text-primary uppercase tracking-tight line-clamp-1">{course.title}</h4>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-grow h-1 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-secondary" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="text-[9px] font-black text-secondary shrink-0">{progress}%</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => handleEnroll(course.id)}
                        className="text-[9px] font-black uppercase tracking-widest text-secondary hover:text-primary transition-colors flex items-center gap-1"
                      >
                        Continue Learning <ChevronRight className="h-3 w-3" />
                      </button>
                      <button 
                        onClick={() => {
                          const circleId = course.category === 'tech' ? 'tech-sisters' : 
                                         course.category === 'finance' ? 'earn' : 'learn';
                          onJoinCircle(circleId);
                        }}
                        className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors flex items-center gap-1"
                      >
                        Join Circle <Users className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* SIDEBAR FILTERS */}
        <aside className="lg:col-span-1 space-y-8">
          {/* CATEGORIES */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Filter className="h-3 w-3" />
              Categories
            </h3>
            <div className="flex flex-col gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3.5 text-xs font-black transition-all ${
                      isActive 
                        ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]' 
                        : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-4 w-4 ${isActive ? 'text-secondary' : 'text-slate-400'}`} />
                      <span>{cat.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STATS CARD */}
          <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-200/40 border border-slate-100 space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Academy Performance</h3>
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="h-8 w-8 rounded-full bg-secondary/10 flex items-center justify-center">
                     <CheckCircle2 className="h-4 w-4 text-secondary" />
                   </div>
                   <span className="text-[10px] font-black text-primary uppercase">Lessons Completed</span>
                 </div>
                 <span className="text-xs font-black text-primary">{completedLessonIds.length}</span>
               </div>
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center">
                     <TrendingUp className="h-4 w-4 text-accent" />
                   </div>
                   <span className="text-[10px] font-black text-primary uppercase">Learning Streak</span>
                 </div>
                 <span className="text-xs font-black text-primary">3 Days</span>
               </div>
            </div>
          </div>

          {/* FEATURED BADGE CTA */}
          <div className="rounded-[2.5rem] bg-primary p-7 text-white shadow-3xl shadow-primary/30 relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/5 transition-transform group-hover:scale-150" />
            <div className="relative z-10 space-y-5">
              <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center shadow-lg">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-heading font-black leading-tight uppercase tracking-tight">Financial Mastery</h4>
                <p className="text-[11px] font-medium text-slate-300 leading-relaxed uppercase tracking-wide">
                  Complete the "Capital Raising" track to unlock exclusive grant tools.
                </p>
              </div>
              <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden">
                <div className="h-full w-1/3 bg-secondary rounded-full" />
              </div>
              <button className="w-full rounded-2xl bg-white text-primary py-3.5 text-[10px] font-black uppercase tracking-[0.15em] transition-all hover:bg-secondary hover:text-white">
                View Certificate
              </button>
            </div>
          </div>
        </aside>

        {/* COURSES GRID */}
        <div className="lg:col-span-3 space-y-8">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400">
              {activeTab === 'explore' ? 'All Classes' : 'My Enrolled Classes'} • <span className="text-primary">{filteredCourses.length}</span> Results
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredCourses.map((course, index) => {
              const isEnrolled = enrolledIds.includes(course.id);
              const progress = isEnrolled ? getCourseProgress(course) : 0;

              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative flex flex-col rounded-[2.5rem] bg-white p-5 shadow-2xl shadow-slate-200/40 border border-slate-100 transition-all hover:-translate-y-2"
                >
                  {/* THUMBNAIL */}
                  <div className="relative aspect-video overflow-hidden rounded-3xl bg-slate-100">
                    <img
                      src={course.thumbnail || null}
                      alt={course.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    
                    <div className="absolute left-4 top-4">
                      <span className="rounded-full bg-white/90 backdrop-blur-md px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-primary shadow-sm">
                        {course.level}
                      </span>
                    </div>

                    {isEnrolled && (
                      <div className="absolute inset-0 flex items-center justify-center">
                         <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
                            <PlayCircle className="h-10 w-10 text-white" />
                         </div>
                      </div>
                    )}
                  </div>

                  {/* CONTENT */}
                  <div className="flex flex-grow flex-col p-5 space-y-5">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-secondary">
                          <span>{course.category}</span>
                          <span className="h-1 w-1 rounded-full bg-slate-200" />
                          <span className="text-slate-400">{course.lessons.length} Lessons</span>
                        </div>
                        {isEnrolled && (
                          <span className="text-[10px] font-black text-secondary">{progress}% Done</span>
                        )}
                      </div>
                      <h3 className="text-xl font-heading font-black text-primary leading-tight group-hover:text-secondary transition-colors uppercase tracking-tight">
                        {course.title}
                      </h3>
                      <p className="line-clamp-2 text-[11px] font-medium text-slate-500 leading-relaxed">
                        {course.description}
                      </p>
                    </div>

                    {isEnrolled && (
                      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div 
                          className="h-full bg-secondary transition-all duration-500" 
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}

                    {/* INSTRUCTOR & STATS */}
                    <div className="flex items-center justify-between pt-5 border-t border-slate-50">
                      <div className="flex items-center gap-2">
                        <img
                          src={course.instructor.avatar || null}
                          alt={course.instructor.name}
                          className="h-9 w-9 rounded-full ring-2 ring-slate-100 object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-primary">{course.instructor.name}</span>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{course.instructor.rank}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 text-[10px] font-black text-slate-400">
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="h-3 w-3 fill-current" />
                          <span>{course.rating}</span>
                        </div>
                      </div>
                    </div>

                    {/* CTA & POINTS */}
                    <div className="flex items-center gap-3 pt-2">
                      <div className="flex gap-2 flex-grow">
                        <button 
                          onClick={() => handleEnroll(course.id)}
                          className={`flex-grow rounded-2xl py-4 text-[10px] font-black uppercase tracking-[0.15em] transition-all ${
                            isEnrolled 
                              ? 'bg-primary text-white hover:bg-slate-900' 
                              : 'bg-slate-100 text-primary hover:bg-secondary hover:text-white'
                          }`}
                        >
                          {earnedCertificates.includes(course.id) 
                            ? 'View Certification' 
                            : isEnrolled 
                              ? 'Access Course' 
                              : 'Access Module'}
                        </button>
                        {isEnrolled && (
                          <button
                            onClick={() => {
                              const circleId = course.category === 'tech' ? 'tech-sisters' : 
                                             course.category === 'finance' ? 'earn' : 'learn';
                              onJoinCircle(circleId);
                            }}
                            className="px-4 rounded-2xl bg-secondary/10 text-secondary border border-secondary/20 hover:bg-secondary hover:text-white transition-all group"
                            title="Join Course Circle"
                          >
                            <Users className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <div className="flex flex-col items-center justify-center bg-secondary/5 rounded-2xl px-4 py-2 border border-secondary/10 shrink-0">
                        <span className="text-[11px] font-black text-secondary">+{course.points}</span>
                        <span className="text-[7px] font-black uppercase tracking-tight text-secondary/70">PTS</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* EMPTY STATE */}
          {filteredCourses.length === 0 && (
            <div className="rounded-[3rem] border-2 border-dashed border-slate-200 py-24 text-center bg-white/50">
               <div className="mx-auto h-24 w-24 rounded-full bg-slate-100 flex items-center justify-center mb-8">
                 <Search className="h-12 w-12 text-slate-300" />
               </div>
               <h3 className="text-2xl font-heading font-black text-primary uppercase tracking-tight">No results found</h3>
               <p className="mt-2 text-sm font-medium text-slate-500">
                 {activeTab === 'my-learning' 
                   ? "You haven't enrolled in any courses yet." 
                   : "Adjust your filters to find relevant modules."}
               </p>
               <button 
                onClick={() => {
                  setActiveTab('explore');
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-10 rounded-full bg-primary px-10 py-4 text-xs font-black uppercase tracking-[0.2em] text-white shadow-3xl shadow-primary/20 transition-all hover:-translate-y-1"
               >
                 {activeTab === 'my-learning' ? 'Start Exploring' : 'Clear Filters'}
               </button>
            </div>
          )}
        </div>
      </div>

      {/* STAY UPDATED NEWSLETTER */}
      <div className="mt-20 max-w-4xl mx-auto rounded-[3rem] bg-gradient-to-br from-[#1a0b33] to-[#0c051a] p-8 sm:p-14 text-center border border-[#3c1e6e] shadow-2xl relative overflow-hidden text-white">
        <div className="absolute -top-32 -left-32 h-64 w-64 bg-secondary/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-64 w-64 bg-accent/5 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-secondary">
            <Sparkles className="h-4 w-4" />
            Stay Updated
          </span>
          <h2 className="text-2xl sm:text-4xl font-heading font-black uppercase tracking-tight text-white leading-none">
            Fuel Your <span className="text-glow-sm text-secondary">Sovereign Growth</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed font-medium">
            Subscribe to our newsletter and get weekly business templates, direct grant opportunity alerts, and early masterclass seat notifications delivered straight to your inbox.
          </p>

          <AnimatePresence mode="wait">
            {!isSubscribed ? (
              <motion.form
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={(e) => {
                  e.preventDefault();
                  if (subscriberEmail.trim()) {
                    setIsSubscribed(true);
                    addPoints(50);
                  }
                }}
                className="flex flex-col sm:flex-row gap-3 pt-4 max-w-md mx-auto"
              >
                <div className="relative flex-grow">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={subscriberEmail}
                    onChange={(e) => setSubscriberEmail(e.target.value)}
                    className="w-full rounded-2xl border border-[#3c1e6e] bg-slate-950/50 py-4 pl-12 pr-4 text-xs font-bold text-white placeholder-slate-500 outline-none transition-all focus:border-secondary focus:ring-1 focus:ring-secondary"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-2xl bg-secondary hover:bg-white hover:text-primary transition-all px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-secondary/25 active:scale-95 cursor-pointer flex items-center justify-center gap-2 shrink-0"
                >
                  <span>Join Now</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="pt-4 text-center space-y-3"
              >
                <div className="h-12 w-12 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                  <Check className="h-6 w-6" />
                </div>
                <p className="text-sm font-black text-white uppercase tracking-wider">Welcome to the Sisterhood!</p>
                <p className="text-xs text-slate-300 max-w-sm mx-auto font-medium leading-relaxed">
                  We've sent a confirmation email to <span className="text-secondary font-bold">{subscriberEmail}</span>. Get ready for your weekly blueprints and sovereign keys!
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
