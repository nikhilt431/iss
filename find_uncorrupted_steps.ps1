$transcriptPath = 'C:\Users\Nikhi\.gemini\antigravity\brain\eb22ca64-6a48-4a5c-8857-39633a5764f7\.system_generated\logs\transcript_full.jsonl'
$lines = Get-Content -Path $transcriptPath

foreach ($line in $lines) {
    if ($line -like '*नेपाली*' -or $line -like '*सहभागी*') {
        try {
            $obj = ConvertFrom-Json $line -ErrorAction SilentlyContinue
            if ($null -ne $obj) {
                $fileRelated = ""
                if ($line -like '*db.js*') { $fileRelated += " db.js" }
                if ($line -like '*app.js*') { $fileRelated += " app.js" }
                if ($line -like '*admin.js*') { $fileRelated += " admin.js" }
                if ($line -like '*judge.js*') { $fileRelated += " judge.js" }
                if ($line -like '*index.html*') { $fileRelated += " index.html" }
                
                Write-Output "Step $($obj.step_index): Type $($obj.type) has Devanagari for files: $fileRelated"
            }
        } catch {}
    }
}
