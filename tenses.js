// ============================================================
// VidyaFrame — English Tenses: Complete Interactive Learning Page
// ============================================================

// --- Theme Management (shared with main app) ---
const THEME_KEY = 'vidyaframe_theme';

let currentTheme = localStorage.getItem(THEME_KEY) || 'dark';
let selectedClassLevel = 'class4-5';
let expandedTense = null;

function applyTheme() {
  if (currentTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  localStorage.setItem(THEME_KEY, currentTheme);
  updateThemeIcon();
}

function updateThemeIcon() {
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) {
    btn.innerHTML = `<i data-lucide="${currentTheme === 'dark' ? 'sun' : 'moon'}" class="w-4 h-4"></i>`;
    lucide.createIcons();
  }
}

// --- Class Level Definitions ---
const CLASS_LEVELS = [
  { id: 'class4-5', label: 'Class 4–5', shortLabel: '4-5', color: 'emerald', description: 'Basic Introduction' },
  { id: 'class6', label: 'Class 6', shortLabel: '6', color: 'blue', description: 'Building Knowledge' },
  { id: 'class8', label: 'Class 8', shortLabel: '8', color: 'violet', description: 'Examples & Forms' },
  { id: 'class9', label: 'Class 9', shortLabel: '9', color: 'amber', description: 'Advanced Usage' },
  { id: 'class10', label: 'Class 10', shortLabel: '10', color: 'rose', description: 'Complete Mastery' },
];

// --- Tense Category Colors ---
const TENSE_COLORS = {
  present: {
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-500/10 dark:bg-blue-500/15',
    border: 'border-blue-500/20 dark:border-blue-500/30',
    text: 'text-blue-600 dark:text-blue-400',
    icon: 'text-blue-500',
    ring: 'ring-blue-500/20',
    accentBg: 'bg-blue-500',
    lightBg: 'bg-blue-50 dark:bg-blue-950/30',
    hex: '#3B82F6',
  },
  past: {
    gradient: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-500/10 dark:bg-amber-500/15',
    border: 'border-amber-500/20 dark:border-amber-500/30',
    text: 'text-amber-600 dark:text-amber-400',
    icon: 'text-amber-500',
    ring: 'ring-amber-500/20',
    accentBg: 'bg-amber-500',
    lightBg: 'bg-amber-50 dark:bg-amber-950/30',
    hex: '#F59E0B',
  },
  future: {
    gradient: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    border: 'border-emerald-500/20 dark:border-emerald-500/30',
    text: 'text-emerald-600 dark:text-emerald-400',
    icon: 'text-emerald-500',
    ring: 'ring-emerald-500/20',
    accentBg: 'bg-emerald-500',
    lightBg: 'bg-emerald-50 dark:bg-emerald-950/30',
    hex: '#10B981',
  },
};

// ============================================================
// COMPLETE TENSE DATA — All 12 tenses, all class levels
// ============================================================
const TENSES_DATA = {
  present: {
    title: 'Present Tense',
    subtitle: 'Actions happening now or regularly',
    icon: 'clock',
    tenses: [
      {
        id: 'simple-present',
        name: 'Simple Present Tense',
        levels: {
          'class4-5': {
            definition: 'A tense used to talk about habits, facts, and things that happen regularly.',
            formula: 'Subject + V1 (base verb) + Object',
            formulaNeg: 'Subject + do/does + not + V1 + Object',
            formulaQ: 'Do/Does + Subject + V1 + Object?',
          },
          'class6': {
            whenToUse: [
              'To talk about daily habits and routines (I wake up at 6 AM.)',
              'To state general truths and facts (The sun rises in the east.)',
              'To describe permanent situations (She lives in Delhi.)',
              'For timetables and schedules (The train leaves at 9 PM.)',
            ],
            signalWords: ['always', 'usually', 'often', 'sometimes', 'never', 'every day', 'every week', 'on Mondays'],
          },
          'class8': {
            examples: [
              { aff: 'She plays tennis every Sunday.', neg: 'She does not play tennis every Sunday.', q: 'Does she play tennis every Sunday?' },
              { aff: 'They go to school by bus.', neg: 'They do not go to school by bus.', q: 'Do they go to school by bus?' },
              { aff: 'Water boils at 100°C.', neg: 'Water does not boil at 50°C.', q: 'Does water boil at 100°C?' },
              { aff: 'He reads the newspaper every morning.', neg: 'He does not read the newspaper every morning.', q: 'Does he read the newspaper every morning?' },
            ],
            rulesNote: 'Add -s or -es to the verb when the subject is He, She, or It (third person singular).',
          },
          'class9': {
            commonMistakes: [
              { wrong: 'He play football.', correct: 'He plays football.', explanation: 'Third person singular (he/she/it) requires -s/-es on the verb.' },
              { wrong: 'She do not likes coffee.', correct: 'She does not like coffee.', explanation: 'After does/does not, use the base form of the verb (no -s).' },
              { wrong: 'I am go to school daily.', correct: 'I go to school daily.', explanation: 'Simple present doesn\'t use "am/is/are" with main verbs.' },
            ],
            advancedExamples: [
              'If it rains, we stay indoors. (zero conditional)',
              'The flight departs at 6 AM tomorrow. (scheduled future event)',
              'She speaks three languages fluently. (ability/permanent skill)',
            ],
          },
          'class10': {
            detailedRules: [
              'Use base form (V1) for I/You/We/They. Add -s/-es for He/She/It.',
              'Verbs ending in -o, -ch, -sh, -ss, -x, -z: add -es (goes, watches, washes).',
              'Verbs ending in consonant + y: change y to -ies (studies, carries).',
              'Verbs ending in vowel + y: just add -s (plays, says).',
              'Irregular: have → has, do → does, be → am/is/are.',
            ],
            exceptions: [
              'Stative verbs (know, believe, love, own) are almost always used in simple present, not continuous.',
              'In news headlines, simple present replaces past tense: "PM Visits France."',
              'In commentary and narration: "Kohli hits the ball... and it goes for a six!"',
            ],
            transformations: [
              { given: 'She writes a letter. (Change to negative)', answer: 'She does not write a letter.' },
              { given: 'They play cricket on Sundays. (Change to interrogative)', answer: 'Do they play cricket on Sundays?' },
              { given: 'Does he like mangoes? (Change to affirmative)', answer: 'He likes mangoes.' },
            ],
          },
        },
        worksheet: {
          'class4-5': [
            { type: 'fill', instruction: 'Fill in the blank with the correct form of the verb.', questions: [
              { q: 'She ___ (go) to school every day.', a: 'goes' },
              { q: 'They ___ (play) in the park.', a: 'play' },
              { q: 'My mother ___ (cook) dinner at night.', a: 'cooks' },
              { q: 'The dog ___ (bark) at strangers.', a: 'barks' },
              { q: 'We ___ (like) ice cream.', a: 'like' },
            ]},
          ],
          'class6': [
            { type: 'fill', instruction: 'Fill in the blanks with the correct verb form.', questions: [
              { q: 'He ___ (study) English every evening.', a: 'studies' },
              { q: 'The sun ___ (rise) in the east.', a: 'rises' },
              { q: 'Birds ___ (fly) south in winter.', a: 'fly' },
              { q: 'She always ___ (carry) her umbrella.', a: 'carries' },
              { q: 'My father ___ (drive) to work.', a: 'drives' },
            ]},
            { type: 'match', instruction: 'Match the signal words with their meaning.', questions: [
              { q: 'always', a: 'at all times' },
              { q: 'never', a: 'at no time' },
              { q: 'usually', a: 'most of the time' },
              { q: 'sometimes', a: 'now and then' },
              { q: 'often', a: 'many times' },
            ]},
          ],
          'class8': [
            { type: 'transform', instruction: 'Change the following sentences as directed.', questions: [
              { q: 'Ravi plays chess. (Make negative)', a: 'Ravi does not play chess.' },
              { q: 'They like pizza. (Make interrogative)', a: 'Do they like pizza?' },
              { q: 'She does not dance well. (Make affirmative)', a: 'She dances well.' },
              { q: 'Do you speak French? (Make affirmative)', a: 'You speak French.' },
              { q: 'The cat catches mice. (Make negative)', a: 'The cat does not catch mice.' },
            ]},
            { type: 'correct', instruction: 'Correct the errors in these sentences.', questions: [
              { q: 'He go to the market every day.', a: 'He goes to the market every day.' },
              { q: 'She don\'t like cold weather.', a: 'She doesn\'t like cold weather.' },
              { q: 'The children plays in the ground.', a: 'The children play in the ground.' },
            ]},
          ],
          'class9': [
            { type: 'paragraph', instruction: 'Fill in the blanks to complete the paragraph using Simple Present Tense.', questions: [
              { q: 'My name is Aman. I ___ (live) in Jaipur. Every morning, I ___ (wake) up at 5:30 AM. I ___ (brush) my teeth and ___ (take) a bath. My mother ___ (prepare) breakfast for the family. My father ___ (read) the newspaper. After breakfast, my sister and I ___ (walk) to school. We ___ (study) hard and ___ (enjoy) sports in the evening.', a: 'live, wake, brush, take, prepares, reads, walk, study, enjoy' },
            ]},
            { type: 'identify', instruction: 'Identify whether the sentence uses Simple Present correctly. Write Correct or Incorrect and fix if wrong.', questions: [
              { q: 'She is knowing the answer.', a: 'Incorrect → She knows the answer. ("know" is a stative verb)' },
              { q: 'The train arrives at 8 PM.', a: 'Correct (scheduled event)' },
              { q: 'I am usually eating breakfast at 8.', a: 'Incorrect → I usually eat breakfast at 8. (habit = simple present)' },
            ]},
          ],
          'class10': [
            { type: 'mixed', instruction: 'Choose the correct option and explain why.', questions: [
              { q: 'Water ___ (freeze/freezes) at 0°C.', a: 'freezes — general scientific fact, subject is singular "water"' },
              { q: 'If she ___ (come/comes), tell her I left.', a: 'comes — conditional clause (if + simple present)' },
              { q: 'The team ___ (practice/practices) every evening.', a: 'practices — "team" is singular collective noun' },
            ]},
            { type: 'transform', instruction: 'Transform the sentences as directed.', questions: [
              { q: 'He does not eat meat. (Change to affirmative)', a: 'He eats meat.' },
              { q: 'Do they visit their grandparents often? (Change to assertive negative)', a: 'They do not visit their grandparents often.' },
              { q: 'She writes poems beautifully. (Change to interrogative)', a: 'Does she write poems beautifully?' },
              { q: 'Convert to passive: The teacher teaches English.', a: 'English is taught by the teacher.' },
            ]},
          ],
        },
      },
      {
        id: 'present-continuous',
        name: 'Present Continuous Tense',
        levels: {
          'class4-5': {
            definition: 'A tense used to describe actions that are happening right now, at this moment.',
            formula: 'Subject + am/is/are + V1-ing + Object',
            formulaNeg: 'Subject + am/is/are + not + V1-ing + Object',
            formulaQ: 'Am/Is/Are + Subject + V1-ing + Object?',
          },
          'class6': {
            whenToUse: [
              'For actions happening right now (She is reading a book.)',
              'For temporary situations (He is staying with his uncle this week.)',
              'For planned future actions (We are leaving tomorrow.)',
              'For changing or developing situations (The weather is getting warmer.)',
            ],
            signalWords: ['now', 'right now', 'at the moment', 'currently', 'today', 'this week', 'look!', 'listen!'],
          },
          'class8': {
            examples: [
              { aff: 'I am writing a letter now.', neg: 'I am not writing a letter now.', q: 'Am I writing a letter now?' },
              { aff: 'They are playing football in the park.', neg: 'They are not playing football in the park.', q: 'Are they playing football in the park?' },
              { aff: 'She is cooking dinner right now.', neg: 'She is not cooking dinner right now.', q: 'Is she cooking dinner right now?' },
              { aff: 'The children are watching TV.', neg: 'The children are not watching TV.', q: 'Are the children watching TV?' },
            ],
            rulesNote: 'Use am with I, is with He/She/It, and are with You/We/They. Add -ing to the base verb.',
          },
          'class9': {
            commonMistakes: [
              { wrong: 'I am knowing the answer.', correct: 'I know the answer.', explanation: '"Know" is a stative verb and is not used in continuous form.' },
              { wrong: 'She is have a car.', correct: 'She is having lunch. / She has a car.', explanation: '"Have" meaning possession is stative. "Having" is okay for activities (having lunch).' },
              { wrong: 'They are play cricket.', correct: 'They are playing cricket.', explanation: 'Always add -ing to the verb in continuous tense.' },
            ],
            advancedExamples: [
              'Look! The baby is trying to walk. (action happening at the moment of speaking)',
              'I am meeting the doctor tomorrow. (definite future arrangement)',
              'Prices are rising every month. (changing/developing trend)',
            ],
          },
          'class10': {
            detailedRules: [
              'Add -ing to most verbs: play → playing, read → reading.',
              'Verbs ending in -e: drop the -e, add -ing: make → making, write → writing.',
              'Verbs ending in consonant-vowel-consonant (CVC) with stress on last syllable: double the consonant: run → running, sit → sitting, begin → beginning.',
              'Verbs ending in -ie: change ie to -ying: die → dying, lie → lying.',
              'Verbs ending in -ee: just add -ing: see → seeing, agree → agreeing.',
            ],
            exceptions: [
              'Stative verbs NOT used in continuous: know, believe, love, hate, own, possess, belong, see (= understand), taste (= have flavour).',
              'Some verbs change meaning in continuous: "I think it\'s good" (opinion) vs. "I am thinking about it" (process).',
              '"I am loving it" is grammatically unusual but used in advertising (McDonald\'s).',
            ],
            transformations: [
              { given: 'She is singing a song. (Change to negative)', answer: 'She is not singing a song.' },
              { given: 'Are they dancing on stage? (Change to affirmative)', answer: 'They are dancing on stage.' },
              { given: 'He is writing an essay. (Change to passive)', answer: 'An essay is being written by him.' },
            ],
          },
        },
        worksheet: {
          'class4-5': [
            { type: 'fill', instruction: 'Fill in the blank with am, is, or are + verb-ing.', questions: [
              { q: 'I ___ (read) a storybook now.', a: 'am reading' },
              { q: 'She ___ (dance) on the stage.', a: 'is dancing' },
              { q: 'They ___ (eat) lunch right now.', a: 'are eating' },
              { q: 'He ___ (run) in the garden.', a: 'is running' },
              { q: 'We ___ (watch) a movie.', a: 'are watching' },
            ]},
          ],
          'class6': [
            { type: 'fill', instruction: 'Complete the sentences using Present Continuous Tense.', questions: [
              { q: 'Look! The bird ___ (fly) over the tree.', a: 'is flying' },
              { q: 'My brother ___ (study) for his exam this week.', a: 'is studying' },
              { q: 'The workers ___ (build) a new bridge.', a: 'are building' },
              { q: 'I ___ (not/sleep). I ___ (read).', a: 'am not sleeping, am reading' },
              { q: 'Listen! Someone ___ (knock) at the door.', a: 'is knocking' },
            ]},
          ],
          'class8': [
            { type: 'transform', instruction: 'Change the sentences as directed.', questions: [
              { q: 'She is painting a picture. (Negative)', a: 'She is not painting a picture.' },
              { q: 'They are not running. (Affirmative)', a: 'They are running.' },
              { q: 'Is he studying maths? (Affirmative)', a: 'He is studying maths.' },
              { q: 'We are going to the market. (Interrogative)', a: 'Are we going to the market?' },
            ]},
          ],
          'class9': [
            { type: 'correct', instruction: 'Find and correct the errors.', questions: [
              { q: 'She is knowing the truth.', a: 'She knows the truth. (know = stative verb)' },
              { q: 'I am believing in God.', a: 'I believe in God. (believe = stative verb)' },
              { q: 'He is play guitar right now.', a: 'He is playing guitar right now. (missing -ing)' },
              { q: 'They are runing fast.', a: 'They are running fast. (double n in running)' },
            ]},
          ],
          'class10': [
            { type: 'mixed', instruction: 'Choose Simple Present or Present Continuous and justify.', questions: [
              { q: 'She ___ (read) a novel these days.', a: 'is reading — temporary ongoing action (these days)' },
              { q: 'The earth ___ (revolve) around the sun.', a: 'revolves — permanent scientific fact (simple present)' },
              { q: 'Listen! Someone ___ (cry) outside.', a: 'is crying — action happening right now (listen!)' },
              { q: 'He ___ (own) two houses.', a: 'owns — stative verb (own), no continuous form' },
            ]},
          ],
        },
      },
      {
        id: 'present-perfect',
        name: 'Present Perfect Tense',
        levels: {
          'class4-5': {
            definition: 'A tense used to talk about actions that started in the past and are connected to the present, or that just happened.',
            formula: 'Subject + has/have + V3 (past participle) + Object',
            formulaNeg: 'Subject + has/have + not + V3 + Object',
            formulaQ: 'Has/Have + Subject + V3 + Object?',
          },
          'class6': {
            whenToUse: [
              'For actions completed recently (I have finished my homework.)',
              'For past actions with present results (She has lost her keys — she still can\'t find them.)',
              'With "ever", "never", "already", "yet" (Have you ever been to Paris?)',
              'For life experiences (He has visited 10 countries.)',
            ],
            signalWords: ['already', 'yet', 'just', 'ever', 'never', 'recently', 'so far', 'since', 'for', 'up to now'],
          },
          'class8': {
            examples: [
              { aff: 'I have completed my project.', neg: 'I have not completed my project.', q: 'Have you completed your project?' },
              { aff: 'She has already eaten lunch.', neg: 'She has not eaten lunch yet.', q: 'Has she eaten lunch yet?' },
              { aff: 'They have lived here for ten years.', neg: 'They have not lived here for ten years.', q: 'Have they lived here for ten years?' },
              { aff: 'He has just arrived.', neg: 'He has not arrived yet.', q: 'Has he arrived yet?' },
            ],
            rulesNote: 'Use "has" with He/She/It and "have" with I/You/We/They. The main verb must be in V3 (past participle) form.',
          },
          'class9': {
            commonMistakes: [
              { wrong: 'I have went to the market.', correct: 'I have gone to the market.', explanation: '"Went" is V2 (simple past). Present perfect requires V3: gone.' },
              { wrong: 'She has ate dinner.', correct: 'She has eaten dinner.', explanation: '"Ate" is V2. The V3 of "eat" is "eaten".' },
              { wrong: 'I have visited Paris last year.', correct: 'I visited Paris last year.', explanation: 'With a specific past time (last year), use simple past, not present perfect.' },
            ],
            advancedExamples: [
              'I have known him since childhood. (duration from past to now)',
              'She has written three books so far. (unfinished time period)',
              'We have never seen such a beautiful sunset. (life experience)',
            ],
          },
          'class10': {
            detailedRules: [
              'Present perfect links past actions to the present moment.',
              'Do NOT use with specific past time expressions: yesterday, last week, in 2020, ago. Use Simple Past instead.',
              '"Since" = a specific point in time (since 2015, since Monday). "For" = a duration (for 3 years, for two hours).',
              'Use "already" in affirmative (I have already done it). Use "yet" in negative/interrogative (I haven\'t done it yet).',
              '"Just" = very recently (She has just left). "Ever" = at any time in life (Have you ever tried sushi?).',
            ],
            exceptions: [
              'In American English, Simple Past is sometimes used where British English uses Present Perfect: "I just ate" (AmE) vs. "I have just eaten" (BrE).',
              '"Gone to" vs. "Been to": He has gone to London (he is there now). He has been to London (he visited and came back).',
            ],
            transformations: [
              { given: 'She has written a letter. (Change to negative)', answer: 'She has not written a letter.' },
              { given: 'Have they finished the project? (Change to affirmative)', answer: 'They have finished the project.' },
              { given: 'He has broken the window. (Change to passive)', answer: 'The window has been broken by him.' },
            ],
          },
        },
        worksheet: {
          'class4-5': [
            { type: 'fill', instruction: 'Fill in the blanks with has or have + past participle.', questions: [
              { q: 'I ___ (finish) my homework.', a: 'have finished' },
              { q: 'She ___ (eat) her lunch.', a: 'has eaten' },
              { q: 'They ___ (go) to school.', a: 'have gone' },
              { q: 'He ___ (write) a poem.', a: 'has written' },
              { q: 'We ___ (see) that movie.', a: 'have seen' },
            ]},
          ],
          'class6': [
            { type: 'fill', instruction: 'Complete using signal words and Present Perfect.', questions: [
              { q: 'She has ___ (already/finish) her work.', a: 'already finished' },
              { q: 'I have ___ (never/visit) Japan.', a: 'never visited' },
              { q: 'Have you ___ (ever/try) sushi?', a: 'ever tried' },
              { q: 'They haven\'t arrived ___ (yet/already).', a: 'yet' },
              { q: 'He has ___ (just/leave) the office.', a: 'just left' },
            ]},
          ],
          'class8': [
            { type: 'transform', instruction: 'Change the sentences as directed.', questions: [
              { q: 'She has read the book. (Negative)', a: 'She has not read the book.' },
              { q: 'They have not cleaned the room. (Affirmative)', a: 'They have cleaned the room.' },
              { q: 'He has submitted the form. (Interrogative)', a: 'Has he submitted the form?' },
            ]},
          ],
          'class9': [
            { type: 'choose', instruction: 'Choose Simple Past or Present Perfect and explain.', questions: [
              { q: 'I ___ (visit) Paris in 2019.', a: 'visited — specific past time (2019)' },
              { q: 'She ___ (live) here since 2015.', a: 'has lived — from past continuing to now (since)' },
              { q: 'They ___ (just/arrive).', a: 'have just arrived — very recent past connected to now' },
            ]},
          ],
          'class10': [
            { type: 'mixed', instruction: 'Complete and transform the sentences.', questions: [
              { q: 'He ___ (know) her since childhood. (Fill in)', a: 'has known' },
              { q: 'I have already posted the letter. (Change to negative)', a: 'I have not posted the letter yet.' },
              { q: 'She has completed the assignment. (Change to passive)', answer: 'The assignment has been completed by her.' },
            ]},
          ],
        },
      },
      {
        id: 'present-perfect-continuous',
        name: 'Present Perfect Continuous Tense',
        levels: {
          'class4-5': {
            definition: 'A tense used to talk about actions that started in the past and are still continuing now.',
            formula: 'Subject + has/have + been + V1-ing + Object',
            formulaNeg: 'Subject + has/have + not + been + V1-ing + Object',
            formulaQ: 'Has/Have + Subject + been + V1-ing + Object?',
          },
          'class6': {
            whenToUse: [
              'For actions that started in the past and are still going on (She has been studying for 3 hours.)',
              'To emphasize the duration of an activity (I have been waiting since 2 PM.)',
              'For recently stopped actions with visible results (He is tired because he has been running.)',
            ],
            signalWords: ['since', 'for', 'all day', 'all morning', 'how long', 'lately', 'recently'],
          },
          'class8': {
            examples: [
              { aff: 'I have been reading this book for two hours.', neg: 'I have not been reading this book for two hours.', q: 'Have you been reading this book for two hours?' },
              { aff: 'She has been working here since 2018.', neg: 'She has not been working here since 2018.', q: 'Has she been working here since 2018?' },
              { aff: 'They have been playing cricket all morning.', neg: 'They have not been playing cricket all morning.', q: 'Have they been playing cricket all morning?' },
            ],
            rulesNote: '"Since" is used for a point in time (since Monday). "For" is used for a period of time (for three days).',
          },
          'class9': {
            commonMistakes: [
              { wrong: 'I have been knowing him for years.', correct: 'I have known him for years.', explanation: '"Know" is a stative verb — use Present Perfect, not Present Perfect Continuous.' },
              { wrong: 'She has been studied all day.', correct: 'She has been studying all day.', explanation: 'After "has/have been", always use V1-ing form.' },
            ],
            advancedExamples: [
              'It has been raining since morning, so the roads are wet. (cause & visible effect)',
              'How long have you been learning English? (asking about duration)',
              'They have been building this bridge for two years. (ongoing long project)',
            ],
          },
          'class10': {
            detailedRules: [
              'Emphasizes the duration or continuity of an action from the past to now.',
              'Present Perfect: focuses on the result (I have written 5 letters). Present Perfect Continuous: focuses on the process/duration (I have been writing letters all morning).',
              'Not used with stative verbs: know, believe, love, belong, own.',
              '"Since" = point (since 1999, since June). "For" = duration (for 5 years, for an hour).',
            ],
            exceptions: [
              '"Live" and "work" can be used in either form with almost no difference: "I have lived here for 10 years" ≈ "I have been living here for 10 years."',
              'Avoid with completed countable actions: "I have written 5 letters" (not "I have been writing 5 letters").',
            ],
            transformations: [
              { given: 'She has been teaching for 20 years. (Change to interrogative)', answer: 'Has she been teaching for 20 years?' },
              { given: 'Have they been waiting long? (Change to affirmative)', answer: 'They have been waiting long.' },
            ],
          },
        },
        worksheet: {
          'class4-5': [
            { type: 'fill', instruction: 'Fill in with has/have been + verb-ing.', questions: [
              { q: 'I ___ (wait) for one hour.', a: 'have been waiting' },
              { q: 'She ___ (cook) since morning.', a: 'has been cooking' },
              { q: 'They ___ (play) for two hours.', a: 'have been playing' },
              { q: 'He ___ (study) all day.', a: 'has been studying' },
              { q: 'We ___ (travel) since yesterday.', a: 'have been travelling' },
            ]},
          ],
          'class6': [
            { type: 'fill', instruction: 'Choose since or for and complete.', questions: [
              { q: 'She has been sleeping ___ 3 hours.', a: 'for' },
              { q: 'They have been living here ___ 2010.', a: 'since' },
              { q: 'I have been studying ___ morning.', a: 'since' },
              { q: 'He has been running ___ 30 minutes.', a: 'for' },
            ]},
          ],
          'class8': [
            { type: 'transform', instruction: 'Transform the sentences.', questions: [
              { q: 'She has been dancing for an hour. (Negative)', a: 'She has not been dancing for an hour.' },
              { q: 'They have been watching TV all day. (Interrogative)', a: 'Have they been watching TV all day?' },
            ]},
          ],
          'class9': [
            { type: 'choose', instruction: 'Choose Present Perfect or Present Perfect Continuous.', questions: [
              { q: 'I ___ (read) three chapters so far.', a: 'have read — completed countable actions → Present Perfect' },
              { q: 'I ___ (read) since morning.', a: 'have been reading — ongoing action with duration → Present Perfect Continuous' },
              { q: 'She ___ (know) him for years.', a: 'has known — stative verb → Present Perfect' },
            ]},
          ],
          'class10': [
            { type: 'mixed', instruction: 'Fill in and explain the tense choice.', questions: [
              { q: 'He ___ (work) here since 2015.', a: 'has been working — ongoing work with "since" (also acceptable: has worked)' },
              { q: 'I ___ (write) five emails today.', a: 'have written — completed countable result' },
              { q: 'It ___ (rain) all week. The ground is muddy.', a: 'has been raining — continuous action with visible result' },
            ]},
          ],
        },
      },
    ],
  },
  past: {
    title: 'Past Tense',
    subtitle: 'Actions that already happened',
    icon: 'history',
    tenses: [
      {
        id: 'simple-past',
        name: 'Simple Past Tense',
        levels: {
          'class4-5': {
            definition: 'A tense used to talk about actions that happened and were completed in the past.',
            formula: 'Subject + V2 (past form) + Object',
            formulaNeg: 'Subject + did + not + V1 + Object',
            formulaQ: 'Did + Subject + V1 + Object?',
          },
          'class6': {
            whenToUse: [
              'For completed actions in the past (I visited my grandmother yesterday.)',
              'For a series of past events (He woke up, brushed his teeth, and went to school.)',
              'For past habits (She always carried an umbrella.)',
              'With specific past time words (We met last Monday.)',
            ],
            signalWords: ['yesterday', 'last week', 'last month', 'ago', 'in 2020', 'when I was young', 'at that time', 'then'],
          },
          'class8': {
            examples: [
              { aff: 'She visited the museum last Sunday.', neg: 'She did not visit the museum last Sunday.', q: 'Did she visit the museum last Sunday?' },
              { aff: 'They played football yesterday.', neg: 'They did not play football yesterday.', q: 'Did they play football yesterday?' },
              { aff: 'I ate an apple for breakfast.', neg: 'I did not eat an apple for breakfast.', q: 'Did you eat an apple for breakfast?' },
              { aff: 'He wrote a letter to his friend.', neg: 'He did not write a letter to his friend.', q: 'Did he write a letter to his friend?' },
            ],
            rulesNote: 'Regular verbs: add -ed (played, visited). Irregular verbs have special forms (go→went, eat→ate, write→wrote). In negative and question forms, use "did" + base verb.',
          },
          'class9': {
            commonMistakes: [
              { wrong: 'She did not went to school.', correct: 'She did not go to school.', explanation: 'After "did/did not", always use the base form (V1), not V2.' },
              { wrong: 'Did she wrote a letter?', correct: 'Did she write a letter?', explanation: 'After "Did", use V1 (base form), not V2.' },
              { wrong: 'I have seen him yesterday.', correct: 'I saw him yesterday.', explanation: 'With specific past time words (yesterday), use Simple Past, not Present Perfect.' },
            ],
            advancedExamples: [
              'When I was a child, I lived in a small village. (past habit/state)',
              'Columbus discovered America in 1492. (historical fact)',
              'She opened the door, looked outside, and screamed. (sequence of past actions)',
            ],
          },
          'class10': {
            detailedRules: [
              'Regular verbs: add -ed (walk→walked, jump→jumped).',
              'Verbs ending in -e: add -d only (live→lived, hope→hoped).',
              'Verbs ending in consonant+y: change y to -ied (study→studied, carry→carried).',
              'CVC verbs (short, stressed): double the last consonant + -ed (stop→stopped, plan→planned).',
              'Irregular verbs must be memorized: go→went, see→saw, buy→bought, take→took, know→knew.',
            ],
            exceptions: [
              '"Used to" for past habits no longer true: "I used to play cricket" (I don\'t anymore).',
              '"Would" for repeated past actions: "Every summer, we would go to the hills."',
              'Past tense of "be": was (I/He/She/It), were (You/We/They). Special: "If I were you..." (subjunctive mood).',
            ],
            transformations: [
              { given: 'He played cricket yesterday. (Change to negative)', answer: 'He did not play cricket yesterday.' },
              { given: 'Did they visit the zoo? (Change to affirmative)', answer: 'They visited the zoo.' },
              { given: 'She wrote a beautiful poem. (Change to passive)', answer: 'A beautiful poem was written by her.' },
            ],
          },
        },
        worksheet: {
          'class4-5': [
            { type: 'fill', instruction: 'Fill in the blanks with the past form of the verb.', questions: [
              { q: 'I ___ (play) in the park yesterday.', a: 'played' },
              { q: 'She ___ (cook) dinner last night.', a: 'cooked' },
              { q: 'He ___ (go) to school.', a: 'went' },
              { q: 'We ___ (see) a movie.', a: 'saw' },
              { q: 'They ___ (eat) ice cream.', a: 'ate' },
            ]},
          ],
          'class6': [
            { type: 'fill', instruction: 'Use the correct past tense form.', questions: [
              { q: 'The train ___ (leave) at 9 PM last night.', a: 'left' },
              { q: 'She ___ (study) for three hours yesterday.', a: 'studied' },
              { q: 'My father ___ (buy) a new car last month.', a: 'bought' },
              { q: 'We ___ (not/go) to the party.', a: 'did not go' },
              { q: '___ you ___ (finish) your project?', a: 'Did, finish' },
            ]},
          ],
          'class8': [
            { type: 'transform', instruction: 'Transform the sentences.', questions: [
              { q: 'She ate breakfast. (Negative)', a: 'She did not eat breakfast.' },
              { q: 'They did not come to class. (Affirmative)', a: 'They came to class.' },
              { q: 'He visited London last year. (Interrogative)', a: 'Did he visit London last year?' },
            ]},
          ],
          'class9': [
            { type: 'paragraph', instruction: 'Fill in the blanks with Simple Past.', questions: [
              { q: 'Last summer, we ___ (go) to Shimla. We ___ (stay) there for a week. The weather ___ (be) lovely. We ___ (visit) the Mall Road and ___ (buy) many souvenirs. My brother ___ (take) many photographs. It ___ (be) a wonderful trip.', a: 'went, stayed, was, visited, bought, took, was' },
            ]},
          ],
          'class10': [
            { type: 'mixed', instruction: 'Choose Simple Past, Present Perfect, or Past Continuous.', questions: [
              { q: 'I ___ (see) that film three times. (life experience)', a: 'have seen — unspecified past, life experience' },
              { q: 'We ___ (watch) TV when the lights ___ (go) out.', a: 'were watching, went — ongoing + interrupting action' },
              { q: 'She ___ (leave) for Delhi yesterday.', a: 'left — specific past time (yesterday)' },
            ]},
          ],
        },
      },
      {
        id: 'past-continuous',
        name: 'Past Continuous Tense',
        levels: {
          'class4-5': {
            definition: 'A tense used to describe actions that were happening at a specific time in the past.',
            formula: 'Subject + was/were + V1-ing + Object',
            formulaNeg: 'Subject + was/were + not + V1-ing + Object',
            formulaQ: 'Was/Were + Subject + V1-ing + Object?',
          },
          'class6': {
            whenToUse: [
              'For an action that was in progress at a specific past time (I was studying at 8 PM last night.)',
              'For two actions happening at the same time (She was reading while he was cooking.)',
              'For an ongoing action interrupted by another (I was sleeping when the phone rang.)',
              'To set a scene in a story (The birds were singing. The sun was shining.)',
            ],
            signalWords: ['while', 'when', 'at that time', 'all day yesterday', 'at 5 PM yesterday', 'as'],
          },
          'class8': {
            examples: [
              { aff: 'She was reading a novel at 9 PM.', neg: 'She was not reading a novel at 9 PM.', q: 'Was she reading a novel at 9 PM?' },
              { aff: 'They were playing when it started raining.', neg: 'They were not playing when it started raining.', q: 'Were they playing when it started raining?' },
              { aff: 'I was cooking while my sister was studying.', neg: 'I was not cooking while my sister was studying.', q: 'Were you cooking while your sister was studying?' },
            ],
            rulesNote: 'Use "was" with I/He/She/It and "were" with You/We/They. "When" = interrupting short action (simple past). "While" = ongoing action (past continuous).',
          },
          'class9': {
            commonMistakes: [
              { wrong: 'I was know the answer.', correct: 'I knew the answer.', explanation: '"Know" is a stative verb — not used in continuous form.' },
              { wrong: 'When I was sleeping, I was hearing a noise.', correct: 'When I was sleeping, I heard a noise.', explanation: 'The interrupting action uses simple past, not continuous.' },
            ],
            advancedExamples: [
              'At 7 AM yesterday, the sun was rising and the birds were chirping. (scene-setting)',
              'I was walking to school when I met an old friend. (ongoing + interrupted)',
              'While he was driving, it started to snow. (simultaneous actions)',
            ],
          },
          'class10': {
            detailedRules: [
              '"When" + Simple Past, Past Continuous → interrupted ongoing action: "I was eating when the bell rang."',
              '"While" + Past Continuous, Past Continuous → two simultaneous actions: "While I was cooking, she was cleaning."',
              'Not used with stative verbs (know, believe, own, etc.).',
              'Repeated/annoying past habit with "always": "He was always forgetting his homework."',
            ],
            exceptions: [
              'Two short completed past actions in sequence use Simple Past: "I opened the door and walked in." (NOT "I was opening...")',
              '"Was/were going to" = past intention: "I was going to call you but I forgot."',
            ],
            transformations: [
              { given: 'They were watching TV. (Change to negative)', answer: 'They were not watching TV.' },
              { given: 'Was she singing on stage? (Change to affirmative)', answer: 'She was singing on stage.' },
              { given: 'He was writing a letter. (Change to passive)', answer: 'A letter was being written by him.' },
            ],
          },
        },
        worksheet: {
          'class4-5': [
            { type: 'fill', instruction: 'Fill in with was or were + verb-ing.', questions: [
              { q: 'I ___ (sleep) at 10 PM.', a: 'was sleeping' },
              { q: 'They ___ (play) outside.', a: 'were playing' },
              { q: 'She ___ (sing) a song.', a: 'was singing' },
              { q: 'We ___ (eat) dinner.', a: 'were eating' },
              { q: 'He ___ (run) in the field.', a: 'was running' },
            ]},
          ],
          'class6': [
            { type: 'fill', instruction: 'Complete with when or while.', questions: [
              { q: 'I was reading ___ my mother called me.', a: 'when' },
              { q: '___ she was studying, her brother was playing.', a: 'While' },
              { q: 'The phone rang ___ I was taking a shower.', a: 'when/while' },
              { q: '___ we were walking, it started raining.', a: 'While' },
            ]},
          ],
          'class8': [
            { type: 'combine', instruction: 'Combine using when or while.', questions: [
              { q: 'I / sleep. The alarm / ring.', a: 'I was sleeping when the alarm rang.' },
              { q: 'She / cook. He / watch TV.', a: 'She was cooking while he was watching TV.' },
              { q: 'They / play. It / start raining.', a: 'They were playing when it started raining.' },
            ]},
          ],
          'class9': [
            { type: 'paragraph', instruction: 'Fill in using Past Continuous or Simple Past.', questions: [
              { q: 'Yesterday evening, I ___ (sit) in the garden. The sun ___ (set) and the birds ___ (sing). Suddenly, my dog ___ (bark) loudly. I ___ (look) around and ___ (see) a cat on the wall.', a: 'was sitting, was setting, were singing, barked, looked, saw' },
            ]},
          ],
          'class10': [
            { type: 'mixed', instruction: 'Choose the correct tense form.', questions: [
              { q: 'While she ___ (read), the lights ___ (go) off.', a: 'was reading, went' },
              { q: 'At 6 PM yesterday, I ___ (travel) to Mumbai.', a: 'was travelling' },
              { q: 'She ___ (always/complain) about the food. (habitual annoyance)', a: 'was always complaining' },
            ]},
          ],
        },
      },
      {
        id: 'past-perfect',
        name: 'Past Perfect Tense',
        levels: {
          'class4-5': {
            definition: 'A tense used to talk about an action that was completed before another action in the past.',
            formula: 'Subject + had + V3 (past participle) + Object',
            formulaNeg: 'Subject + had + not + V3 + Object',
            formulaQ: 'Had + Subject + V3 + Object?',
          },
          'class6': {
            whenToUse: [
              'To show which action happened first among two past events (The train had left before I reached the station.)',
              'With "before", "after", "by the time", "when" (By the time we arrived, the show had started.)',
              'To report something someone said earlier (She said she had finished her homework.)',
            ],
            signalWords: ['before', 'after', 'by the time', 'already', 'when', 'until', 'as soon as', 'never...before'],
          },
          'class8': {
            examples: [
              { aff: 'She had finished her homework before dinner.', neg: 'She had not finished her homework before dinner.', q: 'Had she finished her homework before dinner?' },
              { aff: 'The train had already left when we reached.', neg: 'The train had not left when we reached.', q: 'Had the train left when you reached?' },
              { aff: 'I had never seen snow before that trip.', neg: 'I had not seen snow before that trip.', q: 'Had you ever seen snow before that trip?' },
            ],
            rulesNote: '"Had" is the same for all subjects (I/He/She/They). The earlier action uses Past Perfect, the later action uses Simple Past.',
          },
          'class9': {
            commonMistakes: [
              { wrong: 'After he had ate, he left.', correct: 'After he had eaten, he left.', explanation: '"Ate" is V2. Past Perfect requires V3: eaten.' },
              { wrong: 'I had went to the store before it closed.', correct: 'I had gone to the store before it closed.', explanation: '"Went" is V2. V3 of go is "gone".' },
            ],
            advancedExamples: [
              'By the time the ambulance arrived, the patient had already died. (earlier completed action)',
              'She told me that she had already submitted the assignment. (reported speech)',
              'If I had known about the sale, I would have gone shopping. (third conditional — hypothetical past)',
            ],
          },
          'class10': {
            detailedRules: [
              'Past Perfect = "past of the past." It shows the earlier of two past actions.',
              'Structure: Earlier action → Past Perfect (had + V3). Later action → Simple Past.',
              'Used in reported speech to shift present perfect: "I have done it" → She said she had done it.',
              'Used in third conditional: "If I had studied harder, I would have passed."',
            ],
            exceptions: [
              'If the sequence is clear from "before/after", Simple Past can sometimes replace Past Perfect: "I left after the movie ended" is also acceptable.',
              'Do not overuse: if only one past action is mentioned, Simple Past is enough.',
            ],
            transformations: [
              { given: 'She had cooked dinner before the guests arrived. (Change to negative)', answer: 'She had not cooked dinner before the guests arrived.' },
              { given: 'Had they completed the project by Friday? (Change to affirmative)', answer: 'They had completed the project by Friday.' },
              { given: 'I ate lunch. Then I went out. (Combine using after + past perfect)', answer: 'After I had eaten lunch, I went out.' },
            ],
          },
        },
        worksheet: {
          'class4-5': [
            { type: 'fill', instruction: 'Fill in with had + past participle.', questions: [
              { q: 'I ___ (eat) before she came.', a: 'had eaten' },
              { q: 'She ___ (go) before the rain started.', a: 'had gone' },
              { q: 'They ___ (finish) the test before the bell rang.', a: 'had finished' },
              { q: 'He ___ (sleep) before I called.', a: 'had slept' },
            ]},
          ],
          'class6': [
            { type: 'fill', instruction: 'Complete with before, after, or by the time.', questions: [
              { q: '___ I reached the station, the train had left.', a: 'By the time' },
              { q: 'She left ___ she had finished her work.', a: 'after' },
              { q: 'He had already eaten ___ I arrived.', a: 'before' },
            ]},
          ],
          'class8': [
            { type: 'combine', instruction: 'Combine using Past Perfect + Simple Past.', questions: [
              { q: 'She finished cooking. Then the guests arrived.', a: 'She had finished cooking before the guests arrived.' },
              { q: 'He left the office. Then his boss called.', a: 'He had left the office before his boss called.' },
              { q: 'I completed my homework. Then I watched TV.', a: 'After I had completed my homework, I watched TV.' },
            ]},
          ],
          'class9': [
            { type: 'reported', instruction: 'Change to reported speech using Past Perfect.', questions: [
              { q: 'He said, "I have seen this film."', a: 'He said that he had seen that film.' },
              { q: 'She said, "I have finished my project."', a: 'She said that she had finished her project.' },
            ]},
          ],
          'class10': [
            { type: 'mixed', instruction: 'Fill in with the correct tense (Simple Past / Past Perfect).', questions: [
              { q: 'By the time we ___ (reach), the movie ___ (already/start).', a: 'reached, had already started' },
              { q: 'She ___ (tell) me that she ___ (never/visit) a hill station.', a: 'told, had never visited' },
              { q: 'If he ___ (study) harder, he ___ (pass) the exam. (third conditional)', a: 'had studied, would have passed' },
            ]},
          ],
        },
      },
      {
        id: 'past-perfect-continuous',
        name: 'Past Perfect Continuous Tense',
        levels: {
          'class4-5': {
            definition: 'A tense used to talk about an action that was continuing for some time before another past action happened.',
            formula: 'Subject + had + been + V1-ing + Object',
            formulaNeg: 'Subject + had + not + been + V1-ing + Object',
            formulaQ: 'Had + Subject + been + V1-ing + Object?',
          },
          'class6': {
            whenToUse: [
              'To show that an action had been going on for some time before another past action (I had been waiting for an hour when she finally arrived.)',
              'To explain the cause of a past result (He was tired because he had been running.)',
            ],
            signalWords: ['for', 'since', 'before', 'when', 'by the time', 'all day', 'how long'],
          },
          'class8': {
            examples: [
              { aff: 'She had been studying for three hours before the exam.', neg: 'She had not been studying for three hours before the exam.', q: 'Had she been studying for three hours before the exam?' },
              { aff: 'They had been playing cricket when it started raining.', neg: 'They had not been playing cricket when it started raining.', q: 'Had they been playing cricket when it started raining?' },
            ],
            rulesNote: 'This tense emphasizes the duration of the earlier action before the second past event.',
          },
          'class9': {
            commonMistakes: [
              { wrong: 'I had been knew him for years before we became friends.', correct: 'I had known him for years before we became friends.', explanation: '"Know" is stative — use Past Perfect, not Past Perfect Continuous.' },
            ],
            advancedExamples: [
              'The ground was wet because it had been raining all night. (past cause → past result)',
              'By the time the teacher came, the students had been waiting for 30 minutes. (duration before a past event)',
            ],
          },
          'class10': {
            detailedRules: [
              'Focuses on the duration or continuity of an action that was happening before another past event.',
              'Past Perfect Continuous = "I had been doing" vs Past Perfect = "I had done" — continuous version emphasizes process/duration.',
              'Not used with stative verbs (know, believe, love, etc.).',
            ],
            exceptions: [
              'If the duration is not important, Past Perfect is preferred: "I had finished the project" (not "I had been finishing...").',
            ],
            transformations: [
              { given: 'She had been reading for two hours when the lights went off. (Change to negative)', answer: 'She had not been reading for two hours when the lights went off.' },
              { given: 'Had they been practising before the tournament? (Change to affirmative)', answer: 'They had been practising before the tournament.' },
            ],
          },
        },
        worksheet: {
          'class4-5': [
            { type: 'fill', instruction: 'Fill in with had been + verb-ing.', questions: [
              { q: 'I ___ (wait) for an hour before the bus came.', a: 'had been waiting' },
              { q: 'She ___ (read) when the phone rang.', a: 'had been reading' },
              { q: 'They ___ (play) since morning.', a: 'had been playing' },
            ]},
          ],
          'class6': [
            { type: 'fill', instruction: 'Complete with the correct form.', questions: [
              { q: 'He was tired because he ___ (run) all morning.', a: 'had been running' },
              { q: 'By the time she arrived, I ___ (cook) for two hours.', a: 'had been cooking' },
            ]},
          ],
          'class8': [
            { type: 'transform', instruction: 'Change as directed.', questions: [
              { q: 'He had been sleeping for hours when the alarm rang. (Negative)', a: 'He had not been sleeping for hours when the alarm rang.' },
              { q: 'Had she been working late? (Affirmative)', a: 'She had been working late.' },
            ]},
          ],
          'class9': [
            { type: 'choose', instruction: 'Choose Past Perfect or Past Perfect Continuous.', questions: [
              { q: 'She ___ (teach) for 10 years before she retired.', a: 'had been teaching — emphasis on duration (for 10 years)' },
              { q: 'He ___ (already/leave) when I called.', a: 'had already left — completed action, not duration' },
            ]},
          ],
          'class10': [
            { type: 'mixed', instruction: 'Fill in and justify your choice.', questions: [
              { q: 'The roads were flooded because it ___ (rain) for hours.', a: 'had been raining — cause of past result, emphasis on duration' },
              { q: 'By 2020, she ___ (work) at the company for 15 years.', a: 'had been working — duration up to a past point' },
            ]},
          ],
        },
      },
    ],
  },
  future: {
    title: 'Future Tense',
    subtitle: 'Actions that will happen later',
    icon: 'rocket',
    tenses: [
      {
        id: 'simple-future',
        name: 'Simple Future Tense',
        levels: {
          'class4-5': {
            definition: 'A tense used to talk about actions that will happen in the future.',
            formula: 'Subject + will/shall + V1 + Object',
            formulaNeg: 'Subject + will/shall + not + V1 + Object',
            formulaQ: 'Will/Shall + Subject + V1 + Object?',
          },
          'class6': {
            whenToUse: [
              'For predictions (It will rain tomorrow.)',
              'For promises (I will help you with your project.)',
              'For spontaneous decisions (I\'m hungry. I will order pizza.)',
              'For offers and requests (Will you close the window?)',
            ],
            signalWords: ['tomorrow', 'next week', 'next year', 'soon', 'in the future', 'later', 'someday'],
          },
          'class8': {
            examples: [
              { aff: 'She will go to the market tomorrow.', neg: 'She will not go to the market tomorrow.', q: 'Will she go to the market tomorrow?' },
              { aff: 'They will finish the project by Friday.', neg: 'They will not finish the project by Friday.', q: 'Will they finish the project by Friday?' },
              { aff: 'I shall help you with your homework.', neg: 'I shall not help you with your homework.', q: 'Shall I help you with your homework?' },
            ],
            rulesNote: '"Will" can be used with all subjects. "Shall" is traditionally used with I/We (formal/offers). Short forms: will not = won\'t, shall not = shan\'t.',
          },
          'class9': {
            commonMistakes: [
              { wrong: 'I will going to school tomorrow.', correct: 'I will go to school tomorrow.', explanation: 'After "will", use the base form (V1), not V1-ing.' },
              { wrong: 'She will comes tomorrow.', correct: 'She will come tomorrow.', explanation: 'After "will", always use the base form — no -s/-es.' },
            ],
            advancedExamples: [
              '"Will" for predictions: Scientists believe the earth will get warmer.',
              '"Shall" for offers/suggestions: Shall we begin? Shall I carry your bag?',
              '"Will" for promises: I will never forget you.',
              '"Going to" for planned actions: I am going to visit my uncle this weekend. (already decided)',
            ],
          },
          'class10': {
            detailedRules: [
              '"Will" = spontaneous decision, prediction, promise. "Going to" = pre-planned action, evidence-based prediction.',
              'Example: "Look at those clouds! It is going to rain." (evidence-based) vs. "I think it will rain." (opinion-based).',
              '"Shall" is mostly used in questions with I/We for suggestions: "Shall we dance?"',
              'In modern English, "will" is used for all subjects. "Shall" is considered formal/old-fashioned.',
            ],
            exceptions: [
              'First conditional: "If it rains, I will stay home." (If + present → will + V1)',
              '"Will" is not used after "when/while/before/after/until/as soon as" in time clauses: "I will call you when I arrive" (NOT "when I will arrive").',
            ],
            transformations: [
              { given: 'She will buy a new car. (Change to negative)', answer: 'She will not buy a new car.' },
              { given: 'Will they attend the meeting? (Change to affirmative)', answer: 'They will attend the meeting.' },
              { given: 'He will write the report. (Change to passive)', answer: 'The report will be written by him.' },
            ],
          },
        },
        worksheet: {
          'class4-5': [
            { type: 'fill', instruction: 'Fill in with will + verb.', questions: [
              { q: 'I ___ (go) to school tomorrow.', a: 'will go' },
              { q: 'She ___ (sing) a song at the party.', a: 'will sing' },
              { q: 'They ___ (play) football next Sunday.', a: 'will play' },
              { q: 'We ___ (eat) dinner later.', a: 'will eat' },
              { q: 'He ___ (come) home soon.', a: 'will come' },
            ]},
          ],
          'class6': [
            { type: 'fill', instruction: 'Complete with will or shall.', questions: [
              { q: '___ I open the window? (offer)', a: 'Shall' },
              { q: 'She ___ help you with the homework. (promise)', a: 'will' },
              { q: '___ we go for a walk? (suggestion)', a: 'Shall' },
              { q: 'It ___ be sunny tomorrow. (prediction)', a: 'will' },
            ]},
          ],
          'class8': [
            { type: 'transform', instruction: 'Change the sentences.', questions: [
              { q: 'She will visit her grandmother. (Negative)', a: 'She will not visit her grandmother.' },
              { q: 'They will not come to the party. (Affirmative)', a: 'They will come to the party.' },
              { q: 'He will write a book. (Interrogative)', a: 'Will he write a book?' },
            ]},
          ],
          'class9': [
            { type: 'choose', instruction: 'Choose will or going to.', questions: [
              { q: 'Look at those dark clouds! It ___ rain. (evidence)', a: 'is going to — evidence-based prediction' },
              { q: 'I think India ___ win the match. (opinion)', a: 'will — opinion-based prediction' },
              { q: 'I ___ start yoga from next Monday. (already planned)', a: 'am going to — pre-planned decision' },
            ]},
          ],
          'class10': [
            { type: 'mixed', instruction: 'Fill in and explain.', questions: [
              { q: 'If it ___ (rain), we ___ (stay) indoors.', a: 'rains, will stay — first conditional (if + present, will + V1)' },
              { q: 'I ___ (call) you when I ___ (arrive).', a: 'will call, arrive — "when" takes present tense, not will' },
              { q: 'She ___ (travel) to Paris next month. She has already booked tickets.', a: 'is going to travel — pre-planned with evidence' },
            ]},
          ],
        },
      },
      {
        id: 'future-continuous',
        name: 'Future Continuous Tense',
        levels: {
          'class4-5': {
            definition: 'A tense used to talk about actions that will be happening at a specific time in the future.',
            formula: 'Subject + will be + V1-ing + Object',
            formulaNeg: 'Subject + will + not + be + V1-ing + Object',
            formulaQ: 'Will + Subject + be + V1-ing + Object?',
          },
          'class6': {
            whenToUse: [
              'For actions that will be in progress at a specific future time (At 8 PM tomorrow, I will be studying.)',
              'For planned future activities (She will be travelling next week.)',
              'For polite enquiries (Will you be coming to the party?)',
            ],
            signalWords: ['at this time tomorrow', 'at 5 PM', 'next week', 'tomorrow morning', 'by then', 'this time next year'],
          },
          'class8': {
            examples: [
              { aff: 'I will be studying at 9 PM tonight.', neg: 'I will not be studying at 9 PM tonight.', q: 'Will you be studying at 9 PM tonight?' },
              { aff: 'She will be travelling to Delhi tomorrow.', neg: 'She will not be travelling to Delhi tomorrow.', q: 'Will she be travelling to Delhi tomorrow?' },
              { aff: 'They will be attending the conference next Monday.', neg: 'They will not be attending the conference next Monday.', q: 'Will they be attending the conference next Monday?' },
            ],
            rulesNote: 'This tense pictures an action as ongoing at a future moment. It combines "will" + "be" + V1-ing.',
          },
          'class9': {
            commonMistakes: [
              { wrong: 'I will be study tomorrow.', correct: 'I will be studying tomorrow.', explanation: 'After "will be", always use V1-ing form.' },
            ],
            advancedExamples: [
              'This time next year, I will be attending college. (imagining future)',
              'Don\'t call at 3 PM. I will be having a meeting. (pre-arranged future activity)',
              'Will you be using the car tomorrow? I need it. (polite enquiry)',
            ],
          },
          'class10': {
            detailedRules: [
              'Shows an action in progress at a specific future time.',
              'Also used for future events that are part of a routine or expected course.',
              'Difference: "I will write" (decision/promise) vs. "I will be writing" (activity in progress at that time).',
            ],
            exceptions: [
              'Stative verbs are usually not used in this form.',
            ],
            transformations: [
              { given: 'She will be working at 6 PM. (Change to negative)', answer: 'She will not be working at 6 PM.' },
              { given: 'Will they be waiting for us? (Change to affirmative)', answer: 'They will be waiting for us.' },
            ],
          },
        },
        worksheet: {
          'class4-5': [
            { type: 'fill', instruction: 'Fill in with will be + verb-ing.', questions: [
              { q: 'I ___ (sleep) at 11 PM tonight.', a: 'will be sleeping' },
              { q: 'She ___ (dance) at the show tomorrow.', a: 'will be dancing' },
              { q: 'They ___ (play) cricket this time tomorrow.', a: 'will be playing' },
            ]},
          ],
          'class6': [
            { type: 'fill', instruction: 'What will they be doing? Complete.', questions: [
              { q: 'At 7 AM tomorrow, the birds ___ (sing).', a: 'will be singing' },
              { q: 'This time next week, we ___ (travel) to Goa.', a: 'will be travelling' },
              { q: 'At noon, she ___ (cook) lunch.', a: 'will be cooking' },
            ]},
          ],
          'class8': [
            { type: 'transform', instruction: 'Change as directed.', questions: [
              { q: 'She will be reading at 9 PM. (Negative)', a: 'She will not be reading at 9 PM.' },
              { q: 'Will he be studying tomorrow? (Affirmative)', a: 'He will be studying tomorrow.' },
            ]},
          ],
          'class9': [
            { type: 'choose', instruction: 'Choose Simple Future or Future Continuous.', questions: [
              { q: 'I ___ (help) you with your project. (promise)', a: 'will help — promise/decision (Simple Future)' },
              { q: 'At 5 PM, she ___ (attend) a meeting. (ongoing at future time)', a: 'will be attending — in progress at specific future time' },
            ]},
          ],
          'class10': [
            { type: 'mixed', instruction: 'Fill in with the appropriate future form.', questions: [
              { q: 'Don\'t call me at 8 PM. I ___ (have) dinner.', a: 'will be having' },
              { q: 'This time tomorrow, the plane ___ (fly) over the ocean.', a: 'will be flying' },
            ]},
          ],
        },
      },
      {
        id: 'future-perfect',
        name: 'Future Perfect Tense',
        levels: {
          'class4-5': {
            definition: 'A tense used to talk about actions that will be completed before a certain time in the future.',
            formula: 'Subject + will have + V3 (past participle) + Object',
            formulaNeg: 'Subject + will + not + have + V3 + Object',
            formulaQ: 'Will + Subject + have + V3 + Object?',
          },
          'class6': {
            whenToUse: [
              'For actions that will be finished before a deadline (I will have completed the project by Friday.)',
              'To predict something completed by a future point (By 2030, they will have built the new airport.)',
            ],
            signalWords: ['by tomorrow', 'by next week', 'by the time', 'before', 'by 2030', 'by then'],
          },
          'class8': {
            examples: [
              { aff: 'She will have finished the book by tomorrow.', neg: 'She will not have finished the book by tomorrow.', q: 'Will she have finished the book by tomorrow?' },
              { aff: 'By next year, I will have graduated.', neg: 'By next year, I will not have graduated.', q: 'Will you have graduated by next year?' },
            ],
            rulesNote: 'This tense looks ahead to a future moment and talks about what will already be done by then.',
          },
          'class9': {
            commonMistakes: [
              { wrong: 'By next week, she will finished the work.', correct: 'By next week, she will have finished the work.', explanation: 'Future Perfect requires "will have + V3".' },
            ],
            advancedExamples: [
              'By the time you arrive, I will have cooked dinner. (completed before another future event)',
              'By 2050, scientists will have discovered new planets. (prediction about completion)',
            ],
          },
          'class10': {
            detailedRules: [
              'Shows an action completed before a certain future time or event.',
              'Structure: "By" + future time, Subject + will have + V3.',
              '"By the time" + present tense, Subject + will have + V3.',
            ],
            exceptions: [
              '"By the time he arrives, we will have left." — note: "arrives" is in present tense (not "will arrive").',
            ],
            transformations: [
              { given: 'They will have submitted the report by Monday. (Change to negative)', answer: 'They will not have submitted the report by Monday.' },
              { given: 'Will she have completed the course by December? (Change to affirmative)', answer: 'She will have completed the course by December.' },
            ],
          },
        },
        worksheet: {
          'class4-5': [
            { type: 'fill', instruction: 'Fill in with will have + past participle.', questions: [
              { q: 'I ___ (finish) my work by 5 PM.', a: 'will have finished' },
              { q: 'She ___ (eat) lunch by noon.', a: 'will have eaten' },
              { q: 'They ___ (leave) by then.', a: 'will have left' },
            ]},
          ],
          'class6': [
            { type: 'fill', instruction: 'Complete the sentences.', questions: [
              { q: 'By next month, he ___ (save) enough money.', a: 'will have saved' },
              { q: 'By the time you call, I ___ (already/sleep).', a: 'will have already slept' },
            ]},
          ],
          'class8': [
            { type: 'transform', instruction: 'Change as directed.', questions: [
              { q: 'She will have read the book by then. (Negative)', a: 'She will not have read the book by then.' },
              { q: 'Will they have arrived by 6 PM? (Affirmative)', a: 'They will have arrived by 6 PM.' },
            ]},
          ],
          'class9': [
            { type: 'fill', instruction: 'Complete using Future Perfect.', questions: [
              { q: 'By the time the guests come, she ___ (decorate) the hall.', a: 'will have decorated' },
              { q: 'By 2030, India ___ (launch) many more satellites.', a: 'will have launched' },
            ]},
          ],
          'class10': [
            { type: 'mixed', instruction: 'Choose the correct future form.', questions: [
              { q: 'By tomorrow, I ___ (complete) the assignment.', a: 'will have completed — action done before a future deadline' },
              { q: 'At this time tomorrow, she ___ (travel) to Jaipur.', a: 'will be travelling — in progress at a future moment (Future Continuous)' },
            ]},
          ],
        },
      },
      {
        id: 'future-perfect-continuous',
        name: 'Future Perfect Continuous Tense',
        levels: {
          'class4-5': {
            definition: 'A tense used to talk about actions that will have been continuing for some time before a point in the future.',
            formula: 'Subject + will have been + V1-ing + Object',
            formulaNeg: 'Subject + will + not + have been + V1-ing + Object',
            formulaQ: 'Will + Subject + have been + V1-ing + Object?',
          },
          'class6': {
            whenToUse: [
              'To show the duration of an ongoing activity up to a future point (By next June, I will have been learning English for 5 years.)',
              'To emphasize how long something will have continued (By 8 PM, she will have been cooking for 3 hours.)',
            ],
            signalWords: ['by', 'by the time', 'for', 'since', 'by next year', 'by then'],
          },
          'class8': {
            examples: [
              { aff: 'By December, she will have been working here for 10 years.', neg: 'By December, she will not have been working here for 10 years.', q: 'Will she have been working here for 10 years by December?' },
              { aff: 'By 6 PM, I will have been studying for four hours.', neg: 'By 6 PM, I will not have been studying for four hours.', q: 'Will you have been studying for four hours by 6 PM?' },
            ],
            rulesNote: 'This is the most complex tense. It emphasizes the duration of an ongoing action up to a certain future time.',
          },
          'class9': {
            commonMistakes: [
              { wrong: 'By 2025, she will been teaching for 20 years.', correct: 'By 2025, she will have been teaching for 20 years.', explanation: 'The structure is "will have been + V1-ing" — don\'t skip "have".' },
            ],
            advancedExamples: [
              'By the time he retires, he will have been working for 40 years.',
              'Next month, I will have been living in this city for a decade.',
            ],
          },
          'class10': {
            detailedRules: [
              'Emphasizes the ongoing duration of an activity up to a specific future point.',
              'Future Perfect: focuses on completion. Future Perfect Continuous: focuses on duration/process.',
              'Not used with stative verbs.',
              '"By next year, I will have been studying here for 3 years." — focuses on the 3-year duration.',
            ],
            exceptions: [
              'This tense is rarely used in everyday conversation. It\'s more common in formal or written English.',
              'If duration is not important, Future Perfect is preferred.',
            ],
            transformations: [
              { given: 'They will have been travelling for 12 hours by then. (Change to negative)', answer: 'They will not have been travelling for 12 hours by then.' },
              { given: 'Will she have been teaching for 25 years by 2030? (Change to affirmative)', answer: 'She will have been teaching for 25 years by 2030.' },
            ],
          },
        },
        worksheet: {
          'class4-5': [
            { type: 'fill', instruction: 'Fill in with will have been + verb-ing.', questions: [
              { q: 'By 6 PM, I ___ (wait) for 2 hours.', a: 'will have been waiting' },
              { q: 'She ___ (teach) for 10 years by next month.', a: 'will have been teaching' },
            ]},
          ],
          'class6': [
            { type: 'fill', instruction: 'Complete the sentences.', questions: [
              { q: 'By next year, they ___ (live) here for 5 years.', a: 'will have been living' },
              { q: 'By evening, he ___ (study) for 6 hours.', a: 'will have been studying' },
            ]},
          ],
          'class8': [
            { type: 'transform', instruction: 'Transform the sentences.', questions: [
              { q: 'She will have been working for 8 hours by 5 PM. (Negative)', a: 'She will not have been working for 8 hours by 5 PM.' },
              { q: 'Will they have been waiting long? (Affirmative)', a: 'They will have been waiting long.' },
            ]},
          ],
          'class9': [
            { type: 'fill', instruction: 'Use Future Perfect Continuous.', questions: [
              { q: 'By the time the match ends, they ___ (play) for 5 hours.', a: 'will have been playing' },
            ]},
          ],
          'class10': [
            { type: 'mixed', instruction: 'Choose Future Perfect or Future Perfect Continuous.', questions: [
              { q: 'By next month, I ___ (read) this book. (completion)', a: 'will have read — focus on completion (Future Perfect)' },
              { q: 'By next month, I ___ (read) this book for 3 weeks. (duration)', a: 'will have been reading — focus on duration (Future Perfect Continuous)' },
            ]},
          ],
        },
      },
    ],
  },
};


// ============================================================
// RENDERING ENGINE
// ============================================================

function getContentForLevel(tenseData, level) {
  const levels = tenseData.levels;
  const allLevelIds = ['class4-5', 'class6', 'class8', 'class9', 'class10'];
  const levelIndex = allLevelIds.indexOf(level);
  
  let accumulated = {};
  for (let i = 0; i <= levelIndex; i++) {
    const lvl = allLevelIds[i];
    if (levels[lvl]) {
      accumulated = { ...accumulated, ...levels[lvl] };
    }
  }
  return accumulated;
}

function getWorksheetForLevel(tenseData, level) {
  const allLevelIds = ['class4-5', 'class6', 'class8', 'class9', 'class10'];
  const levelIndex = allLevelIds.indexOf(level);
  
  let allSections = [];
  for (let i = 0; i <= levelIndex; i++) {
    const lvl = allLevelIds[i];
    if (tenseData.worksheet[lvl]) {
      allSections = allSections.concat(tenseData.worksheet[lvl]);
    }
  }
  return allSections;
}

// --- Render: Class Level Selector ---
function renderClassSelector() {
  const container = document.getElementById('class-selector');
  if (!container) return;

  container.innerHTML = CLASS_LEVELS.map(cl => {
    const isActive = selectedClassLevel === cl.id;
    const colorMap = {
      emerald: { active: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30', inactive: 'bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-600 dark:hover:text-emerald-400' },
      blue: { active: 'bg-blue-500 text-white shadow-lg shadow-blue-500/30', inactive: 'bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:text-blue-600 dark:hover:text-blue-400' },
      violet: { active: 'bg-violet-500 text-white shadow-lg shadow-violet-500/30', inactive: 'bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-violet-50 dark:hover:bg-violet-950/20 hover:text-violet-600 dark:hover:text-violet-400' },
      amber: { active: 'bg-amber-500 text-white shadow-lg shadow-amber-500/30', inactive: 'bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 hover:text-amber-600 dark:hover:text-amber-400' },
      rose: { active: 'bg-rose-500 text-white shadow-lg shadow-rose-500/30', inactive: 'bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 dark:hover:text-rose-400' },
    };
    const colors = colorMap[cl.color];

    return `
      <button
        data-class="${cl.id}"
        class="class-level-btn flex flex-col items-center gap-1 px-4 py-3 sm:px-6 sm:py-4 rounded-2xl border transition-all duration-300 transform ${
          isActive 
            ? `${colors.active} border-transparent scale-105` 
            : `${colors.inactive} border-slate-200/50 dark:border-slate-700/50`
        }"
      >
        <span class="text-lg sm:text-xl font-extrabold">${cl.shortLabel}</span>
        <span class="text-[10px] sm:text-xs font-semibold opacity-80 whitespace-nowrap">${isActive ? cl.description : `Class ${cl.shortLabel}`}</span>
      </button>
    `;
  }).join('');

  // Bind events
  container.querySelectorAll('.class-level-btn').forEach(btn => {
    btn.onclick = () => {
      selectedClassLevel = btn.getAttribute('data-class');
      renderClassSelector();
      renderTenseContent();
    };
  });
}

// --- Render: Formula Box ---
function renderFormulaBox(content, colors) {
  let html = '';
  
  if (content.formula) {
    html += `
      <div class="space-y-3">
        <h4 class="text-xs font-bold uppercase tracking-wider ${colors.text} flex items-center gap-2">
          <i data-lucide="square-function" class="w-4 h-4"></i> Formula / Structure
        </h4>
        <div class="space-y-2">
          <div class="flex items-center gap-2 px-4 py-2.5 rounded-xl ${colors.lightBg} border ${colors.border}">
            <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">✓ Aff</span>
            <code class="text-sm font-mono font-semibold text-slate-800 dark:text-slate-200">${content.formula}</code>
          </div>
          ${content.formulaNeg ? `
          <div class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50/50 dark:bg-red-950/10 border border-red-500/10 dark:border-red-500/20">
            <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">✗ Neg</span>
            <code class="text-sm font-mono font-semibold text-slate-800 dark:text-slate-200">${content.formulaNeg}</code>
          </div>
          ` : ''}
          ${content.formulaQ ? `
          <div class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/10 border border-purple-500/10 dark:border-purple-500/20">
            <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">? Que</span>
            <code class="text-sm font-mono font-semibold text-slate-800 dark:text-slate-200">${content.formulaQ}</code>
          </div>
          ` : ''}
        </div>
      </div>
    `;
  }
  return html;
}

// --- Render: Single Tense Card ---
function renderTenseCard(tense, category, colors) {
  const content = getContentForLevel(tense, selectedClassLevel);
  const isExpanded = expandedTense === tense.id;

  // Build card sections based on accumulated content
  let detailSections = '';

  // Formula (always present from class 4-5)
  detailSections += renderFormulaBox(content, colors);

  // When to Use (class 6+)
  if (content.whenToUse) {
    detailSections += `
      <div class="space-y-2 mt-5">
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <i data-lucide="target" class="w-4 h-4 ${colors.icon}"></i> When to Use
        </h4>
        <ul class="space-y-1.5">
          ${content.whenToUse.map(u => `
            <li class="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <span class="mt-1.5 w-1.5 h-1.5 rounded-full ${colors.accentBg} flex-shrink-0"></span>
              ${u}
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  // Signal Words (class 6+)
  if (content.signalWords) {
    detailSections += `
      <div class="space-y-2 mt-5">
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <i data-lucide="tag" class="w-4 h-4 ${colors.icon}"></i> Signal Words / Clue Words
        </h4>
        <div class="flex flex-wrap gap-1.5">
          ${content.signalWords.map(w => `
            <span class="px-2.5 py-1 rounded-lg text-xs font-semibold ${colors.bg} ${colors.text} border ${colors.border}">${w}</span>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Rules Note (class 8+)
  if (content.rulesNote) {
    detailSections += `
      <div class="mt-5 p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-500/10 dark:border-indigo-500/20">
        <div class="flex items-start gap-2">
          <i data-lucide="lightbulb" class="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0"></i>
          <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed"><strong class="text-indigo-600 dark:text-indigo-400">Rule:</strong> ${content.rulesNote}</p>
        </div>
      </div>
    `;
  }

  // Examples Table (class 8+)
  if (content.examples) {
    detailSections += `
      <div class="space-y-2 mt-5">
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <i data-lucide="book-open" class="w-4 h-4 ${colors.icon}"></i> Examples
        </h4>
        <div class="overflow-x-auto rounded-xl border ${colors.border}">
          <table class="w-full text-sm">
            <thead>
              <tr class="${colors.lightBg}">
                <th class="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider ${colors.text}">Affirmative ✓</th>
                <th class="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-red-500">Negative ✗</th>
                <th class="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-purple-500">Interrogative ?</th>
              </tr>
            </thead>
            <tbody>
              ${content.examples.map((ex, i) => `
                <tr class="${i % 2 === 0 ? 'bg-white/50 dark:bg-slate-900/30' : 'bg-slate-50/50 dark:bg-slate-800/20'}">
                  <td class="px-4 py-2.5 text-slate-700 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800/50">${ex.aff}</td>
                  <td class="px-4 py-2.5 text-slate-700 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800/50">${ex.neg}</td>
                  <td class="px-4 py-2.5 text-slate-700 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800/50">${ex.q}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // Common Mistakes (class 9+)
  if (content.commonMistakes) {
    detailSections += `
      <div class="space-y-3 mt-5">
        <h4 class="text-xs font-bold uppercase tracking-wider text-rose-500 dark:text-rose-400 flex items-center gap-2">
          <i data-lucide="alert-triangle" class="w-4 h-4"></i> Common Mistakes
        </h4>
        <div class="space-y-2.5">
          ${content.commonMistakes.map(m => `
            <div class="p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/15 border border-rose-500/10 dark:border-rose-500/20">
              <div class="flex items-center gap-2 mb-1.5">
                <span class="text-xs font-bold text-red-500 line-through">✗ ${m.wrong}</span>
              </div>
              <div class="flex items-center gap-2 mb-1.5">
                <span class="text-xs font-bold text-green-600 dark:text-green-400">✓ ${m.correct}</span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 italic">${m.explanation}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Advanced Examples (class 9+)
  if (content.advancedExamples) {
    detailSections += `
      <div class="space-y-2 mt-5">
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <i data-lucide="sparkles" class="w-4 h-4 ${colors.icon}"></i> Advanced Usage
        </h4>
        <ul class="space-y-1.5">
          ${content.advancedExamples.map(ex => `
            <li class="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <span class="mt-1 text-xs">💡</span>
              <span>${ex}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  // Detailed Rules (class 10)
  if (content.detailedRules) {
    detailSections += `
      <div class="space-y-2 mt-5">
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <i data-lucide="scroll-text" class="w-4 h-4 ${colors.icon}"></i> Detailed Rules
        </h4>
        <ol class="space-y-1.5 list-decimal list-inside">
          ${content.detailedRules.map(r => `
            <li class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">${r}</li>
          `).join('')}
        </ol>
      </div>
    `;
  }

  // Exceptions (class 10)
  if (content.exceptions) {
    detailSections += `
      <div class="space-y-2 mt-5">
        <h4 class="text-xs font-bold uppercase tracking-wider text-amber-500 dark:text-amber-400 flex items-center gap-2">
          <i data-lucide="shield-alert" class="w-4 h-4"></i> Exceptions & Special Cases
        </h4>
        <ul class="space-y-1.5">
          ${content.exceptions.map(ex => `
            <li class="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <span class="mt-1 text-xs">⚠️</span>
              <span>${ex}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  // Transformations (class 10)
  if (content.transformations) {
    detailSections += `
      <div class="space-y-2 mt-5">
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <i data-lucide="repeat" class="w-4 h-4 ${colors.icon}"></i> Transformation Practice
        </h4>
        <div class="space-y-2">
          ${content.transformations.map(t => `
            <div class="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-200/50 dark:border-slate-700/30">
              <p class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">${t.given}</p>
              <p class="text-sm text-green-600 dark:text-green-400 font-semibold">→ ${t.answer}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  return `
    <div class="tense-card group rounded-2xl border ${colors.border} bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden" data-tense-id="${tense.id}">
      <button 
        class="tense-toggle-btn w-full p-5 sm:p-6 flex items-center justify-between gap-3 text-left cursor-pointer transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
        data-tense="${tense.id}"
      >
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center text-white shadow-md flex-shrink-0">
            <i data-lucide="book-text" class="w-5 h-5 sm:w-6 sm:h-6"></i>
          </div>
          <div class="min-w-0">
            <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">${tense.name}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">${content.definition}</p>
          </div>
        </div>
        <i data-lucide="chevron-down" class="w-5 h-5 ${colors.icon} transition-transform duration-300 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}"></i>
      </button>
      <div class="tense-detail-panel ${isExpanded ? '' : 'hidden'} px-5 sm:px-6 pb-6 border-t ${colors.border}">
        <div class="pt-5">
          ${detailSections}
        </div>
      </div>
    </div>
  `;
}

// --- Render: Worksheet Section ---
function renderWorksheetSection(tense, colors) {
  const worksheetSections = getWorksheetForLevel(tense, selectedClassLevel);
  if (!worksheetSections || worksheetSections.length === 0) return '';

  let showAnswers = false;
  const worksheetId = `ws-${tense.id}-${selectedClassLevel}`;

  const typeLabels = {
    fill: '✏️ Fill in the Blanks',
    match: '🔗 Match the Following',
    transform: '🔄 Transform the Sentences',
    correct: '🔍 Find & Correct Errors',
    paragraph: '📝 Paragraph Completion',
    identify: '🎯 Identify & Fix',
    choose: '⚡ Choose the Correct Answer',
    mixed: '🧩 Mixed Practice',
    combine: '🔗 Combine Sentences',
    reported: '💬 Reported Speech',
  };

  return worksheetSections.map((section, sIdx) => `
    <div class="worksheet-block mt-4 p-4 sm:p-5 rounded-2xl border ${colors.border} bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm" data-worksheet="${worksheetId}-${sIdx}">
      <div class="flex items-center justify-between gap-2 mb-4">
        <h5 class="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <span>${typeLabels[section.type] || '📋 Exercise'}</span>
        </h5>
        <div class="flex items-center gap-2">
          <button class="show-answer-btn text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" data-ws="${worksheetId}-${sIdx}">
            Show Answers
          </button>
          <button class="print-ws-btn p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" data-ws="${worksheetId}-${sIdx}" title="Print Worksheet">
            <i data-lucide="printer" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>
      <p class="text-xs text-slate-500 dark:text-slate-400 mb-3 italic">${section.instruction}</p>
      <div class="space-y-2.5">
        ${section.questions.map((q, qIdx) => `
          <div class="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50">
            <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <span class="font-bold ${colors.text} mr-1">Q${qIdx + 1}.</span> ${q.q}
            </p>
            <p class="answer-line mt-1.5 text-sm font-semibold text-green-600 dark:text-green-400 hidden" data-ws-answer="${worksheetId}-${sIdx}">
              → ${q.a || q.answer || ''}
            </p>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

// --- Render: All Tense Content ---
function renderTenseContent() {
  const mainContent = document.getElementById('tense-main-content');
  if (!mainContent) return;

  const categories = ['present', 'past', 'future'];
  
  mainContent.innerHTML = categories.map(cat => {
    const data = TENSES_DATA[cat];
    const colors = TENSE_COLORS[cat];
    const catIcon = data.icon;

    return `
      <section class="mb-12 animate-fadeIn" id="section-${cat}">
        <!-- Category Header -->
        <div class="flex items-center gap-4 mb-6">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center text-white shadow-lg shadow-${cat === 'present' ? 'blue' : cat === 'past' ? 'amber' : 'emerald'}-500/20">
            <i data-lucide="${catIcon}" class="w-7 h-7"></i>
          </div>
          <div>
            <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">${data.title}</h2>
            <p class="text-sm text-slate-500 dark:text-slate-400">${data.subtitle}</p>
          </div>
        </div>

        <!-- Tense Cards -->
        <div class="space-y-4">
          ${data.tenses.map(t => renderTenseCard(t, cat, colors)).join('')}
        </div>

        <!-- Worksheets Section -->
        <div class="mt-8">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-8 h-8 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center">
              <i data-lucide="clipboard-list" class="w-4 h-4"></i>
            </div>
            <h3 class="text-lg font-bold text-slate-800 dark:text-slate-200">Worksheets — ${data.title}</h3>
          </div>
          ${data.tenses.map(t => {
            const ws = renderWorksheetSection(t, colors);
            if (!ws) return '';
            return `
              <div class="mb-6">
                <h4 class="text-sm font-bold ${colors.text} mb-2 px-1">${t.name}</h4>
                ${ws}
              </div>
            `;
          }).join('')}
        </div>
      </section>
    `;
  }).join('');

  // Bind toggle events
  mainContent.querySelectorAll('.tense-toggle-btn').forEach(btn => {
    btn.onclick = () => {
      const tenseId = btn.getAttribute('data-tense');
      if (expandedTense === tenseId) {
        expandedTense = null;
      } else {
        expandedTense = tenseId;
      }
      renderTenseContent();
    };
  });

  // Bind show answer buttons
  mainContent.querySelectorAll('.show-answer-btn').forEach(btn => {
    btn.onclick = () => {
      const wsId = btn.getAttribute('data-ws');
      const answers = mainContent.querySelectorAll(`[data-ws-answer="${wsId}"]`);
      const isShowing = btn.textContent.trim() === 'Hide Answers';
      answers.forEach(a => {
        if (isShowing) {
          a.classList.add('hidden');
        } else {
          a.classList.remove('hidden');
        }
      });
      btn.textContent = isShowing ? 'Show Answers' : 'Hide Answers';
    };
  });

  // Bind print buttons
  mainContent.querySelectorAll('.print-ws-btn').forEach(btn => {
    btn.onclick = () => {
      const wsId = btn.getAttribute('data-ws');
      const block = mainContent.querySelector(`[data-worksheet="${wsId}"]`);
      if (block) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Worksheet — English Tenses</title>
            <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: 'Outfit', sans-serif; padding: 40px; color: #1e293b; }
              h1 { font-size: 22px; margin-bottom: 8px; }
              .subtitle { font-size: 13px; color: #64748b; margin-bottom: 24px; }
              .instruction { font-size: 14px; color: #475569; font-style: italic; margin-bottom: 16px; }
              .question { padding: 12px 16px; margin-bottom: 8px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; }
              .q-num { font-weight: 700; color: #3b82f6; margin-right: 4px; }
              .answer-line { margin-top: 8px; border-top: 1px dashed #e2e8f0; padding-top: 8px; min-height: 24px; }
              @media print { body { padding: 20px; } }
            </style>
          </head>
          <body>
            <h1>📝 English Tenses — Worksheet</h1>
            <p class="subtitle">VidyaFrame Learning — ${CLASS_LEVELS.find(c => c.id === selectedClassLevel)?.label || ''}</p>
            ${block.innerHTML.replace(/hidden/g, '').replace(/<button[^>]*>.*?<\/button>/gs, '')}
            <script>window.print();<\/script>
          </body>
          </html>
        `);
        printWindow.document.close();
      }
    };
  });

  lucide.createIcons();
}

// --- Quick Nav ---
function renderQuickNav() {
  const nav = document.getElementById('quick-nav');
  if (!nav) return;

  const categories = [
    { id: 'present', label: 'Present', color: TENSE_COLORS.present },
    { id: 'past', label: 'Past', color: TENSE_COLORS.past },
    { id: 'future', label: 'Future', color: TENSE_COLORS.future },
  ];

  nav.innerHTML = categories.map(cat => `
    <a href="#section-${cat.id}" class="flex items-center gap-2 px-4 py-2.5 rounded-xl ${cat.color.bg} ${cat.color.text} border ${cat.color.border} text-sm font-bold hover:scale-105 transition-all duration-200">
      <span class="w-2 h-2 rounded-full ${cat.color.accentBg}"></span>
      ${cat.label}
    </a>
  `).join('');
}

// --- Expand All / Collapse All ---
function bindGlobalActions() {
  const expandAllBtn = document.getElementById('expand-all-btn');
  const collapseAllBtn = document.getElementById('collapse-all-btn');

  if (expandAllBtn) {
    expandAllBtn.onclick = () => {
      expandedTense = '__ALL__';
      // Expand all cards
      document.querySelectorAll('.tense-detail-panel').forEach(p => p.classList.remove('hidden'));
      document.querySelectorAll('.tense-toggle-btn i[data-lucide="chevron-down"]').forEach(icon => {
        icon.closest('i')?.classList.add('rotate-180');
      });
    };
  }

  if (collapseAllBtn) {
    collapseAllBtn.onclick = () => {
      expandedTense = null;
      document.querySelectorAll('.tense-detail-panel').forEach(p => p.classList.add('hidden'));
      document.querySelectorAll('.tense-toggle-btn i[data-lucide="chevron-down"]').forEach(icon => {
        icon.closest('i')?.classList.remove('rotate-180');
      });
    };
  }
}

// --- Tense Overview Stats ---
function renderOverviewStats() {
  const statsEl = document.getElementById('tense-stats');
  if (!statsEl) return;

  const levelLabel = CLASS_LEVELS.find(c => c.id === selectedClassLevel)?.label || '';
  const totalTenses = 12;
  
  statsEl.innerHTML = `
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="p-4 rounded-xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/10 dark:border-blue-500/20 text-center">
        <span class="text-2xl font-extrabold text-blue-500">4</span>
        <p class="text-[10px] font-bold uppercase tracking-wider text-blue-500/70 mt-1">Present</p>
      </div>
      <div class="p-4 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 dark:border-amber-500/20 text-center">
        <span class="text-2xl font-extrabold text-amber-500">4</span>
        <p class="text-[10px] font-bold uppercase tracking-wider text-amber-500/70 mt-1">Past</p>
      </div>
      <div class="p-4 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 dark:border-emerald-500/20 text-center">
        <span class="text-2xl font-extrabold text-emerald-500">4</span>
        <p class="text-[10px] font-bold uppercase tracking-wider text-emerald-500/70 mt-1">Future</p>
      </div>
      <div class="p-4 rounded-xl bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/10 dark:border-indigo-500/20 text-center">
        <span class="text-2xl font-extrabold text-indigo-500">${totalTenses}</span>
        <p class="text-[10px] font-bold uppercase tracking-wider text-indigo-500/70 mt-1">Total</p>
      </div>
    </div>
    <p class="text-center text-xs text-slate-400 mt-3">
      Currently viewing: <strong class="text-slate-600 dark:text-slate-300">${levelLabel}</strong> level content
    </p>
  `;
}

// ============================================================
// INITIALIZATION
// ============================================================
function init() {
  applyTheme();
  renderClassSelector();
  renderQuickNav();
  renderOverviewStats();
  renderTenseContent();
  bindGlobalActions();

  // Theme toggle
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) {
    themeBtn.onclick = () => {
      currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme();
    };
  }

  lucide.createIcons();
}

// Start
document.addEventListener('DOMContentLoaded', init);
