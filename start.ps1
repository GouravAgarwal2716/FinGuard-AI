# FinGuard AI — Startup Script

Write-Host "`n🛡️  Starting FinGuard AI Enterprise Platform..." -ForegroundColor Cyan

# 1. Start AI Engine (FastAPI)
Write-Host "`n🤖 Starting AI Engine on port 5000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\goura\OneDrive\Desktop\FinGuard AI'; uvicorn ai-engine.main:app --host 0.0.0.0 --port 5000 --reload" -WindowStyle Normal

Start-Sleep -Seconds 3

# 2. Start API Gateway (Express + TypeScript)
Write-Host "🔗 Starting API Gateway on port 4000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\goura\OneDrive\Desktop\FinGuard AI\api-gateway'; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 2

# 3. Start Frontend (Vite)
Write-Host "⚡ Starting Frontend on port 5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\goura\OneDrive\Desktop\FinGuard AI\frontend'; npm run dev" -WindowStyle Normal

Write-Host "`n✅ All services starting..." -ForegroundColor Green
Write-Host "   Frontend:    http://localhost:5173" -ForegroundColor White
Write-Host "   API Gateway: http://localhost:4000" -ForegroundColor White
Write-Host "   AI Engine:   http://localhost:5000/docs" -ForegroundColor White
Write-Host "`n   (Check each terminal window for startup messages)" -ForegroundColor Gray
