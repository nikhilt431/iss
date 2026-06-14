$transcriptPath = 'C:\Users\Nikhi\.gemini\antigravity\brain\eb22ca64-6a48-4a5c-8857-39633a5764f7\.system_generated\logs\transcript_full.jsonl'
$lines = Get-Content -Path $transcriptPath

foreach ($line in $lines) {
    try {
        $obj = ConvertFrom-Json $line -ErrorAction SilentlyContinue
        if ($null -ne $obj -and $null -ne $obj.content) {
            $chars = $obj.content.ToCharArray()
            $devanagariCount = 0
            foreach ($c in $chars) {
                $val = [int]$c
                if ($val -ge 0x0900 -and $val -le 0x097F) {
                    $devanagariCount++
                }
            }
            if ($devanagariCount -gt 5) {
                Write-Output "Step $($obj.step_index) has $devanagariCount real Devanagari characters!"
            }
        }
    } catch {}
}
