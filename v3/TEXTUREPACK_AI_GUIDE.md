# Arbeitsanleitung für KI-Agenten: Texturepacks für v3

## Vor jeder Erstellung oder Änderung lesen

1. [TEXTUREPACKS.md](TEXTUREPACKS.md): vollständige menschliche Spezifikation.
2. [schemas/texturepack.schema.json](schemas/texturepack.schema.json): verbindliche Eigenschaften, Typen und Grenzen.
3. [examples/composition/pack.json](examples/composition/pack.json): vollständiges Funktionsbeispiel.
4. [examples/template/pack.json](examples/template/pack.json): kleinster verständlicher Ausgangspunkt.
5. Für Implementierungsänderungen zusätzlich [ARCHITECTURE.md](ARCHITECTURE.md), `src/manifest-schema.js`, `src/texturepacks.js`, `src/typography.js` und die Tests.

Ändere ausschließlich v3. v1, v2 und ihre Assets bleiben unverändert. Erzeuge ausschließlich unterstützte Funktionen; ein Manifest darf keinen JavaScript-Code oder HTML-Auswertung voraussetzen.

## Zu erzeugende Dateien

- `pack.json` mit eigener stabiler ID, Metadaten, Inhaltsversion und `compatibilityVersion: 2`.
- Pro Layout ein `base.png` und **21 dynamische PNGs**: sieben `genetics`, sieben `thc`, sieben `cbd`, geordnet Stufe 1 bis 7. Kein Sprite darf fehlen oder innerhalb seiner Kategorie durch denselben Pfad ersetzt werden.
- Lokale Fontdateien samt vollständigen Weitergabelizenzen, z. B. `fonts/lora/label-serif.ttf` und `fonts/lora/OFL.txt`.
- PNGs für alle zusätzlich referenzierten Dekorationen und Hintergründe.
- `ASSET-LICENSE.txt` mit Herkunft und Nutzungsrechten aller Grafiken/Fonts; `README.md` mit Packbesonderheiten und Testanweisungen.
- Optional `preview.png`, layoutbezogene Vorschauen und Alpha-Masken.

Ein Pack ist selbstständig. Keine Verweise auf Dateien anderer Packs, absolute Pfade oder externe URLs für Assets. Ein ZIP soll ohne Repositorydateien außerhalb seines Packverzeichnisses importierbar sein.

## Sprites planen und herstellen

Lege für jedes Layout Form, native Auflösung, gemeinsame Bildkomposition und Textfreiflächen vor der Asset-Erstellung fest. Ein Rundlayout benötigt quadratische Abmessungen und eine bewusst runde Komposition. Exportiere alle dynamischen Layer in voller Canvas-Größe mit gleichem Ursprung. Hintergründe und Dekorationen dürfen kleinere PNGs sein.

Die App wählt je Kategorie **genau eine** Stufe ohne Überblendung. Inklusive Obergrenzen:

| Kategorie | Sieben Werte |
| --- | --- |
| Genetik anhand Sativa | 14, 29, 44, 59, 74, 89, 100 |
| THC | 5, 11, 17, 23, 29, 35, 40 |
| CBD | 2, 5, 8, 11, 14, 17, 20 |

Für ein Waldmotiv kann Genetik die Tageszeit von Nacht bis Morgen ändern; THC steigert Wolken, Regen und Gewitter; CBD steigert Blatt-/Blütenornamente. Für Jugendstil können Genetik die Farbtemperatur, THC ein Wettermedaillon und CBD zunehmende florale Ranken verändern. Halte jede Stufe unterscheidbar und die Platzierung der Textfreiflächen konstant. Verändere bei dynamischen transparenten Overlays nur die beabsichtigte Kategorie. Eine vollständig deckende Genetikgrafik darf die Basis bedecken, aber THC/CBD dürfen keine ungewollt deckende Fläche mitbringen.

Verwende echte transparente **8-Bit-RGBA-PNGs** bis 4096 × 4096. Kein RGB, Farbpaletten-PNG, 16 Bit, APNG, weißer Ersatzhintergrund oder sichtbares Schachbrett. Keine eingebrannten Sortennamen, Jahreszahlen, THC-/CBD-Werte. Nutze generierte Rasterbilder nur, wenn die vorhandenen Assets und prozedurale einfache Grafiken das gewünschte Motiv nicht erfüllen. Wiederverwendbare vorhandene PNGs müssen nicht neu erzeugt werden.

## Manifest komponieren

- `layouts` enthält 1–16 benannte Layouts, jeweils Geometrie, `layers`, `zIndex`, `typography.fields` und `typography.decorations`.
- `fonts` registriert bis zu acht lokale Familien. Jedes Feld besitzt sein eigenes `font`; Familiennamen müssen exakt übereinstimmen. TTF, OTF, WOFF und WOFF2 sind erlaubt. Nutze tatsächliche unterschiedliche Fontdateien für unterschiedliche Schriftfamilien.
- Jedes Textfeld besitzt eine stabile eindeutige ID, `source`, Schriftgröße, Farbe und expliziten zIndex. Gerade Texte benötigen x/y. Dieselbe Quelle darf in mehreren Feldern erscheinen.
- Verwende Quellen `name`, `producer`, `year`, `thc`, `cbd`, `indica`, `sativa`, `static`. Bei `static` ist `text` erforderlich.
- Vermische Daten und Gestaltung nicht: Textfelder bestimmen keine Formularwerte. Fehlende optionale Produzenten bleiben leer.
- Prozentwerte erhalten `format: "percent"`; Jahre `year-full` oder `year-short`; sonst `raw`. Präfixe und Suffixe bleiben reine Zeichenfolgen. Keine Ausdrücke oder Templatesyntax.
- Passe `fontSize`, `minFontSize`, `maxWidth`, `maxHeight`, `maxLines`, `lineHeight` und Ausrichtung an realistische lange Inhalte an. Ein nicht passendes Feld wird kontrolliert abgewiesen.

## Sprite-Hintergründe und Vordergrund

Ein PNG-Hintergrund ist eine Dekoration mit `type: "sprite"`, `asset`, x/y, Zielbreite/-höhe und zIndex. Er kann frei in `typography.decorations` stehen oder als `background` eines Feldes eingebettet werden. Ein eingebetteter Hintergrund benötigt `relativeTo` mit der eigenen Feld-ID. Eigene ID nicht vergessen.

Mit `relativeTo` werden Position und Rotation des Textfelds übernommen, x/y sind lokale Versätze. Referenzen dürfen nur auf Textfelder zeigen; keine Ketten oder Zyklen. Ohne Bindung sind die Positionen absolut. `anchorX`/`anchorY` sind standardmäßig 0,5; `scale` standardmäßig 1. Für einfache Flächen `type: "rect"` mit `color`, optional `padding`, `radius`, `border`, `shadow` verwenden. Größen sind explizit, nicht automatisch aus Textmaßen berechnet.

Setze zIndex überall explizit. Übliche Werte: Basis 0, Genetik 100, THC 200, CBD 300, Fläche 400, Plakette 450, Texte 500, Vordergrund 600. Jedes Element kann davon abweichen. Bei Gleichstand: vier Grafik-Kategorien in genannter Reihenfolge, dann eingebettete Hintergründe in Feldreihenfolge, freie Dekorationen und zuletzt Textfelder in Arrayreihenfolge.

## Rotation und Bogentext

Positive Rotation ist im Uhrzeigersinn. Gerade Texte drehen um x/y, Sprites um ihren Anker. Ein `path` vom Typ `arc` ersetzt x/y: Mittelpunkt, Radius, Start-/Endwinkel und `direction` angeben. 0° rechts, 90° unten, −90° oben. `clockwise` erhöht Winkel, `counterclockwise` verringert sie; gleiche Winkel ergeben einen Vollkreis. Zeichen stehen tangential in Schreibrichtung. Bogenfelder sind einzeilig, ohne `maxWidth`, x/y oder `wrap: true`. Textbreite muss auf die Bogenlänge passen; `minFontSize` ermöglicht Verkleinern.

## Validieren und ausliefern

```sh
node v3/scripts/validate-pack.js PFAD/ZUM/PACK --zip mein-pack.zip
npm --prefix v3 test
npm --prefix v3 run check
npm --prefix v3 start
```

Bei laufendem Server `npm --prefix v3 run test:browser` ausführen. Importiere das eigene ZIP zusätzlich in der Oberfläche. Prüfe alle Layouts und Stufen sowie lange Namen, Produzenten, Jahreszahlen und Dezimalwerte. Vergleiche Live-Vorschau, PNG und PDF bei 100 % Druckskalierung. Dokumentiere tatsächliche Testergebnisse und fehlende Prüfungen. JSON Schema ersetzt nicht die semantische Referenzprüfung und Assetvalidierung der CLI.

Halte die ZIP-Limits ein: 128 MiB komprimiert, 150 MiB entpackt, 256 Einträge, 16 MiB pro Datei, Manifest 256 KiB, insgesamt 128 Mi-Pixel. Erhöhe die Inhaltsversion bei Änderungen an veröffentlichten Packs. Ergänze den statischen Katalog nur, wenn das Pack ausdrücklich mitgeliefert werden soll; ein importierbares Beispiel benötigt keinen Katalogeintrag.

## Unbedingt vermeiden

- Alte feste Typografieeigenschaften oder eine alte Zeichenreihenfolgenliste weiterverwenden.
- Nur die Kompatibilitätszahl eines alten Packs ändern, ohne dessen Struktur zu ersetzen.
- Referenzierte Assets oder Lizenzen auslassen; Fontnamen erfinden oder dieselbe Datei als zwei unterschiedliche Familien ausgeben.
- PNGs mit falschem Farbtyp, Format oder unterschiedlichen Layerabmessungen erzeugen.
- Externe URLs, Traversalpfade, ausführbare Dateien, Formeln oder HTML als Gestaltung einführen.
- Vorschau und Export über unterschiedliche Renderer zeichnen.
- Texte still abschneiden oder zIndex-Werte implizit von Arraypositionen ableiten.
- v1/v2, Warenkorb oder PDF-Anordnung für reine Packgestaltung verändern.

## Wiederverwendbarer Beispielauftrag

> Erstelle ein eigenständiges Jugendstil-Texturepack für Label Generator v3 unter `v3/texturepacks/art-nouveau`. Lies zuerst `v3/TEXTUREPACKS.md`, `v3/TEXTUREPACK_AI_GUIDE.md` und `v3/schemas/texturepack.schema.json`. Verwende compatibilityVersion 2 und eine neue Pack-ID. Erzeuge Hochformat und Rund mit eigener Komposition und je einer Basis plus 21 siebenstufigen dynamischen Sprites. Verwende lizenzierte lokale dekorative und gut lesbare Schriftfamilien mit vollständigen Lizenzen. Platziere Sortenname, Produzent, Jahr und Werte unabhängig. Füge eine transparente goldene PNG-Plakette hinter dem Namen, ein florales Vordergrundornament, ein gedrehtes Feld und Bogentext auf dem runden Layout hinzu. Setze alle zIndex-Werte explizit und halte die Textfreiflächen in allen Stufen frei. Prüfe Manifest und sämtliche Assets mit der CLI, importiere das ZIP und vergleiche Vorschau, PNG und PDF. Liefere das vollständige Pack, das importierbare ZIP, Lizenzen und einen knappen Testbericht. Verändere v1 und v2 nicht.
