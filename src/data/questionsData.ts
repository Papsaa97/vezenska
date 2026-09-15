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

/**
 * Otázky seskupené podle předmětu.
 *
 * Klíčem je to, co má otázka ve `subject`, ne soubor, ve kterém leží. Ten rozdíl je
 * podstatný: v `sluzebniPriprava.ts` je sedmnáct otázek, které patří jinam (první
 * pomoc, nutná obrana, vstupy do objektů, Justiční stráž) a `subject` mají podle
 * obsahu. Kdyby se tenhle seznam skládal ze souborových polí, jak to bylo dřív,
 * schovaly by se pod předmět podle souboru a v příslušném okruhu by chyběly.
 */
const podlePredmetu = (...nazvy: string[]): Question[] =>
  academyQuestions.filter((q) => nazvy.includes(q.subject));

export const questionsBySubject: Record<string, Question[]> = {
  'Právo': podlePredmetu('Právo'),
  'Bezpečnostní služba': podlePredmetu('Bezpečnostní služba'),
  'Penologie': podlePredmetu('Penologie'),
  'Služební příprava': podlePredmetu('Služební příprava'),
  // Taktika vychází prázdná: její obsah (donucovací prostředky, pouta, obušek,
  // paralyzér, sebeobrana, taktika zákroku) je služební příprava a je pod ní.
  // Karta zůstává v subjectsMeta pro případ, že sem taktické otázky přibydou —
  // prázdné okruhy se v Předmětech skrývají samy.
  'Zbraně': podlePredmetu('Zbraně'),
  'Taktika': podlePredmetu('Taktika'),
  'ZOP': podlePredmetu('ZOP'),
  'Psychologie': podlePredmetu('Psychologie'),
  'Profesní etika': podlePredmetu('Profesní etika'),
  'Pedagogika': podlePredmetu('Pedagogika'),
  'Zdravověda a první pomoc': podlePredmetu('Zdravověda a první pomoc'),
  'Vězeňská administrativa': podlePredmetu('Vězeňská administrativa')
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
