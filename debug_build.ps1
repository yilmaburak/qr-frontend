$ErrorActionPreference = "Continue"
npm run build | Out-File -FilePath build_debug.log -Encoding utf8
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed with code $LASTEXITCODE"
}
else {
    Write-Host "Build success"
}
