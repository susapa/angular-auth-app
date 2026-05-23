$root = $PWD.Path
$d = Get-Date -Format 'yyyy-MM-dd'
$f = Join-Path $root "standup\standup-$d.md"

$commits = git -C $root log --since="$d 00:00" --format="- %s" --no-merges 2>$null
$commitsText = if ($commits) { $commits -join "`n" } else { "- (ยังไม่มี commit วันนี้)" }

$content = @"
# Stand-up — $d

## เมื่อวาน / วันนี้ทำอะไร
$commitsText

## บล็อกอะไรอยู่ไหม
-

## พรุ่งนี้จะทำอะไร
-
"@

[System.IO.File]::WriteAllText($f, $content, [System.Text.UTF8Encoding]::new($false))
