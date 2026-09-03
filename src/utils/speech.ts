// Web Speech API helper for reading out questions and options in Czech

export function speakText(text: string, onEnd?: () => void): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  if (!text || !text.trim()) {
    if (onEnd) onEnd();
    return false;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'cs-CZ';
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  // Try to find a Czech voice
  const voices = window.speechSynthesis.getVoices();
  const czechVoice = voices.find(v => v.lang.startsWith('cs') || v.name.includes('Czech') || v.name.includes('česk'));
  if (czechVoice) {
    utterance.voice = czechVoice;
  }

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}
