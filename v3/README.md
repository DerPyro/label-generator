# Etiketten-Generator v3

Eigenständige statische Browser-App zum Gestalten von Etiketten und Erstellen maßstäblicher A4-Druckbögen. **Watercolor Forest** ist das erste illustrierte Pack mit KI-generierten Waldlandschaften in traditioneller Aquarelloptik. **Woodland Study** und **Ink Study** bleiben als technische Beispielpacks erhalten. v1, v2 und die Root-App bleiben eigenständig und unverändert.

## Start und Befehle

Für lokale Entwicklung und Prüfungen: Node.js 22 oder neuer. Der veröffentlichte Browserbetrieb benötigt kein Node.js. Im Verzeichnis `v3`:

```sh
npm start
npm test
npm run check
```

Der lokale Server läuft unter `http://localhost:3003`. Die App lässt sich auch über einen statischen Webserver ausliefern; `file://` wird nicht unterstützt.

## GitHub Pages

Für GitHub Pages wird das vollständige Verzeichnis `v3/` einschließlich `texturepacks/`, `vendor/`, `assets/` und `src/` im Repository veröffentlicht. Bei einer Pages-Veröffentlichung aus dem Repository-Root ist der Einstieg `https://derpyro.github.io/label-generator/v3/`. Es gibt keinen Build-Schritt, keine Laufzeitinstallation, keinen API-Schlüssel und keinen Node-Server im veröffentlichten Betrieb. PDF-Bibliothek, Illustrationen und Fonts werden vom selben statischen Ursprung geladen.

Die Browserprüfungen laufen zusätzlich unter einem lokalen Abbild des Projektpfads `/label-generator/v3/`. v1 und v2 bleiben unverändert erreichbar. Ein Push auf den für Pages konfigurierten Veröffentlichungsbranch stellt v3 unter dem eigenen Unterpfad bereit.

Für eine lokale Prüfung dieses Unterpfads kann der Entwicklungsserver mit `BASE_PATH=/label-generator/v3` und einem separaten `PORT` gestartet werden. Die Oberfläche benötigt diese Umgebungsvariablen nicht; sie betreffen ausschließlich den lokalen Testserver.

## Funktionen

Die optionale Sortensuche übernimmt wie in v1 Kurzname, Seed-Produzent, THC, CBD und Genetik aus der CSV. Alle 2.464 Einträge sind nach Name und Produzent durchsuchbar; Treffer lassen sich anklicken oder mit Pfeiltasten und Enter wählen. Eigene Angaben bleiben möglich, Erntejahr und Design bleiben bei der Auswahl erhalten. Unbekannte Genetik bleibt zur manuellen Prüfung stehen; Werte über den v3-Grenzen werden mit Hinweis begrenzt.

`data/strains.csv` ist die statisch ausgelieferte Kopie der Repository-Datei `strains.csv`. Nach Änderungen an dieser Quelldatei im Ordner `v3` einmal `npm run data:sync` ausführen und die aktualisierte Kopie mit veröffentlichen. Der Browser benötigt weiterhin keinen Build oder Serverdienst. Die eigene Browserprüfung steht unter `tests/browser-strains.html`.

- Ein Canvas-Renderer mit benannten, dynamischen Layouts. **Watercolor Forest** bietet Hochformat (1024 × 1536 px), Querformat (1536 × 1024 px) und Rund (1254 × 1254 px) mit jeweils eigener illustrierter Komposition. Die beiden technischen Packs besitzen dieselben Layoutarten in 1200 × 1800, 1800 × 1200 beziehungsweise 1200 × 1200 px.
- Jedes Pack enthält 66 Layer-PNGs: pro Layout eine Basis und je sieben Genetik-, THC- und CBD-Stufen. Über alle drei Packs sind es 198 Layer-PNGs; Vorschauen kommen hinzu. Die Illustrationen von Watercolor Forest sind KI-generierte Grafiken, keine menschlich gemalten Originalaquarelle.
- Feste, inklusive Stufen: Genetik 14/29/44/59/74/89/100 %, THC 5/11/17/23/29/35/40 %, CBD 2/5/8/11/14/17/20 %. THC reicht bis 40 %, CBD bis 20 %; Werte zwischen Schwellen werden der nächsthöheren passenden Stufe zugeordnet, ohne Überblendung.
- Lokale Lora-Schriften unter SIL Open Font License, Sortenname, optionale Produzentenangabe, Live-Vorschau und PNG-Export.
- Druckgröße in Millimetern, DPI-Anzeige, Warenkorb mit `localStorage`, Bearbeitung und Entfernung von Einträgen.
- A4-Vorschau und PDF mit Hoch-/Querformat, automatischer 90°-Drehung rechteckiger Etiketten, Schnittmarken, Beschnitt und Kalibrierungsseite. Gemischte Größen sind standardmäßig aktiv; gleiche physische Maße können layout-, pack- und formübergreifend auf einem Bogen stehen. Beim PDF-Druck **„Tatsächliche Größe“ / 100 %** wählen, „An Seite anpassen“ ausschalten.
- Manueller Druckbogeneditor: Etiketten mit Maus oder Touch verschieben, Position in Millimetern eingeben, Rechtecke drehen, per Pfeiltasten bewegen sowie Änderungen rückgängig machen/wiederholen. Leere Seiten hinzufügen und den automatischen Bogen wiederherstellen.
- Texturepack-ZIP importieren, lokal in IndexedDB speichern, exportieren und entfernen. Importierte Designs verwenden dieselbe Renderer-Pipeline wie mitgelieferte Packs.

Beschnitt erweitert Randpixel außerhalb der unveränderten Schnittgröße. Transparente Außenbereiche bleiben transparent. Für ein Druckergebnis bis zur Schnittkante muss die Illustration selbst bis dorthin reichen; transparente Randpixel erzeugen keine gedruckte Farbe.

## Dokumentation

- [Architektur und Grafikvertrag](ARCHITECTURE.md)
- [Texturepack-Manifeste und Asset-Erstellung](TEXTUREPACKS.md)
- [Watercolor Forest: Layouts, Herkunft und Druck](texturepacks/watercolor-forest/README.md)
- [Platzhalter und Grafikhinweise](assets/README.md)
- [Ausgangszustand und ursprünglicher Implementierungsplan](BESTANDSAUFNAHME.md)

Pack-Vererbung und ZIP-Import per Datei-Drop sind nicht implementiert. Das Verschieben von Etiketten im Druckbogeneditor per Maus oder Touch ist verfügbar. Manuelle Anordnungen werden bei Warenkorb- oder Druckeinstellungsänderungen zurückgesetzt. Importierte Packs liegen nur lokal in IndexedDB dieses Browsers; Browserdatenlöschung entfernt sie. Exportiere wichtige Packs als ZIP-Sicherung. Der Import benötigt HTTPS oder `localhost`.

Native Prüfungen laufen mit `npm test`, Manifest-/PNG-/Syntaxprüfungen mit `npm run check`. Nach dem Serverstart prüft `http://localhost:3003/tests/browser.html` die echte Browser-Pipeline einschließlich Pack-Wechsel, Formaten, Warenkorb und mehrseitigem PDF. Für die Druckkontrolle die optionale Kalibrierungsseite bei 100 % ausgeben und das 100-mm-Quadrat nachmessen.

Ein tatsächlicher Probedruck auf dem vorgesehenen Drucker und Etikettenpapier steht weiterhin aus. Dabei Lesbarkeit, Farben und Kanten prüfen; die digitale Maßprüfung ersetzt diese physische Druckabnahme nicht.

Für einen automatisierten Browser-Durchlauf: Server starten und `npm run test:browser` ausführen. Chrome wird im Hintergrund mit einem separaten temporären Profil gestartet; einen anderen Chrome-Pfad kannst du über `CHROME_PATH` angeben. Mit `-- --url http://localhost:3004/label-generator/v3/tests/browser.html` lässt sich der Projekt-Pages-Pfad prüfen.
