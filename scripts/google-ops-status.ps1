# Read-only health check for shared DOKUNTAG Google integrations.
param(
    [string]$ProjectId = "dokuntag-platform-ops",
    [string]$PackageName = "com.dokuntag.app"
)

$ErrorActionPreference = "Stop"

$gcloud = (Get-Command gcloud -ErrorAction SilentlyContinue).Source
if (-not $gcloud) {
    $fallback = Join-Path $env:LOCALAPPDATA "Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd"
    if (Test-Path $fallback) { $gcloud = $fallback }
}
if (-not $gcloud) { throw "gcloud was not found." }

$account = & $gcloud auth list --filter=status:ACTIVE --format="value(account)"
$configuredProject = & $gcloud config get-value project 2>$null
$token = & $gcloud auth application-default print-access-token
if (-not $token) { throw "Application Default Credentials are unavailable." }

$headers = @{
    Authorization = "Bearer $token"
    "x-goog-user-project" = $ProjectId
}
$sites = Invoke-RestMethod -Uri "https://www.googleapis.com/webmasters/v3/sites" -Headers $headers -Method Get

$playUri = "https://androidpublisher.googleapis.com/androidpublisher/v3/applications/$PackageName/reviews?maxResults=1"
$playStatus = $null
try {
    $playResponse = Invoke-WebRequest -Uri $playUri -Headers $headers -Method Get -UseBasicParsing
    $playStatus = [int]$playResponse.StatusCode
}
catch {
    if ($_.Exception.Response) {
        $playStatus = [int]$_.Exception.Response.StatusCode
    }
    else { throw }
}

[pscustomobject]@{
    AuthAccountConfigured = -not [string]::IsNullOrWhiteSpace($account)
    ConfiguredProject = $configuredProject
    SearchConsoleProperties = @($sites.siteEntry).Count
    SearchConsoleSites = @($sites.siteEntry | ForEach-Object { $_.siteUrl })
    PlayPackage = $PackageName
    PlayReadStatus = $playStatus
}
