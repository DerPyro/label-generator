# Natural Boho · 1.0.0

Märchenhafte botanische Buchillustration trifft auf die fließenden Formen und warmen Farben eines Hippie-Posters der 1970er-Jahre. Feine unregelmäßige Tuschekonturen, körnige Gouache und Papierfasern verbinden geschwungene Pilze, Wildblumen und Rauchbänder. Die Illustrationen wurden mit dem eingebauten Imagegen-Werkzeug erstellt; die dynamischen Texte zeichnet ausschließlich die v3-Engine.

## Verwendung

Das selbstständige Pack verwendet `compatibilityVersion: 2`, die tatsächlich implementierte Texturepack-Spezifikation der Anwendung v3. Es ist im statischen Katalog registriert. `pack.json` gehört an die Wurzel eines importierbaren ZIPs. Alle Fonts, Grafiken und Lizenzen sind lokal enthalten.

| Layout | Native Pixel | Komposition |
| --- | --- | --- |
| `classic-portrait` | 1024 × 1536 | Vertikaler, asymmetrischer Pflanzenrahmen, Himmelsvignette oben, Papierplakette in der Mitte, Werte darunter |
| `round-lid` | 1254 × 1254 | Eigenständiger radialer Pilzkranz, kleine Himmelsöffnung oben, organisches zentrales Medaillon |

Alle vier Ebenen eines Layouts haben denselben Ursprung und volle Canvas-Abmessungen. Pro Layout existieren eine Basis und je sieben Genetik-, THC- und CBD-Sprites: insgesamt 44 Layout-PNGs, zusätzlich vier dekorative PNGs. Der Renderer beschneidet das Rundlayout exakt kreisförmig. Außenliegende Ecken bleiben transparent. Für mindestens 300 dpi maximal etwa 86,7 mm Hochformatbreite beziehungsweise 106,2 mm Runddurchmesser wählen. Ein physischer Probedruck ist zur Beurteilung des Druckers und Papiers sinnvoll.

## Farbpalette

| Farbe | Hex |
| --- | --- |
| Papiercreme | `#F4E6C8` |
| Terrakotta | `#C76B4A` |
| Senfgelb | `#D8A447` |
| Salbeigrün | `#81966A` |
| Waldgrün | `#425D43` |
| Altrosa | `#D58C91` |
| Lavendel | `#A68BB7` |
| Türkis | `#6DACA4` |
| Rostorange | `#D98047` |

Pigment- und Papiertexturen erzeugen natürliche Farbabweichungen. Neonfarben und sterile geometrische Flächen gehören nicht zu diesem Pack.

## Sieben Stufen

Der Generator wählt ohne Überblendung jeweils die erste passende inklusive Obergrenze. Die Grenzwerte werden von `src/config.js` vorgegeben und sind keine Manifestoptionen.

| Stufe | Sativa bis | Genetik: Tageszyklus | THC bis | Rauch | CBD bis | Pflanzen |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 14 % | Tiefe Nacht, Sichelmond, Sterne | 5 % | Fast keine Wirbel | 2 % | Kleine Blätter und einzelne Blüten |
| 2 | 29 % | Violette Dämmerung | 11 % | Dünne Einzelspiralen | 5 % | Erste kleine Pilze und Ranken |
| 3 | 44 % | Rosa-orangefarbener Sonnenaufgang | 17 % | Kleine Rauchbänder | 8 % | Sichtbare Pilzgruppen und Blumen |
| 4 | 59 % | Goldener Vormittag | 23 % | Mehrfarbige Wirbel | 11 % | Mehrere Pilzarten, Farne und Glockenblumen |
| 5 | 74 % | Heller freundlicher Tag | 29 % | Ineinandergreifende Spiralen | 14 % | Üppige botanische Gruppen |
| 6 | 89 % | Warme Sonne und kräftige Naturfarben | 35 % | Große detailreiche Formationen | 17 % | Dichte bunte Pilz- und Blumenwelt |
| 7 | 100 % | Strahlende Hippie-Sonne mit Wellenstrahlen | 40 % | Üppige verschlungene Rauchkomposition | 20 % | Besonders detailreiche Märchenflora |

Die Basis enthält bereits wenige Pilze als wiederkehrendes Motiv. Die CBD-Ebene ergänzt diese; die erste Stufe besitzt selbst noch keine zusätzlichen Pilze. Der Tageszyklus erhält das Motiv rollender Hügel und kleiner Waldsilhouetten; es sind eigenständige gemalte Varianten, keine pixelidentischen Umfärbungen. Rauch und zusätzliche Pflanzen liegen außen, damit die zentrale Beschriftung frei bleibt.

## Typografie, Sprites und Schichtung

**Shrikhand Regular**, von Jonny Pinhorn, gibt dem Sortennamen seine weiche Retroform. **Lora** übernimmt Jahr, Produzent und Werte. Beide unveränderten lokalen Schriftdateien stehen unter SIL Open Font License 1.1. Vollständige Copyrightvermerke und Lizenzen stehen unter `fonts/shrikhand/OFL.txt` und `fonts/lora/OFL.txt`. Shrikhand stammt aus dem [offiziellen Google-Fonts-Repository](https://github.com/google/fonts/tree/main/ofl/shrikhand); Lora wird aus den vorhandenen lizenzierten Repositoryassets übernommen.

Die Sortennamen können bis zu drei Zeilen belegen und werden bei Bedarf verkleinert. Erntejahr und optionaler Produzent folgen darunter. THC/CBD sowie Indica/Sativa besitzen eigene Felder mit zentraler Prozentformatierung. Leere optionale Daten bleiben leer. Kein dynamischer Text ist in den Bildern enthalten.

| zIndex | Inhalt |
| --- | --- |
| 0 | Papierbasis mit sparsamer Flora |
| 100 | Tageszeitvignette |
| 200 | Groovy-Rauch |
| 300 | Zusätzliche Pilze und Pflanzen |
| 420 / 435 | Botanischer Informationshintergrund (Hochformat / Rund) |
| 425 | Rundes Textmedaillon, unterhalb der Werterschilder |
| 440 | Kleine THC-/CBD-Papierschilder |
| 450 | Namensplakette im Hochformat |
| 500 | Dynamische Texte |
| 600 | Kleiner Vordergrundzweig mit Pilz und Blüte |

Namensplakette und Werterschilder sind echte PNG-Hintergründe mit `relativeTo`; das Vordergrundornament verwendet ebenfalls einen relativen Textanker. Die Plaketten haben feste Größen, unabhängig von der jeweiligen Textlänge. Beim Rundlayout schützt das große Medaillon auch Jahr und Produzent. Die Reihenfolge gilt identisch für Vorschau und Export.

## Erweiterungen und Wiederherstellung

- Neue Layouts eigenständig für ihre Geometrie illustrieren. Das Rundlayout nicht aus dem Hochformat ausschneiden.
- Pro zusätzlichem Layout 22 vollständige RGBA-PNGs mit gemeinsamem Ursprung erstellen. Dekorationen dürfen eigene Abmessungen besitzen.
- Textfreiflächen, Farbfamilie, Konturstärken, Papierkorn und erkennbare Pilzformen beibehalten. Wachstum durch neue Formen und Details gestalten, nicht nur durch Deckkraft.
- `PROMPTS.md` dokumentiert die Generierungsanweisungen; `ASSET-LICENSE.txt` dokumentiert Herkunft und Rechte.
- `node v3/scripts/create-natural-boho.js` baut ausschließlich das Manifest neu. Illustrationen werden dabei nicht verändert. Typografieänderungen deshalb auch in diesem Skript pflegen.
- Für veröffentlichte Änderungen die Inhaltsversion erhöhen. Keine zusätzlichen Manifestfelder erfinden; Schema und semantische Validierung verwenden.
- ZIP-Limits beachten: insbesondere 128 Mi-Pixel, 150 MiB entpackt, 128 MiB ZIP und 256 Einträge. Das ZIP außerhalb des Packverzeichnisses erzeugen.

## Prüfen

Ab Repositorywurzel:

```sh
node v3/scripts/validate-pack.js v3/texturepacks/natural-boho --zip v3/output/natural-boho-1.0.0.zip
npm --prefix v3 test
npm --prefix v3 run check
npm --prefix v3 start
node v3/scripts/run-browser-check.js --url http://localhost:3003/tests/natural-boho-review.html --artifacts-dir v3/texturepacks/natural-boho
npm --prefix v3 run test:browser
```

Die eigene Browserprüfung rendert alle 21 dynamischen Einzelstufen je Layout, niedrige/mittlere/hohe Mischungen, kurze und lange Sortennamen, Umlaute und Produzenten. Sie prüft PNG-Pixelgleichheit, transparente Kreisecken, Schichtreihenfolge, einen gemeinsamen maßstäblichen A4-PDF-Bogen sowie ZIP-Export, IndexedDB-Import und Reexport mit Lizenzen. Beim Import wird eine private Test-ID verwendet, weil die Anwendung mitgelieferte ID-/Versionspaare absichtlich schützt. Die erzeugten Vorschauen stammen aus dem normalen Renderer. Ergebnisse der tatsächlichen Abnahme stehen in `TEST-REPORT.md`.
