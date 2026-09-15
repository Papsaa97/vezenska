import type { KeyboardEvent } from 'react';

/**
 * Klávesová obsluha pro prvek, který se chová jako tlačítko, ale tlačítko to
 * být nemůže — typicky karta s vlastní akcí, uvnitř které už jsou další
 * tlačítka. Vnořit <button> do <button> nelze, proto takový prvek dostane
 * role="button", tabIndex={0} a tuhle obsluhu.
 *
 * Enter i mezerník spouští akci, jak to u role="button" čeká jak odečítač
 * obrazovky, tak uživatel ovládající aplikaci klávesnicí.
 *
 * POZOR na guard `event.target !== event.currentTarget`: bez něj by stisk
 * mezerníku nad vnořeným tlačítkem (smazat, přehrát…) probublal nahoru a
 * spustil navíc i akci celé karty. Uživatel klávesnice by tak jedním stiskem
 * vyvolal dvě různé věci.
 */
export function activateOnKey(action: () => void) {
  return (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    if (event.target !== event.currentTarget) return;
    // U mezerníku je potřeba zabránit odrolování stránky.
    event.preventDefault();
    action();
  };
}
