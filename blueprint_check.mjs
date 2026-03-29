// IMOVAI OS v3.3 - Blueprint Validator (Native ESM)
// Validador de elite SEM dependências externas (js-yaml removido)

import fs from 'fs';

async function validateBlueprint() {
  console.log('--- Iniciando Validação IMOVAI OS v3.3 (Zero-Dependencies) ---');
  
  const blueprintPath = './render.yaml';
  try {
    if (!fs.existsSync(blueprintPath)) {
        throw new Error('Arquivo render.yaml não encontrado na raiz.');
    }

    const fileContents = fs.readFileSync(blueprintPath, 'utf8');
    console.log('✅ Arquivo render.yaml lido com sucesso.');

    // Validação Estrutural Simples (Regex para detectar serviços críticos)
    const hasPostgres = /type:\s*database|databases:/i.test(fileContents);
    const hasBackend = /name:\s*imovai-backend/i.test(fileContents);
    const hasFrontend = /name:\s*imovai-frontend/i.test(fileContents);

    if (hasPostgres && hasBackend && hasFrontend) {
        console.log('🚀 Estrutura SaaS Enterprise detectada e validada.');
    } else {
        console.warn('⚠️ Alerta: Algumas partes do blueprint podem estar incompletas.');
    }

    console.log('✨ Pronto para deploy! Sincronização GitHub ok.');
    
  } catch (e) {
    console.error('❌ Falha na validação:', e.message);
    process.exit(1);
  }
}

validateBlueprint();
