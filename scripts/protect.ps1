param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("lock", "unlock")]
    [string]$Action
)

switch ($Action) {
    "lock" {
        Set-ItemProperty -Path "prisma" -Name IsReadOnly -Value $true -Recurse
        Set-ItemProperty -Path "public/assets" -Name IsReadOnly -Value $true -Recurse
        Set-ItemProperty -Path "scripts" -Name IsReadOnly -Value $true -Recurse
        Write-Host "Locked prisma/, public/assets/, scripts/"
    }
    "unlock" {
        Set-ItemProperty -Path "prisma" -Name IsReadOnly -Value $false -Recurse
        Set-ItemProperty -Path "public/assets" -Name IsReadOnly -Value $false -Recurse
        Set-ItemProperty -Path "scripts" -Name IsReadOnly -Value $false -Recurse
        Write-Host "Unlocked prisma/, public/assets/, scripts/"
    }
}
