$transcriptPath = 'C:\Users\Nikhi\.gemini\antigravity\brain\eb22ca64-6a48-4a5c-8857-39633a5764f7\.system_generated\logs\transcript_full.jsonl'
$lines = Get-Content -Path $transcriptPath
foreach ($line in $lines) {
    try {
        $obj = ConvertFrom-Json $line -ErrorAction SilentlyContinue
        if ($null -ne $obj -and $obj.step_index -eq 3828) {
            $obj.content | Out-File -FilePath 'C:\Users\Nikhi\.gemini\antigravity\scratch\bible-quiz-app\step_3828_content.txt' -Encoding utf8
            Write-Output "Extracted step 3828!"
        }
    } catch {}
}
