import { useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { EditableContent, useEditableContent } from './useEditableContent';
import { ContentEntry } from '../utils/contentLibrary';
import {
  GENERIC_SECTION_FIELDS,
  StudySection,
  StudySectionArea,
  StudySectionFields,
} from '../data/studySections';
import { defaultEthicsSections, ethicsSectionFields } from '../data/professionalEthicsData';
import { adminSectionFields, defaultAdminSections } from '../data/prisonAdminData';

/**
 * Všechny výchozí bloky obou záložek. Jeden druh obsahu ('study_section')
 * a jedna modulová konstanta — useEditableContent potřebuje stabilní
 * referenci a podzáložky si z ní vyberou svou část podle `area`.
 */
const DEFAULT_STUDY_SECTIONS: StudySection[] = [...defaultEthicsSections, ...defaultAdminSections];
const DEFAULT_IDS = new Set(DEFAULT_STUDY_SECTIONS.map((s) => s.id));
const SECTION_FIELDS: Record<string, StudySectionFields> = { ...ethicsSectionFields, ...adminSectionFields };

/** Popisky polí formuláře pro daný blok; vlastní bloky mají obecné. */
export function sectionFieldsFor(id: string | undefined): StudySectionFields {
  return (id && SECTION_FIELDS[id]) || GENERIC_SECTION_FIELDS;
}

export interface StudySectionsState {
  canEdit: boolean;
  content: EditableContent<StudySection>;
  /** Bloky podzáložky, které se mají vykreslit (student nevidí skryté). */
  sections: StudySection[];
  /** Položky podzáložky se stavem — pro lištu lektora. */
  entries: ContentEntry<StudySection>[];
  /** Výchozí blok podle id (pokud není odebraný či skrytý). */
  byId: (id: string) => StudySection | undefined;
  /** Bloky, které lektor přidal — vykreslí se obecným rozvržením. */
  custom: StudySection[];
}

export function useStudySections(area: StudySectionArea): StudySectionsState {
  const { profile } = useAuth();
  const canEdit = profile?.role === 'lektor' || profile?.role === 'admin';
  const content = useEditableContent<StudySection>('study_section', DEFAULT_STUDY_SECTIONS, canEdit);

  const sections = useMemo(() => content.items.filter((s) => s.area === area), [content.items, area]);
  const entries = useMemo(() => content.entries.filter((e) => e.item.area === area), [content.entries, area]);
  const custom = useMemo(() => sections.filter((s) => !DEFAULT_IDS.has(s.id)), [sections]);
  const byId = useCallback((id: string) => sections.find((s) => s.id === id), [sections]);

  return { canEdit, content, sections, entries, byId, custom };
}
