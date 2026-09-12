import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Camera,
  Mail,
  Shield,
  CalendarDays,
  Award,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Save,
  User as UserIcon,
  Sparkles,
} from 'lucide-react';
import { useAuth, UserRole } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { UserRank } from '../types';
import { AVATAR_PRESETS, resolveAvatarDisplay, toPresetAvatarUrl } from '../utils/avatar';

const ROLE_LABELS: Record<UserRole, string> = {
  student: 'Kadet / Student',
  lektor: 'Lektor',
  admin: 'Správce',
};

const ROLE_COLORS: Record<UserRole, string> = {
  student: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  lektor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  admin: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
};

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;
const MIN_PASSWORD_LENGTH = 6;

interface FormMessage {
  type: 'success' | 'error';
  text: string;
}

interface UserProfileModalProps {
  onClose: () => void;
  totalXp: number;
  currentRank: UserRank;
}

function formatRegistrationDate(iso: string | undefined): string {
  if (!iso) return 'Neznámé datum';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Neznámé datum';
  return date.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' });
}

function AvatarPreview({ avatarUrl, initials }: { avatarUrl: string | null | undefined; initials: string }) {
  const display = resolveAvatarDisplay(avatarUrl);

  if (display.type === 'image') {
    return (
      <img
        src={display.url}
        alt="Profilová fotografie"
        className="w-full h-full object-cover rounded-full"
      />
    );
  }

  if (display.type === 'preset') {
    const Icon = display.preset.icon;
    return (
      <div className={`w-full h-full rounded-full bg-gradient-to-tr ${display.preset.gradient} flex items-center justify-center`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-lg">
      {initials}
    </div>
  );
}

export default function UserProfileModal({ onClose, totalXp, currentRank }: UserProfileModalProps) {
  const { user, profile, updateProfile, updatePassword } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState<string>(profile?.full_name ?? '');
  const [nameSaving, setNameSaving] = useState<boolean>(false);
  const [nameMessage, setNameMessage] = useState<FormMessage | null>(null);

  const [avatarUploading, setAvatarUploading] = useState<boolean>(false);
  const [avatarMessage, setAvatarMessage] = useState<FormMessage | null>(null);
  const [showPresets, setShowPresets] = useState<boolean>(false);

  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [passwordSaving, setPasswordSaving] = useState<boolean>(false);
  const [passwordMessage, setPasswordMessage] = useState<FormMessage | null>(null);

  if (!user || !profile) return null;

  const role: UserRole = profile.role;
  const initials = (() => {
    const name = (profile.full_name || user.email || '').trim();
    if (!name) return 'VS';
    const parts = name.split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase() || 'VS';
  })();

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = fullName.trim();
    if (!trimmed) {
      setNameMessage({ type: 'error', text: 'Jméno nesmí být prázdné.' });
      return;
    }
    setNameSaving(true);
    setNameMessage(null);
    const { error } = await updateProfile({ fullName: trimmed });
    setNameSaving(false);
    setNameMessage(
      error ? { type: 'error', text: `Uložení selhalo: ${error}` } : { type: 'success', text: 'Jméno bylo úspěšně uloženo.' }
    );
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarMessage({ type: 'error', text: 'Vyberte prosím obrázkový soubor (JPG, PNG, WEBP).' });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      setAvatarMessage({ type: 'error', text: 'Soubor je příliš velký. Maximální velikost je 5 MB.' });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setAvatarUploading(true);
    setAvatarMessage(null);

    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${user.id}/avatar-${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type,
    });

    if (uploadError) {
      setAvatarUploading(false);
      setAvatarMessage({ type: 'error', text: `Nahrání se nezdařilo: ${uploadError.message}` });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    const { error: updateError } = await updateProfile({ avatarUrl: data.publicUrl });

    setAvatarUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';

    setAvatarMessage(
      updateError
        ? { type: 'error', text: `Uložení avataru selhalo: ${updateError}` }
        : { type: 'success', text: 'Profilová fotografie byla aktualizována.' }
    );
  };

  const handleSelectPreset = async (presetKey: string) => {
    setAvatarUploading(true);
    setAvatarMessage(null);
    const { error } = await updateProfile({ avatarUrl: toPresetAvatarUrl(presetKey) });
    setAvatarUploading(false);
    setShowPresets(false);
    setAvatarMessage(
      error ? { type: 'error', text: `Uložení avataru selhalo: ${error}` } : { type: 'success', text: 'Avatar byl aktualizován.' }
    );
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setPasswordMessage({ type: 'error', text: `Heslo musí mít alespoň ${MIN_PASSWORD_LENGTH} znaků.` });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Zadaná hesla se neshodují.' });
      return;
    }

    setPasswordSaving(true);
    const { error } = await updatePassword(newPassword);
    setPasswordSaving(false);

    if (error) {
      setPasswordMessage({ type: 'error', text: `Změna hesla selhala: ${error}` });
    } else {
      setPasswordMessage({ type: 'success', text: 'Heslo bylo úspěšně změněno.' });
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="profile-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
      />

      <motion.div
        key="profile-modal"
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pointer-events-none"
      >
        <div
          className="pointer-events-auto w-full max-w-lg max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-5 sm:p-8 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Zavřít"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header: avatar + name + role */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-3">
              <div className="w-full h-full rounded-full overflow-hidden border-2 border-slate-700 shadow-lg">
                <AvatarPreview avatarUrl={profile.avatar_url} initials={initials} />
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
                title="Nahrát vlastní fotografii"
                className="absolute -bottom-1 -right-1 p-2 rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white shadow-md border-2 border-slate-900 transition-colors cursor-pointer"
              >
                {avatarUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarFileChange}
                className="hidden"
              />
            </div>

            <h2 className="text-white font-bold text-lg leading-tight">{profile.full_name || 'Uživatel'}</h2>
            <span className={`mt-1.5 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${ROLE_COLORS[role]}`}>
              {ROLE_LABELS[role]}
            </span>

            <button
              type="button"
              onClick={() => setShowPresets((prev) => !prev)}
              className="mt-3 text-[11px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              {showPresets ? 'Skrýt služební avatary' : 'Vybrat ze služebních avatarů'}
            </button>

            {showPresets && (
              <div className="mt-3 grid grid-cols-4 gap-2.5 w-full max-w-xs">
                {AVATAR_PRESETS.map((preset) => {
                  const Icon = preset.icon;
                  return (
                    <button
                      key={preset.key}
                      type="button"
                      onClick={() => handleSelectPreset(preset.key)}
                      disabled={avatarUploading}
                      title={preset.label}
                      className={`aspect-square rounded-xl bg-gradient-to-tr ${preset.gradient} flex items-center justify-center shadow-sm hover:scale-105 transition-transform disabled:opacity-50 cursor-pointer`}
                    >
                      <Icon className="w-4 h-4 text-white" />
                    </button>
                  );
                })}
              </div>
            )}

            {avatarMessage && (
              <div
                className={`mt-3 w-full flex items-start gap-2 rounded-xl px-3 py-2 text-[11px] leading-snug ${
                  avatarMessage.type === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                    : 'bg-red-500/10 border border-red-500/30 text-red-300'
                }`}
              >
                {avatarMessage.type === 'success' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                )}
                <span>{avatarMessage.text}</span>
              </div>
            )}
          </div>

          {/* Osobní údaje */}
          <form onSubmit={handleSaveName} className="space-y-3 pb-6 mb-6 border-b border-slate-800">
            <div className="flex items-center gap-2 text-slate-300">
              <UserIcon className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold">Osobní údaje</h3>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Jméno a příjmení</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jan Novák"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
              />
            </div>
            {nameMessage && (
              <div
                className={`flex items-start gap-2 rounded-xl px-3 py-2 text-[11px] leading-snug ${
                  nameMessage.type === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                    : 'bg-red-500/10 border border-red-500/30 text-red-300'
                }`}
              >
                {nameMessage.type === 'success' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                )}
                <span>{nameMessage.text}</span>
              </div>
            )}
            <button
              type="submit"
              disabled={nameSaving || fullName.trim() === (profile.full_name ?? '')}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {nameSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Uložit jméno
            </button>
          </form>

          {/* Změna hesla */}
          <form onSubmit={handleChangePassword} className="space-y-3 pb-6 mb-6 border-b border-slate-800">
            <div className="flex items-center gap-2 text-slate-300">
              <Lock className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold">Změna hesla</h3>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nové heslo (min. 6 znaků)"
                minLength={MIN_PASSWORD_LENGTH}
                autoComplete="new-password"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 pr-11 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Potvrzení nového hesla"
              minLength={MIN_PASSWORD_LENGTH}
              autoComplete="new-password"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
            />
            {passwordMessage && (
              <div
                className={`flex items-start gap-2 rounded-xl px-3 py-2 text-[11px] leading-snug ${
                  passwordMessage.type === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                    : 'bg-red-500/10 border border-red-500/30 text-red-300'
                }`}
              >
                {passwordMessage.type === 'success' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                )}
                <span>{passwordMessage.text}</span>
              </div>
            )}
            <button
              type="submit"
              disabled={passwordSaving || !newPassword || !confirmPassword}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {passwordSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
              Změnit heslo
            </button>
          </form>

          {/* Read-only metadata */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-bold text-slate-300 mb-1">Údaje o účtu</h3>

            <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-800/60 border border-slate-700/60 rounded-xl">
              <span className="flex items-center gap-2 text-xs text-slate-400">
                <Mail className="w-3.5 h-3.5" /> E-mail
              </span>
              <span className="text-xs font-semibold text-slate-200 truncate max-w-[60%]" title={user.email ?? ''}>
                {user.email}
              </span>
            </div>

            <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-800/60 border border-slate-700/60 rounded-xl">
              <span className="flex items-center gap-2 text-xs text-slate-400">
                <Shield className="w-3.5 h-3.5" /> Role
              </span>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${ROLE_COLORS[role]}`}>
                {ROLE_LABELS[role]}
              </span>
            </div>

            <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-800/60 border border-slate-700/60 rounded-xl">
              <span className="flex items-center gap-2 text-xs text-slate-400">
                <CalendarDays className="w-3.5 h-3.5" /> Registrace
              </span>
              <span className="text-xs font-semibold text-slate-200">{formatRegistrationDate(profile.created_at)}</span>
            </div>

            <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-800/60 border border-slate-700/60 rounded-xl">
              <span className="flex items-center gap-2 text-xs text-slate-400">
                <Award className="w-3.5 h-3.5" /> Celkové XP
              </span>
              <span className="text-xs font-mono font-bold text-amber-300">{totalXp.toLocaleString('cs-CZ')} XP</span>
            </div>

            <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-800/60 border border-slate-700/60 rounded-xl">
              <span className="flex items-center gap-2 text-xs text-slate-400">
                <Award className="w-3.5 h-3.5" /> Aktuální hodnost
              </span>
              <span className="text-xs font-semibold text-slate-200">
                {currentRank.shortTitle} <span className="text-slate-500">•</span> Úroveň {currentRank.level}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
