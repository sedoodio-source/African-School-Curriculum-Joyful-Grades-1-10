export interface BibleVerse {
  verseNumber: number;
  text: string;
}

export interface BibleChapter {
  chapterNumber: number;
  title?: string;
  theme?: string;
  verses: BibleVerse[];
}

export interface BibleBook {
  id: string;
  name: string;
  testament: 'Old Testament' | 'New Testament';
  category: 'Law' | 'History' | 'Wisdom & Poetry' | 'Prophets' | 'Gospels' | 'Acts' | 'Epistles' | 'Prophecy';
  chaptersCount: number;
  summary: string;
  keyVerse: {
    reference: string;
    text: string;
  };
  chapters: BibleChapter[];
}

export interface BibleTopic {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  verses: {
    reference: string;
    bookId: string;
    chapter: number;
    text: string;
    lesson: string;
  }[];
}

export interface DailyDevotional {
  id: string;
  dayTitle: string;
  scriptureRef: string;
  scriptureText: string;
  theme: string;
  reflection: string;
  studentApplication: string;
  prayer: string;
}

export const BIBLE_BOOKS_CATALOG: { id: string; name: string; testament: 'Old Testament' | 'New Testament'; category: BibleBook['category']; totalChapters: number }[] = [
  // Old Testament (39 books)
  { id: 'genesis', name: 'Genesis', testament: 'Old Testament', category: 'Law', totalChapters: 50 },
  { id: 'exodus', name: 'Exodus', testament: 'Old Testament', category: 'Law', totalChapters: 40 },
  { id: 'leviticus', name: 'Leviticus', testament: 'Old Testament', category: 'Law', totalChapters: 27 },
  { id: 'numbers', name: 'Numbers', testament: 'Old Testament', category: 'Law', totalChapters: 36 },
  { id: 'deuteronomy', name: 'Deuteronomy', testament: 'Old Testament', category: 'Law', totalChapters: 34 },
  { id: 'joshua', name: 'Joshua', testament: 'Old Testament', category: 'History', totalChapters: 24 },
  { id: 'judges', name: 'Judges', testament: 'Old Testament', category: 'History', totalChapters: 21 },
  { id: 'ruth', name: 'Ruth', testament: 'Old Testament', category: 'History', totalChapters: 4 },
  { id: '1samuel', name: '1 Samuel', testament: 'Old Testament', category: 'History', totalChapters: 31 },
  { id: '2samuel', name: '2 Samuel', testament: 'Old Testament', category: 'History', totalChapters: 24 },
  { id: '1kings', name: '1 Kings', testament: 'Old Testament', category: 'History', totalChapters: 22 },
  { id: '2kings', name: '2 Kings', testament: 'Old Testament', category: 'History', totalChapters: 25 },
  { id: '1chronicles', name: '1 Chronicles', testament: 'Old Testament', category: 'History', totalChapters: 29 },
  { id: '2chronicles', name: '2 Chronicles', testament: 'Old Testament', category: 'History', totalChapters: 36 },
  { id: 'ezra', name: 'Ezra', testament: 'Old Testament', category: 'History', totalChapters: 10 },
  { id: 'nehemiah', name: 'Nehemiah', testament: 'Old Testament', category: 'History', totalChapters: 13 },
  { id: 'esther', name: 'Esther', testament: 'Old Testament', category: 'History', totalChapters: 10 },
  { id: 'job', name: 'Job', testament: 'Old Testament', category: 'Wisdom & Poetry', totalChapters: 42 },
  { id: 'psalms', name: 'Psalms', testament: 'Old Testament', category: 'Wisdom & Poetry', totalChapters: 150 },
  { id: 'proverbs', name: 'Proverbs', testament: 'Old Testament', category: 'Wisdom & Poetry', totalChapters: 31 },
  { id: 'ecclesiastes', name: 'Ecclesiastes', testament: 'Old Testament', category: 'Wisdom & Poetry', totalChapters: 12 },
  { id: 'songofsolomon', name: 'Song of Solomon', testament: 'Old Testament', category: 'Wisdom & Poetry', totalChapters: 8 },
  { id: 'isaiah', name: 'Isaiah', testament: 'Old Testament', category: 'Prophets', totalChapters: 66 },
  { id: 'jeremiah', name: 'Jeremiah', testament: 'Old Testament', category: 'Prophets', totalChapters: 52 },
  { id: 'lamentations', name: 'Lamentations', testament: 'Old Testament', category: 'Prophets', totalChapters: 5 },
  { id: 'ezekiel', name: 'Ezekiel', testament: 'Old Testament', category: 'Prophets', totalChapters: 48 },
  { id: 'daniel', name: 'Daniel', testament: 'Old Testament', category: 'Prophets', totalChapters: 12 },
  { id: 'hosea', name: 'Hosea', testament: 'Old Testament', category: 'Prophets', totalChapters: 14 },
  { id: 'joel', name: 'Joel', testament: 'Old Testament', category: 'Prophets', totalChapters: 3 },
  { id: 'amos', name: 'Amos', testament: 'Old Testament', category: 'Prophets', totalChapters: 9 },
  { id: 'obadiah', name: 'Obadiah', testament: 'Old Testament', category: 'Prophets', totalChapters: 1 },
  { id: 'jonah', name: 'Jonah', testament: 'Old Testament', category: 'Prophets', totalChapters: 4 },
  { id: 'micah', name: 'Micah', testament: 'Old Testament', category: 'Prophets', totalChapters: 7 },
  { id: 'nahum', name: 'Nahum', testament: 'Old Testament', category: 'Prophets', totalChapters: 3 },
  { id: 'habakkuk', name: 'Habakkuk', testament: 'Old Testament', category: 'Prophets', totalChapters: 3 },
  { id: 'zephaniah', name: 'Zephaniah', testament: 'Old Testament', category: 'Prophets', totalChapters: 3 },
  { id: 'haggai', name: 'Haggai', testament: 'Old Testament', category: 'Prophets', totalChapters: 2 },
  { id: 'zechariah', name: 'Zechariah', testament: 'Old Testament', category: 'Prophets', totalChapters: 14 },
  { id: 'malachi', name: 'Malachi', testament: 'Old Testament', category: 'Prophets', totalChapters: 4 },

  // New Testament (27 books)
  { id: 'matthew', name: 'Matthew', testament: 'New Testament', category: 'Gospels', totalChapters: 28 },
  { id: 'mark', name: 'Mark', testament: 'New Testament', category: 'Gospels', totalChapters: 16 },
  { id: 'luke', name: 'Luke', testament: 'New Testament', category: 'Gospels', totalChapters: 24 },
  { id: 'john', name: 'John', testament: 'New Testament', category: 'Gospels', totalChapters: 21 },
  { id: 'acts', name: 'Acts', testament: 'New Testament', category: 'Acts', totalChapters: 28 },
  { id: 'romans', name: 'Romans', testament: 'New Testament', category: 'Epistles', totalChapters: 16 },
  { id: '1corinthians', name: '1 Corinthians', testament: 'New Testament', category: 'Epistles', totalChapters: 16 },
  { id: '2corinthians', name: '2 Corinthians', testament: 'New Testament', category: 'Epistles', totalChapters: 13 },
  { id: 'galatians', name: 'Galatians', testament: 'New Testament', category: 'Epistles', totalChapters: 6 },
  { id: 'ephesians', name: 'Ephesians', testament: 'New Testament', category: 'Epistles', totalChapters: 6 },
  { id: 'philippians', name: 'Philippians', testament: 'New Testament', category: 'Epistles', totalChapters: 4 },
  { id: 'colossians', name: 'Colossians', testament: 'New Testament', category: 'Epistles', totalChapters: 4 },
  { id: '1thessalonians', name: '1 Thessalonians', testament: 'New Testament', category: 'Epistles', totalChapters: 5 },
  { id: '2thessalonians', name: '2 Thessalonians', testament: 'New Testament', category: 'Epistles', totalChapters: 3 },
  { id: '1timothy', name: '1 Timothy', testament: 'New Testament', category: 'Epistles', totalChapters: 6 },
  { id: '2timothy', name: '2 Timothy', testament: 'New Testament', category: 'Epistles', totalChapters: 4 },
  { id: 'titus', name: 'Titus', testament: 'New Testament', category: 'Epistles', totalChapters: 3 },
  { id: 'philemon', name: 'Philemon', testament: 'New Testament', category: 'Epistles', totalChapters: 1 },
  { id: 'hebrews', name: 'Hebrews', testament: 'New Testament', category: 'Epistles', totalChapters: 13 },
  { id: 'james', name: 'James', testament: 'New Testament', category: 'Epistles', totalChapters: 5 },
  { id: '1peter', name: '1 Peter', testament: 'New Testament', category: 'Epistles', totalChapters: 5 },
  { id: '2peter', name: '2 Peter', testament: 'New Testament', category: 'Epistles', totalChapters: 3 },
  { id: '1john', name: '1 John', testament: 'New Testament', category: 'Epistles', totalChapters: 5 },
  { id: '2john', name: '2 John', testament: 'New Testament', category: 'Epistles', totalChapters: 1 },
  { id: '3john', name: '3 John', testament: 'New Testament', category: 'Epistles', totalChapters: 1 },
  { id: 'jude', name: 'Jude', testament: 'New Testament', category: 'Epistles', totalChapters: 1 },
  { id: 'revelation', name: 'Revelation', testament: 'New Testament', category: 'Prophecy', totalChapters: 22 },
];

export const DETAILED_BIBLE_BOOKS: Record<string, BibleBook> = {
  genesis: {
    id: 'genesis',
    name: 'Genesis',
    testament: 'Old Testament',
    category: 'Law',
    chaptersCount: 50,
    summary: 'The Book of Beginnings: Creation of the universe, the origin of humanity, God’s covenant with Abraham, Isaac, Jacob, and the story of Joseph in Egypt.',
    keyVerse: {
      reference: 'Genesis 1:1',
      text: 'In the beginning God created the heaven and the earth.'
    },
    chapters: [
      {
        chapterNumber: 1,
        title: 'The Creation of the World',
        theme: 'God creates the heavens, earth, light, skies, seas, land, vegetation, sun, moon, stars, sea creatures, birds, land animals, and humanity in His own image.',
        verses: [
          { verseNumber: 1, text: 'In the beginning God created the heaven and the earth.' },
          { verseNumber: 2, text: 'And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.' },
          { verseNumber: 3, text: 'And God said, Let there be light: and there was light.' },
          { verseNumber: 4, text: 'And God saw the light, that it was good: and God divided the light from the darkness.' },
          { verseNumber: 5, text: 'And God called the light Day, and the darkness he called Night. And the evening and the morning were the first day.' },
          { verseNumber: 6, text: 'And God said, Let there be a firmament in the midst of the waters, and let it divide the waters from the waters.' },
          { verseNumber: 7, text: 'And God made the firmament, and divided the waters which were under the firmament from the waters which were above the firmament: and it was so.' },
          { verseNumber: 8, text: 'And God called the firmament Heaven. And the evening and the morning were the second day.' },
          { verseNumber: 9, text: 'And God said, Let the waters under the heaven be gathered together unto one place, and let the dry land appear: and it was so.' },
          { verseNumber: 10, text: 'And God called the dry land Earth; and the gathering together of the waters called he Seas: and God saw that it was good.' },
          { verseNumber: 11, text: 'And God said, Let the earth bring forth grass, the herb yielding seed, and the fruit tree yielding fruit after his kind, whose seed is in itself, upon the earth: and it was so.' },
          { verseNumber: 12, text: 'And the earth brought forth grass, and herb yielding seed after his kind, and the tree yielding fruit, whose seed was in itself, after his kind: and God saw that it was good.' },
          { verseNumber: 13, text: 'And the evening and the morning were the third day.' },
          { verseNumber: 14, text: 'And God said, Let there be lights in the firmament of the heaven to divide the day from the night; and let them be for signs, and for seasons, and for days, and years.' },
          { verseNumber: 15, text: 'And let them be for lights in the firmament of the heaven to give light upon the earth: and it was so.' },
          { verseNumber: 16, text: 'And God made two great lights; the greater light to rule the day, and the lesser light to rule the night: he made the stars also.' },
          { verseNumber: 17, text: 'And God set them in the firmament of the heaven to give light upon the earth,' },
          { verseNumber: 18, text: 'And to rule over the day and over the night, and to divide the light from the darkness: and God saw that it was good.' },
          { verseNumber: 19, text: 'And the evening and the morning were the fourth day.' },
          { verseNumber: 20, text: 'And God said, Let the waters bring forth abundantly the moving creature that hath life, and fowl that may fly above the earth in the open firmament of heaven.' },
          { verseNumber: 21, text: 'And God created great whales, and every living creature that moveth, which the waters brought forth abundantly, after their kind, and every winged fowl after his kind: and God saw that it was good.' },
          { verseNumber: 22, text: 'And God blessed them, saying, Be fruitful, and multiply, and fill the waters in the seas, and let fowl multiply in the earth.' },
          { verseNumber: 23, text: 'And the evening and the morning were the fifth day.' },
          { verseNumber: 24, text: 'And God said, Let the earth bring forth the living creature after his kind, cattle, and creeping thing, and beast of the earth after his kind: and it was so.' },
          { verseNumber: 25, text: 'And God made the beast of the earth after his kind, and cattle after their kind, and every thing that creepeth upon the earth after his kind: and God saw that it was good.' },
          { verseNumber: 26, text: 'And God said, Let us make man in our image, after our likeness: and let them have dominion over the fish of the sea, and over the fowl of the air, and over the cattle, and over all the earth, and over every creeping thing that creepeth upon the earth.' },
          { verseNumber: 27, text: 'So God created man in his own image, in the image of God created he him; male and female created he them.' },
          { verseNumber: 28, text: 'And God blessed them, and God said unto them, Be fruitful, and multiply, and replenish the earth, and subdue it: and have dominion over the fish of the sea, and over the fowl of the air, and over every living thing that moveth upon the earth.' },
          { verseNumber: 29, text: 'And God said, Behold, I have given you every herb bearing seed, which is upon the face of all the earth, and every tree, in the which is the fruit of a tree yielding seed; to you it shall be for meat.' },
          { verseNumber: 30, text: 'And to every beast of the earth, and to every fowl of the air, and to every thing that creepeth upon the earth, wherein there is life, I have given every green herb for meat: and it was so.' },
          { verseNumber: 31, text: 'And God saw every thing that he had made, and, behold, it was very good. And the evening and the morning were the sixth day.' }
        ]
      },
      {
        chapterNumber: 2,
        title: 'The Garden of Eden & The Breath of Life',
        theme: 'God rests on the seventh day and blesses it; the creation of the Garden of Eden and the tree of life.',
        verses: [
          { verseNumber: 1, text: 'Thus the heavens and the earth were finished, and all the host of them.' },
          { verseNumber: 2, text: 'And on the seventh day God ended his work which he had made; and he rested on the seventh day from all his work which he had made.' },
          { verseNumber: 3, text: 'And God blessed the seventh day, and sanctified it: because that in it he had rested from all his work which God created and made.' },
          { verseNumber: 4, text: 'These are the generations of the heavens and of the earth when they were created, in the day that the LORD God made the earth and the heavens,' },
          { verseNumber: 7, text: 'And the LORD God formed man of the dust of the ground, and breathed into his nostrils the breath of life; and man became a living soul.' },
          { verseNumber: 8, text: 'And the LORD God planted a garden eastward in Eden; and there he put the man whom he had formed.' },
          { verseNumber: 9, text: 'And out of the ground made the LORD God to grow every tree that is pleasant to the sight, and good for food; the tree of life also in the midst of the garden, and the tree of knowledge of good and evil.' },
          { verseNumber: 15, text: 'And the LORD God took the man, and put him into the garden of Eden to dress it and to keep it.' }
        ]
      }
    ]
  },

  psalms: {
    id: 'psalms',
    name: 'Psalms',
    testament: 'Old Testament',
    category: 'Wisdom & Poetry',
    chaptersCount: 150,
    summary: 'The inspired hymnal, prayers, and poetry of Israel, capturing devotion, praise, trust in distress, and the loving protection of the Almighty.',
    keyVerse: {
      reference: 'Psalm 23:1',
      text: 'The LORD is my shepherd; I shall not want.'
    },
    chapters: [
      {
        chapterNumber: 1,
        title: 'The Way of the Righteous and the Ungodly',
        theme: 'Blessed is the one who delights in the law of the Lord; like a tree planted by rivers of water.',
        verses: [
          { verseNumber: 1, text: 'Blessed is the man that walketh not in the counsel of the ungodly, nor standeth in the way of sinners, nor sitteth in the seat of the scornful.' },
          { verseNumber: 2, text: 'But his delight is in the law of the LORD; and in his law doth he meditate day and night.' },
          { verseNumber: 3, text: 'And he shall be like a tree planted by the rivers of water, that bringeth forth his fruit in his season; his leaf also shall not wither; and whatsoever he doeth shall prosper.' },
          { verseNumber: 4, text: 'The ungodly are not so: but are like the chaff which the wind driveth away.' },
          { verseNumber: 5, text: 'Therefore the ungodly shall not stand in the judgment, nor sinners in the congregation of the righteous.' },
          { verseNumber: 6, text: 'For the LORD knoweth the way of the righteous: but the way of the ungodly shall perish.' }
        ]
      },
      {
        chapterNumber: 23,
        title: 'The Lord is My Shepherd',
        theme: 'David’s hymn of total confidence in God’s provision, protection, guidance, and eternal mercy.',
        verses: [
          { verseNumber: 1, text: 'The LORD is my shepherd; I shall not want.' },
          { verseNumber: 2, text: 'He maketh me to lie down in green pastures: he leadeth me beside the still waters.' },
          { verseNumber: 3, text: 'He restoreth my soul: he leadeth me in the paths of righteousness for his name\'s sake.' },
          { verseNumber: 4, text: 'Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.' },
          { verseNumber: 5, text: 'Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over.' },
          { verseNumber: 6, text: 'Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever.' }
        ]
      },
      {
        chapterNumber: 91,
        title: 'The Secret Place of the Most High',
        theme: 'The divine promise of safety, angelic protection, and deliverance for all who abide in God’s presence.',
        verses: [
          { verseNumber: 1, text: 'He that dwelleth in the secret place of the most High shall abide under the shadow of the Almighty.' },
          { verseNumber: 2, text: 'I will say of the LORD, He is my refuge and my fortress: my God; in him will I trust.' },
          { verseNumber: 3, text: 'Surely he shall deliver thee from the snare of the fowler, and from the noisome pestilence.' },
          { verseNumber: 4, text: 'He shall cover thee with his feathers, and under his wings shalt thou trust: his truth shall be thy shield and buckler.' },
          { verseNumber: 5, text: 'Thou shalt not be afraid for the terror by night; nor for the arrow that flieth by day;' },
          { verseNumber: 6, text: 'Nor for the pestilence that walketh in darkness; nor for the destruction that wasteth at noonday.' },
          { verseNumber: 7, text: 'A thousand shall fall at thy side, and ten thousand at thy right hand; but it shall not come nigh thee.' },
          { verseNumber: 11, text: 'For he shall give his angels charge over thee, to keep thee in all thy ways.' },
          { verseNumber: 12, text: 'They shall bear thee up in their hands, lest thou dash thy foot against a stone.' },
          { verseNumber: 14, text: 'Because he hath set his love upon me, therefore will I deliver him: I will set him on high, because he hath known my name.' },
          { verseNumber: 15, text: 'He shall call upon me, and I will answer him: I will be with him in trouble; I will deliver him, and honour him.' },
          { verseNumber: 16, text: 'With long life will I satisfy him, and shew him my salvation.' }
        ]
      },
      {
        chapterNumber: 100,
        title: 'A Psalm of Praise and Thanksgiving',
        theme: 'Make a joyful noise unto the Lord; enter His gates with thanksgiving and His courts with praise.',
        verses: [
          { verseNumber: 1, text: 'Make a joyful noise unto the LORD, all ye lands.' },
          { verseNumber: 2, text: 'Serve the LORD with gladness: come before his presence with singing.' },
          { verseNumber: 3, text: 'Know ye that the LORD he is God: it is he that hath made us, and not we ourselves; we are his people, and the sheep of his pasture.' },
          { verseNumber: 4, text: 'Enter into his gates with thanksgiving, and into his courts with praise: be thankful unto him, and bless his name.' },
          { verseNumber: 5, text: 'For the LORD is good; his mercy is everlasting; and his truth endureth to all generations.' }
        ]
      },
      {
        chapterNumber: 119,
        title: 'The Greatness of God\'s Word',
        theme: 'Thy word is a lamp unto my feet, and a light unto my path. Seeking God\'s precepts with all our heart.',
        verses: [
          { verseNumber: 9, text: 'Wherewithal shall a young man cleanse his way? by taking heed thereto according to thy word.' },
          { verseNumber: 10, text: 'With my whole heart have I sought thee: O let me not wander from thy commandments.' },
          { verseNumber: 11, text: 'Thy word have I hid in mine heart, that I might not sin against thee.' },
          { verseNumber: 105, text: 'Thy word is a lamp unto my feet, and a light unto my path.' },
          { verseNumber: 130, text: 'The entrance of thy words giveth light; it giveth understanding unto the simple.' },
          { verseNumber: 165, text: 'Great peace have they which love thy law: and nothing shall offend them.' }
        ]
      },
      {
        chapterNumber: 121,
        title: 'The Lord is My Keeper',
        theme: 'My help comes from the Lord who made heaven and earth; He will not let your foot slip.',
        verses: [
          { verseNumber: 1, text: 'I will lift up mine eyes unto the hills, from whence cometh my help.' },
          { verseNumber: 2, text: 'My help cometh from the LORD, which made heaven and earth.' },
          { verseNumber: 3, text: 'He will not suffer thy foot to be moved: he that keepeth thee will not slumber.' },
          { verseNumber: 4, text: 'Behold, he that keepeth Israel shall neither slumber nor sleep.' },
          { verseNumber: 5, text: 'The LORD is thy keeper: the LORD is thy shade upon thy right hand.' },
          { verseNumber: 7, text: 'The LORD shall preserve thee from all evil: he shall preserve thy soul.' },
          { verseNumber: 8, text: 'The LORD shall preserve thy going out and thy coming in from this time forth, and even for evermore.' }
        ]
      },
      {
        chapterNumber: 150,
        title: 'Let Everything That Hath Breath Praise the Lord',
        theme: 'Praise God with trumpet, lute, harp, strings, organ, and high-sounding cymbals.',
        verses: [
          { verseNumber: 1, text: 'Praise ye the LORD. Praise God in his sanctuary: praise him in the firmament of his power.' },
          { verseNumber: 2, text: 'Praise him for his mighty acts: praise him according to his excellent greatness.' },
          { verseNumber: 3, text: 'Praise him with the sound of the trumpet: praise him with the psaltery and harp.' },
          { verseNumber: 4, text: 'Praise him with the timbrel and dance: praise him with stringed instruments and organs.' },
          { verseNumber: 5, text: 'Praise him upon the loud cymbals: praise him upon the high sounding cymbals.' },
          { verseNumber: 6, text: 'Let every thing that hath breath praise the LORD. Praise ye the LORD.' }
        ]
      }
    ]
  },

  proverbs: {
    id: 'proverbs',
    name: 'Proverbs',
    testament: 'Old Testament',
    category: 'Wisdom & Poetry',
    chaptersCount: 31,
    summary: 'Practical Godly wisdom for daily living, diligence, academic excellence, good friendship, honesty, and honoring parents.',
    keyVerse: {
      reference: 'Proverbs 3:5-6',
      text: 'Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.'
    },
    chapters: [
      {
        chapterNumber: 1,
        title: 'The Beginning of Knowledge',
        theme: 'The fear of the Lord is the beginning of knowledge; listening to the instruction of fathers and mothers.',
        verses: [
          { verseNumber: 1, text: 'The proverbs of Solomon the son of David, king of Israel;' },
          { verseNumber: 2, text: 'To know wisdom and instruction; to perceive the words of understanding;' },
          { verseNumber: 3, text: 'To receive the instruction of wisdom, justice, and judgment, and equity;' },
          { verseNumber: 4, text: 'To give subtilty to the simple, to the young man knowledge and discretion.' },
          { verseNumber: 5, text: 'A wise man will hear, and will increase learning; and a man of understanding shall attain unto wise counsels:' },
          { verseNumber: 7, text: 'The fear of the LORD is the beginning of knowledge: but fools despise wisdom and instruction.' },
          { verseNumber: 8, text: 'My son, hear the instruction of thy father, and forsake not the law of thy mother:' },
          { verseNumber: 9, text: 'For they shall be an ornament of grace unto thy head, and chains about thy neck.' }
        ]
      },
      {
        chapterNumber: 3,
        title: 'Trusting God with All Your Heart',
        theme: 'Do not forget God\'s law; trust Him with all your heart, honor Him with your firstfruits, and embrace wisdom.',
        verses: [
          { verseNumber: 1, text: 'My son, forget not my law; but let thine heart keep my commandments:' },
          { verseNumber: 2, text: 'For length of days, and long life, and peace, shall they add to thee.' },
          { verseNumber: 3, text: 'Let not mercy and truth forsake thee: bind them about thy neck; write them upon the table of thine heart:' },
          { verseNumber: 4, text: 'So shalt thou find favour and good understanding in the sight of God and man.' },
          { verseNumber: 5, text: 'Trust in the LORD with all thine heart; and lean not unto thine own understanding.' },
          { verseNumber: 6, text: 'In all thy ways acknowledge him, and he shall direct thy paths.' },
          { verseNumber: 7, text: 'Be not wise in thine own eyes: fear the LORD, and depart from evil.' },
          { verseNumber: 13, text: 'Happy is the man that findeth wisdom, and the man that getteth understanding.' },
          { verseNumber: 14, text: 'For the merchandise of it is better than the merchandise of silver, and the gain thereof than fine gold.' },
          { verseNumber: 15, text: 'She is more precious than rubies: and all the things thou canst desire are not to be compared unto her.' }
        ]
      },
      {
        chapterNumber: 4,
        title: 'Wisdom is the Principal Thing',
        theme: 'Get wisdom, get understanding; guard your heart with all diligence, for out of it are the issues of life.',
        verses: [
          { verseNumber: 1, text: 'Hear, ye children, the instruction of a father, and attend to know understanding.' },
          { verseNumber: 7, text: 'Wisdom is the principal thing; therefore get wisdom: and with all thy getting get understanding.' },
          { verseNumber: 8, text: 'Exalt her, and she shall promote thee: she shall bring thee to honour, when thou dost embrace her.' },
          { verseNumber: 18, text: 'But the path of the just is as the shining light, that shineth more and more unto the perfect day.' },
          { verseNumber: 23, text: 'Keep thy heart with all diligence; for out of it are the issues of life.' },
          { verseNumber: 24, text: 'Put away from thee a froward mouth, and perverse lips put far from thee.' },
          { verseNumber: 25, text: 'Let thine eyes look right on, and let thine eyelids look straight before thee.' },
          { verseNumber: 26, text: 'Ponder the path of thy feet, and let all thy ways be established.' }
        ]
      },
      {
        chapterNumber: 6,
        title: 'Lessons of Diligence from the Ant',
        theme: 'Go to the ant, thou sluggard; consider her ways, and be wise. Warning against laziness and dishonesty.',
        verses: [
          { verseNumber: 6, text: 'Go to the ant, thou sluggard; consider her ways, and be wise:' },
          { verseNumber: 7, text: 'Which having no guide, overseer, or ruler,' },
          { verseNumber: 8, text: 'Provideth her meat in the summer, and gathereth her food in the harvest.' },
          { verseNumber: 9, text: 'How long wilt thou sleep, O sluggard? when wilt thou arise out of thy sleep?' },
          { verseNumber: 10, text: 'Yet a little sleep, a little slumber, a little folding of the hands to sleep:' },
          { verseNumber: 11, text: 'So shall thy poverty come as one that travelleth, and thy want as an armed man.' }
        ]
      },
      {
        chapterNumber: 15,
        title: 'A Soft Answer Turns Away Wrath',
        theme: 'Gentle speech, wise listening, honest counsel, and a joyful heart.',
        verses: [
          { verseNumber: 1, text: 'A soft answer turneth away wrath: but grievous words stir up anger.' },
          { verseNumber: 2, text: 'The tongue of the wise useth knowledge aright: but the mouth of fools poureth out foolishness.' },
          { verseNumber: 3, text: 'The eyes of the LORD are in every place, beholding the evil and the good.' },
          { verseNumber: 13, text: 'A merry heart maketh a cheerful countenance: but by sorrow of the heart the spirit is broken.' },
          { verseNumber: 16, text: 'Better is little with the fear of the LORD than great treasure and trouble therewith.' },
          { verseNumber: 33, text: 'The fear of the LORD is the instruction of wisdom; and before honour is humility.' }
        ]
      },
      {
        chapterNumber: 22,
        title: 'A Good Name and Training the Child',
        theme: 'A good name is rather to be chosen than great riches; train up a child in the way he should go.',
        verses: [
          { verseNumber: 1, text: 'A good name is rather to be chosen than great riches, and loving favour rather than silver and gold.' },
          { verseNumber: 4, text: 'By humility and the fear of the LORD are riches, and honour, and life.' },
          { verseNumber: 6, text: 'Train up a child in the way he should go: and when he is old, he will not depart from it.' },
          { verseNumber: 29, text: 'Seest thou a man diligent in his business? he shall stand before kings; he shall not stand before mean men.' }
        ]
      }
    ]
  },

  matthew: {
    id: 'matthew',
    name: 'Matthew',
    testament: 'New Testament',
    category: 'Gospels',
    chaptersCount: 28,
    summary: 'The Gospel of the King: The life, miracles, parables, death, and triumphant resurrection of Jesus Christ, the Messiah.',
    keyVerse: {
      reference: 'Matthew 6:33',
      text: 'But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.'
    },
    chapters: [
      {
        chapterNumber: 5,
        title: 'The Sermon on the Mount & The Beatitudes',
        theme: 'Blessed are the poor in spirit, the meek, the peacemakers; you are the salt of the earth and the light of the world.',
        verses: [
          { verseNumber: 1, text: 'And seeing the multitudes, he went up into a mountain: and when he was set, his disciples came unto him:' },
          { verseNumber: 2, text: 'And he opened his mouth, and taught them, saying,' },
          { verseNumber: 3, text: 'Blessed are the poor in spirit: for theirs is the kingdom of heaven.' },
          { verseNumber: 4, text: 'Blessed are they that mourn: for they shall be comforted.' },
          { verseNumber: 5, text: 'Blessed are the meek: for they shall inherit the earth.' },
          { verseNumber: 6, text: 'Blessed are they which do hunger and thirst after righteousness: for they shall be filled.' },
          { verseNumber: 7, text: 'Blessed are the merciful: for they shall obtain mercy.' },
          { verseNumber: 8, text: 'Blessed are the pure in heart: for they shall see God.' },
          { verseNumber: 9, text: 'Blessed are the peacemakers: for they shall be called the children of God.' },
          { verseNumber: 14, text: 'Ye are the light of the world. A city that is set on an hill cannot be hid.' },
          { verseNumber: 15, text: 'Neither do men light a candle, and put it under a bushel, but on a candlestick; and it giveth light unto all that are in the house.' },
          { verseNumber: 16, text: 'Let your light so shine before men, that they may see your good works, and glorify your Father which is in heaven.' }
        ]
      },
      {
        chapterNumber: 6,
        title: 'The Lord\'s Prayer & Freedom from Anxiety',
        theme: 'How to pray; our Father which art in heaven; do not worry about tomorrow, for your heavenly Father cares for you.',
        verses: [
          { verseNumber: 9, text: 'After this manner therefore pray ye: Our Father which art in heaven, Hallowed be thy name.' },
          { verseNumber: 10, text: 'Thy kingdom come. Thy will be done in earth, as it is in heaven.' },
          { verseNumber: 11, text: 'Give us this day our daily bread.' },
          { verseNumber: 12, text: 'And forgive us our debts, as we forgive our debtors.' },
          { verseNumber: 13, text: 'And lead us not into temptation, but deliver us from evil: For thine is the kingdom, and the power, and the glory, for ever. Amen.' },
          { verseNumber: 25, text: 'Therefore I say unto you, Take no thought for your life, what ye shall eat, or what ye shall drink; nor yet for your body, what ye shall put on. Is not the life more than meat, and the body than raiment?' },
          { verseNumber: 26, text: 'Behold the fowls of the air: for they sow not, neither do they reap, nor gather into barns; yet your heavenly Father feedeth them. Are ye not much better than they?' },
          { verseNumber: 33, text: 'But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.' },
          { verseNumber: 34, text: 'Take therefore no thought for the morrow: for the morrow shall take thought for the things of itself. Sufficient unto the day is the evil thereof.' }
        ]
      },
      {
        chapterNumber: 28,
        title: 'The Resurrection & The Great Commission',
        theme: 'He is not here: for he is risen! Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost.',
        verses: [
          { verseNumber: 5, text: 'And the angel answered and said unto the women, Fear not ye: for I know that ye seek Jesus, which was crucified.' },
          { verseNumber: 6, text: 'He is not here: for he is risen, as he said. Come, see the place where the Lord lay.' },
          { verseNumber: 18, text: 'And Jesus came and spake unto them, saying, All power is given unto me in heaven and in earth.' },
          { verseNumber: 19, text: 'Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost:' },
          { verseNumber: 20, text: 'Teaching them to observe all things whatsoever I have commanded you: and, lo, I am with you alway, even unto the end of the world. Amen.' }
        ]
      }
    ]
  },

  john: {
    id: 'john',
    name: 'John',
    testament: 'New Testament',
    category: 'Gospels',
    chaptersCount: 21,
    summary: 'The Gospel of the Son of God: Demonstrating that Jesus is the Christ, the Light of the World, the Good Shepherd, the Resurrection and the Life.',
    keyVerse: {
      reference: 'John 3:16',
      text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.'
    },
    chapters: [
      {
        chapterNumber: 1,
        title: 'The Word Made Flesh',
        theme: 'In the beginning was the Word, and the Word was with God, and the Word was God; in Him was life, and the life was the light of men.',
        verses: [
          { verseNumber: 1, text: 'In the beginning was the Word, and the Word was with God, and the Word was God.' },
          { verseNumber: 2, text: 'The same was in the beginning with God.' },
          { verseNumber: 3, text: 'All things were made by him; and without him was not any thing made that was made.' },
          { verseNumber: 4, text: 'In him was life; and the life was the light of men.' },
          { verseNumber: 5, text: 'And the light shineth in darkness; and the darkness comprehended it not.' },
          { verseNumber: 12, text: 'But as many as received him, to them gave he power to become the sons of God, even to them that believe on his name:' },
          { verseNumber: 14, text: 'And the Word was made flesh, and dwelt among us, (and we beheld his glory, the glory as of the only begotten of the Father,) full of grace and truth.' }
        ]
      },
      {
        chapterNumber: 3,
        title: 'Jesus and Nicodemus: Born Again',
        theme: 'You must be born again; God so loved the world that He gave His only begotten Son.',
        verses: [
          { verseNumber: 3, text: 'Jesus answered and said unto him, Verily, verily, I say unto thee, Except a man be born again, he cannot see the kingdom of God.' },
          { verseNumber: 16, text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.' },
          { verseNumber: 17, text: 'For God sent not his Son into the world to condemn the world; but that the world through him might be saved.' }
        ]
      },
      {
        chapterNumber: 14,
        title: 'The Way, the Truth, and the Life',
        theme: 'Let not your heart be troubled: ye believe in God, believe also in me. The promise of the Holy Spirit.',
        verses: [
          { verseNumber: 1, text: 'Let not your heart be troubled: ye believe in God, believe also in me.' },
          { verseNumber: 2, text: 'In my Father\'s house are many mansions: if it were not so, I would have told you. I go to prepare a place for you.' },
          { verseNumber: 6, text: 'Jesus saith unto him, I am the way, the truth, and the life: no man cometh unto the Father, but by me.' },
          { verseNumber: 26, text: 'But the Comforter, which is the Holy Ghost, whom the Father will send in my name, he shall teach you all things, and bring all things to your remembrance, whatsoever I have said unto you.' },
          { verseNumber: 27, text: 'Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid.' }
        ]
      },
      {
        chapterNumber: 15,
        title: 'The True Vine and the Branches',
        theme: 'I am the vine, ye are the branches: He that abideth in me, and I in him, the same bringeth forth much fruit.',
        verses: [
          { verseNumber: 1, text: 'I am the true vine, and my Father is the husbandman.' },
          { verseNumber: 4, text: 'Abide in me, and I in you. As the branch cannot bear fruit of itself, except it abide in the vine; no more can ye, except ye abide in me.' },
          { verseNumber: 5, text: 'I am the vine, ye are the branches: He that abideth in me, and I in him, the same bringeth forth much fruit: for without me ye can do nothing.' },
          { verseNumber: 12, text: 'This is my commandment, That ye love one another, as I have loved you.' },
          { verseNumber: 13, text: 'Greater love hath no man than this, that a man lay down his life for his friends.' }
        ]
      }
    ]
  },

  philippians: {
    id: 'philippians',
    name: 'Philippians',
    testament: 'New Testament',
    category: 'Epistles',
    chaptersCount: 4,
    summary: 'The Epistle of Christian Joy: Finding unshakeable joy, peace of mind, unity, humility, and strength through Christ Jesus.',
    keyVerse: {
      reference: 'Philippians 4:13',
      text: 'I can do all things through Christ which strengtheneth me.'
    },
    chapters: [
      {
        chapterNumber: 4,
        title: 'Rejoicing Always & Christ Our Strength',
        theme: 'Be careful for nothing, but in everything by prayer let your requests be made known unto God. Thinking on pure and lovely things.',
        verses: [
          { verseNumber: 4, text: 'Rejoice in the Lord alway: and again I say, Rejoice.' },
          { verseNumber: 5, text: 'Let your moderation be known unto all men. The Lord is at hand.' },
          { verseNumber: 6, text: 'Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.' },
          { verseNumber: 7, text: 'And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.' },
          { verseNumber: 8, text: 'Finally, brethren, whatsoever things are true, whatsoever things are honest, whatsoever things are just, whatsoever things are pure, whatsoever things are lovely, whatsoever things are of good report; if there be any virtue, and if there be any praise, think on these things.' },
          { verseNumber: 13, text: 'I can do all things through Christ which strengtheneth me.' },
          { verseNumber: 19, text: 'But my God shall supply all your need according to his riches in glory by Christ Jesus.' }
        ]
      }
    ]
  },

  ephesians: {
    id: 'ephesians',
    name: 'Ephesians',
    testament: 'New Testament',
    category: 'Epistles',
    chaptersCount: 6,
    summary: 'God’s glorious grace, walking worthy of our calling, family honor, and putting on the whole armor of God to stand firm.',
    keyVerse: {
      reference: 'Ephesians 6:10-11',
      text: 'Finally, my brethren, be strong in the Lord, and in the power of his might. Put on the whole armour of God, that ye may be able to stand against the wiles of the devil.'
    },
    chapters: [
      {
        chapterNumber: 6,
        title: 'Children, Parents & The Whole Armor of God',
        theme: 'Children obey your parents in the Lord; taking up the belt of truth, breastplate of righteousness, shield of faith, helmet of salvation, and sword of the Spirit.',
        verses: [
          { verseNumber: 1, text: 'Children, obey your parents in the Lord: for this is right.' },
          { verseNumber: 2, text: 'Honour thy father and mother; which is the first commandment with promise;' },
          { verseNumber: 3, text: 'That it may be well with thee, and thou mayest live long on the earth.' },
          { verseNumber: 10, text: 'Finally, my brethren, be strong in the Lord, and in the power of his might.' },
          { verseNumber: 11, text: 'Put on the whole armour of God, that ye may be able to stand against the wiles of the devil.' },
          { verseNumber: 13, text: 'Wherefore take unto you the whole armour of God, that ye may be able to withstand in the evil day, and having done all, to stand.' },
          { verseNumber: 14, text: 'Stand therefore, having your loins girt about with truth, and having on the breastplate of righteousness;' },
          { verseNumber: 15, text: 'And your feet shod with the preparation of the gospel of peace;' },
          { verseNumber: 16, text: 'Above all, taking the shield of faith, wherewith ye shall be able to quench all the fiery darts of the wicked.' },
          { verseNumber: 17, text: 'And take the helmet of salvation, and the sword of the Spirit, which is the word of God:' },
          { verseNumber: 18, text: 'Praying always with all prayer and supplication in the Spirit, and watching thereunto with all perseverance and supplication for all saints;' }
        ]
      }
    ]
  },

  colossians: {
    id: 'colossians',
    name: 'Colossians',
    testament: 'New Testament',
    category: 'Epistles',
    chaptersCount: 4,
    summary: 'The preeminence of Christ, the fullness of God dwelling in Him, and living with academic and moral excellence.',
    keyVerse: {
      reference: 'Colossians 3:23',
      text: 'And whatsoever ye do, do it heartily, as to the Lord, and not unto men.'
    },
    chapters: [
      {
        chapterNumber: 3,
        title: 'Putting on the New Nature & Working Heartily for God',
        theme: 'Set your affection on things above; put on compassionate hearts, kindness, humility, and whatever you do, do it with excellence.',
        verses: [
          { verseNumber: 1, text: 'If ye then be risen with Christ, seek those things which are above, where Christ sitteth on the right hand of God.' },
          { verseNumber: 2, text: 'Set your affection on things above, not on things on the earth.' },
          { verseNumber: 12, text: 'Put on therefore, as the elect of God, holy and beloved, bowels of mercies, kindness, humbleness of mind, meekness, longsuffering;' },
          { verseNumber: 13, text: 'Forbearing one another, and forgiving one another, if any man have a quarrel against any: even as Christ forgave you, so also do ye.' },
          { verseNumber: 14, text: 'And above all these things put on charity, which is the bond of perfectness.' },
          { verseNumber: 17, text: 'And whatsoever ye do in word or deed, do all in the name of the Lord Jesus, giving thanks to God and the Father by him.' },
          { verseNumber: 23, text: 'And whatsoever ye do, do it heartily, as to the Lord, and not unto men;' },
          { verseNumber: 24, text: 'Knowing that of the Lord ye shall receive the reward of the inheritance: for ye serve the Lord Christ.' }
        ]
      }
    ]
  },

  galatians: {
    id: 'galatians',
    name: 'Galatians',
    testament: 'New Testament',
    category: 'Epistles',
    chaptersCount: 6,
    summary: 'Freedom in Christ, justification by faith, and walking in the Holy Spirit to produce divine fruit in our character.',
    keyVerse: {
      reference: 'Galatians 5:22-23',
      text: 'But the fruit of the Spirit is love, joy, peace, longsuffering, gentleness, goodness, faith, meekness, temperance: against such there is no law.'
    },
    chapters: [
      {
        chapterNumber: 5,
        title: 'Walking in the Spirit & The Fruit of the Spirit',
        theme: 'Standing fast in liberty; love one another; the nine manifestations of the Fruit of the Holy Spirit.',
        verses: [
          { verseNumber: 1, text: 'Stand fast therefore in the liberty wherewith Christ hath made us free, and be not entangled again with the yoke of bondage.' },
          { verseNumber: 13, text: 'For, brethren, ye have been called unto liberty; only use not liberty for an occasion to the flesh, but by love serve one another.' },
          { verseNumber: 14, text: 'For all the law is fulfilled in one word, even in this; Thou shalt love thy neighbour as thyself.' },
          { verseNumber: 22, text: 'But the fruit of the Spirit is love, joy, peace, longsuffering, gentleness, goodness, faith,' },
          { verseNumber: 23, text: 'Meekness, temperance: against such there is no law.' },
          { verseNumber: 25, text: 'If we live in the Spirit, let us also walk in the Spirit.' }
        ]
      }
    ]
  },

  james: {
    id: 'james',
    name: 'James',
    testament: 'New Testament',
    category: 'Epistles',
    chaptersCount: 5,
    summary: 'Practical Christian living, faith in action, taming the tongue, praying in faith, and enduring trials with patience.',
    keyVerse: {
      reference: 'James 1:5',
      text: 'If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given him.'
    },
    chapters: [
      {
        chapterNumber: 1,
        title: 'Asking God for Wisdom & Being Doers of the Word',
        theme: 'Count it all joy when ye fall into divers temptations; ask God for wisdom in faith without wavering; be doers of the word and not hearers only.',
        verses: [
          { verseNumber: 2, text: 'My brethren, count it all joy when ye fall into divers temptations;' },
          { verseNumber: 3, text: 'Knowing this, that the trying of your faith worketh patience.' },
          { verseNumber: 4, text: 'But let patience have her perfect work, that ye may be perfect and entire, wanting nothing.' },
          { verseNumber: 5, text: 'If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given him.' },
          { verseNumber: 6, text: 'But let him ask in faith, nothing wavering. For he that wavereth is like a wave of the sea driven with the wind and tossed.' },
          { verseNumber: 19, text: 'Wherefore, my beloved brethren, let every man be swift to hear, slow to speak, slow to wrath:' },
          { verseNumber: 22, text: 'But be ye doers of the word, and not hearers only, deceiving your own selves.' }
        ]
      }
    ]
  }
};

export const BIBLE_TOPICS: BibleTopic[] = [
  {
    id: 'diligence',
    name: 'Academic Diligence & Work',
    icon: 'auto_awesome',
    color: 'from-amber-500 to-yellow-600',
    description: 'Scriptures that inspire hard work, study discipline, concentration, and doing your best in school for God\'s glory.',
    verses: [
      {
        reference: 'Colossians 3:23',
        bookId: 'colossians',
        chapter: 3,
        text: 'And whatsoever ye do, do it heartily, as to the Lord, and not unto men.',
        lesson: 'When preparing for tests or doing homework, work with wholehearted passion as an offering to God.'
      },
      {
        reference: 'Proverbs 6:6',
        bookId: 'proverbs',
        chapter: 6,
        text: 'Go to the ant, thou sluggard; consider her ways, and be wise.',
        lesson: 'Do not wait for someone to force you to study. Plan your time like the diligent ant.'
      },
      {
        reference: 'Proverbs 22:29',
        bookId: 'proverbs',
        chapter: 22,
        text: 'Seest thou a man diligent in his business? he shall stand before kings; he shall not stand before mean men.',
        lesson: 'Consistent effort in mathematics, science, and reading will bring you before great leaders and open doors.'
      }
    ]
  },
  {
    id: 'wisdom',
    name: 'Wisdom & Knowledge',
    icon: 'menu_book',
    color: 'from-blue-500 to-indigo-600',
    description: 'Seeking God for divine understanding, clarity of mind, and sharp scholastic intellect.',
    verses: [
      {
        reference: 'James 1:5',
        bookId: 'james',
        chapter: 1,
        text: 'If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given him.',
        lesson: 'Whenever you find a subject difficult, pause and pray for God to grant you understanding.'
      },
      {
        reference: 'Proverbs 3:13-14',
        bookId: 'proverbs',
        chapter: 3,
        text: 'Happy is the man that findeth wisdom, and the man that getteth understanding. For the merchandise of it is better than the merchandise of silver.',
        lesson: 'Learning and wisdom are far more valuable than wealth. Value your education.'
      },
      {
        reference: 'Proverbs 4:7',
        bookId: 'proverbs',
        chapter: 4,
        text: 'Wisdom is the principal thing; therefore get wisdom: and with all thy getting get understanding.',
        lesson: 'Make learning and Godly insight the main goal of your youth.'
      }
    ]
  },
  {
    id: 'courage',
    name: 'Overcoming Fear & Anxiety',
    icon: 'shield',
    color: 'from-emerald-500 to-teal-600',
    description: 'Finding peace before exams, trusting God during challenges, and staying bold in faith.',
    verses: [
      {
        reference: 'Philippians 4:6-7',
        bookId: 'philippians',
        chapter: 4,
        text: 'Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God. And the peace of God shall keep your hearts.',
        lesson: 'Turn test anxiety and exam stress into prayers. God will flood your mind with calm peace.'
      },
      {
        reference: 'Philippians 4:13',
        bookId: 'philippians',
        chapter: 4,
        text: 'I can do all things through Christ which strengtheneth me.',
        lesson: 'You can master every formula, essay, and topic because Christ gives you the power.'
      },
      {
        reference: 'Psalm 91:1-2',
        bookId: 'psalms',
        chapter: 91,
        text: 'He that dwelleth in the secret place of the most High shall abide under the shadow of the Almighty. I will say of the LORD, He is my refuge.',
        lesson: 'You are safe and protected under the wings of God every single day.'
      }
    ]
  },
  {
    id: 'love',
    name: 'Kindness, Family & Honor',
    icon: 'favorite',
    color: 'from-rose-500 to-pink-600',
    description: 'Treating parents, teachers, and classmates with sincere love, patience, and honor.',
    verses: [
      {
        reference: 'Ephesians 6:1-2',
        bookId: 'ephesians',
        chapter: 6,
        text: 'Children, obey your parents in the Lord: for this is right. Honour thy father and mother; which is the first commandment with promise.',
        lesson: 'Honoring your parents brings long life, joy, and blessings into your academic journey.'
      },
      {
        reference: 'Proverbs 15:1',
        bookId: 'proverbs',
        chapter: 15,
        text: 'A soft answer turneth away wrath: but grievous words stir up anger.',
        lesson: 'Speak politely and calmly at all times, even when someone is upset.'
      },
      {
        reference: 'Galatians 5:22-23',
        bookId: 'galatians',
        chapter: 5,
        text: 'The fruit of the Spirit is love, joy, peace, longsuffering, gentleness, goodness, faith, meekness, temperance.',
        lesson: 'Let your character in the classroom shine with kindness, patience, and goodness.'
      }
    ]
  }
];

export const DAILY_DEVOTIONALS: DailyDevotional[] = [
  {
    id: 'dev-1',
    dayTitle: 'The Strength of Christ in Your Studies',
    scriptureRef: 'Philippians 4:13',
    scriptureText: 'I can do all things through Christ which strengtheneth me.',
    theme: 'Academic Confidence & Divine Strength',
    reflection: 'When you face a difficult mathematics problem, a lengthy literature passage, or a tough science exam, never tell yourself "I cannot do this." God has endowed you with a brilliant mind and His Holy Spirit to give you understanding.',
    studentApplication: 'Before starting your study session today, speak this verse aloud three times. Trust that Jesus will give you the focus to comprehend your lessons.',
    prayer: 'Heavenly Father, thank You for giving me strength through Christ. Help me understand all my school topics today and shine as a diligent scholar. In Jesus\' name, Amen.'
  },
  {
    id: 'dev-2',
    dayTitle: 'Trusting God with Your Future',
    scriptureRef: 'Proverbs 3:5-6',
    scriptureText: 'Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.',
    theme: 'Guidance and Direction',
    reflection: 'We do not know everything that tomorrow brings, but we know the God who holds tomorrow. When you give your schooling, family, and future to God, He directs your steps and removes confusion.',
    studentApplication: 'Write down one goal or challenge you have this term, and pray over it, placing it into God\'s loving hands.',
    prayer: 'Lord God Almighty, I surrender my studies, my goals, and my daily choices to You. Guide my mind and order my steps in excellence. Amen.'
  },
  {
    id: 'dev-3',
    dayTitle: 'The Diligent Ant and Your Study Habits',
    scriptureRef: 'Proverbs 6:6-8',
    scriptureText: 'Go to the ant, thou sluggard; consider her ways, and be wise: Which having no guide, overseer, or ruler, provideth her meat in the summer.',
    theme: 'Self-Discipline & Initiative',
    reflection: 'The ant does not need a teacher or parent standing over her shoulder to make her work. She prepares food ahead of time with diligence. Great scholars practice self-discipline by starting their homework without procrastination.',
    studentApplication: 'Complete your worksheets and review today\'s flashcards immediately without waiting for a reminder.',
    prayer: 'Dear Lord, help me overcome laziness and distraction. Grant me the wisdom of the ant to work diligently and manage my time well. Amen.'
  },
  {
    id: 'dev-4',
    dayTitle: 'Guarding Your Heart and Thoughts',
    scriptureRef: 'Proverbs 4:23',
    scriptureText: 'Keep thy heart with all diligence; for out of it are the issues of life.',
    theme: 'Purity of Mind and Focus',
    reflection: 'What enters your eyes and ears shapes your thoughts. When you feed your mind with God\'s Word, inspiring books, and good knowledge, your words and actions will produce wisdom and peace.',
    studentApplication: 'Choose to speak words of encouragement to someone at home or school today.',
    prayer: 'Father, cleanse my heart and fill my mind with good, lovely, and noble thoughts. Let my words bring joy to others. Amen.'
  },
  {
    id: 'dev-5',
    dayTitle: 'The Lord is Your Keeper',
    scriptureRef: 'Psalm 121:1-2',
    scriptureText: 'I will lift up mine eyes unto the hills, from whence cometh my help. My help cometh from the LORD, which made heaven and earth.',
    theme: 'Unfailing Divine Help',
    reflection: 'Whenever you feel overwhelmed or tired, remember where your real help comes from. The Creator of the mountains and oceans is your loving Father who never slumbers nor sleeps.',
    studentApplication: 'Take 2 minutes to praise God for His protection over your family and education.',
    prayer: 'Lord Jesus, You are my Keeper and my Shield. Thank You for watching over my going out and coming in. Amen.'
  }
];

export const AI_BIBLE_PROMPTS = [
  {
    category: '🎓 Academic Diligence',
    question: 'What does the Bible teach about diligence, hard work in school, and avoiding laziness?',
    icon: 'school'
  },
  {
    category: '📖 Famous Parables',
    question: 'Explain the Parable of the Good Samaritan in Luke 10 and what it means for how we treat others.',
    icon: 'auto_stories'
  },
  {
    category: '🛡️ Overcoming Fear',
    question: 'What Bible verses and stories give us courage when we feel anxious before school exams?',
    icon: 'shield'
  },
  {
    category: '👑 Young Heroes of Faith',
    question: 'How did David, Joseph, and Daniel stay faithful and brave when they were young?',
    icon: 'emoji_events'
  },
  {
    category: '🌿 Fruit of the Spirit',
    question: 'How can a student practice the Fruit of the Spirit (Galatians 5:22-23) in everyday school life?',
    icon: 'psychology'
  },
  {
    category: '👨‍👩‍👧 Family & Honor',
    question: 'Why does Ephesians 6:1-3 call honoring parents the "first commandment with a promise"?',
    icon: 'favorite'
  },
  {
    category: '💡 True Wisdom',
    question: 'What is the difference between worldly knowledge and the Godly wisdom described in Proverbs 3?',
    icon: 'lightbulb'
  },
  {
    category: '✨ Salvation & Grace',
    question: 'Explain John 3:16 and what it means to be saved by God\'s grace through faith in Jesus Christ.',
    icon: 'church'
  }
];
