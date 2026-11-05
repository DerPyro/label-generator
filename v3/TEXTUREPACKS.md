# Texturepack-Format, Kompatibilitätsversion 1

Texturepacks definieren Dateien und Textgeometrie. Die bestehende Canvas-Engine lädt diese Daten und zeichnet dieselben fünf Ebenen für alle Designs. Ein Pack erzeugt während des Renderns keine neuen Illustrationen. Alle Dateien werden lokal mit der statischen Website ausgeliefert; ein externes Konto oder ein CDN ist nicht erforderlich.

**Watercolor Forest** ist das erste illustrierte Pack mit KI-generierten Waldlandschaften, Wetter und botanischer Ornamentik in traditioneller Aquarelloptik. Die Grafiken sind keine menschlich gemalten Originalaquarelle. Die enthaltenen Packs **Woodland Study** und **Ink Study** bleiben technische Platzhalter. Die runden Kompositionen besitzen eigene Grafiken und Textpositionen; sie sind keine kreisförmig abgeschnittenen rechteckigen Illustrationen.

## Layouts und Dateien

```text
texturepacks/
  catalog.json
  woodland/
    pack.json
    preview.png
    fonts/label-serif.ttf
    fonts/OFL.txt
    rectangular/
      base.png
      genetics/1.png … 7.png
      thc/1.png … 7.png
      cbd/1.png … 7.png
    circular/
      base.png
      genetics/1.png … 7.png
      thc/1.png … 7.png
      cbd/1.png … 7.png
    layouts/wide-landscape/
      base.png
      genetics/1.png … 7.png
      thc/1.png … 7.png
      cbd/1.png … 7.png
```

Layouts sind frei definierte Manifest-Einträge und nicht auf eine feste Zahl oder Seitenverhältnisse beschränkt. Alle drei mitgelieferten Packs bieten Hochformat, Rund und Querformat mit jeweils eigener Canvas-Geometrie und eigenständiger Komposition. Jedes Layout enthält eine Basis und 21 dynamische Sprites (je sieben für Genetik, THC und CBD), also 66 Layer-PNGs je Pack und 198 über alle drei Packs. Preview, Masken und Schriften zählen zusätzlich. Die mitgelieferten Lora-Schriften stehen unter SIL OFL; die Lizenz muss beim Verteilen erhalten bleiben.

Watercolor Forest verwendet `classic-portrait` (1024 × 1536 px), `wide-landscape` (1536 × 1024 px) und `round-lid` (1254 × 1254 px), jeweils unter `layouts/<layout-id>/`. Die unterschiedlichen nativen Auflösungen werden direkt aus den Manifesten gelesen und nicht auf ein packübergreifendes Raster verzerrt. [Pack-Dokumentation und Herkunft](texturepacks/watercolor-forest/README.md).

## Katalog und Versionen

`catalog.json` enthält `compatibilityVersion: 1` und ein `packs`-Array. Jeder Eintrag benötigt `id`, `name`, `version` und einen relativen `manifest`-Pfad, beispielsweise `woodland/pack.json`. `description`, `status` und `preview` ergänzen die Pack-Auswahl.

```json
{
  "compatibilityVersion": 1,
  "packs": [{
    "id": "woodland",
    "name": "Woodland Study",
    "version": "1.0.0",
    "status": "placeholder",
    "manifest": "woodland/pack.json",
    "preview": "woodland/preview.png"
  }]
}
```

Der Warenkorb speichert Pack-ID und Version. Ist eine gespeicherte Version nicht mehr installiert, wird ein kontrollierter Fehler angezeigt; der Renderer ersetzt sie nicht unbemerkt durch andere Assets. Mitgelieferte Packs werden aus dem statischen Katalog gelesen. Importierte Packs werden pro ID und Version lokal in IndexedDB gespeichert; mehrere Versionen derselben ID können parallel installiert sein. Unterschiedlicher Inhalt unter bereits installierter ID/Version wird abgewiesen, daher bei geändertem Inhalt die Version erhöhen. Ein bytegleicher Reimport ist ein No-op. Die Pack-Version archiviert keine entfernten Dateien automatisch.

## Manifest

Die vollständigen `pack.json` der drei Packs im Repository sind ausführbare Beispiele. Folgende Felder werden validiert:

| Feld | Inhalt |
| --- | --- |
| `id` | Eindeutige ID aus Kleinbuchstaben, Ziffern und Bindestrichen, beginnend mit einem Buchstaben |
| `name`, `description`, `author` | Nicht leere Texte |
| `version` | Versionsnummer wie `1.0.0` oder `1.0.0-preview` |
| `compatibilityVersion` | Exakt `1` |
| `status` | Optional `placeholder` oder `illustrated` |
| `preview` | Optionaler packrelativer PNG-Pfad |
| `fonts` | Mindestens eine lokale Schrift, jeweils `family`, `path`, optional `weight`, etwa `400 700` |
| `layerOrder` | `base`, `genetics`, `thc`, `cbd`, `text` jeweils genau einmal in gewünschter Reihenfolge |
| `layouts` | Nicht leeres Array aus benannten Layouts mit eindeutiger `id` und den unten beschriebenen Geometrie-, Layer- und Typografiefeldern |

Jedes Layout enthält:

- Ganzzahlige `width` und `height` zwischen 64 und 4096 Pixeln.
- `shape: "rectangle"` beziehungsweise `"circle"`; ein Kreis benötigt ein quadratisches Canvas.
- `layers.base` als PNG-Pfad und `layers.genetics`, `layers.thc`, `layers.cbd` als Arrays mit **exakt sieben verschiedenen PNG-Pfaden**, in Reihenfolge von Stufe 1 bis 7.
- `typography` mit Schriftfamilie, Farben, Textflächen und festen Textpositionen.
- `id` (eindeutige Layout-ID) und `name` (Anzeigename); optionale `preview`-Pfade bleiben packrelativ.
- Optional `bleedMm` als empfohlene Beschnittzugabe für dieses Layout (0–20 mm). Die Empfehlung setzt den globalen Druckwert nicht automatisch.
- Optional eine eigene `layerOrder`, die die globale Reihenfolge ersetzt.
- Optional `masks`, ein Objekt mit Ebenen-ID und PNG-Pfad, zum Beispiel `{"thc":"circular/sky-mask.png"}`. Weiß beziehungsweise jeder andere sichtbare Farbwert erhält Pixel gemäß Maskenalpha; transparente Pixel entfernen sie. Masken werden nicht als zusätzliche sichtbare Ebene gezeichnet.

Alle Asset-Pfade beziehen sich auf das Verzeichnis des Manifests. Absolute Pfade, URLs, `..`, Backslashes, Prozentkodierung und Query-Strings sind unzulässig. Dadurch bleiben Packs auch unter einem GitHub-Pages-Projektpfad wie `/label-generator/v3/` funktionsfähig. Schriften dürfen TTF, OTF, WOFF oder WOFF2 sein; Sprites und Masken benötigen PNG.

## Textlayout

`typography.family` verweist auf eine registrierte Schriftfamilie. Schriftdateien werden vor dem Vermessen geladen. Der Renderer verwendet pro Pack und Font-Datei einen eigenen internen Familiennamen, damit ein Pack-Wechsel keine vorherigen Schriftdefinitionen überschreibt.

```json
{
  "family": "LabelSerif",
  "ink": "#21382d",
  "panel": "rgba(249, 241, 218, 0.94)",
  "panels": [{"x":140,"y":625,"width":920,"height":420,"radius":48}],
  "name": {"centerX":600,"centerY":760,"maxWidth":840,"maxLines":3,"maxSize":76,"minSize":30,"lineHeight":1.14},
  "producer": {"x":600,"y":925,"maxWidth":800,"maxSize":34,"minSize":16},
  "year": {"x":600,"y":990,"size":46},
  "footer": {"x":600,"y":1460,"gap":58,"size":38,"maxWidth":880}
}
```

Koordinaten sind native Canvas-Pixel. `panels` dürfen auch leer sein. Namen werden umgebrochen und bei Bedarf verkleinert; lange einzelne Wörter werden geteilt. Produzenten sind optional und werden in ihrer Zeile angepasst. Schrift, halbtransparente Leseflächen und Prozentwerte stehen ausschließlich im dynamischen Text-Layer.

### Eigenes Layout ergänzen

Füge in `layouts` einen Eintrag ein. `id` muss innerhalb des Packs eindeutig sein; beliebige IDs und Namen wie `long-label` / `Langes Etikett` sind möglich. Beispiel für ein zusätzliches Rechteck-Layout (die Typografie kann aus einem vorhandenen Layout übernommen und an die neue Canvas-Größe angepasst werden):

```json
{
  "id": "long-label",
  "name": "Langes Etikett",
  "width": 900,
  "height": 1800,
  "shape": "rectangle",
  "layers": {
    "base": "layouts/long-label/base.png",
    "genetics": ["layouts/long-label/genetics/1.png", "layouts/long-label/genetics/2.png", "layouts/long-label/genetics/3.png", "layouts/long-label/genetics/4.png", "layouts/long-label/genetics/5.png", "layouts/long-label/genetics/6.png", "layouts/long-label/genetics/7.png"],
    "thc": ["layouts/long-label/thc/1.png", "layouts/long-label/thc/2.png", "layouts/long-label/thc/3.png", "layouts/long-label/thc/4.png", "layouts/long-label/thc/5.png", "layouts/long-label/thc/6.png", "layouts/long-label/thc/7.png"],
    "cbd": ["layouts/long-label/cbd/1.png", "layouts/long-label/cbd/2.png", "layouts/long-label/cbd/3.png", "layouts/long-label/cbd/4.png", "layouts/long-label/cbd/5.png", "layouts/long-label/cbd/6.png", "layouts/long-label/cbd/7.png"]
  },
  "typography": {
    "family": "LabelSerif", "ink": "#21382d", "panel": "rgba(249, 241, 218, 0.94)",
    "panels": [],
    "name": {"centerX": 450, "centerY": 700, "maxWidth": 720, "maxLines": 3, "maxSize": 68, "minSize": 28, "lineHeight": 1.13},
    "producer": {"x": 450, "y": 850, "maxWidth": 700, "maxSize": 32, "minSize": 16},
    "year": {"x": 450, "y": 910, "size": 40},
    "footer": {"x": 450, "y": 1500, "gap": 50, "size": 32, "maxWidth": 760}
  }
}
```

Neue Rechteck-Seitenverhältnisse funktionieren über das Manifest. Eine neue Form außer `rectangle` oder `circle` erfordert zusätzlich Engine-Anpassungen für Formvalidierung, physische Druckgeometrie und Renderer-Clipping. Im Warenkorb bleibt die Layoutreferenz über `layoutId` erhalten.

## Die sieben Stufen

Die globalen Auswahlgrenzen liegen zentral in `src/config.js`; sie gehören nicht zum individuellen Zeichenstil. `src/types.d.ts` beschreibt Stufen, Eingaben und Manifeststruktur.

| Layer | Aufsteigende inklusive Obergrenzen |
| --- | --- |
| Genetik, Sativa | 14, 29, 44, 59, 74, 89, 100 |
| THC | 5, 11, 17, 23, 29, 35, 40 |
| CBD | 2, 5, 8, 11, 14, 17, 20 |

Der erste passende Wert gewinnt. Beispielsweise liegt THC 5,0 in Stufe 1 und THC 5,1 in Stufe 2. Diese Regel schließt bei Dezimalwerten alle Zwischenräume. Die neue Spezifikation verwendet feste Stufen: Es findet keine Überblendung zwischen Stufen und keine frühere CBD-Höhenmaske statt. Jeder ausgewählte Layer wird mit seiner eigenen unveränderten PNG-Deckkraft gezeichnet. Sieben Ebenen pro Eigenschaft ergeben 343 Kombinationen pro Layout und Pack.

THC 0–5 zeigt einen klaren Himmel; die erste Wetter-PNG darf vollständig transparent sein. Stufe 6 enthält Gewitter, Stufe 7 ein deutlich stärkeres Gewitter. CBD beginnt bereits mit wenigen Blättern und erhöht bis Stufe 7 Anzahl, Größe und Komplexität der Ornamente. Textfreiflächen müssen in allen 343 Kombinationen je Layout erhalten bleiben.

## Grafikvertrag und eigene Packs

1. Eigenes Pack-Verzeichnis anlegen und ein Beispielmanifest kopieren; ID, Autor und Version anpassen.
2. Für jedes Layout 22 PNGs in der angegebenen Canvas-Größe erzeugen. Transparente Ränder niemals beschneiden.
3. Die Waldkomposition innerhalb eines Layouts möglichst beibehalten. Wolken, Wetter, Ornamente und Schrift nicht in fremde Layer einbauen.
4. Für runde Etiketten eigene Kreiskompositionen mit radialen Ornamenten und geeigneten Textpositionen zeichnen. Transparenz außerhalb des Kreises ist Pflicht. Die Engine erzwingt zusätzlich einen kreisförmigen Sicherheitsclip. IDs und Namen sind frei wählbar, z. B. `round-lid` / `Runder Deckel` oder `wide-landscape` / `Breites Querformat`.
5. Statische Regen- und Blitzillustrationen im Himmel halten; optional eine gleich große Himmelmaske verwenden.
6. Fonts mit ausreichender Lizenz und Lizenzdatei beilegen; Vorschau-PNG erzeugen.
7. Manifest im Katalog registrieren, lokal mit `npm start` öffnen und alle sieben Stufen, Pack-Wechsel, jedes Layout, lange Namen und fehlende Assets prüfen.
8. `npm test` und `tests/browser.html` ausführen; anschließend Probe-PDF bei 100 % beziehungsweise „Tatsächliche Größe“ drucken.

Der Manager lädt und validiert JSON-Manifeste. PNG-Abmessungen und Datei-Erreichbarkeit prüft der Renderer beim Laden. `preloadAssets(config)` prüft einen vollständigen Layout-Satz vorab. Fehlerhafte Cache-Einträge werden entfernt, damit korrigierte Dateien erneut geladen werden können. Ein fehlendes Bild ersetzt niemals stillschweigend ein anderes Sprite.

### Migration älterer Manifeste

Kompatibilitätsversion 1 bleibt erhalten. Ältere Manifeste mit `formats` als Objekt werden beim Laden als Layouts interpretiert: die Objektschlüssel werden zu IDs und die vorhandenen Geometrie-, Layer- und Typografieangaben bleiben gleich. Neue und exportierte Manifeste verwenden ausschließlich `layouts` als Array; zusätzliche Layouts werden als weitere Einträge ergänzt. Alte Schema-1-Warenkörbe mit `format` werden beim Laden automatisch zu `layoutId` migriert und beim nächsten Speichern als Warenkorb-Schema 2 geschrieben. Dadurch können Packs mit eigenen Seitenverhältnissen, etwa schmalen Querformaten oder anderen runden Durchmessern, ohne Änderung der Manifest-Kompatibilitätsversion mehrere Designs anbieten.

## ZIP-Import und lokaler Speicher

Im Bereich **Texturepacks** eine ZIP-Datei über die Dateiauswahl wählen. Das Archiv darf `pack.json` direkt im ZIP-Wurzelverzeichnis enthalten oder in einem gemeinsamen umschließenden Ordner (etwa `my-pack/pack.json`). Ablegen per ZIP-Datei-Drop ist nicht implementiert. Assetpfade im Manifest bleiben relativ zum Manifest. Nach dem Import wird das Pack lokal verfügbar und kann ausgewählt, als ZIP exportiert oder entfernt werden. Mitgelieferte Packs können als ZIP-Vorlage exportiert werden; identische ID und Version zu einem mitgelieferten Pack werden beim Import abgewiesen. Ein importiertes Pack kann nur entfernt werden, wenn keine Warenkorbeinträge genau diese ID und Version verwenden.

Grenzen je Archiv: 128 MiB komprimiert, 150 MiB entpackt, 256 Einträge, 16 MiB je Datei, 256 KiB für `pack.json`; unterstützte Bilder müssen PNGs mit 8-Bit-RGBA sein und höchstens 4096 × 4096 Pixel haben. Verschlüsselte, mehrteilige und ZIP64-Archive, Links und Spezialdateien werden abgewiesen. Dateipfade werden auf Traversal und doppelte Namen geprüft; ZIP- und PNG-Prüfsummen werden kontrolliert. Die PNGs dürfen zusammen höchstens 128 × 1024 × 1024 Pixel enthalten, um den Dekodierspeicher im Browser zu begrenzen. Manifest, erforderliche Assets und Schriften müssen gültig sein. Vor dem Speichern lädt der Browser für jedes unterstützte Layout alle benötigten Bilder und die Schrift über die bestehenden Renderer-Lader. Anschließend wird jedes unterstützte Layout mit Beispieldaten über dieselbe Canvas-Engine gerendert. Erst nach erfolgreicher Lade- und Renderprüfung wird der Datensatz atomar in IndexedDB abgelegt.

Der Import benötigt HTTPS oder `localhost`, Web Crypto und IndexedDB. Die Packs bleiben ausschließlich in den Browserdaten dieses Geräts; sie werden weder an einen Server übertragen noch automatisch gesichert. Browserdatenlöschung entfernt die Installation. ZIP-Export dient als manuelle Sicherung. Pack-Vererbung und ZIP-Datei-Drop sind nicht implementiert; Etikettenziehen im Druckbogeneditor ist verfügbar.

## Reproduzierbarkeit

Identische Daten, Pack-Version, Assets, Sichtbarkeit und Browser-Rendering-Umgebung liefern identische Pixel. Browser und Betriebssysteme können Schrift-Rasterisierung und PNG-Kompression unterschiedlich ausführen. Byteidentische Ergebnisse über sämtliche Plattformen erfordern eine festgelegte Rendering-Umgebung. Die Pack-Version ist kein Archiv: Wer alte Projekte exakt reproduzieren möchte, muss die damaligen Assets weiter aufbewahren.
