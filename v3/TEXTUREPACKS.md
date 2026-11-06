# Eigene Texturepacks für Label Generator v3

Diese Anleitung beschreibt **compatibilityVersion 2**. Ein Texturepack besteht aus JSON, lokalen Schriften und PNG-Dateien. Es definiert die vollständige visuelle Komposition; Sortenname, Produzent und Messwerte bleiben unabhängig vom Design. Die Anwendung arbeitet vollständig im Browser und auf GitHub Pages.

## 1. Einführung und Architektur

Ein Pack enthält ein oder mehrere frei benannte Layouts. Jedes Layout besitzt eine native Canvas-Auflösung, vier verpflichtende Grafik-Kategorien (`base`, `genetics`, `thc`, `cbd`), eine optionale Bildebene `foreground` und die Kategorie `text` für Texte und Dekorationen. Der Renderer wählt genau ein Sprite pro dynamischer Kategorie aus und sortiert alle sichtbaren Elemente gemeinsam nach `zIndex`. Vorschau, PNG und PDF verwenden dieselbe Komposition.

Ein grafischer Texturepack-Editor ist noch nicht implementiert. Stabile Element-IDs, unabhängige Geometrie und die gemeinsame Renderliste ermöglichen dessen spätere Ergänzung. Manifeste enthalten ausschließlich Daten, keinen ausführbaren Code.

## 2. Verzeichnisstruktur

```text
mein-pack/
  pack.json
  ASSET-LICENSE.txt
  README.md
  fonts/
    lora/label-serif.ttf
    lora/OFL.txt
    abel/Abel-Regular.ttf
    abel/OFL.txt
  decorations/
    plaque.png
    ornament.png
  layouts/portrait/
    base.png
    genetics/1.png … 7.png
    thc/1.png … 7.png
    cbd/1.png … 7.png
```

Jedes weitere Layout benötigt eine eigene Basis und die in seinen drei Skalen referenzierten dynamischen PNGs. Die Standardbelegung nutzt 21 dynamische PNGs. Font- und Dekorationsdateien dürfen mehrere Layouts gemeinsam verwenden. Optional sind PNG-Vorschauen und Masken möglich.

## 3. Manifest-Schema

Die verbindliche maschinenlesbare Beschreibung steht in [schemas/texturepack.schema.json](schemas/texturepack.schema.json). Das [vollständige Beispielmanifest](examples/composition/pack.json) ist direkt verwendbar. Unbekannte Eigenschaften werden abgewiesen.

| Pack-Eigenschaft | Bedeutung |
| --- | --- |
| `id` | Eindeutig, Muster `^[a-z][a-z0-9-]{0,63}$` |
| `name`, `description`, `author` | Nicht leere Texte, höchstens 1000 Zeichen |
| `version` | Inhaltliche Version, z. B. `1.0.0` oder `1.1.0-preview` |
| `compatibilityVersion` | Genau `2` |
| `fonts` | 1–8 lokale Schriftfamilien mit eindeutigem `family`, `path`, optional `weight` |
| `layouts` | 1–16 Layouts mit eindeutigen IDs |
| `preview` | Optionaler packrelativer PNG-Pfad |
| `status` | Optional `placeholder` oder `illustrated` |
| `$schema` | Optionaler Hinweis für JSON-Editoren; wird nicht als Asset geladen |

Ein Katalogeintrag für statisch mitgelieferte Packs benötigt `id`, `name`, `version`, `manifest` und optional `preview`, `description`, `status`. Auch `texturepacks/catalog.json` trägt `compatibilityVersion: 2`. Für den ZIP-Import wird kein Katalogeintrag benötigt.

## 4. Eigene Layouts definieren

Jedes Layout benötigt `id`, `name`, `width`, `height`, `shape`, `layers`, `zIndex`, `typography`. Pixelabmessungen sind ganzzahlig von 64 bis 4096. `rectangle` erlaubt beliebige Seitenverhältnisse; `circle` benötigt gleiche Breite und Höhe. Ein Kreis wird beim Rendern beschnitten. Textgeometrie wird unabhängig von der Kontur berechnet: Platziere alle Elemente selbst innerhalb der sichtbaren Kontur.

`layers.base` ist ein PNG-Pfad. `layers.genetics`, `layers.thc`, `layers.cbd` sind unabhängig voneinander entweder Arrays mit sieben unterschiedlichen PNG-Pfaden (Standardgrenzen) oder Arrays mit 1–64 eigenen Stufenobjekten (`below`, `asset`, siehe Abschnitt 5). `zIndex` besitzt für jede vorhandene Bildebene einen ganzzahligen Wert: `base`, `genetics`, `thc`, `cbd` sowie `foreground`, wenn vorhanden.

Optionale Layoutfelder: `preview`, `bleedMm` (0–20, Empfehlung, setzt keinen Druckwert automatisch) und `masks`. Masken sind PNGs mit Canvas-Abmessungen; ihre Alpha-Werte begrenzen die jeweilige Kategorie, z. B. `"masks":{"thc":"layouts/portrait/sky-mask.png"}`. Auch `text` kann maskiert werden; dieselbe Maske gilt dann einzeln für alle Texte und Dekorationen.

Alle Positionen und Größen sind **native Canvas-Pixel**, keine Millimeter oder Prozentwerte. Die Druckbreite bestimmt die spätere physische Skalierung ohne Veränderung der Proportionen.

## 5. Dynamische Sprite-Layer und frei definierbare Skalen

Die Standardform mit sieben PNG-Pfaden verwendet weiterhin diese inklusiven Obergrenzen:

| Kategorie | Bedeutung | Inklusive Obergrenzen von Stufe 1 bis 7 |
| --- | --- | --- |
| `genetics` | Sativa-Anteil | 14, 29, 44, 59, 74, 89, 100 % |
| `thc` | THC | 5, 11, 17, 23, 29, 35, 40 % |
| `cbd` | CBD | 2, 5, 8, 11, 14, 17, 20 % |

In der Standardform gilt der erste passende obere Grenzwert. Beispiel: THC 23 → Stufe 4, THC 23,1 → Stufe 5. Bestehende Packs behalten ihre Zuordnung.

Für eigene Skalen stehen stattdessen Stufenobjekte direkt unter `layouts[].layers`:

```json
"layers": {
  "base": "base.png",
  "genetics": [
    { "below": 30, "asset": "genetics/indica.png" },
    { "below": 70, "asset": "genetics/hybrid.png" },
    { "asset": "genetics/sativa.png" }
  ],
  "thc": [
    { "below": 5, "asset": "thc/a.png" },
    { "below": 10, "asset": "thc/b.png" },
    { "below": 20, "asset": "thc/c.png" },
    { "asset": "thc/d.png" }
  ],
  "cbd": [
    { "below": 2, "asset": "cbd/low.png" },
    { "asset": "cbd/high.png" }
  ]
}
```

`below` ist eine **exklusive Obergrenze**: THC 4,99 verwendet `a.png`, exakt 5 verwendet `b.png`, exakt 10 verwendet `c.png` und ab 20 gilt `d.png`. Der letzte Eintrag muss `below` weglassen und deckt den verbleibenden Bereich einschließlich des Maximalwerts ab. Alle vorherigen Einträge benötigen streng aufsteigende, positive `below`-Werte innerhalb des Eingabebereichs. THC reicht von 0 bis 40 %, CBD von 0 bis 20 %, Genetik von 0 bis 100 % **Sativa**; Indica ist immer `100 − Sativa`. 0 % Sativa entspricht reinem Indica, 100 % reinem Sativa. Dezimalgrenzen sind erlaubt.

Jede Skala besitzt unabhängig 1–64 Stufen, auch je Layout unterschiedlich. Ein einzelner Eintrag `{ "asset": "constant.png" }` gilt für den gesamten Bereich. Standard-Pfadarrays und eigene Skalen dürfen zwischen Kategorien gemischt werden; innerhalb einer Kategorie muss die Schreibweise einheitlich sein. PNG-Pfade innerhalb einer Skala müssen unterschiedlich sein. ZIP-Datei- und Pixelbudgets gelten weiterhin und können die praktisch verwendbare Stufenzahl begrenzen. Fehlende Schlussstufen, doppelte/unsortierte Grenzen und unsichere Asset-Pfade werden abgewiesen.

Es gibt keine Überblendung; je Kategorie wird genau ein Sprite gewählt. Jeder Layer hat die volle Canvas-Größe und denselben Ursprung, auch wenn nur wenige Pixel bemalt sind. Für 0 % kann die erste THC-/CBD-Stufe vollständig transparent sein.

Gestaltungsvorschlag der Wald-Packs: Genetik wandelt die Tageszeit von Nacht zu Morgen, THC steigert das Wetter von klarem Himmel bis Gewitter, CBD steigert botanische Ornamente von wenigen Blättern bis zum dichten Rahmen. Andere Motive sind erlaubt, solange die gewählten Stufen erkennbar und sauber übereinanderlegbar bleiben.

### 5.1 Landschaft und Vordergrund trennen

Die optionale Bildebene `layers.foreground` trennt beispielsweise seitliche Bäume von Himmel und Bergen. Die hintere Landschaft liegt in `genetics`, Wolken in `thc`, die Bäume in `foreground`:

```json
"layers": {
  "base": "base.png",
  "genetics": [{ "asset": "background/mountains.png" }],
  "thc": [{ "below": 10, "asset": "weather/clear.png" }, { "asset": "weather/clouds.png" }],
  "cbd": [{ "asset": "ornaments.png" }],
  "foreground": "foreground/trees.png"
},
"zIndex": { "base": 0, "genetics": 100, "thc": 200, "foreground": 250, "cbd": 300 }
```

`foreground` darf ein einzelner PNG-Pfad, ein Array mit sieben PNG-Pfaden (Standard-Genetikgrenzen) oder eine eigene Skala mit 1–64 `below`/`asset`-Objekten sein. Dynamische Vordergründe verwenden den Sativa-Anteil und dürfen unabhängig von den Hintergrundstufen abgestuft werden. Für abgestimmte Tageszeiten dieselben Grenzen für `genetics` und `foreground` wählen. Layer und `zIndex.foreground` müssen gemeinsam angegeben werden. Optional ist `masks.foreground`.

Der Vordergrund besitzt volle Canvas-Abmessungen, unveränderte Objektpositionen und echte Transparenz im Himmel und zwischen Ästen. Die hintere Landschaft muss die zuvor verdeckten Bereiche ausmalen; sie darf keine Kopie derselben großen Vordergrundbäume enthalten. Die Ebenenliste erlaubt unabhängig vom Text Ein-/Ausblenden und Verschieben. PNG und PDF übernehmen die gewählte Zeichenreihenfolge.

## 6. Eigene Schriftarten

```json
"fonts": [
  {"family":"Lora","path":"fonts/lora/label-serif.ttf","weight":"400 700"},
  {"family":"Abel","path":"fonts/abel/Abel-Regular.ttf","weight":"400"}
]
```

Unterstützt werden TTF, OTF, WOFF und WOFF2. Jedes Feld verweist über `font` auf genau eine registrierte Familie. Mehrere Familien werden vor der Textvermessung geladen. Die internen Browsernamen enthalten Pack-Identität, Version und Datei; gleich benannte Familien verschiedener Packs überschreiben sich nicht. Ein fehlender oder defekter Font ist ein verständlicher Ladefehler.

`weight` ist eine Zeichenfolge wie `400` oder `400 700`; ohne Angabe gilt `400 700`. Verwende den tatsächlich von der Datei unterstützten Bereich. `fontWeight` am Textfeld ist eine Ganzzahl von 100 bis 900. Andere Gewichte können vom Browser synthetisiert werden. Behalte die vollständige Lizenz jeder Schrift bei, möglichst unter `fonts/<familie>/OFL.txt`.

## 7. Textfelder konfigurieren

`typography` benötigt die Arrays `fields` und `decorations`; beide dürfen leer sein. Insgesamt sind höchstens 128 Elemente pro Layout erlaubt, einschließlich eingebetteter Hintergründe. IDs müssen innerhalb des Layouts über Texte, Hintergründe und Dekorationen eindeutig sein. `base`, `genetics`, `thc`, `cbd`, `text` sind reserviert; `foreground` ist bei vorhandener Vordergrundebene ebenfalls reserviert.

```json
{
  "id":"strain-name", "source":"name", "font":"Lora",
  "x":256, "y":330, "fontSize":38, "minFontSize":16,
  "maxFontSize":38, "fontWeight":600, "color":"#253e32",
  "align":"center", "verticalAlign":"middle",
  "maxWidth":420, "maxHeight":120, "maxLines":2,
  "wrap":true, "lineHeight":1.15, "letterSpacing":0,
  "rotation":-4, "opacity":1, "zIndex":500
}
```

Pflichtfelder sind `id`, `source`, `font`, `fontSize`, `color`, `zIndex` und entweder `x`/`y` oder `path`. Quellen: `name`, `producer`, `year`, `thc`, `cbd`, `indica`, `sativa`, `static`. `static` benötigt zusätzlich `text`. Dieselbe Quelle darf beliebig oft innerhalb des Elementlimits vorkommen. Leere optionale Werte zeichnen keinen Text; Präfix und Suffix entfallen ebenfalls.

| Eigenschaft | Verhalten und Standard |
| --- | --- |
| `fontSize` | Anfangsgröße, 8–512 px |
| `minFontSize` | Untergrenze; ohne Angabe kein Verkleinern |
| `maxFontSize` | Optionale Obergrenze, mindestens `fontSize`; Text wird nicht über die Anfangsgröße vergrößert |
| `fontWeight` | Standard 400 |
| `align` | `left`, `center` (Standard), `right`; x ist der entsprechende Textanker |
| `verticalAlign` | `top`, `middle` (Standard), `bottom`; y ist Oberkante, Mittelpunkt oder Unterkante des Zeilenblocks |
| `maxWidth` | 1–8192 px; Standard 8192 bei geradem Text |
| `maxHeight` | Optional 1–8192 px; begrenzt die nominale Zeilenblockhöhe |
| `maxLines` | 1–16, Standard 1 |
| `wrap` | Standard true; Wörter und überlange Wörter werden umgebrochen; false lässt nur explizite Zeilenumbrüche zu |
| `lineHeight` | Multiplikator der Schriftgröße, 0,5–3, Standard 1,2 |
| `letterSpacing` | Zusätzlicher Abstand in Pixeln, −20 bis 100, Standard 0 |
| `rotation` | Grad, −360 bis 360, Standard 0 |
| `opacity` | 0–1, Standard 1 |
| `shadow` | Optional `{ "color":"#000000", "blur":8, "offsetX":2, "offsetY":3 }` |

Nominale Blockhöhe: Schriftgröße plus `(Zeilenanzahl − 1) × Schriftgröße × lineHeight`. Glyphen können entsprechend den Fontmetriken darüber hinausragen. Der Renderer verkleinert in Pixelschritten bis zur Untergrenze. Passt der Inhalt weiterhin nicht, erscheint ein kontrollierter Fehler mit der Feld-ID; Text wird nicht still abgeschnitten. Stelle genug Platz für lange Namen und Produzenten bereit.

Werteformatierung ist zentral und erlaubt nur:

| `format` | Beispiel |
| --- | --- |
| `raw` (Standard) | unveränderter Wert |
| `percent` | THC 24.5 → `24,5 %`, höchstens zwei Nachkommastellen; nur THC, CBD, Indica, Sativa |
| `year-full` | Jahr 2026 → `2026`; nur `year` |
| `year-short` | Jahr 2026 → `26`; nur `year` |

`prefix` und `suffix` sind einfache Texte mit je höchstens 200 Zeichen. Beispiel `source: "thc", format: "percent", prefix: "THC: "` ergibt `THC: 24,5 %`; `source: "sativa", format: "percent", suffix: " Sativa"` ergibt `80 % Sativa`. Apostrophe bei Jahreszahlen müssen als Präfix eingetragen werden. HTML bleibt wörtlicher Text, Formeln und JavaScript-Ausdrücke werden nicht ausgewertet.

## 8. Text-Hintergründe als PNG-Sprites oder Flächen

Ein Feld darf `background` mit einer vollständigen Dekoration enthalten. Es benötigt eine eigene ID und einen eigenen `zIndex`; `relativeTo` muss auf dieses Feld zeigen. Dieselben Dekorationen können auch frei in `typography.decorations` stehen.

```json
"background": {
  "id":"name-plaque", "type":"sprite",
  "asset":"decorations/plaque.png", "relativeTo":"strain-name",
  "x":0, "y":0, "width":450, "height":110,
  "anchorX":0.5, "anchorY":0.5, "scale":1,
  "rotation":0, "opacity":1, "zIndex":450
}
```

`width`/`height` bestimmen die Zielgröße; die PNG-Datei selbst darf eine andere Größe besitzen. `anchorX`/`anchorY` sind Bruchteile von 0 bis 1 (Standard 0,5): 0/0 verankert die linke obere Ecke. `scale` ist ein zusätzlicher gleichmäßiger Faktor von 0,01 bis 8, Standard 1. Einzelne skalierte Abmessungen dürfen 16384 nicht überschreiten. PNGs können florale Plaketten, HUD-Panels oder unregelmäßige Papierflächen enthalten.

Geometrische Hintergründe verwenden `type: "rect"` und `color` statt `asset`:

```json
{
  "id":"readability-panel", "type":"rect", "relativeTo":"strain-name",
  "x":0, "y":0, "width":420, "height":100,
  "padding":12, "radius":16, "color":"rgba(255,255,255,0.85)",
  "border":{"color":"#ad8c41","width":2},
  "shadow":{"color":"rgba(0,0,0,0.2)","blur":8,"offsetY":4},
  "zIndex":440
}
```

`padding` erweitert die feste Fläche gleichmäßig auf allen Seiten, ohne den Anker zu verschieben. Es wird nicht automatisch an Textmaße angepasst. `radius` wird auf die halbe tatsächliche Kantenlänge begrenzt. Rahmen und Schatten sind optional. Farben sind Hex, numerische rgb(a)/hsl(a), `black`, `white`, `transparent`. Transparenz ergibt sich aus Farbe und `opacity`. Sprite-Hintergründe akzeptieren keine Flächenfarbe, Radius, Padding oder Rahmen.

## 9. Dekorative Sprites

In `typography.decorations` sind PNG-Sprites und geometrische Flächen auch ohne Feldbindung erlaubt. Ohne `relativeTo` beziehen sich x/y auf das Canvas. Mit `relativeTo` werden x/y als lokaler Versatz im gedrehten Koordinatensystem des Textfelds behandelt; Position und Rotation des Felds werden übernommen, die eigene Rotation wird addiert. Bei Bogentext ist der Bezugspunkt dessen Kreismittelpunkt.

Referenzen dürfen ausschließlich auf Textfelder zeigen. Texte können selbst keine `relativeTo`-Referenz besitzen. Dadurch sind Ketten und Zyklen ausgeschlossen; fehlende Referenzen und Referenzen auf andere Dekorationen werden abgewiesen. Eine Dekoration übernimmt weder Schriftgröße noch Textlänge oder Textdeckkraft.

## 10. zIndex und Zeichenreihenfolge

**Jeder Layer und jedes Element hat einen expliziten ganzzahligen zIndex von −10000 bis 10000.** Aufsteigend zeichnen, höhere Werte liegen darüber. Typische Werte:

| Element | zIndex |
| --- | --- |
| Basis | 0 |
| Genetik | 100 |
| THC | 200 |
| CBD | 300 |
| Leseflächen | 400 |
| Textplakette | 450 |
| Texte | 500 |
| Vordergrundornament | 600 |

Diese Werte sind Konventionen und keine Beschränkung. Ein Text mit zIndex 50 liegt zwischen Basis und Genetik. Auch negative Werte sind erlaubt.

Bei gleichem zIndex gilt deterministisch folgende Einfügereihenfolge: zuerst `base`, `genetics`, `thc`, `cbd`, dann gegebenenfalls `foreground`; danach eingebettete `background`-Elemente in Feldreihenfolge; danach `decorations` in Arrayreihenfolge; zuletzt `fields` in Arrayreihenfolge. Später eingefügte Elemente liegen darüber. IDs beeinflussen die Sortierung nicht. Für eine bewusst unterschiedliche Zeichenreihenfolge sind verschiedene zIndex-Werte leichter verständlich.

Die bisherigen drei Packs wurden vollständig umgestellt. Die ehemaligen Textkategorien bleiben als Sichtbarkeitsschalter erhalten; `text: false` blendet Texte und Dekorationen aus. Intern können Elemente zusätzlich anhand ihrer ID ausgeblendet werden.

## 11. Textrotation und Kreisbögen

Gerader Text rotiert um seinen x/y-Anker mittels `save`, `translate`, `rotate`, `restore`. Positive Winkel drehen im sichtbaren Canvas im Uhrzeigersinn. Flächen und Sprites verwenden dieselbe Konvention.

```json
{
  "id":"round-title", "source":"name", "font":"Lora",
  "path":{"type":"arc","centerX":256,"centerY":256,"radius":205,
    "startAngle":-150,"endAngle":-30,"direction":"clockwise"},
  "fontSize":22,"minFontSize":12,"letterSpacing":1,
  "color":"#735c31","zIndex":500
}
```

Winkel werden in Grad angegeben: 0° rechts (+X), 90° unten (+Y), −90° oben. `clockwise` liest vom Start zum Ende mit zunehmendem Winkel, `counterclockwise` mit abnehmendem Winkel, jeweils modulo 360. Gleiche Start-/Endwinkel bedeuten einen vollen Kreis. Zeichen stehen tangential; gegen den Uhrzeigersinn wird auch die Tangentendrehung umgekehrt. Der Leser folgt der angegebenen Bahnrichtung; der Renderer dreht Buchstaben nicht automatisch aufrecht.

`align` verteilt den Text am Start (`left`), mittig (`center`) oder am Ende (`right`) der Bahn. Tatsächliche einzeln vermessene Zeichenbreiten und `letterSpacing` bestimmen die Abstände. `verticalAlign` legt die Glyphenbaseline auf die Bahn (`top`, `middle`, `bottom`). `rotation` dreht die gesamte Bahn zusätzlich um ihren Mittelpunkt.

Bogentext hat genau eine Zeile; Zeilenumbrüche im formatierten Text werden kontrolliert abgewiesen. Verwende keine x/y, `maxWidth`, `maxLines > 1` oder `wrap: true`. Die verfügbare Breite ist Radius × Bogenwinkel in Radiant. Zu langer Inhalt wird bis `minFontSize` verkleinert und dann kontrolliert abgewiesen. Für komplexe verbundene Schriftsysteme ist gerader Text geeigneter, da Bögen einzelne Unicode-Codepunkte zeichnen.

## 12. PNG-Anforderungen und Transparenz

Alle PNGs benötigen **8 Bit RGBA** (PNG-Farbtyp 6), maximal 4096 × 4096 Pixel. RGB-, Palette-, 16-Bit- und animierte PNGs werden beim ZIP-Import abgewiesen. Layer und Masken besitzen genau die Canvas-Abmessungen; Dekorationen und Vorschauen dürfen kleiner sein.

Erhalte echte Alpha-Transparenz. Ein weißes Rechteck oder Schachbrett ist kein transparenter Hintergrund. Zeichne keine dynamischen Zahlen oder Sortennamen in Sprite-Dateien. Lass die vorgesehenen Textflächen frei. Für Rundlayouts empfiehlt sich eine eigene Komposition statt eines Zuschnitts vom Hochformat.

## 13. Asset-Pfade und Sicherheit

Alle Assets sind relativ zur `pack.json`. Erlaubt sind ASCII-Buchstaben, Ziffern, Unterstriche, Bindestriche, Punkte innerhalb eines Dateinamens und `/` als Trenner. Verboten sind absolute Pfade, Netzwerk-URLs, `..`- oder `.`-Segmente, Backslashes, Prozentkodierung, Leerzeichen, Query-Strings und Fragmente.

Manifestwerte sind begrenzt: Positionen ±8192, Rotation ±360°, Deckkraft 0–1, Schriftgrößen 8–512, Schattenunschärfe 0–100, Schattenversatz ±200. Das JSON Schema nennt alle Bereiche. Zusätzliche semantische Prüfungen kontrollieren eindeutige IDs, registrierte Familien, Größenbeziehungen, Kreisgeometrie, die Gesamtzahl der Elemente und Referenzen. JSON Schema allein kann diese layoutübergreifenden Beziehungen nicht vollständig ausdrücken; der Packvalidator muss ebenfalls laufen.

## 14. Texturepack-Versionierung

`compatibilityVersion: 2` bezeichnet diese Spezifikation; `version` bezeichnet den eigenen Packinhalt. Erhöhe `version` bei veröffentlichten Änderungen an Manifest oder Dateien. Alte Packs mit Kompatibilitätsversion 1 werden beim Import und beim Laden aus IndexedDB mit Aktualisierungshinweis abgewiesen. Es gibt keine automatische Migration fremder Packs.

Ein Warenkorb mit einem inkompatiblen Pack bleibt erhalten. Betroffene Vorschaubilder und Druckbögen zeigen einen kontrollierten Fehler; andere Etiketten lassen sich weiterhin konfigurieren. Aktualisiere das Pack und lege den Eintrag bei Bedarf neu an. v1 und v2 der Anwendung sind unabhängig und bleiben unverändert.

## 15. ZIP-Import und Export

Packe den Inhalt des Packverzeichnisses als ZIP, mit `pack.json` direkt an der Wurzel. Ein einzelner umschließender Ordner ist ebenfalls erlaubt. Öffne v3 unter HTTPS oder localhost und verwende den ZIP-Import in der Texturepack-Verwaltung. Der Import prüft Manifest, erforderliche Dateien, PNG-Köpfe und Prüfsummen, Größen und Fonts; anschließend dekodiert und rendert der Browser jedes Layout, bevor atomar gespeichert wird.

Limits: ZIP 160 MiB, entpackt 192 MiB, höchstens 256 Einträge, pro Datei 16 MiB, Manifest 256 KiB und insgesamt 160 × 1024 × 1024 PNG-Pixel. Keine Symlinks, verschlüsselten Archive oder ZIP64. Lizenzen und Hinweise als `.txt`/`.md` sind erlaubt und bleiben bei Import und Reexport erhalten.

Packs werden lokal in IndexedDB gespeichert. Ein identischer Reimport ist ein No-op; anderer Inhalt unter derselben ID und Version wird abgewiesen. Mitgelieferte ID-/Versionspaare sind geschützt. Der ZIP-Export dient als Sicherung und Vorlage. Behalte Fonts samt Lizenzen unter getrennten Familienordnern mit `OFL.txt`, damit auch beim Export mitgelieferter Packs die Lizenzen gefunden werden.

## 16. Fehlerbehebung

| Meldung oder Symptom | Abhilfe |
| --- | --- |
| Inkompatibles Texturepack | Manifest und sämtliche Typografie auf diese Spezifikation aktualisieren, nicht nur die Versionszahl ändern |
| Textfeld ist zu klein | Breite/Zeilenanzahl vergrößern, Mindestgröße senken oder Inhalt kürzen |
| Schrift nicht registriert | `font` muss exakt einer Familie in `fonts` entsprechen |
| PNG-Abmessungen falsch | Layer/Masken in voller nativer Canvas-Größe exportieren |
| Sprite verdeckt Text | Eigene zIndex-Werte prüfen; Transparenz im PNG erhalten |
| Ungültige Referenz | `relativeTo` muss eine Textfeld-ID desselben Layouts sein |
| Unbekannte Eigenschaft | Schreibweise im Schema prüfen; Eigenschaften älterer Spezifikationen entfernen |
| Pack-ID und Version bereits installiert | Inhaltsversion erhöhen oder eigene ID wählen |
| Export/Import unter file:// scheitert | Statischen Server oder GitHub Pages verwenden |

## 17. Vollständiges Beispieltexturepack und Vorlage

[Composition Demo](examples/composition/README.md) ist ein vollständiges, importierbares Pack mit zwei Familien, Hochformat und Rund, unabhängigen Feldern, Sprite-Plakette, Vordergrundornament, Rotation und Bogentext. [pack.json](examples/composition/pack.json) und alle referenzierten Dateien sind enthalten.

Die [kleine Vorlage](examples/template/README.md) besitzt ein 128 × 192-Layout, eine Schrift, ein Feld und 22 kleine PNGs. Kopiere das Verzeichnis, ändere ID/Metadaten, gestalte die PNGs und erweitere die Felder. Die Vorlage ist bereits gültig; sie enthält keine fehlenden Platzhalterdateien.

Beispiel-PNGs sind CC0-1.0; Lora und Abel stehen unter SIL OFL 1.1. Die genauen Copyrightvermerke liegen bei den Fonts. [Abels Original-Lizenz](https://github.com/google/fonts/blob/main/ofl/abel/OFL.txt) erlaubt die Weitergabe unter ihren Bedingungen. Bestehende Waldillustrationen werden bei der Migration wiederverwendet; sie wurden nicht neu erzeugt.

## 18. Testen und Validieren

Ab Repositorywurzel:

```sh
node v3/scripts/validate-pack.js v3/examples/composition
npm --prefix v3 test
npm --prefix v3 run check
npm --prefix v3 start
```

In einem zweiten Terminal bei laufendem Server:

```sh
npm --prefix v3 run test:browser
```

Die CLI prüft das Manifest und den ZIP-Roundtrip einschließlich Assets, PNGs und Fontköpfen und kann mit `--zip ausgabe.zip` ein importierbares Archiv erstellen. Im Browser zusätzlich lange Sortennamen, leere Produzenten, Grenzwerte aller definierten Stufen, jedes Layout, Vorder-/Hintergrundüberlagerungen und kleinen Druckmaßstab testen. Exportiere PNG und PDF und vergleiche mit der Vorschau.

`src/manifest-schema.js` ist die Schemaquelle. Nach Änderungen `node v3/scripts/write-schema.js` ausführen; ein Test stellt sicher, dass die veröffentlichte JSON-Datei exakt dem Runtime-Schema entspricht. Die normale Anwendung benötigt weder Schema-Downloads noch einen Build-Schritt.
