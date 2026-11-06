# Verdant Cathedral 1.1.0 · Testbericht

Stand: 6. November 2026. compatibilityVersion 2 bleibt unverändert.

## Änderungen gegenüber 1.0.0

Alle Glasscheiben einschließlich der Textmitte folgen der Genetikfarbe.
THC fügt im oberen Bereich null bis acht astronomische Motive hinzu.
CBD lässt unten ein Ornament entlang seiner tatsächlichen Verzweigungen
wachsen; bei der Rosette füllt es drei untere Fenstersegmente. Es gibt keine
festen Hintergrundpflanzen mehr. Die Prozentwerte sind größer, kräftiger und
getrennt beschriftet. Die Mindestgröße der vier Prozentfelder im normalen
Ausgangslayout beträgt 40 native Pixel.

## Ausgeführte Prüfungen

- `npm --prefix v3 test`: 119/119 Tests erfolgreich, einschließlich der
  angepassten Pack-Regressionen für ganzflächige Farbe, Astronomie und Wachstum.
- `npm --prefix v3 run check`: fünf Katalogpacks, 343 native RGBA-Sprites,
  Fontdateien und Modulsyntax erfolgreich geprüft.
- `npm --prefix v3 run test:browser`: vollständige bestehende Browser-Suite
  erfolgreich, einschließlich Katalog, ZIP, IndexedDB, PNG, PDF und Oberfläche.
- `tests/verdant-cathedral.html`: beide Layouts in nativer Größe dekodiert und
  jede der 21/9/7 Stufen als unterschiedlicher Renderzustand geprüft. Alle
  exklusiven Grenzen unmittelbar darunter, darauf und darüber sowie Null und
  Maximalwerte geprüft. Zusätzlich 27 niedrige/mittlere/hohe Kombinationen je
  Layout, insgesamt 54, gerendert und als Kontaktbogen gespeichert.
- Lange Namen und Produzenten, maximale 200/120 breite W-Zeichen, Dezimalwerte
  und leerer Produzent passen ohne Abschneiden. Extremtexte werden verkleinert.
- 21 Genetics-Alphamasken je Layout sind identisch. Stichproben in oberer,
  mittlerer und unterer Glasscheibe bestätigen die ganzflächige Einfärbung.
  Es gibt keine überdeckende weiße Textplakette. An den vier Prozentankern
  beträgt der gemessene Kontrast über alle Genetikstufen mindestens 5,03:1;
  der Regressionstest verlangt mindestens 4,5:1. Das ist eine Pixelmessung
  am gerenderten Farbhintergrund, keine Aussage über beliebiges Druckmaterial.
- THC- und CBD-Stufen fügen ausschließlich Pixel hinzu; bereits sichtbare
  Motive bleiben bytegleich. Astronomie bleibt oberhalb y=480; Pflanzen
  bleiben unterhalb y=1190 (Hochformat) bzw. y=940 (Rosette). Keine deckenden
  Foreground-Fassungspixel werden von den dynamischen Ebenen übermalt.
- Alle Layer sind 8-Bit-RGBA in korrekter nativer Auflösung. Keine identischen
  Sprites innerhalb einer Kategorie. Transparente Außenbereiche des Kreises
  und getrennte statische Fensterarchitektur geprüft.
- Vorschau und erneut dekodierter PNG-Export sind pixelgleich. Ein echter
  A4-PDF-Probedruck mit beiden Layouts bei 60 mm Breite wurde erzeugt, mit
  Poppler bei 140 dpi gerendert und visuell geprüft. Texte und Symbole sind
  vollständig, die Kreisform bleibt erhalten, keine schwarzen Rechtecke oder
  Verzerrungen. Die Druckplanung rotiert das Hochformat zulässig um 90 Grad.
- `validate-pack.js … --zip stained-glass-verdant-cathedral.zip`: Manifest,
  lokale Fontlizenz, Assetreferenzen und vollständiger ZIP-Roundtrip geprüft.
- `tests/verdant-cathedral-install.html`: das unveränderte ZIP installiert,
  beide Layouts aus echten Blob-Assets gerendert, nach erneutem Öffnen aus
  IndexedDB geladen, identischen Reimport erkannt und Testimport entfernt.
  Nur der Testkatalog lässt die bereits mitgelieferte ID/Version aus.
  Anschließend das Pack im echten App-Dropdown ausgewählt und beide Layouts
  geprüft. Die Importprüfung verwendet die tatsächliche Manifestversion 1.1.0.

## Budget und Artefakte

96 Dateien einschließlich dieses Berichts, 89 RGBA-PNGs, rund 75,3 MiB entpackt.
140.170.692 PNG-Pixel (133,68 Mi-Pixel), größte Datei rund 2,93 MiB.
ZIP rund 75 MiB. Unter allen Importlimits: 256 Einträge, 192 MiB entpackt,
160 MiB ZIP, 160 Mi-Pixel und 16 MiB pro Datei.

78 Canvas-Layer, vier Originalmaster, drei Vorschauen und vier Kontakt-/
Vergleichsbögen. Ein lokaler Lora-Font mit vollständiger SIL-OFL-Lizenz.
Die Originalmaster sind ausschließlich verlustfrei in RGBA normalisiert.
Bildprompts und Ableitung stehen vollständig in PROMPTS.md und im Generator.

Zusätzliche lokale QA-Dateien unter `v3/output/verdant-cathedral-source/`:
PDF-Probedruck, gerenderte PDF-Seite, Browseransichten und Testkopie des ZIP.
Diese Zwischenartefakte gehören nicht zum importierbaren Texturepack.

## Grenzen

Kein physischer Druck-/Farbproof. Maximale Textlängen oder sehr kleine
Etiketten können die Lesbarkeit vermindern. Nicht jede der 1.323 möglichen
Stufenkombinationen je Layout wurde visuell einzeln begutachtet; alle Stufen,
Grenzen, Alphageometrien sowie 54 Kombinationen wurden geprüft.

Renderer, Schema, andere Packs, v1 und v2 bleiben unverändert. Die Revision
ändert nur dieses Pack, seinen Katalogeintrag, seine Erstellung und Tests
sowie das eigenständige ZIP. Vorhandene fremde unversionierte Dateien bleiben
unangetastet.
