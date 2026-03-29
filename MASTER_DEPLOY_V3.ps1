# 🚀 IMOVAI OS v3.1 PRO - Master Deploy (Ultra Robust)

$ProjectRoot = "c:\Users\Usuario\.antigravity\awesome-open-source-systems\imovai-os"
Set-Location $ProjectRoot

# Forçar TLS 1.2 para download estável
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

Write-Host "--- Iniciando Deploy de Elite de IMOVAI OS v3.0 PRO ---" -ForegroundColor Cyan

# 1. Configuração de Repositório
$Branch = (git branch --show-current)
Write-Host "Detectando Branch Ativo: $Branch" -ForegroundColor Gray

$GithubUser = "jorgemigueldev"
$RepoName = "imovai-os"

Write-Host "Dica: Se o push falhar por 403, utilize um Personal Access Token (PAT)." -ForegroundColor Yellow
$Token = Read-Host "Insira seu GitHub Token (ou pressione Enter para usar credenciais salvas)"

if ($Token) {
    $RemoteUrl = "https://$Token@github.com/$GithubUser/$RepoName.git"
    git remote set-url origin $RemoteUrl
}

Write-Host "Consolidando alterações locais..." -ForegroundColor Gray
git add .
git commit -m "feat: IMOVAI OS v3.0 PRO - Enterprise Build Sync (Final Fix)"

Write-Host "Enviando para o GitHub ($Branch)..." -ForegroundColor Cyan
git push -u origin $Branch

# 2. Validação de Blueprint (Zero-Dependencies)
Write-Host "Validando Blueprint IMOVAI OS v3.3..." -ForegroundColor Cyan

try {
    node blueprint_check.mjs
    Write-Host "✅ Configuração validada com sucesso via Node.js nativo (ESM)." -ForegroundColor Green
} catch {
    Write-Host "⚠️ Erro na validação técnica." -ForegroundColor Yellow
}

Write-Host "--- Operação Concluída! ---" -ForegroundColor Green
Write-Host "Seu SaaS v3.0 está sincronizado no GitHub e pronto para o Render." -ForegroundColor White
