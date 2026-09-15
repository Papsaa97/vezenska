import { ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';

/**
 * Upozornění na rozpor mezi rolí v rozhraní a rolí v databázi.
 *
 * O tom, co se smí uložit, rozhoduje RLS podle `public.profiles.role`, ne to,
 * jaká tlačítka aplikace vykreslí. Když se obojí rozejde — typicky u správce
 * vytaženého z VITE_ADMIN_EMAILS, který roli v databázi ještě nemá — zůstane
 * správcovské rozhraní plně funkční na pohled, ale databáze odmítne každý
 * zápis. Zamítnutý UPDATE přitom není chyba, jen nula zasažených řádků, takže
 * se to bez tohoto pruhu nijak neprojeví: uživatel jen vidí, že se změny
 * neukládají, a nemá se čeho chytit.
 */
export default function RoleSyncBanner() {
  const { roleSyncWarning } = useAuth();

  return (
    <AnimatePresence>
      {roleSyncWarning && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="alert"
          aria-live="assertive"
          className="no-print bg-rose-700 dark:bg-rose-800 text-white px-3 py-1.5 text-xs font-semibold shadow-md z-50 border-b border-rose-500/50"
        >
          <div className="flex items-start gap-2 mx-auto max-w-7xl">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-200 mt-0.5" />
            <span>
              <strong>Zápisy do databáze neprojdou:</strong> {roleSyncWarning}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
