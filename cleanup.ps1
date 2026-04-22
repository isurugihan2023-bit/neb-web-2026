$lines = Get-Content 'style.css'
$total = $lines.Length
$result = $lines[0..1089] + $lines[1414..($total - 1)]
Set-Content 'style.css' -Value $result -Encoding UTF8
Write-Host "Done. Removed orphaned CSS. Total lines now: $($result.Length)"
