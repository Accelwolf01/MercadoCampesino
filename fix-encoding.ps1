$utf8NoBom = New-Object System.Text.UTF8Encoding $false
$def = [System.Text.Encoding]::Default

$files = @(
    "D:\Documentos\Accelwolf\OneDrive\Escritorio\Semestre X\TRABAJO DE GRADO 3\frontend\src\app\pages\consumidor\consumidor.ts"
    "D:\Documentos\Accelwolf\OneDrive\Escritorio\Semestre X\TRABAJO DE GRADO 3\frontend\src\app\pages\campesino\campesino.ts"
    "D:\Documentos\Accelwolf\OneDrive\Escritorio\Semestre X\TRABAJO DE GRADO 3\frontend\src\app\pages\home\home.ts"
    "D:\Documentos\Accelwolf\OneDrive\Escritorio\Semestre X\TRABAJO DE GRADO 3\frontend\src\app\pages\admin\admin.ts"
    "D:\Documentos\Accelwolf\OneDrive\Escritorio\Semestre X\TRABAJO DE GRADO 3\frontend\src\app\pages\superadmin\superadmin.ts"
    "D:\Documentos\Accelwolf\OneDrive\Escritorio\Semestre X\TRABAJO DE GRADO 3\frontend\src\app\pages\login\login.ts"
    "D:\Documentos\Accelwolf\OneDrive\Escritorio\Semestre X\TRABAJO DE GRADO 3\frontend\src\app\pages\register\register.ts"
    "D:\Documentos\Accelwolf\OneDrive\Escritorio\Semestre X\TRABAJO DE GRADO 3\frontend\src\app\pages\pending\pending.ts"
    "D:\Documentos\Accelwolf\OneDrive\Escritorio\Semestre X\TRABAJO DE GRADO 3\frontend\src\app\pages\mapa\mapa.ts"
    "D:\Documentos\Accelwolf\OneDrive\Escritorio\Semestre X\TRABAJO DE GRADO 3\frontend\src\app\components\navbar\navbar.ts"
    "D:\Documentos\Accelwolf\OneDrive\Escritorio\Semestre X\TRABAJO DE GRADO 3\frontend\src\styles.css"
    "D:\Documentos\Accelwolf\OneDrive\Escritorio\Semestre X\TRABAJO DE GRADO 3\frontend\src\index.html"
)

foreach ($f in $files) {
    if (Test-Path $f) {
        $bytes = [System.IO.File]::ReadAllBytes($f)
        $text = $def.GetString($bytes)
        $utf8Bytes = $utf8NoBom.GetBytes($text)
        [System.IO.File]::WriteAllBytes($f, $utf8Bytes)
        Write-Host "OK: $f"
    } else {
        Write-Host "NOT FOUND: $f"
    }
}
Write-Host "Done"
