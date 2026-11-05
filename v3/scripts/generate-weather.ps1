# Deterministic technical PNG placeholders: light clouds, overcast and thunderstorm.
# Existing forest, paper, ornaments and text are deliberately separate assets.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$weatherRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../assets/thc'))
[IO.Directory]::CreateDirectory($weatherRoot) | Out-Null

function Weather-Color([string]$hex, [int]$alpha = 255) {
    $c = [Drawing.ColorTranslator]::FromHtml($hex)
    return [Drawing.Color]::FromArgb($alpha, $c.R, $c.G, $c.B)
}
function Sky-Clip {
    $path = [Drawing.Drawing2D.GraphicsPath]::new()
    $path.AddArc(96,112,110,110,180,90)
    $path.AddArc(994,112,110,110,270,90)
    $path.AddLine(1104,167,1104,620)
    $path.AddLine(1104,620,96,620)
    $path.CloseFigure()
    return $path
}

# Keep the low-weather endpoint genuinely sparse: one small, thin cloud.
# Build one union path to avoid darkened alpha where its lobes overlap.
$bitmap = [Drawing.Bitmap]::new(1200,1800,[Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [Drawing.Graphics]::FromImage($bitmap)
$g.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear([Drawing.Color]::Transparent)
$clip = Sky-Clip
$g.SetClip($clip)
$wisps = [Drawing.Drawing2D.GraphicsPath]::new([Drawing.Drawing2D.FillMode]::Winding)
$wisps.AddEllipse(220,333,245,34)
$wisps.AddEllipse(265,311,90,55)
$wisps.AddEllipse(320,303,105,64)
$lightCloud = [Drawing.SolidBrush]::new((Weather-Color '#edf0e8' 150))
$g.FillPath($lightCloud,$wisps)
$bitmap.Save((Join-Path $weatherRoot 'clouds_low.png'),[Drawing.Imaging.ImageFormat]::Png)
$lightCloud.Dispose(); $wisps.Dispose(); $clip.Dispose(); $g.Dispose(); $bitmap.Dispose()
Write-Output 'thc/clouds_low.png'

foreach ($variant in @('overcast','storm')) {
    $bitmap = [Drawing.Bitmap]::new(1200,1800,[Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [Drawing.Graphics]::FromImage($bitmap)
    $g.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.Clear([Drawing.Color]::Transparent)
    $clip = Sky-Clip
    $g.SetClip($clip)

    # A connected, opaque bank covers the sun even over a bright morning forest.
    $cloud = [Drawing.Drawing2D.GraphicsPath]::new([Drawing.Drawing2D.FillMode]::Winding)
    $cloud.AddRectangle([Drawing.RectangleF]::new(80,90,1040,175))
    foreach ($lobe in @(@(50,170,310,205),@(235,150,340,235),@(455,175,345,235),@(660,145,355,255),@(875,175,300,205))) {
        $cloud.AddEllipse([single]$lobe[0],[single]$lobe[1],[single]$lobe[2],[single]$lobe[3])
    }
    $top = if ($variant -eq 'storm') { '#263848' } else { '#61717c' }
    $bottom = if ($variant -eq 'storm') { '#4b5868' } else { '#8a959a' }
    $bank = [Drawing.Drawing2D.LinearGradientBrush]::new([Drawing.Point]::new(0,112),[Drawing.Point]::new(0,415),(Weather-Color $top),(Weather-Color $bottom))
    $g.FillPath($bank,$cloud)

    # Quiet tonal lobes add depth while preserving a single continuous cloud mass.
    $g.SetClip($cloud,[Drawing.Drawing2D.CombineMode]::Intersect)
    $shadowColor = if ($variant -eq 'storm') { '#162938' } else { '#455a69' }
    $shadow = [Drawing.SolidBrush]::new((Weather-Color $shadowColor 90))
    foreach ($lobe in @(@(95,160,310,120),@(350,145,300,130),@(620,160,310,120),@(850,145,280,150))) {
        $g.FillEllipse($shadow,[single]$lobe[0],[single]$lobe[1],[single]$lobe[2],[single]$lobe[3])
    }
    $g.SetClip($clip)

    if ($variant -eq 'storm') {
        # Fixed diagonal rain streaks remain in the sky, above the central text panel.
        $rain = [Drawing.Pen]::new((Weather-Color '#95b4c2' 195),3)
        $rain.StartCap = [Drawing.Drawing2D.LineCap]::Round
        $rain.EndCap = [Drawing.Drawing2D.LineCap]::Round
        for ($row=0; $row -lt 3; $row++) {
            for ($column=0; $column -lt 15; $column++) {
                $x = 165 + $column*63 + ($row%2)*18
                $y = 405 + $row*60 + ($column%3)*10
                $g.DrawLine($rain,$x,$y,$x-15,$y+37)
            }
        }
        $rain.Dispose()

        # The bolts are filled shapes, not text, and have a subtle warm halo.
        $halo = [Drawing.Pen]::new((Weather-Color '#f5dba1' 110),12)
        $halo.LineJoin = [Drawing.Drawing2D.LineJoin]::Round
        $light = [Drawing.SolidBrush]::new((Weather-Color '#fff1b8'))
        foreach ($bolt in @(@{x=320;y=350;s=1.1},@{x=875;y=365;s=1.0},@{x=615;y=395;s=0.65})) {
            $points = [Drawing.PointF[]]@(
                [Drawing.PointF]::new($bolt.x+22*$bolt.s,$bolt.y),
                [Drawing.PointF]::new($bolt.x-30*$bolt.s,$bolt.y+99*$bolt.s),
                [Drawing.PointF]::new($bolt.x+3*$bolt.s,$bolt.y+91*$bolt.s),
                [Drawing.PointF]::new($bolt.x-14*$bolt.s,$bolt.y+218*$bolt.s),
                [Drawing.PointF]::new($bolt.x+64*$bolt.s,$bolt.y+69*$bolt.s),
                [Drawing.PointF]::new($bolt.x+24*$bolt.s,$bolt.y+78*$bolt.s),
                [Drawing.PointF]::new($bolt.x+52*$bolt.s,$bolt.y)
            )
            $g.DrawPolygon($halo,$points)
            $g.FillPolygon($light,$points)
        }
        $halo.Dispose(); $light.Dispose()
    }

    $g.ResetClip()
    $bitmap.Save((Join-Path $weatherRoot "clouds_$variant.png"),[Drawing.Imaging.ImageFormat]::Png)
    $bank.Dispose(); $shadow.Dispose(); $cloud.Dispose(); $clip.Dispose(); $g.Dispose(); $bitmap.Dispose()
    Write-Output "thc/clouds_$variant.png"
}
