import { initTRPC, TRPCError } from '@trpc/server';
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

import superjson from 'superjson';

dotenv.config();
const prisma = new PrismaClient();

// --- Context ---

export const createContext = ({ req, res }: CreateExpressContextOptions) => {
  const getUserFromHeader = () => {
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const user = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
        return user;
      } catch (err) {
        return null;
      }
    }
    return null;
  };
  const user = getUserFromHeader();
  return { req, res, prisma, user };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

// --- tRPC Initialization ---

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

// Middleware for protected routes
const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuthed);
