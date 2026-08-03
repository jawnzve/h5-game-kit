#Requires -Version 5.1
<#
.SYNOPSIS
  将 h5-game-kit 的工具链更新同步到已初始化的游戏仓库（不覆盖游戏业务文件）。

.DESCRIPTION
  覆盖：Rule、（可选）Skills、e2e helpers、run-e2e.ps1、KIT_VERSION、KIT_README
  不覆盖：product.md、spec.md、<gameId>.spec.js、src/、im.md、fixtures

.EXAMPLE
  & "<kit-root>\scripts\sync-kit.ps1" `
    -GameId "my-game" `
    -Target "<game-repo>" `
    -InstallSkills
#>
param(
    [Parameter(Mandatory = $true)]
    [string] $GameId,

    [Parameter(Mandatory = $true)]
    [string] $Target,

    [string] $KitRoot = (Split-Path -Parent $PSScriptRoot),

    [switch] $InstallSkills
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path $Target)) {
    Write-Error "Target not found: $Target — run init-game.ps1 first."
}

$Target = (Resolve-Path $Target).Path
$ver = (Get-Content (Join-Path $KitRoot 'VERSION') -Raw).Trim()

Write-Host "Sync kit $ver -> $Target (game: $GameId)"
Write-Host ""

function Copy-Tree($From, $To) {
    if (-not (Test-Path $From)) { return }
    New-Item -ItemType Directory -Path $To -Force | Out-Null
    Copy-Item -Path (Join-Path $From '*') -Destination $To -Recurse -Force
}

# Rule
$rulesDst = Join-Path $Target '.cursor\rules'
New-Item -ItemType Directory -Path $rulesDst -Force | Out-Null
Copy-Item (Join-Path $KitRoot 'rules\h5-game-kit.mdc') (Join-Path $rulesDst 'h5-game-kit.mdc') -Force
Write-Host "[sync] .cursor/rules/h5-game-kit.mdc"

# 清理改名前的旧 Rule，避免两份规则同时生效
$legacyRule = Join-Path $rulesDst 'h5-game-loop.mdc'
if (Test-Path $legacyRule) {
    Remove-Item $legacyRule -Force
    Write-Host "[sync] removed legacy .cursor/rules/h5-game-loop.mdc"
}

# Skills
if ($InstallSkills) {
    $skillsDst = Join-Path $Target '.cursor\skills'
    New-Item -ItemType Directory -Path $skillsDst -Force | Out-Null
    Copy-Tree (Join-Path $KitRoot 'skills') $skillsDst
    Write-Host "[sync] .cursor/skills/*"

    # 清理改名前的旧 Skill，避免与 h5-game-preview 并存
    $legacyUiSkill = Join-Path $skillsDst 'h5-game-ui'
    if (Test-Path $legacyUiSkill) {
        Remove-Item $legacyUiSkill -Recurse -Force
        Write-Host "[sync] removed legacy .cursor/skills/h5-game-ui"
    }
}

# E2E helpers（不覆盖游戏 <gameId>.spec.js）
$e2eDst = Join-Path $Target 'tests\e2e'
$helpersDst = Join-Path $e2eDst 'helpers'
New-Item -ItemType Directory -Path $helpersDst -Force | Out-Null
Copy-Tree (Join-Path $KitRoot 'tests\e2e\helpers') $helpersDst
Copy-Item (Join-Path $KitRoot 'tests\e2e\last-run.json.example') (Join-Path $e2eDst 'last-run.json.example') -Force
Write-Host "[sync] tests/e2e/helpers/*, last-run.json.example"

# scripts
$scriptsDst = Join-Path $Target 'scripts'
New-Item -ItemType Directory -Path $scriptsDst -Force | Out-Null
Copy-Item (Join-Path $KitRoot 'scripts\run-e2e.ps1') (Join-Path $scriptsDst 'run-e2e.ps1') -Force
Copy-Item (Join-Path $KitRoot 'scripts\fix-product-md-anchors.mjs') (Join-Path $scriptsDst 'fix-product-md-anchors.mjs') -Force
Write-Host "[sync] scripts/run-e2e.ps1, fix-product-md-anchors.mjs"

# 通用 CSS（kit-scrollbar 等，不覆盖游戏自有 public/css）
$cssSrc = Join-Path $KitRoot 'templates\scaffold\public\css'
$cssDst = Join-Path $Target 'public\css'
if (Test-Path $cssSrc) {
    New-Item -ItemType Directory -Path $cssDst -Force | Out-Null
    Get-ChildItem -Path $cssSrc -Filter 'kit-*.css' | ForEach-Object {
        Copy-Item $_.FullName (Join-Path $cssDst $_.Name) -Force
        Write-Host "[sync] public/css/$($_.Name)"
    }
}

# 通用踩坑只读镜像
$lessonsSrc = Join-Path $KitRoot 'docs\LESSONS.md'
$lessonsMirror = Join-Path $Target 'docs\KIT-LESSONS.md'
if (Test-Path $lessonsSrc) {
    $banner = @"
<!-- 只读镜像，由 sync-kit 从 kit 覆盖。勿在此编辑。 -->
<!-- 真源：``$KitRoot\docs\LESSONS.md`` -->

"@
    $body = Get-Content $lessonsSrc -Raw -Encoding UTF8
    Set-Content -Path $lessonsMirror -Value ($banner + $body) -Encoding UTF8
    Write-Host "[sync] docs/KIT-LESSONS.md (read-only mirror of kit LESSONS)"
}

# KIT_VERSION + KIT_README（模板 UTF-8，避免 PS 内嵌中文乱码）
$docsGame = Join-Path $Target "docs\games\$GameId"
if (-not (Test-Path $docsGame)) {
    Write-Warning "docs/games/$GameId not found — skip KIT_VERSION / KIT_README"
} else {
    $utf8 = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText((Join-Path $docsGame 'KIT_VERSION.txt'), $ver + "`n", $utf8)

    $tplPath = Join-Path $KitRoot 'docs\templates\KIT_README.md'
    if (-not (Test-Path $tplPath)) {
        Write-Warning "KIT_README template missing: $tplPath"
    } else {
        $kitReadme = [System.IO.File]::ReadAllText($tplPath, $utf8)
        $kitReadme = $kitReadme.Replace('{{GameId}}', $GameId).Replace('{{KitVersion}}', $ver).Replace('{{KitRoot}}', $KitRoot).Replace('{{SyncSource}}', 'sync-kit')
        [System.IO.File]::WriteAllText((Join-Path $docsGame 'KIT_README.md'), $kitReadme, $utf8)
        Write-Host "[sync] docs/games/$GameId/KIT_VERSION.txt, KIT_README.md"
    }
    $legacyLoop = Join-Path $docsGame 'LOOP_README.md'
    if (Test-Path $legacyLoop) {
        Remove-Item $legacyLoop -Force
        Write-Host "[sync] removed legacy LOOP_README.md"
    }
}

Write-Host ""
Write-Host "Done. NOT overwritten: product.md, spec.md, $GameId.spec.js, src/, im.md, fixtures" -ForegroundColor Green
