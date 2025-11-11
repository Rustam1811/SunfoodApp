# Quick Firebase Setup Script
# This PowerShell script helps you set up Firebase environment variables

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Firebase Configuration Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Follow these steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Open Firebase Console in your browser:" -ForegroundColor Green
Write-Host "   https://console.firebase.google.com/project/coffeeaddict-c9d70/settings/general" -ForegroundColor White
Write-Host ""
Write-Host "2. Scroll to 'Your apps' section" -ForegroundColor Green
Write-Host ""
Write-Host "3. Look for SDK setup and configuration" -ForegroundColor Green
Write-Host "   (If no web app exists, click 'Add app' > Web icon)" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Copy the firebaseConfig object values" -ForegroundColor Green
Write-Host ""
Write-Host "5. Update the .env file with your values" -ForegroundColor Green
Write-Host ""

# Check if .env file exists
if (Test-Path ".env") {
    Write-Host "✅ .env file found!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Current .env contents:" -ForegroundColor Yellow
    Get-Content .env | ForEach-Object {
        if ($_ -match "your-.*-here") {
            Write-Host "   $_" -ForegroundColor Red
        } else {
            Write-Host "   $_" -ForegroundColor White
        }
    }
    Write-Host ""
    Write-Host "⚠️  Replace the 'your-*-here' placeholders with actual values" -ForegroundColor Yellow
} else {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "   Creating .env from template..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✅ .env file created!" -ForegroundColor Green
}

Write-Host ""
Write-Host "After updating .env, run:" -ForegroundColor Cyan
Write-Host "   npm run build" -ForegroundColor White
Write-Host "   npm run deploy" -ForegroundColor White
Write-Host ""
