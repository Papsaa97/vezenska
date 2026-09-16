import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Definice mapování otázek
const WEAPON_IDS = new Set([
  'sp-02', // Použití střelné zbraně (§ 18)
  'sp-05', // CZ 75 B / P-10 C
  'sp-06', // CZ Scorpion EVO 3A1
  'sp-15', // Závady na zbrani (Tap-Rack-Bang)
  'sp-22', // Taktické přebití zbraně
  'sp-42', // Zbraňová bezpečnost
  'sp-45', // Lapač střel
  'sp-46', // Podmínky užití zbraně (§ 20)
  'sp-47', // CZ BREN 2
  'sp-48', // Balistika a zastavovací účinek
  'sp-49', // Konstrukce střeliva
  'sp-50', // Mířidla a zamíření
]);

const TACTICS_IDS = new Set([
  'sp-01', // Použití DP (§ 17)
  'sp-03', // Katalog DP
  'sp-04', // Omezení použití DP (§ 19)
  'sp-09', // Povinnosti po použití DP a zbraně
  'sp-10', // Elektrický paralyzér
  'sp-12', // Taktika zásahu v cele (vstupy do cely)
  'sp-14', // Použití pout za zády
  'sp-16', // Slzotvorné prostředky
  'sp-18', // Obušek a tonfa
  'sp-20', // Zastavovací pás
  'sp-36', // Eskorty - úmrtí vězně
  'sp-38', // Metodika poutání - nožní pouta
  'sp-39', // Záznam o použití DP
  'sp-40', // DP - použití pout
  'sp-41', // DP - zranitelné osoby
  'sp-43', // Taktická sebeobrana - nůž
  'sp-44', // DP - elektrický paralyzér
]);

const ZOP_IDS = new Set([
  'sp-23', // Povinnost zakročit - výjimky
  'sp-24', // Prokazování příslušnosti
  'sp-34', // Hodnosti ve VS ČR
  'sp-35', // Pořadová příprava - zdvořilost
]);

// Doplňující otázky pokrývající CZ BREN 2, balistiku, střelivo a mířidla (dle zadání a AGENTS.md)
const NEW_QUESTIONS = [
  {
    id: 'sp-47',
    subject: 'zbrane',
    topic: 'Střelecká příprava – Útočná puška CZ BREN 2',
    question: 'Jaká je ráže, kapacita zásobníku a charakteristika útočné pušky CZ BREN 2 zařazené ve výzbroji VS ČR?',
    answer: 'Ráže 5,56×45 mm NATO; kapacita zásobníku 30 nábojů; princip odběru prachových plynů z hlavně s krátkým pohybem pístu; určena pro zvláštní eskorty a strážní zabezpečení.',
    options: [
      `Ráže 7,62×39 mm; kapacita 20 nábojů; zbraň s přímým dynamickým závěrem určená výhradně pro výcvik nováčků na střelnici.`,
      `Ráže 5,56×45 mm NATO; kapacita zásobníku 30 nábojů; princip odběru prachových plynů z hlavně s krátkým pohybem pístu; určena pro zvláštní eskorty a strážní zabezpečení.`,
      `Ráže 9×19 mm Luger; kapacita 50 nábojů v bubnovém zásobníku; slouží výhradně pro střelbu gumovými projektily.`,
      `Ráže 12/70 broková; kapacita 8 nábojů v podhlavňovém trubicovém zásobníku pro prorážení dveří.`
    ],
    correctOption: 1,
    rationale: 'Útočná puška CZ BREN 2 je moderní služební zbraň bezpečnostních sborů ČR komorovaná pro náboj 5,56×45 mm NATO se standardním 30ranným polymerovým zásobníkem. Pracuje na principu odběru prachových plynů z vývrtu hlavně přes plynový nástavec s pístem.',
    source: 'Technická specifikace výzbroje VS ČR a předpis pro střeleckou přípravu',
    explanation: 'Útočná puška CZ BREN 2 je moderní služební zbraň bezpečnostních sborů ČR komorovaná pro náboj 5,56×45 mm NATO se standardním 30ranným polymerovým zásobníkem. Pracuje na principu odběru prachových plynů z vývrtu hlavně přes plynový nástavec s pístem.'
  },
  {
    id: 'sp-48',
    subject: 'zbrane',
    topic: 'Balistika a zastavovací účinek',
    question: 'Co zkoumá terminální (cílová) balistika a jaký je hlavní účel celoplášťové střely (FMJ) služebního střeliva 9×19 mm Luger?',
    answer: 'Zkoumá chování a účinek střely v cíli; služební FMJ střela zajišťuje spolehlivou penetraci a stabilitu bez nadměrné fragmentace, s důrazem na předání kinetické energie a zastavovací účinek.',
    options: [
      `Zkoumá pohyb střely v hlavni zbraně při hoření prachové náplně; střela FMJ má za cíl explodovat uvnitř cíle.`,
      `Zkoumá chování a účinek střely v cíli; služební FMJ střela zajišťuje spolehlivou penetraci a stabilitu bez nadměrné fragmentace, s důrazem na předání kinetické energie a zastavovací účinek.`,
      `Zkoumá pouze dráhu střely vzduchem od ústí hlavně po dopad na cíl (aerodynamický odpor a balistickou křivku).`,
      `Zkoumá teplotu prachových plynů v komoře; střela FMJ je vyrobena z olova bez pláště pro maximální rozpad.`
    ],
    correctOption: 1,
    rationale: 'Terminální (cílová) balistika studuje proces průniku střely tkání a předání kinetické energie. Služební celoplášťová střela (Full Metal Jacket - FMJ) 9×19 mm Luger se skládá z olověného jádra a tombakového nebo mosazného pláště, což zaručuje tvarovou stálost a spolehlivé vedení v drážkách hlavně.',
    source: 'Učební texty Akademie VS ČR – Nauka o zbraních a střelivu',
    explanation: 'Terminální (cílová) balistika studuje proces průniku střely tkání a předání kinetické energie. Služební celoplášťová střela (Full Metal Jacket - FMJ) 9×19 mm Luger se skládá z olověného jádra a tombakového nebo mosazného pláště, což zaručuje tvarovou stálost a spolehlivé vedení v drážkách hlavně.'
  },
  {
    id: 'sp-49',
    subject: 'zbrane',
    topic: 'Konstrukce střeliva',
    question: 'Ze kterých 4 základních částí se skládá jednotný náboj pro služební pistole a samopaly (např. 9×19 mm Luger)?',
    answer: 'Nábojnice, zápalka (zápalková slož), prachová náplň (bezdýmný prach) a střela.',
    options: [
      `Nábojnice, zápalka (zápalková slož), prachová náplň (bezdýmný prach) a střela.`,
      `Hlaveň, závěr, úderník a nábojový rámeček.`,
      `Plášť střely, olověné jádro, výmetná nálož a stabilizační křidélka.`,
      `Pouzdro náboje, zápalná šňůra, třaskavina a wolframové penetrační jádro.`
    ],
    correctOption: 0,
    rationale: 'Jednotný pistolový/samopalový náboj se skládá ze čtyř konstrukčních prvků: nábojnice (spojuje součásti), zápalky (iniciuje zážeh po úderu úderníku), prachové náplně (hořením vytváří tlak plynů) a střely (vlastní projektil opouštějící hlaveň).',
    source: 'Zákon č. 119/2002 Sb., o střelných zbraních a střelivu (příloha – vymezení pojmů)',
    explanation: 'Jednotný pistolový/samopalový náboj se skládá ze čtyř konstrukčních prvků: nábojnice (spojuje součásti), zápalky (iniciuje zážeh po úderu úderníku), prachové náplně (hořením vytváří tlak plynů) a střely (vlastní projektil opouštějící hlaveň).'
  },
  {
    id: 'sp-50',
    subject: 'zbrane',
    topic: 'Mířidla a zamíření',
    question: 'Jaká je správná optická rovina při míření mechanickými mířidly (muška – hledí) a na co musí střelec primárně zaostřit zrak?',
    answer: 'Muška je přesně vystředěna v zářezu hledí (rovná muška na horní hraně hledí s rovnoměrnými světelnými mezerami); zrak střelce je ostře zaostřen na vrchol mušky, cíl a hledí jsou mírně rozostřené.',
    options: [
      `Zrak je ostře zaostřen výhradně na střed terče, zatímco muška a hledí mohou splývat do jednoho neostrého bodu.`,
      `Muška je přesně vystředěna v zářezu hledí (rovná muška na horní hraně hledí s rovnoměrnými světelnými mezerami); zrak střelce je ostře zaostřen na vrchol mušky, cíl a hledí jsou mírně rozostřené.`,
      `Muška musí přesahovat horní hranu hledí o 2 mm pro kompenzaci zpětného rázu a poklesu trajektorie střely.`,
      `Střelec zavírá obě oči a spouští zbraň výhradně na základě svalové paměti a hmatového kontaktu s rukojetí.`
    ],
    correctOption: 1,
    rationale: 'Základní pravidlo míření mechanickými mířidly vyžaduje vytvoření „rovné mušky“ (horní hrany mušky a hledí v jedné rovině, stejné boční mezery) a ostré zaostření oka na mušku. Lidské oko nedokáže zaostřit na 3 různé vzdálenosti současně, prioritou je vždy přední mířidlo (muška).',
    source: 'Metodika střelecké přípravy Akademie VS ČR',
    explanation: 'Základní pravidlo míření mechanickými mířidly vyžaduje vytvoření „rovné mušky“ (horní hrany mušky a hledí v jedné rovině, stejné boční mezery) a ostré zaostření oka na mušku. Lidské oko nedokáže zaostřit na 3 různé vzdálenosti současně, prioritou je vždy přední mířidlo (muška).'
  }
];

async function main() {
  console.log('=== Krok 1: Čtení a aktualizace src/data/questions/sluzebniPriprava.ts ===');
  const filePath = path.resolve(__dirname, '../src/data/questions/sluzebniPriprava.ts');
  
  // Dynamicky načteme stávající otázky ze souboru
  const { sluzebniPripravaQuestions } = await import('../src/data/questions/sluzebniPriprava');
  
  console.log(`Původní počet otázek v sluzebniPriprava: ${sluzebniPripravaQuestions.length}`);

  let weaponCount = 0;
  let tacticsCount = 0;
  let zopCount = 0;
  let slpCount = 0;

  const updatedQuestions = sluzebniPripravaQuestions.map((q: any) => {
    let newSubject = q.subject;
    if (WEAPON_IDS.has(q.id)) {
      newSubject = 'zbrane';
      weaponCount++;
    } else if (TACTICS_IDS.has(q.id)) {
      newSubject = 'taktika';
      tacticsCount++;
    } else if (ZOP_IDS.has(q.id)) {
      newSubject = 'zop';
      zopCount++;
    } else {
      slpCount++;
    }
    return { ...q, subject: newSubject };
  });

  // Přidáme nové otázky
  for (const nq of NEW_QUESTIONS) {
    if (!updatedQuestions.some((q: any) => q.id === nq.id)) {
      updatedQuestions.push(nq);
      weaponCount++;
    }
  }

  console.log(`Po přerozdělení:`);
  console.log(`- Zbraně (subject: 'zbrane'): ${weaponCount} otázek`);
  console.log(`- Taktika (subject: 'taktika'): ${tacticsCount} otázek`);
  console.log(`- ZOP (subject: 'zop'): ${zopCount} otázek`);
  console.log(`- Zůstalo ve Služební přípravě: ${slpCount} otázek`);
  console.log(`Celkem otázek v souboru sluzebniPriprava.ts: ${updatedQuestions.length}`);

  // Generování nového TypeScript kódu pro sluzebniPriprava.ts
  const code = `import { Question } from '../../types';\n\nexport const sluzebniPripravaQuestions: Question[] = ` +
    JSON.stringify(updatedQuestions, null, 2) + `;\n`;

  fs.writeFileSync(filePath, code, 'utf-8');
  console.log(`Soubor sluzebniPriprava.ts byl úspěšně zapsán.`);

  // 2. Aktualizace src/data/questionsData.ts pro plnou kompatibilitu
  console.log('\n=== Krok 2: Kontrola a aktualizace src/data/questionsData.ts ===');
  const questionsDataPath = path.resolve(__dirname, '../src/data/questionsData.ts');
  let qdCode = fs.readFileSync(questionsDataPath, 'utf-8');

  // Doplnění filtrů do questionsBySubject
  const newQuestionsBySubject = `export const questionsBySubject: Record<string, Question[]> = {
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
};`;

  const oldBlockRegex = /export const questionsBySubject: Record<string, Question\[\]> = \{[\s\S]*?\};/;
  if (oldBlockRegex.test(qdCode)) {
    qdCode = qdCode.replace(oldBlockRegex, newQuestionsBySubject);
    fs.writeFileSync(questionsDataPath, qdCode, 'utf-8');
    console.log(`Soubor questionsData.ts byl úspěšně aktualizován.`);
  }

  // 3. Supabase Upsert synchronizace
  console.log('\n=== Krok 3: Synchronizace výchozích otázek do Supabase ===');
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  const env: Record<string, string> = {};
  envContent.split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });

  const supabaseUrl = env['VITE_SUPABASE_URL'];
  const supabaseKey = env['VITE_SUPABASE_ANON_KEY'];

  if (!supabaseUrl || !supabaseKey) {
    console.error('Chybí Supabase URL nebo Anon Key v .env.local');
    process.exit(1);
  }

  const sb = createClient(supabaseUrl, supabaseKey);

  // Přihlášení synchronizačního správce.
  //
  // Údaje se čtou z .env.local (soubor je v .gitignore). Dřív byly zapsané přímo
  // tady v kódu — repozitář je veřejný, takže to heslo je nutné považovat za
  // vyzrazené a při dalším použití skriptu ho změnit.
  //
  // Účet potřebuje roli lektor nebo admin v public.profiles, jinak RLS zápis do
  // quiz_questions odmítne (viz politika quiz_questions_write).
  const email = env['SYNC_AGENT_EMAIL'];
  const password = env['SYNC_AGENT_PASSWORD'];
  if (!email || !password) {
    console.error(
      'Chybí SYNC_AGENT_EMAIL nebo SYNC_AGENT_PASSWORD v .env.local.\n' +
      'Skript se bez přihlašovacích údajů synchronizačního účtu spustit nedá.'
    );
    process.exit(1);
  }

  const { error: authError } = await sb.auth.signInWithPassword({ email, password });
  if (authError) {
    console.error('Chyba při přihlášení správce do Supabase:', authError.message);
    process.exit(1);
  }
  console.log(`Správce ${email} úspěšně přihlášen do Supabase.`);

  // Načtení všech výchozích otázek po úpravě
  const { academyQuestions } = await import('../src/data/questionsData');
  console.log(`Celkem academyQuestions k synchronizaci: ${academyQuestions.length}`);

  // Deduplikace podle textu otázky (stejně jako v quizQuestionsLoader.ts)
  const uniqueMap = new Map<string, any>();
  for (const q of academyQuestions) {
    const key = q.question.trim().toLowerCase();
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, q);
    }
  }
  const uniqueQuestions = Array.from(uniqueMap.values());
  console.log(`Unikátních otázek: ${uniqueQuestions.length}`);

  // Dávkový upsert po 50 otázkách
  const BATCH_SIZE = 50;
  let syncedTotal = 0;

  for (let i = 0; i < uniqueQuestions.length; i += BATCH_SIZE) {
    const batch = uniqueQuestions.slice(i, i + BATCH_SIZE);
    const payload = batch.map(q => {
      let correctIdx = typeof q.correctOption === 'number' ? q.correctOption : 0;
      return {
        subject: q.subject,
        question: q.question.trim(),
        options: q.options || [],
        correct_index: correctIdx,
        explanation: q.explanation || q.rationale || ''
      };
    });

    const { error: upsertErr } = await sb.from('quiz_questions').upsert(payload, {
      onConflict: 'question',
      ignoreDuplicates: false
    });

    if (upsertErr) {
      console.error(`Chyba při dávce ${i + 1} - ${i + batch.length}:`, upsertErr.message);
      process.exit(1);
    }

    syncedTotal += batch.length;
    console.log(`Synchronizováno: ${syncedTotal} / ${uniqueQuestions.length}`);
  }

  // Závěrečná kontrola počtu řádků v Supabase
  const { count, error: countErr } = await sb.from('quiz_questions').select('*', { count: 'exact', head: true });
  if (!countErr) {
    console.log(`\nAktuální počet otázek v Supabase (quiz_questions): ${count}`);
  }

  console.log('\nHotovo! Všechny otázky byly úspěšně přerozděleny a synchronizovány.');
}

main().catch(err => {
  console.error('Neočekávaná chyba:', err);
  process.exit(1);
});
