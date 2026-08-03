#Requires -Version 5.1
<#
.SYNOPSIS
  运行 Playwright E2E 并生成 last-run.json（在游戏仓库根目录执行）。

.EXAMPLE
  .\scripts\run-e2e.ps1 -GameId my-game
#>
param(
    [Parameter(Mandatory = $true)]
    [string] $GameId
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$spec = "tests/e2e/$GameId.spec.js"
if (-not (Test-Path $spec)) {
    Write-Error "Spec not found: $spec — run init-game.ps1 first."
}

Write-Host "Running: npx playwright test $spec"
npx playwright test $spec
$code = $LASTEXITCODE

if (Test-Path 'tests/e2e/last-run.json') {
    Write-Host "last-run.json updated."
} else {
    Write-Host "Tip: ensure spec uses capture-logs helper to write tests/e2e/last-run.json"
}

exit $code
