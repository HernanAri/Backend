# Script de despliegue del backend con PM2

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CLOKIFY - Despliegue Backend con PM2" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar Node.js
Write-Host "[1/7] Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js instalado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js no está instalado" -ForegroundColor Red
    Write-Host "Descarga Node.js desde: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# 2. Verificar PM2
Write-Host "`n[2/7] Verificando PM2..." -ForegroundColor Yellow
try {
    $pm2Version = pm2 --version
    Write-Host "✓ PM2 instalado: $pm2Version" -ForegroundColor Green
} catch {
    Write-Host "✗ PM2 no está instalado. Instalando..." -ForegroundColor Yellow
    npm install -g pm2
    npm install -g pm2-windows-startup
    pm2-startup install
    Write-Host "✓ PM2 instalado correctamente" -ForegroundColor Green
}

# 3. Instalar dependencias
Write-Host "`n[3/7] Instalando dependencias..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Error al instalar dependencias" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Dependencias instaladas" -ForegroundColor Green

# 4. Compilar aplicación
Write-Host "`n[4/7] Compilando aplicación..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Error al compilar" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Aplicación compilada" -ForegroundColor Green

# 5. Crear carpeta de logs
Write-Host "`n[5/7] Creando carpeta de logs..." -ForegroundColor Yellow
if (!(Test-Path -Path "logs")) {
    New-Item -ItemType Directory -Path "logs" | Out-Null
}
Write-Host "✓ Carpeta de logs lista" -ForegroundColor Green

# 6. Detener PM2 si está corriendo
Write-Host "`n[6/7] Deteniendo instancias anteriores..." -ForegroundColor Yellow
pm2 delete clokify-backend 2>$null
Write-Host "✓ Instancias anteriores detenidas" -ForegroundColor Green

# 7. Iniciar con PM2
Write-Host "`n[7/7] Iniciando aplicación con PM2..." -ForegroundColor Yellow
pm2 start ecosystem.config.js --env production
pm2 save
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Error al iniciar con PM2" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Aplicación iniciada correctamente" -ForegroundColor Green

# Mostrar estado
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Estado de la aplicación" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
pm2 status
pm2 logs clokify-backend --lines 10

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  ✓ Despliegue completado exitosamente" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend corriendo en: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Comandos útiles:" -ForegroundColor Yellow
Write-Host '  pm2 status                 - Ver e
