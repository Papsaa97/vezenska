import React, { useState } from 'react';
import { StudySection, StudySectionArea } from '../../data/studySections';
import { StudySectionsState, sectionFieldsFor } from '../../hooks/useStudySections';
import ContentEditorBar from './ContentEditorBar';
import StudySectionEditModal from './StudySectionEditModal';

interface StudySectionsEditorProps {
  area: StudySectionArea;
  state: StudySectionsState;
}

/**
 * Správa textových bloků jedné podzáložky — jen pro lektora a správce.
 * Student ji nevidí vůbec, takže bez úprav vypadá záložka jako dřív.
 */
export default function StudySectionsEditor({ area, state }: StudySectionsEditorProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<StudySection | null>(null);

  if (!state.canEdit) return null;

  return (
    <>
      <ContentEditorBar
        content={state.content}
        targets={state.entries.filter((e) => !e.isDeleted)}
        deleted={state.entries.filter((e) => e.isDeleted)}
        getName={(s) => s.title}
        noun="blok"
        addLabel="Přidat textový blok"
        onEdit={(s) => {
          setEditing(s);
          setModalOpen(true);
        }}
        onAdd={() => {
          setEditing(null);
          setModalOpen(true);
        }}
      />
      <StudySectionEditModal
        section={editing}
        area={area}
        fields={sectionFieldsFor(editing?.id)}
        isOpen={modalOpen}
        usedIds={state.content.entries.map((e) => e.id)}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSave={(s) => state.content.save(s)}
      />
    </>
  );
}
