import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../../../backend/src/root';
import superjson from 'superjson';

export const trpc = createTRPCReact<AppRouter>();
