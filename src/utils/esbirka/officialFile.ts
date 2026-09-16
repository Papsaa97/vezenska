/**
 * Získání úředního souboru (PDF/DOCX) daného znění z e-Sbírky.
 *
 * PROČ TO NENÍ JEN ODKAZ: e-Sbírka soubor nevrací rovnou. Nejdřív se o něj
 * požádá — endpoint `stahni/informativni-zneni/{id}/{formát}` vrátí JSON
 * s `pozadavekId`, `stavPozadavku` a `id` hotového souboru — a teprve tohle
 * `id` ukazuje na samotný soubor v souborové službě.
 *
 * Dřívější verze aplikace dávala do odkazu „Úřední PDF“ rovnou adresu pro
 * požádání, takže se čtenáři místo zákona otevřel kus JSONu. Ověřeno měřením:
 * ta adresa vrací `content-type: application/json`, 168 bajtů.
 *
 * Krok 1 jde přes vlastní proxy (e-Sbírka nepovoluje CORS pro cizí domény).
 * Krok 2 přes proxy jít nemusí a nemá: na hotový soubor se z prohlížeče
 * naviguje, a navigace omezení CORS nepodléhá.
 */
import { buildFileUrl } from './eli';
import { ESBIRKA_PROXY_PATH } from './client';

interface FileRequestResponse {
  pozadavekId?: string;
  id?: string;
  stavPozadavku?: string;
  nazevDokumentu?: string;
  chyba?: string;
  chyby?: Array<{ kod?: string; popis?: string }>;
}

/**
 * Vrátí adresu hotového úředního souboru. Nestahuje ho — volající s adresou
 * naloží podle sebe (otevře v novém panelu, nabídne ke stažení).
 */
export async function fetchOfficialFileUrl(
  dokumentId: number,
  format: 'PDF' | 'DOCX' = 'PDF'
): Promise<string> {
  const params = new URLSearchParams({
    endpoint: 'stahni',
    dokumentId: String(dokumentId),
    format,
  });

  const response = await fetch(`${ESBIRKA_PROXY_PATH}?${params.toString()}`, {
    headers: { Accept: 'application/json' },
  });
  const raw = await response.text();

  let data: FileRequestResponse;
  try {
    data = JSON.parse(raw) as FileRequestResponse;
  } catch {
    // Na statickém nasazení bez serverless funkce se sem vrátí index.html.
    throw new Error(
      response.ok
        ? 'Most k e-Sbírce na /api/esbirka není na tomto nasazení dostupný.'
        : `Most k e-Sbírce odpověděl stavem HTTP ${response.status}.`
    );
  }

  if (!response.ok) {
    throw new Error(data.chyba || data.chyby?.[0]?.popis || `HTTP ${response.status}`);
  }

  // `stavPozadavku` bývá OK hned; u rozsáhlých předpisů se soubor může chvíli
  // generovat a `id` ještě nepřijde. Slibovat pak hotový soubor by bylo lhaní.
  if (!data.id) {
    throw new Error(
      data.stavPozadavku === 'PROBIHA'
        ? 'e-Sbírka soubor teprve připravuje. Zkuste to prosím za chvíli znovu.'
        : 'e-Sbírka nevrátila identifikátor souboru.'
    );
  }

  return buildFileUrl(data.id);
}
