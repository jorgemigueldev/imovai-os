import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { Groq } from 'groq-sdk';
import { makeWASocket, DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import { pino } from 'pino';
import path from 'path';
import multer from 'multer';
import * as xlsx from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });
const port = process.env.PORT || 3000;

const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  OK: 200,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

app.use(cors());
app.use(express.json());

// --- Middlewares ---

const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(HTTP_STATUS.UNAUTHORIZED);

  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err: any, user: any) => {
    if (err) return res.sendStatus(HTTP_STATUS.FORBIDDEN);
    req.user = user;
    next();
  });
};

// --- Auth Routes ---

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, companyName } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const company = await prisma.company.create({
      data: { name: companyName }
    });
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        companyId: company.id
      }
    });
    res.json({ message: 'User created' });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({
    where: { email },
    include: { company: true }
  });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign(
    { id: user.id, companyId: user.companyId, role: user.role },
    process.env.JWT_SECRET || 'secret'
  );
  res.json({ token, user: { name: user.name, email: user.email, companyId: user.companyId } });
});

// --- Lead & Pipeline Routes ---

app.get('/api/leads', authenticateToken, async (req: any, res) => {
  const leads = await prisma.lead.findMany({
    where: { companyId: req.user.companyId },
    orderBy: { createdAt: 'desc' },
    include: { cards: true }
  });
  res.json(leads);
});

app.get('/api/kanban', authenticateToken, async (req: any, res) => {
  const deals = await prisma.pipelineCard.findMany({
    where: { stage: { pipeline: { companyId: req.user.companyId } } },
    include: { lead: true }
  });
  res.json(deals);
});

app.post('/api/deals/move', authenticateToken, async (req: any, res) => {
  const { dealId, stageId } = req.body;
  const deal = await prisma.pipelineCard.update({
    where: { id: dealId },
    data: { stageId }
  });
  res.json(deal);
});

// --- Property Routes ---

const upload = multer({ dest: 'uploads/' });

app.post('/api/properties/import', authenticateToken, upload.single('file'), async (req: any, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  const workbook = xlsx.readFile(file.path);
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'Empty Excel file' });
  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'Invalid sheet' });
  const data: any[] = xlsx.utils.sheet_to_json(worksheet);

  const properties = data.map((row: any) => ({
    title: row.Titulo || row.Title,
    price: parseFloat(row.Preco || row.Price || '0'),
    description: row.Descricao || row.Description || '',
    area: parseFloat(row.Area || '0'),
    rooms: parseInt(row.Quartos || row.Rooms || '0'),
    bathrooms: parseInt(row.Banheiros || row.Bathrooms || '0'),
    city: row.Cidade || row.City || '',
    neighborhood: row.Bairro || row.Neighborhood || '',
    companyId: req.user.companyId
  }));

  await prisma.property.createMany({ data: properties });
  res.json({ message: 'Properties imported', count: properties.length });
});

app.get('/api/properties', authenticateToken, async (req: any, res) => {
  const props = await prisma.property.findMany({
    where: { companyId: req.user.companyId }
  });
  res.json(props);
});

// --- Analytics Routes ---

app.get('/api/analytics', authenticateToken, async (req: any, res) => {
  const companyId = req.user.companyId;
  const leadCount = await prisma.lead.count({ where: { companyId } });
  const dealCount = await prisma.pipelineCard.count({ where: { stage: { pipeline: { companyId } } } });
  const closedDeals = await prisma.pipelineCard.findMany({
    where: { stage: { pipeline: { companyId }, name: 'FECHADO' } }
  });
  const vgv = closedDeals.reduce((sum: number, d: any) => sum + d.value, 0);

  const dealsByStage = await prisma.pipelineCard.groupBy({
    by: ['stageId'],
    where: { stage: { pipeline: { companyId } } },
    _count: true
  });

  res.json({ leadCount, dealCount, vgv, dealsByStage });
});

app.post('/api/demo/seed', authenticateToken, async (req: any, res) => {
  const companyId = req.user.companyId;
  
  // Seed Properties
  await prisma.property.createMany({
    data: [
      { title: 'Cobertura Duplex - Centro', price: 2500000, city: 'Penha', neighborhood: 'Centro', companyId },
      { title: 'Casa de Luxo - Praia Grande', price: 4200000, city: 'Penha', neighborhood: 'Praia Grande', companyId },
      { title: 'Apto Vista Mar', price: 1800000, city: 'Balneário Piçarras', neighborhood: 'Itacolomi', companyId }
    ]
  });

  // Seed Leads
  const lead = await prisma.lead.create({
    data: { 
      name: 'Cliente Demo', 
      phone: '554799999999', 
      companyId,
      behavioralProfile: 'Estável',
      status: 'QUALIFIED'
    }
  });

  // Seed PipelineCard
  const stage = await prisma.pipelineStage.findFirst({
      where: { pipeline: { companyId } }
  });

  if (stage) {
    await prisma.pipelineCard.create({
        data: { title: 'Negócio - Apto Vista Mar', value: 1800000, stageId: stage.id, leadId: lead.id }
    });
  }

  res.json({ message: 'Demo data seeded successfully' });
});

// --- IA Beatriz Engine (SPIN Selling/DISC) ---

async function generateBeatrizResponse(leadId: string, companyId: string, userMessage: string) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: { messages: { take: 10, orderBy: { timestamp: 'desc' } } }
  });

  const properties = await prisma.property.findMany({
    where: { companyId },
    take: 5
  });

  const history = lead?.messages.reverse().map((m: any) => ({
    role: m.role.toLowerCase() as 'user' | 'assistant',
    content: m.content
  })) || [];

  const discProfile = lead?.behavioralProfile || 'Desconhecido';
  const propertiesText = properties.map((p: any) => `- ${p.title}: R$ ${p.price} em ${p.neighborhood}, ${p.city}`).join('\n');

  const systemPrompt = `Você é Beatriz, a assistente virtual de inteligência artificial da IMOVAI OS.
Sua missão é atuar como uma corretora de imóveis de alto nível, focada no mercado brasileiro.

ESTRATÉGIA DE VENDAS:
1. Use SPIN Selling:
   - S (Situação): Entenda o momento atual do cliente.
   - P (Problema): Identifique dificuldades no processo atual dele.
   - I (Implicação): Mostre as consequências de não resolver o problema (ex: perda de dinheiro em aluguel).
   - N (Necessidade de Recompensa): Mostre como o imóvel resolve tudo.
2. NUNCA REPITA frases prontas. Use variações criativas.
3. SEMPRE CONDUZA para uma reunião, visita ou ligação. Use perguntas abertas.
4. ADAPTAÇÃO COMPORTAMENTAL (DISC):
   - Se Perfil for Dominante: Seja direta, focada em resultados e eficiente.
   - Se for Influente: Seja calorosa, entusiasta e foque no social/status.
   - Se for Estável: Seja calma, paciente, passe segurança e foque no bem-estar da família.
   - Se for Conforme: Use dados, fatos, precisão e seja formal.

Perfil Atual do Cliente: ${discProfile}
Imóveis Disponíveis:
${propertiesText}

Sua resposta deve ser humana, empática e focada em converter para um próximo passo.`;

  const completion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: userMessage }
    ],
    model: 'llama3-70b-8192', // Fast and intelligent
  });

  const response = completion.choices[0].message.content;
  return response;
}

// --- WhatsApp Logic (Baileys) ---

async function connectWhatsapp(companyId: string) {
  const { state, saveCreds } = await useMultiFileAuthState(`sessions/${companyId}`);
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    logger: pino({ level: 'silent' })
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) connectWhatsapp(companyId);
    } else if (connection === 'open') {
      await prisma.whatsappSession.upsert({
        where: { companyId },
        update: { status: 'LOGGED' },
        create: { companyId, status: 'LOGGED' }
      });
    }
  });

  sock.ev.on('messages.upsert', async (m) => {
    if (m.type === 'notify') {
      for (const msg of m.messages) {
        if (!msg.key.fromMe && msg.message?.conversation) {
          const from = msg.key.remoteJid?.split('@')[0] || '';
          const content = msg.message.conversation;

          // Find or create Lead
          let lead = await prisma.lead.findFirst({ where: { phone: from, companyId } });
          if (!lead) {
            lead = await prisma.lead.create({
              data: { name: from, phone: from, companyId }
            });
          }

          // Save user message
          await prisma.leadMessage.create({
            data: { content, role: 'USER', leadId: lead.id }
          });

          // Generate AI response
          const aiResponse = await generateBeatrizResponse(lead.id, companyId, content);

          // Analysis of DISC profile and summary (Async learning)
          // (Implementation placeholder for advanced learning logic)

          // Send response
          await sock.sendMessage(msg.key.remoteJid!, { text: aiResponse! });

          // Save AI message
          await prisma.leadMessage.create({
            data: { content: aiResponse!, role: 'ASSISTANT', leadId: lead.id }
          });
        }
      }
    }
  });
}

// REST Route to trigger QR scan/connect
app.post('/api/whatsapp/connect', authenticateToken, async (req: any, res) => {
  try {
    connectWhatsapp(req.user.companyId);
    res.json({ message: 'WhatsApp initialization started. Scan QR code in terminal.' });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`IMOVAI OS Backend running on http://localhost:${port}`);
});
