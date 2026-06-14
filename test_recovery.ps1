try {
    $latin1 = [System.Text.Encoding]::GetEncoding(28591)
    $utf8 = [System.Text.Encoding]::UTF8

    $content = Get-Content -Path 'C:\Users\Nikhi\.gemini\antigravity\scratch\bible-quiz-app\js\app.js' -Raw -Encoding utf8
    $bytes = $latin1.GetBytes($content)
    $decoded = $utf8.GetString($bytes)

    $decoded | Out-File -FilePath 'C:\Users\Nikhi\.gemini\antigravity\scratch\bible-quiz-app\app_recovered.js' -Encoding utf8
    Write-Output "Successfully recovered app.js!"
} catch {
    Write-Error $_.Exception.Message
}
