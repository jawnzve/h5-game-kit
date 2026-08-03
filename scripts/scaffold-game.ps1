#Requires -Version 5.1
<#
.SYNOPSIS
  从 kit templates/scaffold 生成游戏 Vite 工程骨架。

.DESCRIPTION
  拷贝 templates/scaffold/ 到目标目录，替换 {{gameId}} / {{gameName}}，
  并将 games/{{gameId}}/ 重命名为 games/<GameId>/。

  不含 Loop 工具链 — 通常与 init-game.ps1 配合，或直接用 new-game.ps1。

.EXAMPLE
  & "<kit-root>\scripts\scaffold-game.ps1" `
    -GameId "my-game" `
    -GameName "我的游戏" `
    -Target "<game-repo>"
#>
param(
    [Parameter(Mandatory = $true)]
    [string] $GameId,

    [Parameter(Mandatory = $true)]
    [string] $Target,

    [string] $GameName = '',

    [string] $KitRoot = (Split-Path -Parent $PSScriptRoot),

    [switch] $Force
)

$ErrorActionPreference = 'Stop'

if (-not $GameName) {
    $GameName = $GameId
}

$scaffoldRoot = Join-Path $KitRoot 'templates\scaffold'
if (-not (Test-Path $scaffoldRoot)) {
    Write-Error "Scaffold not found: $scaffoldRoot"
}

$placeholderGameDir = Join-Path $scaffoldRoot 'games\{{gameId}}'
if (-not (Test-Path $placeholderGameDir)) {
    Write-Error "Missing scaffold games/{{gameId}} directory"
}

if (Test-Path $Target) {
    $existing = Get-ChildItem -Path $Target -Force -ErrorAction SilentlyContinue
    if ($existing -and -not $Force) {
        Write-Error "Target not empty: $Target - use -Force to scaffold anyway"
    }
} else {
    New-Item -ItemType Directory -Path $Target -Force | Out-Null
}

$Target = (Resolve-Path $Target).Path
Write-Host "Kit:      $KitRoot"
Write-Host "Scaffold: $scaffoldRoot"
Write-Host "Game:     $GameId ($GameName)"
Write-Host "Target:   $Target"
Write-Host ""

$ScaffoldSkipDirNames = @('node_modules', 'dist')

function Test-ScaffoldSkipItem($Name, [bool]$IsDirectory) {
    if ($IsDirectory -and ($ScaffoldSkipDirNames -contains $Name)) { return $true }
    if (-not $IsDirectory) {
        if ($Name -like '*.tsbuildinfo') { return $true }
        if ($Name -eq 'vite.config.js' -or $Name -eq 'vite.config.d.ts') { return $true }
    }
    return $false
}

function Copy-ScaffoldSubtree($From, $To) {
    New-Item -ItemType Directory -Path $To -Force | Out-Null
    Get-ChildItem -Path $From -Force | ForEach-Object {
        if (Test-ScaffoldSkipItem $_.Name $_.PSIsContainer) { return }
        $dest = Join-Path $To $_.Name
        if ($_.PSIsContainer) {
            Copy-ScaffoldSubtree $_.FullName $dest
        } else {
            Copy-Item -Path $_.FullName -Destination $dest -Force
        }
    }
}

function Copy-ScaffoldTree($From, $To) {
    New-Item -ItemType Directory -Path $To -Force | Out-Null
    Get-ChildItem -Path $From -Force | ForEach-Object {
        if ($_.Name -eq 'games') { return }
        if (Test-ScaffoldSkipItem $_.Name $_.PSIsContainer) { return }
        $dest = Join-Path $To $_.Name
        if ($_.PSIsContainer) {
            Copy-ScaffoldSubtree $_.FullName $dest
        } else {
            Copy-Item -Path $_.FullName -Destination $dest -Force
        }
    }
}

Copy-ScaffoldTree $scaffoldRoot $Target

$legacyPublicGame = Join-Path $Target 'public\games\{{gameId}}'
if (Test-Path $legacyPublicGame) {
    Remove-Item -Path $legacyPublicGame -Recurse -Force
}

$gamesDst = Join-Path $Target 'games'
New-Item -ItemType Directory -Path $gamesDst -Force | Out-Null
Copy-Item -Path $placeholderGameDir -Destination (Join-Path $gamesDst $GameId) -Recurse -Force

$publicGamesDst = Join-Path $Target "public\games\$GameId\assets"
New-Item -ItemType Directory -Path $publicGamesDst -Force | Out-Null
$placeholderPublic = Join-Path $scaffoldRoot 'public\games\{{gameId}}\assets'
if (Test-Path $placeholderPublic) {
    Copy-Item -Path (Join-Path $placeholderPublic '*') -Destination $publicGamesDst -Force -ErrorAction SilentlyContinue
}

$textExtensions = @(
    '.html', '.js', '.ts', '.vue', '.json', '.md', '.env', '.gitignore'
)

Get-ChildItem -Path $Target -Recurse -File -Force | ForEach-Object {
    $ext = $_.Extension.ToLowerInvariant()
    if ($textExtensions -notcontains $ext) { return }

    $raw = Get-Content -Path $_.FullName -Raw -Encoding UTF8
    if ($null -eq $raw) { return }
    if ($raw -notmatch '\{\{game(Id|Name)\}\}') { return }

    $updated = $raw -replace '\{\{gameId\}\}', $GameId
    $updated = $updated -replace '\{\{gameName\}\}', $GameName
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($_.FullName, $updated, $utf8NoBom)
}

Write-Host ""
Write-Host "Done. Scaffold created for '$GameId' in:" -ForegroundColor Green
Write-Host "  $Target"
Write-Host ""
Write-Host "Next:"
Write-Host "  cd $Target"
Write-Host "  npm install"
Write-Host "  npm run dev"
Write-Host '  npm run build; npm start'
Write-Host ""
Write-Host ("Loop: init-game.ps1 -GameId " + $GameId + " -Target ... -InstallSkills")
