import { Question } from '../types';
import { pravoQuestions } from './questions/pravo';
import { bezpecnostniSluzbaQuestions } from './questions/bezpecnostniSluzba';
import { penologieQuestions } from './questions/penologie';
import { sluzebniPripravaQuestions } from './questions/sluzebniPriprava';
import { psychologieQuestions } from './questions/psychologie';
import { pedagogikaQuestions } from './questions/pedagogika';
import { zdravovedaQuestions } from './questions/zdravoveda';
import { vezenskaAdministrativaQuestions } from './questions/vezenskaAdministrativa';
import { profesniEtikaQuestions } from './questions/profesniEtika';
import { matchingCategories } from './questions/matching';
import { subjectsMeta, SubjectInfo } from './questions/subjectsInfo';

export const academyQuestions: Question[] = [
  ...pravoQuestions,
  ...bezpecnostniSluzbaQuestions,
  ...penologieQuestions,
  ...sluzebniPripravaQuestions,
  ...psychologieQuestions,
  ...profesniEtikaQuestions,
  ...pedagogikaQuestions,
  ...zdravovedaQuestions,
  ...vezenskaAdministrativaQuestions,
];

export const questionsBySubject: Record<string, Question[]> = {
  'Právo': pravoQuestions,
  'Bezpečnostní služba': bezpecnostniSluzbaQuestions,
  'Penologie': penologieQuestions,
  'Služební příprava': sluzebniPripravaQuestions.filter(q => q.subject === 'Služební příprava'),
  'Zbraně': sluzebniPripravaQuestions.filter(q => q.subject === 'zbrane' || q.subject === 'Zbraně'),
  'Taktika': sluzebniPripravaQuestions.filter(q => q.subject === 'taktika' || q.subject === 'Taktika'),
  'ZOP': sluzebniPripravaQuestions.filter(q => q.subject === 'zop' || q.subject === 'ZOP'),
  'Psychologie': psychologieQuestions,
  'Profesní etika': profesniEtikaQuestions,
  'Pedagogika': pedagogikaQuestions,
  'Zdravověda a první pomoc': zdravovedaQuestions,
  'Vězeňská administrativa': vezenskaAdministrativaQuestions
};

export {
  pravoQuestions,
  bezpecnostniSluzbaQuestions,
  penologieQuestions,
  sluzebniPripravaQuestions,
  psychologieQuestions,
  profesniEtikaQuestions,
  pedagogikaQuestions,
  zdravovedaQuestions,
  vezenskaAdministrativaQuestions,
  matchingCategories,
  subjectsMeta
};
export type { SubjectInfo };
