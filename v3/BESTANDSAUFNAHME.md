# Bestandsaufnahme und Implementierungsplan · 5. November 2026

Dieses Dokument hält den **Ausgangszustand vor Umsetzung dieses Auftrags** fest. Die beschriebenen Lücken wurden anschließend in den Phasen 2–6 bearbeitet. Der aktuelle Funktionsstand steht in `README.md`, die Architektur in `ARCHITECTURE.md` und der Manifestvertrag in `TEXTUREPACKS.md`.

## Bereits implementiert

- Eigenständige statische v3 unter `v3/`, ES-Module ohne Frontend-Framework oder Build-Abhängigkeit.
- Eine Canvas-Sprite-Engine in `src/renderer.js`, mit PNG-Layern, lokal gebündelter Schrift, Textumbruch, optionalem Seed-Produzenten und PNG-Export.
- Vorschau-Puffer und Auftragsnummern verhindern, dass ein langsamer alter Render-Auftrag neuere Eingaben überschreibt.
- Sieben unterschiedliche PNG-Dateien je Eigenschaft, jedoch bislang mit stufenloser Wald-/Wettermischung und räumlicher CBD-Freilegung statt der neuen festen Werteklassen.
- Deutsches responsives Formular mit THC-/CBD-Slidern, Genetik-Gegenanteilen und Ebeneninspektor.
- Native Node-Tests und eine Browser-Testseite; lokaler Server auf Basis des Node-Standardmoduls `http`.

## Teilweise implementiert

- Die bisherige Konfiguration enthält Pfade, Schrift und Textpositionen, ist aber noch kein validiertes, unabhängig ladbares Pack-Manifest.
- v2 besitzt ein separat aufgebautes rundes SVG mit eigenen Text- und Bildpositionen. Es ist keine zweite geeignete PNG-Engine: Wiederverwendet wird das Prinzip eigener quadratischer Koordinaten und eines eigenen Layouts; v3s bestehende Canvas-Pipeline bleibt der einzige Renderer.
- Bisherige CBD-Dateien sind kumulative Ausschnitte desselben Rahmens. Der neue Auftrag verlangt sieben eigenständig sichtbare Ornamentgrade, auch für den Kreis.
- Die bisherige CBD-Grenze von 30 % und stufenlose Auswahl werden durch den neuen Auftrag ausdrücklich ersetzt: CBD 0–20 %, genau sieben feste Klassen.

## Noch nicht implementiert zu Beginn dieses Auftrags

- Texturepack-Katalog, Manifestvalidierung, Auswahl und sichere Asset-Auflösung.
- Eigene runde PNG-Kompositionen, unabhängige Schriftlayouts und austauschbare Designs.
- Physische Größe, DPI-Anzeige, Druckwarenkorb, Persistenz und Bearbeitung.
- A4-Anordnung, Druckvorschau, mehrseitiger maßstäblicher PDF-Export, Schnittmarken und Kalibrierungsseite.
- ZIP-Import und IndexedDB-Verwaltung; diese bleiben ausdrücklich spätere Erweiterungen.

## Versions-, Branch- und Deploymentprüfung

Lokaler und entfernter `main` stehen bei `2aee03348bd6e48c5ad713fbce7054cfb4c8a021`. Die GitHub-Abfrage am 5. November ergab nur den Branch `main` und keine offenen Pull Requests. `git status` meldet die bisherigen v3-Arbeiten als unversioniertes Verzeichnis; diese werden vollständig weiterverwendet. Es gibt weder lokal noch im entfernten Repository ein `.github`-Verzeichnis mit Deployment-Workflows.

Die GitHub-Pages-Administration ist über den vorhandenen GitHub-Connector nicht abrufbar; die konkrete Einstellung des Pages-Quellbranches wird daher nicht als bestätigt dargestellt. Die vorhandene README verlinkt die statische Veröffentlichung unter `https://derpyro.github.io/label-generator/`. Neue Pfade bleiben relativ zu `v3/`, ohne serverseitiges Routing oder Laufzeit-CDN. Für eine Veröffentlichung aus dem Repository-Root ist v3 unter `/label-generator/v3/` erreichbar. Es wird keine bestehende Hosting-Einstellung geändert.

`v1/index.html`, `v2/index.html`, die bisherige Root-HTML sowie der Scraper und Katalog bleiben unverändert. Es erfolgt kein automatischer Commit, Push oder Deployment.

## Wiederverwendbare Komponenten

| Bestehender Teil | Erweiterung |
| --- | --- |
| `model.js` Eingabevalidierung und Renderplan | zentrale typisierte siebenstufige Schwellenwerte, Pack-/Formatinformationen |
| `renderer.js` PNG-/Font-Cache, Text, Puffer, Export | Manifest-Konfiguration, sichere aufgelöste Asset-URLs, Formate, Masken und Layer-Reihenfolge |
| `app.js`, `index.html`, `styles.css` | Pack-/Formatauswahl, Warenkorb und Druckbereich |
| Platzhalter-PNGs und Erzeugungsskripte | vollständige Beispielpacks mit eigenen rechteckigen und runden Kompositionen |
| Native und Browser-Tests | Grenzwerte, Pack-Validierung, Formate, Persistenz, physische PDF-Maße |

## Konkrete Umsetzung

1. **Phase 2:** zentrale inklusive Obergrenzen und Grenzen 100/40/20 definieren, lückenlose Dezimalzuordnung sowie alle Grenzwerte testen. Jeder dynamische Layer wählt genau eine von sieben Dateien.
2. **Phase 3:** `TexturePackManager`, Pack-Katalog und validierte Manifeste ergänzen. Die bestehende Engine liest die daraus aufgelöste Konfiguration. Zwei eindeutig als Platzhalter bezeichnete Beispielpacks demonstrieren den Stilwechsel.
3. **Phase 4:** für beide Packs je 22 rechteckige und 22 eigene runde PNGs sowie separate Textlayouts bereitstellen; Kreisränder auf echte Transparenz prüfen.
4. **Phase 5:** Konfigurationen samt Pack-Version, Format, Größe und Stückzahl persistent speichern. Bearbeiten, Entfernen und Leeren im bestehenden Editor ergänzen.
5. **Phase 6:** Millimeter-Geometrie, A4-Gruppierung, Drehungswahl, Vorschau und lokalen PDF-Export integrieren. PDF-Tests prüfen Seitengrößen und Platzierungsmatrizen in Punkten, nicht lediglich Screenshots.
6. **Abnahme:** native Tests, Browserprüfung, Desktop-/Mobilansicht und unveränderte Altversionen prüfen; Start-, Pack- und Druckdokumentation aktualisieren.

Phase 7 (ZIP, IndexedDB, Vererbung, Drag-and-drop, freie Positionierung und Mischgrößen auf derselben Seite) wird erst später umgesetzt. Die Services und Pack-Schnittstellen halten diese Erweiterungen offen.

## Abnahmestand nach Umsetzung

Phasen 2–6 sind lokal implementiert: feste siebenstufige Auswahl, validierte Packs, zwei vollständige Beispielpacks mit insgesamt 88 Format-PNGs, eigene Rundgrafiken, Millimetergrößen, persistenter Druckwarenkorb und mehrseitige A4-PDFs. 27 native Tests, statische Manifest-/PNG-/Syntaxprüfung und 14 Browserprüfungen bestehen. Der Browser-Durchlauf wurde auch unter `/label-generator/v3/` ausgeführt. Die PDF-Prüfungen lesen tatsächliche Seitengrößen und Bildmatrizen aus den erzeugten Dateien und prüfen das 100 × 100-mm-Referenzquadrat. Desktop- und schmale Oberfläche wurden zusätzlich visuell geprüft. Es wurde nichts veröffentlicht; die v1-/v2-Dateien bleiben unverändert.

## Funktionsstand nach Layout- und Druckbogen-Erweiterung · 5. November 2026

Der obige Ausgangszustand und die damalige Phasenplanung bleiben als historische Momentaufnahme erhalten. Seitdem sind die Texturepacks auf Manifest-Layouts umgestellt. Beide enthalten Hochformat (1200 × 1800), rundes Layout (1200 × 1200) und Querformat (1800 × 1200), je 66 Sprites pro Pack. Das Querformat wird als eigene technische Platzhaltergrafik erzeugt. Kompatibilitätsversion 1 und alte Manifest-`formats`-Objekte bleiben lesbar.

Der Warenkorb verwendet Schema 2 mit `layoutId`; gespeicherte Schema-1-Einträge mit `format` werden beim Laden migriert und bei der nächsten Speicherung als Schema 2 geschrieben. Der A4-Druckbogeneditor unterstützt gemischte Etikettengrößen (standardmäßig eingeschaltet), manuelles Ziehen per Maus/Touch, mm-Positionseingabe, 90°-Drehung, Pfeiltasten, Rückgängig/Wiederholen, zusätzliche Leerseiten und Zurücksetzen auf die automatische Anordnung. Warenkorb- oder Druckeinstellungsänderungen setzen die manuelle Anordnung zurück. ZIP-Import per Dateiauswahl und -Export sind umgesetzt; Datei-Drop und Pack-Vererbung nicht.
