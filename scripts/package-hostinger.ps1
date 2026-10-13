# Packages the Next.js standalone build for Hostinger Node.js hosting.
# Usage: npm run build ; powershell -ExecutionPolicy Bypass -File scripts/package-hostinger.ps1
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$standalone = ".next/standalone"
if (-not (Test-Path "$standalone/server.js")) {
  throw "Standalone build not found. Run 'npm run build' first."
}

$out = ".deploy_temp"
if (Test-Path $out) { Remove-Item -Recurse -Force $out }
New-Item -ItemType Directory -Path $out | Out-Null

# 1. Standalone server (server.js, minimal node_modules, .next/server)
Copy-Item -Recurse -Force "$standalone/*" $out
Copy-Item -Recurse -Force "$standalone/.next" $out

# 2. Static assets + public (not included in standalone by default)
New-Item -ItemType Directory -Force -Path "$out/.next/static" | Out-Null
Copy-Item -Recurse -Force ".next/static/*" "$out/.next/static"
if (Test-Path "public") {
  New-Item -ItemType Directory -Force -Path "$out/public" | Out-Null
  Copy-Item -Recurse -Force "public/*" "$out/public"
}

# 3. Root entry files expected by various Hostinger Node.js interfaces (server.js, index.js, app.js)
Set-Content -Path "$out/index.js" -Value "require('./server.js');" -Encoding UTF8
Set-Content -Path "$out/app.js" -Value "require('./server.js');" -Encoding UTF8

# 4. Hostinger LiteSpeed / Phusion Passenger restart dir
New-Item -ItemType Directory -Force -Path "$out/tmp" | Out-Null
Set-Content -Path "$out/tmp/.keep" -Value "" -Encoding UTF8

# 5. Hostinger Passenger configuration .htaccess
$htaccessContent = @"
PassengerAppRoot /home/u286655953/domains/spectrummalaysia.org/public_html/lms
PassengerAppType node
PassengerNodejs /opt/alt/alt-nodejs22/root/bin/node
PassengerStartupFile server.js
PassengerBaseURI /
PassengerRestartDir /home/u286655953/domains/spectrummalaysia.org/public_html/lms/tmp
SetEnv LSNODE_CONSOLE_LOG console.log
SetEnv TOKIO_WORKER_THREADS 2
"@
Set-Content -Path "$out/.htaccess" -Value $htaccessContent -Encoding UTF8

# 6. Clean any sensitive or temp files
Get-ChildItem -Path $out -Recurse -Include ".env*", "*.zip", "*.log" | Remove-Item -Force

# 5. Zip with files at the archive root using bsdtar (standard POSIX forward slashes)
$zipPath = Join-Path $root "dist.zip"
$tarPath = Join-Path $root "dist.tar.gz"
if (Test-Path $zipPath) { Remove-Item -Force $zipPath }
if (Test-Path $tarPath) { Remove-Item -Force $tarPath }

Push-Location $out
tar -a -cf $zipPath *
tar -czf $tarPath *
Pop-Location

Remove-Item -Recurse -Force $out
Write-Host "dist.zip and dist.tar.gz created successfully with POSIX forward-slash paths."
