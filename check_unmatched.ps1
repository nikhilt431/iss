try {
    $path = "C:\Users\Nikhi\.gemini\antigravity\scratch\bible-quiz-app\app_recovered2.js"
    $lines = Get-Content -Path $path -Encoding utf8
    
    Write-Output "--- Lines containing 'reset-confirm-pass' ---"
    for ($i = 0; $i -lt $lines.Length; $i++) {
        if ($lines[$i] -like "*reset-confirm-pass*") {
            Write-Output "Line $($i+1): $($lines[$i].Trim())"
        }
    }
    
    Write-Output "`n--- Lines containing 'Eliminated' ---"
    for ($i = 0; $i -lt $lines.Length; $i++) {
        if ($lines[$i] -like "*Eliminated*") {
            Write-Output "Line $($i+1): $($lines[$i].Trim())"
        }
    }
    
    Write-Output "`n--- Lines containing 'modal-close' ---"
    for ($i = 0; $i -lt $lines.Length; $i++) {
        if ($lines[$i] -like "*modal-close*") {
            Write-Output "Line $($i+1): $($lines[$i].Trim())"
        }
    }
} catch {
    Write-Error $_.Exception.Message
}
