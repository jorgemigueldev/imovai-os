import { z } from 'zod';
import { router, publicProcedure } from '../trpc.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { TRPCError } from '@trpc/server';

export const authRouter = router({
  register: publicProcedure
    .input(z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string().min(6),
      companyName: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      const existingUser = await ctx.prisma.user.findUnique({
        where: { email: input.email }
      });
      if (existingUser) {
        throw new TRPCError({ code: 'CONFLICT', message: 'Email already exists' });
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);
      const company = await ctx.prisma.company.create({
        data: { name: input.companyName }
      });

      const user = await ctx.prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: hashedPassword,
          companyId: company.id
        }
      });

      return { success: true, userId: user.id };
    }),

  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { email: input.email },
        include: { company: true }
      });

      if (!user || !(await bcrypt.compare(input.password, user.password))) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id, companyId: user.companyId, role: user.role },
        process.env.JWT_SECRET || 'secret'
      );

      return { token, user: { id: user.id, name: user.name, email: user.email, companyId: user.companyId } };
    })
});
