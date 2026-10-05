import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Subject, ProjectSession, ProjectSubmission } from '../types';
import { cn } from '../lib/utils';

interface ProjectSessionsProps {
  user: User;
  onBack?: () => void;
  onProjectComplete?: (submission: ProjectSubmission) => void;
}

const ALL_PROJECT_SESSIONS: ProjectSession[] = [
  // ==========================================
  // SECTION 1: FOUNDATIONS & DISCOVERY (section: 1)
  // ==========================================
  // SCIENCE (Section 1)
  {
    id: 'sci-s1-g1-seed',
    title: 'Seed Germination & Plant Care Journal',
    subject: 'Science',
    section: 1,
    gradeRange: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    description: 'Observe bean seeds sprout inside a damp cotton pouch. Track root and leaf development daily with parent guidance.',
    duration: '20 mins / day',
    difficulty: 'Beginner',
    requiresSupervision: true,
    materials: ['2 Bean seeds', 'Clear plastic cup or ziplock bag', 'Cotton wool or paper towels', 'Water', 'Ruler'],
    steps: [
      'Moisten cotton wool with water (ask parent to check moisture level).',
      'Place 2 bean seeds gently inside the cotton wool in a clear container.',
      'Place container near a sunny window with parent help.',
      'Measure growth in centimeters every morning and record notes with AI Tutor Miss Kelechi.',
      'Draw the first green shoot in your project journal.'
    ],
    aiPrompt: 'Explain how sunlight and water help bean seeds germinate. Keep instructions ultra-simple and encouraging for a Grade 1 scholar working with a parent.',
    learningObjectives: ['Understand plant life cycles', 'Practice daily scientific observation', 'Learn plant care responsibility']
  },
  {
    id: 'sci-s1-g1-density',
    title: 'Household Density & Floating Science Lab',
    subject: 'Science',
    section: 1,
    gradeRange: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    description: 'Test which safe household objects sink or float in water, and discover why heavier liquids sink to the bottom!',
    duration: '30 mins',
    difficulty: 'Beginner',
    requiresSupervision: true,
    materials: ['Large bowl of water', 'Safe items (plastic toy, coin, leaf, wooden spoon, cork)', 'Honey or vegetable oil', 'Paper & pencil'],
    steps: [
      'Fill a broad plastic bowl with clean room-temperature water with parent supervision.',
      'Predict which items will float and which will sink.',
      'Gently drop items one by one into the bowl and record the result.',
      'Ask parent to help pour 2 spoonfuls of vegetable oil or honey to observe liquid density layers.',
      'Discuss findings with AI Tutor Miss Kelechi and write down your summary.'
    ],
    aiPrompt: 'Explain buoyancy and density to a Grade 1 student. Use simple analogies like how heavy stones sink while light wooden sticks float.',
    learningObjectives: ['Master sink vs float concepts', 'Make scientific predictions', 'Observe fluid density']
  },
  {
    id: 'sci-s1-g4-solar',
    title: 'Planetary Orbit & Solar System Model',
    subject: 'Science',
    section: 1,
    gradeRange: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    description: 'Construct a scaled model of the 8 solar system planets and calculate orbital distances from the Sun.',
    duration: '45 mins',
    difficulty: 'Intermediate',
    requiresSupervision: false,
    materials: ['Cardboard or poster board', 'Coloured markers / paints', 'String', 'Ruler', 'Scissors'],
    steps: [
      'Draw the Sun at the center of your cardboard poster.',
      'Scale distance ratios for Mercury through Neptune.',
      'Color-code gas giants (Jupiter, Saturn) vs terrestrial planets (Earth, Mars).',
      'Label planetary rotational speeds and satellite moons.'
    ],
    aiPrompt: 'Provide fun astronomical facts about the scale of Jupiter and Saturn relative to Earth.',
    learningObjectives: ['Understand planetary scale', 'Master astronomical distances', 'Practice diagramming']
  },

  // SOCIAL STUDIES (Section 1)
  {
    id: 'soc-s1-g1-community',
    title: 'My Neighborhood Map & Community Helpers',
    subject: 'Social Studies',
    section: 1,
    gradeRange: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    description: 'Map out your local community including hospitals, schools, police posts, and worship centers with parent assistance.',
    duration: '30 mins',
    difficulty: 'Beginner',
    requiresSupervision: true,
    materials: ['Drawing paper', 'Crayons / Coloured pencils', 'Ruler', 'Community photos or drawings'],
    steps: [
      'Sit with your parent or guardian and list 4 important places in your town or city.',
      'Draw your home in the center of the paper.',
      'Add roads, street signs, and local landmarks (clinic, school, church/mosque, market).',
      'Draw community heroes (doctors, police officers, teachers, firefighters) next to their stations.',
      'Present your map to your parent and explain how each helper keeps citizens safe.'
    ],
    aiPrompt: 'Explain the crucial roles of community helpers to a Grade 1 student with warmth, respect, and civic duty.',
    learningObjectives: ['Recognize community helpers', 'Understand basic map reading', 'Appreciate civic safety']
  },
  {
    id: 'soc-s1-g1-family',
    title: 'Family Tree & Cultural Heritage Poster',
    subject: 'Social Studies',
    section: 1,
    gradeRange: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    description: 'Gather family history, honor your elders, and create a family tree poster highlighting your cultural roots.',
    duration: '40 mins',
    difficulty: 'Beginner',
    requiresSupervision: true,
    materials: ['Poster sheet', 'Family names / photos', 'Glue stick', 'Markers'],
    steps: [
      'Interview your parent or grandparent about your family history and state of origin.',
      'Draw a strong trunk representing your family foundation.',
      'Add branches for grandparents, parents, aunts, uncles, and leaves for children.',
      'Write 1 important moral value or biblical principle taught by your parents on the tree root.',
      'Share your completed poster with your family.'
    ],
    aiPrompt: 'Guide a young scholar on honoring parents and elders (Exodus 20:12) while building a family tree.',
    learningObjectives: ['Honor family heritage', 'Practice interview skills', 'Connect values to ancestry']
  },
  {
    id: 'soc-s1-g6-trade',
    title: 'West African Trade Routes & Economic Systems',
    subject: 'Social Studies',
    section: 1,
    gradeRange: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    description: 'Analyze historic trans-Saharan trade networks and modern economic exports across West Africa.',
    duration: '50 mins',
    difficulty: 'Advanced',
    requiresSupervision: false,
    materials: ['Notebook', 'Reference maps', 'Pencil'],
    steps: [
      'Trace key historic trade routes connecting Kano, Timbuktu, and coastal ports.',
      'Analyze commodity exchanges (gold, salt, textiles, agricultural produce).',
      'Compare historic bartering to modern Naira (₦) central currency exchange.',
      'Write a 3-paragraph executive summary on regional economic cooperation.'
    ],
    aiPrompt: 'Summarize the economic significance of trans-Saharan trade using clear structured historical analysis.',
    learningObjectives: ['Analyze regional economics', 'Trace historical trade geography', 'Understand currency evolution']
  },

  // MATH (Section 1)
  {
    id: 'mat-s1-g1-shape',
    title: 'Living Room Geometry & Shape Hunt',
    subject: 'Math',
    section: 1,
    gradeRange: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    description: 'Find 2D and 3D shapes inside your home with parent supervision! Count sides, corners, and flat faces.',
    duration: '25 mins',
    difficulty: 'Beginner',
    requiresSupervision: true,
    materials: ['Notebook', 'Pencil', 'Household items (boxes, balls, cans, clocks)'],
    steps: [
      'Walk through your living room safely alongside your parent.',
      'Find 3 circular objects (e.g. wall clock, plate), 3 rectangular objects (e.g. door, book), and 2 cylindrical objects (e.g. food can).',
      'Count the sides and corners of each 2D shape with parent verification.',
      'Record your shape inventory in your math notebook.',
      'Ask AI Tutor Miss Kelechi to check your shape definitions!'
    ],
    aiPrompt: 'Explain difference between 2D flat shapes and 3D solid objects to a Grade 1 scholar in a fun way.',
    learningObjectives: ['Identify 2D & 3D geometric shapes', 'Count vertices and edges', 'Apply math to real life']
  },
  {
    id: 'mat-s1-g2-market',
    title: 'Household Market Day & Naira (₦) Budgeting',
    subject: 'Math',
    section: 1,
    gradeRange: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    description: 'Set up a mini family market, price items in Naira (₦), and calculate total costs and change given!',
    duration: '35 mins',
    difficulty: 'Intermediate',
    requiresSupervision: true,
    materials: ['Pencil', 'Paper receipts', 'Play money or drawn Naira notes (₦50, ₦100, ₦200, ₦500)', 'Household groceries'],
    steps: [
      'Select 5 grocery items (e.g. bread, milk, apples, pencils) and assign price tags in Naira (e.g. ₦200, ₦150).',
      'Invite parent or sibling to be the shopper.',
      'Calculate total bill for 3 items bought.',
      'Calculate change due when paid with a ₦1,000 note.',
      'Record the transaction ledger accurately.'
    ],
    aiPrompt: 'Create a fun Naira (₦) practice problem for calculating total cost and change given for a primary school student.',
    learningObjectives: ['Master Naira (₦) addition & subtraction', 'Understand financial budgeting', 'Practice real transactions']
  },

  // ENGLISH & LITERATURE (Section 1)
  {
    id: 'eng-s1-g1-puppet',
    title: 'Illustrated Fable & Paper Puppet Theatre',
    subject: 'English',
    section: 1,
    gradeRange: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    description: 'Craft paper puppets for a classic moral fable (e.g. The Boy Who Cried Wolf) and perform a dramatic retelling for parents!',
    duration: '35 mins',
    difficulty: 'Beginner',
    requiresSupervision: true,
    materials: ['Paper bags or popsicle sticks', 'Drawings of characters', 'Glue / Tape', 'Markers'],
    steps: [
      'Select a moral fable with parent help.',
      'Draw the main characters on paper and cut them out with parent assistance.',
      'Attach characters to popsicle sticks or paper bags to make puppets.',
      'Practice expressive vocal reading with clear pronunciation.',
      'Perform your 3-minute puppet show for your parent or guardian!'
    ],
    aiPrompt: 'Summarize the moral lesson of honesty in a child-friendly fable format for a Grade 1 puppet show.',
    learningObjectives: ['Develop public speaking confidence', 'Identify story morals', 'Practice expressive reading']
  },
  {
    id: 'lit-s1-g5-character',
    title: 'Literary Character Analysis & Thesis Log',
    subject: 'Literature',
    section: 1,
    gradeRange: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    description: 'Analyze protagonist motivations, moral dilemmas, and thematic arcs in your current literature text.',
    duration: '45 mins',
    difficulty: 'Intermediate',
    requiresSupervision: false,
    materials: ['Literature book', 'Notebook', 'Pen'],
    steps: [
      'Select the main protagonist from your prescribed literature textbook.',
      'Identify 3 key character traits supported by direct textual quotes.',
      'Examine the major moral conflict faced by the character.',
      'Write a structured 4-paragraph character thesis essay.'
    ],
    aiPrompt: 'Explain how to write a compelling thesis statement for a middle school literary character study.',
    learningObjectives: ['Cite textual evidence', 'Analyze character development', 'Write structured essays']
  },

  // BIBLE STUDY (Section 1)
  {
    id: 'bib-s1-g1-kindness',
    title: 'Fruit of the Spirit Family Kindness Tree',
    subject: 'Bible Study',
    section: 1,
    gradeRange: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    description: 'Construct a paper Kindness Tree focusing on Galatians 5:22 (Love, Joy, Peace, Patience, Kindness, Goodness, Faithfulness, Gentleness, Self-control).',
    duration: '30 mins',
    difficulty: 'Beginner',
    requiresSupervision: true,
    materials: ['Green & brown construction paper', 'Scissors (parent guided)', 'Markers', 'Tape'],
    steps: [
      'Draw a large tree trunk on cardboard or wall paper with parent.',
      'Cut out 9 green paper leaves with parent guidance.',
      'Write 1 Fruit of the Spirit on each leaf (e.g. Kindness, Diligence, Respect for Elders).',
      'Whenever you perform an act of kindness at home today, tape a leaf to the tree!',
      'Recite Galatians 5:22 together with your parent and AI Tutor Miss Kelechi.'
    ],
    aiPrompt: 'Provide 3 simple examples of showing kindness and respect at home suitable for a Grade 1 scholar.',
    learningObjectives: ['Memorize Galatians 5:22-23', 'Practice active Christian virtues', 'Reflect on godly character']
  },

  // BIOLOGY & ETYMOLOGY (Section 1)
  {
    id: 'bio-s1-g8-cell',
    title: 'Plant vs Animal Cell 3D Structural Diagram',
    subject: 'Biology',
    section: 1,
    gradeRange: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    description: 'Construct a comparative 3D diagram highlighting chloroplasts, cell walls, vacuoles, and organelle functions.',
    duration: '45 mins',
    difficulty: 'Advanced',
    requiresSupervision: false,
    materials: ['Drawing board or clay model', 'Colored pens', 'Ruler'],
    steps: [
      'Diagram the rectangular cell wall structure of plant cells alongside spherical animal cell membranes.',
      'Detail organelle structures: Mitochondria, Golgi Bodies, Endoplasmic Reticulum, Nucleus.',
      'Annotate photosynthesis vs cellular respiration pathways.',
      'Self-test organelle functions with AI Tutor Miss Kelechi.'
    ],
    aiPrompt: 'Explain key differences between plant and animal cell organelles clearly and concisely.',
    learningObjectives: ['Master organelle anatomy', 'Compare plant vs animal cellular biology', 'Diagram cell structures']
  },
  {
    id: 'ety-s1-g1-roots',
    title: 'Etymology Root Word Treasure Hunt',
    subject: 'Etymology',
    section: 1,
    gradeRange: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    description: 'Discover how ancient Greek & Latin roots (Bio, Chron, Aqua, Graph, Tele) build everyday English words!',
    duration: '30 mins',
    difficulty: 'Intermediate',
    requiresSupervision: true,
    materials: ['Root flashcards', 'Notebook', 'Pencil'],
    steps: [
      'Select 3 core roots: "Bio" (Life), "Graph" (Write), "Tele" (Far off).',
      'Brainstorm 3 English words containing each root (e.g. Autobiography, Telephone, Telegraph).',
      'Define each word by combining the meaning of its roots.',
      'Create a Root Tree diagram showcasing root families.'
    ],
    aiPrompt: 'Break down the word "Autobiography" into its 3 Greek root origins (Auto + Bio + Graph).',
    learningObjectives: ['Understand root word origins', 'Expand vocabulary systematically', 'Deconstruct word meanings']
  },

  // ==========================================
  // SECTION 2: EXPLORATION & APPLIED DISCOVERY (section: 2)
  // ==========================================
  // SCIENCE (Section 2)
  {
    id: 'sci-s2-g1-solar-oven',
    title: 'DIY Solar Thermal Oven & Heat Reflection Lab',
    subject: 'Science',
    section: 2,
    gradeRange: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    description: 'Build a safe solar reflector oven using a cardboard box, tin foil, and clear plastic wrap to warm a snack using clean solar thermal energy!',
    duration: '35 mins',
    difficulty: 'Beginner',
    requiresSupervision: true,
    materials: ['Cardboard pizza box', 'Aluminum foil', 'Clear plastic wrap', 'Black paper', 'Tape', 'A slice of bread or chocolate'],
    steps: [
      'Line the inside of a cardboard flap with reflective aluminum foil with parent help.',
      'Cover the opening with clear plastic wrap to create a heat-trapping greenhouse layer.',
      'Place a piece of black paper inside the bottom to absorb heat rays.',
      'Position the solar oven outside under direct sunlight with parent supervision.',
      'Observe temperature warmth and discuss solar radiation with AI Tutor Miss Kelechi!'
    ],
    aiPrompt: 'Explain how solar reflectors trap heat rays like a mini greenhouse to a Grade 1 scholar and parent.',
    learningObjectives: ['Understand solar heat transfer', 'Learn greenhouse radiation principles', 'Practice thermal measurement']
  },
  {
    id: 'sci-s2-g1-weather',
    title: 'Jar Water Barometer & Air Pressure Log',
    subject: 'Science',
    section: 2,
    gradeRange: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    description: 'Construct a real water barometer using a glass jar, balloon membrane, and straw to track daily atmospheric weather pressure!',
    duration: '30 mins',
    difficulty: 'Intermediate',
    requiresSupervision: true,
    materials: ['Glass jar or tin can', 'Rubber balloon', 'Rubber band', 'Drinking straw', 'Paper index card & pen'],
    steps: [
      'Stretch a cut balloon tightly over the open top of the glass jar with parent help and secure with a rubber band.',
      'Tape one end of a drinking straw across the center of the balloon membrane to act as a pointer needle.',
      'Place a taped index card behind the straw pointer on a level shelf.',
      'Mark the straw pointer height morning and evening for 3 days.',
      'Observe how high pressure pushes the balloon down and tilts the straw needle up!'
    ],
    aiPrompt: 'Explain atmospheric pressure and how barometers predict sunny vs rainy weather to a primary school student.',
    learningObjectives: ['Understand atmospheric pressure', 'Predict weather patterns', 'Build meteorological tools']
  },

  // SOCIAL STUDIES (Section 2)
  {
    id: 'soc-s2-g1-flag',
    title: 'Nigerian State Symbols & Heritage Exhibit',
    subject: 'Social Studies',
    section: 2,
    gradeRange: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    description: 'Research and illustrate state emblems, traditional attire, and major agricultural crops from your home state or region!',
    duration: '35 mins',
    difficulty: 'Beginner',
    requiresSupervision: true,
    materials: ['Drawing paper', 'Coloured pencils / Crayons', 'State facts sheet', 'Glitter / Fabric scraps'],
    steps: [
      'Discuss your family state of origin or home city with your parent.',
      'Draw the state motto, coat of arms, or agricultural pride symbol (e.g. Cocoa, Groundnut pyramids, Palm produce).',
      'Draw traditional attire worn in your cultural heritage.',
      'Write 3 key geographical features (rivers, hills, capital city) on your exhibit poster.',
      'Present your state heritage exhibit to your parent or guardian!'
    ],
    aiPrompt: 'Share inspiring historical facts about Nigerian state heritage and unity in diversity for a young scholar.',
    learningObjectives: ['Appreciate state cultural symbols', 'Identify regional resources', 'Express civic pride']
  },
  {
    id: 'soc-s2-g1-election',
    title: 'Family Civic Democracy & Election Ballot Station',
    subject: 'Social Studies',
    section: 2,
    gradeRange: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    description: 'Set up a democratic election station at home to vote for a family weekend activity with voter cards, ballots, and secret voting booth!',
    duration: '40 mins',
    difficulty: 'Beginner',
    requiresSupervision: true,
    materials: ['Shoebox (ballot box)', 'Paper slips (ballots)', 'Voter card badges', 'Pen / Marker'],
    steps: [
      'Nominate 2 friendly options for family weekend activity (e.g. Picnic vs Board Game Night).',
      'Create voter ID cards for each participating family member with parent assistance.',
      'Design a private cardboard voting screen and sealed shoebox ballot box.',
      'Cast secret votes one by one and have parent verify ballot box integrity.',
      'Tally votes transparently and declare the winning democratic result!'
    ],
    aiPrompt: 'Explain democratic voting, civic fairness, and respecting election outcomes to a Grade 1 scholar.',
    learningObjectives: ['Understand democratic processes', 'Practice civic participation', 'Learn vote tallying & fairness']
  },

  // MATH (Section 2)
  {
    id: 'mat-s2-g1-baking',
    title: 'Kitchen Fraction Baking & Scale Ratio Lab',
    subject: 'Math',
    section: 2,
    gradeRange: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    description: 'Practice fraction doubling and unit measurement conversions (teaspoons, cups, grams) while making family snacks with parent guidance!',
    duration: '40 mins',
    difficulty: 'Intermediate',
    requiresSupervision: true,
    materials: ['Measuring cups & spoons', 'Flour, sugar, water', 'Bowl', 'Recipe card'],
    steps: [
      'Read a simple recipe with parent guidance (e.g. 1/2 cup flour, 1/4 cup sugar, 1/3 cup water).',
      'Double the recipe mathematically on paper (e.g. 1/2 + 1/2 = 1 cup).',
      'Measure ingredients precisely using measuring spoons and cups.',
      'Observe liquid vs dry volume measurements.',
      'Record your fraction conversions in your math project journal!'
    ],
    aiPrompt: 'Explain how fractions like 1/2, 1/4, and 1/3 work in real baking to a Grade 1 student.',
    learningObjectives: ['Master fraction doubling & addition', 'Apply liquid & dry volume units', 'Practice kitchen math']
  },
  {
    id: 'mat-s2-g1-survey',
    title: 'Family Data Survey & Lego Bar Chart Architect',
    subject: 'Math',
    section: 2,
    gradeRange: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    description: 'Conduct a real survey among family members or friends, record tally marks, and build a 3D physical bar graph using building blocks or paper strips!',
    duration: '30 mins',
    difficulty: 'Beginner',
    requiresSupervision: true,
    materials: ['Grid paper', 'Building bricks / Lego or paper strips', 'Markers', 'Ruler'],
    steps: [
      'Choose a survey question (e.g. "What is your favorite fruit/color?").',
      'Interview 5 family members or friends and mark survey tally lines (I, II, III, IIII, HTH).',
      'Count total tallies for each category with parent verification.',
      'Build a 3D bar graph using colored building blocks corresponding to tally counts.',
      'Label X-axis (categories) and Y-axis (number of votes) on grid paper.'
    ],
    aiPrompt: 'Explain tally marks and bar graphs to a primary school scholar in an engaging, visual way.',
    learningObjectives: ['Collect data with tally marks', 'Construct physical & drawn bar charts', 'Analyze survey results']
  },

  // ENGLISH & LITERATURE (Section 2)
  {
    id: 'eng-s2-g1-rhyme',
    title: 'Nature & Diligence Rhyming Poetry Anthology',
    subject: 'English',
    section: 2,
    gradeRange: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    description: 'Compose 3 original rhyming poems celebrating creation, family, and diligence, and illustrate a decorative poetry booklet!',
    duration: '35 mins',
    difficulty: 'Beginner',
    requiresSupervision: true,
    materials: ['Paper booklet', 'Coloured pens', 'Dictionary / Rhyming guide'],
    steps: [
      'Brainstorm rhyming word pairs with parent help (e.g. Sun/Fun, Light/Bright, Tree/Free).',
      'Write a 4-line stanza on Nature (e.g. "The golden sun shines so bright / Filling our happy home with light").',
      'Write a 4-line stanza on Diligence and honoring elders.',
      'Decorate the margins with colorful borders and illustrations.',
      'Recite your poem aloud with clear rhythm and expression for your parent!'
    ],
    aiPrompt: 'Provide fun AABB rhyming scheme examples for a primary school student writing a poem about nature.',
    learningObjectives: ['Identify rhyming patterns & phonics', 'Develop creative expression', 'Practice oral recitation']
  },

  // BIBLE STUDY (Section 2)
  {
    id: 'bib-s2-g1-talents',
    title: 'Parable of the Talents Stewardship Ledger',
    subject: 'Bible Study',
    section: 2,
    gradeRange: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    description: 'Reflect on Matthew 25:14-30 and create a personal Stewardship Chart mapping God-given skills (drawing, math, kindness) to active daily service!',
    duration: '30 mins',
    difficulty: 'Beginner',
    requiresSupervision: true,
    materials: ['Notebook', 'Colored markers', 'Bible (Matthew 25)'],
    steps: [
      'Read the Parable of the Talents with your parent or guardian.',
      'List 3 talents or gifts God has blessed you with (e.g. Singing, Problem Solving, Kindness).',
      'Draw 3 gold coins representing your talents.',
      'Write 1 specific action plan for how you will use each talent to help others at school or home this week.',
      'Pray a prayer of thanksgiving with your parent for God-given gifts.'
    ],
    aiPrompt: 'Explain stewardship and multiplying God-given talents (Matthew 25) to a Grade 1 scholar with warmth.',
    learningObjectives: ['Understand biblical stewardship', 'Recognize personal God-given strengths', 'Plan active service']
  },

  // BIOLOGY & ETYMOLOGY (Section 2)
  {
    id: 'bio-s2-g1-leaf',
    title: 'Leaf Pigment Chromatography Science Lab',
    subject: 'Biology',
    section: 2,
    gradeRange: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    description: 'Extract green chlorophyll from fresh spinach or garden leaves using coffee filter paper strips to reveal hidden yellow and orange plant pigments!',
    duration: '35 mins',
    difficulty: 'Intermediate',
    requiresSupervision: true,
    materials: ['Fresh green leaves', 'Clear glass cup', 'Rubbing alcohol / Warm water (parent handle)', 'Coffee filter strip', 'Coin'],
    steps: [
      'Press a fresh green leaf firmly onto a coffee filter strip using the edge of a coin to leave a thick green line with parent help.',
      'Dip the bottom tip of the filter paper into a glass containing warm water/rubbing alcohol (handled safely by parent).',
      'Watch liquid climb up the filter paper by capillary action.',
      'Observe green chlorophyll separate into bands of green (chlorophyll-a), yellow (xanthophyll), and orange (carotene).',
      'Discuss photosynthesis and leaf pigments with AI Tutor Miss Kelechi!'
    ],
    aiPrompt: 'Explain leaf chromatography and plant pigments simply to a Grade 1 student and parent.',
    learningObjectives: ['Understand chlorophyll & photosynthesis', 'Observe capillary action separation', 'Analyze plant pigments']
  },
  {
    id: 'ety-s2-g1-wheel',
    title: 'Latin & Greek Prefix/Suffix Word Generator Wheel',
    subject: 'Etymology',
    section: 2,
    gradeRange: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    description: 'Construct a 2-tier cardboard rotating word wheel combining Latin prefixes (Un-, Re-, Pre-, Sub-) with root verbs to build 20 new vocabulary words!',
    duration: '35 mins',
    difficulty: 'Intermediate',
    requiresSupervision: true,
    materials: ['2 Paper plates or cardstock circles', 'Brass paper fastener or pin (parent guided)', 'Markers'],
    steps: [
      'Cut a smaller paper circle and place it over a larger paper circle.',
      'Pin the center together with parent help so the top wheel spins freely.',
      'Write prefixes (Pre-, Re-, Un-, Dis-, Sub-) on the outer wheel.',
      'Write root words (View, Build, Do, Like, Marine) on the inner wheel.',
      'Spin the wheel to form new words (e.g. Preview, Rebuild, Submarine) and define each word in your journal!'
    ],
    aiPrompt: 'Explain how prefixes change root word meanings (e.g. "Re-" means again, "Un-" means not) for a primary scholar.',
    learningObjectives: ['Master prefix and suffix mechanics', 'Construct new English vocabulary', 'Build interactive etymology tools']
  },

  // ==========================================
  // SECTION 3: INNOVATION, SYNTHESIS & MASTERY (section: 3)
  // ==========================================
  // SCIENCE (Section 3)
  {
    id: 'sci-s3-g1-crane',
    title: 'Hydraulic Water Pressure Crane Mechanism',
    subject: 'Science',
    section: 3,
    gradeRange: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    description: 'Connect two water-filled plastic syringes with clear tubing to build a hydraulic lifting crane mechanism using fluid pressure!',
    duration: '40 mins',
    difficulty: 'Intermediate',
    requiresSupervision: true,
    materials: ['2 Plastic syringes (no needle)', 'Flexible plastic tubing', 'Water with food dye', 'Cardboard crane arm', 'Tape'],
    steps: [
      'Fill one syringe with colored water with parent supervision and connect clear plastic tubing tightly.',
      'Push fluid through tubing into the second syringe, ensuring no air bubbles remain.',
      'Attach the second syringe piston to a hinged cardboard crane lever.',
      'Press the master syringe plunger to watch water pressure lift the crane arm up and down!',
      'Discuss hydraulic force and fluid mechanics with AI Tutor Miss Kelechi.'
    ],
    aiPrompt: 'Explain Pascal’s law and hydraulic water pressure to a primary school student in an exciting way.',
    learningObjectives: ['Understand hydraulic fluid pressure', 'Build simple mechanical levers', 'Apply physics to engineering']
  },
  {
    id: 'sci-s3-g1-volcano',
    title: 'Eco-Volcano & Acid-Base Reaction Eruption',
    subject: 'Science',
    section: 3,
    gradeRange: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    description: 'Sculpt a clay or cardboard mountain crater and trigger a harmless chemical foam eruption using baking soda, red food color, and vinegar!',
    duration: '35 mins',
    difficulty: 'Beginner',
    requiresSupervision: true,
    materials: ['Plastic cup / Small bottle', 'Clay or playdough', 'Baking soda (2 tbsp)', 'Vinegar (1/2 cup)', 'Red food coloring', 'Dish soap'],
    steps: [
      'Build a clay or playdough mountain around a small central plastic cup with parent help.',
      'Place 2 tablespoons of baking soda, a drop of dish soap, and red food dye inside the cup crater.',
      'Place volcano on a tray or outdoors for easy cleanup with parent.',
      'Slowly pour 1/2 cup of vinegar into the crater and watch carbon dioxide gas foam erupt!',
      'Record observations in your science journal.'
    ],
    aiPrompt: 'Explain the chemical reaction between vinegar (acid) and baking soda (base) that produces CO2 gas bubbles for a Grade 1 scholar.',
    learningObjectives: ['Observe acid-base chemical reactions', 'Understand carbon dioxide gas creation', 'Model geological landforms']
  },

  // SOCIAL STUDIES (Section 3)
  {
    id: 'soc-s3-g1-kingdoms',
    title: 'Ancient Kingdoms Scroll & Bronze Sculpture Exhibit',
    subject: 'Social Studies',
    section: 3,
    gradeRange: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    description: 'Illustrate a 1-meter historical paper scroll depicting Nok terracotta art, Benin Kingdom bronzes, and the ancient Oyo Empire!',
    duration: '40 mins',
    difficulty: 'Beginner',
    requiresSupervision: true,
    materials: ['Long paper strip or connected sheets', 'Brown / Gold crayons', 'Historical reference drawings'],
    steps: [
      'Tape 3 sheets of paper end-to-end to form a long historical scroll with parent help.',
      'Draw Nok terracotta heads and early iron smelting artifacts on the first section.',
      'Draw famous Benin brass sculptures and royal court crowns on the second section.',
      'Draw trade caravans and cavalry of the Oyo Empire on the third section.',
      'Present your scroll timeline to your parent and explain the rich heritage of African craftsmanship!'
    ],
    aiPrompt: 'Narrate the artistic brilliance and historical legacy of ancient African kingdoms for a primary student.',
    learningObjectives: ['Discover ancient African history', 'Recognize historic craftsmanship', 'Construct timeline scrolls']
  },

  // MATH (Section 3)
  {
    id: 'mat-s3-g1-architect',
    title: 'Living Room Floor Plan Blueprint & Perimeter Architect',
    subject: 'Math',
    section: 3,
    gradeRange: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    description: 'Measure your room perimeter using footsteps or a tape measure alongside a parent, draw a scaled architectural blueprint, and calculate total floor area!',
    duration: '35 mins',
    difficulty: 'Intermediate',
    requiresSupervision: true,
    materials: ['Measuring tape or ruler', 'Grid paper', 'Pencil', 'Coloured markers'],
    steps: [
      'Walk along the 4 edges of your room with parent guidance and count footsteps or meters.',
      'Draw the room outline on grid paper where 1 grid square = 1 foot/meter.',
      'Calculate total perimeter by adding all 4 side lengths (P = Length + Length + Width + Width).',
      'Calculate floor area by multiplying Length x Width (Area = L x W).',
      'Draw furniture pieces in their exact grid positions!'
    ],
    aiPrompt: 'Explain perimeter (distance around) vs area (surface inside) to a Grade 1 student with clear room floor examples.',
    learningObjectives: ['Calculate perimeter & area formulas', 'Create scale drawings', 'Apply math to spatial architecture']
  },

  // ENGLISH & LITERATURE (Section 3)
  {
    id: 'eng-s3-g1-newspaper',
    title: 'Family & School Gazette Front-Page Reporter',
    subject: 'English',
    section: 3,
    gradeRange: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    description: 'Conduct an interview with a parent, teacher, or elder, write a catchy newspaper headline story, and publish a family newspaper edition!',
    duration: '40 mins',
    difficulty: 'Beginner',
    requiresSupervision: true,
    materials: ['Large paper sheet', 'Pen', 'Photos or drawings', 'Ruler'],
    steps: [
      'Prepare 3 interview questions with parent help (e.g. "What was your favorite subject in school?", "What is an important life lesson?").',
      'Interview your parent or guardian and write down their key answers.',
      'Write a bold front-page headline (e.g. "PARENTS SHARE INSPIRING LIFE LESSONS!").',
      'Layout the newspaper columns with headline, story text, and an illustrated photo caption.',
      'Read your newspaper article aloud to your family!'
    ],
    aiPrompt: 'Guide a young student on writing headline news and asking great interview questions.',
    learningObjectives: ['Practice journalism & interview skills', 'Format multi-column newspaper layouts', 'Develop expressive writing']
  },

  // BIBLE STUDY (Section 3)
  {
    id: 'bib-s3-g1-armor',
    title: 'Armor of God Shield Craft & Spiritual Diligence',
    subject: 'Bible Study',
    section: 3,
    gradeRange: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    description: 'Design a strong cardboard Armor of God shield based on Ephesians 6:10-18, labeling Belt of Truth, Breastplate of Righteousness, Shield of Faith, and Sword of the Spirit!',
    duration: '35 mins',
    difficulty: 'Beginner',
    requiresSupervision: true,
    materials: ['Cardboard sheet', 'Aluminum foil / Gold paper', 'Markers', 'Scissors (parent guided)', 'Ribbon/Tape handle'],
    steps: [
      'Cut a shield shape from sturdy cardboard with parent supervision.',
      'Wrap edges with foil or gold paper to represent polished armor.',
      'Write the 6 pieces of armor on your shield (Truth, Righteousness, Gospel of Peace, Faith, Salvation, Word of God).',
      'Attach a tape handle on the back to hold your shield.',
      'Recite Ephesians 6:10 together with your parent and AI Tutor Miss Kelechi!'
    ],
    aiPrompt: 'Explain each piece of the Armor of God (Ephesians 6) to a primary school scholar in an empowering, godly way.',
    learningObjectives: ['Memorize Ephesians 6:10-18', 'Understand spiritual diligence', 'Connect faith principles to daily life']
  },

  // BIOLOGY & ETYMOLOGY (Section 3)
  {
    id: 'bio-s3-g1-digestion',
    title: 'Human Digestive System Model & Nutrient Journey',
    subject: 'Biology',
    section: 3,
    gradeRange: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    description: 'Map out the human digestive system from mouth to stomach and intestines using colorful paper tubes, showing how food nourishes the body!',
    duration: '35 mins',
    difficulty: 'Intermediate',
    requiresSupervision: true,
    materials: ['Paper towel tubes', 'Yarn', 'Cardboard poster', 'Markers'],
    steps: [
      'Draw the outline of the human torso on a poster with parent help.',
      'Attach a paper tube representing the esophagus leading down to a drawn stomach pouch.',
      'Coil pink yarn to represent the small intestine and grey yarn for the large intestine.',
      'Trace the journey of a bite of apple as teeth chew it, stomach acids dissolve it, and intestines absorb nutrients.',
      'Explain healthy eating and digestive wellness to your parent!'
    ],
    aiPrompt: 'Explain how the digestive system breaks down food into energy for a primary school student.',
    learningObjectives: ['Identify organs of digestion', 'Trace nutrient absorption pathways', 'Understand body health']
  },
  {
    id: 'ety-s3-g1-medical',
    title: 'Medical & Science Greek Root Decoder Map',
    subject: 'Etymology',
    section: 3,
    gradeRange: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    description: 'Decode 10 complex medical and biological terms (e.g. Cardiology, Dermatology, Photosynthesis, Microscopic) by unlocking their ancient Greek roots!',
    duration: '35 mins',
    difficulty: 'Advanced',
    requiresSupervision: true,
    materials: ['Etymology decoder sheet', 'Notebook', 'Pen'],
    steps: [
      'List 5 Greek medical roots: "Cardio" (Heart), "Derma" (Skin), "Micro" (Small), "Scope" (Look), "Logy" (Study of).',
      'Combine roots to decode terms: Cardiology = Study of the Heart, Microscopic = Looking at small things.',
      'Draw mini diagrams representing each medical field.',
      'Test your parent with a fun root word quiz!'
    ],
    aiPrompt: 'Provide fun medical root word examples like Derm- and Cardio- for a young scholar.',
    learningObjectives: ['Decode scientific & medical vocabulary', 'Master classical Greek etymology', 'Build advanced literacy']
  }
];

export default function ProjectSessions({ user, onBack, onProjectComplete }: ProjectSessionsProps) {
  const [selectedSection, setSelectedSection] = useState<number>(user.section || 1);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('All');
  const [activeProject, setActiveProject] = useState<ProjectSession | null>(null);
  const [sectionNotification, setSectionNotification] = useState<string | null>(null);

  const handleSectionChange = (sectionNum: number) => {
    setSelectedSection(sectionNum);
    setSectionNotification(`Moved to Section ${sectionNum}! All project session missions updated to Section ${sectionNum} curriculum.`);
    setTimeout(() => {
      setSectionNotification(null);
    }, 4500);
  };

  // Active Project Execution State
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [projectReflection, setProjectReflection] = useState('');
  const [parentVerified, setParentVerified] = useState(false);
  const [parentName, setParentName] = useState('');
  const [aiAssistantQuery, setAiAssistantQuery] = useState('');
  const [aiAssistantResponse, setAiAssistantResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [submissions, setSubmissions] = useState<ProjectSubmission[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Load existing project submissions from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`asc_project_submissions_${user.id}`);
      if (saved) {
        setSubmissions(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Error loading project submissions:', err);
    }
  }, [user.id]);

  // Available subject filters
  const subjectsList = ['All', 'Science', 'Social Studies', 'Math', 'English', 'Literature', 'Bible Study', 'Biology', 'Etymology'];

  const filteredProjects = ALL_PROJECT_SESSIONS.filter(p => {
    const matchesSection = p.section === selectedSection;
    const matchesSubject = selectedSubjectFilter === 'All' || p.subject === selectedSubjectFilter;
    const matchesGrade = p.gradeRange.includes(user.grade || 1);
    return matchesSection && matchesSubject && matchesGrade;
  });

  const handleStartProject = (project: ProjectSession) => {
    setActiveProject(project);
    setCompletedSteps({});
    setProjectReflection('');
    setParentVerified(false);
    setParentName('');
    setAiAssistantQuery('');
    setAiAssistantResponse('');
  };

  const toggleStep = (index: number) => {
    setCompletedSteps(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleAskAiTutor = async () => {
    if (!aiAssistantQuery.trim() || !activeProject) return;
    setIsAiLoading(true);
    setAiAssistantResponse('');

    try {
      const res = await fetch('/api/ai/solve-homework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: `Project Question: ${aiAssistantQuery}\nContext: ${activeProject.title} (${activeProject.subject}). ${activeProject.aiPrompt}`,
          subject: activeProject.subject,
          grade: user.grade || 1,
          studentName: user.name
        })
      });
      const data = await res.json();
      setAiAssistantResponse(data.answer || 'Great inquiry! Keep following your project checklist.');
    } catch (err) {
      console.error(err);
      setAiAssistantResponse(`Miss Kelechi AI Tutor: Keep up the excellent work! Review your project steps with your parent or guardian.`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmitProject = () => {
    if (!activeProject) return;

    // Check Grade 1 parent verification requirement
    if (user.grade === 1 && !parentVerified) {
      alert("Grade 1 Project Sessions require Parent/Guardian verification check-off before submission!");
      return;
    }

    const newSubmission: ProjectSubmission = {
      projectId: activeProject.id,
      projectTitle: activeProject.title,
      subject: activeProject.subject,
      grade: user.grade || 1,
      completedAt: Date.now(),
      reflection: projectReflection || 'Completed hands-on project session successfully!',
      parentVerified: user.grade === 1 ? parentVerified : true,
      parentName: parentName || (user.grade === 1 ? 'Parent / Guardian' : undefined),
      score: 100
    };

    const updated = [newSubmission, ...submissions.filter(s => s.projectId !== activeProject.id)];
    setSubmissions(updated);
    try {
      localStorage.setItem(`asc_project_submissions_${user.id}`, JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }

    if (onProjectComplete) {
      onProjectComplete(newSubmission);
    }

    setShowSuccessModal(true);
  };

  const isGrade1 = (user.grade || 1) === 1;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 pb-28">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/20 border border-primary/30 rounded-full text-primary text-xs font-black uppercase tracking-widest mb-2">
            <span className="material-symbols-outlined text-sm">rocket_launch</span>
            Experiential Learning Hub
          </div>
          <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tight">
            Interactive Project Sessions
          </h1>
          <p className="text-white/70 font-medium text-base mt-1 max-w-2xl">
            Hands-on, creative project challenges across Science, Social Studies, Math, English, Literature, Bible Study, Biology & Etymology.
          </p>
        </div>

        {onBack && (
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold text-sm transition-all"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Dashboard
          </button>
        )}
      </div>

      {/* Academic Section Switcher Control */}
      <div className="max-w-7xl mx-auto mb-10 bg-slate-900/90 border-2 border-primary/40 p-6 md:p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/20 text-primary-light border border-primary/30 rounded-full text-xs font-black uppercase tracking-widest mb-2">
              <span className="material-symbols-outlined text-sm">view_module</span>
              Academic Curriculum Section Selector
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white font-headline">
              Section Projects Hub
            </h2>
            <p className="text-white/70 text-sm md:text-base font-medium mt-1 max-w-2xl">
              Moving to a new section changes all project sessions to a <strong>brand-new set of projects</strong> for that section!
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-2xl border border-white/10 self-stretch lg:self-auto justify-stretch">
            {[
              { id: 1, name: 'Section 1', label: 'Foundations', icon: 'looks_one' },
              { id: 2, name: 'Section 2', label: 'Exploration', icon: 'looks_two' },
              { id: 3, name: 'Section 3', label: 'Innovation', icon: 'looks_3' }
            ].map((sec) => (
              <button
                key={sec.id}
                onClick={() => handleSectionChange(sec.id)}
                className={cn(
                  "flex-1 lg:flex-none px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2.5",
                  selectedSection === sec.id
                    ? "bg-primary text-white shadow-xl scale-105 ring-2 ring-primary/50"
                    : "bg-transparent text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                <span className="material-symbols-outlined text-lg">{sec.icon}</span>
                <div className="text-left">
                  <div className="font-black leading-tight">{sec.name}</div>
                  <div className="text-[9px] font-bold opacity-80 normal-case hidden sm:block">{sec.label}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Section Notification Toast */}
        <AnimatePresence mode="wait">
          {sectionNotification ? (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-4 bg-emerald-500/20 border-2 border-emerald-400/40 rounded-2xl flex items-center justify-between gap-4 text-xs font-bold text-emerald-200"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-xl text-emerald-400 animate-bounce">rocket_launch</span>
                <span>{sectionNotification}</span>
              </div>
              <span className="px-3 py-1 bg-emerald-500 text-slate-950 rounded-lg text-[10px] font-black uppercase tracking-wider shrink-0">
                New Projects Loaded!
              </span>
            </motion.div>
          ) : (
            <motion.div
              key={selectedSection}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-primary/10 border border-primary/30 rounded-2xl flex items-center justify-between gap-4 text-xs font-bold text-primary-light"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-lg text-primary">published_with_changes</span>
                <span>
                  Currently viewing <strong>Section {selectedSection} Projects</strong> ({filteredProjects.length} missions loaded). Moving to Section 1, 2, or 3 changes all projects!
                </span>
              </div>
              <span className="px-3 py-1 bg-primary text-white rounded-lg text-[10px] font-black uppercase tracking-wider shrink-0">
                Section {selectedSection} Active
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Grade 1 AI & Parent Supervision Banner */}
      {isGrade1 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto mb-10 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 p-6 md:p-8 rounded-[2.5rem] shadow-2xl border-2 border-amber-400/40 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -z-0" />
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-widest rounded-full">
                <span className="material-symbols-outlined text-sm">family_restroom</span>
                Grade 1 Standard • AI & Parent Supervision Mandatory
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white font-headline">
                Grade 1 Project Session Guardrails
              </h2>
              <p className="text-amber-100 text-sm md:text-base leading-relaxed font-medium">
                Grade 1 scholars require active <strong>AI Assistant guidance</strong> and an adult <strong>parent/guardian co-pilot</strong> to assemble materials, ensure safety during experiments, and verify completed work!
              </p>
            </div>

            <div className="bg-slate-950/40 backdrop-blur-md p-5 rounded-2xl border border-white/20 flex items-center gap-4 min-w-[280px]">
              <div className="w-12 h-12 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                <span className="material-symbols-outlined text-2xl">verified_user</span>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-amber-200">Parent Co-Pilot Active</p>
                <p className="text-sm font-bold text-white mt-0.5">Verification Required</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Subject Filter Tabs */}
      <div className="max-w-7xl mx-auto mb-8 flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none">
        {subjectsList.map(s => (
          <button
            key={s}
            onClick={() => setSelectedSubjectFilter(s)}
            className={cn(
              "px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider whitespace-nowrap transition-all shadow-sm flex items-center gap-2",
              selectedSubjectFilter === s
                ? "bg-primary text-white scale-105 shadow-lg ring-4 ring-primary/30"
                : "bg-slate-900 text-white/70 hover:bg-slate-800 hover:text-white border border-white/10"
            )}
          >
            {s === 'All' && <span className="material-symbols-outlined text-sm">grid_view</span>}
            {s === 'Science' && <span className="material-symbols-outlined text-sm text-emerald-400">biotech</span>}
            {s === 'Social Studies' && <span className="material-symbols-outlined text-sm text-amber-400">public</span>}
            {s === 'Math' && <span className="material-symbols-outlined text-sm text-blue-400">calculate</span>}
            {s === 'English' && <span className="material-symbols-outlined text-sm text-purple-400">menu_book</span>}
            {s === 'Bible Study' && <span className="material-symbols-outlined text-sm text-amber-300">auto_stories</span>}
            {s}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => {
          const isSubmitted = submissions.some(sub => sub.projectId === project.id);
          return (
            <motion.div
              key={project.id}
              whileHover={{ y: -4 }}
              className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-7 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-primary/50 transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                    project.subject === 'Science' ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" :
                    project.subject === 'Social Studies' ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" :
                    project.subject === 'Math' ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" :
                    "bg-primary/20 text-primary-light border border-primary/30"
                  )}>
                    {project.subject}
                  </span>

                  {project.requiresSupervision && (
                    <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">shield</span>
                      Parent Required
                    </span>
                  )}
                </div>

                <h3 className="text-2xl font-black text-white font-headline mb-2 group-hover:text-primary transition-colors">
                  {project.title}
                </h3>
                <p className="text-white/70 text-xs font-medium leading-relaxed mb-6">
                  {project.description}
                </p>

                <div className="space-y-2 mb-6 bg-slate-950/60 p-4 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-wider text-white/50 mb-1">Required Materials:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.materials.slice(0, 3).map((mat, i) => (
                      <span key={i} className="text-[11px] font-bold bg-white/5 px-2.5 py-1 rounded-lg text-white/80 border border-white/10">
                        {mat}
                      </span>
                    ))}
                    {project.materials.length > 3 && (
                      <span className="text-[11px] font-bold text-primary self-center">
                        +{project.materials.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs font-bold text-white/60">
                  <span className="material-symbols-outlined text-base">schedule</span>
                  {project.duration}
                </div>

                <button
                  onClick={() => handleStartProject(project)}
                  className={cn(
                    "px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all active:scale-95",
                    isSubmitted 
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white" 
                      : "bg-primary hover:bg-primary-dim text-white"
                  )}
                >
                  {isSubmitted ? (
                    <>
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      Revisit Session
                    </>
                  ) : (
                    <>
                      Start Project
                      <span className="material-symbols-outlined text-sm">rocket_launch</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ACTIVE PROJECT SESSION MODAL */}
      <AnimatePresence>
        {activeProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-950/80 backdrop-blur-xl overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-white/20 rounded-[3rem] max-w-4xl w-full p-6 md:p-10 shadow-2xl text-white relative my-8"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-4 mb-6 pb-6 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-xs font-black uppercase tracking-widest">
                      {activeProject.subject} Session
                    </span>
                    {activeProject.requiresSupervision && (
                      <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">family_restroom</span>
                        Parent & AI Supervision
                      </span>
                    )}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black font-headline text-white">
                    {activeProject.title}
                  </h2>
                </div>

                <button
                  onClick={() => setActiveProject(null)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Grade 1 Parent Co-Pilot Guardrail Card */}
              {isGrade1 && (
                <div className="mb-8 p-6 bg-gradient-to-r from-amber-500/20 via-amber-600/20 to-amber-700/20 rounded-3xl border border-amber-500/40 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-amber-300 font-black text-xs uppercase tracking-widest">
                      <span className="material-symbols-outlined text-base">shield_person</span>
                      Grade 1 Safety Rule
                    </div>
                    <p className="text-sm text-white font-medium">
                      An adult parent or supervisor must be present throughout this project to guide materials handling and verify completed steps.
                    </p>
                  </div>
                  <div className="bg-amber-500 text-slate-950 font-black px-4 py-2 rounded-xl text-xs uppercase tracking-wider shrink-0 shadow-md">
                    Co-Pilot Required
                  </div>
                </div>
              )}

              {/* Two Column Layout: Left = Steps & Materials, Right = AI Tutor & Verification */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Left Column: Checklist & Materials */}
                <div className="space-y-6">
                  {/* Materials Box */}
                  <div className="bg-slate-950 p-6 rounded-3xl border border-white/10">
                    <h3 className="text-sm font-black uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">inventory_2</span>
                      Materials Needed
                    </h3>
                    <ul className="space-y-2">
                      {activeProject.materials.map((mat, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm text-white/90 font-medium">
                          <span className="w-2 h-2 rounded-full bg-primary" />
                          {mat}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Step-by-Step Interactive Checklist */}
                  <div className="bg-slate-950 p-6 rounded-3xl border border-white/10">
                    <h3 className="text-sm font-black uppercase tracking-wider text-emerald-400 mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">fact_check</span>
                      Interactive Step-by-Step Guide
                    </h3>
                    <div className="space-y-3">
                      {activeProject.steps.map((step, idx) => {
                        const isChecked = !!completedSteps[idx];
                        return (
                          <div 
                            key={idx}
                            onClick={() => toggleStep(idx)}
                            className={cn(
                              "p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-4",
                              isChecked 
                                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-200" 
                                : "bg-white/5 border-white/10 hover:border-white/30 text-white"
                            )}
                          >
                            <div className={cn(
                              "w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-all",
                              isChecked ? "bg-emerald-500 border-emerald-400 text-slate-950" : "border-white/40"
                            )}>
                              {isChecked && <span className="material-symbols-outlined text-sm font-black">check</span>}
                            </div>
                            <p className="text-xs md:text-sm font-medium leading-relaxed">
                              <span className="font-bold mr-1">Step {idx + 1}:</span>
                              {step}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Column: AI Tutor Assistance & Parent Verification */}
                <div className="space-y-6">
                  {/* AI Tutor Assistant Widget */}
                  <div className="bg-gradient-to-b from-primary/20 to-slate-950 p-6 rounded-3xl border border-primary/30">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-black">
                        <span className="material-symbols-outlined text-xl">smart_toy</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-white">
                          AI Tutor Miss Kelechi Co-Pilot
                        </h3>
                        <p className="text-[11px] text-white/70 font-medium">Ask for guidance, explanations, or project tips!</p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={aiAssistantQuery}
                          onChange={(e) => setAiAssistantQuery(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAskAiTutor()}
                          placeholder={isGrade1 ? "Ask Miss Kelechi a question with your parent..." : "Ask Miss Kelechi about this project..."}
                          className="flex-1 bg-slate-900 border border-white/20 rounded-xl px-4 py-3 text-xs text-white placeholder-white/40 focus:outline-none focus:border-primary"
                        />
                        <button
                          onClick={handleAskAiTutor}
                          disabled={isAiLoading || !aiAssistantQuery.trim()}
                          className="px-4 py-3 bg-primary hover:bg-primary-dim disabled:opacity-50 text-white font-black text-xs rounded-xl uppercase tracking-wider transition-all shrink-0"
                        >
                          {isAiLoading ? 'Asking...' : 'Ask AI'}
                        </button>
                      </div>

                      {aiAssistantResponse && (
                        <div className="p-4 bg-slate-900/90 rounded-2xl border border-primary/40 text-xs text-primary-light leading-relaxed">
                          <p className="font-bold mb-1 text-white flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm text-primary">auto_awesome</span>
                            Miss Kelechi:
                          </p>
                          {aiAssistantResponse}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Grade 1 Parent Verification Box */}
                  {isGrade1 && (
                    <div className="p-6 bg-amber-500/10 rounded-3xl border-2 border-amber-500/40 space-y-4">
                      <div className="flex items-center gap-2 text-amber-300 font-black text-xs uppercase tracking-widest">
                        <span className="material-symbols-outlined text-lg">verified</span>
                        Parent / Guardian Verification
                      </div>

                      <p className="text-xs text-amber-100 font-medium leading-relaxed">
                        To submit this Grade 1 Project Session, the parent/guardian must sign off below confirming supervision:
                      </p>

                      <label className="flex items-center gap-3 p-3 bg-slate-900/80 rounded-xl border border-amber-500/30 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={parentVerified}
                          onChange={(e) => setParentVerified(e.target.checked)}
                          className="w-5 h-5 accent-amber-500 rounded"
                        />
                        <span className="text-xs font-bold text-white">
                          I confirm my Grade 1 scholar performed this project under my active supervision.
                        </span>
                      </label>

                      <input
                        type="text"
                        value={parentName}
                        onChange={(e) => setParentName(e.target.value)}
                        placeholder="Parent / Guardian Name (e.g. Mr. & Mrs. Okonkwo)"
                        className="w-full bg-slate-900 border border-white/20 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  )}

                  {/* Project Reflections Summary */}
                  <div className="bg-slate-950 p-6 rounded-3xl border border-white/10 space-y-3">
                    <label className="block text-xs font-black uppercase tracking-wider text-white/80">
                      Project Notes & Scholar Summary:
                    </label>
                    <textarea
                      value={projectReflection}
                      onChange={(e) => setProjectReflection(e.target.value)}
                      placeholder="Write what you observed during this project session..."
                      rows={3}
                      className="w-full bg-slate-900 border border-white/20 rounded-xl p-3 text-xs text-white placeholder-white/40 focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer / Submit */}
              <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  onClick={() => setActiveProject(null)}
                  className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSubmitProject}
                  className="w-full sm:w-auto px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  Complete & Submit Project Session
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SUCCESS CELEBRATION MODAL */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border-2 border-emerald-500/50 rounded-[3rem] p-10 max-w-lg w-full text-center space-y-6 shadow-2xl text-white"
            >
              <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-4xl">
                <span className="material-symbols-outlined text-5xl animate-bounce">military_tech</span>
              </div>

              <div className="space-y-2">
                <span className="px-4 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-black uppercase tracking-widest">
                  Project Verified
                </span>
                <h2 className="text-3xl font-black font-headline text-white">
                  Project Session Completed!
                </h2>
                <p className="text-sm text-white/70 font-medium">
                  Awesome job! Your project log has been submitted and permanently saved to your academic record.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-white/10 text-left space-y-1 text-xs">
                <p className="text-white/50 uppercase font-black tracking-wider text-[10px]">Submitted Session:</p>
                <p className="font-bold text-emerald-300 text-sm">{activeProject?.title}</p>
                {isGrade1 && (
                  <p className="text-amber-300 font-bold text-[11px] flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-xs">verified</span>
                    Parent Supervision Verified
                  </p>
                )}
              </div>

              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setActiveProject(null);
                }}
                className="w-full py-4 bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:bg-emerald-400 transition-all"
              >
                Return to Project Sessions Hub
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
