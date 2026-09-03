import { GoogleGenAI } from '@google/genai';
import { Question } from '../types';

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

export function getSavedApiKey(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY_API_KEY);
    if (saved) return saved.trim();
  }
  return (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
}

export function setSavedApiKey(key: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_API_KEY, key.trim());
  }
}

export function getSavedCustomExams(): SavedCustomExam[] {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SAVED_EXAMS);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load saved custom exams', e);
    }
  }
  return [];
}

export function saveCustomExam(exam: Omit<SavedCustomExam, 'id' | 'createdAt'>): SavedCustomExam {
  const newExam: SavedCustomExam = {
    ...exam,
    id: `custom-exam-${Date.now()}`,
    createdAt: Date.now()
  };
  if (typeof window !== 'undefined') {
    const current = getSavedCustomExams();
    const updated = [newExam, ...current];
    localStorage.setItem(STORAGE_KEY_SAVED_EXAMS, JSON.stringify(updated));
  }
  return newExam;
}

export function deleteCustomExam(id: string): void {
  if (typeof window !== 'undefined') {
    const current = getSavedCustomExams();
    const updated = current.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEY_SAVED_EXAMS, JSON.stringify(updated));
  }
}

/**
 * Converts a File object to base64 inline data format for Gemini API
 */
export async function fileToGenerativePart(file: File): Promise<{ inlineData: { data: string; mimeType: string } }> {
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

const SYSTEM_INSTRUCTION = `Jsi elitní zkušební komisař, instruktor a metodik Akademie Vězeňské služby České republiky (ZOP A).
Tvým úkolem je analyzovat zadání testu, otázek, písemky či modelové situace (buď z textu, nebo z vyfoceného papíru/skenu), které studentům zadali kapitáni nebo učitelé.

KRITICKÁ PRAVIDLA PRO ZPRACOVÁNÍ:
1. VYČERPAJÍCÍ OCR A EXTRAKCE: Extrahuj a zpracuj ÚPLNĚ VŠECHNY otázky, body, podbody a cvičení, která se na fotce či v textu nacházejí. NIKDY nezkracuj počet otázek ani nic nevynechávej (pokud je na fotce 12, 20 nebo 35 otázek, MUSÍŠ zpracovat všech 12, 20 či 35 otázek do pole 'questions').
2. PRECIZNÍ A ODBORNÉ ODPOVĚDI: Pro každou otázku vytvoř 100% odborně a právně správnou a úplnou odpověď dle platné legislativy VS ČR:
   - Zákon č. 555/1992 Sb., o Vězeňské službě a justiční stráži ČR
   - Zákon č. 169/1999 Sb., o výkonu trestu odnětí svobody
   - Zákon č. 293/1993 Sb., o výkonu vazby
   - Zákon č. 40/2009 Sb., trestní zákoník
   - Zákon č. 141/1961 Sb., trestní řád
   - Zákon č. 361/2003 Sb., o služebním poměru
   - Nařízení generálního ředitele (NGŘ č. 33/2019, 24/2022, 41/2024, 2/2026, 28/2018 Sb.)
   - Metodiky TCCC (Tactical Combat Casualty Care), zbraňové bezpečnosti (CZ 75 B, Scorpion EVO 3A1) a spisové služby ETŘ / VIS.
3. KVALITNÍ A VYVÁŽENÉ DISTRAKTORY: Pro každou otázku připrav 4 testové možnosti (options A, B, C, D). VŠECHNY 4 MOŽNOSTI MUSÍ MÍT SROVNATELNOU DÉLKU, GRAMATICKOU STRUKTURU A ODBORNÝ TÓN jako správná odpověď. Používej věrohodné chytáky z praxe VS ČR (záměny paragrafů, lhůt, pravomocí, sankcí, stupňů ostrahy), aby správná odpověď NEBYLA poznat pouhou délkou či jednoduchostí špatných odpovědí.
4. ZÁKONNÉ ODŮVODNĚNÍ: Ke každé otázce uveď podrobné vysvětlení (rationale) s citací přesného paragrafu a odstavce a pramen (source).

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

export async function analyzeExamContent(
  apiKey: string,
  textPrompt?: string,
  imageFile?: File
): Promise<AnalyzedExamResponse> {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Chybí Gemini API klíč. Zadejte prosím svůj API klíč v nastavení asistenta.');
  }

  const ai = new GoogleGenAI({ apiKey: apiKey.trim() });

  const contents: any[] = [];

  if (imageFile) {
    const imagePart = await fileToGenerativePart(imageFile);
    contents.push(imagePart);
  }

  let promptText = `Pečlivě analyzuj CELÉ toto zadání testu od kapitána pro studenty Akademie VS ČR (ZOP A). Extrahuj VŠECHNY otázky a body bez jakéhokoliv vynechání a vypracuj k nim profesionální odpovědi s citacemi zákonů a vyváženými možnostmi A, B, C, D.`;
  if (textPrompt && textPrompt.trim() !== '') {
    promptText += `\n\nZadání od uživatele / kapitána:\n"""\n${textPrompt.trim()}\n"""`;
  }
  contents.push(promptText);

  const modelsToTry = ['gemini-2.0-flash', 'gemini-1.5-flash'];
  let lastError: any = null;

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
        lastError = new Error('Model nevrátil žádnou odpověď.');
        continue;
      }

      // Parse JSON (strip possible markdown fences)
      const cleaned = responseText.replace(/^```(?:json)?\s*|\s*```$/gi, '').trim();
      const parsed: AnalyzedExamResponse = JSON.parse(cleaned);

      // Validate and sanitize questions
      if (!parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
        throw new Error('Ze zadání se nepodařilo extrahovat žádné otázky. Zkontrolujte prosím kvalitu fotky nebo textu.');
      }

      parsed.questions = parsed.questions.map((q, idx) => ({
        id: q.id || `custom-q-${Date.now()}-${idx + 1}`,
        subject: q.subject || parsed.subject || 'Služební příprava',
        topic: q.topic || 'Zadání od kapitána',
        question: q.question || 'Otázka bez znění',
        answer: q.answer || (q.options && q.correctOption !== undefined ? q.options[q.correctOption] : ''),
        options: q.options && q.options.length >= 2 ? q.options : ['Správná možnost', 'Nesprávná možnost'],
        correctOption: typeof q.correctOption === 'number' ? q.correctOption : 0,
        rationale: q.rationale || 'Ověřeno dle interních norem VS ČR.',
        source: q.source || 'Předpisy VS ČR'
      }));

      return parsed;
    } catch (err: any) {
      console.warn(`Model ${modelName} failed, trying next...`, err);
      lastError = err;
      continue;
    }
  }

  // All models failed
  if (lastError) {
    console.error('Gemini Analysis Error:', lastError);
    if (lastError.message && lastError.message.includes('API_KEY_INVALID')) {
      throw new Error('Zadaný Gemini API klíč je neplatný. Zkontrolujte prosím jeho správnost.');
    }
    throw new Error(lastError.message || 'Nepodařilo se zpracovat zadání pomocí AI. Zkontrolujte připojení k internetu a API klíč.');
  }
  throw new Error('Model nevrátil žádnou odpověď.');
}
