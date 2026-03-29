import { z } from 'zod';
import { router, protectedProcedure } from '../trpc.js';
import { TRPCError } from '@trpc/server';
import { AutomationEngine } from '../services/AutomationEngine.js';

const automation = new AutomationEngine();

export const leadRouter = router({
  list: protectedProcedure
    .input(z.object({
      search: z.string().optional(),
      status: z.string().optional()
    }))
    .query(async ({ input, ctx }) => {
      const where: any = { companyId: ctx.user.companyId };
      if (input.search) {
        where.OR = [
          { name: { contains: input.search } },
          { email: { contains: input.search } },
          { phone: { contains: input.search } }
        ];
      }
      if (input.status) {
        where.status = input.status;
      }

      return await ctx.prisma.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { cards: true }
      });
    }),

  get: protectedProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const lead = await ctx.prisma.lead.findUnique({
        where: { id: input },
        include: { messages: true, cards: true, visits: true, proposals: true }
      });

      if (!lead || lead.companyId !== ctx.user.companyId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Lead not found' });
      }

      return lead;
    }),

  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      phone: z.string(),
      email: z.string().email().optional(),
      source: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      const lead = await ctx.prisma.lead.create({
        data: {
          ...input,
          companyId: ctx.user.companyId
        }
      });

      // Trigger Automation Engine for NEW_LEAD
      await automation.trigger('NEW_LEAD', lead, ctx.user.companyId);

      return lead;
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email().optional(),
      score: z.number().optional(),
      status: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      return await ctx.prisma.lead.update({
        where: { id, companyId: ctx.user.companyId },
        data
      });
    })
});
