#Requires -Version 5.1
<#
.SYNOPSIS
  从 h5-game-kit 初始化语音房 H5 游戏仓库的 Kit 工具链。

.EXAMPLE
  & "<kit-root>\scripts\init-game.ps1" `
    -GameId "my-game" `
    -Target "<game-repo>" `
    -InstallSkills `
    -InstallAgentMd
#>
param(
    [Parameter(Mandatory = $true)]
    [string] $GameId,

    [Parameter(Mandatory = $true)]
    [string] $Target,

    [string] $GameName = '',

    [string] $KitRoot = (Split-Path -Parent $PSScriptRoot),

    [switch] $InstallSkills,

    [switch] $InstallAgentMd
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path $Target)) {
    New-Item -ItemType Directory -Path $Target -Force | Out-Null
}

$Target = (Resolve-Path $Target).Path
if (-not $GameName) { $GameName = $GameId }
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
Copy-Item (Join-Path $KitRoot 'rules\h5-game-kit.mdc') (Join-Path $rulesDst 'h5-game-kit.mdc') -Force

# .cursor/skills（可选）
if ($InstallSkills) {
    $skillsDst = Join-Path $Target '.cursor\skills'
    New-Item -ItemType Directory -Path $skillsDst -Force | Out-Null
    Copy-Tree (Join-Path $KitRoot 'skills') $skillsDst
    Write-Host "Skills copied to $skillsDst"

    $legacyUiSkill = Join-Path $skillsDst 'h5-game-ui'
    if (Test-Path $legacyUiSkill) {
        Remove-Item $legacyUiSkill -Recurse -Force
        Write-Host "Removed legacy .cursor/skills/h5-game-ui"
    }
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
Copy-Item (Join-Path $KitRoot 'scripts\run-live-integration.ps1') (Join-Path $scriptsDst 'run-live-integration.ps1') -Force
Copy-Item (Join-Path $KitRoot 'scripts\fix-product-md-anchors.mjs') (Join-Path $scriptsDst 'fix-product-md-anchors.mjs') -Force

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
    $t = $t -replace '\{\{gameName\}\}', $GameName
    $t = $t -replace '\{\{GAME\}\}', ($GameId.ToUpper() -replace '[^A-Z0-9]', '')
    Set-Content -Path $out -Value $t -Encoding UTF8
}

function Init-RootFromTemplate($templateName, $outName) {
    $tpl = Join-Path $KitRoot "docs\templates\$templateName"
    $out = Join-Path $Target $outName
    if (Test-Path $out) { return }
    if (-not (Test-Path $tpl)) {
        Write-Warning "Template missing: $tpl"
        return
    }
    $t = Get-Content $tpl -Raw -Encoding UTF8
    $t = $t -replace '\{\{gameId\}\}', $GameId
    $t = $t -replace '\{\{gameName\}\}', $GameName
    $t = $t -replace '\{\{KitRoot\}\}', $KitRoot
    $utf8 = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($out, $t, $utf8)
}

Init-FromTemplate 'product-doc.template.md' 'product.md'
Init-FromTemplate 'spec.template.md' 'spec.md'
Init-FromTemplate 'BACKEND-CONTRACTS.README.md' 'BACKEND-CONTRACTS.md'
Copy-Item (Join-Path $KitRoot 'docs\templates\fixtures\README.md') (Join-Path $docsGame 'fixtures\README.md') -Force

if ($InstallAgentMd) {
    Init-RootFromTemplate 'AGENT.md.template' 'AGENT.md'
    Init-RootFromTemplate 'AGENTS.md.template' 'AGENTS.md'
    Write-Host "AGENT.md / AGENTS.md (skip if already exist)"
}

# 通用踩坑只读镜像（真源在 kit docs/LESSONS.md）
$lessonsSrc = Join-Path $KitRoot 'docs\LESSONS.md'
$lessonsMirror = Join-Path $Target 'docs\KIT-LESSONS.md'
if (Test-Path $lessonsSrc) {
    $banner = @"
<!-- 只读镜像，由 init-game / sync-kit 从 kit 覆盖。勿在此编辑。 -->
<!-- 真源与写入：``$KitRoot\docs\LESSONS.md`` — 见 KIT_README「通用踩坑」 -->

"@
    $body = Get-Content $lessonsSrc -Raw -Encoding UTF8
    Set-Content -Path $lessonsMirror -Value ($banner + $body) -Encoding UTF8
}

# KIT_VERSION + KIT_README（模板 UTF-8，避免 PS 内嵌中文乱码）
$ver = (Get-Content (Join-Path $KitRoot 'VERSION') -Raw).Trim()
$utf8 = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText((Join-Path $docsGame 'KIT_VERSION.txt'), $ver + "`n", $utf8)

$tplPath = Join-Path $KitRoot 'docs\templates\KIT_README.md'
if (Test-Path $tplPath) {
    $kitReadme = [System.IO.File]::ReadAllText($tplPath, $utf8)
    $kitReadme = $kitReadme.Replace('{{GameId}}', $GameId).Replace('{{KitVersion}}', $ver).Replace('{{KitRoot}}', $KitRoot).Replace('{{SyncSource}}', 'init-game')
    [System.IO.File]::WriteAllText((Join-Path $docsGame 'KIT_README.md'), $kitReadme, $utf8)
} else {
    Write-Warning "KIT_README template missing: $tplPath"
}
$legacyLoop = Join-Path $docsGame 'LOOP_README.md'
if (Test-Path $legacyLoop) {
    Remove-Item $legacyLoop -Force
}
Write-Host ""
Write-Host "Done. Initialized Kit toolchain for '$GameId' in:" -ForegroundColor Green
Write-Host "  $Target"
Write-Host ""
Write-Host "Next: npm install && npm run dev"
Write-Host "      或 new-game.ps1 已含 scaffold 时: npm run build && npm start"
