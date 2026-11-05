# Deterministic technical texturepack placeholders. No network or image generation.
# Independent rectangular and circular artwork, two palettes. Fonts stay licensed.
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
$packRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../texturepacks'))
$sourceRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../assets'))
if(-not ('TexturePackArtwork' -as [type])) {
  $drawingReferences=@([Drawing.Bitmap].Assembly.Location,[Drawing.Color].Assembly.Location)
  # Recent PowerShell/.NET versions split the Windows drawing internals.
  # Include those assemblies when present while retaining older .NET support.
  foreach($assemblyFile in @('System.Private.Windows.GdiPlus.dll','System.Private.Windows.Core.dll')) {
    $assemblyPath=Join-Path $PSHOME $assemblyFile
    if(Test-Path -LiteralPath $assemblyPath){$drawingReferences+=$assemblyPath}
  }
Add-Type -ReferencedAssemblies $drawingReferences -TypeDefinition @'
using System;
using System.IO;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;
public static class TexturePackArtwork {
 static Color C(string hex,int alpha=255){Color c=ColorTranslator.FromHtml(hex);return Color.FromArgb(alpha,c.R,c.G,c.B);}
 static SolidBrush B(string h,int a=255){return new SolidBrush(C(h,a));}
 static Pen P(string h,float size=3,int a=255){return new Pen(C(h,a),size);}
 static GraphicsPath Round(float x,float y,float w,float h,float r){var p=new GraphicsPath();float d=r*2;p.AddArc(x,y,d,d,180,90);p.AddArc(x+w-d,y,d,d,270,90);p.AddArc(x+w-d,y+h-d,d,d,0,90);p.AddArc(x,y+h-d,d,d,90,90);p.CloseFigure();return p;}
 static Bitmap New(int h){return new Bitmap(1200,h,PixelFormat.Format32bppArgb);}
 static Graphics Draw(Bitmap b){var g=Graphics.FromImage(b);g.SmoothingMode=SmoothingMode.AntiAlias;g.Clear(Color.Transparent);return g;}
 static void Save(Bitmap b,string path){Directory.CreateDirectory(Path.GetDirectoryName(path));b.Save(path,ImageFormat.Png);}
 static void Pine(Graphics g,float x,float bottom,float h,Brush brush){
  var pts=new PointF[]{new PointF(x,bottom-h),new PointF(x+h*.17f,bottom-h*.61f),new PointF(x+h*.09f,bottom-h*.61f),new PointF(x+h*.27f,bottom-h*.29f),new PointF(x+h*.17f,bottom-h*.29f),new PointF(x+h*.36f,bottom),new PointF(x-h*.36f,bottom),new PointF(x-h*.17f,bottom-h*.29f),new PointF(x-h*.27f,bottom-h*.29f),new PointF(x-h*.09f,bottom-h*.61f),new PointF(x-h*.17f,bottom-h*.61f)};
  g.FillPolygon(brush,pts);
 }
 static void Flower(Graphics g,float x,float y,float radius){
  using(var petal=B("#b27967"))using(var core=B("#d7b46e")){
   for(int i=0;i<5;i++){double a=i*Math.PI*2/5;float px=x+(float)Math.Cos(a)*radius*.58f;float py=y+(float)Math.Sin(a)*radius*.58f;g.FillEllipse(petal,px-radius*.55f,py-radius*.55f,radius*1.1f,radius*1.1f);}
   g.FillEllipse(core,x-radius*.30f,y-radius*.30f,radius*.60f,radius*.60f);
  }
 }
 static void Base(string path,bool circle){
  using(var b=New(circle?1200:1800))using(var g=Draw(b))using(var paper=B("#efe4c8"))using(var edge=P("#927958",5))using(var inner=P("#b6a17a",2)){
   GraphicsPath p;
   if(circle){p=new GraphicsPath();p.AddEllipse(30,30,1140,1140);}else p=Round(34,34,1132,1732,92);
   using(p){g.FillPath(paper,p);g.SetClip(p);using(var grain=B("#765b3a",15)){var rnd=new Random(301);for(int i=0;i<(circle?10000:16000);i++)g.FillEllipse(grain,rnd.Next(1200),rnd.Next(b.Height),2,2);}g.ResetClip();g.DrawPath(edge,p);}
   if(circle)g.DrawEllipse(inner,52,52,1096,1096);else using(var p2=Round(60,60,1080,1680,75))g.DrawPath(inner,p2);
   Save(b,path);
  }
 }
 static readonly string[][] Palettes=new string[][]{
  new[]{"#15273e","#52617f","#384a65","#172d40","#f1e7c9"},
  new[]{"#414c75","#9e8ca7","#62658b","#2c3855","#e2d9d2"},
  new[]{"#a36e86","#e9a670","#877383","#47465e","#ffe2a9"},
  new[]{"#bd889a","#f2bd7e","#937a83","#514e66","#ffe5ae"},
  new[]{"#9cc6cb","#f3d99e","#789b8b","#2c5d50","#fff3bf"},
  new[]{"#8bc6d5","#f6e1a4","#759b8b","#2d5d51","#fff4c5"},
  new[]{"#a7d8dc","#f9e9ab","#789d8a","#2f6152","#fff7d2"}
 };
 static void CircleForest(string path,int level){
  var p=Palettes[level-1];
  using(var b=New(1200))using(var g=Draw(b))using(var clip=new GraphicsPath()){
   clip.AddEllipse(75,75,1050,1050);g.SetClip(clip);
   using(var sky=new LinearGradientBrush(new Point(0,75),new Point(0,820),C(p[0]),C(p[1])))g.FillEllipse(sky,75,75,1050,1050);
   using(var light=B(p[4],230))g.FillEllipse(light,825,218,85,85);
   if(level==1)using(var star=B("#f5edd5",200)){float[,] stars={{220,265},{395,183},{585,140},{745,360},{970,385},{545,290}};for(int i=0;i<stars.GetLength(0);i++)g.FillEllipse(star,stars[i,0],stars[i,1],5,5);}
   using(var far=B(p[2]))using(var near=B(p[3])){
    g.FillEllipse(far,-140,740,1500,600);
    float[,] trees={{140,1120,420},{275,1140,315},{420,1130,270},{770,1130,300},{930,1150,455},{1080,1120,570}};
    for(int i=0;i<trees.GetLength(0);i++)Pine(g,trees[i,0],trees[i,1],trees[i,2],far);
    float[,] front={{108,1220,620},{242,1245,420},{424,1300,330},{805,1290,365},{1000,1230,550},{1130,1240,700}};
    for(int i=0;i<front.GetLength(0);i++)Pine(g,front[i,0],front[i,1],front[i,2],near);
    g.FillEllipse(near,-200,1025,1600,500);
   }
   Save(b,path);
  }
 }
 static void RectOrnament(string path,int level){
  using(var b=New(1800))using(var g=Draw(b))using(var stem=P("#66764a",2+level*.35f))using(var leaf=B("#6f8054")){
   float h=130+level*194,top=1620-h;int count=level*3;
   foreach(int x in new[]{75,1125}){
    if(level>1)g.DrawBezier(stem,x,1620,x-25,1250,x+30,top+180,x,top);
    for(int i=0;i<count;i++){float y=1600-i*h/Math.Max(1,count-1);float r=6+level*2.5f;float side=i%2==0?1:-1;g.FillEllipse(leaf,x+side*5-r*.5f,y-r*.5f,r,r*1.7f);if(level>2)g.DrawLine(stem,x,y+8,x+side*r*.8f,y-r*.7f);}
    int flowers=Math.Max(0,level-2);
    for(int i=0;i<flowers;i++){float y=1540-i*(h-120)/Math.Max(1,flowers);Flower(g,x,y,8+level*2.1f);}
   }
   if(level>=6){using(var arch=P("#66764a",3)){g.DrawBezier(arch,75,160,330,100,870,100,1125,160);g.DrawBezier(arch,75,1640,330,1720,870,1720,1125,1640);}}
   Save(b,path);
  }
 }
 static void CircleOrnament(string path,int level){
  using(var b=New(1200))using(var g=Draw(b))using(var clip=new GraphicsPath())using(var stem=P("#66764a",2+level*.3f))using(var leaf=B("#6f8054")){
   clip.AddEllipse(20,20,1160,1160);g.SetClip(clip);
   float span=level*49,first=90-span/2,r=545;
   if(level>1)g.DrawArc(stem,600-r,600-r,r*2,r*2,first,span);
   int count=2+level*4;
   for(int i=0;i<count;i++){float deg=first+i*span/Math.Max(1,count-1);double a=deg*Math.PI/180;float x=600+(float)Math.Cos(a)*r,y=600+(float)Math.Sin(a)*r;float s=5+level*2.1f;var state=g.Save();g.TranslateTransform(x,y);g.RotateTransform(deg+90);g.FillEllipse(leaf,-s*.5f,-s*.8f,s,s*1.7f);g.Restore(state);}
   int n=Math.Max(0,level-2)*2;
   for(int i=0;i<n;i++){float deg=first+(i+.5f)*span/Math.Max(1,n);double a=deg*Math.PI/180;Flower(g,600+(float)Math.Cos(a)*r,600+(float)Math.Sin(a)*r,7+level*1.6f);}
   Save(b,path);
  }
 }
 static GraphicsPath SkyClip(bool circular){var clip=new GraphicsPath();if(circular){clip.AddEllipse(75,75,1050,1050);}else using(var r=Round(96,112,1008,1576,55))clip.AddPath(r,false);return clip;}
 static void Cloud(Graphics g,float x,float y,float s,Color color){using(var p=new GraphicsPath(FillMode.Winding))using(var brush=new SolidBrush(color)){p.AddEllipse(x,y,260*s,52*s);p.AddEllipse(x+45*s,y-30*s,95*s,80*s);p.AddEllipse(x+110*s,y-40*s,105*s,91*s);g.FillPath(brush,p);}}
 static void Bolt(Graphics g,float x,float y,float s){using(var glow=P("#f5dba1",9,110))using(var light=B("#fff1b8")){PointF[] p={new PointF(x+22*s,y),new PointF(x-30*s,y+75*s),new PointF(x+3*s,y+68*s),new PointF(x-14*s,y+165*s),new PointF(x+64*s,y+52*s),new PointF(x+24*s,y+59*s),new PointF(x+52*s,y)};glow.LineJoin=LineJoin.Round;g.DrawPolygon(glow,p);g.FillPolygon(light,p);}}
 static void Weather(string path,bool circular,int level){
  using(var b=New(circular?1200:1800))using(var g=Draw(b))using(var clip=SkyClip(circular)){
   g.SetClip(clip);g.SetClip(new Rectangle(0,0,1200,circular?465:620),CombineMode.Intersect);
   if(level==2){Cloud(g,circular?300:220,circular?250:330,.8f,C("#edf0e8",150));}
   else if(level==3){Cloud(g,circular?180:160,circular?225:300,1.1f,C("#edf0e8",175));Cloud(g,circular?720:720,circular?310:440,.9f,C("#edf0e8",175));Cloud(g,480,circular?155:210,.65f,C("#edf0e8",175));}
   else if(level==4){Cloud(g,95,circular?220:280,1.6f,C("#c7d0d1",235));Cloud(g,490,circular?195:250,1.4f,C("#c7d0d1",235));Cloud(g,740,circular?315:430,1.2f,C("#c7d0d1",235));Cloud(g,265,circular?360:510,1.35f,C("#c7d0d1",235));}
   else if(level>=5){
    float sy=circular?.72f:1;
    using(var cloud=new GraphicsPath(FillMode.Winding)){
     cloud.AddRectangle(new RectangleF(75,75,1050,170*sy));
     float[,] lobes={{50,170,310,205},{235,150,340,235},{455,175,345,235},{660,145,355,255},{875,175,300,205}};
     for(int i=0;i<lobes.GetLength(0);i++)cloud.AddEllipse(lobes[i,0],75+(lobes[i,1]-75)*sy,lobes[i,2],lobes[i,3]*sy);
     string top=level==5?"#526573":level==6?"#263848":"#172737";string bottom=level==5?"#829199":level==6?"#4b5868":"#334555";
     using(var bank=new LinearGradientBrush(new Point(0,75),new Point(0,circular?310:415),C(top),C(bottom)))g.FillPath(bank,cloud);
    }
    int rows=level==5?2:level==6?3:4,cols=level==5?12:level==6?15:22;
    using(var rain=P(level==7?"#b4d0df":"#95b4c2",level==7?4:3,level==7?240:195)){rain.StartCap=rain.EndCap=LineCap.Round;for(int r=0;r<rows;r++)for(int c=0;c<cols;c++){float x=150+c*(900f/(cols-1))+(r%2)*10;float y=(circular?295:405)+r*(circular?31:48)+(c%3)*6;g.DrawLine(rain,x,y,x-(level==7?18:13),y+(circular?26:35));}}
    if(level>=6){Bolt(g,325,circular?285:350,circular?.65f:1.1f);Bolt(g,875,circular?285:365,circular?.65f:1f);if(level==7){Bolt(g,610,circular?300:360,circular?.78f:1.3f);Bolt(g,460,circular?330:390,circular?.38f:.55f);}}
   }
   Save(b,path);
  }
 }
 static void Ink(string source,string target){using(var b=new Bitmap(source)){
  var area=new Rectangle(0,0,b.Width,b.Height);var data=b.LockBits(area,ImageLockMode.ReadWrite,PixelFormat.Format32bppArgb);
  try{int len=Math.Abs(data.Stride)*b.Height;byte[] bytes=new byte[len];Marshal.Copy(data.Scan0,bytes,0,len);for(int i=0;i<len;i+=4){if(bytes[i+3]==0)continue;double luminance=(bytes[i]*.0722+bytes[i+1]*.7152+bytes[i+2]*.2126)/255;double v=Math.Pow(luminance,.85);bytes[i]=(byte)Math.Round(24+(229-24)*v);bytes[i+1]=(byte)Math.Round(29+(238-29)*v);bytes[i+2]=(byte)Math.Round(28+(242-28)*v);}Marshal.Copy(bytes,0,data.Scan0,len);}finally{b.UnlockBits(data);}Save(b,target);
 }}
 static void Preview(string dir){using(var b=new Bitmap(400,600,PixelFormat.Format32bppArgb))using(var g=Draw(b)){
  g.InterpolationMode=InterpolationMode.HighQualityBicubic;
  foreach(string rel in new[]{"base.png","genetics/4.png","thc/3.png","cbd/4.png"})using(var img=Image.FromFile(Path.Combine(dir,"rectangular",rel)))g.DrawImage(img,0,0,400,600);
  Save(b,Path.Combine(dir,"preview.png"));
 }}
 public static void Generate(string root,string source){
  string wood=Path.Combine(root,"woodland"),ink=Path.Combine(root,"ink");
  foreach(string format in new[]{"rectangular","circular"}){
   bool circle=format=="circular";string dir=Path.Combine(wood,format);
   if(circle)Base(Path.Combine(dir,"base.png"),true);else{Directory.CreateDirectory(dir);File.Copy(Path.Combine(source,"base/label_base.png"),Path.Combine(dir,"base.png"),true);}
   int[] ids={0,17,33,50,67,83,100};
   for(int level=1;level<=7;level++){
    string forest=Path.Combine(dir,"genetics",level+".png");
    if(circle)CircleForest(forest,level);else{Directory.CreateDirectory(Path.GetDirectoryName(forest));File.Copy(Path.Combine(source,"genetics","forest_"+ids[level-1]+".png"),forest,true);}
    Weather(Path.Combine(dir,"thc",level+".png"),circle,level);
    if(circle)CircleOrnament(Path.Combine(dir,"cbd",level+".png"),level);else RectOrnament(Path.Combine(dir,"cbd",level+".png"),level);
   }
  }
  foreach(string path in Directory.GetFiles(wood,"*.png",SearchOption.AllDirectories)){if(Path.GetFileName(path)=="preview.png")continue;string relative=Path.GetRelativePath(wood,path);Ink(path,Path.Combine(ink,relative));}
  Preview(wood);Preview(ink);
 }
}
'@
}
[TexturePackArtwork]::Generate($packRoot,$sourceRoot)
# A third, independently composed landscape layout. These technical placeholder
# scenes are drawn directly on a 1800x1200 canvas; portrait PNGs are never stretched.
foreach($pack in @('woodland','ink')) {
  $root=Join-Path $packRoot $pack
  $layout=Join-Path $root 'layouts/wide-landscape'
  foreach($layer in @('genetics','thc','cbd')){[IO.Directory]::CreateDirectory((Join-Path $layout $layer))|Out-Null}
  $forest=if($pack -eq 'ink') {[Drawing.Color]::FromArgb(255,51,66,84)} else {[Drawing.Color]::FromArgb(255,53,91,65)}
  $sky=if($pack -eq 'ink') {[Drawing.Color]::FromArgb(255,34,46,67)} else {[Drawing.Color]::FromArgb(255,119,153,139)}
  $paper=if($pack -eq 'ink') {[Drawing.Color]::FromArgb(255,238,231,211)} else {[Drawing.Color]::FromArgb(255,239,228,200)}
  $base=New-Object Drawing.Bitmap(1800,1200)
  $g=[Drawing.Graphics]::FromImage($base);$g.SmoothingMode='AntiAlias'
  $g.Clear([Drawing.Color]::Transparent);$br=New-Object Drawing.SolidBrush($paper);$g.FillRectangle($br,0,0,1800,1200)
  $br.Dispose();$br=New-Object Drawing.SolidBrush($sky);$g.FillRectangle($br,0,0,1800,1200)
  $br.Dispose();$br=New-Object Drawing.SolidBrush([Drawing.Color]::FromArgb(255,193,173,126));$g.FillEllipse($br,1450,95,150,150)
  $br.Dispose();$br=New-Object Drawing.SolidBrush($forest);$pts=[Drawing.Point[]]@([Drawing.Point]::new(0,890),[Drawing.Point]::new(250,740),[Drawing.Point]::new(540,875),[Drawing.Point]::new(820,705),[Drawing.Point]::new(1120,870),[Drawing.Point]::new(1450,730),[Drawing.Point]::new(1800,870),[Drawing.Point]::new(1800,1200),[Drawing.Point]::new(0,1200));$g.FillPolygon($br,$pts)
  $g.Dispose();$br.Dispose();$base.Save((Join-Path $layout 'base.png'),[Drawing.Imaging.ImageFormat]::Png);$base.Dispose()
  for($i=1;$i -le 7;$i++){
    $rng=[Random]::new(901+$i);$im=New-Object Drawing.Bitmap(1800,1200);$g=[Drawing.Graphics]::FromImage($im);$g.SmoothingMode='AntiAlias';$g.Clear([Drawing.Color]::Transparent)
    $br=New-Object Drawing.SolidBrush([Drawing.Color]::FromArgb(255,[Math]::Max(20,$forest.R-$i*2),[Math]::Max(30,$forest.G-$i),[Math]::Max(20,$forest.B-$i*2)))
    for($t=0;$t -lt (10+$i*2);$t++){$x=$rng.Next(20,1780);$h=$rng.Next(130,280);$y=1120-$h;$w=$rng.Next(65,145);$poly=[Drawing.Point[]]@([Drawing.Point]::new($x,$y),[Drawing.Point]::new($x-$w,$y+$h),[Drawing.Point]::new($x+$w,$y+$h));$g.FillPolygon($br,$poly)}
    $g.Dispose();$br.Dispose();$im.Save((Join-Path $layout "genetics/$i.png"),[Drawing.Imaging.ImageFormat]::Png);$im.Dispose()
    $im=New-Object Drawing.Bitmap(1800,1200);$g=[Drawing.Graphics]::FromImage($im);$g.SmoothingMode='AntiAlias';$g.Clear([Drawing.Color]::Transparent)
    if($i -ge 2){$alpha=if($i -lt 5){90}else{170};$br=New-Object Drawing.SolidBrush([Drawing.Color]::FromArgb($alpha,223,230,226));for($c=0;$c -lt ($i-1);$c++){$g.FillEllipse($br,150+$c*300,120+($c%2)*55,260,105)};$br.Dispose()}
    if($i -ge 5){$pen=New-Object Drawing.Pen([Drawing.Color]::FromArgb(210,179,208,222),3);for($c=0;$c -lt ($i*4);$c++){$x=120+$rng.Next(1500);$y=280+$rng.Next(290);$g.DrawLine($pen,$x,$y,$x-14,$y+32)};$pen.Dispose()}
    $g.Dispose();$im.Save((Join-Path $layout "thc/$i.png"),[Drawing.Imaging.ImageFormat]::Png);$im.Dispose()
    $im=New-Object Drawing.Bitmap(1800,1200);$g=[Drawing.Graphics]::FromImage($im);$g.SmoothingMode='AntiAlias';$g.Clear([Drawing.Color]::Transparent);$leaf=New-Object Drawing.SolidBrush([Drawing.Color]::FromArgb(215,102,128,79))
    for($c=0;$c -lt ($i*3);$c++){$x=75+$c*($i%2+1)*22;$y=1140-($c*71%430);$g.FillEllipse($leaf,$x,$y,30+$i*2,12+$i)}
    $g.Dispose();$leaf.Dispose();$im.Save((Join-Path $layout "cbd/$i.png"),[Drawing.Imaging.ImageFormat]::Png);$im.Dispose()
  }
}
foreach($id in @('woodland','ink')) {
  $fontDir=Join-Path $packRoot "$id/fonts"
  [IO.Directory]::CreateDirectory($fontDir)|Out-Null
  Copy-Item -LiteralPath (Join-Path $sourceRoot 'fonts/label-serif.ttf') -Destination (Join-Path $fontDir 'label-serif.ttf') -Force
  Copy-Item -LiteralPath (Join-Path $sourceRoot 'fonts/OFL.txt') -Destination (Join-Path $fontDir 'OFL.txt') -Force
  [IO.File]::WriteAllText((Join-Path $packRoot "$id/ASSET-LICENSE.txt"),"Technical placeholder illustrations generated for label-generator. Reuse under CC0-1.0. Fonts retain their SIL Open Font License in fonts/OFL.txt. These are not final watercolor or ink illustrations.")
}
Write-Output 'Generated 66 PNGs per pack plus preview; woodland and ink, portrait, circular and landscape layouts.'
