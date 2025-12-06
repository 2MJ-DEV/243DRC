# Script de vérification pré-déploiement

Write-Host "🔍 Vérification du projet 243 DRC..." -ForegroundColor Cyan

# Vérifier les variables d'environnement
Write-Host "`n📝 Vérification des variables d'environnement..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local"
    $requiredVars = @(
        "NEXT_PUBLIC_FIREBASE_API_KEY",
        "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
        "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
        "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
        "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
        "NEXT_PUBLIC_FIREBASE_APP_ID"
    )
    
    $missing = @()
    foreach ($var in $requiredVars) {
        if (-not ($envContent -match $var)) {
            $missing += $var
        }
    }
    
    if ($missing.Count -gt 0) {
        Write-Host "❌ Variables manquantes:" -ForegroundColor Red
        $missing | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
    } else {
        Write-Host "✅ Toutes les variables d'environnement sont présentes" -ForegroundColor Green
    }
} else {
    Write-Host "❌ Fichier .env.local introuvable" -ForegroundColor Red
}

# Vérifier les dépendances
Write-Host "`n📦 Vérification des dépendances..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "✅ node_modules présent" -ForegroundColor Green
} else {
    Write-Host "❌ node_modules manquant - Exécutez 'pnpm install'" -ForegroundColor Red
}

# Nettoyer les dossiers inutiles
Write-Host "`n🧹 Nettoyage des dossiers inutiles..." -ForegroundColor Yellow
$foldersToCheck = @("context", "config")
foreach ($folder in $foldersToCheck) {
    if (Test-Path $folder) {
        $isEmpty = -not (Get-ChildItem -Path $folder -Recurse -File)
        if ($isEmpty) {
            Write-Host "⚠️  Dossier vide détecté: $folder (peut être supprimé)" -ForegroundColor Yellow
        }
    }
}

# Tester le build
Write-Host "`n🏗️  Test de build..." -ForegroundColor Yellow
Write-Host "Exécution de 'pnpm build'..." -ForegroundColor Gray
$buildOutput = & pnpm build 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build réussi!" -ForegroundColor Green
} else {
    Write-Host "❌ Échec du build" -ForegroundColor Red
    Write-Host $buildOutput -ForegroundColor Red
    exit 1
}

Write-Host "`n✨ Vérification terminée!" -ForegroundColor Green
Write-Host "`nPrêt pour le déploiement! 🚀" -ForegroundColor Cyan
