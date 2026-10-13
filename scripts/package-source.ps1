# Packages the source files for Hostinger JS deployment (hosting_deploy-js-application)
# Excludes node_modules, .next, scratch, .git, .env*, *.zip
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$out = ".source_temp"
if (Test-Path $out) { Remove-Item -Recurse -Force $out }
New-Item -ItemType Directory -Path $out | Out-Null

# Directories to copy
$dirs = @("app", "components", "hooks", "lib", "public", "services", "supabase", "utils")
foreach ($d in $dirs) {
  if (Test-Path $d) {
    Copy-Item -Recurse -Force $d "$out/$d"
  }
}

# Root files to copy
$files = @(
  "package.json",
  "package-lock.json",
  "next.config.ts",
  "proxy.ts",
  "tsconfig.json",
  "postcss.config.mjs",
  "eslint.config.mjs",
  "tailwind.config.js"
)
foreach ($f in $files) {
  if (Test-Path $f) {
    Copy-Item -Force $f "$out/$f"
  }
}

# Clean any sensitive or temp files inside $out just in case
Get-ChildItem -Path $out -Recurse -Include ".env*", "*.zip", "*.log" | Remove-Item -Force

$zipPath = Join-Path $root "source.zip"
if (Test-Path $zipPath) { Remove-Item -Force $zipPath }

# Create archives using bsdtar with clean relative paths (no leading ./)
Push-Location $out
tar -czf "$root/source.tar.gz" *
tar -a -cf $zipPath *
Pop-Location


Remove-Item -Recurse -Force $out
Write-Host "source.zip and source.tar.gz created successfully."
