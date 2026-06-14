try {
    $wc = New-Object System.Net.WebClient
    $wc.Encoding = [System.Text.Encoding]::UTF8
    $html = $wc.DownloadString("https://iss-tawny.vercel.app/")
    $html | Out-File -FilePath 'C:\Users\Nikhi\.gemini\antigravity\scratch\bible-quiz-app\live_clean2.html' -Encoding utf8
    Write-Output "Downloaded raw page successfully!"
} catch {
    Write-Error $_.Exception.Message
}
