# v3: Architektur und Asset-Vertrag

v3 ist eine statische Browser-App ohne Build-Schritt oder Backend. Eine Canvas-Rendering-Pipeline wird für alle Packs und Formate verwendet. Der Katalog lädt Manifeste und löst darin registrierte lokale Assets auf; kein Pack-Code wird ausgeführt. v1, v2 und die Root-App sind unabhängig.

## Bausteine

| Bereich | Verantwortung |
| --- | --- |
| `src/config.js`, `src/texturepacks.js` | Globale Stufengrenzen, Katalog, Manifestvalidierung, Konfiguration und sichere relative Asset-URLs |
| `src/model.js`, `src/renderer.js` | Eingaben normalisieren, genau eine PNG-Stufe pro Layer wählen, laden und komponieren, Texte zeichnen, PNG exportieren |
| `src/app.js` | Formular, Pack-/Layoutwahl, Vorschau und Bedienoberfläche |
| `src/cart.js` | Druckaufträge in `localStorage` validieren und verwalten |
| `src/print.js` | Physische Geometrie, A4-Layout, Drehung, Beschnitt, Schnitt-/Kalibrierungsmarken und PDF |
| `src/pack-archive.js`, `src/pack-store.js` | ZIP-Prüfung/-Erstellung und persistente Speicherung importierter Packs in IndexedDB |
| `texturepacks/` | Katalog, drei Pack-Manifeste, Designs, Vorschauen und lizenzierte Fonts |

Katalog und Manifeste sind JSON mit Kompatibilitätsversion 1. Asset-Pfade sind packrelativ; URLs, absolute Pfade und Elternpfade sind unzulässig. Der Warenkorb speichert Schema 2 mit Pack-ID und -Version, Eingabedaten, `layoutId`, Breite und Anzahl. Ein Schema-1-Warenkorb mit `format` wird beim Laden automatisch migriert; beim nächsten Speichern gilt Schema 2. Nicht mehr installierte Pack-Versionen werden nicht still durch andere Assets ersetzt.

`TexturePackManager` verwaltet mitgelieferte und importierte Packs über dieselbe Manifestvalidierung und den Renderer. Für importierte Dateien erstellt er Blob-URLs; der Renderer lädt und prüft die Sprites und Schrift vor dem Speichern. Der Import wird in IndexedDB pro Pack-ID und Version atomar persistiert. Gleiche ID/Version mit unverändertem Inhalt ist ein No-op; anderer Inhalt mit derselben Version wird abgewiesen. Mehrere Versionen derselben Pack-ID können parallel installiert sein, und Warenkorbeinträge pinnen ihre Version. Mitgelieferte ID/Versionen lassen sich nicht erneut importieren. Entfernen ist in der UI gesperrt, solange der Warenkorb diese Version verwendet.

ZIP-Import benötigt einen sicheren Kontext (HTTPS oder `localhost`) und einen Browser mit IndexedDB. Importierte Packs bleiben lokal in diesem Browser; Löschen der Browserdaten entfernt sie. Es gibt keine automatische Sicherung. Per ZIP-Export lassen sich importierte Packs sichern; ein mitgeliefertes Pack kann als ZIP-Vorlage exportiert werden. Das Manifestformat bleibt Kompatibilitätsversion 1.

## Stufen und Layer

Alle Schwellen sind inklusive Obergrenzen und gelten für alle Packs und Layouts:

| Eingabe | Stufenobergrenzen |
| --- | --- |
| Genetik (Sativa) | 14, 29, 44, 59, 74, 89, 100 % |
| THC | 5, 11, 17, 23, 29, 35, 40 % |
| CBD | 2, 5, 8, 11, 14, 17, 20 % |

Der kleinste passende obere Grenzwert bestimmt die PNG-Datei. Dezimalwerte haben dadurch lückenlose Zuordnung; zwischen Vorlagen gibt es keine Überblendung und keine frühere CBD-Wachstumsmaske. Die Zeichenreihenfolge lautet Basis, Genetik, THC, CBD, dynamischer Text (Manifest kann eine gültige Reihenfolge angeben). Bei 0 % THC/CBD kann die gewählte Vorlage transparent sein.

## Layouts und Grafikvertrag

**Watercolor Forest** bietet drei illustrierte Layouts: **Klassisches Hochformat** (1024 × 1536 px), **Breites Querformat** (1536 × 1024 px) und **Runder Deckel** (1254 × 1254 px). Die Illustrationen sind mit OpenAI Image Generation in traditioneller Aquarelloptik erzeugt; es sind keine menschlich gemalten Originale. Herkunft und Prompts sind im Pack dokumentiert. **Woodland Study** und **Ink Study** bleiben technische Beispielpacks mit eigenen Hochformat-, Querformat- und Kreiskompositionen in 1200 × 1800, 1800 × 1200 beziehungsweise 1200 × 1200 px.

Jedes der drei Packs enthält 66 Layer-PNGs (Basis plus je sieben Genetik-, THC- und CBD-PNGs je Layout), zusammen 198. Rund hat eine eigene Komposition und ist kein Zuschnitt des Rechtecks. Alle Layer eines Layouts teilen Canvas und Ursprung; Kreisdesigns haben außerhalb des Kreises transparente Pixel und werden zusätzlich kreisförmig beschnitten. Neue Rechteck-Layouts können über Manifest-Einträge ergänzt werden. Weitere Formen außer `rectangle` und `circle` benötigen zusätzlich passende Validierung, Druckgeometrie und Renderer-Clipping. Alte `formats`-Objekte der Kompatibilitätsversion 1 bleiben beim Laden lesbar und werden zu gleichnamigen Layout-IDs interpretiert.

Transparente Außenbereiche von Basis und Illustrationen bleiben transparent. Der PDF-Beschnitt verlängert Randpixel über die Schnittlinie hinaus; er malt keine Farbe in transparente Pixel. Soll Farbe bis zur Schnittkante gedruckt werden, muss das Bild dort selbst deckende Grafik enthalten und über die Schnittkante hinaus fortgesetzt werden. Details und Gestaltungsgrenzen stehen in [assets/README.md](assets/README.md) und [TEXTUREPACKS.md](TEXTUREPACKS.md).

Textpositionen, Farben und halbtransparente Leseflächen liegen im Manifest pro Pack und Layout. `bleedMm` kann pro Layout als Empfehlung dokumentiert werden; die tatsächlich angewandte Beschnittzugabe wird über die globalen Druckeinstellungen bestimmt. Die lokale Lora-Schrift liegt in jedem Pack samt OFL-Lizenz. Keine Schrift oder Illustration muss beim Rendern aus dem Netz geladen werden.

## Druck

Die gewählte Breite beziehungsweise der Durchmesser in mm und das Canvas-Seitenverhältnis ergeben physische Maße und DPI. Standardmäßig ist **Gemischte Größen** aktiviert und der Planer kann unterschiedliche physische Begrenzungsmaße auf einem A4-Bogen kombinieren. Ist die Option aus, werden gleiche Begrenzungsmaße unabhängig von Layout, Pack und Form zusammen gruppiert. Passende Rechtecke können zur Flächennutzung um 90° gedreht werden. Abstände, Seitenränder, Beschnitt, Schnittmarken und optionale 100 × 100-mm-Kalibrierungsseite sind konfigurierbar. PDF-Seitengrößen und Bildplatzierung werden in Millimetern/Punkten berechnet. Beim Drucken **100 % / Tatsächliche Größe** verwenden.

Die automatische Anordnung lässt sich im Druckbogeneditor manuell ändern: Platzierungen per Maus/Touch ziehen, X/Y in mm einstellen, Rechtecke 90° drehen sowie mit Pfeiltasten fein bewegen. Rückgängig/Wiederholen verwaltet die Geometrie-Historie; zusätzliche leere Seiten sind möglich. **Zurücksetzen** stellt das automatische Layout wieder her. Änderungen an Warenkorb oder Druckeinstellungen verwerfen die manuelle Anordnung und berechnen sie neu.

## Spätere Erweiterungen

Pack-Vererbung und ZIP-Import durch Ablegen einer Datei sind nicht implementiert. Der ZIP-Import über Dateiauswahl, die manuelle Platzierungsbearbeitung und gemischte Etikettengrößen sind umgesetzt; die Trennung von Katalog/Manifest, Asset-Auflösung, Renderer, Speicher, Warenkorb und Drucklayout hält weitere Erweiterungen offen.
