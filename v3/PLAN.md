# v3: Stand und nächste Schritte

## Umgesetzt

- Statische App mit einem Canvas-Renderer und validiertem Pack-Katalog/Manifestformat.
- Erstes illustriertes Pack **Watercolor Forest** mit KI-generierten Waldlandschaften in traditioneller Aquarelloptik. Eigene Layouts: Hochformat (1024 × 1536 px), Querformat (1536 × 1024 px) und Rund (1254 × 1254 px).
- Die technischen Beispielpacks **Woodland Study** und **Ink Study** bleiben erhalten. Alle drei Packs enthalten je 66 Layer-PNGs, zusammen 198: pro Layout eine Basis und sieben PNGs für Genetik, THC und CBD.
- Feste sieben Stufen: Genetik 14/29/44/59/74/89/100 %, THC 5/11/17/23/29/35/40 %, CBD 2/5/8/11/14/17/20 %. Keine Überblendung; inklusive Obergrenzen ordnen auch Dezimalwerte eindeutig zu.
- Pack- und Layoutauswahl, Live-Vorschau, optionale Produzentenangabe, PNG-Export und lokal gebündelte Lora-Schriften mit OFL-Lizenz.
- Millimetergröße und DPI, persistenter Druckwarenkorb mit Bearbeiten/Entfernen, gemischte Etikettengrößen auf A4, Vorschau/PDF, 90°-Drehung, Schnittmarken, Beschnitt und Kalibrierungsseite. Manueller Bogeneditor mit Ziehen per Maus/Touch, X/Y in mm, Tastaturbewegung, Rückgängig/Wiederholen, zusätzlichen Leerseiten und Zurücksetzen.
- ZIP-Import und ZIP-Export sowie lokaler IndexedDB-Speicher für Packs. Manifest, erforderliche Assets und Fonts werden geprüft und vor dem atomaren Speichern im Browser geladen; Versionen bleiben getrennt und im Warenkorb fest zugeordnet.
- Lokaler Server auf Port 3003. `npm start`, `npm test` und `npm run check` sind die verfügbaren Befehle.

Watercolor Forest enthält illustrierte Aquarelloptik; Woodland Study und Ink Study bleiben technische Platzhalter. Die neuen Illustrationen sind KI-generierte Grafiken und keine menschlich gemalten Originale. Ein physischer Probedruck und die visuelle Druckabnahme auf dem vorgesehenen Papier stehen noch aus. Beschnitt bedeutet Randpixel-Fortsetzung; transparente Außenbereiche bleiben transparent. Für Farbauftrag bis zur Schnittkante muss die Grafik bis dorthin reichen. Beim PDF-Druck **Tatsächliche Größe / 100 %** verwenden.

## Nächste Arbeiten

1. Watercolor Forest auf dem vorgesehenen Etikettenpapier maßstabsgetreu probedrucken; Textfreiflächen, Stufenklarheit, Farben und Kanten bei vorgesehener Druckgröße prüfen.
2. Weitere illustrierte Packs bei Bedarf als eigene versionierte Packs ergänzen; die beiden technischen Beispiele bleiben als Referenzen verfügbar. Lizenzen und Herkunft jeweils dokumentieren.
3. Bei späteren Asset-Änderungen Packwechsel, Stufen, alle Layouts, DPI-Warnung und A4-Seiten erneut prüfen und die Pack-Version erhöhen.
4. Pack-Vererbung in einer späteren Phase planen. ZIP-Datei-Drop bleibt ebenfalls offen; die manuelle Etikettenplatzierung ist umgesetzt.

## Grenzen

Eine Pack-Version bewahrt alte Asset-Dateien nicht automatisch auf; für reproduzierbare ältere Aufträge müssen diese Dateien verfügbar bleiben. Der PDF-Export arbeitet lokal. Die App schreibt nicht automatisch in v1/v2 oder deren Datenbestand.

Importierte Texturepacks werden nur in IndexedDB des jeweiligen Browsers gespeichert. Browserdatenlöschung entfernt sie; wichtige Packs daher über ZIP-Export sichern. Der ZIP-Import per Dateiauswahl setzt HTTPS oder `localhost` sowie IndexedDB voraus. Pack-Vererbung und ZIP-Datei-Drop bleiben offen.
