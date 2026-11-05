# Reproducible technical placeholders for seven genetics, weather and CBD stages.
# Run after generate-placeholders.ps1 and generate-weather.ps1. Existing source
# files are retained; this script only creates four forests, two weather PNGs
# and seven cumulative ornament PNGs. No random geometry or external service.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$sevenAssetRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../assets'))
if (-not ('SevenStagePixels' -as [type])) {
    Add-Type -TypeDefinition @'
using System;
public static class SevenStagePixels {
    public static byte[] Blend(byte[] a, byte[] b, double fraction) {
        var output = new byte[a.Length];
        for (int i = 0; i < a.Length; i += 4) {
            double aa = a[i+3] * (1-fraction), ba = b[i+3] * fraction;
            double alpha = aa + ba;
            output[i+3] = (byte)Math.Round(alpha);
            if (alpha > 0) for (int c = 0; c < 3; c++)
                output[i+c] = (byte)Math.Round((a[i+c]*aa+b[i+c]*ba)/alpha);
        }
        return output;
    }
    public static byte[] Prefix(byte[] source, int firstRow, int stride) {
        var output = (byte[])source.Clone();
        Array.Clear(output, 0, firstRow * stride);
        return output;
    }
    public static byte[] Darken(byte[] source, double factor) {
        var output = (byte[])source.Clone();
        for (int i = 0; i < output.Length; i += 4)
            for (int c = 0; c < 3; c++) output[i+c] = (byte)Math.Round(output[i+c]*factor);
        return output;
    }
}
'@
}
function Read-Pixels([string]$relative) {
    $bitmap = [Drawing.Bitmap]::new((Join-Path $sevenAssetRoot $relative))
    try {
        $rect = [Drawing.Rectangle]::new(0,0,1200,1800)
        $data = $bitmap.LockBits($rect,[Drawing.Imaging.ImageLockMode]::ReadOnly,[Drawing.Imaging.PixelFormat]::Format32bppArgb)
        try {
            $bytes = [byte[]]::new(1200*1800*4)
            [Runtime.InteropServices.Marshal]::Copy($data.Scan0,$bytes,0,$bytes.Length)
            return ,$bytes
        } finally { $bitmap.UnlockBits($data) }
    } finally { $bitmap.Dispose() }
}
function New-PixelsBitmap([byte[]]$pixels) {
    $bitmap = [Drawing.Bitmap]::new(1200,1800,[Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $rect = [Drawing.Rectangle]::new(0,0,1200,1800)
    $data = $bitmap.LockBits($rect,[Drawing.Imaging.ImageLockMode]::WriteOnly,[Drawing.Imaging.PixelFormat]::Format32bppArgb)
    try { [Runtime.InteropServices.Marshal]::Copy($pixels,0,$data.Scan0,$pixels.Length) }
    finally { $bitmap.UnlockBits($data) }
    return $bitmap
}
function Save-Pixels([byte[]]$pixels,[string]$relative) {
    $bitmap = New-PixelsBitmap $pixels
    try { $bitmap.Save((Join-Path $sevenAssetRoot $relative),[Drawing.Imaging.ImageFormat]::Png) }
    finally { $bitmap.Dispose() }
    Write-Output $relative
}

# Premultiplied-alpha interpolation keeps the original tree geometry and opacity.
foreach ($variant in @(@{at=17;low=0;high=25},@{at=33;low=25;high=50},@{at=67;low=50;high=75},@{at=83;low=75;high=100})) {
    $low = Read-Pixels "genetics/forest_$($variant.low).png"
    $high = Read-Pixels "genetics/forest_$($variant.high).png"
    $fraction = ($variant.at-$variant.low)/($variant.high-$variant.low)
    Save-Pixels ([SevenStagePixels]::Blend($low,$high,$fraction)) "genetics/forest_$($variant.at).png"
}

# Each stage is a strict pixel-preserving prefix of the same rooted illustration.
# Runtime may reveal an intermediate height within the first encompassing stage.
$frame = Read-Pixels 'cbd/frame_high.png'
for ($stage=1;$stage -le 7;$stage++) {
    $cutoff = if ($stage -eq 7) { 0 } else { [int][Math]::Ceiling(1640-($stage/7.0)*1460) }
    Save-Pixels ([SevenStagePixels]::Prefix($frame,$cutoff,4800)) "cbd/frame_stage_$stage.png"
}

# A sparse thin wisp is a separate geometry from the small 5% cloud.
$bitmap = [Drawing.Bitmap]::new(1200,1800,[Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [Drawing.Graphics]::FromImage($bitmap)
$g.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear([Drawing.Color]::Transparent)
$wisp = [Drawing.Drawing2D.GraphicsPath]::new([Drawing.Drawing2D.FillMode]::Winding)
$wisp.AddEllipse(690,245,190,18)
$wisp.AddEllipse(735,232,80,29)
$cloud = [Drawing.SolidBrush]::new([Drawing.Color]::FromArgb(120,237,240,232))
$g.FillPath($cloud,$wisp)
$bitmap.Save((Join-Path $sevenAssetRoot 'thc/clouds_wisps.png'),[Drawing.Imaging.ImageFormat]::Png)
$cloud.Dispose();$wisp.Dispose();$g.Dispose();$bitmap.Dispose()
Write-Output 'thc/clouds_wisps.png'

# Rain follows the overcast cloud geometry, with darker tones and no lightning.
$bitmap = New-PixelsBitmap ([SevenStagePixels]::Darken((Read-Pixels 'thc/clouds_overcast.png'),0.8))
$g = [Drawing.Graphics]::FromImage($bitmap)
$g.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::AntiAlias
$rain = [Drawing.Pen]::new([Drawing.Color]::FromArgb(190,149,180,194),3)
$rain.StartCap = [Drawing.Drawing2D.LineCap]::Round
$rain.EndCap = [Drawing.Drawing2D.LineCap]::Round
for ($row=0;$row -lt 2;$row++) {
    for ($column=0;$column -lt 12;$column++) {
        $x=175+$column*76+($row%2)*20
        $y=420+$row*75+($column%3)*9
        $g.DrawLine($rain,$x,$y,$x-13,$y+31)
    }
}
$bitmap.Save((Join-Path $sevenAssetRoot 'thc/clouds_rain.png'),[Drawing.Imaging.ImageFormat]::Png)
$rain.Dispose();$g.Dispose();$bitmap.Dispose()
Write-Output 'thc/clouds_rain.png'
