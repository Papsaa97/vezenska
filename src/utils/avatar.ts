import { Shield, ShieldCheck, Star, Award, Compass, Crosshair, BookOpen, Flame, LucideIcon } from 'lucide-react';

/** Předdefinovaný "služební" avatar — vykreslován čistě na klientovi, bez síťového požadavku. */
export interface AvatarPreset {
  key: string;
  label: string;
  icon: LucideIcon;
  gradient: string;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  { key: 'shield-blue', label: 'Štít', icon: Shield, gradient: 'from-blue-600 via-indigo-600 to-violet-600' },
  { key: 'shield-check', label: 'Ověřený štít', icon: ShieldCheck, gradient: 'from-emerald-600 via-teal-600 to-cyan-600' },
  { key: 'star', label: 'Hvězda', icon: Star, gradient: 'from-amber-500 via-orange-500 to-red-500' },
  { key: 'award', label: 'Odznak', icon: Award, gradient: 'from-purple-600 via-fuchsia-600 to-pink-600' },
  { key: 'compass', label: 'Kompas', icon: Compass, gradient: 'from-sky-600 via-blue-600 to-indigo-700' },
  { key: 'crosshair', label: 'Zaměřovač', icon: Crosshair, gradient: 'from-slate-600 via-slate-700 to-slate-900' },
  { key: 'book', label: 'Kniha', icon: BookOpen, gradient: 'from-teal-600 via-emerald-600 to-green-600' },
  { key: 'flame', label: 'Plamen', icon: Flame, gradient: 'from-red-600 via-orange-600 to-amber-500' },
];

const PRESET_PREFIX = 'preset:';

export function toPresetAvatarUrl(presetKey: string): string {
  return `${PRESET_PREFIX}${presetKey}`;
}

export function getAvatarPreset(presetKey: string): AvatarPreset | undefined {
  return AVATAR_PRESETS.find((p) => p.key === presetKey);
}

export type AvatarDisplay =
  | { type: 'image'; url: string }
  | { type: 'preset'; preset: AvatarPreset }
  | { type: 'initials' };

/** Rozhodne, jak zobrazit avatar uživatele: nahraný obrázek, předdefinovanou ikonu, nebo iniciály. */
export function resolveAvatarDisplay(avatarUrl: string | null | undefined): AvatarDisplay {
  if (!avatarUrl) return { type: 'initials' };

  if (avatarUrl.startsWith(PRESET_PREFIX)) {
    const preset = getAvatarPreset(avatarUrl.slice(PRESET_PREFIX.length));
    return preset ? { type: 'preset', preset } : { type: 'initials' };
  }

  return { type: 'image', url: avatarUrl };
}
