/**
 * Převede soubor na Data URL pomocí FileReader.
 * Použití: záložní ukládání rozvrhu, když Supabase Storage upload selže.
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
