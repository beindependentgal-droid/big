export interface Member {
  id: string;
  name: string;
  email?: string;
  avatar: string;
  title: string;
  city: string;
  rank: 'Learner' | 'Mentor' | 'Member' | 'Connector' | 'Community Lead' | 'Coach';
  skills: string[];
  interests: string[];
  bio: string;
  points: number;
  badges: string[];
  business_stage?: 'Idea Stage' | 'Early Stage' | 'Growth Stage' | 'Established';
  mentoring_capacity?: 'Open' | 'Limited' | 'No Capacity' | 'Seeking Match';
  website?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  twitterUrl?: string;
  company?: string;
  industry?: string;
  certifications?: string[];
  endorsements?: { from: string; skill: string; note?: string; timestamp?: string }[];
  recommendations?: { from: string; text: string }[];
  experience?: {
    title: string;
    company: string;
    duration: string;
  }[];
  education?: {
    school: string;
    degree: string;
    duration: string;
  }[];
  followingIds?: string[];
  followerIds?: string[];
  circleIds?: string[];
  isSuperAdmin?: boolean;
  isModerator?: boolean;
  joinedAt?: string;
  passwordHash?: string;
  passwordSalt?: string;
  pinHash?: string;
  pinSalt?: string;
  biometricCredentialId?: string;
}

export interface Circle {
  id: string;
  name: string;
  email?: string;
  description: string;
  memberCount: number;
  image: string;
  category: 'learn' | 'connect' | 'earn' | 'thrive' | 'custom';
  createdBy?: string;
  isJoined?: boolean;
  moderators?: string[]; // Member IDs
  rules?: string[];
  permissions?: {
    whoCanPost: 'anyone' | 'moderators';
    whoCanInvite: 'anyone' | 'moderators';
    isPrivate: boolean;
  };
  isSuspended?: boolean;
  isBanned?: boolean;
  bannedMemberIds?: string[];
  suspendedMemberIds?: string[];
  mutedMemberIds?: string[];
  allowedPostTypes?: ('text' | 'image' | 'video' | 'poll')[];
}

export interface CircleRequest {
  id: string;
  userId: string;
  userName: string;
  circleId?: string;
  circleName: string;
  description: string;
  category: string;
  type: 'create' | 'join';
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
}

export interface Post {
  id: string;
  author: {
    id?: string;
    name: string;
    email?: string;
    avatar: string;
    rank: string;
  };
  content: string;
  timestamp: string;
  likes: string[];
  comments: Comment[];
  liked?: boolean;
  circleId: string;
  tag?: string;
  tags?: string[];
  imageUrl?: string;
  reactions?: Record<string, string[]>;
  commentsDisabled?: boolean;
  repostsCount?: number;
  sharesCount?: number;
  scheduledFor?: string;
  status?: 'published' | 'scheduled';
}

export interface Comment {
  id: string;
  author: {
    id?: string;
    name: string;
    email?: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  createdAt?: string;
  reactions?: Record<string, string[]>;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: 'workshop' | 'meetup' | 'webinar' | 'retreat';
  attendees: number;
  attendeeNames?: string[];
  rsvped: boolean;
  description: string;
  image?: string;
  category?: string;
  reminded?: boolean;
  createdBy?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  reward: string;
  progress: number;
  completed: boolean;
  badge: string;
  category: string;
  target?: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'guide' | 'video' | 'pdf' | 'link';
  size?: string;
  duration?: string;
  url?: string;
  rating?: number;
  ratingsCount?: number;
  downloadCount?: number;
  readTime?: string;
  category?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  passingScore: number;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  isCompleted?: boolean;
  content?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: {
    name: string;
    email?: string;
    avatar: string;
    rank: string;
    bio?: string;
  };
  duration: string;
  lessons: Lesson[];
  quiz?: Quiz;
  category: 'finance' | 'tech' | 'marketing' | 'leadership' | 'creative';
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  thumbnail: string;
  points: number;
  students: number;
  rating: number;
}

export interface MentorshipPair {
  id: string;
  mentor: Member;
  mentee: Member;
  topic: string;
  status: 'Active' | 'Completed' | 'Pending';
  startDate: string;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  reactions?: Record<string, string[]>;
  attachment?: {
    type: 'image' | 'document' | 'audio' | 'video';
    name: string;
    url?: string;
    size?: string;
    duration?: string;
  };
  status?: 'sent' | 'delivered' | 'read';
}

export interface Conversation {
  id: string;
  member: Member; // Used as primary contact/fallback
  isGroup?: boolean;
  groupName?: string;
  groupMembers?: Member[];
  messages: Message[];
  unread: boolean;
}

export interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  circleId?: string;
  imageUrl: string;
  timestamp: string;
  privacy: 'public' | 'circle';
  viewers: string[]; // Member IDs
}

// Initial seed data

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'm1',
    name: 'Fatma J.',
    avatar: '/images/african_woman_portrait_1_1784708232425.jpg',
    title: 'Fashion Designer',
    city: 'Nairobi',
    rank: 'Mentor',
    skills: ['AI in Design', 'Sustainable Fashion'],
    interests: ['Tech', 'Design'],
    bio: 'Experienced designer helping others integrate tech into fashion.',
    points: 1250,
    badges: ['Mentor', 'Top Contributor'],
    followingIds: [],
    followerIds: [],
    joinedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'm2',
    name: 'Sienna N.',
    avatar: '/images/african_woman_portrait_2_1784708246407.jpg',
    title: 'Founder, EcoStyles',
    city: 'Cape Town',
    rank: 'Connector',
    skills: ['E-commerce', 'Scaling'],
    interests: ['Sustainability', 'Business'],
    bio: 'Building the future of eco-friendly fashion.',
    points: 850,
    badges: ['Founder'],
    followingIds: [],
    followerIds: [],
    joinedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'm3',
    name: 'Dr. Amina',
    avatar: '/images/african_woman_portrait_3_1784708258772.jpg',
    title: 'Tech Strategist',
    city: 'Lagos',
    rank: 'Coach',
    skills: ['Cloud Computing', 'AI'],
    interests: ['Strategy', 'AI'],
    bio: 'Tech enthusiast and mentor for female founders.',
    points: 2100,
    badges: ['Elite', 'Coach'],
    followingIds: [],
    followerIds: [],
    joinedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'm4',
    name: 'Wanjiku K.',
    avatar: '/images/african_woman_portrait_1_1784708232425.jpg',
    title: 'Marketing Specialist',
    city: 'Nairobi',
    rank: 'Member',
    skills: ['Digital Marketing', 'Branding'],
    interests: ['Growth', 'Marketing'],
    bio: 'Helping startups grow their brand presence.',
    points: 450,
    badges: ['Rising Star'],
    followingIds: [],
    followerIds: [],
    joinedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'm5',
    name: 'Grace M.',
    avatar: '/images/african_woman_portrait_2_1784708246407.jpg',
    title: 'UI/UX Designer',
    city: 'Accra',
    rank: 'Connector',
    skills: ['User Research', 'Interface Design'],
    interests: ['Design', 'UX'],
    bio: 'Passionate about creating inclusive digital experiences.',
    points: 920,
    badges: ['Design Guru'],
    followingIds: [],
    followerIds: []
  }
];
export const INITIAL_EVENTS: Event[] = [
  {
    id: 'e1',
    title: 'Fashion Tech Workshop',
    date: '2026-07-20',
    time: '14:00',
    location: 'Online',
    type: 'workshop',
    attendees: 45,
    attendeeNames: ['Fatma J.', 'Sienna N.', 'Dr. Amina'],
    rsvped: false,
    description: 'Learn how to integrate AI into your fashion design workflow.',
    category: 'tech'
  },
  {
    id: 'e2',
    title: 'Lagos Founders Meetup',
    date: '2026-07-25',
    time: '18:00',
    location: 'Lagos, Nigeria',
    type: 'meetup',
    attendees: 120,
    attendeeNames: ['Wanjiku K.', 'Grace M.', 'You'],
    rsvped: true,
    description: 'Networking event for female founders in Lagos.',
    category: 'connect'
  }
];
export const INITIAL_CHALLENGES: Challenge[] = [];
export const INITIAL_RESOURCES: Resource[] = [
  {
    id: 'r1',
    title: 'Business Plan Template',
    description: 'A comprehensive guide to writing a business plan for startups.',
    type: 'pdf',
    size: '2.5 MB',
    rating: 4.5,
    ratingsCount: 12,
    downloadCount: 345,
    category: 'Business',
    readTime: '10 min'
  },
  {
    id: 'r2',
    title: 'Scaling Your E-commerce',
    description: 'Video masterclass on scaling your online store globally.',
    type: 'video',
    duration: '45 mins',
    rating: 4.8,
    ratingsCount: 28,
    downloadCount: 890,
    category: 'E-commerce'
  }
];
export const INITIAL_STORIES: Story[] = [
  {
    id: 's1',
    userId: 'm1',
    userName: 'Fatma J.',
    userAvatar: '/images/african_woman_portrait_1_1784708232425.jpg',
    imageUrl: '/images/african_woman_learning_laptop_1784664067278.jpg',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    privacy: 'public',
    viewers: []
  },
  {
    id: 's2',
    userId: 'm2',
    userName: 'Sienna N.',
    userAvatar: '/images/african_woman_portrait_2_1784708246407.jpg',
    imageUrl: '/images/african_woman_entrepreneur_portrait_1784664054544.jpg',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    privacy: 'public',
    viewers: []
  },
  {
    id: 's3',
    userId: 'm3',
    userName: 'Dr. Amina',
    userAvatar: '/images/african_woman_portrait_3_1784708258772.jpg',
    imageUrl: '/images/african_women_tech_collaboration_1784664040784.jpg',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    privacy: 'public',
    viewers: []
  }
];

export const INITIAL_POSTS: Post[] = [];
export const INITIAL_CIRCLES: Circle[] = [
  {
    id: 'circle-1',
    name: 'Tech Innovators',
    description: 'A community for women in technology to share ideas, network, and grow together.',
    memberCount: 1250,
    image: '/images/african_women_tech_collaboration_1784664040784.jpg',
    category: 'connect',
    isJoined: true,
    permissions: {
      whoCanPost: 'anyone',
      whoCanInvite: 'anyone',
      isPrivate: false
    }
  },
  {
    id: 'circle-2',
    name: 'Freelance & Earn',
    description: 'Discuss freelancing opportunities, tips for negotiating rates, and finding high-paying clients.',
    memberCount: 840,
    image: '/images/african_woman_learning_laptop_1784664067278.jpg',
    category: 'earn',
    isJoined: false,
    permissions: {
      whoCanPost: 'anyone',
      whoCanInvite: 'anyone',
      isPrivate: false
    }
  },
  {
    id: 'circle-3',
    name: 'Mindfulness & Wellness',
    description: 'A safe space to discuss mental health, self-care routines, and overall well-being.',
    memberCount: 3200,
    image: '/images/african_women_mentorship_discussion_1784664078314.jpg',
    category: 'thrive',
    isJoined: true,
    permissions: {
      whoCanPost: 'anyone',
      whoCanInvite: 'anyone',
      isPrivate: false
    }
  },
  {
    id: 'circle-4',
    name: 'Startup Founders',
    description: 'Connect with other women founders, share startup journey experiences, and find potential co-founders or investors.',
    memberCount: 560,
    image: '/images/african_woman_entrepreneur_portrait_1784664054544.jpg',
    category: 'connect',
    isJoined: false,
    permissions: {
      whoCanPost: 'anyone',
      whoCanInvite: 'anyone',
      isPrivate: true
    }
  },
  {
    id: 'circle-5',
    name: 'Creative Writers',
    description: 'For aspiring and professional writers to share works in progress, get feedback, and discuss publishing.',
    memberCount: 1100,
    image: '/images/african_women_community_circle_1784704135356.jpg',
    category: 'learn',
    isJoined: true,
    permissions: {
      whoCanPost: 'anyone',
      whoCanInvite: 'anyone',
      isPrivate: false
    }
  }
];
export const INITIAL_CONVERSATIONS: Conversation[] = [];
export const INITIAL_MENTORSHIP_PAIRS: MentorshipPair[] = [];
export const INITIAL_COURSES: Course[] = [
  {
    id: 'business-foundation',
    title: 'Business Foundation',
    description: 'Master the essential building blocks of launching a sustainable, legal, and profitable enterprise from scratch.',
    instructor: {
      name: 'Fatma J.',
      avatar: '/images/african_woman_portrait_1_1784708232425.jpg',
      rank: 'Mentor',
      bio: 'Experienced entrepreneur and designer helping women launch sustainable ventures with practical operational plans.'
    },
    duration: '4 Hours',
    category: 'leadership',
    level: 'Beginner',
    thumbnail: '/images/african_women_tech_collaboration_1784664040784.jpg',
    points: 200,
    students: 1850,
    rating: 4.9,
    lessons: [
      {
        id: 'bf-l1',
        title: 'Defining Your Business Model',
        duration: '15 mins',
        content: 'Learn how to map your unique value proposition, target customers, and primary revenue streams. A business model is the backbone of operational sustainability.'
      },
      {
        id: 'bf-l2',
        title: 'Legal Structures & Registration',
        duration: '20 mins',
        content: 'A comprehensive, step-by-step guide to registering your legal structure (LLC, Sole Proprietorship, or Partnership) and setting up compliant tax accounts.'
      },
      {
        id: 'bf-l3',
        title: 'Product-Market Fit Analysis',
        duration: '25 mins',
        content: 'How to test and validate your market demand using structured feedback surveys, competitor benchmarking, and active prototype feedback.'
      },
      {
        id: 'bf-l4',
        title: 'Designing High-Ticket Offers',
        duration: '30 mins',
        content: 'Learn the pricing strategy of bundling, scaling premium pricing tiers, and articulating high-ticket value clearly to consumers.'
      }
    ],
    quiz: {
      id: 'bf-q',
      title: 'Business Foundation Mastery Quiz',
      passingScore: 3,
      questions: [
        {
          id: 'bf-q1',
          question: 'What is the primary purpose of a unique value proposition (UVP)?',
          options: [
            'To state why your business is uniquely suited to solve a specific customer problem.',
            'To outline your annual marketing budget and spend categories.',
            'To determine the legal tax structure of your business.'
          ],
          correctAnswer: 0
        },
        {
          id: 'bf-q2',
          question: 'Which legal structure generally offers the best balance of personal liability protection and simple management for solo founders?',
          options: [
            'Sole Proprietorship',
            'Limited Liability Company (LLC)',
            'General Partnership'
          ],
          correctAnswer: 1
        },
        {
          id: 'bf-q3',
          question: 'What constitutes the best metric of achieving product-market fit?',
          options: [
            'Having 1,000 likes on social media posts.',
            'Acquiring customers who repeatedly pay for and recommend your product to others.',
            'Writing a lengthy 50-page business plan.'
          ],
          correctAnswer: 1
        }
      ]
    }
  },
  {
    id: 'digital-marketing-basics',
    title: 'Digital Marketing Basics',
    description: 'Learn the core concepts of content strategy, search engine optimization, and building a high-converting digital acquisition funnel.',
    instructor: {
      name: 'Wanjiku K.',
      avatar: '/images/african_woman_portrait_1_1784708232425.jpg',
      rank: 'Member',
      bio: 'Growth marketer and search optimization specialist dedicated to helping female entrepreneurs establish organic digital pull.'
    },
    duration: '5 Hours',
    category: 'marketing',
    level: 'Beginner',
    thumbnail: '/images/african_women_community_circle_1784704135356.jpg',
    points: 250,
    students: 2400,
    rating: 4.8,
    lessons: [
      {
        id: 'dm-l1',
        title: 'Foundations of Digital Funnels',
        duration: '18 mins',
        content: 'Demystifying the awareness, interest, decision, and action phases of digital buyer psychology and conversion funnels.'
      },
      {
        id: 'dm-l2',
        title: 'SEO and Search Optimization',
        duration: '22 mins',
        content: 'How search engines index websites. Master keyword research, meta descriptions, and writing content Google loves.'
      },
      {
        id: 'dm-l3',
        title: 'Organic Social Strategy',
        duration: '25 mins',
        content: 'Crafting high-leverage content calendar schedules for modern platforms like LinkedIn, Instagram, or TikTok to attract ideal clients.'
      },
      {
        id: 'dm-l4',
        title: 'High-Converting Landing Pages',
        duration: '30 mins',
        content: 'Rules for wireframing landing pages, placing bold call-to-action buttons, and writing headlines that command attention.'
      }
    ],
    quiz: {
      id: 'dm-q',
      title: 'Digital Marketing Mastery Quiz',
      passingScore: 3,
      questions: [
        {
          id: 'dm-q1',
          question: 'What are the stages of a classic marketing acquisition funnel?',
          options: [
            'Idea, Building, Launch, Exit',
            'Awareness, Interest, Decision, Action',
            'Keywords, Backlinks, Hosting, Security'
          ],
          correctAnswer: 1
        },
        {
          id: 'dm-q2',
          question: 'What is the main goal of Search Engine Optimization (SEO)?',
          options: [
            'To run highly expensive pay-per-click banner ads.',
            'To rank organically on search results pages to capture intent-driven traffic.',
            'To customize colors and typography layouts on your blog.'
          ],
          correctAnswer: 1
        },
        {
          id: 'dm-q3',
          question: 'Which element is most critical on a landing page designed to capture lead signups?',
          options: [
            'A background video player that autoplays audio.',
            'A clear, action-oriented headline paired with a prominent call-to-action button.',
            'An interactive widget showcasing global weather patterns.'
          ],
          correctAnswer: 1
        }
      ]
    }
  },
  {
    id: 'financial-literacy',
    title: 'Financial Literacy',
    description: 'Take command of your company numbers, cash flow forecasting, unit economics, and building healthy personal credit profiles.',
    instructor: {
      name: 'Dr. Amina',
      avatar: '/images/african_woman_portrait_3_1784708258772.jpg',
      rank: 'Coach',
      bio: 'Doctoral researcher and capital advisor training founders to build sovereign balance sheets and secure growth funding.'
    },
    duration: '6 Hours',
    category: 'finance',
    level: 'Beginner',
    thumbnail: '/images/african_woman_entrepreneur_portrait_1784664054544.jpg',
    points: 300,
    students: 3100,
    rating: 4.9,
    lessons: [
      {
        id: 'fl-l1',
        title: 'Cash Flow vs. Profitability',
        duration: '20 mins',
        content: 'Understanding why cash is king. Learn the difference between paper profits and real bank liquidity, and how to build a cash runway.'
      },
      {
        id: 'fl-l2',
        title: 'Unit Economics & Pricing Model',
        duration: '25 mins',
        content: 'Calculating your exact Cost of Goods Sold (COGS), gross margins, customer lifetime value, and basic transaction break-even analysis.'
      },
      {
        id: 'fl-l3',
        title: 'Bookkeeping & Tax Foundations',
        duration: '30 mins',
        content: 'Setting up dedicated business accounts, tracking write-off categories, and establishing clean monthly financial reporting workflows.'
      },
      {
        id: 'fl-l4',
        title: 'Personal Sovereign Credit',
        duration: '30 mins',
        content: 'How credit scores are calculated, optimizing lines of credit for leverage, and building stable personal wealth foundations.'
      }
    ],
    quiz: {
      id: 'fl-q',
      title: 'Financial Literacy Mastery Quiz',
      passingScore: 3,
      questions: [
        {
          id: 'fl-q1',
          question: 'What is the core difference between Cash Flow and Profit?',
          options: [
            'There is no difference; they are identical financial metrics.',
            'Profit is the revenue remaining after expenses on paper; Cash Flow tracks the actual movement of cash in and out of your bank.',
            'Cash Flow refers only to credit card points, while Profit refers to physical cash bills.'
          ],
          correctAnswer: 1
        },
        {
          id: 'fl-q2',
          question: 'How do you calculate gross profit margin?',
          options: [
            '((Revenue - Cost of Goods Sold) / Revenue) * 100',
            '(Revenue + Marketing Spend) / 2',
            'Operating Expenses - Cash Runway'
          ],
          correctAnswer: 0
        },
        {
          id: 'fl-q3',
          question: 'What is a "cash runway"?',
          options: [
            'The physical location where products are shipped.',
            'The number of months a business can continue to operate with zero incoming sales before running out of cash.',
            'The speed at which a customer completes an online purchase.'
          ],
          correctAnswer: 1
        }
      ]
    }
  },
  {
    id: 'no-code-tech',
    title: 'No-Code Product Development',
    description: 'Build fully functional web and mobile applications without writing a single line of code using modern visual platforms.',
    instructor: {
      name: 'Sarah K.',
      avatar: '/images/african_woman_portrait_1_1784708232425.jpg',
      rank: 'Developer',
      bio: 'Software engineer and no-code champion helping non-technical founders launch products in weeks, not months.'
    },
    duration: '7 Hours',
    category: 'tech',
    level: 'Intermediate',
    thumbnail: '/images/african_women_tech_collaboration_1784664040784.jpg',
    points: 350,
    students: 1200,
    rating: 4.9,
    lessons: [
      {
        id: 'nc-l1',
        title: 'The No-Code Landscape',
        duration: '15 mins',
        content: 'Understand bubble, webflow, glide, and softr. Learn how to choose the right tools for your specific minimum viable product (MVP).'
      },
      {
        id: 'nc-l2',
        title: 'Database Architecture for Visual Builders',
        duration: '25 mins',
        content: 'Master tables, relational database schema, and custom user roles in cloud databases without typing any raw SQL.'
      },
      {
        id: 'nc-l3',
        title: 'Designing User Workflows & Actions',
        duration: '30 mins',
        content: 'Set up dynamic interactions, API integrations, third-party hooks, and conditional logic rules in responsive canvas spaces.'
      },
      {
        id: 'nc-l4',
        title: 'Launching & Custom Domain Setup',
        duration: '20 mins',
        content: 'Deploying your application live, configuring secure DNS records, configuring SSL protection, and analyzing production usage data.'
      }
    ],
    quiz: {
      id: 'nc-q',
      title: 'No-Code Mastery Quiz',
      passingScore: 3,
      questions: [
        {
          id: 'nc-q1',
          question: 'Which visual builder is best suited for building highly custom full-stack web applications?',
          options: [
            'Bubble',
            'Canva',
            'Google Sheets'
          ],
          correctAnswer: 0
        },
        {
          id: 'nc-q2',
          question: 'In a visual database, what is a relational field?',
          options: [
            'A field that automatically translates text to foreign languages.',
            'A database field linking records in one table to records in another table.',
            'An indicator showing if your server has internet access.'
          ],
          correctAnswer: 1
        },
        {
          id: 'nc-q3',
          question: 'What is the purpose of an API (Application Programming Interface) in visual building?',
          options: [
            'To write raw CSS code blocks in private files.',
            'To allow your no-code application to securely talk to other software services (like Stripe or Gmail).',
            'To compile code to native assembly language.'
          ],
          correctAnswer: 1
        }
      ]
    }
  },
  {
    id: 'fearless-leadership',
    title: 'Fearless Executive Leadership',
    description: 'Elevate your leadership presence, master critical negotiation, handle difficult conversations, and design high-performing cultures.',
    instructor: {
      name: 'Nneka A.',
      avatar: '/images/african_woman_portrait_4_1784708270262.jpg',
      rank: 'Advisor',
      bio: 'Executive coach and retired Fortune 500 director training the next generation of sovereign female corporate leaders.'
    },
    duration: '5 Hours',
    category: 'leadership',
    level: 'Advanced',
    thumbnail: '/images/african_woman_leading_masterclass_1784704151649.jpg',
    points: 300,
    students: 950,
    rating: 4.9,
    lessons: [
      {
        id: 'fl-l1-l',
        title: 'Developing Executive Presence',
        duration: '20 mins',
        content: 'Master visual communication, tone modulation, precise command speech, and dynamic projection of confidence in executive environments.'
      },
      {
        id: 'fl-l2-l',
        title: 'High-Stakes Negotiation Frameworks',
        duration: '30 mins',
        content: 'Learn positional vs. interest-based negotiation models, establishing walk-away metrics, and framing mutually beneficial outcomes.'
      },
      {
        id: 'fl-l3-l',
        title: 'Managing High-Conflict Conversations',
        duration: '25 mins',
        content: 'Step-by-step psychological guidelines for addressing low team productivity, delivering critical feedback, and diffusing office friction.'
      }
    ],
    quiz: {
      id: 'fl-q-l',
      title: 'Fearless Leadership Quiz',
      passingScore: 2,
      questions: [
        {
          id: 'fl-q1-l',
          question: 'What is the core principle of interest-based negotiation?',
          options: [
            'Demanding strict adherence to your starting position without compromise.',
            'Focusing on the underlying motivations and needs of both parties rather than fixed demands.',
            'Lying about your budget limits to get a cheaper price.'
          ],
          correctAnswer: 1
        },
        {
          id: 'fl-q2-l',
          question: 'When delivering constructive feedback, which approach is most effective?',
          options: [
            'Stating vague observations so you do not hurt feelings.',
            'Providing specific, behavior-based observations coupled with actionable future outcomes.',
            'Emailing a list of complaints anonymously.'
          ],
          correctAnswer: 1
        }
      ]
    }
  },
  {
    id: 'creative-branding',
    title: 'Creative Brand Storytelling',
    description: 'Establish an unforgettable brand identity, craft compelling brand stories, and design high-impact visuals that resonate deeply.',
    instructor: {
      name: 'Maya A.',
      avatar: '/images/african_woman_portrait_4_1784708270262.jpg',
      rank: 'Designer',
      bio: 'Award-winning creative director guiding startups on brand positioning, aesthetic continuity, and storytelling.'
    },
    duration: '3.5 Hours',
    category: 'creative',
    level: 'Intermediate',
    thumbnail: '/images/african_woman_learning_laptop_1784664067278.jpg',
    points: 200,
    students: 1400,
    rating: 4.7,
    lessons: [
      {
        id: 'cb-l1',
        title: 'The Art of Brand Positioning',
        duration: '15 mins',
        content: 'Discovering your brand personality, defining core values, and crafting a unique voice that stands out in crowded market spaces.'
      },
      {
        id: 'cb-l2',
        title: 'Visual Identity & Style Guidelines',
        duration: '20 mins',
        content: 'Designing cohesive mood boards, color palette systems, and typography pairings that project professionalism.'
      },
      {
        id: 'cb-l3',
        title: 'Storytelling Frameworks',
        duration: '25 mins',
        content: 'Applying the classic hero journey structure to your brand statement, client testimonials, and product descriptions.'
      }
    ],
    quiz: {
      id: 'cb-q',
      title: 'Creative Branding Quiz',
      passingScore: 2,
      questions: [
        {
          id: 'cb-q1',
          question: 'What is a primary element of brand positioning?',
          options: [
            'Finding the exact pricing structures used by your local competitors.',
            'Defining your brand personality, core values, and unique market space.',
            'Purchasing expensive print banners.'
          ],
          correctAnswer: 1
        },
        {
          id: 'cb-q2',
          question: 'How does a visual style guideline assist a growing brand?',
          options: [
            'It prevents other businesses from copying your exact product names.',
            'It ensures aesthetic consistency across all digital touchpoints and platforms.',
            'It tracks daily financial transactions automatically.'
          ],
          correctAnswer: 1
        }
      ]
    }
  }
];

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'freelance' | 'co-founder';
  category?: string;
  description: string;
  requirements: string[];
  postedBy: string; // Member ID
  timestamp: string;
  status: 'open' | 'closed';
  salary?: string;
  applicationsCount: number;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  category: 'weekly' | 'monthly' | 'standup';
  status: 'pending' | 'completed';
  timestamp: string;
  cheers: number;
  cheeredBy: string[]; // Member IDs
  updates: { text: string; timestamp: string }[];
}

export function getProfileCompleteness(member: Member): number {
  const completionItems = [
    { complete: !!member.name?.trim() },
    { complete: !!member.title?.trim() },
    { complete: !!member.city?.trim() },
    { complete: !!member.bio?.trim() },
    { complete: !!member.avatar },
    { complete: (member.skills || []).length > 0 },
    { complete: (member.interests || []).length > 0 },
  ];
  const completedCount = completionItems.filter(item => item.complete).length;
  return Math.round((completedCount / completionItems.length) * 100);
}

export function isProfileVerified(member: Member): boolean {
  return getProfileCompleteness(member) === 100;
}

// ---------------- BIG FUND DATA STRUCTURES & SEEDS ----------------

export interface CampaignBudget {
  item: string;
  cost: number;
}

export interface CampaignTimeline {
  date: string;
  title: string;
  description: string;
}

export interface CampaignUpdate {
  date: string;
  title: string;
  content: string;
}

export interface Campaign {
  id: string;
  coverImage: string;
  title: string;
  shortDescription: string;
  story: string;
  whyItMatters: string;
  expectedImpact: string;
  goalAmount: number;
  amountRaised: number;
  daysRemaining: number;
  supportersCount: number;
  category: string;
  budgetTransparency: CampaignBudget[];
  timeline: CampaignTimeline[];
  updates: CampaignUpdate[];
  gallery: string[];
  status: 'active' | 'paused' | 'archived';
}

export interface Donation {
  id: string;
  donorName: string;
  donorEmail: string;
  donorId?: string;
  amount: number;
  campaignId: string;
  campaignTitle: string;
  date: string;
  isAnonymous: boolean;
  type: 'one-time' | 'monthly' | 'quarterly' | 'annual';
  paymentProvider: string;
  status: 'Completed' | 'Processing' | 'Failed';
  receiptNumber?: string;
}

export interface MonthlySupporter {
  id: string;
  userId?: string;
  name: string;
  avatar: string;
  amount: number;
  tier: 'Bronze Champion' | 'Silver Champion' | 'Gold Champion' | 'Platinum Champion';
  joinedAt: string;
  badge: string;
}

export interface ImpactStory {
  id: string;
  title: string;
  coverImage: string;
  before: string;
  after: string;
  quote: string;
  author: string;
  authorRole: string;
  programFunded: string;
  achievements: string[];
}

export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-1',
    coverImage: '/images/african_woman_learning_laptop_1784664067278.jpg',
    title: 'Support BIG Academy Scholarships',
    shortDescription: 'Provide full tuition, laptops, and transport stipends for 20 brilliant young women from under-resourced communities to join the next cohort.',
    story: 'Education is the ultimate foundation of economic sovereignty. The BIG Academy has trained over 500 women in digital design, software development, and technical business operations. This scholarship campaign directly sponsors the tuition and equipment costs for our upcoming Cohort 7, bringing 20 highly motivated girls into our 6-month intensive training program.',
    whyItMatters: 'Without laptops and mentorship, these talented women are excluded from the digital economy. Your support unlocks their potential and launches high-paying technical careers.',
    expectedImpact: 'Full 6-month digital certification, one-on-one professional mentorship, and direct internship placement for 20 scholars.',
    goalAmount: 1500000,
    amountRaised: 940000,
    daysRemaining: 18,
    supportersCount: 42,
    category: 'Education & Academy',
    status: 'active',
    budgetTransparency: [
      { item: 'Laptops and technical kits for 20 scholars', cost: 700000 },
      { item: 'Full program certification and learning materials', cost: 400000 },
      { item: 'Transport and meals stipend (6 months)', cost: 300000 },
      { item: 'Mentorship matching and counseling workshops', cost: 100000 }
    ],
    timeline: [
      { date: 'Aug 1, 2026', title: 'Applications Open', description: 'Screening and interviewing candidates across regional circles.' },
      { date: 'Sep 1, 2026', title: 'Laptop Distribution', description: 'Providing fully configured work environments to selected scholars.' },
      { date: 'Sep 5, 2026', title: 'Classes Begin', description: 'Starting phase-one intensive software development and design tracks.' },
      { date: 'Mar 15, 2027', title: 'Graduation & Placement', description: 'Corporate matchmaking event and launching active internships.' }
    ],
    updates: [
      { date: 'July 15, 2026', title: 'Corporate Laptop Match Partner Confirmed!', content: 'We are thrilled to announce a tech partner has agreed to cover 15% of our device logistics, reducing individual laptop costs!' },
      { date: 'June 28, 2026', title: 'Curriculum Overhaul Complete', content: 'Our design and technology curriculum has been updated with advanced generative AI and cloud deployment modules to ensure high marketability.' }
    ],
    gallery: [
      '/images/african_woman_learning_laptop_1784664067278.jpg',
      '/images/african_women_tech_collaboration_1784664040784.jpg'
    ]
  },
  {
    id: 'camp-2',
    coverImage: '/images/african_women_mentorship_discussion_1784664078314.jpg',
    title: 'Sponsor Leadership Bootcamp',
    shortDescription: 'Fund our biannual residential leadership bootcamp empowering 35 grassroots community organizers with advocacy, public speaking, and project governance skills.',
    story: 'True leadership happens in the community. Our 4-day intensive Leadership Bootcamp brings together selected grassroots leaders to learn policy analysis, strategic communication, and community organizing principles from master executive coaches.',
    whyItMatters: 'Empowered female leaders amplify the voices of hundreds of others in their towns, creating a powerful cascading effect of civic and economic empowerment.',
    expectedImpact: '35 fully trained civic champions, 12 regional advocacy project plans, and localized peer mentoring circles.',
    goalAmount: 800000,
    amountRaised: 520000,
    daysRemaining: 25,
    supportersCount: 29,
    category: 'Leadership & Advocacy',
    status: 'active',
    budgetTransparency: [
      { item: 'Residency venue and accommodation (4 days)', cost: 350000 },
      { item: 'Leadership coaching curriculum and materials', cost: 200000 },
      { item: 'Travel support stipends for remote participants', cost: 150000 },
      { item: 'Post-bootcamp advocacy matching grants', cost: 100000 }
    ],
    timeline: [
      { date: 'Sep 10, 2026', title: 'Participant Nomination', description: 'Receiving nominations from localized sub-circles.' },
      { date: 'Oct 8, 2026', title: 'Residential Kickoff', description: 'Beginning intensive team building and speaking sessions.' },
      { date: 'Oct 12, 2026', title: 'Graduation Ceremony', description: 'Awarding certificates and launching physical community plans.' }
    ],
    updates: [
      { date: 'July 19, 2026', title: 'Host Venue Selected', content: 'We have locked in a beautiful eco-lodge facility that has agreed to provide substantial discounts for accommodation.' }
    ],
    gallery: [
      '/images/african_women_community_circle_1784704135356.jpg'
    ]
  },
  {
    id: 'camp-3',
    coverImage: '/images/african_mother_and_child_wellness_1784704199174.jpg',
    title: 'Community Mental Wellness Program',
    shortDescription: 'Provide mental health toolkits, professional therapy sessions, and group peer-counseling safe spaces for women recovering from occupational trauma.',
    story: 'Economic growth cannot happen without emotional resilience. The pressure of rebuilding lives and facing economic hardship takes a heavy toll. This fund sponsors clinical therapy sessions, group healing circles, and wellness journals for our members.',
    whyItMatters: 'Mental health is often a luxury. By making group therapy and crisis care accessible, we heal the entire foundation of our community.',
    expectedImpact: '250 group counseling hours, 50 individual trauma-informed therapy matches, and 300 wellness journals distributed.',
    goalAmount: 600000,
    amountRaised: 345000,
    daysRemaining: 12,
    supportersCount: 18,
    category: 'Mental Wellness',
    status: 'active',
    budgetTransparency: [
      { item: 'Professional therapy sessions (50 participants)', cost: 300000 },
      { item: 'Group peer-led healing facilitator fees', cost: 150000 },
      { item: 'Wellness journaling and self-care print toolkits', cost: 100000 },
      { item: 'Crisis support hotlines maintenance', cost: 50000 }
    ],
    timeline: [
      { date: 'Aug 5, 2026', title: 'Therapist Recruitment', description: 'Vetting trauma-informed professionals and onboarding facilitators.' },
      { date: 'Aug 20, 2026', title: 'Group Sessions Launch', description: 'Starting first weekly circles inside local chapters.' }
    ],
    updates: [],
    gallery: []
  },
  {
    id: 'camp-4',
    coverImage: '/images/african_women_tech_collaboration_1784664040784.jpg',
    title: 'Women in Tech Fund',
    shortDescription: 'Direct micro-grants for female tech founders to acquire hosting, servers, API keys, and specialized software licenses to ship their MVPs.',
    story: 'Many women in tech have high-fidelity designs and prototypes ready, but lack the capital to subscribe to cloud infrastructure or integrate real APIs. This fund gives small tech grants to build and host functional products.',
    whyItMatters: 'Reducing the financial barriers of digital product launches lets more women enter the global startup ecosystem.',
    expectedImpact: '15 digital tech MVPs successfully deployed on servers, 1-year software subsidies, and expert architectural reviews.',
    goalAmount: 2000000,
    amountRaised: 1100000,
    daysRemaining: 34,
    supportersCount: 64,
    category: 'Technology',
    status: 'active',
    budgetTransparency: [
      { item: 'Cloud servers hosting credit grants (15 startups)', cost: 800000 },
      { item: 'API integrations & payment gateway deposits', cost: 600000 },
      { item: 'Professional developer tool licenses', cost: 400000 },
      { item: 'Product launch marketing assistance', cost: 200000 }
    ],
    timeline: [
      { date: 'Sep 1, 2026', title: 'Proposals Received', description: 'Opening application gateway for product build blueprints.' },
      { date: 'Oct 1, 2026', title: 'Capital Disbursement', description: 'Disbursing credits and hosting subscriptions directly to startups.' }
    ],
    updates: [
      { date: 'July 10, 2026', title: 'Additional AWS Credits Partnered', content: 'We secured $10,000 in AWS Cloud Credits that will match cash donations to multiply server grant distributions!' }
    ],
    gallery: []
  },
  {
    id: 'camp-5',
    coverImage: '/images/african_mother_and_child_wellness_1784704199174.jpg',
    title: 'Single Mothers Empowerment Initiative',
    shortDescription: 'Provide flexible digital skills training, child-care stipends, and work-from-home starter equipment for 15 single mothers.',
    story: 'Single mothers face a dual challenge: working to support their family while caring for their children. This initiative establishes a digital micro-working incubator that provides on-site childcare while mothers receive specialized transcription and virtualization training.',
    whyItMatters: 'When you support a mother, you directly invest in the nutrition, health, and future education of her children.',
    expectedImpact: '15 single mothers equipped with remote work hardware, 400 childcare hours, and digital job placements.',
    goalAmount: 1200000,
    amountRaised: 820000,
    daysRemaining: 41,
    supportersCount: 51,
    category: 'Family & Care',
    status: 'active',
    budgetTransparency: [
      { item: 'Work-from-home hardware (Chromebooks/Webcams)', cost: 500000 },
      { item: 'On-site child care supervisor fees (4 months)', cost: 350000 },
      { item: 'Specialized remote transcription & virtual assist training', cost: 250000 },
      { item: 'Cooperative savings emergency cushion pool', cost: 100000 }
    ],
    timeline: [
      { date: 'Sep 15, 2026', title: 'Incubator Launch', description: 'Opening the first physical workspace with play areas.' }
    ],
    updates: [],
    gallery: []
  },
  {
    id: 'camp-6',
    coverImage: '/images/african_women_community_circle_1784704135356.jpg',
    title: 'Annual BIG Summit',
    shortDescription: 'Fund travel stipends, local accommodation, and exhibition booths for 50 rural female entrepreneurs to attend the Annual BIG Summit.',
    story: 'The BIG Summit is our hallmark annual gathering of thousands of women across East Africa. It features pitches, exhibitions, training tracks, and elite mentorship. We want to ensure that geographical and financial constraints do not exclude rural founders.',
    whyItMatters: 'Networking and marketplace access are vital to business expansion. Exhibiting at the Summit puts rural crafts and goods in front of hundreds of institutional corporate buyers.',
    expectedImpact: 'Travel and exhibition sponsorship for 50 rural founders, generating direct sales and regional supplier partnerships.',
    goalAmount: 1000000,
    amountRaised: 780000,
    daysRemaining: 50,
    supportersCount: 37,
    category: 'Events & Network',
    status: 'active',
    budgetTransparency: [
      { item: 'Transport & logistics for 50 remote rural members', cost: 400000 },
      { item: 'Exhibition booth materials & stand setups', cost: 300000 },
      { item: 'Accommodation and food catering (3 days)', cost: 200000 },
      { item: 'Product catalog digital listings production', cost: 100000 }
    ],
    timeline: [
      { date: 'Nov 5, 2026', title: 'Summit Physical Event', description: 'Launching our physical marketplace, masterclasses, and pitches.' }
    ],
    updates: [],
    gallery: []
  },
  {
    id: 'camp-7',
    coverImage: '/images/african_woman_portrait_1_1784708232425.jpg',
    title: 'Emergency Sister Support Fund',
    shortDescription: 'An active mutual-aid safety net providing immediate medical, housing, or business rehabilitation grants to sisters in acute crisis.',
    story: 'Life happens. Fire in the local market, sudden illness, or forced eviction can instantly wipe out a sister\'s business. This mutual aid emergency fund acts as an immediate insurance layer, approving quick rehabilitation grants within 24 hours of local circle referral.',
    whyItMatters: 'A sudden shock should not push a sister back into extreme poverty. Immediate capital matching keeps her resilient.',
    expectedImpact: 'Immediate KES 15,000 - 30,000 rescue grants to stabilize 20+ acute family crises.',
    goalAmount: 500000,
    amountRaised: 310000,
    daysRemaining: 5,
    supportersCount: 73,
    category: 'Mutual Aid',
    status: 'active',
    budgetTransparency: [
      { item: 'Crisis disaster grant matching', cost: 400000 },
      { item: 'Legal and emergency housing relocation aid', cost: 100000 }
    ],
    timeline: [
      { date: 'Continuous', title: 'Ongoing Crisis Screening', description: 'Matching claims within 24 hours via circle supervisors.' }
    ],
    updates: [
      { date: 'July 18, 2026', title: 'Emergency Food Aid Matches Disbursed', content: 'We successfully supported 4 families in the Mathare neighborhood during the flash flood rehabilitation cycle with short term cash-transfers.' }
    ],
    gallery: []
  },
  {
    id: 'camp-8',
    coverImage: '/images/african_women_mentorship_discussion_1784664078314.jpg',
    title: 'Mentorship Expansion Program',
    shortDescription: 'Expand our mentorship tracking software, host match-making physical mixers, and train 100 new senior professional mentors.',
    story: 'Sovereignty is built through connection. Our professional mentorship program pairs younger learners with corporate female executives. This fund supports training workshops, matching algorithms, and community resources to scale the mentor database.',
    whyItMatters: '89% of mentored learners successfully scale their income, compared to 43% without peer-coaching.',
    expectedImpact: '100 certified senior mentors, 150 permanent career matches, and digital resource kits.',
    goalAmount: 750000,
    amountRaised: 490000,
    daysRemaining: 19,
    supportersCount: 33,
    category: 'Mentorship & Growth',
    status: 'active',
    budgetTransparency: [
      { item: 'Digital match-making directory software enhancement', cost: 300000 },
      { item: 'Senior coach syllabus development & training workshops', cost: 250000 },
      { item: 'Physical matching mixers & coffee sponsorships', cost: 150000 },
      { item: 'Mentorship feedback reporting modules', cost: 50000 }
    ],
    timeline: [
      { date: 'Sep 25, 2026', title: 'Physical Mentor Meetup', description: 'Bringing matched mentors and mentees together for alignment.' }
    ],
    updates: [],
    gallery: []
  }
];

export const INITIAL_DONATIONS: Donation[] = [
  {
    id: 'don-1',
    donorName: 'Sarah Jenkins',
    donorEmail: 'sarah.j@example.com',
    amount: 25000,
    campaignId: 'camp-1',
    campaignTitle: 'Support BIG Academy Scholarships',
    date: '2026-07-18T14:30:00Z',
    isAnonymous: false,
    type: 'one-time',
    paymentProvider: 'Stripe',
    status: 'Completed'
  },
  {
    id: 'don-2',
    donorName: 'Njeri Kamau',
    donorEmail: 'njeri@beindependentgal.com',
    donorId: 'm3',
    amount: 10000,
    campaignId: 'camp-1',
    campaignTitle: 'Support BIG Academy Scholarships',
    date: '2026-07-17T09:15:00Z',
    isAnonymous: false,
    type: 'monthly',
    paymentProvider: 'M-Pesa',
    status: 'Completed'
  },
  {
    id: 'don-3',
    donorName: 'Anonymous Supporter',
    donorEmail: 'anon@example.com',
    amount: 5000,
    campaignId: 'camp-3',
    campaignTitle: 'Community Mental Wellness Program',
    date: '2026-07-16T18:45:00Z',
    isAnonymous: true,
    type: 'one-time',
    paymentProvider: 'Flutterwave',
    status: 'Completed'
  },
  {
    id: 'don-4',
    donorName: 'Amara Diop',
    donorEmail: 'amara.diop@example.com',
    amount: 50000,
    campaignId: 'camp-4',
    campaignTitle: 'Women in Tech Fund',
    date: '2026-07-15T11:00:00Z',
    isAnonymous: false,
    type: 'one-time',
    paymentProvider: 'Visa',
    status: 'Completed'
  },
  {
    id: 'don-5',
    donorName: 'Grace Omwamba',
    donorEmail: 'grace@example.com',
    amount: 15000,
    campaignId: 'camp-5',
    campaignTitle: 'Single Mothers Empowerment Initiative',
    date: '2026-07-12T16:20:00Z',
    isAnonymous: false,
    type: 'annual',
    paymentProvider: 'M-Pesa',
    status: 'Completed'
  }
];

export const INITIAL_MONTHLY_SUPPORTERS: MonthlySupporter[] = [
  {
    id: 'sup-1',
    userId: 'm3',
    name: 'Njeri Kamau',
    avatar: '/images/african_woman_portrait_1_1784708232425.jpg',
    amount: 10000,
    tier: 'Gold Champion',
    joinedAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    badge: '🏆 GOLD CHAMPION'
  },
  {
    id: 'sup-2',
    name: 'Zainab O.',
    avatar: '/images/african_woman_portrait_2_1784708246407.jpg',
    amount: 25000,
    tier: 'Platinum Champion',
    joinedAt: new Date(Date.now() - 500 * 24 * 60 * 60 * 1000).toISOString(),
    badge: '💎 PLATINUM CHAMPION'
  },
  {
    id: 'sup-3',
    userId: 'm1',
    name: 'Amina Bello',
    avatar: '/images/african_woman_portrait_3_1784708258772.jpg',
    amount: 2500,
    tier: 'Bronze Champion',
    joinedAt: '2026-05-20T14:30:00Z',
    badge: '🥉 BRONZE CHAMPION'
  },
  {
    id: 'sup-4',
    name: 'Wangari Maathai Club',
    avatar: '/images/african_women_community_circle_1784704135356.jpg',
    amount: 15000,
    tier: 'Platinum Champion',
    joinedAt: '2026-02-18T10:00:00Z',
    badge: '💎 PLATINUM CHAMPION'
  }
];

export const INITIAL_IMPACT_STORIES: ImpactStory[] = [
  {
    id: 'story-1',
    title: 'From Street Vendor to certified Software QA Engineer: Mary\'s Story',
    coverImage: '/images/african_woman_learning_laptop_1784664067278.jpg',
    before: 'Mary was running a small, unstable fruit stall in Eldoret, struggling to feed her two children on KES 200 a day with zero savings or digital skills.',
    after: 'Supported by a full scholarship from the BIG Academy, Mary learned software testing, received a Chromebook, and is now working remotely as a Junior QA Analyst for a regional tech hub, earning KES 85,000 monthly.',
    quote: '"The day BIG handed me my laptop was the day I realized my life had changed forever. I am no longer just surviving; I am building a future."',
    author: 'Mary Wambui',
    authorRole: 'Academy Graduate, Class of 2025',
    programFunded: 'Support BIG Academy Scholarships',
    achievements: [
      'Successfully certified in Automated Quality Assurance',
      'Secured full-time remote contract within 45 days of graduation',
      'Enrolled both her children in a private primary school'
    ]
  },
  {
    id: 'story-2',
    title: 'How Faith\'s Agro-Export startup matched cooperative capital to scale',
    coverImage: '/images/african_woman_entrepreneur_portrait_1784664054544.jpg',
    before: 'Faith had a brilliant business model connecting smallholder female avocado farmers with international logistics but lacked cold-room storage capital.',
    after: 'Using the matching grant, Faith raised KES 400,000 from local circles which BIG matched dollar-for-dollar. She purchased her first heavy-duty chiller, boosting farmer yield retainment by 80%.',
    quote: '"BIG Fund proved to my community that they were willing to put skin in the game. The matching pool turned our tiny village contributions into major physical infrastructure."',
    author: 'Faith Jemutai',
    authorRole: 'Founder of Jemutai Agro-Hub',
    programFunded: 'Sponsor Leadership Bootcamp & Matching Grants',
    achievements: [
      'Installed cold room storage hub in Nyeri chapter',
      'Increased smallholder farmer payouts by 35%',
      'Currently exporting 4 tonnes of organic avocados monthly'
    ]
  }
];

