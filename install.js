const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando Instalação do IMOVAI OS...');

function run(command, cwd) {
  try {
    console.log(`\n> Executando: ${command} em ${cwd || 'root'}`);
    execSync(command, { stdio: 'inherit', cwd });
  } catch (e) {
    console.error(`❌ Erro ao executar ${command}: ${e.message}`);
    process.exit(1);
  }
}

// 1. Verificar Node.js
try {
  const version = execSync('node -v').toString();
  console.log(`✅ Node.js detectado: ${version.trim()}`);
} catch (e) {
  console.error('❌ Node.js não encontrado. Por favor, instale o Node.js v18+');
  process.exit(1);
}

// 2. Criar .env se não existir
const envPath = path.join(__dirname, 'backend', '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Criando arquivo .env padrão...');
  const envContent = `
DATABASE_URL="file:./dev.db"
JWT_SECRET="imovai_secret_key_2024"
GROQ_API_KEY="COLOQUE_SUA_CHAVE_AQUI"
PORT=3000
`.trim();
  fs.writeFileSync(envPath, envContent);
}

// 3. Instalar dependências Backend
console.log('\n📦 Instalando dependências do Backend (ignorando scripts problemáticos)...');
run('npm install --ignore-scripts --legacy-peer-deps', path.join(__dirname, 'backend'));

// 4. Prisma Setup
console.log('\n🗄️ Configurando Banco de Dados (SQLite)...');
run('npx prisma generate', path.join(__dirname, 'backend'));
run('npx prisma db push', path.join(__dirname, 'backend'));

// 5. Instalar dependências Frontend
console.log('\n🎨 Instalando dependências do Frontend...');
run('npm install --ignore-scripts --legacy-peer-deps', path.join(__dirname, 'frontend'));

console.log(`
✅ INSTALAÇÃO CONCLUÍDA COM SUCESSO!

Para rodar o sistema:
1. Abra o terminal na pasta 'backend' e digite: npm run dev
2. Abra outro terminal na pasta 'frontend' e digite: npm run dev

Acesse: http://localhost:3000
IA Beatriz está pronta para qualificar seus leads via WhatsApp!
`);
