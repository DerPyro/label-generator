# Technical placeholder assets only. No final painted illustrations.
# Run from any directory with PowerShell on Windows; requires System.Drawing.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$assetRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../assets'))
$width = 1200
$height = 1800

function Color([string]$hex, [int]$alpha = 255) {
    $c = [Drawing.ColorTranslator]::FromHtml($hex)
    return [Drawing.Color]::FromArgb($alpha, $c.R, $c.G, $c.B)
}
function Brush([string]$hex, [int]$alpha = 255) { return [Drawing.SolidBrush]::new((Color $hex $alpha)) }
function Pen([string]$hex, [single]$size = 3, [int]$alpha = 255) { return [Drawing.Pen]::new((Color $hex $alpha), $size) }
function RoundedPath([single]$x, [single]$y, [single]$w, [single]$h, [single]$r) {
    $path = [Drawing.Drawing2D.GraphicsPath]::new()
    $d = $r * 2
    $path.AddArc($x, $y, $d, $d, 180, 90)
    $path.AddArc($x+$w-$d, $y, $d, $d, 270, 90)
    $path.AddArc($x+$w-$d, $y+$h-$d, $d, $d, 0, 90)
    $path.AddArc($x, $y+$h-$d, $d, $d, 90, 90)
    $path.CloseFigure()
    return $path
}
function New-Layer {
    $script:bitmap = [Drawing.Bitmap]::new($width, $height, [Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $script:g = [Drawing.Graphics]::FromImage($bitmap)
    $g.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.Clear([Drawing.Color]::Transparent)
}
function Save-Layer([string]$relative) {
    $target = Join-Path $assetRoot $relative
    [IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($target)) | Out-Null
    $bitmap.Save($target, [Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bitmap.Dispose()
    Write-Output $relative
}
function Pine([single]$x, [single]$bottom, [single]$h, [Drawing.Brush]$fill) {
    $p = [Drawing.Drawing2D.GraphicsPath]::new()
    $points = [Drawing.PointF[]]@(
        [Drawing.PointF]::new($x, $bottom-$h),
        [Drawing.PointF]::new($x+$h*.17, $bottom-$h*.61),
        [Drawing.PointF]::new($x+$h*.09, $bottom-$h*.61),
        [Drawing.PointF]::new($x+$h*.27, $bottom-$h*.29),
        [Drawing.PointF]::new($x+$h*.17, $bottom-$h*.29),
        [Drawing.PointF]::new($x+$h*.36, $bottom),
        [Drawing.PointF]::new($x-$h*.36, $bottom),
        [Drawing.PointF]::new($x-$h*.17, $bottom-$h*.29),
        [Drawing.PointF]::new($x-$h*.27, $bottom-$h*.29),
        [Drawing.PointF]::new($x-$h*.09, $bottom-$h*.61),
        [Drawing.PointF]::new($x-$h*.17, $bottom-$h*.61)
    )
    $p.AddPolygon($points)
    $g.FillPath($fill, $p)
    $p.Dispose()
}

# Base owns only paper, contour and a deterministic paper grain.
New-Layer
$outline = RoundedPath 34 34 1132 1732 92
$paper = Brush '#efe4c8'
$edge = Pen '#927958' 6
$g.FillPath($paper, $outline)
$g.SetClip($outline)
$rng = [Random]::new(301)
$grain = Brush '#765b3a' 15
for ($i=0; $i -lt 16000; $i++) {
    $x = $rng.Next(1200); $y = $rng.Next(1800)
    $g.FillEllipse($grain, $x, $y, 2, 2)
}
$g.ResetClip()
$g.DrawPath($edge, $outline)
$inner = RoundedPath 60 60 1080 1680 75
$innerPen = Pen '#b6a17a' 2
$g.DrawPath($innerPen, $inner)
$paper.Dispose(); $edge.Dispose(); $grain.Dispose(); $outline.Dispose(); $inner.Dispose(); $innerPen.Dispose()
Save-Layer 'base/label_base.png'

# Identical tree positions and horizon for every daylight variant.
$palettes = @(
    @{file='100'; top='#a7d8dc'; horizon='#f9e9ab'; far='#789d8a'; near='#2f6152'; sun='#fff7d2'},
    @{file='75'; top='#7eb8cd'; horizon='#f4dda7'; far='#70928c'; near='#28594f'; sun='#fff3c1'},
    @{file='50'; top='#bd889a'; horizon='#f2bd7e'; far='#937a83'; near='#514e66'; sun='#ffe5ae'},
    @{file='25'; top='#565a85'; horizon='#ba9baf'; far='#6d6c91'; near='#323c59'; sun='#eadad0'},
    @{file='0'; top='#15273e'; horizon='#52617f'; far='#384a65'; near='#172d40'; sun='#f1e7c9'}
)
foreach ($p in $palettes) {
    New-Layer
    $bounds = RoundedPath 96 112 1008 1576 55
    $g.SetClip($bounds)
    $sky = [Drawing.Drawing2D.LinearGradientBrush]::new([Drawing.Point]::new(0,112), [Drawing.Point]::new(0,1180), (Color $p.top), (Color $p.horizon))
    $g.FillRectangle($sky, 96,112,1008,1576)
    $light = Brush $p.sun 210
    $g.FillEllipse($light, 842,250,110,110)
    if ($p.file -eq '0') {
        $star = Brush '#f5edd5' 180
        foreach ($point in @(@(190,220),@(405,320),@(660,190),@(1010,440),@(710,440),@(290,480),@(540,250))) {
            $g.FillEllipse($star, $point[0],$point[1],5,5)
        }
        $star.Dispose()
    }
    $farBrush = Brush $p.far
    $nearBrush = Brush $p.near
    $g.FillEllipse($farBrush,-300,1060,1900,900)
    foreach ($tree in @(@(130,1450,480),@(260,1450,350),@(390,1460,300),@(520,1490,270),@(690,1470,310),@(830,1460,400),@(1010,1450,520))) {
        Pine $tree[0] $tree[1] $tree[2] $farBrush
    }
    foreach ($tree in @(@(95,1675,790),@(235,1690,570),@(390,1750,420),@(820,1760,450),@(990,1700,670),@(1120,1680,840))) {
        Pine $tree[0] $tree[1] $tree[2] $nearBrush
    }
    $g.FillEllipse($nearBrush,-250,1520,1700,600)
    $g.ResetClip()
    $sky.Dispose(); $light.Dispose(); $farBrush.Dispose(); $nearBrush.Dispose(); $bounds.Dispose()
    Save-Layer "genetics/forest_$($p.file).png"
}

# Clouds own sky-only shapes. The neutral alpha works over all five skies.
$cloudGroups = @(
    @{name='low'; clusters=@(,@(200,330,0.8))},
    @{name='medium'; clusters=@(@(160,300,1.2),@(720,440,1.0),@(470,210,0.7))},
    @{name='high'; clusters=@(@(100,280,1.6),@(510,250,1.4),@(750,430,1.2),@(260,510,1.4))}
)
foreach ($variant in $cloudGroups) {
    New-Layer
    $clip = RoundedPath 96 112 1008 1576 55
    $g.SetClip($clip)
    $cloud = Brush '#edf0e8' 150
    foreach ($c in $variant.clusters) {
        $x=[single]$c[0]; $y=[single]$c[1]; $s=[single]$c[2]
        $g.FillEllipse($cloud,$x,$y,260*$s,65*$s)
        $g.FillEllipse($cloud,$x+45*$s,$y-35*$s,95*$s,90*$s)
        $g.FillEllipse($cloud,$x+110*$s,$y-53*$s,105*$s,110*$s)
    }
    $g.ResetClip(); $cloud.Dispose(); $clip.Dispose()
    Save-Layer "thc/clouds_$($variant.name).png"
}

# Ornament contours stay fixed; count, size and flowers increase by level.
foreach ($level in @(@{name='low'; count=5; leaf=18; flowers=0},@{name='medium'; count=11; leaf=25; flowers=3},@{name='high'; count=19; leaf=34; flowers=7})) {
    New-Layer
    $stem = Pen '#66764a' 4 230
    $leaf = Brush '#6f8054' 235
    $petal = Brush '#b07a68' 235
    $center = Brush '#d9b46d'
    foreach ($side in @(0,1)) {
        $x = 75 + $side * 1050
        $g.DrawBezier($stem,$x,180,$x+35,580,$x-35,1200,$x,1620)
        for ($i=0;$i -lt $level.count;$i++) {
            $y = 220 + $i * (1360 / [Math]::Max(1,$level.count-1))
            $size = [single]$level.leaf
            $delta = if ($i%2 -eq 0) { 1 } else { -1 }
            $g.FillEllipse($leaf,[single]($x+$delta*4-$size/2),[single]$y,$size,[single]($size*1.7))
        }
        for ($i=0;$i -lt $level.flowers;$i++) {
            $y = 250 + $i*(1250/[Math]::Max(1,$level.flowers-1))
            for ($a=0;$a -lt 6;$a++) {
                $angle=$a*[Math]::PI/3
                $g.FillEllipse($petal,[single]($x+[Math]::Cos($angle)*21-17),[single]($y+[Math]::Sin($angle)*21-17),34,34)
            }
            $g.FillEllipse($center,[single]($x-10),[single]($y-10),20,20)
        }
    }
    $stem.Dispose(); $leaf.Dispose(); $petal.Dispose(); $center.Dispose()
    Save-Layer "cbd/frame_$($level.name).png"
}
