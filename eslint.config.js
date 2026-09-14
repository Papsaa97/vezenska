/**
 * Kontrola přístupnosti JSX.
 *
 * Proč vůbec: projekt dosud žádný lint neměl — `npm run lint` spouštěl jen
 * `tsc --noEmit`. Typová kontrola ale o přístupnosti nic neví: tlačítko bez
 * dostupného jména, popisek nesvázaný se vstupem ani klikací <div> bez role
 * jí neprojdou jako chyba. Tahle třída vad se proto hledala ručně. Od teď na
 * ni upozorní CI při každém pull requestu.
 *
 * Záměrně JEN jsx-a11y. typescript-eslint je tu pouze jako parser, aby ESLint
 * rozuměl .tsx — jeho vlastní sada pravidel zapnutá není. Cílem není zavést
 * do hotového projektu kompletní styl kódu (to by znamenalo stovky
 * nesouvisejících změn v souborech, kterých se nikdo nedotkl), ale pohlídat
 * právě to, co se ručně hledá nejhůř.
 */
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  {
    // Sestavené a stažené soubory se nelintují.
    ignores: ['dist/**', 'node_modules/**', 'public/**', '.vercel/**'],
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
