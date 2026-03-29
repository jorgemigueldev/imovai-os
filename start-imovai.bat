@echo off
echo 🚀 Iniciando IMOVAI OS...
start "IMOVAI Backend" cmd /c "cd backend && npm run dev"
start "IMOVAI Frontend" cmd /c "cd frontend && npm run dev"
echo ✅ Backend e Frontend iniciados em janelas separadas.
echo Acesse: http://localhost:3000
pause
