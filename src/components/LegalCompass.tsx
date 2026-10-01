import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Scale, BookOpen, ClipboardCheck, Printer, CheckCircle2, Info, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { legalDatabase } from '../data/legalCompasData';
import { compassTargetFromHash } from '../utils/chatShare';
import { RegulationDocument, VscrRegulation, VSCR_REGULATIONS_REGISTRY } from '../data/vscrRegulationsRegistry';
import { NAV_TAB_LABELS } from '../data/navTabs';
import {
  LEGAL_CATEGORY_LABELS,
  LEGAL_CATEGORY_ORDER,
  REGULATION_TYPE_LABELS,
  REGULATION_TYPE_ORDER,
} from './legal-compass/legalCompassLabels';
import { auditLegalDatabase, measureRegulationCoverage, AuditReport } from '../utils/legalIntegrity';
import { prefetchAllSnapshots, formatMegabytes, countCachedSnapshots } from '../utils/esbirka/offline';
import { speakText, stopSpeaking } from '../utils/speech';
import { foldSearchText } from '../utils/searchText';
import ConfirmDialog from './common/ConfirmDialog';
import { useAuth } from '../context/AuthContext';
import {
  isDefaultRegulation,
  recordOfflineDownload,
  getOfflineStatus,
  purgeLegacyOfflineCache,
  exportRegulationsToJSON,
  parseRegulationsJSON,
  readLegacyLocalRegulations,
  clearLegacyLocalRegulations,
} from '../utils/regulationsStorage';
import { useEditableContent } from '../hooks/useEditableContent';
import LegalEditorModal from './legal-compass/LegalEditorModal';
import LegalAuditModal from './legal-compass/LegalAuditModal';
import LegalReaderModal from './legal-compass/LegalReaderModal';
import LegalRegistryView from './legal-compass/LegalRegistryView';
import FileViewerModal from './common/FileViewerModal';
import {
  findRepealedNgr,
  isRepealed,
  regulationDocumentAsMaterial,
  uploadRegulationDocument,
} from '../utils/regulationDocuments';
import { readScoped } from '../utils/userScopedStorage';
import { useStorageOwner } from '../hooks/useProgressRevision';
import { FAVORITES_SYNCED_EVENT, LEGAL_FAVS_KEY, saveFavoriteIds } from '../utils/gamification';

export default function LegalCompass() {
  // Předpisy smí zakládat, upravovat, mazat a importovat jen lektor a správce.
  //
  // Dřív tu žádná kontrola role nebyla — `useAuth` se v tomhle modulu vůbec
  // nepoužíval. Student si tak mohl přepsat nebo smazat text zákona 555/1992,
  // který se mu pak zobrazoval jako studijní výběr, a neměl jak poznat, že už
  // nečte to, co je v aplikaci. Úpravy teď jdou do společné databáze
  // (content_blocks), takže je vidí všichni — kontrola role je o to důležitější.
  const { profile } = useAuth();
  const canEditRegulations = profile?.role === 'lektor' || profile?.role === 'admin';

  const [viewMode, setViewMode] = useState<'articles' | 'registry'>('articles');
  // Každý režim má vlastní hledání. Dřív bylo společné: výraz zadaný v
  // Paragrafovém výkladu filtroval po přepnutí i Katalog předpisů, a student
  // viděl prázdný katalog, aniž by v jeho poli něco napsal.
  const [articleSearchQuery, setArticleSearchQuery] = useState('');
  const [registrySearchQuery, setRegistrySearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRegistryType, setSelectedRegistryType] = useState<string>('all');
  const [selectedArticleId, setSelectedArticleId] = useState<string>(legalDatabase[0]?.id || '');
  const [activeModalRegulation, setActiveModalRegulation] = useState<VscrRegulation | null>(null);
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [showIntegrityModal, setShowIntegrityModal] = useState(false);

  // Dynamic Regulations Database State
  // Předpisy = výchozí registr + úpravy lektorů ze společné databáze. Dřív
  // úpravy ležely jen v localStorage lektora, přestože tlačítko slibovalo
  // „Uložit do databáze“ — nikdo jiný je neviděl.
  const {
    items: regulationsList,
    save: saveRegulation,
    restore: restoreRegulation,
    purge: purgeRegulation,
    error: regulationsError,
  } = useEditableContent<VscrRegulation>('regulation', VSCR_REGULATIONS_REGISTRY, canEditRegulations);
  /** Úpravy předpisů ze starší verze, které leží jen v tomto prohlížeči. */
  const [legacyLocalRegs, setLegacyLocalRegs] = useState<VscrRegulation[]>(() =>
    canEditRegulations ? readLegacyLocalRegulations() : []
  );
  // Předčítání nesmí pokračovat, když student přepne na jinou záložku.
  useEffect(() => () => stopSpeaking(), []);

  useEffect(() => {
    setLegacyLocalRegs(canEditRegulations ? readLegacyLocalRegulations() : []);
  }, [canEditRegulations]);
  const [regulationsBusy, setRegulationsBusy] = useState(false);
  const [offlineStatus, setOfflineStatus] = useState(() => getOfflineStatus());
  const [offlineBusy, setOfflineBusy] = useState(false);

  /**
   * Kolik znění zařízení opravdu drží. `null` = ještě nezjištěno.
   *
   * Odznak se neopírá o datum v localStorage: to přežije i smazání dat webu,
   * takže by tvrdil „Uloženo offline“ nad prázdnou mezipamětí.
   */
  const [cachedSnapshots, setCachedSnapshots] = useState<{
    ulozeno: number;
    celkem: number;
    zjistitelne: boolean;
  } | null>(null);

  /** Průběh stahování znění: `null`, když se nestahuje. */
  const [offlineProgress, setOfflineProgress] = useState<{ hotovo: number; celkem: number } | null>(
    null
  );
  const [pdfViewMode, setPdfViewMode] = useState<'paper' | 'dark'>('paper');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  
  // Editor Modal State
  const [showEditorModal, setShowEditorModal] = useState(false);
  /** Zakládá se nový předpis (true), nebo se upravuje existující (false)? */
  const [editorIsNew, setEditorIsNew] = useState(false);
  const [editingRegulation, setEditingRegulation] = useState<Partial<VscrRegulation> | null>(null);
  /** Soubor s textem předpisu vybraný v editoru; nahraje se až při uložení. */
  const [pendingDocFile, setPendingDocFile] = useState<File | null>(null);
  /** Předpis, který ukládaný předpis nahrazuje ('' = žádný). */
  const [replacesId, setReplacesId] = useState('');
  /** Otevřený nahraný text předpisu. */
  const [viewedDocument, setViewedDocument] = useState<{ doc: RegulationDocument; code: string } | null>(null);

  /** Předpis, u kterého čekáme na potvrzení odebrání / návratu k výchozímu. */
  const [pendingDelete, setPendingDelete] = useState<
    { id: string; code: string; isDefault: boolean } | null
  >(null);

  /** Potvrzení nahrazení místní databáze předpisů importem z JSON. */
  const [pendingImport, setPendingImport] = useState<{ fileName: string; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const detailContainerRef = useRef<HTMLDivElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Oblíbené předpisy patří účtu (userScopedStorage). Dřív se četly a psaly
  // pod společným klíčem, který userScopedStorage při každém načtení stránky
  // převedl na účet a smazal — po obnovení stránky byly oblíbené prázdné.
  const storageOwner = useStorageOwner();
  const [savedFavorites, setSavedFavorites] = useState<string[]>(() => readScoped<string[]>(LEGAL_FAVS_KEY, []));
  useEffect(() => {
    setSavedFavorites(readScoped<string[]>(LEGAL_FAVS_KEY, []));
  }, [storageOwner]);
  useEffect(() => {
    const reload = () => setSavedFavorites(readScoped<string[]>(LEGAL_FAVS_KEY, []));
    window.addEventListener(FAVORITES_SYNCED_EVENT, reload);
    return () => window.removeEventListener(FAVORITES_SYNCED_EVENT, reload);
  }, []);

  const auditReport: AuditReport = useMemo(() => {
    // Pokrytí se měří proti osnově předpisu stažené z e-Sbírky, ne odhadem
    // z vlastního textu. Teprve tím se dá říct, kolik paragrafů výběr vynechává.
    // Měří se `regulationsList`, tedy včetně úprav lektorů ze společné
    // databáze — dřív se počítal jen výchozí registr a kontrola tak
    // nepoznala, že lektor některý výběr zkrátil nebo doplnil.
    const coverage = regulationsList
      .filter((reg) => typeof reg.fullLegalText === 'string' && reg.fullLegalText.length > 0)
      .map((reg) => measureRegulationCoverage(reg));
    return auditLegalDatabase(legalDatabase, coverage);
  }, [regulationsList]);

  // Časovač oznámení: nové oznámení zruší předchozí, jinak by starší časovač
  // schoval to novější dřív, než si ho student stihl přečíst.
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    },
    []
  );
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setNotification({ message, type });
    toastTimerRef.current = setTimeout(() => {
      setNotification(null);
      toastTimerRef.current = null;
    }, 3500);
  };

  /** Umlčí předčítání; volá se při každé změně zobrazeného textu. */
  const stopReading = useCallback(() => {
    stopSpeaking();
    setIsSpeaking(false);
  }, []);

  /** Přepnutí režimu vrátí mobil na seznam a umlčí předčítání. */
  const switchViewMode = (mode: 'articles' | 'registry') => {
    if (mode === viewMode) return;
    stopReading();
    setMobileDetailOpen(false);
    setViewMode(mode);
  };

  const toggleFavorite = (id: string) => {
    const next = savedFavorites.includes(id)
      ? savedFavorites.filter(i => i !== id)
      : [...savedFavorites, id];
    setSavedFavorites(next);
    saveFavoriteIds('fav_legal', next);
  };

  /** Uloží předpisy postupně; vrátí počet uložených a první chybu. */
  const saveRegulationsBatch = async (regs: VscrRegulation[]) => {
    let saved = 0;
    let firstError: string | null = null;
    for (const reg of regs) {
      const res = await saveRegulation(reg);
      if (res.error) firstError ??= res.error;
      else saved += 1;
    }
    return { saved, firstError };
  };

  const uploadLegacyLocalRegs = async () => {
    if (regulationsBusy || legacyLocalRegs.length === 0) return;
    setRegulationsBusy(true);
    const { saved, firstError } = await saveRegulationsBatch(legacyLocalRegs);
    setRegulationsBusy(false);
    if (firstError) {
      showToast(`Nahráno ${saved} z ${legacyLocalRegs.length}. ${firstError}`, 'error');
      return;
    }
    clearLegacyLocalRegulations();
    setLegacyLocalRegs([]);
    showToast(`Nahráno ${saved} místních úprav předpisů — teď je vidí všichni.`);
  };

  /**
   * Uloží předpisy pro čtení bez připojení.
   *
   * Dřív se jen zkopírovala data z jednoho klíče localStorage do druhého a
   * ohlásilo se „uloženo offline“ — přitom se nic nestáhlo a druhý klíč nikdo
   * nikdy nečetl. Teď se skutečně stáhnou soubory s úplnými zněními, aby si je
   * Service Worker uložil do mezipaměti zařízení, a hlášení říká, co dopadlo.
   */
  const handleSaveForOffline = async () => {
    if (offlineBusy) return;
    setOfflineBusy(true);
    setOfflineProgress({ hotovo: 0, celkem: 0 });
    showToast('Stahuji znění předpisů z e-Sbírky do zařízení…', 'info');

    const metaSaved = recordOfflineDownload(regulationsList.length);
    // Stahování trvá u 1,5 MB zákonů na mobilních datech desítky sekund.
    // Bez ukazatele průběhu vypadalo tlačítko jen zaseknuté — `onProgress`
    // přitom `prefetchAllSnapshots` nabízela od začátku a nikdo ji nevyužil.
    const result = await prefetchAllSnapshots((hotovo, celkem) => {
      setOfflineProgress({ hotovo, celkem });
    });
    setOfflineBusy(false);
    setOfflineProgress(null);
    setCachedSnapshots(await countCachedSnapshots());

    if (result.ulozeno === 0) {
      showToast('Nepodařilo se stáhnout žádné znění. Zkontrolujte připojení.', 'error');
      return;
    }

    const stamp = new Date().toLocaleString('cs-CZ');
    setOfflineStatus({ isDownloaded: true, downloadedAt: stamp });
    const potize = result.selhalo > 0 ? ` ${result.selhalo} se nepodařilo stáhnout.` : '';
    const metaPotize = metaSaved.success ? '' : ' Datum stažení se uložit nepodařilo.';
    showToast(
      `Uloženo ${result.ulozeno} znění z e-Sbírky (${formatMegabytes(result.bajtu)}).${potize}${metaPotize} ` +
        'Znění zůstávají v zařízení i po aktualizaci aplikace.',
      result.selhalo > 0 ? 'info' : 'success'
    );
  };

  const handleExportJSON = () => {
    exportRegulationsToJSON(regulationsList);
    showToast('Databáze předpisů exportována do souboru JSON.');
  };

  /**
   * Import předpisů ze souboru JSON.
   *
   * Import přepíše v databázi předpisy se stejným id a přidá nové — vidí to
   * všichni. Soubor se proto nejdřív přečte a teprve po potvrzení uloží.
   */
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) setPendingImport({ fileName: file.name, text });
    };
    reader.onerror = () => showToast('Soubor se nepodařilo přečíst.', 'error');
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  const confirmImport = async () => {
    if (!pendingImport) return;
    const parsed = parseRegulationsJSON(pendingImport.text);
    setPendingImport(null);
    if (!parsed.success) {
      showToast(parsed.message, 'error');
      return;
    }
    setRegulationsBusy(true);
    const { saved, firstError } = await saveRegulationsBatch(parsed.items);
    setRegulationsBusy(false);
    if (firstError) showToast(`Uloženo ${saved} z ${parsed.items.length} předpisů. ${firstError}`, 'error');
    else showToast(`Uloženo ${saved} předpisů do databáze.`);
  };

  const handleOpenNewEditor = () => {
    setEditingRegulation({
      id: `custom-reg-${Date.now()}`,
      code: '',
      shortTitle: '',
      title: '',
      type: 'ngr',
      authority: 'Generální ředitelství VS ČR',
      effectiveFrom: new Date().toLocaleDateString('cs-CZ'),
      scope: '',
      keyProvisions: [''],
      importanceForZOP: 'Vysoký',
      tags: ['interní předpis'],
      summary: '',
      practicalApplication: '',
      officialUrl: '',
      fullLegalText: ''
    });
    setPendingDocFile(null);
    setReplacesId('');
    setEditorIsNew(true);
    setShowEditorModal(true);
  };

  const handleOpenEditModal = (reg: VscrRegulation) => {
    setEditingRegulation({ ...reg });
    setPendingDocFile(null);
    setReplacesId('');
    setEditorIsNew(false);
    setShowEditorModal(true);
  };

  const handleSaveRegulation = async () => {
    if (!editingRegulation?.code || !editingRegulation?.title || !editingRegulation?.shortTitle) {
      showToast('Vyplňte prosím kód, zkrácený a plný název předpisu.', 'error');
      return;
    }

    const regToSave: VscrRegulation = {
      id: editingRegulation.id || `reg-${Date.now()}`,
      code: editingRegulation.code,
      title: editingRegulation.title,
      shortTitle: editingRegulation.shortTitle,
      type: editingRegulation.type || 'ngr',
      authority: editingRegulation.authority || 'Generální ředitelství VS ČR',
      effectiveFrom: editingRegulation.effectiveFrom || '',
      lastAmendment: editingRegulation.lastAmendment,
      scope: editingRegulation.scope || '',
      keyProvisions: Array.isArray(editingRegulation.keyProvisions) 
        ? editingRegulation.keyProvisions.filter(p => p.trim().length > 0)
        : [],
      importanceForZOP: editingRegulation.importanceForZOP || 'Vysoký',
      tags: Array.isArray(editingRegulation.tags) ? editingRegulation.tags : ['předpis'],
      summary: editingRegulation.summary || '',
      practicalApplication: editingRegulation.practicalApplication || '',
      officialUrl: editingRegulation.officialUrl || '',
      fullLegalText: editingRegulation.fullLegalText || '',
      status: editingRegulation.status === 'zruseny' ? 'zruseny' : undefined,
      replacedBy: editingRegulation.status === 'zruseny' ? editingRegulation.replacedBy?.trim() || undefined : undefined,
      reviewNote: editingRegulation.reviewNote?.trim() || undefined,
      document: editingRegulation.document,
      previousDocuments: editingRegulation.previousDocuments,
    };

    if (regulationsBusy) return;
    setRegulationsBusy(true);

    // Soubor se nahraje až teď, aby zrušený editor nenechal v úložišti
    // osiřelý soubor. Předchozí znění se nemaže — přesune se do historie.
    if (pendingDocFile) {
      const upload = await uploadRegulationDocument(pendingDocFile, regToSave.code);
      if (upload.error || !upload.document) {
        setRegulationsBusy(false);
        showToast(upload.error ?? 'Soubor se nepodařilo nahrát.', 'error');
        return;
      }
      if (regToSave.document) {
        regToSave.previousDocuments = [regToSave.document, ...(regToSave.previousDocuments ?? [])];
      }
      regToSave.document = upload.document;
    }

    const res = await saveRegulation(regToSave);
    if (res.error) {
      setRegulationsBusy(false);
      // Editor zůstane otevřený, aby se rozepsaný text neztratil.
      showToast(res.error, 'error');
      return;
    }

    // Nové NGŘ nahrazuje starší: to se označí jako zrušené a odkáže na nové.
    const replaced = replacesId ? regulationsList.find((r) => r.id === replacesId) : undefined;
    let replacedError: string | null = null;
    if (replaced) {
      const replacedRes = await saveRegulation({ ...replaced, status: 'zruseny', replacedBy: regToSave.code });
      replacedError = replacedRes.error;
    }
    setRegulationsBusy(false);
    setPendingDocFile(null);
    setReplacesId('');
    setShowEditorModal(false);
    setEditingRegulation(null);
    if (replacedError) {
      showToast(`Předpis „${regToSave.code}“ je uložen, ale ${replaced?.code} se nepodařilo označit jako zrušený: ${replacedError}`, 'error');
    } else if (replaced) {
      showToast(`Předpis „${regToSave.code}“ je uložen a ${replaced.code} je označen jako zrušený.`);
    } else {
      showToast(`Předpis „${regToSave.code}“ je uložen a vidí ho všichni.`);
    }
  };

  /**
   * Odebrání vlastního předpisu / návrat k výchozímu znění.
   *
   * Dřív se na obojí ptal jediný `confirm()` s textem „smazat NEBO obnovit na
   * výchozí znění?“ — jedno OK pro dvě různé akce a hlášení „odebrán/resetován“,
   * ze kterého uživatel nepoznal, co se stalo. Dialog teď pojmenuje, co se
   * opravdu provede, a rozlišuje podle toho, jestli jde o předpis z aplikace,
   * nebo o vlastní přírůstek.
   */
  const handleDeleteRegulation = (id: string, code: string) => {
    setPendingDelete({ id, code, isDefault: isDefaultRegulation(id) });
  };

  const confirmDeleteRegulation = async () => {
    if (!pendingDelete) return;
    const target = pendingDelete;
    setPendingDelete(null);
    // Výchozí předpis: smazat řádek překryvu = zpět na znění z aplikace.
    // Vlastní předpis: smazat jeho řádek úplně.
    const res = target.isDefault ? await restoreRegulation(target.id) : await purgeRegulation(target.id);
    if (res.error) {
      showToast(res.error, 'error');
      return;
    }
    showToast(
      target.isDefault
        ? `Předpis ${target.code} byl vrácen na výchozí znění z aplikace.`
        : `Vlastní předpis ${target.code} byl odebrán pro všechny.`
    );
  };

  const filteredArticles = useMemo(() => {
    return legalDatabase.filter(art => {
      const matchCat = 
        selectedCategory === 'all' || 
        art.category === selectedCategory || 
        (selectedCategory === 'favs' && savedFavorites.includes(art.id));
      
      const q = foldSearchText(articleSearchQuery).trim();
      if (!q) return matchCat;

      const matchQuery = 
        foldSearchText(art.section).includes(q) ||
        foldSearchText(art.title).includes(q) ||
        foldSearchText(art.actNumber).includes(q) ||
        foldSearchText(art.actTitle).includes(q) ||
        foldSearchText(art.exactText).includes(q) ||
        foldSearchText(art.explanation).includes(q) ||
        foldSearchText(art.examTips).includes(q);

      return matchCat && matchQuery;
    });
  }, [articleSearchQuery, selectedCategory, savedFavorites]);

  /**
   * Zobrazený článek.
   *
   * Vybírá se jen z toho, co hledání a filtr propustily. Dřív se při vybraném
   * článku mimo výsledky (nebo při prázdném hledání) spadlo na
   * `legalDatabase[0]`, takže vpravo stál článek, který zadanému hledání
   * vůbec neodpovídal.
   */
  const currentArticle = useMemo(() => {
    const selected = filteredArticles.find(a => a.id === selectedArticleId);
    if (selected) return selected;
    return filteredArticles[0] ?? null;
  }, [selectedArticleId, filteredArticles]);

  const currentIndex = useMemo(() => {
    return filteredArticles.findIndex(a => a.id === currentArticle?.id);
  }, [filteredArticles, currentArticle]);

  // Přechod na jiný článek umlčí předčítání — jinak hlas četl dál předchozí
  // ustanovení nad textem toho nového.
  const goToPrev = () => {
    if (currentIndex > 0) {
      const prevArt = filteredArticles[currentIndex - 1];
      stopReading();
      setSelectedArticleId(prevArt.id);
      scrollDetailToTop();
    }
  };

  const goToNext = () => {
    if (currentIndex < filteredArticles.length - 1) {
      const nextArt = filteredArticles[currentIndex + 1];
      stopReading();
      setSelectedArticleId(nextArt.id);
      scrollDetailToTop();
    }
  };

  const scrollDetailToTop = () => {
    if (detailContainerRef.current) {
      detailContainerRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  const handleSelectArticle = (artId: string) => {
    stopReading();
    setSelectedArticleId(artId);
    setMobileDetailOpen(true);
    setTimeout(() => {
      scrollDetailToTop();
    }, 10);
  };

  /**
   * Kopírování do schránky.
   *
   * Dřív se odznak „zkopírováno“ zobrazil vždy, i když zápis selhal — schránka
   * je nedostupná bez HTTPS nebo bez svolení uživatele. Chyba se teď přizná,
   * stejně jako v Administrativě.
   */
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      })
      .catch(() => {
        showToast('Zkopírování do schránky se nezdařilo — označte text a zkopírujte ho ručně.', 'error');
      });
  };

  const handleSpeak = (text: string) => {
    if (isSpeaking) {
      stopReading();
      return;
    }
    setIsSpeaking(true);
    speakText(text, () => setIsSpeaking(false));
  };

  // Ověření offline stavu proti mezipaměti + úklid mrtvého klíče ze starších verzí.
  useEffect(() => {
    purgeLegacyOfflineCache();
    let zruseno = false;
    countCachedSnapshots().then((pocet) => {
      if (!zruseno) setCachedSnapshots(pocet);
    });
    return () => {
      zruseno = true;
    };
  }, []);

  // Odkaz z chatu: #compass/predpis/<id> ukáže předpis v registru,
  // #compass/clanek/<id> otevře ustanovení. Adresa se pak vrátí na #compass.
  const [hashTarget, setHashTarget] = useState(() => compassTargetFromHash(window.location.hash));
  useEffect(() => {
    const onHashChange = () => {
      const target = compassTargetFromHash(window.location.hash);
      if (target) setHashTarget(target);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  useEffect(() => {
    if (!hashTarget) return;
    if (hashTarget.druh === 'clanek') {
      if (legalDatabase.some((a) => a.id === hashTarget.id)) {
        stopReading();
        setViewMode('articles');
        setArticleSearchQuery('');
        setSelectedCategory('all');
        setSelectedArticleId(hashTarget.id);
        setMobileDetailOpen(true);
      }
    } else {
      const reg = regulationsList.find((r) => r.id === hashTarget.id);
      // Vlastní předpisy lektorů se načítají ze serveru; počkat na ně.
      if (!reg) return;
      stopReading();
      setViewMode('registry');
      setSelectedRegistryType('all');
      setRegistrySearchQuery(reg.code);
      setMobileDetailOpen(false);
    }
    setHashTarget(null);
    window.history.replaceState(null, '', '#compass');
  }, [hashTarget, regulationsList, stopReading]);

  // Escape zavírají samy dialogy (hooks/useDialog) — globální posluchač tu
  // dřív zavíral okno podruhé a přebíjel pořadí, které si dialogy hlídají.

  const filteredRegulations = useMemo(() => {
    return regulationsList.filter(reg => {
      const matchType =
        selectedRegistryType === 'all' ||
        reg.type === selectedRegistryType;

      const q = foldSearchText(registrySearchQuery).trim();
      if (!q) return matchType;

      const matchQuery = 
        foldSearchText(reg.code).includes(q) ||
        foldSearchText(reg.title).includes(q) ||
        foldSearchText(reg.shortTitle).includes(q) ||
        foldSearchText(reg.authority).includes(q) ||
        foldSearchText(reg.scope).includes(q) ||
        foldSearchText(reg.summary).includes(q) ||
        foldSearchText(reg.practicalApplication).includes(q) ||
        reg.keyProvisions.some(p => foldSearchText(p).includes(q)) ||
        reg.tags.some(t => foldSearchText(t).includes(q)) ||
        // Bez tohohle se hledání „donucovací prostředky“ netrefilo do předpisu,
        // který je má v textu, ale ne v souhrnu ani ve výčtu klíčových ustanovení.
        foldSearchText(reg.fullLegalText).includes(q);

      return matchType && matchQuery;
    })
      // Zrušené předpisy na konec: student je má najít, ale číst jako první
      // má to, co platí. Řazení je stabilní, jinak pořadí zůstává.
      .sort((a, b) => Number(isRepealed(a)) - Number(isRepealed(b)));
  }, [registrySearchQuery, selectedRegistryType, regulationsList]);

  /** Předpisy, které lze v editoru označit jako nahrazené. */
  const replaceableRegulations = useMemo(
    () => regulationsList.filter((r) => !isRepealed(r) && r.id !== editingRegulation?.id),
    [regulationsList, editingRegulation?.id]
  );

  /** Zrušené NGŘ, ze kterého vychází otevřený článek Paragrafového výkladu. */
  const currentArticleRepealed = useMemo(
    () => (currentArticle ? findRepealedNgr(currentArticle.actNumber, regulationsList) : null),
    [currentArticle, regulationsList]
  );

  // Oblíbené se počítají jen z článků, které v databázi opravdu jsou. Klíč
  // v úložišti může držet id článku, který už z aplikace zmizel, a pilulka by
  // pak slibovala víc položek, než seznam po kliknutí ukáže.
  const existingFavoritesCount = useMemo(() => {
    const ids = new Set(legalDatabase.map((a) => a.id));
    return savedFavorites.filter((id) => ids.has(id)).length;
  }, [savedFavorites]);

  const categoriesList = useMemo(
    () => [
      { key: 'all', label: 'Vše', count: legalDatabase.length },
      ...LEGAL_CATEGORY_ORDER.map((key) => ({
        key,
        label: LEGAL_CATEGORY_LABELS[key],
        count: legalDatabase.filter((a) => a.category === key).length,
      })),
      { key: 'favs', label: 'Oblíbené', count: existingFavoritesCount },
    ],
    [existingFavoritesCount]
  );

  const registryTypesList = useMemo(
    () => [
      { key: 'all', label: 'Všechny předpisy', count: regulationsList.length },
      ...REGULATION_TYPE_ORDER.map((key) => ({
        key,
        label: REGULATION_TYPE_LABELS[key],
        count: regulationsList.filter((r) => r.type === key).length,
      })),
    ],
    [regulationsList]
  );

  const searchQuery = viewMode === 'registry' ? registrySearchQuery : articleSearchQuery;
  const setSearchQuery = viewMode === 'registry' ? setRegistrySearchQuery : setArticleSearchQuery;

  const ToastIcon =
    notification?.type === 'error' ? AlertCircle : notification?.type === 'info' ? Info : CheckCircle2;

  return (
    <div className="w-full h-full flex flex-col gap-3 sm:gap-4 overflow-hidden relative">

      {/* Oznámení. Ikona i barva odpovídají typu: dřív měla chyba i informace
          stejnou fajfku jako úspěch. role="status" ho přečte i odečítač. */}
      <AnimatePresence>
        {notification && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-[60] max-w-[calc(100vw-2rem)] px-4 py-2.5 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
              notification.type === 'error'
                ? 'bg-rose-600 text-white border-rose-700'
                : notification.type === 'info'
                  ? 'bg-slate-800 text-white border-slate-700'
                  : 'bg-emerald-600 text-white border-emerald-700'
            }`}
          >
            <ToastIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file input for JSON database restore */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileImport} 
        accept=".json" 
        className="hidden" 
      />

      {/* Záhlaví modulu — stejný tvar jako Administrativa a Profesní etika */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shrink-0 no-print print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Scale className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {NAV_TAB_LABELS.compass}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Studijní výběr ustanovení s výkladem a katalog předpisů s informativním zněním z e-Sbírky.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm flex items-center gap-2 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
              title="Vytisknout otevřené ustanovení nebo katalog, případně uložit do PDF"
            >
              <Printer className="w-4 h-4" aria-hidden="true" />
              <span>Tisk</span>
            </button>
            <button
              type="button"
              onClick={() => setShowIntegrityModal(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm flex items-center gap-2 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
              title="Zkontrolovat tvar dat a porovnat studijní výběr s osnovou z e-Sbírky"
            >
              <ClipboardCheck className="w-4 h-4" aria-hidden="true" />
              <span>Kontrola dat</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dva režimy modulu */}
      <div role="tablist" aria-label="Části Kompasu zákonů" className="grid grid-cols-2 gap-2 shrink-0 no-print print:hidden">
        {(
          [
            { id: 'articles', label: `Paragrafový výklad (${legalDatabase.length})`, Icon: Scale },
            { id: 'registry', label: `Katalog předpisů (${regulationsList.length})`, Icon: BookOpen },
          ] as const
        ).map(({ id, label, Icon }) => {
          const isActive = viewMode === id;
          return (
            <button
              type="button"
              key={id}
              role="tab"
              aria-selected={isActive}
              onClick={() => switchViewMode(id)}
              className={`px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </div>

      {viewMode === 'registry' && canEditRegulations && legacyLocalRegs.length > 0 && (
        <div className="no-print flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 text-xs text-amber-900 dark:text-amber-200">
          <span>
            V tomto prohlížeči máte {legacyLocalRegs.length} úprav předpisů ze starší verze aplikace, které
            nikdo jiný nevidí.
          </span>
          <button
            type="button"
            onClick={uploadLegacyLocalRegs}
            disabled={regulationsBusy}
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer disabled:opacity-50"
          >
            {regulationsBusy ? 'Nahrávám…' : 'Nahrát do databáze'}
          </button>
        </div>
      )}
      {viewMode === 'registry' && canEditRegulations && regulationsError && (
        <p role="alert" className="no-print text-xs text-red-700 dark:text-red-300">
          Úpravy předpisů se nepodařilo načíst ze serveru ({regulationsError}). Zobrazuje se poslední známý stav.
        </p>
      )}

      {/* Main Content Area */}
      <LegalRegistryView
        viewMode={viewMode}
        filteredArticles={filteredArticles}
        currentArticle={currentArticle}
        currentIndex={currentIndex}
        mobileDetailOpen={mobileDetailOpen}
        setMobileDetailOpen={setMobileDetailOpen}
        savedFavorites={savedFavorites}
        copiedId={copiedId}
        isSpeaking={isSpeaking}
        categoriesList={categoriesList}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSelectArticle={handleSelectArticle}
        toggleFavorite={toggleFavorite}
        handleCopy={handleCopy}
        handleSpeak={handleSpeak}
        goToPrev={goToPrev}
        goToNext={goToNext}
        detailContainerRef={detailContainerRef}
        listContainerRef={listContainerRef}
        filteredRegulations={filteredRegulations}
        offlineStatus={offlineStatus}
        registryTypesList={registryTypesList}
        selectedRegistryType={selectedRegistryType}
        setSelectedRegistryType={setSelectedRegistryType}
        handleSaveForOffline={handleSaveForOffline}
        offlineBusy={offlineBusy}
        offlineProgress={offlineProgress}
        cachedSnapshots={cachedSnapshots}
        handleOpenNewEditor={handleOpenNewEditor}
        handleExportJSON={handleExportJSON}
        handleOpenEditModal={handleOpenEditModal}
        handleDeleteRegulation={handleDeleteRegulation}
        setActiveModalRegulation={setActiveModalRegulation}
        setModalSearchQuery={setModalSearchQuery}
        fileInputRef={fileInputRef}
        canEdit={canEditRegulations}
        openRegulationDocument={(reg) => reg.document && setViewedDocument({ doc: reg.document, code: reg.code })}
        currentArticleRepealed={currentArticleRepealed}
      />

      {/* Nahraný text předpisu (NGŘ) */}
      <FileViewerModal
        material={viewedDocument ? regulationDocumentAsMaterial(viewedDocument.doc, viewedDocument.code) : null}
        isOpen={viewedDocument !== null}
        onClose={() => setViewedDocument(null)}
      />

      {/* Modal: Editor předpisů */}
      <LegalEditorModal
        showEditorModal={showEditorModal}
        editingRegulation={editingRegulation}
        isNew={editorIsNew}
        setShowEditorModal={setShowEditorModal}
        setEditingRegulation={setEditingRegulation}
        handleSaveRegulation={handleSaveRegulation}
        busy={regulationsBusy}
        pendingFile={pendingDocFile}
        setPendingFile={setPendingDocFile}
        replacesId={replacesId}
        setReplacesId={setReplacesId}
        replaceableRegulations={replaceableRegulations}
      />

      {/* Modal: Audit integrity */}
      <LegalAuditModal
        showIntegrityModal={showIntegrityModal}
        setShowIntegrityModal={setShowIntegrityModal}
        auditReport={auditReport}
      />

      {/* Modal: Full regulation reader */}
      <LegalReaderModal
        activeModalRegulation={activeModalRegulation}
        setActiveModalRegulation={setActiveModalRegulation}
        isSpeaking={isSpeaking}
        setIsSpeaking={setIsSpeaking}
        pdfViewMode={pdfViewMode}
        setPdfViewMode={setPdfViewMode}
        fontSize={fontSize}
        setFontSize={setFontSize}
        modalSearchQuery={modalSearchQuery}
        setModalSearchQuery={setModalSearchQuery}
        copiedId={copiedId}
        handleCopy={handleCopy}
        handleSpeak={handleSpeak}
        handleOpenEditModal={handleOpenEditModal}
        canEdit={canEditRegulations}
      />

      {/* Potvrzení odebrání předpisu / návratu k výchozímu znění */}
      <ConfirmDialog
        isOpen={pendingDelete !== null}
        tone="danger"
        title={
          pendingDelete?.isDefault
            ? `Vrátit ${pendingDelete.code} na výchozí znění?`
            : `Odebrat vlastní předpis ${pendingDelete?.code ?? ''}?`
        }
        description={
          pendingDelete?.isDefault ? (
            <>
              Úpravy tohoto předpisu se zahodí pro všechny a text se vrátí na podobu, kterou
              má v aplikaci. Samotný předpis z registru nezmizí.
            </>
          ) : (
            <>
              Předpis do aplikace přidal lektor, takže se odebere úplně —{' '}
              <strong>pro všechny uživatele</strong>. Obnovit ho půjde jen ze zálohy JSON.
            </>
          )
        }
        confirmLabel={pendingDelete?.isDefault ? 'Vrátit výchozí znění' : 'Odebrat předpis'}
        onConfirm={confirmDeleteRegulation}
        onCancel={() => setPendingDelete(null)}
      />

      {/* Potvrzení importu, který místní úpravy nahrazuje */}
      <ConfirmDialog
        isOpen={pendingImport !== null}
        tone="danger"
        title="Uložit předpisy ze souboru do databáze?"
        description={
          <>
            Předpisy ze souboru <strong>{pendingImport?.fileName}</strong> se uloží do společné
            databáze: <strong>přepíší předpisy se stejným označením</strong> a nové se přidají.
            Změnu uvidí všichni uživatelé. Doporučujeme si nejdřív udělat export.
          </>
        }
        confirmLabel="Uložit do databáze"
        onConfirm={confirmImport}
        onCancel={() => setPendingImport(null)}
      />
    </div>
  );
}
