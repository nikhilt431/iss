try {
    $transcriptPath = 'C:\Users\Nikhi\.gemini\antigravity\brain\eb22ca64-6a48-4a5c-8857-39633a5764f7\.system_generated\logs\transcript_full.jsonl'
    $lines = Get-Content -Path $transcriptPath -Encoding utf8
    
    foreach ($line in $lines) {
        $obj = ConvertFrom-Json $line -ErrorAction SilentlyContinue
        if ($null -ne $obj) {
            if ($null -ne $obj.tool_calls) {
                foreach ($tc in $obj.tool_calls) {
                    if ($tc.name -eq 'view_file' -and $tc.args.AbsolutePath -like '*index.html*') {
                        Write-Output "Step $($obj.step_index): view_file on index.html, range: $($tc.args.StartLine) to $($tc.args.EndLine)"
                    }
                }
            }
        }
    }
} catch {
    Write-Error $_.Exception.Message
}
