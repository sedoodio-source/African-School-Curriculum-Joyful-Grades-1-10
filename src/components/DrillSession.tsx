/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Subject, User } from '../types';
import { cn } from '../lib/utils';
import { isSubjectDrillAvailable, getSubjectDrillScheduleText } from '../utils/drillSchedule';

interface DrillQuestion {
  subject: Subject;
  question: string;
  options: string[];
  correct: string;
}

const DRILL_QUESTIONS: DrillQuestion[] = [
  // Math
  { subject: 'Math', question: 'What is 15 + 27?', options: ['32', '42', '52', '44'], correct: '42' },
  { subject: 'Math', question: 'What is 12 x 8?', options: ['86', '96', '76', '106'], correct: '96' },
  { subject: 'Math', question: 'Square root of 144?', options: ['10', '11', '12', '14'], correct: '12' },
  { subject: 'Math', question: 'What is 100 divided by 4?', options: ['20', '25', '30', '40'], correct: '25' },
  { subject: 'Math', question: 'What is 7 x 9?', options: ['56', '63', '72', '49'], correct: '63' },
  { subject: 'Math', question: 'What is 144 / 12?', options: ['10', '12', '14', '16'], correct: '12' },
  { subject: 'Math', question: 'What is 25 x 4?', options: ['75', '100', '125', '150'], correct: '100' },
  { subject: 'Math', question: 'What is 200 - 85?', options: ['115', '125', '105', '95'], correct: '115' },
  { subject: 'Math', question: 'What is 9 squared?', options: ['18', '72', '81', '90'], correct: '81' },
  { subject: 'Math', question: 'What is 50% of 80?', options: ['20', '30', '40', '50'], correct: '40' },
  { subject: 'Math', question: 'What is the value of Pi (to 2 decimal places)?', options: ['3.12', '3.14', '3.16', '3.18'], correct: '3.14' },
  { subject: 'Math', question: 'How many sides does a hexagon have?', options: ['5', '6', '7', '8'], correct: '6' },
  { subject: 'Math', question: 'What is 13 + 19?', options: ['31', '32', '33', '34'], correct: '32' },
  { subject: 'Math', question: 'What is 150 / 3?', options: ['40', '50', '60', '70'], correct: '50' },
  { subject: 'Math', question: 'What is 11 x 11?', options: ['111', '121', '131', '141'], correct: '121' },
  { subject: 'Math', question: 'What is 5 cubed (5^3)?', options: ['25', '75', '125', '150'], correct: '125' },
  { subject: 'Math', question: 'What is the sum of angles in a triangle?', options: ['90°', '180°', '270°', '360°'], correct: '180°' },
  { subject: 'Math', question: 'What is 8 x 7?', options: ['54', '56', '58', '60'], correct: '56' },
  { subject: 'Math', question: 'What is 45 + 55?', options: ['90', '100', '110', '120'], correct: '100' },
  { subject: 'Math', question: 'What is 1/4 of 100?', options: ['20', '25', '30', '40'], correct: '25' },
  { subject: 'Math', question: 'What is 30% of 150?', options: ['35', '45', '55', '65'], correct: '45' },
  { subject: 'Math', question: 'How many vertices does a cube have?', options: ['6', '8', '10', '12'], correct: '8' },
  { subject: 'Math', question: 'What is 14 x 5?', options: ['60', '70', '80', '90'], correct: '70' },
  { subject: 'Math', question: 'What is 180 divided by 6?', options: ['20', '30', '40', '50'], correct: '30' },
  { subject: 'Math', question: 'What is 15 squared (15^2)?', options: ['125', '225', '325', '425'], correct: '225' },
  { subject: 'Math', question: 'What is 99 + 101?', options: ['190', '199', '200', '210'], correct: '200' },
  { subject: 'Math', question: 'How many degrees are in a right angle?', options: ['45°', '90°', '180°', '360°'], correct: '90°' },
  { subject: 'Math', question: 'What is 1000 - 350?', options: ['550', '650', '750', '850'], correct: '650' },
  { subject: 'Math', question: 'What is 13 x 4?', options: ['42', '48', '52', '56'], correct: '52' },
  { subject: 'Math', question: 'What is the next prime number after 11?', options: ['12', '13', '15', '17'], correct: '13' },
  { subject: 'Math', question: 'What is 3/5 written as a percentage?', options: ['30%', '50%', '60%', '80%'], correct: '60%' },
  { subject: 'Math', question: 'What is 7 cubed (7^3)?', options: ['49', '243', '343', '443'], correct: '343' },
  { subject: 'Math', question: 'How many seconds are in 5 minutes?', options: ['120', '240', '300', '360'], correct: '300' },
  { subject: 'Math', question: 'What is 1.5 x 6?', options: ['8', '9', '10', '12'], correct: '9' },
  { subject: 'Math', question: 'What is 250 + 750?', options: ['800', '900', '1000', '1100'], correct: '1000' },

  // English
  { subject: 'English', question: 'Which word is a verb?', options: ['Apple', 'Run', 'Happy', 'Blue'], correct: 'Run' },
  { subject: 'English', question: 'What is the plural of "Child"?', options: ['Childs', 'Children', 'Childrens', 'Childes'], correct: 'Children' },
  { subject: 'English', question: 'Antonym of "Beautiful"?', options: ['Pretty', 'Lovely', 'Ugly', 'Bright'], correct: 'Ugly' },
  { subject: 'English', question: 'Which is a noun?', options: ['Swim', 'Elephant', 'Quickly', 'Eat'], correct: 'Elephant' },
  { subject: 'English', question: 'Identify the adjective:', options: ['Softly', 'Green', 'Run', 'Desk'], correct: 'Green' },
  { subject: 'English', question: 'What is the past tense of "Go"?', options: ['Gone', 'Went', 'Goed', 'Going'], correct: 'Went' },
  { subject: 'English', question: 'Which word is a pronoun?', options: ['House', 'He', 'Building', 'Slow'], correct: 'He' },
  { subject: 'English', question: 'Synonym of "Large"?', options: ['Small', 'Tiny', 'Huge', 'Narrow'], correct: 'Huge' },
  { subject: 'English', question: 'Identify the conjunction:', options: ['And', 'Tall', 'Jump', 'Under'], correct: 'And' },
  { subject: 'English', question: 'What is a person, place, or thing called?', options: ['Verb', 'Adjective', 'Noun', 'Adverb'], correct: 'Noun' },
  { subject: 'English', question: 'Which is a preposition?', options: ['Above', 'Fast', 'Shout', 'Bird'], correct: 'Above' },
  { subject: 'English', question: 'What is the opposite of "Hot"?', options: ['Warm', 'Cool', 'Cold', 'Spicy'], correct: 'Cold' },
  { subject: 'English', question: 'Identify the proper noun:', options: ['City', 'London', 'Street', 'Park'], correct: 'London' },
  { subject: 'English', question: 'Which word is an adverb?', options: ['Quickly', 'Quick', 'Quicker', 'Quicken'], correct: 'Quickly' },
  { subject: 'English', question: 'Plural of "Mouse"?', options: ['Mouses', 'Mice', 'Mices', 'Meese'], correct: 'Mice' },
  { subject: 'English', question: 'Which is a silent letter in "Knife"?', options: ['K', 'N', 'I', 'F'], correct: 'K' },
  { subject: 'English', question: 'Identify the article:', options: ['The', 'They', 'This', 'That'], correct: 'The' },
  { subject: 'English', question: 'Synonym of "Happy"?', options: ['Sad', 'Angry', 'Joyful', 'Sleepy'], correct: 'Joyful' },
  { subject: 'English', question: 'Past tense of "Run"?', options: ['Runned', 'Ran', 'Running', 'Runs'], correct: 'Ran' },
  { subject: 'English', question: 'What do you call a word that rhymes with "Ball"?', options: ['Bell', 'Fall', 'Bill', 'Bull'], correct: 'Fall' },
  { subject: 'English', question: 'What is the superlative form of "good"?', options: ['Gooder', 'Better', 'Best', 'Goodest'], correct: 'Best' },
  { subject: 'English', question: 'Choose the correct pronoun: "Jane and ___ went to the market."', options: ['I', 'me', 'myself', 'mine'], correct: 'I' },
  { subject: 'English', question: 'What is the plural of "ox"?', options: ['oxes', 'oxen', 'oxs', 'oxens'], correct: 'oxen' },
  { subject: 'English', question: 'What is a synonym of "loyal"?', options: ['Dishonest', 'Faithful', 'Hostile', 'Careless'], correct: 'Faithful' },
  { subject: 'English', question: 'What is the antonym of "generous"?', options: ['Kind', 'Stingy', 'Friendly', 'Polite'], correct: 'Stingy' },
  { subject: 'English', question: 'Which of these is a preposition of time?', options: ['At', 'During', 'Under', 'Behind'], correct: 'During' },
  { subject: 'English', question: 'Identify the compound word:', options: ['Beautiful', 'Quickly', 'Sunflower', 'Running'], correct: 'Sunflower' },
  { subject: 'English', question: 'What prefix means "again"?', options: ['Pre-', 'Un-', 'Re-', 'Dis-'], correct: 'Re-' },
  { subject: 'English', question: 'Identify the silent letter in "doubt":', options: ['d', 'o', 'u', 'b'], correct: 'b' },
  { subject: 'English', question: 'What is the antonym of "gigantic"?', options: ['Huge', 'Large', 'Tiny', 'Enormous'], correct: 'Tiny' },
  { subject: 'English', question: 'What is the main idea of a paragraph called?', options: ['Topic sentence', 'Supporting detail', 'Conclusion', 'Introduction'], correct: 'Topic sentence' },
  { subject: 'English', question: 'Which of the following words is a conjunction?', options: ['Fast', 'But', 'Under', 'He'], correct: 'But' },
  { subject: 'English', question: 'What is the past participle of "write"?', options: ['Wrote', 'Written', 'Writing', 'Writes'], correct: 'Written' },
  { subject: 'English', question: 'Which word is a synonym of "courageous"?', options: ['Fearful', 'Brave', 'Quiet', 'Smart'], correct: 'Brave' },
  { subject: 'English', question: 'What does the suffix "-less" mean in the word "hopeless"?', options: ['Full of', 'Again', 'Without', 'More'], correct: 'Without' },

  // Science
  { subject: 'Science', question: 'Which planet is known as the Red Planet?', options: ['Venus', 'Jupiter', 'Mars', 'Saturn'], correct: 'Mars' },
  { subject: 'Science', question: 'What do plants need for photosynthesis?', options: ['Salt', 'Gravity', 'Sunlight', 'Moonlight'], correct: 'Sunlight' },
  { subject: 'Science', question: 'Chemical symbol for Water?', options: ['O2', 'H2O', 'CO2', 'NaCl'], correct: 'H2O' },
  { subject: 'Science', question: 'Which gas do humans breathe out?', options: ['Oxygen', 'Hydrogen', 'Carbon Dioxide', 'Nitrogen'], correct: 'Carbon Dioxide' },
  { subject: 'Science', question: 'What is the center of an atom called?', options: ['Electron', 'Proton', 'Nucleus', 'Neutron'], correct: 'Nucleus' },
  { subject: 'Science', question: 'Which is the largest planet in our solar system?', options: ['Earth', 'Jupiter', 'Saturn', 'Neptune'], correct: 'Jupiter' },
  { subject: 'Science', question: 'What is the closest star to Earth?', options: ['Sirius', 'Proxima Centauri', 'The Sun', 'Polaris'], correct: 'The Sun' },
  { subject: 'Science', question: 'Boiling point of water in Celsius?', options: ['50°C', '90°C', '100°C', '120°C'], correct: '100°C' },
  { subject: 'Science', question: 'What force keeps us on the ground?', options: ['Magnetism', 'Friction', 'Gravity', 'Tension'], correct: 'Gravity' },
  { subject: 'Science', question: 'Which organ pumps blood?', options: ['Lungs', 'Stomach', 'Heart', 'Brain'], correct: 'Heart' },
  { subject: 'Science', question: 'What is the hardest natural substance?', options: ['Gold', 'Iron', 'Diamond', 'Silver'], correct: 'Diamond' },
  { subject: 'Science', question: 'Process by which caterpillars become butterflies?', options: ['Digestion', 'Metamorphosis', 'Evaporation', 'Respiration'], correct: 'Metamorphosis' },
  { subject: 'Science', question: 'Which planet has rings around it?', options: ['Mars', 'Saturn', 'Venus', 'Mercury'], correct: 'Saturn' },
  { subject: 'Science', question: 'What part of the plant absorbs water?', options: ['Leaf', 'Stem', 'Flower', 'Root'], correct: 'Root' },
  { subject: 'Science', question: 'How many planets are in our solar system?', options: ['7', '8', '9', '10'], correct: '8' },
  { subject: 'Science', question: 'Which tool measures temperature?', options: ['Barometer', 'Thermometer', 'Scale', 'Ruler'], correct: 'Thermometer' },
  { subject: 'Science', question: 'What state of matter is steam?', options: ['Solid', 'Liquid', 'Gas', 'Plasma'], correct: 'Gas' },
  { subject: 'Science', question: 'What do bees collect from flowers?', options: ['Nectar', 'Water', 'Leaves', 'Sticks'], correct: 'Nectar' },
  { subject: 'Science', question: 'Which animal is a mammal?', options: ['Shark', 'Whale', 'Snake', 'Frog'], correct: 'Whale' },
  { subject: 'Science', question: 'What is the main source of energy for Earth?', options: ['The Moon', 'The Sun', 'Wind', 'Electricity'], correct: 'The Sun' },
  { subject: 'Science', question: 'Which gas is most abundant in Earth\'s atmosphere?', options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Argon'], correct: 'Nitrogen' },
  { subject: 'Science', question: 'What is the process of liquid water changing into water vapor?', options: ['Condensation', 'Evaporation', 'Freezing', 'Melting'], correct: 'Evaporation' },
  { subject: 'Science', question: 'What is the approximate speed of light?', options: ['3,000 km/s', '30,000 km/s', '300,000 km/s', '3,000,000 km/s'], correct: '300,000 km/s' },
  { subject: 'Science', question: 'Which planet is closest to the Sun?', options: ['Mercury', 'Venus', 'Earth', 'Mars'], correct: 'Mercury' },
  { subject: 'Science', question: 'What is the chemical symbol for Helium?', options: ['H', 'He', 'Li', 'Be'], correct: 'He' },
  { subject: 'Science', question: 'How long does it take for the Earth to complete one orbit around the Sun?', options: ['24 hours', '30 days', '365 days', '10 years'], correct: '365 days' },
  { subject: 'Science', question: 'What part of the cell is known as the powerhouse?', options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Cytoplasm'], correct: 'Mitochondria' },
  { subject: 'Science', question: 'What is the freezing point of water on the Fahrenheit scale?', options: ['0°F', '32°F', '100°F', '212°F'], correct: '32°F' },
  { subject: 'Science', question: 'Which vitamin is produced in the human skin when exposed to sunlight?', options: ['Vitamin A', 'Vitamin B', 'Vitamin C', 'Vitamin D'], correct: 'Vitamin D' },
  { subject: 'Science', question: 'Which instrument is used to see extremely distant stars and planets?', options: ['Microscope', 'Telescope', 'Binoculars', 'Periscope'], correct: 'Telescope' },
  { subject: 'Science', question: 'What is a scientist who studies rocks and the Earth called?', options: ['Biologist', 'Chemist', 'Geologist', 'Astronomer'], correct: 'Geologist' },
  { subject: 'Science', question: 'What is the green pigment in plant leaves called?', options: ['Carotene', 'Chlorophyll', 'Xanthophyll', 'Anthocyanin'], correct: 'Chlorophyll' },
  { subject: 'Science', question: 'How many teeth does a normal adult human have?', options: ['28', '30', '32', '36'], correct: '32' },
  { subject: 'Science', question: 'Which gas do plants absorb during photosynthesis?', options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'], correct: 'Carbon Dioxide' },
  { subject: 'Science', question: 'What is the physical force that opposes relative motion between surfaces?', options: ['Inertia', 'Gravity', 'Friction', 'Tension'], correct: 'Friction' },

  // Social Studies
  { subject: 'Social Studies', question: 'In what year did Nigeria become independent?', options: ['1960', '1963', '1970', '1980'], correct: '1960' },
  { subject: 'Social Studies', question: 'Who was the first President of Nigeria?', options: ['Nnamdi Azikiwe', 'Obafemi Awolowo', 'Tafawa Balewa', 'Ahmadu Bello'], correct: 'Nnamdi Azikiwe' },
  { subject: 'Social Studies', question: 'Capital city of Nigeria?', options: ['Lagos', 'Abuja', 'Kano', 'Ibadan'], correct: 'Abuja' },
  { subject: 'Social Studies', question: 'Which is the largest continent?', options: ['Africa', 'Asia', 'Europe', 'North America'], correct: 'Asia' },
  { subject: 'Social Studies', question: 'How many states are in Nigeria?', options: ['30', '36', '40', '42'], correct: '36' },
  { subject: 'Social Studies', question: 'Which ocean borders the west of Africa?', options: ['Indian', 'Pacific', 'Atlantic', 'Arctic'], correct: 'Atlantic' },
  { subject: 'Social Studies', question: 'Who is known as the "Father of the Nation" in South Africa?', options: ['Nelson Mandela', 'Desmond Tutu', 'Thabo Mbeki', 'Steve Biko'], correct: 'Nelson Mandela' },
  { subject: 'Social Studies', question: 'What is the longest river in the world?', options: ['Amazon', 'Nile', 'Mississippi', 'Yangtze'], correct: 'Nile' },
  { subject: 'Social Studies', question: 'What does a map legend show?', options: ['Scale', 'Direction', 'Symbols', 'Names'], correct: 'Symbols' },
  { subject: 'Social Studies', question: 'Which line divides the Earth into North and South?', options: ['Prime Meridian', 'Equator', 'Tropic of Cancer', 'Tropic of Capricorn'], correct: 'Equator' },
  { subject: 'Social Studies', question: 'Which country is known as the "Giant of Africa"?', options: ['Egypt', 'South Africa', 'Nigeria', 'Kenya'], correct: 'Nigeria' },
  { subject: 'Social Studies', question: 'What is the largest desert in Africa?', options: ['Gobi', 'Kalahari', 'Sahara', 'Namib'], correct: 'Sahara' },
  { subject: 'Social Studies', question: 'What is the currency used in Nigeria?', options: ['Cedi', 'Dollar', 'Naira', 'Rand'], correct: 'Naira' },
  { subject: 'Social Studies', question: 'Which mountain is the highest in Africa?', options: ['Everest', 'Kilimanjaro', 'Kenya', 'Atlas'], correct: 'Kilimanjaro' },
  { subject: 'Social Studies', question: 'Who was the first military head of state in Nigeria?', options: ['Aguiyi-Ironsi', 'Yakubu Gowon', 'Murtala Mohammed', 'Olusegun Obasanjo'], correct: 'Aguiyi-Ironsi' },
  { subject: 'Social Studies', question: 'Which city is the administrative capital of South Africa?', options: ['Cape Town', 'Pretoria', 'Johannesburg', 'Durban'], correct: 'Pretoria' },
  { subject: 'Social Studies', question: 'What is the smallest country in the world?', options: ['Monaco', 'Malta', 'Vatican City', 'San Marino'], correct: 'Vatican City' },
  { subject: 'Social Studies', question: 'Which country has the largest population in the world?', options: ['USA', 'India', 'China', 'Russia'], correct: 'India' },
  { subject: 'Social Studies', question: 'What is the largest island in the world?', options: ['Greenland', 'Australia', 'Madagascar', 'Iceland'], correct: 'Greenland' },
  { subject: 'Social Studies', question: 'Who discoverd the source of the River Niger?', options: ['Mungo Park', 'Mary Slessor', 'David Livingstone', 'Richard Lander'], correct: 'Mungo Park' },
  { subject: 'Social Studies', question: 'Which is the smallest continent by land area?', options: ['Europe', 'Antarctica', 'Australia', 'South America'], correct: 'Australia' },
  { subject: 'Social Studies', question: 'What is the official language of Brazil?', options: ['Spanish', 'Portuguese', 'English', 'French'], correct: 'Portuguese' },
  { subject: 'Social Studies', question: 'In which continent is the Sahara Desert located?', options: ['Asia', 'Africa', 'Australia', 'South America'], correct: 'Africa' },
  { subject: 'Social Studies', question: 'Who was the first person to step on the Moon?', options: ['Yuri Gagarin', 'Neil Armstrong', 'Buzz Aldrin', 'John Glenn'], correct: 'Neil Armstrong' },
  { subject: 'Social Studies', question: 'What is the capital city of France?', options: ['Berlin', 'Rome', 'Madrid', 'Paris'], correct: 'Paris' },
  { subject: 'Social Studies', question: 'What is the capital city of Ghana?', options: ['Accra', 'Kumasi', 'Lome', 'Abidjan'], correct: 'Accra' },
  { subject: 'Social Studies', question: 'How many geopolitical zones are in Nigeria?', options: ['4', '5', '6', '8'], correct: '6' },
  { subject: 'Social Studies', question: 'What is the largest ocean on Earth?', options: ['Atlantic Ocean', 'Indian Ocean', 'Pacific Ocean', 'Arctic Ocean'], correct: 'Pacific Ocean' },
  { subject: 'Social Studies', question: 'Who is the Secretary-General of the United Nations as of 2026?', options: ['Ban Ki-moon', 'António Guterres', 'Kofi Annan', 'Boutros Boutros-Ghali'], correct: 'António Guterres' },
  { subject: 'Social Studies', question: 'In which country is the famous Pyramids of Giza located?', options: ['Greece', 'Egypt', 'Iraq', 'Jordan'], correct: 'Egypt' },
  { subject: 'Social Studies', question: 'What is the capital of the United Kingdom?', options: ['Edinburgh', 'Birmingham', 'London', 'Dublin'], correct: 'London' },
  { subject: 'Social Studies', question: 'What do you call a line of longitude?', options: ['Parallel', 'Meridian', 'Equator', 'Contour'], correct: 'Meridian' },
  { subject: 'Social Studies', question: 'Which country is commonly known as the "Land of the Rising Sun"?', options: ['China', 'Japan', 'South Korea', 'Thailand'], correct: 'Japan' },
  { subject: 'Social Studies', question: 'Who was the first female Prime Minister of the United Kingdom?', options: ['Theresa May', 'Margaret Thatcher', 'Liz Truss', 'Angela Merkel'], correct: 'Margaret Thatcher' },
  { subject: 'Social Studies', question: 'What is the currency of the United States?', options: ['Pound', 'Euro', 'Yen', 'Dollar'], correct: 'Dollar' },

  // Literature
  { subject: 'Literature', question: 'Who wrote "Tortoise and the Hare"?', options: ['Aesop', 'Shakespeare', 'Homer', 'Dickens'], correct: 'Aesop' },
  { subject: 'Literature', question: 'What is a poem with 14 lines called?', options: ['Haiku', 'Sonnet', 'Limerick', 'Epic'], correct: 'Sonnet' },
  { subject: 'Literature', question: 'Who is the author of "Things Fall Apart"?', options: ['Wole Soyinka', 'Chinua Achebe', 'Ben Okri', 'Chimamanda Adichie'], correct: 'Chinua Achebe' },
  { subject: 'Literature', question: 'What do you call the main character of a story?', options: ['Antagonist', 'Protagonist', 'Narrator', 'Supporting'], correct: 'Protagonist' },
  { subject: 'Literature', question: 'Which is a type of drama?', options: ['Novel', 'Tragedy', 'Essay', 'Poem'], correct: 'Tragedy' },
  { subject: 'Literature', question: 'Who wrote "Romeo and Juliet"?', options: ['Dickens', 'Shakespeare', 'Homer', 'Twain'], correct: 'Shakespeare' },
  { subject: 'Literature', question: 'What is a story about animals with a moral called?', options: ['Myth', 'Legend', 'Fable', 'Epic'], correct: 'Fable' },
  { subject: 'Literature', question: 'What is a figure of speech comparing two things using "as" or "like"?', options: ['Metaphor', 'Simile', 'Personification', 'Hyperbole'], correct: 'Simile' },
  { subject: 'Literature', question: 'Who wrote "The Lion and the Jewel"?', options: ['Chinua Achebe', 'Wole Soyinka', 'Ben Okri', 'Zaynab Alkali'], correct: 'Wole Soyinka' },
  { subject: 'Literature', question: 'What is the sequence of events in a story called?', options: ['Theme', 'Plot', 'Setting', 'Character'], correct: 'Plot' },
  { subject: 'Literature', question: 'A book written about a person by another person is a...', options: ['Autobiography', 'Biography', 'Fiction', 'Manual'], correct: 'Biography' },
  { subject: 'Literature', question: 'Who wrote "Joys of Motherhood"?', options: ['Buchi Emecheta', 'Flora Nwapa', 'Zaynab Alkali', 'Chimamanda Adichie'], correct: 'Buchi Emecheta' },
  { subject: 'Literature', question: 'What do you call a person who writes a play?', options: ['Author', 'Poet', 'Playwright', 'Novelist'], correct: 'Playwright' },
  { subject: 'Literature', question: 'What is an exaggeration for effect called?', options: ['Simile', 'Metaphor', 'Hyperbole', 'Oxymoron'], correct: 'Hyperbole' },
  { subject: 'Literature', question: 'Who is known as the "Father of Modern African Literature"?', options: ['Ngugi wa Thiongo', 'Chinua Achebe', 'Wole Soyinka', 'Amos Tutuola'], correct: 'Chinua Achebe' },
  { subject: 'Literature', question: 'A poem that tells a story is called a...', options: ['Lyric', 'Sonnet', 'Ballad', 'Haiku'], correct: 'Ballad' },
  { subject: 'Literature', question: 'What is the message or central idea of a story?', options: ['Plot', 'Theme', 'Setting', 'Point of View'], correct: 'Theme' },
  { subject: 'Literature', question: 'Who wrote "The Incorruptible Judge"?', options: ['Olu Obafemi', 'Olu Olagoke', 'Ola Rotimi', 'Femi Osofisan'], correct: 'Olu Olagoke' },
  { subject: 'Literature', question: 'An introduction to a book or play is called a...', options: ['Epilogue', 'Prologue', 'Chapter', 'Index'], correct: 'Prologue' },
  { subject: 'Literature', question: 'Who wrote "Half of a Yellow Sun"?', options: ['Sefi Atta', 'Chimamanda Adichie', 'Ben Okri', 'Helen Oyeyemi'], correct: 'Chimamanda Adichie' },
  { subject: 'Literature', question: 'Who wrote the children\'s classic "Alice in Wonderland"?', options: ['Lewis Carroll', 'Charles Dickens', 'Mark Twain', 'J.K. Rowling'], correct: 'Lewis Carroll' },
  { subject: 'Literature', question: 'What is a stanza in a poem?', options: ['A rhyme scheme', 'A group of lines', 'Word pronunciation', 'The climax'], correct: 'A group of lines' },
  { subject: 'Literature', question: 'Who is the author of "The Lion, the Witch and the Wardrobe"?', options: ['J.R.R. Tolkien', 'Roald Dahl', 'C.S. Lewis', 'Beatrix Potter'], correct: 'C.S. Lewis' },
  { subject: 'Literature', question: 'Which literary device gives human characteristics to non-human things?', options: ['Metaphor', 'Simile', 'Alliteration', 'Personification'], correct: 'Personification' },
  { subject: 'Literature', question: 'Who is the famous playwright who wrote "Macbeth"?', options: ['William Shakespeare', 'George Bernard Shaw', 'Arthur Miller', 'Oscar Wilde'], correct: 'William Shakespeare' },
  { subject: 'Literature', question: 'What is a traditional story passed down through generations called?', options: ['Biography', 'Folklore', 'Novel', 'Essay'], correct: 'Folklore' },
  { subject: 'Literature', question: 'What is the final resolution or untangling of plot in a story called?', options: ['Climax', 'Denouement', 'Exposition', 'Conflict'], correct: 'Denouement' },
  { subject: 'Literature', question: 'Who wrote the novel "Oliver Twist"?', options: ['Charles Dickens', 'Jane Austen', 'Charlotte Bronte', 'Thomas Hardy'], correct: 'Charles Dickens' },
  { subject: 'Literature', question: 'What is a comparison between two things without using "like" or "as"?', options: ['Simile', 'Metaphor', 'Hyperbole', 'Onomatopoeia'], correct: 'Metaphor' },
  { subject: 'Literature', question: 'Who is the main opponent or adversary of the protagonist in a story?', options: ['Supporting character', 'Narrator', 'Antagonist', 'Mentor'], correct: 'Antagonist' },
  { subject: 'Literature', question: 'What is a short, humorous poem with exactly five lines?', options: ['Sonnet', 'Haiku', 'Limerick', 'Ode'], correct: 'Limerick' },
  { subject: 'Literature', question: 'Who wrote the play "The Trials of Brother Jero"?', options: ['Chinua Achebe', 'Wole Soyinka', 'Ola Rotimi', 'JP Clark'], correct: 'Wole Soyinka' },
  { subject: 'Literature', question: 'What is the perspective or voice from which a story is told?', options: ['Theme', 'Plot', 'Point of View', 'Setting'], correct: 'Point of View' },
  { subject: 'Literature', question: 'Who is the creator of the famous detective character Sherlock Holmes?', options: ['Agatha Christie', 'Arthur Conan Doyle', 'Edgar Allan Poe', 'Stephen King'], correct: 'Arthur Conan Doyle' },
  { subject: 'Literature', question: 'What is the title of Chinua Achebe\'s second novel?', options: ['Things Fall Apart', 'No Longer at Ease', 'Arrow of God', 'A Man of the People'], correct: 'No Longer at Ease' },

  // Bible Study
  { subject: 'Bible Study', question: 'How many disciples did Jesus have?', options: ['10', '12', '14', '7'], correct: '12' },
  { subject: 'Bible Study', question: 'Who built the Ark?', options: ['Moses', 'Noah', 'Abraham', 'David'], correct: 'Noah' },
  { subject: 'Bible Study', question: 'Who was the first man according to the Bible?', options: ['Noah', 'Adam', 'Cain', 'Abel'], correct: 'Adam' },
  { subject: 'Bible Study', question: 'What is the first book of the Bible?', options: ['Exodus', 'Genesis', 'Leviticus', 'Numbers'], correct: 'Genesis' },
  { subject: 'Bible Study', question: 'Who led the Israelites out of Egypt?', options: ['Joshua', 'Moses', 'Aaron', 'Caleb'], correct: 'Moses' },
  { subject: 'Bible Study', question: 'Which sea did Moses part?', options: ['Dead Sea', 'Red Sea', 'Mediterranean Sea', 'Caspian Sea'], correct: 'Red Sea' },
  { subject: 'Bible Study', question: 'How many days did it take for God to create the world?', options: ['5', '6', '7', '8'], correct: '6' },
  { subject: 'Bible Study', question: 'Who was swallowed by a great fish?', options: ['Peter', 'Paul', 'Jonah', 'John'], correct: 'Jonah' },
  { subject: 'Bible Study', question: 'What was the sign of God\'s covenant with Noah?', options: ['Rainbow', 'Cloud', 'Fire', 'Dove'], correct: 'Rainbow' },
  { subject: 'Bible Study', question: 'Who was the strongest man in the Bible?', options: ['Samson', 'Goliath', 'David', 'Saul'], correct: 'Samson' },
  { subject: 'Bible Study', question: 'Who killed Goliath?', options: ['Saul', 'Solomon', 'David', 'Samuel'], correct: 'David' },
  { subject: 'Bible Study', question: 'Who was Jesus\' mother?', options: ['Elizabeth', 'Martha', 'Mary', 'Sarah'], correct: 'Mary' },
  { subject: 'Bible Study', question: 'In what town was Jesus born?', options: ['Jerusalem', 'Nazareth', 'Bethlehem', 'Jericho'], correct: 'Bethlehem' },
  { subject: 'Bible Study', question: 'Who betrayed Jesus for 30 pieces of silver?', options: ['Peter', 'James', 'Judas Iscariot', 'Thomas'], correct: 'Judas Iscariot' },
  { subject: 'Bible Study', question: 'What is the shortest verse in the Bible?', options: ['Jesus wept.', 'God is love.', 'Pray always.', 'Give thanks.'], correct: 'Jesus wept.' },
  { subject: 'Bible Study', question: 'Who was known as the "Father of Faith"?', options: ['Moses', 'David', 'Abraham', 'Isaac'], correct: 'Abraham' },
  { subject: 'Bible Study', question: 'Who was the son that Abraham almost sacrificed?', options: ['Ishmael', 'Isaac', 'Joseph', 'Benjamin'], correct: 'Isaac' },
  { subject: 'Bible Study', question: 'Who was the wise king that built the Temple?', options: ['David', 'Solomon', 'Saul', 'Hezekiah'], correct: 'Solomon' },
  { subject: 'Bible Study', question: 'What are the first four books of the New Testament called?', options: ['Epistles', 'Prophets', 'Gospels', 'Law'], correct: 'Gospels' },
  { subject: 'Bible Study', question: 'Who climbed a sycamore tree to see Jesus?', options: ['Peter', 'Zacchaeus', 'Barnabas', 'Silas'], correct: 'Zacchaeus' },
  { subject: 'Bible Study', question: 'What is the last book of the Bible?', options: ['Revelation', 'Acts', 'Genesis', 'Hebrews'], correct: 'Revelation' },
  { subject: 'Bible Study', question: 'How many books are in the New Testament?', options: ['27', '39', '66', '12'], correct: '27' },
  { subject: 'Bible Study', question: 'How many books are in the Old Testament?', options: ['27', '39', '66', '40'], correct: '39' },
  { subject: 'Bible Study', question: 'Who was thrown into the den of lions?', options: ['Daniel', 'Joseph', 'David', 'Samson'], correct: 'Daniel' },
  { subject: 'Bible Study', question: 'Who was Jesus\' earthly father?', options: ['Joseph', 'Mary', 'Peter', 'John'], correct: 'Joseph' },
  { subject: 'Bible Study', question: 'What did God use to make Eve?', options: ['Clay', 'Adam\'s rib', 'Dust', 'Breath'], correct: 'Adam\'s rib' },
  { subject: 'Bible Study', question: 'Who was the disciple that doubted Jesus\' resurrection until he saw him?', options: ['Thomas', 'Peter', 'John', 'Judas'], correct: 'Thomas' },
  { subject: 'Bible Study', question: 'On what mountain did Moses receive the Ten Commandments?', options: ['Mount Sinai', 'Mount Nebo', 'Mount Ararat', 'Mount Carmel'], correct: 'Mount Sinai' },
  { subject: 'Bible Study', question: 'Who is David\'s best friend, the son of King Saul?', options: ['Jonathan', 'Abner', 'Solomon', 'Samuel'], correct: 'Jonathan' },
  { subject: 'Bible Study', question: 'Which disciple was a tax collector before following Jesus?', options: ['Peter', 'Andrew', 'Matthew', 'Thomas'], correct: 'Matthew' },
  { subject: 'Bible Study', question: 'What was the language in which most of the New Testament was written?', options: ['Hebrew', 'Latin', 'Greek', 'Aramaic'], correct: 'Greek' },
  { subject: 'Bible Study', question: 'Who was the first king of Israel?', options: ['David', 'Solomon', 'Saul', 'Samuel'], correct: 'Saul' },
  { subject: 'Bible Study', question: 'What is the longest chapter in the Bible?', options: ['Psalm 23', 'Psalm 119', 'Genesis 1', 'Revelation 22'], correct: 'Psalm 119' },
  { subject: 'Bible Study', question: 'Who was the oldest man in the Bible?', options: ['Noah', 'Adam', 'Methuselah', 'Abraham'], correct: 'Methuselah' },
  { subject: 'Bible Study', question: 'What gift did the wise men bring besides Gold and Frankincense?', options: ['Silver', 'Myrrh', 'Diamonds', 'Rubies'], correct: 'Myrrh' },

  // Spelling
  { subject: 'Spelling', question: 'Identify the correct spelling:', options: ['Receive', 'Recieve', 'Receve', 'Resieve'], correct: 'Receive' },
  { subject: 'Spelling', question: 'Which is spelled correctly?', options: ['Accommodation', 'Acomodation', 'Accomodation', 'Acommodation'], correct: 'Accommodation' },
  { subject: 'Spelling', question: 'Correct spelling for "pleasant":', options: ['Plesant', 'Pleasant', 'Pleasent', 'Plesent'], correct: 'Pleasant' },
  { subject: 'Spelling', question: 'Identify the correct word:', options: ['Beginning', 'Begining', 'Begginning', 'Begining'], correct: 'Beginning' },
  { subject: 'Spelling', question: 'Correct spelling for "necessary":', options: ['Neccessary', 'Necessary', 'Neccesary', 'Necesary'], correct: 'Necessary' },
  { subject: 'Spelling', question: 'Identify the correct spelling:', options: ['Separate', 'Seperate', 'Seprate', 'Seperat'], correct: 'Separate' },
  { subject: 'Spelling', question: 'Which is spelled correctly?', options: ['Government', 'Goverment', 'Govment', 'Govenment'], correct: 'Government' },
  { subject: 'Spelling', question: 'Find the correctly spelled word:', options: ['Business', 'Bussiness', 'Bisness', 'Busines'], correct: 'Business' },
  { subject: 'Spelling', question: 'Identify the correct spelling:', options: ['Occurred', 'Ocured', 'Ocurred', 'Occured'], correct: 'Occurred' },
  { subject: 'Spelling', question: 'Which is correct?', options: ['Calendar', 'Calender', 'Calandar', 'Calandor'], correct: 'Calendar' },
  { subject: 'Spelling', question: 'Identify the correct spelling:', options: ['Argument', 'Arguement', 'Argumant', 'Arguemant'], correct: 'Argument' },
  { subject: 'Spelling', question: 'Correct spelling for "tomorrow":', options: ['Tomorrow', 'Tommorrow', 'Tommorow', 'Tomorow'], correct: 'Tomorrow' },
  { subject: 'Spelling', question: 'Find the correctly spelled word:', options: ['Definitely', 'Definitly', 'Definatly', 'Defenitely'], correct: 'Definitely' },
  { subject: 'Spelling', question: 'Identify the correct spelling:', options: ['Beautiful', 'Beatiful', 'Beautifull', 'Beatifulll'], correct: 'Beautiful' },
  { subject: 'Spelling', question: 'Correct spelling for "knowledge":', options: ['Knowlege', 'Knowledge', 'Nowledge', 'Knowledg'], correct: 'Knowledge' },
  { subject: 'Spelling', question: 'Which is spelled correctly?', options: ['Environment', 'Enviroment', 'Envirement', 'Enviorment'], correct: 'Environment' },
  { subject: 'Spelling', question: 'Identify the correct spelling:', options: ['Believe', 'Belive', 'Beleeve', 'Bellieve'], correct: 'Believe' },
  { subject: 'Spelling', question: 'Correct spelling for "different":', options: ['Diferent', 'Different', 'Differant', 'Diferrant'], correct: 'Different' },
  { subject: 'Spelling', question: 'Identify the correct spelling:', options: ['Language', 'Langage', 'Languague', 'Langauge'], correct: 'Language' },
  { subject: 'Spelling', question: 'Which is spelled correctly?', options: ['Library', 'Libary', 'Librery', 'Librury'], correct: 'Library' },
  { subject: 'Spelling', question: 'Identify the correct spelling:', options: ['Principal', 'Princepal', 'Prinsipal', 'Principle'], correct: 'Principal' },
  { subject: 'Spelling', question: 'Which is spelled correctly?', options: ['Millennium', 'Millenium', 'Milennium', 'Milenium'], correct: 'Millennium' },
  { subject: 'Spelling', question: 'Identify the correct spelling:', options: ['Guarantee', 'Garanty', 'Garantee', 'Garantie'], correct: 'Guarantee' },
  { subject: 'Spelling', question: 'Identify the correct spelling:', options: ['Rhythm', 'Rythm', 'Rithm', 'Rhythim'], correct: 'Rhythm' },
  { subject: 'Spelling', question: 'Correct spelling of "embarrass":', options: ['Embarrass', 'Embaras', 'Embarasss', 'Emberass'], correct: 'Embarrass' },
  { subject: 'Spelling', question: 'Correct spelling of "maintenance":', options: ['Maintenance', 'Maintainance', 'Maintenence', 'Maintainence'], correct: 'Maintenance' },
  { subject: 'Spelling', question: 'Which is spelled correctly?', options: ['Noticeable', 'Noticable', 'Noticeble', 'Notiseable'], correct: 'Noticeable' },
  { subject: 'Spelling', question: 'Identify the correct spelling:', options: ['Pronunciation', 'Pronounciation', 'Pronunciacion', 'Pronounciacion'], correct: 'Pronunciation' },
  { subject: 'Spelling', question: 'Choose the correct spelling:', options: ['Cemetery', 'Semetary', 'Cemetary', 'Cemeterey'], correct: 'Cemetery' },
  { subject: 'Spelling', question: 'Identify the correct spelling:', options: ['Independent', 'Independant', 'Indepandent', 'Indepandant'], correct: 'Independent' },
  { subject: 'Spelling', question: 'Identify the correct spelling:', options: ['Privilege', 'Priviledge', 'Privelege', 'Privelidge'], correct: 'Privilege' },
  { subject: 'Spelling', question: 'Correct spelling of "schedule":', options: ['Schedule', 'Shedul', 'Scedule', 'Shedules'], correct: 'Schedule' },
  { subject: 'Spelling', question: 'Identify the correct spelling:', options: ['Liaison', 'Liason', 'Liaisone', 'Liasone'], correct: 'Liaison' },
  { subject: 'Spelling', question: 'Find the correctly spelled word:', options: ['Vacuum', 'Vacum', 'Vaccuum', 'Vacuume'], correct: 'Vacuum' },
  { subject: 'Spelling', question: 'Identify the correct spelling:', options: ['Conscious', 'Consicious', 'Concious', 'Conshius'], correct: 'Conscious' },

  // BIOLOGY DRILLS
  { subject: 'Biology', question: 'Which cell organelle is known as the powerhouse of the cell?', options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi Apparatus'], correct: 'Mitochondria' },
  { subject: 'Biology', question: 'What double-helix molecule carries the genetic code in living organisms?', options: ['RNA', 'DNA', 'ATP', 'Glucose'], correct: 'DNA' },
  { subject: 'Biology', question: 'What green pigment in chloroplasts absorbs solar energy for photosynthesis?', options: ['Carotene', 'Chlorophyll', 'Xanthophyll', 'Hemoglobin'], correct: 'Chlorophyll' },
  { subject: 'Biology', question: 'What structural lipid layer forms the primary boundary of cell membranes?', options: ['Phospholipid Bilayer', 'Cellulose Wall', 'Chitin Layer', 'Peptidoglycan'], correct: 'Phospholipid Bilayer' },
  { subject: 'Biology', question: 'What term describes the observable physical traits of an organism?', options: ['Genotype', 'Phenotype', 'Karyotype', 'Allele'], correct: 'Phenotype' },
  { subject: 'Biology', question: 'What term describes the full genetic composition of an organism?', options: ['Phenotype', 'Genotype', 'Genome', 'Chromosome'], correct: 'Genotype' },
  { subject: 'Biology', question: 'In biological taxonomy, which classification rank comes directly below Kingdom?', options: ['Class', 'Order', 'Phylum', 'Family'], correct: 'Phylum' },
  { subject: 'Biology', question: 'Which iron-containing protein in red blood cells carries oxygen?', options: ['Myoglobin', 'Hemoglobin', 'Fibrin', 'Keratin'], correct: 'Hemoglobin' },
  { subject: 'Biology', question: 'How do enzymes speed up biochemical reactions in living cells?', options: ['By increasing heat', 'By lowering activation energy', 'By raising pH', 'By consuming ATP'], correct: 'By lowering activation energy' },
  { subject: 'Biology', question: 'Which type of cell division produces 4 genetically distinct haploid gametes?', options: ['Mitosis', 'Meiosis', 'Binary Fission', 'Budding'], correct: 'Meiosis' },
  { subject: 'Biology', question: 'Which process of cell division produces two identical diploid daughter cells?', options: ['Meiosis', 'Mitosis', 'Sporulation', 'Conjugation'], correct: 'Mitosis' },
  { subject: 'Biology', question: 'Organisms that manufacture their own food from sunlight are called:', options: ['Heterotrophs', 'Autotrophs', 'Decomposers', 'Saprophytes'], correct: 'Autotrophs' },
  { subject: 'Biology', question: 'Which vascular plant tissue transports water and minerals from roots upward?', options: ['Phloem', 'Xylem', 'Cambium', 'Epidermis'], correct: 'Xylem' },
  { subject: 'Biology', question: 'Which vascular plant tissue transports organic sugars from leaves throughout the plant?', options: ['Xylem', 'Phloem', 'Pith', 'Cortex'], correct: 'Phloem' },
  { subject: 'Biology', question: 'Which heart chamber pumps oxygenated blood directly into the aorta to supply the body?', options: ['Right Atrium', 'Right Ventricle', 'Left Atrium', 'Left Ventricle'], correct: 'Left Ventricle' },
  { subject: 'Biology', question: 'What are the monomer building blocks that assemble into proteins?', options: ['Nucleotides', 'Monosaccharides', 'Amino Acids', 'Fatty Acids'], correct: 'Amino Acids' },
  { subject: 'Biology', question: 'An organism having two identical alleles for a specific gene (e.g. TT or tt) is:', options: ['Heterozygous', 'Homozygous', 'Hemizygous', 'Polygenic'], correct: 'Homozygous' },
  { subject: 'Biology', question: 'An organism having two different alleles for a specific gene (e.g. Tt) is:', options: ['Homozygous', 'Heterozygous', 'Recessive', 'Purebred'], correct: 'Heterozygous' },
  { subject: 'Biology', question: 'What is the microscopic functional filtering unit of the human kidney?', options: ['Nephron', 'Neuron', 'Alveolus', 'Villus'], correct: 'Nephron' },
  { subject: 'Biology', question: 'What tiny air sacs in the human lungs are the site of gas exchange?', options: ['Bronchioles', 'Alveoli', 'Trachea', 'Pleura'], correct: 'Alveoli' },
  { subject: 'Biology', question: 'Single-celled organisms that lack a membrane-bound nucleus are classified as:', options: ['Eukaryotes', 'Prokaryotes', 'Fungi', 'Protists'], correct: 'Prokaryotes' },
  { subject: 'Biology', question: 'Which organelle is responsible for synthesizing proteins inside the cell?', options: ['Lysosome', 'Ribosome', 'Vacuole', 'Centrosome'], correct: 'Ribosome' },
  { subject: 'Biology', question: 'Where in the cell does the initial anaerobic stage of respiration (glycolysis) occur?', options: ['Mitochondrial Matrix', 'Cytoplasm', 'Inner Membrane', 'Nucleolus'], correct: 'Cytoplasm' },
  { subject: 'Biology', question: 'What high-energy molecule serves as the main chemical energy currency of cells?', options: ['ADP', 'ATP', 'NADP', 'DNA'], correct: 'ATP' },
  { subject: 'Biology', question: 'Who formulated the seminal theory of evolution through natural selection?', options: ['Gregor Mendel', 'Charles Darwin', 'Louis Pasteur', 'Robert Hooke'], correct: 'Charles Darwin' },
  { subject: 'Biology', question: 'What ecological term denotes the maximum population size an ecosystem can support?', options: ['Biomass', 'Carrying Capacity', 'Niche', 'Trophic Level'], correct: 'Carrying Capacity' },
  { subject: 'Biology', question: 'What is the microscopic gap between two neurons across which neurotransmitters travel?', options: ['Axon', 'Synapse', 'Dendrite', 'Myelin'], correct: 'Synapse' },
  { subject: 'Biology', question: 'Which blood cells defend the human body against infectious diseases and pathogens?', options: ['Erythrocytes', 'Platelets', 'Leukocytes (White Blood Cells)', 'Plasma'], correct: 'Leukocytes (White Blood Cells)' },
  { subject: 'Biology', question: 'Which endocrine gland is often referred to as the "master gland"?', options: ['Thyroid', 'Adrenal', 'Pituitary Gland', 'Pancreas'], correct: 'Pituitary Gland' },
  { subject: 'Biology', question: 'Which nitrogenous base is present in RNA but absent in DNA?', options: ['Thymine', 'Uracil', 'Cytosine', 'Guanine'], correct: 'Uracil' },

  // ETYMOLOGY DRILLS
  { subject: 'Etymology', question: 'The Greek root "chron-" in words like "chronology" and "synchronize" means:', options: ['Space', 'Time', 'Sound', 'Color'], correct: 'Time' },
  { subject: 'Etymology', question: 'The Latin root "scrib / script" in "inscribe" and "scripture" means:', options: ['To speak', 'To write', 'To read', 'To build'], correct: 'To write' },
  { subject: 'Etymology', question: 'The Greek root "bio-" in "biology" and "biography" means:', options: ['Life', 'Earth', 'Mind', 'Nature'], correct: 'Life' },
  { subject: 'Etymology', question: 'The Greek root "tele-" in "telescope" and "telephone" means:', options: ['Small', 'Distant / Far off', 'Light', 'Fast'], correct: 'Distant / Far off' },
  { subject: 'Etymology', question: 'The Latin root "aqua" in "aquarium" and "aqueduct" means:', options: ['Air', 'Water', 'Fire', 'Earth'], correct: 'Water' },
  { subject: 'Etymology', question: 'The Greek root "pathos" in "empathy" and "sympathy" means:', options: ['Knowledge', 'Feeling / Suffering', 'Movement', 'Thought'], correct: 'Feeling / Suffering' },
  { subject: 'Etymology', question: 'The Greek root "dem-" in "democracy" and "epidemic" means:', options: ['People', 'Government', 'Power', 'City'], correct: 'People' },
  { subject: 'Etymology', question: 'The Latin root "bene-" in "benefactor" and "benevolent" means:', options: ['Bad', 'Good / Well', 'Large', 'True'], correct: 'Good / Well' },
  { subject: 'Etymology', question: 'The word "dinosaur" was coined from Greek roots meaning:', options: ['Ancient reptile', 'Terrible lizard', 'Giant beast', 'Thunder dragon'], correct: 'Terrible lizard' },
  { subject: 'Etymology', question: 'The word "philosophy" literally translates from Greek roots as:', options: ['Study of truth', 'Love of wisdom', 'Search for knowledge', 'Mastery of thought'], correct: 'Love of wisdom' },
  { subject: 'Etymology', question: 'The Latin root "aud" in "audience" and "audible" means:', options: ['To see', 'To hear', 'To touch', 'To feel'], correct: 'To hear' },
  { subject: 'Etymology', question: 'The Greek root "micro-" in "microscope" and "microbe" means:', options: ['Large', 'Small', 'Hidden', 'Fast'], correct: 'Small' },
  { subject: 'Etymology', question: 'The Greek root "phobia" in "claustrophobia" and "arachnophobia" means:', options: ['Love', 'Fear / Dread', 'Hatred', 'Desire'], correct: 'Fear / Dread' },
  { subject: 'Etymology', question: 'The Latin root "dict" in "dictate" and "predict" means:', options: ['To write', 'To speak / say', 'To command', 'To hear'], correct: 'To speak / say' },
  { subject: 'Etymology', question: 'The Latin root "vis / vid" in "vision" and "video" means:', options: ['To see', 'To hear', 'To touch', 'To move'], correct: 'To see' },
  { subject: 'Etymology', question: 'The Latin root "ped" in "pedestrian" and "pedal" means:', options: ['Hand', 'Foot', 'Head', 'Arm'], correct: 'Foot' },
  { subject: 'Etymology', question: 'The Latin prefix "sub-" in "subterranean" and "submarine" means:', options: ['Above', 'Under / Below', 'Beside', 'Across'], correct: 'Under / Below' },
  { subject: 'Etymology', question: 'The Greek prefix "poly-" in "polygon" and "polyglot" means:', options: ['Single', 'Many', 'Few', 'Equal'], correct: 'Many' },
  { subject: 'Etymology', question: 'The Greek root "geo-" in "geology" and "geography" means:', options: ['Earth', 'Sun', 'Star', 'Water'], correct: 'Earth' },
  { subject: 'Etymology', question: 'The Greek root "graph-" in "autograph" and "paragraph" means:', options: ['To draw / write', 'To speak', 'To listen', 'To paint'], correct: 'To draw / write' },
  { subject: 'Etymology', question: 'The Latin root "man-" in "manual" and "manuscript" means:', options: ['Mind', 'Hand', 'Man', 'Work'], correct: 'Hand' },
  { subject: 'Etymology', question: 'The word "hippopotamus" comes from Greek roots meaning:', options: ['Big pig', 'River horse', 'Water monster', 'Heavy giant'], correct: 'River horse' },
  { subject: 'Etymology', question: 'The Greek prefix "anti-" in "antibiotic" and "antidote" means:', options: ['Before', 'Against / Opposite', 'With', 'After'], correct: 'Against / Opposite' },
  { subject: 'Etymology', question: 'The Latin root "mort" in "mortal" and "immortal" means:', options: ['Life', 'Death', 'Strength', 'Soul'], correct: 'Death' },
  { subject: 'Etymology', question: 'The Greek root "soph" in "sophisticated" and "philosopher" means:', options: ['Wisdom', 'Strength', 'Beauty', 'Power'], correct: 'Wisdom' },
  { subject: 'Etymology', question: 'The Latin root "cred" in "credible" and "incredible" means:', options: ['To create', 'To believe / trust', 'To grow', 'To run'], correct: 'To believe / trust' },
  { subject: 'Etymology', question: 'The word "metamorphosis" combines Greek roots meaning:', options: ['Change of form', 'Growth of mind', 'New creation', 'Cycle of life'], correct: 'Change of form' },
  { subject: 'Etymology', question: 'The Latin root "port" in "portable" and "transport" means:', options: ['To build', 'To carry', 'To push', 'To lead'], correct: 'To carry' },
  { subject: 'Etymology', question: 'The Greek prefix "auto-" in "autobiography" and "autonomous" means:', options: ['Other', 'Self', 'Group', 'Machine'], correct: 'Self' },
  { subject: 'Etymology', question: 'The Latin root "voc / vok" in "vocal" and "provoke" means:', options: ['Voice / To call', 'Sight', 'Sound', 'Thought'], correct: 'Voice / To call' },
];

export default function DrillSession({ 
  user,
  onComplete,
  onBack,
  filterSubject
}: { 
  user: User;
  onComplete: (score: number, nextSubject?: Subject) => void;
  onBack: () => void;
  filterSubject?: Subject;
}) {
  const [shuffleTrigger, setShuffleTrigger] = useState(0);

  // Anti-repeat selection logic: track asked questions per subject in localStorage
  const questionsToUse = React.useMemo(() => {
    const pool = filterSubject 
      ? DRILL_QUESTIONS.filter(q => q.subject === filterSubject)
      : DRILL_QUESTIONS;
    
    if (pool.length === 0) return [];

    const storageKey = `asked_drill_questions_${filterSubject || 'all'}`;
    let askedQuestions: string[] = [];
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) askedQuestions = JSON.parse(raw);
    } catch (err) {
      console.error(err);
    }

    // Filter for questions that haven't been asked yet
    let unaskedPool = pool.filter(q => !askedQuestions.includes(q.question));

    // If fewer than 5 unasked questions remain in the pool, reset the history for a fresh cycle!
    if (unaskedPool.length < 5) {
      askedQuestions = [];
      unaskedPool = [...pool];
    }

    // Shuffle unasked questions randomly
    const shuffled = [...unaskedPool].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(10, shuffled.length));

    // Save newly selected questions to history
    const updatedAsked = Array.from(new Set([...askedQuestions, ...selected.map(q => q.question)]));
    try {
      localStorage.setItem(storageKey, JSON.stringify(updatedAsked));
    } catch (err) {
      console.error(err);
    }

    return selected;
  }, [filterSubject, shuffleTrigger]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(60); // 60 seconds rapid-fire for 10 questions
  const [isFinished, setIsFinished] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

  // Reset state when subject changes
  useEffect(() => {
    setCurrentIndex(0);
    setScore(0);
    setTimer(60);
    setIsFinished(false);
    setSelectedOption(null);
    setAnswered(false);
    setShuffleTrigger(prev => prev + 1);
  }, [filterSubject]);

  useEffect(() => {
    let interval: any;
    if (timer > 0 && !isFinished) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0) {
      setIsFinished(true);
    }
    return () => clearInterval(interval);
  }, [timer, isFinished]);

  const currentQuestion = questionsToUse[currentIndex];

  const handleAnswer = (option: string) => {
    if (answered) return;
    setSelectedOption(option);
    setAnswered(true);
    
    if (option === currentQuestion.correct) {
      setScore(s => s + 10);
    }

    setTimeout(() => {
      setAnswered(false);
      setSelectedOption(null);
      if (currentIndex + 1 >= questionsToUse.length) {
        setIsFinished(true);
      } else {
        setCurrentIndex(prev => prev + 1);
      }
    }, 1000);
  };

  const subjects: Subject[] = ['Math', 'English', 'Science', 'Social Studies', 'Literature', 'Bible Study', 'Spelling'];
  if (user.grade && user.grade >= 8 && user.grade <= 10) {
    subjects.push('Biology', 'Etymology');
  }

  const getNextSubject = () => {
    const availableSubjects = subjects.filter(s => isSubjectDrillAvailable(s));
    const currentIndex = availableSubjects.indexOf(filterSubject || 'Math');
    if (currentIndex === -1) return availableSubjects[0] || 'Math';
    return availableSubjects[(currentIndex + 1) % availableSubjects.length];
  };

  // Schedule constraint check for Biology & Etymology drills
  if (filterSubject && !isSubjectDrillAvailable(filterSubject)) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-slate-900/90 backdrop-blur-xl p-10 rounded-[3rem] border border-amber-500/30 shadow-2xl max-w-xl w-full text-center"
        >
          <div className="w-20 h-20 bg-amber-500/20 border border-amber-500/40 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-400">
            <span className="material-symbols-outlined text-4xl">lock_clock</span>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-300 text-xs font-black uppercase tracking-widest mb-4">
            <span className="material-symbols-outlined text-sm">calendar_month</span>
            Schedule Constraint
          </div>

          <h2 className="text-3xl font-black mb-3 tracking-tight text-white">
            {filterSubject} Drills Locked Today
          </h2>
          <p className="text-white/70 text-sm font-medium leading-relaxed mb-8 max-w-md mx-auto">
            Subject drills for <strong className="text-amber-300">{filterSubject}</strong> are available only on <span className="text-white font-bold">Monday, Wednesday, Friday, Saturday, and Sunday</span>. They are not available on Tuesdays and Thursdays.
          </p>

          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 mb-8 grid grid-cols-7 gap-1.5 text-xs font-bold">
            {[
              { day: 'Sun', active: true },
              { day: 'Mon', active: true },
              { day: 'Tue', active: false },
              { day: 'Wed', active: true },
              { day: 'Thu', active: false },
              { day: 'Fri', active: true },
              { day: 'Sat', active: true },
            ].map(d => (
              <div 
                key={d.day} 
                className={cn(
                  "p-2 rounded-xl flex flex-col items-center gap-1",
                  d.active ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-red-500/10 text-red-400/50 border border-red-500/20 opacity-60"
                )}
              >
                <span>{d.day}</span>
                <span className="material-symbols-outlined text-xs">
                  {d.active ? 'check_circle' : 'lock'}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={onBack}
              className="py-4 px-8 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all"
            >
              Return to Dashboard
            </button>
            <button 
              onClick={() => onComplete(0, 'Math')}
              className="py-4 px-8 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl transition-all"
            >
              Try Math Drill Instead
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center">
        <h2 className="text-2xl font-black mb-4">No Questions Available</h2>
        <p className="text-white/60 mb-6 font-bold">There are no drill questions for this subject yet.</p>
        <button onClick={onBack} className="py-3 px-6 bg-primary rounded-xl font-bold text-sm uppercase tracking-wider">
          Go Back
        </button>
      </div>
    );
  }

  if (isFinished) {
    const nextSubject = getNextSubject();
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/10 backdrop-blur-xl p-12 rounded-[3.5rem] border border-white/20 shadow-2xl max-w-lg w-full"
        >
          <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(var(--color-primary),0.5)]">
            <span className="material-symbols-outlined text-5xl">emoji_events</span>
          </div>
          <h2 className="text-4xl font-black mb-2 tracking-tight uppercase">Drill Complete!</h2>
          <p className="text-white/60 font-bold mb-8 italic">You completed the {filterSubject || 'General'} drill!</p>
          
          <div className="text-6xl font-black text-primary mb-2">{score}</div>
          <p className="text-xs font-black uppercase tracking-[0.3em] opacity-40 mb-12">Total Mastery Points</p>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={onBack}
                className="py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-black uppercase text-xs tracking-widest transition-all"
              >
                Exit
              </button>
              <button 
                onClick={() => onComplete(score)}
                className="py-4 bg-primary text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:scale-105 transition-all text-center"
              >
                Finish Today
              </button>
            </div>
            
            <button 
              onClick={() => {
                onComplete(score, nextSubject);
              }}
              className="w-full py-4 bg-secondary/20 border border-secondary/50 text-secondary rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-secondary/30 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">cycle</span>
              Change to {nextSubject} Drill
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 flex flex-col items-center relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(139,92,246,0.15),transparent)] pointer-events-none" />
      <div className="absolute -bottom-48 -right-48 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Timer HUD */}
      <nav className="w-full max-w-4xl flex items-center justify-between mb-12 relative z-10">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                <span className="material-symbols-outlined text-primary text-3xl">bolt</span>
            </div>
            <div>
                <h1 className="text-white font-black text-xl tracking-tight uppercase">Rapid-Fire Drills</h1>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Question {currentIndex + 1} of {questionsToUse.length}</p>
            </div>
        </div>

        <div className={cn(
          "px-8 py-3 rounded-full border border-white/20 backdrop-blur-md flex items-center gap-3 transition-colors",
          timer < 10 ? "bg-red-500/20 text-red-500 animate-pulse border-red-500/50" : "bg-white/5 text-white"
        )}>
          <span className="material-symbols-outlined text-xl">timer</span>
          <span className="text-2xl font-black tabular-nums">{timer}s</span>
        </div>
      </nav>

      <div className="w-full max-w-2xl relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="space-y-8"
          >
            <div className="bg-white/10 backdrop-blur-xl p-10 rounded-[3rem] border border-white/20 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[5rem] -z-10" />
              
              <div className="flex items-center gap-3 mb-6">
                 <span className="px-3 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                   {currentQuestion.subject}
                 </span>
              </div>

              <h2 className="text-3xl font-black text-white leading-tight">
                {currentQuestion.question}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.options.map((option, i) => {
                const isSelected = selectedOption === option;
                const isCorrect = option === currentQuestion.correct;
                
                return (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswer(option)}
                    disabled={answered}
                    className={cn(
                      "p-6 rounded-3xl border-2 font-bold text-lg text-left transition-all relative overflow-hidden flex items-center justify-between",
                      !answered 
                        ? "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-primary/50" 
                        : isCorrect 
                          ? "bg-secondary/20 border-secondary text-secondary" 
                          : isSelected 
                            ? "bg-red-500/20 border-red-500 text-red-500" 
                            : "bg-white/5 border-white/10 text-white/30"
                    )}
                  >
                    <span>{option}</span>
                    {answered && isCorrect && (
                      <span className="material-symbols-outlined text-secondary">check_circle</span>
                    )}
                    {answered && isSelected && !isCorrect && (
                      <span className="material-symbols-outlined text-red-500">cancel</span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Bar */}
      <div className="fixed bottom-12 w-full max-w-md bg-white/5 h-2 rounded-full overflow-hidden border border-white/10">
        <motion.div 
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / questionsToUse.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
