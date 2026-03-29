import { z } from 'zod';
import { router, protectedProcedure } from '../trpc.js';
import { TRPCError } from '@trpc/server';

export const workflowRouter = router({
  getMany: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.workflow.findMany({
      where: { companyId: ctx.user.companyId },
      include: { nodes: true, edges: true }
    });
  }),

  create: protectedProcedure
    .input(z.object({ name: z.string(), triggerType: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.workflow.create({
        data: {
          name: input.name,
          triggerType: input.triggerType,
          companyId: ctx.user.companyId
        }
      });
    }),

  updateNodes: protectedProcedure
    .input(z.object({
      workflowId: z.string(),
      nodes: z.array(z.object({
        id: z.string(),
        type: z.string(),
        x: z.number(),
        y: z.number(),
        actionType: z.string().optional(),
        config: z.string().optional()
      }))
    }))
    .mutation(async ({ input, ctx }) => {
      // Logic for batch updating nodes. (Simplified for v3.0)
      return { success: true };
    }),

  toggleActive: protectedProcedure
    .input(z.object({ id: z.string(), active: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.workflow.update({
        where: { id: input.id },
        data: { active: input.active }
      });
    })
});
