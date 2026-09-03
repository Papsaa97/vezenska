import { LegalArticle } from '../data/legalCompasData';

export interface IntegrityIssue {
  id: string;
  field: string;
  type: 'empty' | 'too_short' | 'truncated' | 'unclosed_quote' | 'duplicate_id' | 'formatting' | 'missing_law';
  message: string;
}

export interface AuditReport {
  timestamp: string;
  totalArticles: number;
  totalWords: number;
  totalCharacters: number;
  categories: Record<string, number>;
  issues: IntegrityIssue[];
  valid: boolean;
}

export function auditLegalDatabase(articles: LegalArticle[]): AuditReport {
  const issues: IntegrityIssue[] = [];
  const seenIds = new Set<string>();
  const categories: Record<string, number> = {};
  let totalWords = 0;
  let totalCharacters = 0;

  articles.forEach((art, index) => {
    // 1. ID check
    if (!art.id || art.id.trim() === '') {
      issues.push({ id: `index-${index}`, field: 'id', type: 'empty', message: 'ID článku chybí nebo je prázdné.' });
    } else if (seenIds.has(art.id)) {
      issues.push({ id: art.id, field: 'id', type: 'duplicate_id', message: `Duplicitní ID: ${art.id}` });
    } else {
      seenIds.add(art.id);
    }

    // 2. Category check
    if (!art.category) {
      issues.push({ id: art.id, field: 'category', type: 'empty', message: 'Kategorie není definována.' });
    } else {
      categories[art.category] = (categories[art.category] || 0) + 1;
    }

    // 3. Act Number and Title
    if (!art.actNumber || art.actNumber.trim().length < 3) {
      issues.push({ id: art.id, field: 'actNumber', type: 'too_short', message: `Číslo předpisu je příliš krátké: "${art.actNumber}".` });
    }
    if (!art.actTitle || art.actTitle.trim().length < 5) {
      issues.push({ id: art.id, field: 'actTitle', type: 'too_short', message: `Název předpisu je příliš krátký: "${art.actTitle}".` });
    }

    // 4. Section and Title
    if (!art.section || art.section.trim().length < 1) {
      issues.push({ id: art.id, field: 'section', type: 'empty', message: 'Paragraf / označení ustanovení chybí.' });
    }
    if (!art.title || art.title.trim().length < 4) {
      issues.push({ id: art.id, field: 'title', type: 'too_short', message: `Nadpis článku je příliš krátký: "${art.title}".` });
    }

    // 5. Exact Text Integrity Check
    if (!art.exactText || art.exactText.trim().length < 20) {
      issues.push({ id: art.id, field: 'exactText', type: 'empty', message: 'Přesné znění je prázdné nebo příliš krátké (< 20 znaků).' });
    } else {
      const text = art.exactText.trim();
      totalCharacters += text.length;
      totalWords += text.split(/\s+/).filter(Boolean).length;

      // Check if text ends abruptly mid-sentence
      const lastChar = text.slice(-1);
      const validEndChars = ['.', '!', '?', ':', ')', ']', '"', '“', '”', '»', '—', ';'];
      if (!validEndChars.includes(lastChar) && !text.endsWith('Sb.') && !text.endsWith('Kč')) {
        issues.push({
          id: art.id,
          field: 'exactText',
          type: 'truncated',
          message: `Text možná končí oříznutý nebo bez správného zakončení (končí "${lastChar}", závěr: "${text.slice(-30)}").`
        });
      }

      // Check for odd unescaped ASCII double quotes
      const doubleQuotesCount = (text.match(/"/g) || []).length;
      if (doubleQuotesCount % 2 !== 0) {
        issues.push({
          id: art.id,
          field: 'exactText',
          type: 'unclosed_quote',
          message: `Nespárované uvozovky v exactText (${doubleQuotesCount} uvozovek).`
        });
      }
    }

    // 6. Explanation Check
    if (!art.explanation || art.explanation.trim().length < 20) {
      issues.push({ id: art.id, field: 'explanation', type: 'empty', message: 'Výklad je prázdný nebo příliš krátký (< 20 znaků).' });
    } else {
      totalCharacters += art.explanation.length;
      totalWords += art.explanation.split(/\s+/).filter(Boolean).length;
    }

    // 7. Exam Tips Check
    if (!art.examTips || art.examTips.trim().length < 15) {
      issues.push({ id: art.id, field: 'examTips', type: 'empty', message: 'Zkušební chytáky jsou prázdné nebo příliš krátké (< 15 znaků).' });
    } else {
      totalCharacters += art.examTips.length;
      totalWords += art.examTips.split(/\s+/).filter(Boolean).length;
    }
  });

  return {
    timestamp: new Date().toISOString(),
    totalArticles: articles.length,
    totalWords,
    totalCharacters,
    categories,
    issues,
    valid: issues.length === 0
  };
}
