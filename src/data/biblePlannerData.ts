export interface StudyPlanSession {
  day: number;
  title: string;
  bookId: string;
  bookName: string;
  chapters: number[];
  focusVerse: string;
  focusVerseRef: string;
  learningObjective: string;
  reflectionPrompt: string;
}

export interface CuratedStudyPlan {
  id: string;
  title: string;
  subtitle: string;
  durationDays: number;
  category: 'Wisdom' | 'Gospels' | 'Character' | 'Peace & Courage' | 'Foundations';
  icon: string;
  color: string;
  badge: string;
  description: string;
  sessions: StudyPlanSession[];
}

export interface BibleReadingProgress {
  readChapters: Record<string, number[]>;
  completedSessions: Record<string, { completedAt: string; reflection?: string; prayer?: string }>;
  customSessions: Array<{
    id: string;
    title: string;
    bookId: string;
    bookName: string;
    chapters: number[];
    dateAdded: string;
    notes?: string;
  }>;
  lastActiveDate?: string;
  currentStreak: number;
  dailyGoalChapters: number;
}

export const CURATED_STUDY_PLANS: CuratedStudyPlan[] = [
  {
    id: 'proverbs-wisdom',
    title: '31-Day Proverbs Wisdom Journey',
    subtitle: 'Daily Godly Wisdom for School, Friendship, and Diligence',
    durationDays: 31,
    category: 'Wisdom',
    icon: 'school',
    color: 'from-amber-500 to-yellow-600',
    badge: 'Most Popular for Scholars',
    description: 'Walk through all 31 chapters of Proverbs, one chapter per day. Discover keys for academic diligence, speech discipline, honoring parents, and finding Godly counsel.',
    sessions: [
      {
        day: 1,
        title: 'The Fear of the Lord & Honest Learning',
        bookId: 'proverbs',
        bookName: 'Proverbs',
        chapters: [1],
        focusVerse: 'The fear of the LORD is the beginning of knowledge: but fools despise wisdom and instruction.',
        focusVerseRef: 'Proverbs 1:7',
        learningObjective: 'Understand that true intelligence and learning begin with reverence for God.',
        reflectionPrompt: 'How can I invite God into my daily school lessons and homework today?'
      },
      {
        day: 2,
        title: 'Searching for Wisdom Like Hidden Treasure',
        bookId: 'proverbs',
        bookName: 'Proverbs',
        chapters: [2],
        focusVerse: 'If thou seekest her as silver, and searchest for her as for hid treasures; Then shalt thou understand the fear of the LORD.',
        focusVerseRef: 'Proverbs 2:4-5',
        learningObjective: 'Treat learning and scripture understanding as the most valuable treasure.',
        reflectionPrompt: 'What is one topic in school or life I need to work harder to understand?'
      },
      {
        day: 3,
        title: 'Trusting God with All Your Heart',
        bookId: 'proverbs',
        bookName: 'Proverbs',
        chapters: [3],
        focusVerse: 'Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.',
        focusVerseRef: 'Proverbs 3:5-6',
        learningObjective: 'Rely on God’s sovereign guidance rather than personal anxiety or pride.',
        reflectionPrompt: 'What challenge am I currently facing that I need to surrender into God’s hands?'
      },
      {
        day: 4,
        title: 'Guarding Your Heart with All Diligence',
        bookId: 'proverbs',
        bookName: 'Proverbs',
        chapters: [4],
        focusVerse: 'Keep thy heart with all diligence; for out of it are the issues of life.',
        focusVerseRef: 'Proverbs 4:23',
        learningObjective: 'Protect your thoughts, eyes, and ears from negative or ungodly influences.',
        reflectionPrompt: 'What thoughts or habits do I need to filter out to protect my focus and character?'
      },
      {
        day: 5,
        title: 'Lessons of the Ant: Conquering Laziness',
        bookId: 'proverbs',
        bookName: 'Proverbs',
        chapters: [6],
        focusVerse: 'Go to the ant, thou sluggard; consider her ways, and be wise.',
        focusVerseRef: 'Proverbs 6:6',
        learningObjective: 'Learn initiative, self-motivation, and faithful study habits without being pushed.',
        reflectionPrompt: 'How can I take initiative in doing my homework and chores before being asked?'
      },
      {
        day: 6,
        title: 'The Soft Answer & Joyful Heart',
        bookId: 'proverbs',
        bookName: 'Proverbs',
        chapters: [15],
        focusVerse: 'A soft answer turneth away wrath: but grievous words stir up anger.',
        focusVerseRef: 'Proverbs 15:1',
        learningObjective: 'Control your temper and speak words of calm peace when disagreements happen.',
        reflectionPrompt: 'Can I recall a time gentle words resolved an argument with a friend or sibling?'
      },
      {
        day: 7,
        title: 'Choosing a Good Name & Training Up',
        bookId: 'proverbs',
        bookName: 'Proverbs',
        chapters: [22],
        focusVerse: 'A good name is rather to be chosen than great riches, and loving favour rather than silver and gold.',
        focusVerseRef: 'Proverbs 22:1',
        learningObjective: 'Recognize that character, integrity, and honor matter more than popular status.',
        reflectionPrompt: 'What kind of reputation do I want to build among teachers, family, and classmates?'
      }
    ]
  },
  {
    id: 'john-gospel',
    title: '21-Day Encounter with Jesus',
    subtitle: 'The Gospel of John: Faith, Miracles, Light, and Life',
    durationDays: 21,
    category: 'Gospels',
    icon: 'auto_stories',
    color: 'from-blue-600 to-indigo-700',
    badge: 'Foundations of Faith',
    description: 'Encounter Jesus as the Word made flesh, the Light of the World, the Good Shepherd, and the Resurrection. Built to deepen your personal relationship with Christ.',
    sessions: [
      {
        day: 1,
        title: 'The Word Made Flesh & Light of Men',
        bookId: 'john',
        bookName: 'John',
        chapters: [1],
        focusVerse: 'In the beginning was the Word, and the Word was with God, and the Word was God... In him was life; and the life was the light of men.',
        focusVerseRef: 'John 1:1, 4',
        learningObjective: 'Understand Jesus as the eternal Son of God who brings life and dispels darkness.',
        reflectionPrompt: 'How does knowing Jesus is always with me bring light into my worries?'
      },
      {
        day: 2,
        title: 'Born of the Spirit & God’s Infinite Love',
        bookId: 'john',
        bookName: 'John',
        chapters: [3],
        focusVerse: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
        focusVerseRef: 'John 3:16',
        learningObjective: 'Rejoice in the immense gift of eternal salvation and new spiritual birth.',
        reflectionPrompt: 'What does God’s unconditional love mean to me personally?'
      },
      {
        day: 3,
        title: 'The Living Water & True Worship',
        bookId: 'john',
        bookName: 'John',
        chapters: [4],
        focusVerse: 'Whosoever drinketh of the water that I shall give him shall never thirst.',
        focusVerseRef: 'John 4:14',
        learningObjective: 'Discover that only Christ satisfies our deepest spiritual longings.',
        reflectionPrompt: 'How can I spend quiet time worshipping God in spirit and truth this week?'
      },
      {
        day: 4,
        title: 'The Bread of Life from Heaven',
        bookId: 'john',
        bookName: 'John',
        chapters: [6],
        focusVerse: 'And Jesus said unto them, I am the bread of life: he that cometh to me shall never hunger.',
        focusVerseRef: 'John 6:35',
        learningObjective: 'Feed your mind and spirit daily on God’s Word as our true daily bread.',
        reflectionPrompt: 'Am I spending as much time reading God’s Word as I do eating breakfast?'
      },
      {
        day: 5,
        title: 'The Good Shepherd Who Knows His Sheep',
        bookId: 'john',
        bookName: 'John',
        chapters: [10],
        focusVerse: 'I am the good shepherd: the good shepherd giveth his life for the sheep.',
        focusVerseRef: 'John 10:11',
        learningObjective: 'Rest securely knowing Jesus watches over your steps, safety, and future.',
        reflectionPrompt: 'In what ways does the Good Shepherd protect and comfort me when I am troubled?'
      },
      {
        day: 6,
        title: 'The Way, the Truth, the Life & The Comforter',
        bookId: 'john',
        bookName: 'John',
        chapters: [14],
        focusVerse: 'Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled.',
        focusVerseRef: 'John 14:27',
        learningObjective: 'Experience the supernatural peace of Christ and the guiding help of the Holy Spirit.',
        reflectionPrompt: 'How can I ask the Holy Spirit to teach me and remind me of what I have learned?'
      },
      {
        day: 7,
        title: 'Abiding in the Vine & Bearing Much Fruit',
        bookId: 'john',
        bookName: 'John',
        chapters: [15],
        focusVerse: 'I am the vine, ye are the branches: He that abideth in me, and I in him, the same bringeth forth much fruit: for without me ye can do nothing.',
        focusVerseRef: 'John 15:5',
        learningObjective: 'Stay deeply connected to Jesus through daily prayer, scripture, and obedient love.',
        reflectionPrompt: 'What kind of fruit (kindness, joy, patience) do I want people to see in my life?'
      }
    ]
  },
  {
    id: 'courage-exams',
    title: '7-Day Scholar Courage & Peace Plan',
    subtitle: 'Overcoming Anxiety, Exam Fears, and Building Unshakeable Faith',
    durationDays: 7,
    category: 'Peace & Courage',
    icon: 'shield',
    color: 'from-emerald-600 to-teal-700',
    badge: 'Great Before Tests & Exams',
    description: 'Scripture anchors specifically selected to eradicate test anxiety, ignite mental clarity, and instill divine courage in scholars before exams and presentations.',
    sessions: [
      {
        day: 1,
        title: 'Be Strong and of a Good Courage',
        bookId: 'joshua',
        bookName: 'Joshua',
        chapters: [1],
        focusVerse: 'Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.',
        focusVerseRef: 'Joshua 1:9',
        learningObjective: 'Embrace holy confidence knowing God is with you wherever you step.',
        reflectionPrompt: 'Whenever I feel nervous about a quiz or exam, how can I remind myself God is with me?'
      },
      {
        day: 2,
        title: 'The Lord is My Shepherd: Fear No Evil',
        bookId: 'psalms',
        bookName: 'Psalms',
        chapters: [23],
        focusVerse: 'Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.',
        focusVerseRef: 'Psalm 23:4',
        learningObjective: 'Find calm assurance in the guidance and comforting rod of your Shepherd.',
        reflectionPrompt: 'What fear can I let go of today because Jesus is my Shepherd?'
      },
      {
        day: 3,
        title: 'Dwelling in the Secret Place of Safety',
        bookId: 'psalms',
        bookName: 'Psalms',
        chapters: [91],
        focusVerse: 'He that dwelleth in the secret place of the most High shall abide under the shadow of the Almighty. I will say of the LORD, He is my refuge and my fortress.',
        focusVerseRef: 'Psalm 91:1-2',
        learningObjective: 'Take shelter under God’s protective wings when feeling pressured or stressed.',
        reflectionPrompt: 'How can I make prayer my immediate refuge when school feels overwhelming?'
      },
      {
        day: 4,
        title: 'Be Careful for Nothing: God’s Perfect Peace',
        bookId: 'philippians',
        bookName: 'Philippians',
        chapters: [4],
        focusVerse: 'Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God. And the peace of God shall keep your hearts.',
        focusVerseRef: 'Philippians 4:6-7',
        learningObjective: 'Trade anxious thoughts for thanksgiving and experience peace that passes understanding.',
        reflectionPrompt: 'What 3 things can I thank God for right now before studying?'
      },
      {
        day: 5,
        title: 'I Can Do All Things Through Christ',
        bookId: 'philippians',
        bookName: 'Philippians',
        chapters: [4],
        focusVerse: 'I can do all things through Christ which strengtheneth me.',
        focusVerseRef: 'Philippians 4:13',
        learningObjective: 'Replace “I cannot do this” with Christ’s empowering supernatural strength.',
        reflectionPrompt: 'Which challenging academic subject do I need Christ’s strength for today?'
      },
      {
        day: 6,
        title: 'Putting on the Whole Armor of God',
        bookId: 'ephesians',
        bookName: 'Ephesians',
        chapters: [6],
        focusVerse: 'Finally, my brethren, be strong in the Lord, and in the power of his might. Put on the whole armour of God, that ye may be able to stand.',
        focusVerseRef: 'Ephesians 6:10-11',
        learningObjective: 'Equip your mind with the helmet of salvation and shield of faith every morning.',
        reflectionPrompt: 'How does speaking truth and walking in righteousness act as spiritual armor?'
      },
      {
        day: 7,
        title: 'Doing All Heartily Unto the Lord',
        bookId: 'colossians',
        bookName: 'Colossians',
        chapters: [3],
        focusVerse: 'And whatsoever ye do, do it heartily, as to the Lord, and not unto men; Knowing that of the Lord ye shall receive the reward of the inheritance.',
        focusVerseRef: 'Colossians 3:23-24',
        learningObjective: 'Study and work with excellence because your greatest reward comes from Jesus.',
        reflectionPrompt: 'How will working for the Lord change the effort and quality I put into my schoolwork?'
      }
    ]
  },
  {
    id: 'fruit-of-spirit',
    title: '14-Day Fruit of the Spirit & Character Plan',
    subtitle: 'Cultivating Love, Joy, Peace, Patience, Gentleness, and Self-Control',
    durationDays: 14,
    category: 'Character',
    icon: 'favorite',
    color: 'from-rose-500 to-pink-600',
    badge: 'Christian Character Building',
    description: 'Transform your daily interactions with siblings, teachers, and classmates by cultivating the ninefold Fruit of the Holy Spirit.',
    sessions: [
      {
        day: 1,
        title: 'Walking in the Spirit & The 9 Fruits',
        bookId: 'galatians',
        bookName: 'Galatians',
        chapters: [5],
        focusVerse: 'But the fruit of the Spirit is love, joy, peace, longsuffering, gentleness, goodness, faith, meekness, temperance: against such there is no law.',
        focusVerseRef: 'Galatians 5:22-23',
        learningObjective: 'Recognize that good character is the natural fruit of staying close to the Holy Spirit.',
        reflectionPrompt: 'Which of the 9 fruits do I feel I need most today?'
      },
      {
        day: 2,
        title: 'The Excellence of Love (Agape)',
        bookId: '1corinthians',
        bookName: '1 Corinthians',
        chapters: [13],
        focusVerse: 'Charity suffereth long, and is kind; charity envieth not; charity vaunteth not itself, is not puffed up... Charity never faileth.',
        focusVerseRef: '1 Corinthians 13:4, 8',
        learningObjective: 'Practice genuine patience, kindness, and unselfish love in every conversation.',
        reflectionPrompt: 'How can I demonstrate patient kindness to someone who tested my patience recently?'
      },
      {
        day: 3,
        title: 'Humility and Mind of Christ',
        bookId: 'philippians',
        bookName: 'Philippians',
        chapters: [2],
        focusVerse: 'Let nothing be done through strife or vainglory; but in lowliness of mind let each esteem other better than themselves.',
        focusVerseRef: 'Philippians 2:3',
        learningObjective: 'Value other people above selfish ambition or showing off.',
        reflectionPrompt: 'How can I celebrate a classmate’s success without feeling jealous?'
      },
      {
        day: 4,
        title: 'Forgiving One Another as Christ Forgave You',
        bookId: 'colossians',
        bookName: 'Colossians',
        chapters: [3],
        focusVerse: 'Forbearing one another, and forgiving one another, if any man have a quarrel against any: even as Christ forgave you, so also do ye.',
        focusVerseRef: 'Colossians 3:13',
        learningObjective: 'Release bitterness quickly and extend the same mercy Jesus has shown you.',
        reflectionPrompt: 'Is there someone I need to forgive in my heart today?'
      },
      {
        day: 5,
        title: 'Bridling the Tongue & Pure Wisdom',
        bookId: 'james',
        bookName: 'James',
        chapters: [3],
        focusVerse: 'Who is a wise man and endued with knowledge among you? let him shew out of a good conversation his works with meekness of wisdom.',
        focusVerseRef: 'James 3:13',
        learningObjective: 'Tame your speech so that every word you utter builds up rather than tears down.',
        reflectionPrompt: 'Did the words I spoke today reflect the meekness and wisdom of Christ?'
      }
    ]
  },
  {
    id: 'psalms-praise',
    title: '10-Day Psalms of Praise & Thanksgiving',
    subtitle: 'Hymns of Worship, Protection, and Joy from the Sweet Psalmist of Israel',
    durationDays: 10,
    category: 'Foundations',
    icon: 'music_note',
    color: 'from-purple-600 to-indigo-800',
    badge: 'Heart of Worship',
    description: 'Sing and meditate on the beloved Psalms of David and Asaph. Fill your days with gratitude, holy joy, and continuous thanksgiving.',
    sessions: [
      {
        day: 1,
        title: 'The Blessed Tree by the Living Waters',
        bookId: 'psalms',
        bookName: 'Psalms',
        chapters: [1],
        focusVerse: 'And he shall be like a tree planted by the rivers of water, that bringeth forth his fruit in his season; his leaf also shall not wither; and whatsoever he doeth shall prosper.',
        focusVerseRef: 'Psalm 1:3',
        learningObjective: 'Delight in God’s law day and night so that you flourish in all your endeavors.',
        reflectionPrompt: 'What steps can I take to make reading the Bible a joyful daily habit?'
      },
      {
        day: 2,
        title: 'Enter His Gates with Thanksgiving',
        bookId: 'psalms',
        bookName: 'Psalms',
        chapters: [100],
        focusVerse: 'Enter into his gates with thanksgiving, and into his courts with praise: be thankful unto him, and bless his name. For the LORD is good; his mercy is everlasting.',
        focusVerseRef: 'Psalm 100:4-5',
        learningObjective: 'Begin every morning with heartfelt praise for God’s eternal goodness and faithfulness.',
        reflectionPrompt: 'What is one specific blessing in my life that I thank the Lord for today?'
      },
      {
        day: 3,
        title: 'Thy Word is a Lamp Unto My Feet',
        bookId: 'psalms',
        bookName: 'Psalms',
        chapters: [119],
        focusVerse: 'Thy word is a lamp unto my feet, and a light unto my path. Thy word have I hid in mine heart, that I might not sin against thee.',
        focusVerseRef: 'Psalm 119:105, 11',
        learningObjective: 'Memorize scripture so it illuminates your decisions and guards your integrity.',
        reflectionPrompt: 'Which Bible verse would I like to memorize this week?'
      },
      {
        day: 4,
        title: 'The Lord is My Keeper by Day and Night',
        bookId: 'psalms',
        bookName: 'Psalms',
        chapters: [121],
        focusVerse: 'The LORD is thy keeper: the LORD is thy shade upon thy right hand. The LORD shall preserve thy going out and thy coming in from this time forth.',
        focusVerseRef: 'Psalm 121:5, 8',
        learningObjective: 'Trust in the sleepless guardian of Israel who protects you on every journey.',
        reflectionPrompt: 'How can I pray for God’s protection over my family and school today?'
      },
      {
        day: 5,
        title: 'Let Everything with Breath Praise the Lord',
        bookId: 'psalms',
        bookName: 'Psalms',
        chapters: [150],
        focusVerse: 'Let every thing that hath breath praise the LORD. Praise ye the LORD.',
        focusVerseRef: 'Psalm 150:6',
        learningObjective: 'Consecrate your talents, voice, and thoughts to glorify God in worship.',
        reflectionPrompt: 'How can I use my abilities in school to bring praise and glory to God?'
      }
    ]
  }
];
