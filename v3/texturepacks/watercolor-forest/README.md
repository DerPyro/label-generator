# Watercolor Forest

Das erste illustrierte Texturepack für Label Generator v3 kombiniert Waldlandschaften in Aquarelloptik mit Wetterillustrationen und botanischer Ornamentik. Die Grafiken sind mit OpenAI Image Generation erstellt. Es handelt sich um KI-generierte Illustrationen, keine eingescannten Originalaquarelle.

## Aufbau

Jedes Layout enthält eine Basisgrafik sowie sieben separat kombinierbare Stufen für Genetik, THC und CBD. Die globalen Stufengrenzen und die bestehende Canvas-Pipeline bleiben unverändert. Namen, Prozentwerte, Erntejahr und optionaler Seed-Produzent werden vom Renderer gesetzt; sie sind nicht Teil der Illustrationen.

Die Layoutdefinitionen, Auflösungen, Textpositionen und Assetpfade stehen in `pack.json`. Alle Pfade sind relativ zu diesem Manifest, damit das Pack vollständig statisch auf GitHub Pages und als lokaler ZIP-Import funktioniert.

| Layout-ID | Name | Native Auflösung |
| --- | --- | --- |
| `classic-portrait` | Klassisches Hochformat | 1024 × 1536 px |
| `wide-landscape` | Breites Querformat | 1536 × 1024 px |
| `round-lid` | Runder Deckel | 1254 × 1254 px |

Die drei Layouts besitzen eigene Kompositionen und verwenden je 22 PNGs: Basis, sieben Tageszeiten, sieben Wetterstufen und sieben Ornamentstufen. Der ruhige Mittelbereich dient der dynamischen Schrift. Helle Leseflächen erhalten die Lesbarkeit auch vor den dunklen Nacht- und Gewitterdarstellungen.

[Neun Beispielkombinationen ansehen](contact-sheet.png). Die Pack-Auswahl lädt kleine Vorschaubilder; das vollständige Pack wird erst beim ZIP-Export zusammengestellt und ist rund 102 MiB groß. Die ZIP-Importgrenze beträgt 128 MiB; die separaten Grenzen für Bildpixel, einzelne Dateien und entpackte Daten gelten weiterhin.

## Herkunft und Weitergabe

Die Generierung verwendet das integrierte Imagegen-Werkzeug. Die verwendeten Prompts werden in `PROMPTS.md` festgehalten. Hinweise zur Weitergabe stehen in `ASSET-LICENSE.txt`. Die mitgelieferte Lora-Schrift behält ihre eigene SIL Open Font License in `fonts/OFL.txt`.

Beim manuellen Ändern der Grafiken oder des Manifests die Pack-Version erhöhen. Alte Versionen und ihre Assetdateien müssen erhalten bleiben, wenn bestehende Druckaufträge exakt reproduzierbar bleiben sollen.

## Druck

Die Druckbreite beziehungsweise der Durchmesser wird in der Oberfläche festgelegt. Die Höhe folgt dem nativen Seitenverhältnis. Die DPI-Anzeige berücksichtigt die tatsächliche Rasterauflösung; unter 300 dpi erscheint eine Warnung. Beim Drucken des PDFs „Tatsächliche Größe“ beziehungsweise 100 % wählen.

Ein physischer Probedruck auf dem vorgesehenen Drucker und Etikettenpapier steht noch aus. Dabei die Kalibrierungsseite nachmessen und Lesbarkeit, Farben und Schnittkanten beurteilen.
