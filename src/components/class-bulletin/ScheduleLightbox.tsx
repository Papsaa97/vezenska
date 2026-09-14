import React from 'react';
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

      <div
        onClick={onClose}
        className="flex-1 overflow-auto flex items-center justify-center p-4 select-none cursor-zoom-out"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="transition-transform duration-200 cursor-default"
          style={{ transform: `scale(${zoom})` }}
        >
          {item.scheduleUrl && (
            <img
              src={item.scheduleUrl}
              alt={`Rozvrh ${item.className}`}
              className="max-w-[90vw] max-h-[82vh] object-contain rounded-xl shadow-2xl border border-slate-800"
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}
