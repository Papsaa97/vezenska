import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useDialog } from '../../hooks/useDialog';
import { Calendar, Download, Printer, X, ZoomIn, ZoomOut } from 'lucide-react';
import { ClassBoardItem } from '../../utils/classBoardService';

interface ScheduleLightboxProps {
  item: ClassBoardItem;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  onClose: () => void;
  onPrint: () => void;
}

export default function ScheduleLightbox({
  item,
  zoom,
  setZoom,
  onClose,
  onPrint,
}: ScheduleLightboxProps) {
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.75));
  const handleZoomReset = () => setZoom(1);

  const handleDownload = () => {
    if (!item.scheduleUrl) return;
    const a = document.createElement('a');
    a.href = item.scheduleUrl;
    a.download = `Rozvrh_${item.className.replace(/\s+/g, '_')}.jpg`;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.click();
  };

  // Escape, past na fokus a jeho návrat po zavření — viz hooks/useDialog.
  const dialogRef = useDialog<HTMLDivElement>({ isOpen: true, onClose });

  const scrollerRef = useRef<HTMLDivElement>(null);
  const [natural, setNatural] = useState<{ width: number; height: number } | null>(null);
  const [viewport, setViewport] = useState<{ width: number; height: number } | null>(null);

  // Rozměr plochy se sleduje průběžně, aby se rozvrh přizpůsobil i změně
  // velikosti okna, ne jen prvnímu otevření.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const measure = () => setViewport({ width: el.clientWidth, height: el.clientHeight });
    measure();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Skutečné rozměry fotky; do té doby se obrázek jen vejde na plochu.
  const scheduleUrl = item.scheduleUrl;
  useEffect(() => {
    if (!scheduleUrl) return;
    let cancelled = false;
    const probe = new Image();
    probe.onload = () => {
      if (!cancelled && probe.naturalWidth > 0 && probe.naturalHeight > 0) {
        setNatural({ width: probe.naturalWidth, height: probe.naturalHeight });
      }
    };
    probe.src = scheduleUrl;
    return () => {
      cancelled = true;
    };
  }, [scheduleUrl]);

  // Při 100 % se celý rozvrh vejde na plochu (menší obrázek se nezvětšuje);
  // přiblížení z toho násobí skutečnou šířku a výšku.
  const PADDING = 32;
  const imageSize =
    natural && viewport
      ? (() => {
          const fit = Math.min(
            1,
            Math.max(0.05, (viewport.width - PADDING) / natural.width),
            Math.max(0.05, (viewport.height - PADDING) / natural.height)
          );
          return {
            width: Math.round(natural.width * fit * zoom),
            height: Math.round(natural.height * fit * zoom),
          };
        })()
      : null;

  const canPan =
    !!imageSize && !!viewport && (imageSize.width + PADDING > viewport.width || imageSize.height + PADDING > viewport.height);

  // Posun tažením myší (na dotykovém displeji posouvá prohlížeč sám).
  const dragRef = useRef<{ x: number; y: number; left: number; top: number; moved: boolean } | null>(null);
  const [dragging, setDragging] = useState(false);
  const suppressClickRef = useRef(false);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    if (!el || !canPan || e.pointerType !== 'mouse' || e.button !== 0) return;
    dragRef.current = { x: e.clientX, y: e.clientY, left: el.scrollLeft, top: el.scrollTop, moved: false };
    el.setPointerCapture(e.pointerId);
    setDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    const start = dragRef.current;
    if (!el || !start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) start.moved = true;
    el.scrollLeft = start.left - dx;
    el.scrollTop = start.top - dy;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    if (dragRef.current?.moved) suppressClickRef.current = true;
    dragRef.current = null;
    setDragging(false);
    if (el?.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
  };

  // Tažení končící na prázdné ploše nesmí lightbox zavřít.
  const handleBackdropClick = useCallback(() => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    onClose();
  }, [onClose]);

  return (
    <motion.div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="schedule-lightbox-title"
      tabIndex={-1}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col"
    >
      <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-4 text-white">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-400" />
          <span id="schedule-lightbox-title" className="font-bold text-sm sm:text-base">Rozvrh hodin – {item.className}</span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 0.75}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 disabled:opacity-30 cursor-pointer"
              title="Oddálit"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomReset}
              className="px-2 py-1 text-xs font-bold text-slate-300 hover:text-white cursor-pointer"
              title="Obnovit 100%"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= 3}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 disabled:opacity-30 cursor-pointer"
              title="Přiblížit"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleDownload}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
            title="Stáhnout rozvrh"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={onPrint}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
            title="Vytisknout v A4"
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-red-600/80 hover:bg-red-600 text-white cursor-pointer ml-2"
            title="Zavřít"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Posouvání a přiblížení.
          Dřív byl obrázek zmenšený přes `transform: scale` ve flexu vystředěném
          přes items-center. Transformace nemění rozměr v rozvržení, takže
          posuvníky o zvětšeném obrázku nevěděly, a vystředění přetékající obsah
          ořízlo nahoře a vlevo — na PC po zmenšení okna nešlo s rozvrhem
          hýbat a horní část fotky nebyla vidět (hlášení z 29. 9. 2026).
          Teď má obrázek skutečnou šířku v pixelech, obal roste s ním
          (w-max, min-w/h-full) a vystředění mimo přetečení nic neořízne. */}
      <div
        ref={scrollerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`relative flex-1 overflow-auto select-none ${canPan ? (dragging ? 'cursor-grabbing' : 'cursor-grab') : ''}`}
      >
        <div className="relative w-max min-w-full min-h-full flex items-center justify-center p-4">
          {/* Prázdná plocha kolem rozvrhu zavírá kliknutím. Je to dekorace pod
              obrázkem: pro odečítač neexistuje a klávesnice má Escape (useDialog).
              Obrázek leží nad ní, takže klik na něj lightbox nezavře. */}
          <div
            aria-hidden="true"
            onClick={handleBackdropClick}
            className={`absolute inset-0 ${canPan ? '' : 'cursor-zoom-out'}`}
          />
          {item.scheduleUrl && (
            <img
              src={item.scheduleUrl}
              alt={`Rozvrh ${item.className}`}
              draggable={false}
              style={imageSize ? { width: imageSize.width, height: imageSize.height, maxWidth: 'none' } : undefined}
              className={`relative rounded-xl shadow-2xl border border-slate-800 ${
                imageSize ? '' : 'max-w-[90vw] max-h-[82vh] object-contain'
              }`}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}
