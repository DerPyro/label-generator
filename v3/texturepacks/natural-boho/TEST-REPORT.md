# Abnahme · Natural Boho 1.0.0

Geprüft am 6. November 2026 mit Node 26.2.0 und lokalem Chrome unter Windows.

## Bestand und Integration

- Zwei eigenständige native Layouts: 1024 × 1536 und 1254 × 1254.
- 44 vollständige Layout-PNGs, vier zusätzliche dekorative PNGs, zwei echte lokale Schriftfamilien mit vollständigen OFL-Lizenzen.
- RGBA mit 8 Bit, native Abmessungen und echte Alpha-Freiflächen geprüft. PNG-Normalisierung erhält die Bildinhalte pixelgenau.
- Sieben unterschiedliche Pixelbilder pro dynamischer Kategorie. THC/CBD-Stufe 7 besitzt jeweils mehr bemalte Detailfläche als Stufe 1. Die tatsächlichen Engine-Grenzen sind geprüft.
- Katalogeintrag und Beschreibung auf der Startseite ergänzt. Keine Änderungen an v1/v2 oder am Renderer, Warenkorb und Druckplaner für dieses Pack vorgenommen.

## Automatisierte Ergebnisse

- `npm --prefix v3 test`: **101 Tests bestanden**, keine Fehler.
- Nach der abschließenden Anpassung von Schriftgrößen und Medaillon-Schichtung: die drei packspezifischen Tests erneut bestanden.
- `npm --prefix v3 run check`: **vier Packs, 242 RGBA-Layout-Sprites** und lokale Schriftdateien erfolgreich geprüft.
- `npm --prefix v3 run test:browser`: **24 allgemeine Browserprüfungen bestanden**, einschließlich gemeinsamer Vorschau-/PNG-/PDF-Komposition, Typografie, Import, Druck und Oberflächenbedienung.
- `tests/natural-boho-review.html`: abschließende **fünf Prüfgruppen bestanden**. Alle 42 dynamischen Einzelstufen, sechs niedrige/mittlere/hohe Mischkompositionen, kurze/lange Namen, Umlaute und lange Produzenten rendern erfolgreich.
- PNGs aus beiden Layouts wurden dekodiert und mit der Vorschau pixelgenau verglichen. Die runde PNG-Ausgabe besitzt transparente Ecken.
- Beide Layouts wurden über den normalen Renderer auf einen gemeinsamen A4-PDF-Bogen exportiert; Seitenzahl und physische Proportionen stimmen.
- ZIP-Export, Prüfung, echter IndexedDB-Import, Blob-Rendering und Reexport bestanden. Beide importierten Layouts sind zur mitgelieferten Version pixelgleich; beide Fontlizenzen und Assetlizenz bleiben enthalten.
- Zusätzlich wurde die ZIP-Datei über den echten Datei-Input der Oberfläche importiert und beide Layouts ausgewählt. Dafür wurde eine zufällige private Test-ID verwendet, weil mitgelieferte ID-/Versionspaare absichtlich geschützt sind. Temporäre Importdaten werden wieder entfernt.
- Die CLI `validate-pack.js` prüft das vollständige ausgelieferte ZIP samt Manifest, PNGs, Fonts und Limits.

Die Chrome-DevTools-Verbindung war innerhalb der Ausführungssandbox blockiert. Beide Browserprüfungen wurden anschließend außerhalb dieser Sandbox erfolgreich ausgeführt; die Seite und sämtliche Packassets kamen vom lokalen Server.

## Visuelle Prüfung

`contact-sheet.png` und `stage-sheet.png` wurden nach der letzten Typografieanpassung visuell geprüft. Die Papierbasis, Handschrift, Pilze, Farbpalette und Textfreiflächen sind konsistent. Nacht, Dämmerung, Sonnenaufgang und Sonnentag sind unterscheidbar. Zusätzliche Pflanzen in frühen runden Rauchentwürfen wurden durch reine Rauchbilder ersetzt. Das runde Textmedaillon liegt unter den Werterschildern; die Werte wurden für die Drucklesbarkeit vergrößert. Es sind keine dynamischen Texte in den Illustrationen eingebrannt.

Die Tests decken alle Einzelstufen und ausgewählte Mischungen ab; sie sind kein visueller Vollvergleich aller 343 Kombinationen pro Layout. Ein physischer Druck auf einem konkreten Drucker wurde nicht durchgeführt. Die PDF-Prüfung kontrolliert Export, gemeinsame Renderpipeline und Geometrie, ohne zusätzliche Rasterisierung des fertigen PDF durch einen unabhängigen PDF-Viewer.
