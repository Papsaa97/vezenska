import { defineFactory } from '@autonoma-ai/sdk';
import { z } from 'zod';
import { getAdminSupabaseClient } from '../client';

export const QuizQuestionsFactory = defineFactory({
  inputSchema: z.object({
    subject: z.string(),
    question: z.string(),
    options: z.array(z.string()),
    correct_index: z.number(),
    explanation: z.string().optional().default(''),
    is_hidden: z.boolean().optional().default(false),
  }),
  refSchema: z.object({
    id: z.string(),
    subject: z.string(),
    question: z.string(),
    options: z.array(z.string()),
    correct_index: z.number(),
    explanation: z.string(),
    is_hidden: z.boolean().optional().default(false),
  }),
  create: async (data, ctx) => {
    const sb = await getAdminSupabaseClient();
    // Ensure uniqueness across concurrent runs if token not in question
    let questionText = data.question;
    if (!questionText.includes(ctx.testRunId) && !questionText.includes(ctx.testRunId.slice(0, 8))) {
      questionText = `${data.question} [${ctx.testRunId.slice(0, 8)}]`;
    }

    const payload = {
      subject: data.subject,
      question: questionText,
      options: data.options,
      correct_index: data.correct_index,
      explanation: data.explanation || '',
      is_hidden: data.is_hidden ?? false,
    };

    const res = await sb.from('quiz_questions').insert([payload]).select().single();
    if (res.error || !res.data) {
      throw new Error(`Failed to create quiz_question: ${res.error?.message ?? 'Unknown error'}`);
    }

    const row = res.data as {
      id: string;
      subject: string;
      question: string;
      options: string[];
      correct_index: number;
      explanation: string;
      is_hidden?: boolean;
    };

    return {
      id: String(row.id),
      subject: String(row.subject),
      question: String(row.question),
      options: Array.isArray(row.options) ? row.options : data.options,
      correct_index: Number(row.correct_index),
      explanation: String(row.explanation || ''),
      is_hidden: Boolean(row.is_hidden),
    };
  },
  teardown: async (record, _ctx) => {
    const sb = await getAdminSupabaseClient();
    const res = await sb.from('quiz_questions').delete().eq('id', record.id);
    if (res.error) {
      console.warn(`[Autonoma] Teardown quiz_question ${record.id} warning:`, res.error.message);
    }
  },
});
