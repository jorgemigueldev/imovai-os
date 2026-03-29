import { router } from './trpc.js';
import { authRouter } from './routers/auth.js';
import { leadRouter } from './routers/lead.js';
import { propertyRouter } from './routers/pipeline.js';
import { pipelineRouter } from './routers/pipeline.js';
import { aiRouter, dashboardRouter } from './routers/ai.js';
import { workflowRouter } from './routers/workflow.js';

export const appRouter = router({
  auth: authRouter,
  lead: leadRouter,
  property: propertyRouter,
  pipeline: pipelineRouter,
  ai: aiRouter,
  dashboard: dashboardRouter,
  workflow: workflowRouter,
});

export type AppRouter = typeof appRouter;
