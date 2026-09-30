import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Minus, Plus, MoveHorizontal, AlertCircle } from 'lucide-react';
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist/legacy/build/pdf.mjs';

/**
 * PDF vykreslené přímo v aplikaci přes pdf.js.
 *
 * Proč ne vestavěný prohlížeč přes <object> nebo <iframe>: bezpečnostní
 * hlavička aplikace (vercel.json) má `object-src 'none'` a `frame-src` jen pro
 * captchu, takže vestavěný prohlížeč PDF se v produkci nikdy nezobrazil
 * a uživatel viděl jen „Váš prohlížeč neumí zobrazit PDF“. Na Chromebooku
 * v nainstalované aplikaci a na většině telefonů by nefungoval ani bez ní.
 * pdf.js kreslí stránky do <canvas> a jeho worker se načítá ze stejné domény,
 * což hlavička povoluje (`worker-src 'self' blob:`).
 *
 * Použitá je „legacy“ sestava: běží i ve starších prohlížečích telefonů, kde
 * moderní sestava padá na chybějících novinkách JavaScriptu.
 */

interface PdfViewerProps {
  data: Blob;
  /** Volá se, když se PDF nepodaří otevřít — prohlížeč pak nabídne náhradu. */
  onError?: (message: string) => void;
}

/** Rozměry stránky při měřítku 1 (v bodech PDF). */
interface PageSize {
  width: number;
  height: number;
}

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;
const FIT_MAX_ZOOM = 1.5;

/** Vodorovný okraj kolem stránky, se kterým počítá „přizpůsobit šířce“. */
const PAGE_GUTTER = 32;

async function loadPdfJs() {
  const [pdfjs, worker] = await Promise.all([
    import('pdfjs-dist/legacy/build/pdf.mjs'),
    import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url'),
  ]);
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  return pdfjs;
}

interface PdfPageProps {
  doc: PDFDocumentProxy;
  pageNumber: number;
  /** Odhad rozměrů před načtením stránky, ať posuvník neskáče. */
  estimate: PageSize;
  zoom: number;
  scrollRoot: HTMLElement | null;
}

function PdfPage({ doc, pageNumber, estimate, zoom, scrollRoot }: PdfPageProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState<PageSize>(estimate);
  const [visible, setVisible] = useState(false);

  // Stránka se vykreslí, až když se přiblíží k výřezu — u dlouhého předpisu
  // by vykreslení všech stran naráz zahltilo paměť telefonu.
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setVisible(true);
      },
      { root: scrollRoot, rootMargin: '600px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [scrollRoot]);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    let task: RenderTask | null = null;

    (async () => {
      const page = await doc.getPage(pageNumber);
      if (cancelled) return;
      const base = page.getViewport({ scale: 1 });
      setSize({ width: base.width, height: base.height });

      const canvas = canvasRef.current;
      const context = canvas?.getContext('2d');
      if (!canvas || !context) return;

      // Kreslí se v rozlišení displeje, jinak je text na ostrém displeji rozmazaný.
      const ratio = window.devicePixelRatio || 1;
      const viewport = page.getViewport({ scale: zoom * ratio });
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      task = page.render({ canvas, canvasContext: context, viewport });
      try {
        await task.promise;
      } catch {
        // Zrušené vykreslení (změna přiblížení, zavření okna) není chyba.
      }
    })();

    return () => {
      cancelled = true;
      task?.cancel();
    };
  }, [doc, pageNumber, zoom, visible]);

  return (
    <div
      ref={wrapperRef}
      data-page={pageNumber}
      className="relative mx-auto bg-white shadow-md"
      style={{ width: size.width * zoom, height: size.height * zoom }}
    >
      <canvas
        ref={canvasRef}
        aria-label={`Strana ${pageNumber}`}
        className="block w-full h-full"
      />
      {!visible && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-300 text-xs">
          Strana {pageNumber}
        </div>
      )}
    </div>
  );
}

export default function PdfViewer({ data, onError }: PdfViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollRoot, setScrollRoot] = useState<HTMLDivElement | null>(null);
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [firstPage, setFirstPage] = useState<PageSize | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [fitWidth, setFitWidth] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const onErrorRef = useRef(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  });

  useEffect(() => {
    setScrollRoot(scrollRef.current);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let loaded: PDFDocumentProxy | null = null;
    setDoc(null);
    setFirstPage(null);
    setError(null);
    setCurrentPage(1);

    (async () => {
      try {
        const pdfjs = await loadPdfJs();
        const bytes = new Uint8Array(await data.arrayBuffer());
        // useWasm: false — bezpečnostní hlavička WebAssembly nepovoluje
        // (chybí 'wasm-unsafe-eval'); pdf.js pak použije dekodéry v JavaScriptu.
        loaded = await pdfjs.getDocument({ data: bytes, useWasm: false }).promise;
        if (cancelled) {
          void loaded.destroy();
          return;
        }
        const page = await loaded.getPage(1);
        const base = page.getViewport({ scale: 1 });
        if (cancelled) return;
        setFirstPage({ width: base.width, height: base.height });
        setDoc(loaded);
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        onErrorRef.current?.(message);
      }
    })();

    return () => {
      cancelled = true;
      if (loaded) void loaded.destroy();
    };
  }, [data]);

  // „Přizpůsobit šířce“ přepočítá měřítko při každé změně šířky okna.
  const applyFitWidth = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !firstPage) return;
    const available = el.clientWidth - PAGE_GUTTER;
    // Na širokém monitoru by stránka přes celou šířku byla obří — strop 150 %.
    const next = Math.min(FIT_MAX_ZOOM, Math.max(MIN_ZOOM, available / firstPage.width));
    setZoom(next);
  }, [firstPage]);

  useEffect(() => {
    if (!fitWidth) return;
    applyFitWidth();
    const el = scrollRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => applyFitWidth());
    observer.observe(el);
    return () => observer.disconnect();
  }, [fitWidth, applyFitWidth]);

  const changeZoom = (delta: number) => {
    setFitWidth(false);
    setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round((z + delta) * 100) / 100)));
  };

  // Číslo aktuální strany podle toho, která je nejblíž horní hraně výřezu.
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top;
    const pages = el.querySelectorAll<HTMLElement>('[data-page]');
    let best = 1;
    for (const page of pages) {
      if (page.getBoundingClientRect().top - top <= el.clientHeight / 3) {
        best = Number(page.dataset.page);
      } else {
        break;
      }
    }
    setCurrentPage(best);
  };

  const toolButton =
    'min-w-9 min-h-9 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer';

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between gap-2 px-3 py-1 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shrink-0 text-xs">
        <span className="font-semibold text-slate-500 dark:text-slate-400 tabular-nums" aria-live="polite">
          {doc ? `Strana ${currentPage} / ${doc.numPages}` : 'Načítám…'}
        </span>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => changeZoom(-ZOOM_STEP)}
            disabled={!doc || zoom <= MIN_ZOOM}
            aria-label="Oddálit"
            className={toolButton}
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-12 text-center font-bold text-slate-600 dark:text-slate-300 tabular-nums">
            {Math.round(zoom * 100)} %
          </span>
          <button
            type="button"
            onClick={() => changeZoom(ZOOM_STEP)}
            disabled={!doc || zoom >= MAX_ZOOM}
            aria-label="Přiblížit"
            className={toolButton}
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setFitWidth(true)}
            disabled={!doc}
            aria-pressed={fitWidth}
            aria-label="Přizpůsobit šířce"
            title="Přizpůsobit šířce okna"
            className={`${toolButton} ${fitWidth ? 'bg-slate-200 dark:bg-slate-800' : ''}`}
          >
            <MoveHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-auto overscroll-contain bg-slate-200 dark:bg-slate-950 py-4 space-y-4"
      >
        {error ? (
          <div className="p-6">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>PDF se nepodařilo otevřít ({error}). Stáhněte si ho nebo ho otevřete na nové kartě.</span>
            </div>
          </div>
        ) : !doc || !firstPage ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <span className="text-sm">Připravuji PDF…</span>
          </div>
        ) : (
          Array.from({ length: doc.numPages }, (_, i) => (
            <PdfPage
              key={i + 1}
              doc={doc}
              pageNumber={i + 1}
              estimate={firstPage}
              zoom={zoom}
              scrollRoot={scrollRoot}
            />
          ))
        )}
      </div>
    </div>
  );
}
