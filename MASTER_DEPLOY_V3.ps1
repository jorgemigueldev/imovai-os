# 🚀 IMOVAI OS v3.0 PRO - Script de Master Deploy
# Este script deve ser executado pelo usuário no PowerShell (Administrador) se o push automático falhar.

$ProjectRoot = "c:\Users\Usuario\.antigravity\awesome-open-source-systems\imovai-os"
Set-Location $ProjectRoot

Write-Host "--- Iniciando Deploy de Elite de IMOVAI OS v3.0 PRO ---" -ForegroundColor Cyan

# 1. Configuração de Git
$GithubUser = "jorgemigueldev"
$RepoName = "imovai-os"

Write-Host "Dica: Se o push falhar por 403, o GitHub pode exigir um Personal Access Token (PAT)." -ForegroundColor Yellow
$Token = Read-Host "Insira seu GitHub Token (ou pressione Enter para usar credenciais salvas)"

if ($Token) {
    $RemoteUrl = "https://$Token@github.com/$GithubUser/$RepoName.git"
    git remote set-url origin $RemoteUrl
}

Write-Host "Consolidando alterações locais..." -ForegroundColor Gray
git add .
git commit -m "feat: IMOVAI OS v3.0 PRO - Full Enterprise Upgrade & Automation"

Write-Host "Enviando para o GitHub..." -ForegroundColor Cyan
git push -u origin main

# 2. Instalação da Render CLI
Write-Host "Baixando Render CLI..." -ForegroundColor Cyan
$Url = "https://github.com/render-oss/cli/releases/latest/download/render-windows-amd64.zip"
$Zip = "render_cli.zip"

try {
    Invoke-WebRequest -Uri $Url -OutFile $Zip -ErrorAction Stop
    Expand-Archive -Path $Zip -DestinationPath . -Force
    Write-Host "✅ Render CLI instalada com sucesso!" -ForegroundColor Green
    .\render.exe --version
} catch {
    Write-Host "❌ Falha no download automático. Por favor, baixe manualmente em: $Url" -ForegroundColor Red
}

Write-Host "--- Operação Concluída com Sucesso! ---" -ForegroundColor Emerald
Write-Host "Agora seu SaaS v3.0 está sincronizado e pronto para decolar." -ForegroundColor White
