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

# 3. Root entry file expected by Hostinger
Set-Content -Path "$out/index.js" -Value "require('./server.js');" -Encoding UTF8

# 4. Zip with files at the archive root
if (Test-Path "dist.zip") { Remove-Item -Force "dist.zip" }
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory((Resolve-Path $out), (Join-Path $root "dist.zip"))

Remove-Item -Recurse -Force $out
Write-Host "dist.zip created (entry: index.js -> server.js)"
