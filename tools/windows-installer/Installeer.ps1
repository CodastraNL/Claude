# Medal Network - zet alle bestanden in je Codastra-map en verplaatst de oude MedalCapes-map.
# Er wordt niets verwijderd. Verplaatsen gebeurt alleen na jouw bevestiging.
$ErrorActionPreference = 'Stop'
$Target = 'C:\Users\alphe\Documents\Codastra\Medal Network'
$Source = Join-Path $PSScriptRoot 'Medal Network'

Write-Host ''
Write-Host '=== Medal Network installeren ===' -ForegroundColor Yellow
Write-Host "Doelmap: $Target"
Write-Host ''

if (-not (Test-Path $Source)) {
  Write-Host 'Map "Medal Network" niet gevonden naast dit script.' -ForegroundColor Red
  Write-Host 'Pak eerst de hele zip uit (rechtermuisknop > Alles uitpakken) en start dit script vanuit de uitgepakte map.'
  exit 1
}

# 1) Bestanden kopieren (bestaande bestanden met dezelfde naam worden bijgewerkt)
New-Item -ItemType Directory -Force -Path $Target | Out-Null
Copy-Item -Path (Join-Path $Source '*') -Destination $Target -Recurse -Force
Write-Host '[OK] Logo''s, websites en brand kit staan in:' -ForegroundColor Green
Get-ChildItem $Target -Directory | ForEach-Object { Write-Host "     - $($_.Name)" }
Write-Host ''

# 2) Oude MedalCapes-map zoeken
$names = @('minecraft-capes', 'MedalCapes', 'medal-capes', 'medalcapes', 'mc-capes-store', 'medal capes')
$roots = @("$env:USERPROFILE\Documents", "$env:USERPROFILE\Desktop", "$env:USERPROFILE\Downloads", "$env:USERPROFILE\OneDrive",
           "$env:USERPROFILE\source", "$env:USERPROFILE\Projects", "$env:USERPROFILE\Websites", "$env:USERPROFILE") |
         Where-Object { Test-Path $_ } | Select-Object -Unique
Write-Host 'Oude MedalCapes-map zoeken...' -ForegroundColor Yellow
$found = @()
foreach ($r in $roots) {
  $found += Get-ChildItem -Path $r -Directory -Recurse -Depth 3 -ErrorAction SilentlyContinue |
    Where-Object {
      ($names -contains $_.Name) -and
      ($_.FullName -notlike "$Target*") -and
      ($_.FullName -notmatch '\\node_modules\\|\\\.git\\|\\AppData\\')
    }
}
$found = @($found | Where-Object { $_ } | Sort-Object FullName -Unique)

$pick = $null
if ($found.Count -gt 0) {
  Write-Host 'Gevonden mappen:'
  for ($i = 0; $i -lt $found.Count; $i++) {
    $isProject = (Test-Path (Join-Path $found[$i].FullName 'package.json'))
    $tag = ''; if ($isProject) { $tag = '  (project)' }
    Write-Host ("  [{0}] {1}{2}" -f ($i + 1), $found[$i].FullName, $tag)
  }
  Write-Host ''
  $answer = Read-Host 'Welke is de oude MedalCapes-map? Typ het nummer, een eigen pad, of druk Enter om over te slaan'
} else {
  Write-Host 'Geen map gevonden met een bekende naam.'
  $answer = Read-Host 'Typ het volledige pad van de oude MedalCapes-map, of druk Enter om over te slaan'
}

$answer = ("$answer").Trim().Trim('"')
if ($answer -match '^\d+$' -and [int]$answer -ge 1 -and [int]$answer -le $found.Count) { $pick = $found[[int]$answer - 1].FullName }
elseif ($answer -and (Test-Path $answer -PathType Container)) { $pick = (Resolve-Path $answer).Path }
elseif ($answer) { Write-Host "Pad niet gevonden: $answer" -ForegroundColor Red }

if ($pick) {
  $capesDir = Join-Path $Target 'MedalCapes'
  $dest = Join-Path $capesDir 'Website'
  if (Test-Path $dest) { $dest = Join-Path $capesDir (Split-Path $pick -Leaf) }
  Write-Host ''
  Write-Host "Van:  $pick"
  Write-Host "Naar: $dest"
  $ok = Read-Host 'Verplaatsen? (J/N)'
  if ($ok -match '^[JjYy]') {
    try {
      Move-Item -Path $pick -Destination $dest
      Write-Host '[OK] Oude MedalCapes-map verplaatst.' -ForegroundColor Green
      Write-Host 'Tip: had je deze map open in VS Code, Claude (Remote Control) of een terminal? Open hem dan opnieuw vanaf de nieuwe plek.'
    } catch {
      Write-Host "[!] Verplaatsen lukte niet: $($_.Exception.Message)" -ForegroundColor Red
      Write-Host '    Sluit programma''s die de map gebruiken (VS Code, terminal, dev-server) en start dit script opnieuw.'
      Write-Host '    Staat de map op een andere schijf (bijv. D:)? Sleep hem dan zelf naar de MedalCapes-map.'
    }
  } else { Write-Host 'Niet verplaatst.' }
} else { Write-Host 'Oude MedalCapes-map overgeslagen.' }

Write-Host ''
Write-Host 'Klaar! De map wordt nu geopend.' -ForegroundColor Yellow
Start-Process explorer.exe $Target
