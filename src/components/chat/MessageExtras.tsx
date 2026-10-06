import React, { useEffect, useState } from 'react';
import { BookOpen, Compass, Download, Eye, FileText, HelpCircle, Library, Loader2, Puzzle, Scale } from 'lucide-react';
import {
  CHAT_ATTACHMENT_BUCKET,
  ChatAttachment,
  attachmentAsMaterial,
  attachmentUrl,
} from '../../utils/chat';
import { CHAT_SHARE_LABEL, ChatShare, SharedQuestion, appItemHash, compassHash } from '../../utils/chatShare';
import {
  MATERIALS_BUCKET,
  StudyMaterial,
  downloadMaterial,
  formatFileSize,
  getFileKind,
  getFileTypeLabel,
} from '../../utils/materials';

/** Otevření souboru v prohlížeči souborů (stejný jako v Knihovně). */
export type OpenFileHandler = (material: StudyMaterial, bucket: string) => void;

/** Umí soubor ukázat prohlížeč v aplikaci? HEIC z iPhonu ne (jen Safari). */
function canPreview(type: string, name: string): boolean {
  if (/heic|heif/i.test(type) || /\.(heic|heif)$/i.test(name)) return false;
  return getFileKind(type, name) !== 'other';
}

const CARD =
  'w-full max-w-[85%] sm:max-w-[70%] rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100';

function DownloadButton({ material, bucket, label }: { material: StudyMaterial; bucket: string; label: string }) {
  const [busy, setBusy] = useState<boolean>(false);
  const [failed, setFailed] = useState<string | null>(null);
  const run = async () => {
    setBusy(true);
    setFailed(await downloadMaterial(material, bucket));
    setBusy(false);
  };
  return (
    <>
      <button
        type="button"
        onClick={() => void run()}
        disabled={busy}
        aria-label={`Stáhnout ${label}`}
        title="Stáhnout"
        className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800 cursor-pointer disabled:opacity-50"
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Download className="w-4 h-4" aria-hidden="true" />}
      </button>
      {failed && (
        <span role="alert" title={failed} className="text-[0.6875rem] text-red-600 dark:text-red-400">
          Nestaženo
        </span>
      )}
    </>
  );
}

/** Řádek souboru: ikona, název, typ a velikost, otevřít a stáhnout. */
function FileRow({
  material,
  bucket,
  title,
  caption,
  onOpenFile,
}: {
  material: StudyMaterial;
  bucket: string;
  title: string;
  caption?: string;
  onOpenFile: OpenFileHandler;
}) {
  const previewable = canPreview(material.mimeType, material.name);
  return (
    <div className="flex items-center gap-2.5 p-2.5">
      <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
        <FileText className="w-4 h-4" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        {caption && <div className="text-[0.6875rem] font-semibold text-slate-500 dark:text-slate-400">{caption}</div>}
        <div className="text-sm font-semibold truncate" title={title}>
          {title}
        </div>
        <div className="text-[0.6875rem] text-slate-500 dark:text-slate-400">
          {getFileTypeLabel(material.mimeType, material.name)}
          {material.size > 0 && ` · ${formatFileSize(material.size)}`}
        </div>
      </div>
      {previewable && (
        <button
          type="button"
          onClick={() => onOpenFile(material, bucket)}
          aria-label={`Otevřít ${title}`}
          title="Otevřít v aplikaci"
          className="p-2 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 cursor-pointer"
        >
          <Eye className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
      <DownloadButton material={material} bucket={bucket} label={title} />
    </div>
  );
}

/** Příloha jako řádek (bez náhledu obrázku) — přehled souborů konverzace. */
export function AttachmentRow({
  attachment,
  caption,
  onOpenFile,
}: {
  attachment: ChatAttachment;
  caption?: string;
  onOpenFile: OpenFileHandler;
}) {
  return (
    <FileRow
      material={attachmentAsMaterial(attachment)}
      bucket={CHAT_ATTACHMENT_BUCKET}
      title={attachment.name}
      caption={caption}
      onOpenFile={onOpenFile}
    />
  );
}

/** Příloha zprávy: obrázek jako náhled, ostatní soubory jako řádek. */
export function AttachmentBlock({ attachment, onOpenFile }: { attachment: ChatAttachment; onOpenFile: OpenFileHandler }) {
  const material = attachmentAsMaterial(attachment);
  const isImage = getFileKind(attachment.type, attachment.path) === 'image' && canPreview(attachment.type, attachment.path);
  const [src, setSrc] = useState<string | null>(null);
  const [broken, setBroken] = useState<boolean>(false);

  useEffect(() => {
    if (!isImage) return;
    let cancelled = false;
    void attachmentUrl(attachment.path).then((url) => {
      if (cancelled) return;
      if (!url) {
        setBroken(true);
        return;
      }
      // Obrázek se nejdřív zkusí načíst mimo stránku: nepovede-li se,
      // ukáže se místo rozbitého obrázku řádek se souborem ke stažení.
      const probe = new Image();
      probe.onload = () => {
        if (!cancelled) setSrc(url);
      };
      probe.onerror = () => {
        if (!cancelled) setBroken(true);
      };
      probe.src = url;
    });
    return () => {
      cancelled = true;
    };
  }, [isImage, attachment.path]);

  if (isImage && !broken) {
    return (
      <button
        type="button"
        onClick={() => onOpenFile(material, CHAT_ATTACHMENT_BUCKET)}
        aria-label={`Zvětšit obrázek ${attachment.name}`}
        className="block max-w-[85%] sm:max-w-[70%] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 cursor-zoom-in"
      >
        {src ? (
          <img
            src={src}
            alt={attachment.name}
            className="block max-h-64 w-auto max-w-full object-contain"
          />
        ) : (
          <span className="flex items-center gap-2 px-4 py-6 text-xs text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Načítám obrázek…
          </span>
        )}
      </button>
    );
  }

  return (
    <div className={CARD}>
      <FileRow material={material} bucket={CHAT_ATTACHMENT_BUCKET} title={attachment.name} onOpenFile={onOpenFile} />
    </div>
  );
}

function QuestionCard({ share }: { share: SharedQuestion }) {
  const [revealed, setRevealed] = useState<boolean>(false);
  return (
    <div className="p-3 space-y-2">
      <div className="flex items-center gap-1.5 text-[0.6875rem] font-semibold text-slate-500 dark:text-slate-400">
        <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
        {CHAT_SHARE_LABEL.otazka}
        {share.predmet && <span>· {share.predmet}</span>}
      </div>
      <p className="text-sm font-semibold leading-snug whitespace-pre-wrap break-words">{share.otazka}</p>
      {share.moznosti.length > 0 && (
        <ol className="space-y-1">
          {share.moznosti.map((option, i) => {
            const correct = revealed && share.spravna === i;
            return (
              <li
                key={`${i}-${option}`}
                className={`text-xs leading-relaxed rounded-lg px-2 py-1 border ${
                  correct
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200 font-semibold'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <span className="font-bold mr-1">{String.fromCharCode(65 + i)})</span>
                {option}
                {correct && <span className="sr-only"> (správná odpověď)</span>}
              </li>
            );
          })}
        </ol>
      )}
      {revealed ? (
        <div className="text-xs leading-relaxed space-y-1 border-t border-slate-200 dark:border-slate-700 pt-2">
          {(share.spravna === null || share.moznosti.length === 0) && share.odpoved && (
            <p>
              <span className="font-semibold">Odpověď:</span> {share.odpoved}
            </p>
          )}
          {share.oduvodneni && <p className="whitespace-pre-wrap break-words">{share.oduvodneni}</p>}
          {share.pramen && <p className="text-slate-500 dark:text-slate-400">Pramen: {share.pramen}</p>}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
        >
          Ukázat správnou odpověď
        </button>
      )}
    </div>
  );
}

/** Věc sdílená z aplikace: soubor z Knihovny, otázka, předpis, článek. */
export function SharedItemCard({ share, onOpenFile }: { share: ChatShare; onOpenFile: OpenFileHandler }) {
  if (share.druh === 'material') {
    const material: StudyMaterial = {
      name: share.cesta,
      displayName: share.nazev,
      folderSubject: '',
      size: share.velikost,
      createdAt: '',
      mimeType: share.typ,
    };
    return (
      <div className={CARD}>
        <FileRow
          material={material}
          bucket={MATERIALS_BUCKET}
          title={share.nazev}
          caption={CHAT_SHARE_LABEL.material}
          onOpenFile={onOpenFile}
        />
      </div>
    );
  }

  if (share.druh === 'otazka') {
    return (
      <div className={CARD}>
        <QuestionCard share={share} />
      </div>
    );
  }

  const isAppItem = share.druh === 'scenar' || share.druh === 'poznavacka';
  const Icon = share.druh === 'predpis' ? Library : share.druh === 'scenar' ? Compass : share.druh === 'poznavacka' ? Puzzle : Scale;
  const detail = isAppItem ? share.popis : share.kod;
  return (
    <div className={CARD}>
      <a
        href={isAppItem ? appItemHash(share) : compassHash(share)}
        className="flex items-center gap-2.5 p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60"
      >
        <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
          <Icon className="w-4 h-4" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[0.6875rem] font-semibold text-slate-500 dark:text-slate-400">{CHAT_SHARE_LABEL[share.druh]}</div>
          <div className="text-sm font-semibold truncate">{share.nazev}</div>
          {detail && <div className="text-[0.6875rem] text-slate-500 dark:text-slate-400 truncate">{detail}</div>}
        </div>
        <span className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 shrink-0">
          <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
          Otevřít
        </span>
      </a>
    </div>
  );
}
