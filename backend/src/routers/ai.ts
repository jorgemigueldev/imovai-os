import { z } from 'zod';
import { router, protectedProcedure } from '../trpc.js';
import { TRPCError } from '@trpc/server';
import { Groq } from 'groq-sdk';
import fs from 'fs';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

const BEATRIZ_SYSTEM_PROMPT = `
Você é a Beatriz, a assistente virtual de elite da IMOVAI OS.
Seu objetivo é qualificar leads imobiliários usando:
1. SPIN Selling (Situação, Problema, Implicação, Necessidade).
2. Perfil DISC (Adapte seu tom: Dominante=Direta, Influente=Entusiasta, Estável=Empática, Conforme=Técnica).

REGRAS:
- Nunca responda com textos longos.
- Sempre termine com uma pergunta que leve ao agendamento de visita.
- Identifique o momento do lead: ele quer morar ou investir?
`;

export const aiRouter = router({
  chat: protectedProcedure
    .input(z.object({
      leadId: z.string(),
      message: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      const lead = await ctx.prisma.lead.findUnique({
        where: { id: input.leadId },
        include: { messages: { take: 10, orderBy: { timestamp: 'desc' } } }
      });

      if (!lead) throw new TRPCError({ code: 'NOT_FOUND' });

      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: BEATRIZ_SYSTEM_PROMPT },
          ...lead.messages.map(m => ({ role: m.role as any, content: m.content })),
          { role: 'user', content: input.message }
        ],
        model: 'llama3-70b-8192',
      });

      const response = completion.choices[0].message.content || '';

      // Log AI & Save Msg
      await ctx.prisma.leadMessage.create({
        data: { content: input.message, role: 'USER', leadId: input.leadId }
      });
      await ctx.prisma.leadMessage.create({
        data: { content: response, role: 'ASSISTANT', leadId: input.leadId }
      });

      return response;
    }),

  transcribe: protectedProcedure
    .input(z.object({ audioPath: z.string() }))
    .mutation(async ({ input }) => {
      // Replaces placeholder with actual Groq Whisper
      const transcription = await groq.audio.transcriptions.create({
        file: fs.createReadStream(input.audioPath),
        model: 'whisper-large-v3',
      });
      return transcription.text;
    })
});

export const dashboardRouter = router({
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const leadCount = await ctx.prisma.lead.count({ where: { companyId: ctx.user.companyId } });
    const propertyCount = await ctx.prisma.property.count({ where: { companyId: ctx.user.companyId } });
    const activeAutomations = await ctx.prisma.workflow.count({ 
      where: { companyId: ctx.user.companyId, active: true } 
    });
    // Revenue Calc (VGV) & Cards
    const cards = await ctx.prisma.pipelineCard.findMany({
      where: { 
        stage: { 
          pipeline: { companyId: ctx.user.companyId }
        } 
      }
    });

    const vgv = cards
      .filter(c => c.stageId === 'FECHADO') // Note: In v3.0 we check stage name or id
      .reduce((sum, c) => sum + c.value, 0);

    return { leadCount, propertyCount, activeAutomations, vgv, cardCount: cards.length };
  })
});
