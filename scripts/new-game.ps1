#Requires -Version 5.1
<#
.SYNOPSIS
  新建游戏：scaffold 工程骨架 + init Loop 工具链（一条命令）。

.EXAMPLE
  & "<kit-root>\scripts\new-game.ps1" `
    -GameId "my-game" `
    -GameName "我的游戏" `
    -Target "<game-repo>" `
    -InstallSkills
#>
param(
    [Parameter(Mandatory = $true)]
    [string] $GameId,

    [Parameter(Mandatory = $true)]
    [string] $Target,

    [string] $GameName = '',

    [string] $KitRoot = (Split-Path -Parent $PSScriptRoot),

    [switch] $InstallSkills,

    [switch] $Force
)

$ErrorActionPreference = 'Stop'

$scaffoldScript = Join-Path $PSScriptRoot 'scaffold-game.ps1'
$initScript = Join-Path $PSScriptRoot 'init-game.ps1'

& $scaffoldScript -GameId $GameId -GameName $GameName -Target $Target -KitRoot $KitRoot -Force:$Force

& $initScript -GameId $GameId -Target $Target -KitRoot $KitRoot -InstallSkills:$InstallSkills

Write-Host ""
Write-Host "new-game complete: scaffold + Loop toolchain for '$GameId'" -ForegroundColor Green
