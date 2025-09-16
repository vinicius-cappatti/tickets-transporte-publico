<#
.SYNOPSIS
  Script de suporte para instalar uma distribuição LaTeX no Windows (MiKTeX via winget/choco).

USAGE
  Execute em PowerShell com privilégios de administrador:
    .\install-latex.ps1
  Opções:
    -Force    Força a instalação mesmo se pdflatex já existir

NOTES
  O script tenta usar o winget (recomendado) ou Chocolatey se disponível. Se nenhum gerenciador estiver presente,
  instruirá a baixar o instalador manualmente.
#>

param(
    [switch]$Force
)

function Write-Info($m){ Write-Host "[INFO] $m" -ForegroundColor Cyan }
function Write-ErrorAndExit($m){ Write-Host "[ERROR] $m" -ForegroundColor Red; exit 1 }

Write-Info "Verificando se 'pdflatex' já está disponível..."
try{
    $pd = Get-Command pdflatex -ErrorAction SilentlyContinue
} catch { $pd = $null }

if ($pd -and -not $Force) {
    Write-Info "pdflatex encontrado em: $($pd.Path). Nenhuma ação necessária. Use -Force para reinstalar."
    exit 0
}

# Verifica privilégios
if (-not ([bool](New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator))) {
    Write-ErrorAndExit "Este script precisa ser executado como Administrador. Abra o PowerShell como Administrador e execute novamente."
}

Write-Info "Procurando gerenciadores de pacote (winget / choco)..."

$winget = Get-Command winget -ErrorAction SilentlyContinue
$choco = Get-Command choco -ErrorAction SilentlyContinue

if ($winget) {
    Write-Info "winget encontrado. Instalando MiKTeX via winget..."
    winget install --id MiKTeX.MiKTeX -e --silent | Out-Null
}
elseif ($choco) {
    Write-Info "Chocolatey encontrado. Instalando MiKTeX via choco..."
    choco install miktex -y | Out-Null
}
else {
    Write-Info "Nenhum gerenciador automático detectado (winget/choco). Por favor baixe e execute o instalador do MiKTeX manualmente: https://miktex.org/download"
    Write-Info "Após a instalação verifique se 'pdflatex' ficou disponível no PATH."
    exit 0
}

Write-Info "Verificando instalação..."
Start-Sleep -Seconds 3
$pd2 = Get-Command pdflatex -ErrorAction SilentlyContinue
if ($pd2) {
    Write-Info "Instalação concluída. pdflatex disponível em: $($pd2.Path)"
    exit 0
} else {
    Write-ErrorAndExit "Não foi possível localizar 'pdflatex' após a instalação. Verifique o PATH e reinicie o PowerShell/VS Code se necessário."
}
