import { z } from 'zod';
import { router, protectedProcedure } from '../trpc.js';
import { TRPCError } from '@trpc/server';

export const propertyRouter = router({
  list: protectedProcedure
    .input(z.object({
      search: z.string().optional(),
      minPrice: z.number().optional(),
      maxPrice: z.number().optional(),
      rooms: z.number().optional()
    }))
    .query(async ({ input, ctx }) => {
      const where: any = { companyId: ctx.user.companyId };
      if (input.search) {
        where.OR = [
          { title: { contains: input.search } },
          { neighborhood: { contains: input.search } },
          { city: { contains: input.search } }
        ];
      }
      if (input.minPrice) where.price = { gte: input.minPrice };
      if (input.maxPrice) where.price = { ...where.price, lte: input.maxPrice };
      if (input.rooms) where.rooms = input.rooms;

      return await ctx.prisma.property.findMany({ where, orderBy: { createdAt: 'desc' } });
    }),

  create: protectedProcedure
    .input(z.object({
      title: z.string(),
      description: z.string().optional(),
      price: z.number(),
      area: z.number().optional(),
      rooms: z.number().optional(),
      bathrooms: z.number().optional(),
      city: z.string(),
      neighborhood: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.property.create({
        data: { ...input, companyId: ctx.user.companyId }
      });
    })
});

export const pipelineRouter = router({
  getStages: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.pipelineStage.findMany({
      where: { pipeline: { companyId: ctx.user.companyId } },
      include: { cards: { include: { lead: true } } },
      orderBy: { order: 'asc' }
    });
  }),

  moveCard: protectedProcedure
    .input(z.object({
      cardId: z.string(),
      targetStageId: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      const card = await ctx.prisma.pipelineCard.findUnique({ where: { id: input.cardId } });
      if (!card) throw new TRPCError({ code: 'NOT_FOUND' });

      return await ctx.prisma.pipelineCard.update({
        where: { id: input.cardId },
        data: { stageId: input.targetStageId }
      });
    })
});
