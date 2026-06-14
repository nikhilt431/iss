try {
    $response = Invoke-WebRequest -Uri 'https://iss-tawny.vercel.app/' -UseBasicParsing
    $response.Content | Out-File -FilePath 'C:\Users\Nikhi\.gemini\antigravity\scratch\bible-quiz-app\live_clean.html' -Encoding utf8
    Write-Output "Successfully fetched live page!"
} catch {
    Write-Error $_.Exception.Message
}
