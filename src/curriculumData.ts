import { Subject, Curriculum, Term, Topic } from './types';
import { getLessonsCountForGrade } from './constants';

const getTermLessonOffset = (totalLessons: number, term: number): number => {
  const baseCount = Math.floor(totalLessons / 4);
  const remainder = totalLessons % 4;
  
  let offset = 0;
  for (let t = 1; t < term; t++) {
    let countInT = baseCount;
    if (t === 2 && remainder >= 1) countInT += 1;
    if (t === 3 && remainder >= 2) countInT += 1;
    if (t === 4 && remainder === 3) countInT += 1;
    offset += countInT;
  }
  return offset;
};

const generateMockTopics = (subject: Subject, grade: number, term: number): Topic[] => {
  const totalLessons = getLessonsCountForGrade(grade);
  
  // Distribute lessons across 4 terms
  const baseCount = Math.floor(totalLessons / 4);
  const remainder = totalLessons % 4;
  
  let topicsInThisTerm = baseCount;
  if (term === 2 && remainder >= 1) topicsInThisTerm += 1;
  if (term === 3 && remainder >= 2) topicsInThisTerm += 1;
  if (term === 4 && remainder === 3) topicsInThisTerm += 1;

  if (topicsInThisTerm < 1) {
    topicsInThisTerm = 1;
  }

  const termOffset = getTermLessonOffset(totalLessons, term);

  const sampleTopics: Record<Subject, string[]> = {
    'Alphabet': ['The Letter A', 'The Letter B', 'The Letter C', 'The Letter D', 'Vowels', 'Consonants', 'Short Sounds', 'Long Sounds', 'Blending Sounds', 'Reading Simple Words'],
    'Math': ['Numbers', 'Addition', 'Subtraction', 'Shapes', 'Multiplication', 'Division', 'Fractions', 'Measurement', 'Time', 'Data'],
    'English': ['Phonics', 'Spelling', 'Sentences', 'Reading', 'Punctuation', 'Writing', 'Poetry', 'Grammar', 'Comprehension', 'Speaking'],
    'Science': ['God\'s Creation', 'The Human Body', 'Wonders of Nature', 'Animals & Habitats', 'Plants & Growth', 'Space & Stars', 'Electricity & Energy', 'Technology & Innovation', 'Earth\'s Resources', 'Scientific Discovery'],
    'Social Studies': ['Ancient African Empires', 'Nigerian Independence', 'African Heroes', 'Culture of Nigeria', 'Pre-colonial Africa', 'Nigerian Geography', 'African Traditions', 'Modern Nigeria', 'Great African Leaders', 'Nigerian Landmarks'],
    'Literature': ['Godly Short Stories', 'Spiritual Essays', 'Biblical Narratives', 'Moral Fables', 'Christian Poetry', 'Wisdom Literature', 'Faith-based Drama', 'Biographies of Saints', 'Parables & Allegories', 'Hymns and Literature'],
    'Bible Study': ['Creation', 'Noah', 'Commandments', 'Jesus', 'Parables', 'Apostles', 'Spirit', 'Heroes', 'Letters', 'Prophets'],
    'Spelling': ['Common Nouns', 'Verbs', 'Adjectives', 'Homophones', 'Compound Words', 'Prefixes', 'Suffixes', 'Greek Roots', 'Latin Roots', 'Technical terms'],
    'Biology': [
      'Cellular Ultrastructure & Biochemistry',
      'Molecular Genetics & DNA Replication',
      'Advanced Human Physiological Systems',
      'Plant Metabolic Pathways & Photosynthesis',
      'Ecosystem Dynamics & Bio-geochemical Cycles',
      'Evolutionary Mechanisms & Population Genetics',
      'Pathogenic Microbiology & Immunology',
      'Biodiversity Preservation & Conservation Genetics',
      'Phylogenetic Classification & Taxonomy',
      'Recombinant DNA Technology & Bioinformatics'
    ],
    'Etymology': [
      'Proto-Indo-European Roots & Sound Laws',
      'Classical Greek Morphemes in Modern Science',
      'Latin Affixes & Morphological Derivations',
      'Historical Linguistics & Semantic Shifts',
      'Cognates, Doublets, & Romance Loanwords',
      'Eponyms, Toponyms, & Etymological Oddities',
      'Neologisms & Technological Word Formation',
      'Comparative Philology & Etymological Methodology',
      'Idiomatic Origins & Phraseological Etymology',
      'Sanskrit and Semitic Influences on European Lexicon'
    ]
  };

  const baseList = sampleTopics[subject];
  
  return Array.from({ length: topicsInThisTerm }).map((_, i) => {
    const globalLessonNumber = termOffset + i + 1;
    const baseTitle = baseList[i % baseList.length];
    const title = `${baseTitle} - Part ${Math.floor(i / baseList.length) + 1}`;
    
    return {
      id: `${subject}-${grade}-${term}-${i}`,
      title: (subject === 'Biology' || subject === 'Etymology') ? `${title} (Highly Advanced)` : (grade >= 5 ? `${title} (Advanced)` : title),
      description: `Explore the fascinating world of ${title} in Grade ${grade}.`,
      interactions: [],
      interactionCount: 0,
      completed: false,
      lessonNumber: globalLessonNumber
    };
  });
};

export const getCurriculum = (grade: number, subject: Subject): Curriculum => {
  const terms: Term[] = [1, 2, 3, 4].map(termNum => ({
    id: termNum,
    name: `Term ${termNum}`,
    topics: generateMockTopics(subject, grade, termNum)
  }));

  return { grade, subject, terms };
};

export const getAllTopicsForGrade = (grade: number, subject: Subject): Topic[] => {
  const curriculum = getCurriculum(grade, subject);
  return curriculum.terms.flatMap(t => t.topics);
};
