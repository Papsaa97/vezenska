import { MissingFeature, RpcResult, call } from './classMembership';

// ─── Diskuze třídy (migrace 039) ─────────────────────────────────────────────
//
// Příspěvky, ankety a označení členů. Tabulky jsou klientům zavřené; kdo smí
// číst, psát a moderovat, rozhoduje server (členové třídy, velitel a jeho
// platný zástupce, lektoři a správci).

const DISCUSSION_FEATURE: MissingFeature = { label: 'Diskuze třídy', ending: 'á', migration: '039' };

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface MentionedMember {
  id: string;
  name: string;
}

export interface DiscussionPost {
  id: string;
  authorId: string | null;
  authorName: string;
  authorRole: string | null;
  text: string;
  mentions: MentionedMember[];
  isPoll: boolean;
  pollUntil: string | null;
  pollOpen: boolean;
  options: PollOption[];
  myVote: string | null;
  totalVotes: number;
  pinned: boolean;
  hidden: boolean;
  createdAt: string;
  /** Volající smí příspěvky v této třídě připínat, skrývat a mazat. */
  canModerate: boolean;
}

interface PostRow {
  id: string;
  autor_id: string | null;
  autor_jmeno: string;
  autor_role: string | null;
  text: string;
  zminky: { id: string; jmeno: string | null }[] | null;
  je_anketa: boolean;
  anketa_do: string | null;
  anketa_bezi: boolean;
  moznosti: { id: string; text: string; hlasu: number }[] | null;
  muj_hlas: string | null;
  pocet_hlasu: number | null;
  pripnuto: boolean;
  skryto: boolean;
  vytvoreno: string;
  smim_moderovat: boolean;
}

export async function fetchDiscussion(className: string): Promise<RpcResult<DiscussionPost[]>> {
  const res = await call<PostRow[]>('diskuze_tridy', { p_class: className }, DISCUSSION_FEATURE);
  if (res.error || !res.data) return { data: null, error: res.error };
  return {
    data: res.data.map((r) => ({
      id: r.id,
      authorId: r.autor_id,
      authorName: r.autor_jmeno,
      authorRole: r.autor_role,
      text: r.text,
      mentions: (r.zminky ?? []).map((z) => ({ id: z.id, name: z.jmeno ?? 'Uživatel' })),
      isPoll: r.je_anketa,
      pollUntil: r.anketa_do,
      pollOpen: r.anketa_bezi,
      options: (r.moznosti ?? []).map((m) => ({ id: m.id, text: m.text, votes: m.hlasu })),
      myVote: r.muj_hlas,
      totalVotes: r.pocet_hlasu ?? 0,
      pinned: r.pripnuto,
      hidden: r.skryto,
      createdAt: r.vytvoreno,
      canModerate: r.smim_moderovat,
    })),
    error: null,
  };
}

export interface NewPostInput {
  text: string;
  mentionIds: string[];
  /** null = obyčejný příspěvek; jinak 2–10 možností ankety. */
  pollOptions: string[] | null;
  /** ISO čas konce ankety, nebo null = do ukončení. */
  pollUntil: string | null;
}

export const createPost = (className: string, input: NewPostInput) =>
  call<string>(
    'pridat_prispevek',
    {
      p_class: className,
      p_text: input.text,
      p_zminky: input.mentionIds,
      p_moznosti: input.pollOptions,
      p_anketa_do: input.pollUntil,
    },
    DISCUSSION_FEATURE
  );

export const votePoll = (postId: string, optionId: string) =>
  call<null>('hlasovat_v_ankete', { p_prispevek: postId, p_moznost: optionId }, DISCUSSION_FEATURE);

export const closePoll = (postId: string) =>
  call<null>('ukoncit_anketu', { p_prispevek: postId }, DISCUSSION_FEATURE);

/** Moderace: `null` znamená beze změny. */
export const moderatePost = (postId: string, pin: boolean | null, hide: boolean | null) =>
  call<null>('moderovat_prispevek', { p_prispevek: postId, p_pripnout: pin, p_skryt: hide }, DISCUSSION_FEATURE);

export const deletePost = (postId: string) =>
  call<null>('smazat_prispevek', { p_prispevek: postId }, DISCUSSION_FEATURE);
