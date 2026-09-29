/**
 * Převede text do podoby pro fulltextové hledání: bez diakritiky, malými písmeny
 * a s paragrafem vždy bez mezery („§ 17“ i „§17“ → „§17“). Student na telefonu
 * často píše bez háčků a čárek, a dřív pak hledání „donucovaci“ nenašlo nic.
 */
export function foldSearchText(text: string | null | undefined): string {
  return (text || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/§\s+/g, '§');
}
