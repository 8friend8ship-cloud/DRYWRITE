<#
GOODWAY WRITE existing Chrome launch bridge.
One explicit invocation, no installed task/trigger, no microphone, no article text.
Keeps normal Chrome toolbar for native Google Translate (NOT --app).
Log contains only route/status/time, no URLs with query, transcripts, secrets or media.
#>
[CmdletBinding()]
param(
    [ValidateSet('production', 'local-preview')]
    [string] $Route = 'production'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$origin = if ($Route -eq 'production') {
    'https://drywrite.contents-os.com'
} else {
    'http://127.0.0.1:4173'
}
$candidates = @(
    (Join-Path $env:ProgramFiles 'Google\Chrome\Application\chrome.exe'),
    (Join-Path ([Environment]::GetFolderPath('ProgramFilesX86')) 'Google\Chrome\Application\chrome.exe'),
    (Join-Path $env:LOCALAPPDATA 'Google\Chrome\Application\chrome.exe')
)
$chrome = $candidates | Where-Object { $_ -and (Test-Path -LiteralPath $_ -PathType Leaf) } | Select-Object -First 1
if (-not $chrome) { throw 'GOODWAY_CHROME_INSTALL_NOT_FOUND' }

# De-duplicate recent dispatches; do not add an auto-run scheduler.
$logDir = Join-Path $env:LOCALAPPDATA 'GOODWAY_WRITE\bridge_logs'
New-Item -ItemType Directory -Path $logDir -Force | Out-Null
$log = Join-Path $logDir 'chrome_voice_bridge.jsonl'
$last = if (Test-Path -LiteralPath $log) {
    Get-Content -LiteralPath $log -Tail 1 -ErrorAction SilentlyContinue
} else { '' }
if ($last) {
    try {
        $previous = $last | ConvertFrom-Json
        if ($previous.route -eq $Route -and $previous.status -eq 'CHROME_OPENED' -and
            [DateTime]::UtcNow.Subtract([DateTime]::Parse($previous.atUtc).ToUniversalTime()).TotalSeconds -lt 120) {
            Write-Output 'GOODWAY_CHROME_RECENT_OPEN_SKIP'
            return
        }
    } catch { } # untrusted old log never grants execution authority
}
Start-Process -FilePath $chrome -ArgumentList @('--new-window', $origin) | Out-Null
$receipt = [ordered]@{
    contract = 'GOODWAY_CHROME_VOICE_BRIDGE_V1_20261116'
    node = 'CHROME_PUBLIC_READER_LAUNCH'
    route = $Route
    status = 'CHROME_OPENED'
    atUtc = [DateTime]::UtcNow.ToString('o')
    sensitivePayloadSent = $false
    modelRequest = $false
    microphoneStarted = $false
    newTriggerCreated = $false
}
($receipt | ConvertTo-Json -Compress) | Add-Content -LiteralPath $log -Encoding UTF8
Write-Output ('GOODWAY_CHROME_OPENED_ROUTE=' + $Route)
Write-Output 'GOODWAY_LOCAL_NODE_LOG_WRITTEN'
