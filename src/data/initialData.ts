import { Question, MatchingCategory, QuizSessionRecord } from '../types';
import { academyQuestions, matchingCategories as verifiedMatchingCategories } from './questionsData';

export const sampleQuestions: Question[] = academyQuestions;

export const matchingCategories: MatchingCategory[] = verifiedMatchingCategories;


export const defaultQuizHistory: QuizSessionRecord[] = [
  {
    id: 'sess-1',
    timestamp: Date.now() - 6 * 24 * 3600 * 1000,
    dateFormatted: 'Před 6 dny',
    subject: 'all',
    totalQuestions: 10,
    correctAnswers: 5,
    accuracy: 50,
    timeSpentSeconds: 140,
    attempts: [
      { questionId: 'q1', questionText: 'Věková hranice trestní odpovědnosti', subject: 'Právo', topic: 'Trestní právo', isCorrect: true, selectedOption: 1, correctOption: 1, confidence: 'know' },
      { questionId: 'q2', questionText: 'Oprávnění použít DP', subject: 'Služební příprava', topic: 'Použití donucovacích prostředků', isCorrect: false, selectedOption: 0, correctOption: 1, confidence: 'guess' },
      { questionId: 'q3', questionText: 'Základní typy věznic', subject: 'Penologie', topic: 'Výkon trestu odnětí svobody', isCorrect: false, selectedOption: 0, correctOption: 2, confidence: 'know' },
      { questionId: 'q4', questionText: 'Řízení VS ČR', subject: 'Právo', topic: 'Zákon o Vězeňské službě', isCorrect: true, selectedOption: 1, correctOption: 1, confidence: 'know' },
      { questionId: 'q5', questionText: 'Použití zbraně', subject: 'Služební příprava', topic: 'Použití zbraně', isCorrect: false, selectedOption: 0, correctOption: 1, confidence: 'dont_know' },
      { questionId: 'q6', questionText: 'Eskorta nebezpečného pachatele', subject: 'Bezpečnostní služba', topic: 'Eskortní a strážní služba', isCorrect: false, selectedOption: 1, correctOption: 2, confidence: 'guess' },
      { questionId: 'q7', questionText: 'Výkon vazby oddělení', subject: 'Penologie', topic: 'Výkon vazby', isCorrect: true, selectedOption: 1, correctOption: 1, confidence: 'know' },
      { questionId: 'q8', questionText: 'Deeskalace v krizové situaci', subject: 'Psychologie', topic: 'Komunikace a krizová intervence', isCorrect: true, selectedOption: 1, correctOption: 1, confidence: 'know' },
      { questionId: 'q9', questionText: 'Zákon o služebním poměru', subject: 'Právo', topic: 'Správní a služební poměr', isCorrect: false, selectedOption: 0, correctOption: 2, confidence: 'guess' },
      { questionId: 'q10', questionText: 'Paralyzér a pouta v DP', subject: 'Služební příprava', topic: 'Použití donucovacích prostředků', isCorrect: true, selectedOption: 1, correctOption: 1, confidence: 'know' }
    ]
  },
  {
    id: 'sess-2',
    timestamp: Date.now() - 4 * 24 * 3600 * 1000,
    dateFormatted: 'Před 4 dny',
    subject: 'Právo',
    totalQuestions: 6,
    correctAnswers: 4,
    accuracy: 67,
    timeSpentSeconds: 95,
    attempts: [
      { questionId: 'q1', questionText: 'Věková hranice trestní odpovědnosti', subject: 'Právo', topic: 'Trestní právo', isCorrect: true, selectedOption: 1, correctOption: 1, confidence: 'know' },
      { questionId: 'q4', questionText: 'Řízení VS ČR', subject: 'Právo', topic: 'Zákon o Vězeňské službě', isCorrect: true, selectedOption: 1, correctOption: 1, confidence: 'know' },
      { questionId: 'q9', questionText: 'Zákon o služebním poměru', subject: 'Právo', topic: 'Správní a služební poměr', isCorrect: false, selectedOption: 0, correctOption: 2, confidence: 'guess' },
      { questionId: 'q1', questionText: 'Trestní odpovědnost opakovací', subject: 'Právo', topic: 'Trestní právo', isCorrect: true, selectedOption: 1, correctOption: 1, confidence: 'know' },
      { questionId: 'q4', questionText: 'Generální ředitel jmenování', subject: 'Právo', topic: 'Zákon o Vězeňské službě', isCorrect: true, selectedOption: 1, correctOption: 1, confidence: 'know' },
      { questionId: 'q9', questionText: 'Služební poměr bezpečnostních sborů', subject: 'Právo', topic: 'Správní a služební poměr', isCorrect: false, selectedOption: 1, correctOption: 2, confidence: 'know' }
    ]
  },
  {
    id: 'sess-3',
    timestamp: Date.now() - 2 * 24 * 3600 * 1000,
    dateFormatted: 'Před 2 dny',
    subject: 'Služební příprava',
    totalQuestions: 6,
    correctAnswers: 4,
    accuracy: 67,
    timeSpentSeconds: 80,
    attempts: [
      { questionId: 'q2', questionText: 'Oprávnění použít DP', subject: 'Služební příprava', topic: 'Použití donucovacích prostředků', isCorrect: true, selectedOption: 1, correctOption: 1, confidence: 'know' },
      { questionId: 'q5', questionText: 'Použití zbraně podmínky', subject: 'Služební příprava', topic: 'Použití zbraně', isCorrect: false, selectedOption: 0, correctOption: 1, confidence: 'guess' },
      { questionId: 'q10', questionText: 'DP paralyzér', subject: 'Služební příprava', topic: 'Použití donucovacích prostředků', isCorrect: true, selectedOption: 1, correctOption: 1, confidence: 'know' },
      { questionId: 'q5', questionText: 'Krajní nouze a nutná obrana', subject: 'Služební příprava', topic: 'Použití zbraně', isCorrect: true, selectedOption: 1, correctOption: 1, confidence: 'know' },
      { questionId: 'q2', questionText: 'Zákon 555/1992 DP', subject: 'Služební příprava', topic: 'Použití donucovacích prostředků', isCorrect: true, selectedOption: 1, correctOption: 1, confidence: 'know' },
      { questionId: 'q5', questionText: 'Varovný výstřel', subject: 'Služební příprava', topic: 'Použití zbraně', isCorrect: false, selectedOption: 2, correctOption: 1, confidence: 'dont_know' }
    ]
  },
  {
    id: 'sess-4',
    timestamp: Date.now() - 1 * 24 * 3600 * 1000,
    dateFormatted: 'Včera',
    subject: 'all',
    totalQuestions: 8,
    correctAnswers: 7,
    accuracy: 88,
    timeSpentSeconds: 110,
    attempts: [
      { questionId: 'q1', questionText: 'Trestní odpovědnost', subject: 'Právo', topic: 'Trestní právo', isCorrect: true, selectedOption: 1, correctOption: 1, confidence: 'know' },
      { questionId: 'q2', questionText: 'Použití DP', subject: 'Služební příprava', topic: 'Použití donucovacích prostředků', isCorrect: true, selectedOption: 1, correctOption: 1, confidence: 'know' },
      { questionId: 'q3', questionText: 'Typy věznic', subject: 'Penologie', topic: 'Výkon trestu odnětí svobody', isCorrect: true, selectedOption: 2, correctOption: 2, confidence: 'know' },
      { questionId: 'q4', questionText: 'Generální ředitelství', subject: 'Právo', topic: 'Zákon o Vězeňské službě', isCorrect: true, selectedOption: 1, correctOption: 1, confidence: 'know' },
      { questionId: 'q6', questionText: 'Eskortní služba', subject: 'Bezpečnostní služba', topic: 'Eskortní a strážní služba', isCorrect: false, selectedOption: 0, correctOption: 2, confidence: 'guess' },
      { questionId: 'q7', questionText: 'Režimy vazby', subject: 'Penologie', topic: 'Výkon vazby', isCorrect: true, selectedOption: 1, correctOption: 1, confidence: 'know' },
      { questionId: 'q8', questionText: 'Deeskalace', subject: 'Psychologie', topic: 'Komunikace a krizová intervence', isCorrect: true, selectedOption: 1, correctOption: 1, confidence: 'know' },
      { questionId: 'q10', questionText: 'Pouta a donucovací prostředky', subject: 'Služební příprava', topic: 'Použití donucovacích prostředků', isCorrect: true, selectedOption: 1, correctOption: 1, confidence: 'know' }
    ]
  },
  {
    id: 'sess-5',
    timestamp: Date.now() - 2 * 3600 * 1000,
    dateFormatted: 'Dnes',
    subject: 'all',
    totalQuestions: 10,
    correctAnswers: 9,
    accuracy: 90,
    timeSpentSeconds: 125,
    attempts: [
      { questionId: 'q1', questionText: 'Věková hranice trestní odpovědnosti', subject: 'Právo', topic: 'Trestní právo', isCorrect: true, selectedOption: 1, correctOption: 1, confidence: 'know' },
      { questionId: 'q2', questionText: 'Oprávnění použít DP', subject: 'Služební příprava', topic: 'Použití donucovacích prostředků', isCorrect: true, selectedOption: 1, correctOption: 1, confidence: 'know' },
      { questionId: 'q3', questionText: 'Základní typy věznic', subject: 'Penologie', topic: 'Výkon trestu odnětí svobody', isCorrect: true, selectedOption: 2, correctOption: 2, confidence: 'know' },
      { questionId: 'q4', questionText: 'Řízení VS ČR', subject: 'Právo', topic: 'Zákon o Vězeňské službě', isCorrect: true, selectedOption: 1, correctOption: 1, confidence: 'know' },
      { questionId: 'q5', questionText: 'Použití zbraně', subject: 'Služební příprava', topic: 'Použití zbraně', isCorrect: true, selectedOption: 1, correctOption: 1, confidence: 'know' },
      { questionId: 'q6', questionText: 'Eskorta nebezpečného pachatele', subject: 'Bezpečnostní služba', topic: 'Eskortní a strážní služba', isCorrect: false, selectedOption: 1, correctOption: 2, confidence: 'guess' },
      { questionId: 'q7', questionText: 'Výkon vazby oddělení', subject: 'Penologie', topic: 'Výkon vazby', isCorrect: true, selectedOption: 1, correctOption: 1, confidence: 'know' },
      { questionId: 'q8', questionText: 'Deeskalace v krizové situaci', subject: 'Psychologie', topic: 'Komunikace a krizová intervence', isCorrect: true, selectedOption: 1, correctOption: 1, confidence: 'know' },
      { questionId: 'q9', questionText: 'Zákon o služebním poměru', subject: 'Právo', topic: 'Správní a služební poměr', isCorrect: true, selectedOption: 2, correctOption: 2, confidence: 'know' },
      { questionId: 'q10', questionText: 'Paralyzér a pouta v DP', subject: 'Služební příprava', topic: 'Použití donucovacích prostředků', isCorrect: true, selectedOption: 1, correctOption: 1, confidence: 'know' }
    ]
  }
];

