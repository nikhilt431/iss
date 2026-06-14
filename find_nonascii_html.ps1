$htmlPath = 'C:\Users\Nikhi\.gemini\antigravity\scratch\bible-quiz-app\index.html'
$lines = Get-Content -Path $htmlPath -Encoding utf8

$i = 1
foreach ($line in $lines) {
    if ($line -match '[^\x00-\x7F]') {
        Write-Output "$($i): $($line.Trim())"
    }
    $i++
}
