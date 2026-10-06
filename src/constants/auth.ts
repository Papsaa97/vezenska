import { isCaptchaConfigured } from './captcha';
import type { UserRole } from '../types/auth';

/**
 * Lidské názvy rolí. Sdílené, protože je potřebuje profil i pruh s náhledem —
 * dvě kopie by se dřív nebo později rozešly.
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  student: 'Kadet / Student',
  velitel_tridy: 'Velitel třídy',
  lektor: 'Lektor',
  admin: 'Správce',
};

/**
 * Minimální délka hesla používaná v nápovědě a v atributu minLength.
 *
 * MUSÍ odpovídat nastavení v Supabase (Authentication → Providers → Email →
 * Minimum password length). Tahle hodnota je jen předvyplnění pro formulář;
 * skutečnou hranici hlídá server a jeho odpověď má přednost — translateError
 * si požadovanou délku přečte přímo z chybové hlášky, takže po zpřísnění
 * nastavení sedí hláška i bez nasazení nové verze aplikace.
 */
export const MIN_PASSWORD_LENGTH = 12;

/**
 * Supabase (Authentication → Providers → Email → Password requirements) je
 * nastavený na „malá i velká písmena, číslice a symboly“. Server tedy odmítne
 * heslo, kterému chybí kterákoli ze čtyř skupin — formulář to dřív jen
 * „doporučoval“ a lidé se o skutečném požadavku dozvěděli až z odmítnuté
 * registrace (v logu Auth opakovaně). Kontrola tady je jen předběžná, aby
 * se nemusela znovu řešit captcha; rozhoduje server.
 */
export const PASSWORD_REQUIREMENTS_TEXT =
  'malé i velké písmeno, číslici a speciální znak (např. !@#$%&*)';

/** Vrátí českou výtku k heslu, nebo null, když splňuje pravidla serveru. */
export function passwordProblem(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Heslo musí mít alespoň ${MIN_PASSWORD_LENGTH} znaků.`;
  }
  const missing: string[] = [];
  if (!/[a-z]/.test(password)) missing.push('malé písmeno');
  if (!/[A-Z]/.test(password)) missing.push('velké písmeno');
  if (!/[0-9]/.test(password)) missing.push('číslici');
  if (!/[^a-zA-Z0-9]/.test(password)) missing.push('speciální znak (např. !@#$%&*)');
  return missing.length > 0 ? `Heslo musí obsahovat ještě: ${missing.join(', ')}.` : null;
}

/** Tvar chyby, se kterou pracuje překlad hlášek. */
export interface TranslatableAuthError {
  message: string;
  code?: string;
}

/**
 * Přeloží chybu z Supabase Auth do češtiny.
 *
 * Dřív byla tahle funkce zkopírovaná v AuthWall i AuthUI, obě verze braly jen
 * text chyby a neměly případ pro slabé heslo — uživatel tak dostal surovou
 * anglickou hlášku. Navíc měly natvrdo napsané „alespoň 6 znaků“, což by
 * přestalo platit v okamžiku zvýšení minima na serveru.
 */
export function translateAuthError(error: TranslatableAuthError): string {
  const msg = error.message;

  // Slabé heslo hlásí server ve dvou situacích: při registraci nového hesla
  // a při přihlášení účtu, jehož stávající heslo nesplňuje zpřísněné
  // požadavky. Délku bereme z odpovědi, ne z konstanty.
  if (
    error.code === 'weak_password'
    || msg.includes('Password should be at least')
    || msg.includes('Password should contain')
  ) {
    if (/contain at least one character/i.test(msg)) {
      return `Heslo musí obsahovat ${PASSWORD_REQUIREMENTS_TEXT}.`;
    }
    const required = msg.match(/at least (\d+)/)?.[1];
    return required
      ? `Heslo musí mít alespoň ${required} znaků.`
      : `Heslo nesplňuje požadavky na sílu. Musí mít alespoň ${MIN_PASSWORD_LENGTH} znaků a obsahovat ${PASSWORD_REQUIREMENTS_TEXT}.`;
  }

  // Ochrana proti robotům. Server ji vyžaduje, ale rozhoduje, jestli ji
  // aplikace vůbec umí zobrazit — a podle toho se liší, kdo to může spravit.
  if (/captcha/i.test(msg)) {
    return isCaptchaConfigured()
      ? 'Ověření, že nejste robot, se nepodařilo dokončit. Zkuste ho prosím projít znovu.'
      : 'Přihlášení blokuje ochrana proti robotům, kterou tahle verze aplikace neumí zobrazit — '
        + 'chybí jí nastavení ověření. Nejde o chybu vašich údajů; obraťte se prosím na správce portálu.';
  }

  // Vrací se při změně hesla v profilu, když uživatel zadá to stávající.
  if (error.code === 'same_password' || msg.includes('should be different from the old password')) {
    return 'Nové heslo se musí lišit od toho stávajícího.';
  }

  if (msg.includes('Invalid login credentials')) return 'Nesprávný e-mail nebo heslo.';
  if (msg.includes('Email not confirmed')) return 'E-mail ještě nebyl ověřen. Zkontrolujte prosím svou schránku.';
  if (msg.includes('User already registered')) return 'Účet s tímto e-mailem již existuje.';
  if (msg.includes('rate limit')) return 'Příliš mnoho pokusů. Zkuste to prosím za chvíli.';
  return msg;
}

/**
 * Hláška pro případ, kdy se přihlášení POVEDLO, ale heslo už nevyhovuje
 * zpřísněným požadavkům. Není to chyba — uživatel je uvnitř — takže se
 * zobrazuje jako upozornění, ne jako červené selhání.
 */
export function weakPasswordNotice(error: TranslatableAuthError): string {
  const required = error.message.match(/at least (\d+)/)?.[1];
  const delka = required ? ` Nové heslo musí mít alespoň ${required} znaků.` : '';
  return `Přihlášení proběhlo, ale vaše heslo už nesplňuje bezpečnostní požadavky.${delka} Změňte si ho prosím v profilu.`;
}
