# Watercolor Forest

Das erste illustrierte Texturepack für Label Generator v3 kombiniert Waldlandschaften in Aquarelloptik mit Wetterillustrationen und botanischer Ornamentik. Die Grafiken sind mit OpenAI Image Generation erstellt. Es handelt sich um KI-generierte Illustrationen, keine eingescannten Originalaquarelle.

## Aufbau

Seit Version 1.1.0 enthält jedes Layout eine Basisgrafik, sieben hintere Landschaften (Genetik), sieben Wetterstufen (THC), sieben transparente Baum-Vordergründe und sieben Ornamentstufen (CBD). Landschaft und Baumrahmen folgen denselben sieben Sativa-/Tageszeitstufen. Namen, Prozentwerte, Erntejahr und optionaler Seed-Produzent werden vom Renderer gesetzt; sie sind nicht Teil der Illustrationen.

Die Layoutdefinitionen, Auflösungen, Textpositionen und Assetpfade stehen in `pack.json`. Alle Pfade sind relativ zu diesem Manifest, damit das Pack vollständig statisch auf GitHub Pages und als lokaler ZIP-Import funktioniert.

| Layout-ID | Name | Native Auflösung |
| --- | --- | --- |
| `classic-portrait` | Klassisches Hochformat | 1024 × 1536 px |
| `wide-landscape` | Breites Querformat | 1536 × 1024 px |
| `round-lid` | Runder Deckel | 1254 × 1254 px |

Die drei Layouts besitzen eigene Kompositionen und verwenden je 29 PNGs. Himmel, Berge und fernes Tal liegen in `genetics` (zIndex 100), Wolken in `thc` (200), die seitlichen Bäume und nahen Bodenpflanzen in `foreground` (250), botanische Ornamente in `cbd` (300). So verdecken die Wolken nicht mehr die vorderen Bäume. Die Vordergründe besitzen echte Alpha-Transparenz und volle Canvas-Abmessungen. Die Ebenenliste erlaubt ihr separates Ausblenden und Verschieben; Vorschau, PNG und PDF verwenden dieselbe Reihenfolge.

Die Hintergründe wurden generativ um die zuvor verdeckten Landschaftsbereiche ergänzt und die Vordergründe separat freigestellt. Stil, Auflösung und Tageszeit bleiben erhalten; die Bearbeitung ist keine pixelidentische Zerlegung. Der ruhige Mittelbereich und die bestehenden Textpositionen bleiben nutzbar.

[Neun Beispielkombinationen ansehen](contact-sheet.png). Die Pack-Auswahl lädt kleine Vorschaubilder; das vollständige Pack wird erst beim ZIP-Export zusammengestellt. Die ZIP-Importgrenze beträgt 160 MiB, die Grenze für entpackte Daten 192 MiB und das PNG-Pixelbudget 160 Mi-Pixel. Einzeldatei- und Eintragslimits gelten weiterhin.

## Herkunft und Weitergabe

Die Generierung verwendet das integrierte Imagegen-Werkzeug. Die verwendeten Prompts werden in `PROMPTS.md` festgehalten. Hinweise zur Weitergabe stehen in `ASSET-LICENSE.txt`. Die mitgelieferte Lora-Schrift behält ihre eigene SIL Open Font License in `fonts/OFL.txt`.

Beim manuellen Ändern der Grafiken oder des Manifests die Pack-Version erhöhen. Alte Versionen und ihre Assetdateien müssen erhalten bleiben, wenn bestehende Druckaufträge exakt reproduzierbar bleiben sollen.

## Technische Prüfung der Version 1.1.0

Am 6. November 2026 bestanden: vollständige Packvalidierung mit ZIP-Roundtrip (98 Dateien einschließlich Kontaktübersicht), 116 Node-Tests, statische Prüfung und die gesamte Browsersuite. Die Browserprüfung vergleicht die Landschaft-/Wetter-/Vordergrundkomposition in allen drei Layouts bei Nacht, Nachmittag und Morgen mit der erwarteten Zeichenreihenfolge; separate Sichtbarkeit, mobile Ebenenliste, gespeicherte Reihenfolge, PNG und PDF werden ebenfalls geprüft. Die Kontaktübersicht und Pack-Vorschaubilder wurden aus dem gemeinsamen Renderer neu erzeugt und visuell geprüft.

## Druck

Die Druckbreite beziehungsweise der Durchmesser wird in der Oberfläche festgelegt. Die Höhe folgt dem nativen Seitenverhältnis. Die DPI-Anzeige berücksichtigt die tatsächliche Rasterauflösung; unter 300 dpi erscheint eine Warnung. Beim Drucken des PDFs „Tatsächliche Größe“ beziehungsweise 100 % wählen.

Ein physischer Probedruck auf dem vorgesehenen Drucker und Etikettenpapier steht noch aus. Dabei die Kalibrierungsseite nachmessen und Lesbarkeit, Farben und Schnittkanten beurteilen.
