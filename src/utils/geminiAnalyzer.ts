import { GoogleGenAI } from '@google/genai';
import { Question } from '../types';
import { readScoped, writeScoped } from './userScopedStorage';

export interface AnalyzedExamResponse {
  title: string;
  subject: string;
  summary: string;
  questions: Question[];
}

export const STORAGE_KEY_API_KEY = 'vscr_gemini_api_key';
export const STORAGE_KEY_SAVED_EXAMS = 'vscr_custom_saved_exams';

export interface SavedCustomExam {
  id: string;
  createdAt: number;
  title: string;
  subject: string;
  questionCount: number;
  questions: Question[];
}

// Klíč i uložená zadání patří účtu (userScopedStorage). Dřív ležely pod
// společným klíčem: uložená zadání po obnovení stránky mizela (userScopedStorage
// je při přihlášení převáděl na účet a mazal) a na sdíleném počítači by další
// přihlášený používal cizí klíč ke Gemini.

export function getSavedApiKey(): string {
  const saved = readScoped<string>(STORAGE_KEY_API_KEY, '');
  if (typeof saved === 'string' && saved.trim()) return saved.trim();
  return import.meta.env?.VITE_GEMINI_API_KEY || '';
}

export function setSavedApiKey(key: string): void {
  writeScoped(STORAGE_KEY_API_KEY, key.trim());
}

export function getSavedCustomExams(): SavedCustomExam[] {
  const saved = readScoped<unknown>(STORAGE_KEY_SAVED_EXAMS, []);
  return Array.isArray(saved) ? (saved as SavedCustomExam[]) : [];
}

export function saveCustomExam(exam: Omit<SavedCustomExam, 'id' | 'createdAt'>): SavedCustomExam {
  const newExam: SavedCustomExam = {
    ...exam,
    id: `custom-exam-${Date.now()}`,
    createdAt: Date.now()
  };
  writeScoped(STORAGE_KEY_SAVED_EXAMS, [newExam, ...getSavedCustomExams()]);
  return newExam;
}

export function deleteCustomExam(id: string): void {
  writeScoped(STORAGE_KEY_SAVED_EXAMS, getSavedCustomExams().filter(e => e.id !== id));
}

export interface GeminiInlineDataPart {
  inlineData: {
    data: string;
    mimeType: string;
  };
}

export type GeminiContentPart = string | GeminiInlineDataPart;

/**
 * Converts a File object to base64 inline data format for Gemini API
 */
export async function fileToGenerativePart(file: File): Promise<GeminiInlineDataPart> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type || 'image/jpeg',
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Index správné možnosti, nebo `null`, když se určit nedá.
 *
 * Platný je jen celočíselný index uvnitř pole `options` (AGENTS.md). Jinak se
 * správná možnost hledá podle shody s textem `answer`; hádat ji nejde.
 */
function resolveCorrectOption(q: Question, options: string[]): number | null {
  const idx = q.correctOption;
  if (typeof idx === 'number' && Number.isInteger(idx) && idx >= 0 && idx < options.length) {
    return idx;
  }
  const answer = typeof q.answer === 'string' ? q.answer.trim().toLowerCase() : '';
  if (!answer) return null;
  const match = options.findIndex((o) => o.trim().toLowerCase() === answer);
  return match >= 0 ? match : null;
}

const SYSTEM_INSTRUCTION = `Jsi elitní zkušební komisař, instruktor a metodik Akademie Vězeňské služby České republiky (ZOP A).
Tvým úkolem je analyzovat zadání testu, otázek, písemky či modelové situace (buď z textu, nebo z vyfoceného papíru/skenu), které studentům zadali kapitáni nebo učitelé.

KRITICKÁ PRAVIDLA PRO ZPRACOVÁNÍ:
1. VYČERPAJÍCÍ OCR A EXTRAKCE: Extrahuj a zpracuj ÚPLNĚ VŠECHNY otázky, body, podbody a cvičení, která se na fotce či v textu nacházejí. NIKDY nezkracuj počet otázek ani nic nevynechávej (pokud je na fotce 12, 20 nebo 35 otázek, MUSÍŠ zpracovat všech 12, 20 či 35 otázek do pole 'questions').
2. ČERPEJ VÝHRADNĚ ZE ZDROJŮ APLIKACE: Odpovědi, odůvodnění i citace opírej POUZE o text v bloku „ZDROJE APLIKACE“ (Právní kompas: články a registr předpisů) a o přiložené studijní materiály, jsou-li výslovně uvedené. Nepoužívej vlastní znalosti, jiné předpisy ani internet. Neuváděj paragraf, který ve zdrojích není.
   - Pole "source" vyplň předpisem a paragrafem PŘESNĚ tak, jak stojí ve zdroji (např. „Zákon č. 555/1992 Sb., § 18 odst. 1“), u přiloženého materiálu jeho názvem.
   - Pokud zdroje odpověď na otázku NEOBSAHUJÍ, otázku přesto zpracuj, ale do "source" napiš přesně „NENALEZENO VE ZDROJÍCH APLIKACE“ a v "rationale" stručně uveď, co ve zdrojích chybí. Nic si nedomýšlej jako jistotu.
3. KVALITNÍ A VYVÁŽENÉ DISTRAKTORY: Pro každou otázku připrav 4 testové možnosti (options A, B, C, D). VŠECHNY 4 MOŽNOSTI MUSÍ MÍT SROVNATELNOU DÉLKU, GRAMATICKOU STRUKTURU A ODBORNÝ TÓN jako správná odpověď. Používej věrohodné chytáky z praxe VS ČR (záměny paragrafů, lhůt, pravomocí, sankcí, stupňů ostrahy), aby správná odpověď NEBYLA poznat pouhou délkou či jednoduchostí špatných odpovědí.
4. ODŮVODNĚNÍ ZE ZDROJE: Ke každé otázce uveď vysvětlení (rationale) opřené o konkrétní místo ze zdrojů aplikace a pramen (source).

VÝSTUP MUSÍ BÝT VÝHRADNĚ VALIDNÍ JSON v tomto formátu (žádný markdown kolem, pouze čistý JSON):
{
  "title": "Stručný a výstižný název testu/zadání",
  "subject": "Převažující předmět (např. Bezpečnostní služba / Právo / Služební příprava / Penologie apod.)",
  "summary": "Podrobné shrnutí zkoušené látky, hlavních institutů a klíčových chytáků od zkoušejícího",
  "questions": [
    {
      "id": "custom-q-1",
      "subject": "Název předmětu",
      "topic": "Konkrétní téma",
      "question": "Přesné a úplné znění otázky",
      "answer": "Správná, úplná a odborná odpověď",
      "options": ["Možnost A (stejně odborná a dlouhá)", "Možnost B (stejně odborná a dlouhá)", "Možnost C (stejně odborná a dlouhá)", "Možnost D (stejně odborná a dlouhá)"],
      "correctOption": 1,
      "rationale": "Přesné zákonné vysvětlení s odkazem na konkrétní § a odstavec...",
      "source": "Zákon č. 555/1992 Sb., § 18 odst. 1"
    }
  ]
}`;

/**
 * Modely Gemini, které asistent zkouší, od nejschopnějšího. Jediné místo, kde
 * se model volí.
 *
 * Google v září 2026 zavřel řadu 2.5 novým klíčům („no longer available to new
 * users“) a pro nové projekty doporučuje 3.8 Flash a 3.5 Flash-Lite
 * (https://ai.google.dev/gemini-api/docs/models). Až Google model zase stáhne,
 * stačí ve Vercelu nastavit VITE_GEMINI_MODELS (názvy oddělené čárkou)
 * a znovu nasadit — kód se měnit nemusí.
 */
export const DEFAULT_GEMINI_MODELS = ['gemini-3.8-flash', 'gemini-3.5-flash-lite'];

export function getGeminiModels(): string[] {
  const fromEnv: string = import.meta.env?.VITE_GEMINI_MODELS || '';
  const models = fromEnv
    .split(',')
    .map((m) => m.trim().replace(/^models\//, ''))
    .filter((m) => m !== '');
  return models.length > 0 ? models : DEFAULT_GEMINI_MODELS;
}

/** Značka, kterou model vrací u otázky mimo zdroje aplikace. */
export const NOT_IN_APP_SOURCES = 'NENALEZENO VE ZDROJÍCH APLIKACE';

/** Zdroje aplikace pro jeden dotaz (viz utils/aiSources). */
export interface AnalysisSources {
  compassText: string;
  materialParts: GeminiInlineDataPart[];
  materialNames: string[];
  skippedMaterials: string[];
}

export async function analyzeExamContent(
  apiKey: string,
  textPrompt: string | undefined,
  imageFile: File | undefined,
  sources: AnalysisSources
): Promise<AnalyzedExamResponse> {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Chybí Gemini API klíč. Zadejte prosím svůj API klíč v nastavení asistenta.');
  }

  const ai = new GoogleGenAI({ apiKey: apiKey.trim() });

  const contents: GeminiContentPart[] = [];

  contents.push(
    `ZDROJE APLIKACE — jediný povolený podklad pro odpovědi.\n\n${sources.compassText}`
  );
  if (sources.materialParts.length > 0) {
    contents.push(
      `Následují přiložené studijní materiály z knihovny aplikace (${sources.materialNames.length}): ${sources.materialNames.join('; ')}. I z nich smíš čerpat.`
    );
    contents.push(...sources.materialParts);
  } else {
    contents.push('Žádné další studijní materiály přiložené nejsou; čerpej jen z Právního kompasu výše.');
  }

  if (imageFile) {
    const imagePart = await fileToGenerativePart(imageFile);
    contents.push(imagePart);
  }

  let promptText = `Pečlivě analyzuj CELÉ toto zadání testu od kapitána pro studenty Akademie VS ČR (ZOP A). Extrahuj VŠECHNY otázky a body bez jakéhokoliv vynechání a vypracuj k nim odpovědi VÝHRADNĚ podle zdrojů aplikace výše, s citacemi z nich a vyváženými možnostmi A, B, C, D.`;
  if (textPrompt && textPrompt.trim() !== '') {
    promptText += `\n\nZadání od uživatele / kapitána:\n"""\n${textPrompt.trim()}\n"""`;
  }
  contents.push(promptText);

  const modelsToTry = getGeminiModels();
  let lastError: unknown = null;

  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      });

      const responseText = response.text || '';
      if (!responseText) {
        lastError = new Error(`Model ${modelName} nevrátil žádnou odpověď.`);
        continue;
      }

      // Parse JSON (strip possible markdown fences)
      const cleaned = responseText.replace(/^```(?:json)?\s*|\s*```$/gi, '').trim();
      const parsed: AnalyzedExamResponse = JSON.parse(cleaned);

      // Validate and sanitize questions
      if (!parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
        throw new Error('Ze zadání se nepodařilo extrahovat žádné otázky. Zkontrolujte prosím kvalitu fotky nebo textu.');
      }

      // Otázky bez použitelných možností se zahazují.
      //
      // Dřív se místo nich dosadily zástupné texty ['Správná možnost',
      // 'Nesprávná možnost'] — vznikla tím otázka, jejíž správná odpověď byla
      // doslova slovo „Správná možnost“, a ta se přes onStartCustomQuiz
      // dostala do ostrého testu i do uložených výsledků a XP. Lepší je
      // otázku vynechat a říct to.
      //
      // Stejně tak otázka bez platného indexu správné možnosti. Model občas
      // vrátí index od jedničky, písmeno „B“ nebo číslo mimo pole — Quiz pak
      // při míchání možností nenašel správnou a za správnou tiše označil
      // první možnost. Test tak hodnotil špatnou odpověď jako dobrou.
      // Neplatný index se ještě zkusí dohledat podle textu `answer`.
      const usable = parsed.questions.flatMap((q) => {
        const options = q.options;
        if (!Array.isArray(options) || options.length < 2 || !q.question) return [];
        if (!options.every((o) => typeof o === 'string' && o.trim() !== '')) return [];
        const correctOption = resolveCorrectOption(q, options);
        return correctOption === null ? [] : [{ ...q, options, correctOption }];
      });
      const zahozeno = parsed.questions.length - usable.length;

      if (usable.length === 0) {
        throw new Error(
          'Model nevrátil ani jednu otázku s použitelnými možnostmi. Zkuste prosím ostřejší fotku nebo zadání vložit jako text.'
        );
      }

      parsed.questions = usable.map((q, idx) => ({
        // ID z modelu se bere jen s prefixem custom-q. Podle něj ukládání výsledků
        // (utils/quizResults) pozná otázky mimo banku; model, který by vrátil
        // třeba „pr-12“, by jinak test poslal k serverovému vyhodnocení a ten by
        // ho srazil na nulu — nebo ho spároval s cizí otázkou z banky.
        id: typeof q.id === 'string' && q.id.startsWith('custom-q') ? q.id : `custom-q-${Date.now()}-${idx + 1}`,
        subject: q.subject || parsed.subject || 'Služební příprava',
        topic: q.topic || 'Zadání od kapitána',
        question: q.question,
        answer: q.answer || q.options[q.correctOption],
        options: q.options,
        correctOption: q.correctOption,
        // Chybějící odůvodnění se NEDOPLŇUJE.
        //
        // Dřív se sem dosadilo „Ověřeno dle interních norem VS ČR.“ — u výstupu
        // jazykového modelu, který nikdo neověřil. Přesně to AGENTS.md zakazuje:
        // nad neověřeným textem nesmí stát slovo „ověřeno“. Prázdné pole je
        // poctivé a rozhraní ho umí zobrazit jako „model odůvodnění nedodal“.
        rationale: q.rationale || '',
        source: q.source || ''
      }));

      const mimoZdroje = parsed.questions.filter((q) => q.source.trim().toUpperCase().startsWith(NOT_IN_APP_SOURCES)).length;
      if (mimoZdroje > 0) {
        parsed.summary = `${parsed.summary || ''}\n\nPozor: u ${mimoZdroje} otázek zdroje aplikace odpověď neobsahují (označeny „${NOT_IN_APP_SOURCES}“). Ověřte je prosím u lektora.`.trim();
      }
      if (sources.skippedMaterials.length > 0) {
        parsed.summary = `${parsed.summary || ''}\n\nNepoužité materiály: ${sources.skippedMaterials.join('; ')}.`.trim();
      }

      if (zahozeno > 0) {
        parsed.summary = `${parsed.summary || ''}\n\nPozn.: ${zahozeno} otázek se nepodařilo zpracovat do testové podoby (chyběly možnosti nebo platné označení správné odpovědi) a nejsou v seznamu.`.trim();
      }

      return parsed;
    } catch (err: unknown) {
      // Jen text chyby: celý objekt může nést tělo požadavku včetně klíče.
      console.warn(`Model ${modelName} failed, trying next...`, err instanceof Error ? err.message : String(err));
      lastError = err;
      continue;
    }
  }

  // All models failed
  if (lastError) {
    console.error('Gemini Analysis Error:', lastError instanceof Error ? lastError.message : String(lastError));

    let rawMessage = lastError instanceof Error ? lastError.message : String(lastError);

    // Try to parse raw JSON error if present
    if (typeof rawMessage === 'string') {
      const jsonMatch = rawMessage.match(/\{[\s\S]*"error"[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsedErr = JSON.parse(jsonMatch[0]);
          if (parsedErr?.error?.message) {
            rawMessage = parsedErr.error.message;
          }
        } catch {
          // ignore JSON parse error
        }
      }
    }

    if (rawMessage.includes('API_KEY_INVALID') || rawMessage.includes('API key not valid') || rawMessage.includes('API key expired')) {
      throw new Error('Zadaný Gemini API klíč je neplatný nebo expiroval. Zkontrolujte prosím svůj API klíč v nastavení asistenta.');
    }
    if (rawMessage.includes('RESOURCE_EXHAUSTED') || rawMessage.includes('429') || rawMessage.includes('Quota exceeded')) {
      throw new Error('Byl překročen limit volání (kvóta) vašeho Google Gemini API klíče. Počkejte chvíli a zkuste to znovu.');
    }
    if (rawMessage.includes('no longer available')) {
      throw new Error(`Google tento AI model už nepovoluje (${rawMessage}). Správce aplikace musí nastavit novější model v proměnné VITE_GEMINI_MODELS.`);
    }
    if (rawMessage.includes('not found') || rawMessage.includes('404')) {
      throw new Error(`AI model není dostupný: ${rawMessage}`);
    }
    if (rawMessage.includes('Failed to fetch') || rawMessage.includes('NetworkError') || rawMessage.includes('net::ERR')) {
      throw new Error('Nepodařilo se navázat spojení se službou Google Gemini API. Zkontrolujte připojení k síti.');
    }

    throw new Error(rawMessage || 'Nepodařilo se zpracovat zadání pomocí AI. Zkontrolujte připojení k internetu a API klíč.');
  }
  throw new Error('Nepodařilo se získat odpověď od žádného AI modelu.');
}
