#Requires -Version 5.1
<#
.SYNOPSIS
  将 h5-game-loop-kit 的工具链更新同步到已初始化的游戏仓库（不覆盖游戏业务文件）。

.DESCRIPTION
  覆盖：Rule、（可选）Skills、e2e helpers、run-e2e.ps1、KIT_VERSION、LOOP_README
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
Copy-Item (Join-Path $KitRoot 'rules\h5-game-loop.mdc') (Join-Path $rulesDst 'h5-game-loop.mdc') -Force
Write-Host "[sync] .cursor/rules/h5-game-loop.mdc"

# Skills
if ($InstallSkills) {
    $skillsDst = Join-Path $Target '.cursor\skills'
    New-Item -ItemType Directory -Path $skillsDst -Force | Out-Null
    Copy-Tree (Join-Path $KitRoot 'skills') $skillsDst
    Write-Host "[sync] .cursor/skills/*"
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
Write-Host "[sync] scripts/run-e2e.ps1"

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

# KIT_VERSION + LOOP_README
$docsGame = Join-Path $Target "docs\games\$GameId"
if (-not (Test-Path $docsGame)) {
    Write-Warning "docs/games/$GameId not found — skip KIT_VERSION / LOOP_README"
} else {
    Set-Content -Path (Join-Path $docsGame 'KIT_VERSION.txt') -Value $ver -Encoding UTF8
    $kitReadme = @"
# AI Loop — $GameId

- Kit 版本: $ver（sync-kit 更新）
- Skill: ``.cursor/skills/``（sync ``-InstallSkills``）或 ``$KitRoot\skills\``
- 编排: ``h5-game-orchestrator``
- 模式: ``$KitRoot\docs\WORKFLOW-MODES.md``
- 技术栈 / 运行时分层: ``$KitRoot\docs\TECH-STACK.md``（§5.5 JS 与 TS）
- 设计: ``$KitRoot\docs\H5-AI-Loop设计方案.md``
- Loop: ``$KitRoot\loop\LOOP-PROMPT.md``
- 通用踩坑（**唯一真源**）: ``$KitRoot\docs\LESSONS.md``
- 本仓镜像: ``docs/KIT-LESSONS.md``（sync-kit 更新）

记入通用坑：对 AI 说「记进工具包 LESSONS」→ 改 kit 真源，勿改镜像。

升级 kit 后在本仓执行: ``sync-kit.ps1 -GameId $GameId -InstallSkills``
"@
    Set-Content -Path (Join-Path $docsGame 'LOOP_README.md') -Value $kitReadme -Encoding UTF8
    Write-Host "[sync] docs/games/$GameId/KIT_VERSION.txt, LOOP_README.md"
}

Write-Host ""
Write-Host "Done. NOT overwritten: product.md, spec.md, $GameId.spec.js, src/, im.md, fixtures" -ForegroundColor Green
