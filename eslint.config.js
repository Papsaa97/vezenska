/**
 * Kontrola přístupnosti JSX.
 *
 * Proč vůbec: projekt dosud žádný lint neměl — `npm run lint` spouštěl jen
 * `tsc --noEmit`. Typová kontrola ale o přístupnosti nic neví: tlačítko bez
 * dostupného jména, popisek nesvázaný se vstupem ani klikací <div> bez role
 * jí neprojdou jako chyba. Tahle třída vad se proto hledala ručně. Od teď na
 * ni upozorní CI při každém pull requestu.
 *
 * Z typescript-eslint je zapnutá jedna jediná věc nad parserem:
 * `no-unused-vars`. Cílem není zavést do hotového projektu kompletní styl
 * kódu (to by znamenalo stovky nesouvisejících změn v souborech, kterých se
 * nikdo nedotkl), ale pohlídat to, co se ručně hledá nejhůř — a mrtvý kód do
 * toho patří: nepoužitý import, stav, který se jen nastavuje, nebo proměnná
 * zbylá po refaktoru neprojdou `tsc --noEmit` (`noUnusedLocals` v tsconfig
 * projektu vypnuté je) a pak se čtou jako platná součást kódu.
 *
 * ROZSAH: `src/**` včetně `.ts`, k tomu `api/**` a `scripts/**`. Původně tu
 * byl jen `src/**\/*.tsx`, takže celá vrstva `src/utils`, `src/hooks`
 * a `src/data` — ani serverová část a údržbové skripty — se nelintovala vůbec.
 */
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';

/**
 * Nepoužité proměnné se hlásí jako chyba, s jednou výjimkou: podtržítko.
 *
 * `catch (_error)` nebo `({ a, ..._zbytek })` je záměrné „vím o tom, nechci
 * to“ — jinak by se muselo psát `eslint-disable`, a ten se v tomhle projektu
 * používat nemá.
 */
const NEPOUZITE_PROMENNE = [
  'error',
  {
    args: 'after-used',
    argsIgnorePattern: '^_',
    varsIgnorePattern: '^_',
    caughtErrors: 'all',
    caughtErrorsIgnorePattern: '^_',
    destructuredArrayIgnorePattern: '^_',
    ignoreRestSiblings: true,
  },
];

export default [
  {
    // Sestavené a stažené soubory se nelintují.
    ignores: ['dist/**', 'node_modules/**', 'public/**', '.vercel/**'],
  },
  {
    // Mrtvý kód se hledá v celém `src`, přístupnost jen tam, kde je JSX.
    files: ['src/**/*.{ts,tsx}', 'api/**/*.ts', 'scripts/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': NEPOUZITE_PROMENNE,
    },
  },
  {
    files: ['src/**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { 'jsx-a11y': jsxA11y, 'react-hooks': reactHooks },
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,

      // Popisky v tomhle projektu svůj ovládací prvek obalují, ale text mají
      // zanořený hlouběji, než kam výchozí depth: 2 dohlédne. Nejde o vadu
      // značek, jen o hlubší strukturu.
      'jsx-a11y/label-has-associated-control': ['error', { depth: 6 }],

      // V kódu už jsou na několika místech `eslint-disable` komentáře pro
      // react-hooks/exhaustive-deps — bez zaregistrovaného pluginu by je
      // ESLint hlásil jako odkaz na neexistující pravidlo. Pravidla hlídají
      // zastaralé closure v efektech, což je vada, ne otázka stylu.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // ── Zděděný dluh, držený ráčnou ────────────────────────────────────
      // Klikací <div>y a <li>čka bez klávesové obsluhy: myší fungují, z
      // klávesnice ne. Jsou to skutečné vady, ale je jich přes padesát a
      // každá potřebuje vlastní rozhodnutí (z některých má být <button>,
      // jinde jde o pozadí dialogu, kde klávesnici obsluhuje Escape).
      // Dokud se nespraví, jsou to varování — a `npm run lint:a11y` je
      // spouští s --max-warnings, takže počet nesmí vzrůst. Stejný princip
      // jako ráčna u kvality banky otázek (scripts/check-question-quality.ts).
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/no-noninteractive-element-interactions': 'warn',
    },
  },
];
