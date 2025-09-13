@echo off
setlocal
title Clean Cursor caches + fix extensions

REM Paths
set "CURSOR_EXE=%LocalAppData%\Programs\cursor\Cursor.exe"
set "PS1=%TEMP%\Clean-Cursor.ps1"

REM Write the PowerShell cleaner (cache purge + .vscode settings + safe relaunch)
>"%PS1%" (
  echo $ErrorActionPreference = "Stop"
  echo function Stop-Cursor { Get-Process -Name "Cursor" -ErrorAction SilentlyContinue ^| Stop-Process -Force -ErrorAction SilentlyContinue; Start-Sleep -Milliseconds 600 }
  echo function New-Stamp { (Get-Date).ToString("yyyyMMdd-HHmmss") }
  echo function Ensure-Dir([string]$p) { if (-not (Test-Path $p)) { New-Item -ItemType Directory -Path $p ^| Out-Null } }
  echo $AppData    = $env:APPDATA
  echo $LocalApp   = $env:LOCALAPPDATA
  echo $CursorUser = Join-Path $AppData "Cursor\User"
  echo $CursorRoot = Join-Path $AppData "Cursor"
  echo $CacheDirs  = @(
  echo   (Join-Path $CursorRoot "Cache"),
  echo   (Join-Path $CursorRoot "GPUCache"),
  echo   (Join-Path $CursorRoot "Service Worker"),
  echo   (Join-Path $CursorRoot "Code Cache"),
  echo   (Join-Path $CursorUser "workspaceStorage")
  echo )
  echo $Here = Get-Location
  echo $vscodeDir = Join-Path $Here ".vscode"
  echo Ensure-Dir $vscodeDir
  echo $settingsPath = Join-Path $vscodeDir "settings.json"
  echo $settingsJson = @{
  echo   "typescript.tsserver.useSyntaxServer" = "auto"
  echo   "eslint.useFlatConfig"                = $true
  echo   "editor.defaultFormatter"             = "esbenp.prettier-vscode"
  echo   "prettier.enable"                     = $true
  echo   "diffEditor.experimental.useVersion2" = $false
  echo   "editor.experimental.asyncTokenization" = $false
  echo } ^| ConvertTo-Json -Depth 5
  echo Set-Content -Path $settingsPath -Value $settingsJson -Encoding UTF8
  echo $extsPath = Join-Path $vscodeDir "extensions.json"
  echo $extsJson = @{
  echo   recommendations = @(
  echo     "esbenp.prettier-vscode",
  echo     "dbaeumer.vscode-eslint",
  echo     "ms-mssql.mssql"
  echo   )
  echo   unwantedRecommendations = @(
  echo     "ms-vscode.vscode-typescript-next",
  echo     "mtxr.sqltools",
  echo     "Postman.postman-for-vscode"
  echo   )
  echo } ^| ConvertTo-Json -Depth 5
  echo Set-Content -Path $extsPath -Value $extsJson -Encoding UTF8
  echo Write-Host ">> Wrote workspace .vscode settings in $Here" -ForegroundColor Green
  echo Stop-Cursor
  echo $Stamp = New-Stamp
  echo $BackupRoot = Join-Path $env:TEMP "cursor-clean-$Stamp"
  echo Ensure-Dir $BackupRoot
  echo foreach ($dir in $CacheDirs) {
  echo   if (Test-Path $dir) {
  echo     $name = Split-Path $dir -Leaf
  echo     $backup = Join-Path $BackupRoot $name
  echo     Copy-Item $dir $backup -Recurse -Force -ErrorAction SilentlyContinue
  echo     Remove-Item $dir -Recurse -Force -ErrorAction SilentlyContinue
  echo   }
  echo }
  echo Write-Host ">> Cache purge complete. Backup at: $BackupRoot" -ForegroundColor Green
)

REM Run the cleaner in the current repo folder (so .vscode lands here)
echo.
echo === Purging caches and writing workspace settings ===
powershell -ExecutionPolicy Bypass -File "%PS1%"
if errorlevel 1 (
  echo PowerShell cleaner failed. Press any key to continue anyway...
  pause >nul
)

REM Extension surgery (use Cursor's VS Code CLI)
if not exist "%CURSOR_EXE%" (
  echo.
  echo WARNING: Cursor.exe not found at:
  echo   %CURSOR_EXE%
  echo If you have VS Code installed, the following commands also work with "code" instead of Cursor.
  echo.
)

echo.
echo === Uninstalling conflicting extensions ===
"%CURSOR_EXE%" --uninstall-extension ms-vscode.vscode-typescript-next  2>nul
"%CURSOR_EXE%" --uninstall-extension mtxr.sqltools                    2>nul
"%CURSOR_EXE%" --uninstall-extension Postman.postman-for-vscode       2>nul

echo.
echo === Ensuring preferred extensions are installed ===
"%CURSOR_EXE%" --install-extension ms-mssql.mssql                     2>nul
"%CURSOR_EXE%" --install-extension esbenp.prettier-vscode             2>nul
"%CURSOR_EXE%" --install-extension dbaeumer.vscode-eslint             2>nul

echo.
echo === First launch (extensions disabled) to verify stability ===
"%CURSOR_EXE%" --disable-extensions
echo.
echo When Cursor opens, confirm the spam is gone, then close it and press any key here...
pause >nul

echo.
echo === Normal relaunch ===
"%CURSOR_EXE%"
echo Done.
endlocal
