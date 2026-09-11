import { defineFactory } from '@autonoma-ai/sdk';
import { z } from 'zod';
import { getAdminSupabaseClient, getTestUserId } from '../client';

export const UserFeedbackFactory = defineFactory({
  inputSchema: z.object({
    user_name: z.string(),
    category: z.string(),
    message: z.string(),
    screen_context: z.string().nullable().optional().default(null),
    status: z.string().optional().default('new'),
    user_id: z.string().nullable().optional().default(null),
  }),
  refSchema: z.object({
    id: z.string(),
    user_name: z.string(),
    category: z.string(),
    message: z.string(),
    screen_context: z.string().nullable(),
    status: z.string(),
  }),
  create: async (data, _ctx) => {
    const sb = await getAdminSupabaseClient();
    const userId = data.user_id ?? (await getTestUserId());

    const payload = {
      user_id: userId,
      user_name: data.user_name,
      category: data.category,
      message: data.message,
      screen_context: data.screen_context ?? null,
      status: data.status || 'new',
    };

    const res = await sb.from('user_feedback').insert([payload]).select().single();
    if (res.error || !res.data) {
      throw new Error(`Failed to create user_feedback: ${res.error?.message ?? 'Unknown error'}`);
    }

    const row = res.data as {
      id: string;
      user_name: string;
      category: string;
      message: string;
      screen_context: string | null;
      status: string;
    };

    return {
      id: String(row.id),
      user_name: String(row.user_name),
      category: String(row.category),
      message: String(row.message),
      screen_context: row.screen_context ? String(row.screen_context) : null,
      status: String(row.status || 'new'),
    };
  },
  teardown: async (record, _ctx) => {
    const sb = await getAdminSupabaseClient();
    const res = await sb.from('user_feedback').delete().eq('id', record.id);
    if (res.error) {
      console.warn(`[Autonoma] Teardown user_feedback ${record.id} warning:`, res.error.message);
    }
  },
});
