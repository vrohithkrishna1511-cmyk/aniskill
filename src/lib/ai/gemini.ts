import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

export const aiClient = apiKey ? new GoogleGenAI({ apiKey }) : null;

export type PracticeDifficulty = 'EASY' | 'MODERATE' | 'HARD' | 'ADVANCED';

export interface ExtractedTodoItem {
  title: string;
  normalizedTitle?: string;
  description?: string;
  difficulty?: PracticeDifficulty | 'COMPLEX' | 'MEDIUM' | 'VERY_HARD';
  estimatedMinutes?: number;
  estimatedMinMinutes?: number;
  estimatedMaxMinutes?: number;
  targetMinutes?: number;
}

export interface ExtractedSyllabus {
  subjectName: string;
  icon?: string;
  color?: string;
  courses: {
    title: string;
    todoItems: ExtractedTodoItem[];
  }[];
  units?: any[]; // Compatibility alias
}

export interface GeneratedQuizQuestion {
  id: string;
  todoItemTitle: string;
  topicTitle?: string;
  difficulty: 'BASIC' | 'INTERMEDIATE' | 'TOUGH';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface NormalizedTopicAnalysis {
  cleanTitle: string;
  normalizedTitle: string;
  difficulty: PracticeDifficulty;
  targetMinutes: number;
}

/**
 * Intelligent topic difficulty and practice time estimator:
 * LEVEL 1 — EASY     (15 mins)
 * LEVEL 2 — MODERATE (20 mins)
 * LEVEL 3 — HARD     (30 mins)
 * LEVEL 4 — ADVANCED (45 mins)
 */
export function estimateTopicDifficulty(rawTitle: string, context: string = ''): { difficulty: PracticeDifficulty; targetMinutes: number } {
  const combined = `${context} ${rawTitle}`.toLowerCase();

  // LEVEL 4 — ADVANCED (Complex algorithms, DP, concurrency, distributed systems)
  if (
    combined.includes('dynamic programming') ||
    combined.includes(' dp ') ||
    combined.includes('backtrack') ||
    combined.includes('system design') ||
    combined.includes('distributed') ||
    combined.includes('concurrency') ||
    combined.includes('multithreading') ||
    combined.includes('memory management') ||
    combined.includes('advanced algorithm') ||
    combined.includes('complex data structure') ||
    combined.includes('trie') ||
    combined.includes('segment tree') ||
    combined.includes('microservice') ||
    combined.includes('compiler') ||
    combined.includes('neural network') ||
    combined.includes('deep learning') ||
    combined.includes('optimization algorithm')
  ) {
    return { difficulty: 'ADVANCED', targetMinutes: 45 };
  }

  // LEVEL 3 — HARD (OOP, Recursion, Trees, Graphs, Exception Handling, DB internals)
  if (
    combined.includes('object-oriented') ||
    combined.includes('oop') ||
    combined.includes('inheritance') ||
    combined.includes('polymorphism') ||
    combined.includes('recursion') ||
    combined.includes('tree') ||
    combined.includes('graph') ||
    combined.includes('linked list') ||
    combined.includes('stack and queue') ||
    combined.includes('exception handling') ||
    combined.includes('pointers') ||
    combined.includes('transactions') ||
    combined.includes('indexing') ||
    combined.includes('sorting algorithm') ||
    combined.includes('searching algorithm') ||
    combined.includes('database design') ||
    combined.includes('asynchronous')
  ) {
    return { difficulty: 'HARD', targetMinutes: 30 };
  }

  // LEVEL 1 — EASY (Basics, syntax, variables, print, input/output, simple operators)
  if (
    combined.includes('intro') ||
    combined.includes('basic') ||
    combined.includes('syntax') ||
    combined.includes('variable') ||
    combined.includes('data type') ||
    combined.includes('print') ||
    combined.includes('operator') ||
    combined.includes('input and output') ||
    combined.includes('i/o') ||
    combined.includes('comment') ||
    combined.includes('environment setup') ||
    combined.includes('installation') ||
    combined.includes('getting started')
  ) {
    return { difficulty: 'EASY', targetMinutes: 15 };
  }

  // LEVEL 2 — MODERATE (Conditionals, loops, functions, lists, dictionaries, strings, file handling)
  return { difficulty: 'MODERATE', targetMinutes: 20 };
}

/**
 * Intelligent topic title normalizer (without changing user's authentic wording)
 */
export function normalizeAndEstimateTopicTitle(rawTitle: string, subjectContext: string = ''): NormalizedTopicAnalysis {
  // Strip leading bullet chars or numbering: "1. ", "• ", "- ", "* "
  let clean = rawTitle
    .replace(/^[\s•\-\*–—\d\.\)]+/, '')
    .trim();

  if (!clean) clean = rawTitle.trim();

  const estimation = estimateTopicDifficulty(clean, subjectContext);

  return {
    cleanTitle: clean,
    normalizedTitle: clean,
    difficulty: estimation.difficulty,
    targetMinutes: estimation.targetMinutes,
  };
}

export function deduplicateTodoItems(courses: ExtractedSyllabus['courses']): ExtractedSyllabus['courses'] {
  const seenTitles = new Set<string>();

  return courses
    .map((course) => {
      const uniqueItems: ExtractedTodoItem[] = [];
      course.todoItems.forEach((item) => {
        const rawTitle = item.title.trim();
        const normKey = rawTitle.toLowerCase();
        if (!seenTitles.has(normKey)) {
          seenTitles.add(normKey);
          
          let diff: PracticeDifficulty = 'MODERATE';
          let targetM = 20;

          if (item.difficulty === 'EASY') {
            diff = 'EASY';
            targetM = 15;
          } else if (item.difficulty === 'ADVANCED') {
            diff = 'ADVANCED';
            targetM = 45;
          } else if (item.difficulty === 'HARD' || item.difficulty === 'COMPLEX' || item.difficulty === 'VERY_HARD') {
            diff = 'HARD';
            targetM = 30;
          } else if (item.difficulty === 'MODERATE' || item.difficulty === 'MEDIUM') {
            diff = 'MODERATE';
            targetM = 20;
          } else {
            const est = estimateTopicDifficulty(rawTitle, course.title);
            diff = est.difficulty;
            targetM = est.targetMinutes;
          }

          uniqueItems.push({
            ...item,
            title: rawTitle,
            normalizedTitle: rawTitle,
            difficulty: diff,
            targetMinutes: item.targetMinutes || targetM,
            estimatedMinutes: item.estimatedMinutes || targetM,
          });
        }
      });
      return {
        ...course,
        title: course.title.trim(),
        todoItems: uniqueItems,
      };
    })
    .filter((c) => c.todoItems.length > 0);
}

/**
 * Local Smart Heuristic Parser for syllabus text (used when AI is offline or as immediate fallback)
 */
export function parseSyllabusTextLocally(rawText: string, defaultSubjectTitle: string = 'Syllabus'): ExtractedSyllabus {
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  
  const ignoredPatterns = [
    /^(course\s+outcomes?|objectives?|learning\s+outcomes?|prerequisites?|references?|textbooks?|recommended\s+books?|grading\s+scheme|evaluation\s+criteria|credit\s+hours?|contact\s+hours?)/i,
    /^(total\s+hours?|max\s+marks?|passing\s+marks?|instructor|semester|academic\s+year)/i,
  ];

  const unitHeaderPattern = /^(unit|module|chapter|part|section|block)\s*[\dIVXLCDM\w\-_:]+/i;
  
  const courses: { title: string; todoItems: ExtractedTodoItem[] }[] = [];
  let currentCourseTitle = 'Unit 1';
  let currentItems: ExtractedTodoItem[] = [];

  for (const line of lines) {
    // Check if line should be skipped
    if (ignoredPatterns.some(p => p.test(line))) {
      continue;
    }

    // Check if line is a unit / module / chapter heading
    if (unitHeaderPattern.test(line) || /^#{1,3}\s+(unit|module|chapter)/i.test(line)) {
      if (currentItems.length > 0) {
        courses.push({
          title: currentCourseTitle,
          todoItems: [...currentItems],
        });
        currentItems = [];
      }
      currentCourseTitle = line.replace(/^#{1,3}\s*/, '').trim();
      continue;
    }

    // Clean topic title but preserve original user wording
    const cleanTopic = line.replace(/^[\s•\-\*–—\d\.\)\:]+/, '').trim();
    if (!cleanTopic || cleanTopic.length < 2) continue;

    // Check if line is just administrative description
    if (cleanTopic.length > 120 && !cleanTopic.includes(',') && !cleanTopic.includes(';')) {
      continue;
    }

    // If a line contains comma/semicolon separated items e.g. "Variables, Data Types, Input and Output"
    if (cleanTopic.includes(',') && !cleanTopic.includes('(') && cleanTopic.split(',').length >= 3) {
      const subParts = cleanTopic.split(',').map(p => p.trim()).filter(p => p.length >= 2);
      for (const part of subParts) {
        const est = estimateTopicDifficulty(part, currentCourseTitle);
        currentItems.push({
          title: part,
          normalizedTitle: part,
          difficulty: est.difficulty,
          targetMinutes: est.targetMinutes,
          estimatedMinutes: est.targetMinutes,
        });
      }
    } else {
      const est = estimateTopicDifficulty(cleanTopic, currentCourseTitle);
      currentItems.push({
        title: cleanTopic,
        normalizedTitle: cleanTopic,
        difficulty: est.difficulty,
        targetMinutes: est.targetMinutes,
        estimatedMinutes: est.targetMinutes,
      });
    }
  }

  if (currentItems.length > 0) {
    courses.push({
      title: currentCourseTitle,
      todoItems: currentItems,
    });
  }

  // If no unit headers were found and all items are in one bucket
  if (courses.length === 0 && currentItems.length === 0 && lines.length > 0) {
    const defaultItems: ExtractedTodoItem[] = lines.map(line => {
      const clean = line.replace(/^[\s•\-\*–—\d\.\)\:]+/, '').trim();
      const est = estimateTopicDifficulty(clean);
      return {
        title: clean,
        normalizedTitle: clean,
        difficulty: est.difficulty,
        targetMinutes: est.targetMinutes,
        estimatedMinutes: est.targetMinutes,
      };
    }).filter(i => i.title.length > 1);

    courses.push({
      title: `${defaultSubjectTitle} Curriculum`,
      todoItems: defaultItems,
    });
  }

  return {
    subjectName: defaultSubjectTitle,
    courses: courses.length > 0 ? courses : [{
      title: `${defaultSubjectTitle} Curriculum`,
      todoItems: [],
    }],
  };
}

/**
 * Intelligent AI text syllabus analyzer using Gemini 2.5
 */
export async function analyzeSyllabusFromText(rawText: string, subjectTitle: string = ''): Promise<ExtractedSyllabus> {
  if (!rawText || !rawText.trim()) {
    throw new Error('Syllabus text cannot be empty.');
  }

  if (aiClient && apiKey) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `You are an expert academic curriculum parser and cognitive learning time estimator for ANISKILL.
Analyze the following pasted syllabus text for the subject "${subjectTitle || 'Subject'}".

CRITICAL RULES:
1. PRESERVE ORIGINAL TOPIC WORDING: Keep the user's authentic wording. Do NOT rename, shorten, or abbreviate topic titles (e.g., "Conditional Statements" must stay "Conditional Statements", "Data Structures and Algorithms" must not be shortened to "DSA").
2. REMOVE NON-LEARNING CONTENT: Discard administrative text, course objectives, learning outcomes, references, textbooks, credit hours, or grading criteria. Only extract actual learning topics.
3. PRESERVE UNIT / MODULE HEADINGS: Group topics under their respective Unit, Module, Chapter, or Section. If no unit headings exist in the text, organize topics into logical units (e.g. "Unit 1: Fundamentals", "Unit 2: Core Concepts").
4. 4 PRACTICE DIFFICULTY LEVELS:
   Classify every topic into EXACTLY ONE of these 4 practice difficulty levels:
   - "EASY": Level 1 (Fundamentals, basic syntax, variables, data types, input/output, operators) -> targetMinutes: 15
   - "MODERATE": Level 2 (Conditional statements, loops, functions, lists, tuples, dictionaries, strings, file handling) -> targetMinutes: 20
   - "HARD": Level 3 (Object-Oriented Programming, classes, recursion, trees, graphs, exception handling, database indexing, sorting) -> targetMinutes: 30
   - "ADVANCED": Level 4 (Advanced algorithms, dynamic programming, system design, concurrency, complex data structures, optimization) -> targetMinutes: 45

Input Syllabus Text:
${rawText}

JSON Structure to return:
{
  "subjectName": "${subjectTitle || 'Subject Title'}",
  "courses": [
    {
      "title": "Unit 1" (or Module 1 / Chapter 1 / Unit Title from text),
      "todoItems": [
        {
          "title": "Exact Topic Name As In Syllabus",
          "difficulty": "EASY" | "MODERATE" | "HARD" | "ADVANCED",
          "targetMinutes": 15 | 20 | 30 | 45,
          "estimatedMinutes": 15 | 20 | 30 | 45
        }
      ]
    }
  ]
}
Output pure JSON only. Do not include markdown code fence formatting.`,
              },
            ],
          },
        ],
      });

      const responseText = response.text || '';
      const cleanJson = responseText.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanJson) as ExtractedSyllabus;

      const deduplicatedCourses = deduplicateTodoItems(parsed.courses || []);
      return {
        subjectName: parsed.subjectName || subjectTitle || 'Subject',
        courses: deduplicatedCourses,
        units: deduplicatedCourses,
      };
    } catch (aiErr: any) {
      console.warn('Gemini text syllabus analysis error, using fallback:', aiErr?.message || aiErr);
    }
  }

  // Fallback heuristic parser
  const fallbackResult = parseSyllabusTextLocally(rawText, subjectTitle);
  const deduplicated = deduplicateTodoItems(fallbackResult.courses || []);
  return {
    subjectName: subjectTitle || 'Subject',
    courses: deduplicated,
    units: deduplicated,
  };
}

export async function extractSyllabusFromImages(base64Images: string[]): Promise<ExtractedSyllabus> {
  if (aiClient && apiKey) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `You are an expert academic curriculum parser and cognitive learning time estimator for ANISKILL.
Analyze the provided syllabus screenshot(s) from a learning portal and extract structured syllabus data in strict JSON format.

CRITICAL RULES:
1. HIERARCHY: Must strictly be: Subject -> Courses (Modules / Units) -> To-Do Items (Topics).
2. PRESERVE ORIGINAL TOPIC NAMES: Keep exact topic wording visible in the screenshot without unwanted rewrites.
3. REMOVE ADMINISTRATIVE NOISE: Exclude course outcomes, textbooks, references, credit details.
4. 4 PRACTICE DIFFICULTY LEVELS & TARGET TIMES:
   Classify every topic into EXACTLY ONE of these 4 levels:
   - EASY: Level 1 (Fundamentals, basic syntax, variables, print, input/output) -> targetMinutes: 15
   - MODERATE: Level 2 (Conditionals, loops, functions, lists, dictionaries, strings) -> targetMinutes: 20
   - HARD: Level 3 (OOP, recursion, trees, graphs, exception handling, SQL) -> targetMinutes: 30
   - ADVANCED: Level 4 (Dynamic programming, system design, concurrency, advanced algorithms) -> targetMinutes: 45
5. ZERO INVENTED TOPICS: Extract ONLY visible curriculum items.

JSON structure must match:
{
  "subjectName": "Subject Title (e.g. Python, DBMS, Mathematics)",
  "icon": "BookOpen",
  "color": "#FF6B00",
  "courses": [
    {
      "title": "Unit 1: Programming Foundations",
      "todoItems": [
        {
          "title": "Original Visible Topic Title",
          "difficulty": "EASY" | "MODERATE" | "HARD" | "ADVANCED",
          "targetMinutes": 15 | 20 | 30 | 45,
          "estimatedMinutes": 15 | 20 | 30 | 45
        }
      ]
    }
  ]
}
Output pure JSON only.`,
              },
              ...base64Images.map((img) => ({
                inlineData: {
                  mimeType: img.startsWith('data:image/png') ? 'image/png' : 'image/jpeg',
                  data: img.replace(/^data:image\/\w+;base64,/, ''),
                },
              })),
            ],
          },
        ],
      });

      const responseText = response.text || '';
      const cleanJson = responseText.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanJson) as ExtractedSyllabus;

      const deduplicatedCourses = deduplicateTodoItems(parsed.courses || []);
      return {
        ...parsed,
        courses: deduplicatedCourses,
        units: deduplicatedCourses,
      };
    } catch (e: any) {
      console.error('Gemini AI syllabus extraction error:', e);
      throw new Error(`Syllabus OCR Extraction Failed: ${e.message || 'Could not analyze uploaded screenshots.'}`);
    }
  }

  throw new Error('Syllabus OCR Extraction Failed: Gemini API client is not configured. Please set GEMINI_API_KEY.');
}

export async function generateDailyQuiz(studiedTopicTitles: string[]): Promise<GeneratedQuizQuestion[]> {
  if (aiClient && apiKey && studiedTopicTitles.length > 0) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `You are the Head Examination Master at ANISKILL Academy.
Generate a daily end-of-training quiz containing EXACTLY 5 QUESTIONS based ONLY on the topics actually studied today: ${JSON.stringify(studiedTopicTitles)}.
Do NOT ask questions about unstudied topics.

RULES:
1. Generate EXACTLY 5 questions. No more, no less.
2. Questions must test conceptual understanding, practical application, and reasoning from the provided topics.
3. Distribute the 5 questions intelligently across the studied topics.

JSON Output Structure:
[
  {
    "id": "q1",
    "topicTitle": "Exact Studied Topic Title",
    "difficulty": "BASIC" | "INTERMEDIATE" | "TOUGH",
    "question": "Clear conceptual question testing topic understanding",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Clear explanation of why this answer is correct."
  }
]
Output pure JSON array containing exactly 5 questions only.`,
              },
            ],
          },
        ],
      });

      const responseText = response.text || '';
      const cleanJson = responseText.replace(/```json|```/g, '').trim();
      return JSON.parse(cleanJson) as GeneratedQuizQuestion[];
    } catch (e) {
      console.warn('Gemini AI Quiz Generation fallback activated:', e);
    }
  }

  // Smart fallback quiz generation based on passed studied topics
  const topics = studiedTopicTitles.length > 0 ? studiedTopicTitles : ['Core Concepts', 'Logic & Functions'];
  return [
    {
      id: 'q1',
      todoItemTitle: topics[0] || 'Core Concepts',
      topicTitle: topics[0] || 'Core Concepts',
      difficulty: 'BASIC',
      question: `What is the fundamental purpose of ${topics[0] || 'Variables'} in application logic?`,
      options: [
        'To store and reference dynamic data in memory during runtime',
        'To permanently compile source code into machine instructions',
        'To prevent unauthorized network requests',
        'To style user interface components',
      ],
      correctIndex: 0,
      explanation: 'Variables act as named memory containers to store and retrieve values during execution.',
    },
    {
      id: 'q2',
      todoItemTitle: topics[0] || 'Core Concepts',
      topicTitle: topics[0] || 'Core Concepts',
      difficulty: 'BASIC',
      question: 'Which control flow structure is best suited when the exact number of iterations is known in advance?',
      options: [
        'Deterministic For Loop',
        'Indefinite While Loop',
        'Exceptional Try-Catch Block',
        'Static Switch Assertion',
      ],
      correctIndex: 0,
      explanation: 'A for loop is optimal for iterating over a known sequence or count.',
    },
    {
      id: 'q3',
      todoItemTitle: topics[1] || topics[0] || 'Logic & Functions',
      topicTitle: topics[1] || topics[0] || 'Logic & Functions',
      difficulty: 'INTERMEDIATE',
      question: 'What happens when a function does not explicitly return a value in Python?',
      options: [
        'It implicitly returns None',
        'It throws a syntax compilation exception',
        'It terminates the host operating system process',
        'It creates a infinite background loop',
      ],
      correctIndex: 0,
      explanation: 'In Python, functions without an explicit return statement implicitly evaluate to None.',
    },
    {
      id: 'q4',
      todoItemTitle: topics[1] || topics[0] || 'Logic & Functions',
      topicTitle: topics[1] || topics[0] || 'Logic & Functions',
      difficulty: 'INTERMEDIATE',
      question: 'Which algorithmic complexity represents constant execution time regardless of input size?',
      options: ['O(1)', 'O(N)', 'O(N log N)', 'O(2^N)'],
      correctIndex: 0,
      explanation: 'O(1) signifies constant time complexity.',
    },
    {
      id: 'q5',
      todoItemTitle: topics[0] || 'Core Concepts',
      topicTitle: topics[0] || 'Core Concepts',
      difficulty: 'TOUGH',
      question: 'Why is immutability beneficial when managing data in multi-threaded software architectures?',
      options: [
        'Immutable objects prevent race conditions by eliminating shared state mutation',
        'Immutable objects increase hardware execution speed by 10x',
        'Immutable objects automatically encrypt memory storage',
        'Immutable objects eliminate the need for garbage collection',
      ],
      correctIndex: 0,
      explanation: 'Immutability prevents concurrent modification side-effects.',
    },
  ];
}
