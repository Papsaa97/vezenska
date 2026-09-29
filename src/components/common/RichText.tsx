import React from 'react';

/**
 * Minimální formátování textů, které smí upravovat lektor: **tučně** a *kurzíva*.
 *
 * PROČ NE HTML: část studijních textů se dřív vkládala přes
 * dangerouslySetInnerHTML. Dokud byl text natvrdo v repozitáři, šlo to;
 * jakmile ho může přepsat kdokoli s rolí lektora a uvidí ho každý student,
 * je to cesta k vložení skriptu. Tady se text nikdy neinterpretuje jako HTML —
 * rozdělí se na kousky a React je vloží jako obyčejný text.
 */
const TOKEN = /(\*\*[^*]+\*\*|\*[^*\n]+\*)/g;

export function renderRichText(text: string): React.ReactNode[] {
  return text.split(TOKEN).map((part, i) => {
    if (part.length > 4 && part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.length > 2 && part.startsWith('*') && part.endsWith('*')) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

/** Text rozdělený na řádky — každý neprázdný řádek je jeden odstavec či odrážka. */
export function textLines(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export default function RichText({ text }: { text: string }) {
  return <>{renderRichText(text)}</>;
}
