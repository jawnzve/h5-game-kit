#Requires -Version 5.1
<#
.SYNOPSIS
  从 h5-game-loop-kit 初始化语音房 H5 游戏仓库的 Loop 工具链。

.EXAMPLE
  & "<kit-root>\scripts\init-game.ps1" `
    -GameId "my-game" `
    -Target "<game-repo>"
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
    New-Item -ItemType Directory -Path $Target -Force | Out-Null
}

$Target = (Resolve-Path $Target).Path
Write-Host "Kit:   $KitRoot"
Write-Host "Game:  $GameId"
Write-Host "Target: $Target"

function Copy-Tree($From, $To) {
    if (-not (Test-Path $From)) { return }
    New-Item -ItemType Directory -Path $To -Force | Out-Null
    Copy-Item -Path (Join-Path $From '*') -Destination $To -Recurse -Force
}

# .cursor/rules
$rulesDst = Join-Path $Target '.cursor\rules'
New-Item -ItemType Directory -Path $rulesDst -Force | Out-Null
Copy-Item (Join-Path $KitRoot 'rules\h5-game-loop.mdc') (Join-Path $rulesDst 'h5-game-loop.mdc') -Force

# .cursor/skills（可选）
if ($InstallSkills) {
    $skillsDst = Join-Path $Target '.cursor\skills'
    New-Item -ItemType Directory -Path $skillsDst -Force | Out-Null
    Copy-Tree (Join-Path $KitRoot 'skills') $skillsDst
    Write-Host "Skills copied to $skillsDst"
}

# tests/e2e helpers
$e2eDst = Join-Path $Target 'tests\e2e'
New-Item -ItemType Directory -Path (Join-Path $e2eDst 'helpers') -Force | Out-Null
Copy-Tree (Join-Path $KitRoot 'tests\e2e\helpers') (Join-Path $e2eDst 'helpers')

# spec from template
$specFrom = Join-Path $KitRoot 'tests\e2e\game.spec.template.js'
$specTo = Join-Path $e2eDst "$GameId.spec.js"
$content = Get-Content $specFrom -Raw -Encoding UTF8
$content = $content -replace '\{\{gameId\}\}', $GameId
Set-Content -Path $specTo -Value $content -Encoding UTF8

Copy-Item (Join-Path $KitRoot 'tests\e2e\last-run.json.example') (Join-Path $e2eDst 'last-run.json.example') -Force

# scripts
$scriptsDst = Join-Path $Target 'scripts'
New-Item -ItemType Directory -Path $scriptsDst -Force | Out-Null
Copy-Item (Join-Path $KitRoot 'scripts\run-e2e.ps1') (Join-Path $scriptsDst 'run-e2e.ps1') -Force

# playwright config if missing
$pwConfig = Join-Path $Target 'playwright.config.js'
if (-not (Test-Path $pwConfig)) {
    Copy-Item (Join-Path $KitRoot 'playwright.config.template.js') $pwConfig -Force
}

# docs/games/<gameId>
$docsGame = Join-Path $Target "docs\games\$GameId"
New-Item -ItemType Directory -Path (Join-Path $docsGame 'fixtures') -Force | Out-Null

function Init-FromTemplate($templateName, $outName) {
    $tpl = Join-Path $KitRoot "docs\templates\$templateName"
    $out = Join-Path $docsGame $outName
    if (Test-Path $out) { return }
    $t = Get-Content $tpl -Raw -Encoding UTF8
    $t = $t -replace '\{\{gameId\}\}', $GameId
    $t = $t -replace '\{\{gameName\}\}', $GameId
    $t = $t -replace '\{\{GAME\}\}', ($GameId.ToUpper() -replace '[^A-Z0-9]', '')
    Set-Content -Path $out -Value $t -Encoding UTF8
}

Init-FromTemplate 'product-doc.template.md' 'product.md'
Init-FromTemplate 'spec.template.md' 'spec.md'
Init-FromTemplate 'CONTRACT_GAPS.template.md' 'CONTRACT_GAPS.md'
Init-FromTemplate 'BACKEND-CONTRACTS.README.md' 'BACKEND-CONTRACTS.md'
Copy-Item (Join-Path $KitRoot 'docs\templates\fixtures\README.md') (Join-Path $docsGame 'fixtures\README.md') -Force

# 通用踩坑只读镜像（真源在 kit docs/LESSONS.md）
$lessonsSrc = Join-Path $KitRoot 'docs\LESSONS.md'
$lessonsMirror = Join-Path $Target 'docs\KIT-LESSONS.md'
if (Test-Path $lessonsSrc) {
    $banner = @"
<!-- 只读镜像，由 init-game / sync-kit 从 kit 覆盖。勿在此编辑。 -->
<!-- 真源与写入：``$KitRoot\docs\LESSONS.md`` — 见 LOOP_README「通用踩坑」 -->

"@
    $body = Get-Content $lessonsSrc -Raw -Encoding UTF8
    Set-Content -Path $lessonsMirror -Value ($banner + $body) -Encoding UTF8
}

# KIT_VERSION
$ver = Get-Content (Join-Path $KitRoot 'VERSION') -Raw
Set-Content -Path (Join-Path $docsGame 'KIT_VERSION.txt') -Value $ver.Trim() -Encoding UTF8

# pointer to kit skills
$kitReadme = @"
# AI Loop — $GameId

- Kit 版本: $($ver.Trim())
- Skill: ``.cursor/skills/``（init 时 ``-InstallSkills``）或 ``$KitRoot\skills\``
- 编排: ``h5-game-orchestrator`` — 输入规则后自动判断步骤
- 模式: ``$KitRoot\docs\WORKFLOW-MODES.md``（预览 / 完整）
- 运行时: ``public/core/``（桥 / http / UI / sync，scaffold 已含）
- 本地服: ``$KitRoot\docs\LOCAL-SERVER-SPEC.md``（scaffold 已含 app.js）
- 设计: ``$KitRoot\docs\H5-AI-Loop设计方案.md``
- Loop prompt: ``$KitRoot\loop\LOOP-PROMPT.md``
- 通用踩坑（**唯一真源，全员共享**）: ``$KitRoot\docs\LESSONS.md``
- 本仓只读镜像: ``docs/KIT-LESSONS.md``（sync-kit 更新；**勿改镜像**）

## 通用踩坑怎么记（跨游戏）

在任意游戏仓遇到 **换 gameId 也会踩** 的工程/测试坑时，对 AI 说：**「记进工具包 LESSONS」**。

AI 应写入 **kit** ``$KitRoot\docs\LESSONS.md``（不是本仓 `spec.md`）。本游戏玩法/IM 专有 → 只写 ``docs/games/$GameId/spec.md``。

## 下一步

说「新游戏 $GameId，规则是…」→ orchestrator 从 ① 开始。
后端未给 im/rest 时，预览模式可在 ② 结束。
"@
Set-Content -Path (Join-Path $docsGame 'LOOP_README.md') -Value $kitReadme -Encoding UTF8

Write-Host ""
Write-Host "Done. Initialized Loop toolchain for '$GameId' in:" -ForegroundColor Green
Write-Host "  $Target"
Write-Host ""
Write-Host "Next: npm install && npm run dev"
Write-Host "      或 new-game.ps1 已含 scaffold 时: npm run build && npm start"
