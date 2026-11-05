# Platzhalter und Grafikregeln

Die Grafiken in `texturepacks/woodland/` und `texturepacks/ink/` sind technische Platzhalter und **keine finalen Aquarell- oder Vintageillustrationen**. Dieses Verzeichnis enthält die lokale Lora-Schrift und ihre SIL-OFL-Lizenz; aktive Pack-Sprites liegen bei den jeweiligen Pack-Manifests.

## Umfang und Maße

Jedes vollständige Pack enthält 44 Sprite-PNGs:

- Rechteck: 1200 × 1800 px (1 Basis + je 7 Genetik-, THC- und CBD-Bilder)
- Kreis: 1200 × 1200 px (1 Basis + je 7 Genetik-, THC- und CBD-Bilder)

Kreis und Rechteck sind eigenständige Kompositionen mit eigener Textgeometrie. Kein Format darf aus dem anderen durch Beschneiden abgeleitet werden. Innerhalb eines Formats müssen alle Layer dieselbe Pixelgröße, Zeichenfläche und den Ursprung links oben verwenden. Nicht auf sichtbare Pixel zuschneiden.

| Layer | Enthält | Lässt frei |
| --- | --- | --- |
| Basis | Papier und Grundform | Wald, Wetter, Ornamente, Text |
| Genetik | Landschaft und Lichtstimmung | Wetter, Ornamente, Text |
| THC | Wolken/Wetter, bei Gewitter Regen und Blitze | Himmelshintergrund, Wald, Rahmen, Text |
| CBD | Äußere botanische Ornamente | Landschaft, Wetter und Textflächen |

Waldpositionen und Horizont sowie Textfreiflächen bleiben über alle Stufen eines Formats registriert. CBD-Stufen sind eigenständige Motive, nicht kumulative Ausschnitte oder nachträglich maskierte Teilflächen. Die Auswahlgrenzen stehen zentral in `src/config.js`: Genetik 14/29/44/59/74/89/100 %, THC 5/11/17/23/29/35/40 %, CBD 2/5/8/11/14/17/20 %. Die Engine wählt für jeden Layer genau eine Vorlage.

## Transparenz und Beschnitt

Alphakanäle sind Teil des Grafikvertrags. Außerhalb der runden Kontur muss das Kreisdesign transparent sein. Transparente Außenränder der Basis und sämtlicher Layer bleiben beim Export transparent. Der Beschnitt im PDF verlängert die am Bildrand vorhandenen Randpixel über die Schnittkante hinaus; transparente Außenpixel bleiben auch im Beschnitt transparent. Für tatsächlich bis zur Schnittkante reichenden Farbauftrag muss deckende Grafik bis zur Kante und in den Beschnitt hinein gezeichnet werden. Die Software erzeugt keine fehlende Hintergrundfarbe.

## Eigene Grafiken einsetzen

1. Entsprechende PNGs im jeweiligen Pack-Verzeichnis ersetzen; Maße und Dateipfade aus `pack.json` einhalten.
2. Layer getrennt halten und Motive innerhalb jedes Formats deckungsgleich registrieren.
3. Kreisdesigns eigenständig komponieren und außerhalb der Kreisfläche transparente Pixel erhalten.
4. Pack-Version erhöhen, wenn sich ausgelieferte Assets ändern; Fonts nur mit passender Lizenz samt Lizenzdatei beilegen.
5. Mit `npm start` beide Formate, alle sieben Stufen, Textlängen und Packwechsel ansehen; anschließend den A4-PDF-Ausdruck bei **Tatsächliche Größe / 100 %** prüfen.

Das Manifestformat, Katalogschema und die Stufenauswahl sind in [../TEXTUREPACKS.md](../TEXTUREPACKS.md) beschrieben. Die Beschreibungen in `BESTANDSAUFNAHME.md` beziehen sich teilweise auf einen älteren Implementierungsstand.
