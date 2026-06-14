try {
    $r = [System.Net.WebRequest]::Create('https://iss-tawny.vercel.app/')
    $resp = $r.GetResponse()
    $contentType = $resp.Headers.Get("Content-Type")
    Write-Output "Content-Type: $contentType"
} catch {
    Write-Error $_.Exception.Message
}
