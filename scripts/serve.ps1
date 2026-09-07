param(
    [int]$Port = 8123
)

$root = Split-Path -Parent $PSScriptRoot
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Output "Serving $root on http://localhost:$Port/"

$mimeMap = @{
    '.html' = 'text/html; charset=utf-8'
    '.css'  = 'text/css; charset=utf-8'
    '.js'   = 'application/javascript; charset=utf-8'
    '.json' = 'application/json; charset=utf-8'
    '.png'  = 'image/png'
    '.woff' = 'font/woff'
    '.woff2'= 'font/woff2'
    '.ttf'  = 'font/ttf'
}

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        $response.KeepAlive = $false
        $path = $request.Url.AbsolutePath.TrimStart('/')
        if ([string]::IsNullOrEmpty($path)) { $path = 'index.html' }
        Write-Output "GET /$path"
        try {
            $fullPath = Join-Path $root $path

            if (Test-Path $fullPath -PathType Leaf) {
                $ext = [System.IO.Path]::GetExtension($fullPath).ToLower()
                $contentType = $mimeMap[$ext]
                if (-not $contentType) { $contentType = 'application/octet-stream' }
                $bytes = [System.IO.File]::ReadAllBytes($fullPath)
                $response.ContentType = $contentType
                $response.ContentLength64 = $bytes.LongLength
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
                $response.OutputStream.Flush()
            } else {
                $response.StatusCode = 404
                $notFound = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $path")
                $response.ContentLength64 = $notFound.LongLength
                $response.OutputStream.Write($notFound, 0, $notFound.Length)
                $response.OutputStream.Flush()
            }
        } catch {
            Write-Output "ERROR on $path : $($_.Exception.Message)"
        } finally {
            $response.Close()
        }
    }
} finally {
    $listener.Stop()
}
