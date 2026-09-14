/// <reference types="vite/client" />

/**
 * Identifikátor buildu vkládaný Vite při překladu (viz vite.config.ts → define).
 *
 * Používá se jako verze mezipaměti Service Workeru. V `public/` k dispozici NENÍ —
 * soubory v public/ se kopírují beze změny a žádné `define` na ně nepůsobí.
 */
declare const __BUILD_ID__: string;
