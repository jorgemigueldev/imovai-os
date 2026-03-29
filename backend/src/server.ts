import express from 'express';
import * as trpcExpress from '@trpc/server/adapters/express';
import { createContext } from './trpc.js';
import { appRouter } from './root.js';
import cors from 'cors';
import dotenv from 'dotenv';
import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import pino from 'pino';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// --- tRPC Middleware ---

app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// --- WhatsApp Core (Baileys) ---

async function connectToWhatsApp(companyId: string) {
  const { state, saveCreds } = await useMultiFileAuthState(`sessions/${companyId}`);
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    logger: pino({ level: 'silent' }),
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) connectToWhatsApp(companyId);
    } else if (connection === 'open') {
      console.log(`✅ WhatsApp conectado para empresa: ${companyId}`);
    }
  });

  // Message Upsert Logic (Simplified for v2.0)
  sock.ev.on('messages.upsert', async (m) => {
    // Lead generation logic...
  });

  return sock;
}

// Auto-seeding default stages for new companies
async function seedDefaultStages(companyId: string) {
  // Find or create default pipeline
  let pipeline = await prisma.pipeline.findFirst({ where: { companyId } });
  if (!pipeline) {
      pipeline = await prisma.pipeline.create({
          data: { name: 'VENDAS PROPRIETÁRIAS', companyId }
      });
  }

  const stagesCount = await prisma.pipelineStage.count({ where: { pipelineId: pipeline.id } });
  if (stagesCount === 0) {
    const defaultStages = [
      "PROSPECÇÃO", "QUALIFICAÇÃO", "VISITA", "PROPOSTA", "NEGOCIAÇÃO", "FECHADO", "PERDIDO"
    ];
    for (let i = 0; i < defaultStages.length; i++) {
        const stage = await prisma.pipelineStage.create({
            data: { name: defaultStages[i], order: i, pipelineId: pipeline.id }
        });
        // Seed some demo cards in the first stage
        if (i === 0) {
            const lead = await prisma.lead.create({
                data: { name: 'Cliente Potencial Demo', phone: '554799999999', companyId }
            });
            await prisma.pipelineCard.create({
                data: { title: 'Interesse Apto Vista Mar', value: 1200000, stageId: stage.id, leadId: lead.id }
            });
        }
    }
    console.log(`✅ Default stages and demo cards seeded for company: ${companyId}`);
  }
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '3.0.0-PRO' });
});

// Seed a demo company on start if none exists
(async () => {
    const companies = await prisma.company.findMany();
    if (companies.length > 0) {
        await seedDefaultStages(companies[0].id);
    }
})();

app.listen(port, () => {
  console.log(`🚀 IMOVAI OS v3.0 Backend (Enterprise) running on http://localhost:${port}`);
});
