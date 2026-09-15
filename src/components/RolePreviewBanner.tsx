import { Eye, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS } from '../constants/auth';

/**
 * Pruh, který hlásí běžící náhled cizí role.
 *
 * Náhled je záležitost výhradně rozhraní: `public.profiles.role` se nemění a
 * RLS dál pouští jen to, na co má účet doopravdy právo. Tlačítka a nabídky se
 * tedy chovají jako u zvolené role, ale DATA se pořád načítají podle té
 * skutečné — správce v náhledu studenta uvidí studentské rozhraní, ne však
 * studentský výřez dat.
 *
 * Bez tohohle pruhu by šlo na zapnutý náhled snadno zapomenout a považovat ho
 * za chybu aplikace („proč nevidím správu otázek?“). Proto je vidět pořád a
 * nese tlačítko, kterým se vypne. Druhá pojistka je, že se náhled nikam
 * neukládá: načtení stránky ho vždycky zruší.
 */
export default function RolePreviewBanner() {
  const { previewRole, realRole, setPreviewRole } = useAuth();

  return (
    <AnimatePresence>
      {previewRole && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="status"
          aria-live="polite"
          className="no-print bg-amber-600 dark:bg-amber-700 text-white px-3 py-1.5 text-xs font-semibold shadow-md z-50 border-b border-amber-400/50"
        >
          <div className="flex items-center gap-2 mx-auto max-w-7xl">
            <Eye className="w-4 h-4 shrink-0 text-amber-100" />
            <span className="flex-1">
              <strong>Náhled role {ROLE_LABELS[previewRole]}:</strong> takhle vypadá rozhraní pro
              tuhle roli. Vaše skutečná role zůstává{' '}
              {realRole ? ROLE_LABELS[realRole] : 'beze změny'} a v databázi se nic nezměnilo, takže
              data vidíte pořád podle ní.
            </span>
            <button
              type="button"
              onClick={() => setPreviewRole(null)}
              className="shrink-0 inline-flex items-center gap-1 rounded-full bg-white/15 hover:bg-white/25 px-2.5 py-1 font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-white/60"
            >
              <X className="w-3.5 h-3.5" />
              Ukončit náhled
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
