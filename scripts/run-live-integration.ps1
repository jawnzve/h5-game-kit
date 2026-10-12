#Requires -Version 5.1
<#
.SYNOPSIS
  ④ 真联调自动化：live Docker + server e2e + 玩家/admin live Playwright。

.EXAMPLE
  & "<kit-root>\scripts\run-live-integration.ps1" `
    -GameId "werewords" `
    -ServerRoot "H:\4.zzz\Cursor\html\h5-game-server-yongyan" `
    -GameRepo "H:\4.zzz\Cursor\html\werewords" `
    -AdminRoot "H:\4.zzz\Cursor\html\h5-game-admin-yongyan"
#>
param(
    [Parameter(Mandatory = $true)]
    [string] $GameId,

    [Parameter(Mandatory = $true)]
    [string] $ServerRoot,

    [Parameter(Mandatory = $true)]
    [string] $GameRepo,

    [string] $AdminRoot = '',

    [switch] $SkipComposeUp
)

$ErrorActionPreference = 'Stop'
$ApiBase = if ($env:H5_API_BASE) { $env:H5_API_BASE } else { 'http://localhost:4000' }

function Invoke-Step([string] $Name, [scriptblock] $Block) {
    Write-Host "`n=== $Name ===" -ForegroundColor Cyan
    & $Block
    if ($LASTEXITCODE -ne 0) {
        throw "$Name failed (exit $LASTEXITCODE)"
    }
}

function Wait-ApiHealth([string] $Url, [int] $TimeoutSec = 120) {
    $deadline = (Get-Date).AddSeconds($TimeoutSec)
    while ((Get-Date) -lt $deadline) {
        try {
            $r = Invoke-WebRequest -Uri "$Url/health" -UseBasicParsing -TimeoutSec 3
            if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 500) {
                Write-Host "API health OK: $Url"
                return
            }
        } catch {
            Start-Sleep -Seconds 2
        }
    }
    throw "Timed out waiting for $Url/health"
}

function Seed-LiveMySQL([string] $ServerRoot) {
    $files = @()
    $initSql = Join-Path $ServerRoot 'docs\sql\werewords_init.sql'
    if (Test-Path $initSql) {
        $files += Get-Item $initSql
    }
    $initDir = Join-Path $ServerRoot 'docker\live-mysql-init'
    if (Test-Path $initDir) {
        $files += Get-ChildItem (Join-Path $initDir '*.sql') | Sort-Object Name
    }
    if ($files.Count -eq 0) {
        Write-Host "Skip mysql seed: no werewords_init.sql or live-mysql-init"
        return
    }
    foreach ($file in $files) {
        Write-Host "mysql seed: $($file.Name)"
        docker compose -f docker-compose.yml -f docker-compose.live.yml cp $file.FullName "mysql-test:/tmp/$($file.Name)"
        if ($LASTEXITCODE -ne 0) {
            throw "mysql cp failed: $($file.Name)"
        }
        docker compose -f docker-compose.yml -f docker-compose.live.yml exec -T mysql-test sh -c "mysql --default-character-set=utf8mb4 -uroot -plivepass < /tmp/$($file.Name)"
        if ($LASTEXITCODE -ne 0) {
            throw "mysql seed failed: $($file.Name)"
        }
    }
}

if (-not (Test-Path $ServerRoot)) { throw "ServerRoot not found: $ServerRoot" }
if (-not (Test-Path $GameRepo)) { throw "GameRepo not found: $GameRepo" }

Push-Location $ServerRoot
try {
    if (-not $SkipComposeUp) {
        Invoke-Step 'docker compose (profile live)' {
            docker compose -f docker-compose.yml -f docker-compose.live.yml --profile live up -d --build
        }
        Wait-ApiHealth $ApiBase
    }

    Invoke-Step 'mysql seed (idempotent)' {
        Seed-LiveMySQL $ServerRoot
    }

    Invoke-Step 'server e2e (Go)' {
        docker compose -f docker-compose.yml -f docker-compose.live.yml --profile test run --rm e2e
    }
}
finally {
    Pop-Location
}

$env:H5_API_BASE = $ApiBase

Push-Location $GameRepo
try {
    $pkg = Get-Content (Join-Path $GameRepo 'package.json') -Raw | ConvertFrom-Json
    if (-not $pkg.scripts.'test:e2e:live') {
        throw 'GameRepo missing npm run test:e2e:live'
    }
    Invoke-Step 'player test:e2e:live' {
        npm run test:e2e:live
    }
}
finally {
    Pop-Location
}

if ($AdminRoot -and (Test-Path $AdminRoot)) {
    Push-Location $AdminRoot
    try {
        $pkg = Get-Content (Join-Path $AdminRoot 'package.json') -Raw | ConvertFrom-Json
        if (-not $pkg.scripts.'test:e2e:live') {
            throw 'AdminRoot missing npm run test:e2e:live'
        }
        Invoke-Step 'admin test:e2e:live' {
            npm run test:e2e:live
        }
    }
    finally {
        Pop-Location
    }
}

Write-Host "`nPASS: live integration completed for $GameId" -ForegroundColor Green
Write-Host "Next: ⑤ sim-lobby manual acceptance"
