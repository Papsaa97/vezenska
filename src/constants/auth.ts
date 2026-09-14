import { isCaptchaConfigured } from './captcha';

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
  if (error.code === 'weak_password' || msg.includes('Password should be at least')) {
    const required = msg.match(/at least (\d+)/)?.[1];
    return required
      ? `Heslo musí mít alespoň ${required} znaků.`
      : 'Heslo nesplňuje požadavky na sílu. Zvolte delší heslo s číslicemi a velkými i malými písmeny.';
  }

  // Ochrana proti robotům. Server ji vyžaduje, ale rozhoduje, jestli ji
  // aplikace vůbec umí zobrazit — a podle toho se liší, kdo to může spravit.
  if (/captcha/i.test(msg)) {
    return isCaptchaConfigured()
      ? 'Ověření, že nejste robot, se nepodařilo dokončit. Zkuste ho prosím projít znovu.'
      : 'Přihlášení blokuje ochrana proti robotům, kterou tahle verze aplikace neumí zobrazit — '
        + 'chybí jí nastavení ověření. Nejde o chybu vašich údajů; obraťte se prosím na správce portálu.';
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
