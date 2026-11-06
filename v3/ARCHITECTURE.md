# v3: Architektur und Asset-Vertrag

v3 ist eine statische Browser-App ohne Build-Schritt oder Backend. Eine Canvas-Rendering-Pipeline wird für alle Packs und Formate verwendet. Der Katalog lädt Manifeste und löst darin registrierte lokale Assets auf; kein Pack-Code wird ausgeführt. v1, v2 und die Root-App sind unabhängig.

## Bausteine

| Bereich | Verantwortung |
| --- | --- |
| `src/config.js`, `src/texturepacks.js` | Standard-Stufengrenzen, packeigene Skalen, Katalog, Manifestvalidierung, Konfiguration und sichere relative Asset-URLs |
| `src/model.js`, `src/renderer.js`, `src/typography.js` | Eingaben normalisieren, genau eine PNG-Stufe pro Layer wählen, sortierte Elementliste bilden, Assets/Fonts laden, Felder vermessen, Texte und Dekorationen zeichnen, PNG exportieren |
| `src/manifest-schema.js`, `schemas/texturepack.schema.json` | Gemeinsame Schemaquelle für Laufzeit und JSON-Editoren; veröffentlichte JSON-Datei wird mit `scripts/write-schema.js` generiert |
| `src/app.js` | Formular, Pack-/Layoutwahl, Vorschau und Bedienoberfläche |
| `src/cart.js` | Druckaufträge in `localStorage` validieren und verwalten |
| `src/print.js` | Physische Geometrie, A4-Layout, Drehung, Beschnitt, Schnitt-/Kalibrierungsmarken und PDF |
| `src/pack-archive.js`, `src/pack-store.js` | ZIP-Prüfung/-Erstellung und persistente Speicherung importierter Packs in IndexedDB |
| `texturepacks/` | Katalog, drei Pack-Manifeste, Designs, Vorschauen und lizenzierte Fonts |

Katalog und Manifeste sind JSON mit Kompatibilitätsversion 2. Die vorherige Manifest-Spezifikation wird ausdrücklich abgewiesen, auch bei bereits in IndexedDB installierten Packs. Die Meldung fordert die Aktualisierung auf die neue Spezifikation; eine Fremdpack-Migration findet nicht statt. Asset-Pfade sind packrelativ; URLs, absolute Pfade und Elternpfade sind unzulässig. Der Warenkorb speichert weiterhin Schema 2 mit Pack-ID und -Version, Eingabedaten, `layoutId`, Breite und Anzahl. Ein Schema-1-Warenkorb mit `format` wird beim Laden automatisch migriert; beim nächsten Speichern gilt Schema 2. Fehlende oder inkompatible Pack-Versionen werden kontrolliert in Vorschau und Druck gemeldet; ihre Einträge bleiben gespeichert.

`TexturePackManager` verwaltet mitgelieferte und importierte Packs über dieselbe Manifestvalidierung und den Renderer. Für importierte Dateien erstellt er Blob-URLs; der Renderer lädt und prüft die Sprites und Schrift vor dem Speichern. Der Import wird in IndexedDB pro Pack-ID und Version atomar persistiert. Gleiche ID/Version mit unverändertem Inhalt ist ein No-op; anderer Inhalt mit derselben Version wird abgewiesen. Mehrere Versionen derselben Pack-ID können parallel installiert sein, und Warenkorbeinträge pinnen ihre Version. Mitgelieferte ID/Versionen lassen sich nicht erneut importieren. Entfernen ist in der UI gesperrt, solange der Warenkorb diese Version verwendet.

ZIP-Import benötigt einen sicheren Kontext (HTTPS oder `localhost`) und einen Browser mit IndexedDB. Importierte Packs bleiben lokal in diesem Browser; Löschen der Browserdaten entfernt sie. Es gibt keine automatische Sicherung. Per ZIP-Export lassen sich importierte Packs sichern; ein mitgeliefertes Pack kann als ZIP-Vorlage exportiert werden. Zusätzliche PNG-Dekorationen und Feldhintergründe durchlaufen dieselben Pfad-, CRC-, Größen-, Pixelbudget- und Dekodierungsprüfungen wie die bestehenden Assets. Ihre Dateiauflösung darf von der Zielgröße abweichen; dynamische Layer und Masken benötigen weiterhin volle Canvas-Abmessungen.

## Stufen und Layer

Die Standardform mit sieben PNG-Pfaden verwendet diese inklusiven Obergrenzen:

| Eingabe | Stufenobergrenzen |
| --- | --- |
| Genetik (Sativa) | 14, 29, 44, 59, 74, 89, 100 % |
| THC | 5, 11, 17, 23, 29, 35, 40 % |
| CBD | 2, 5, 8, 11, 14, 17, 20 % |

Alternativ definiert jede Kategorie im Layout 1–64 eigene Stufenobjekte mit `below` und `asset`. `below` ist exklusiv; der letzte Eintrag muss die Grenze weglassen und deckt den Rest ab. `src/scales.js` prüft streng aufsteigende Grenzen innerhalb der Eingabebereiche und löst Asset-Pfade beider Schreibweisen auf. Kategorien können unabhängig unterschiedliche Anzahlen haben; Genetik wird über den Sativa-Anteil ausgewählt. Schema, Asset-Auflösung und ZIP-Prüfung unterstützen beide Formen.

In der Standardform bestimmt der kleinste passende obere Grenzwert die PNG-Datei. Dezimalwerte haben dadurch lückenlose Zuordnung; zwischen Vorlagen gibt es keine Überblendung und keine frühere CBD-Wachstumsmaske. Bei 0 % THC/CBD kann die gewählte Vorlage transparent sein.

`getRenderPlan` liefert die logischen Kategorien unter `layers` und die gemeinsame sichtbare Komposition unter `elements`. Jeder Layer erhält seinen expliziten zIndex aus `layout.zIndex`; Felder und Dekorationen tragen ihn selbst. Aufsteigend sortieren, bei Gleichstand nach Einfügeindex: Basis, Genetik, THC, CBD, eingebettete Hintergründe in Feldreihenfolge, freie Dekorationen in Arrayreihenfolge, Textfelder in Arrayreihenfolge. Die sortierte Liste bestimmt die tatsächliche Zeichenreihenfolge. Die optionale volle Canvas-Ebene `foreground` ist ein fester PNG-Pfad oder eine unabhängige Sativa-Skala. Sie trennt die vorderen Bäume von der Genetik-Landschaft; mit zIndex 250 liegt sie vor THC/Wetter (200) und hinter CBD/Ornamenten (300). Assetauflösung, ZIP-Validierung, Preloading, Masken, die Ebenenliste und persistierte Sprite-Reihenfolgen unterstützen vier oder fünf Bildebenen. Vorschau, PNG und PDF nutzen dieselbe Reihenfolge. Kategorie-Sichtbarkeit und Alpha-Masken werden pro Element angewendet. `text` umfasst auch Dekorationen; Element-IDs ermöglichen eine spätere Einzelauswahl.

`typography.js` formatiert nur definierte Werteoptionen, vermisst gerade Zeilen mit optionalem Zeichenabstand und passt die Schriftgröße bis zur Untergrenze an. Unpassende Texte erzeugen einen Fehler mit Feld-ID. Bogentext vermisst einzelne Unicode-Codepunkte, verteilt sie entlang der verfügbaren Bogenlänge und zeichnet sie tangential. Texte und Dekorationen besitzen lokale Canvas-Transformationen mit `save`/`restore`. `relativeTo` ist ausschließlich von Dekorationen zu Textfeldern zulässig, wodurch Zyklen und Ketten bereits strukturell ausgeschlossen sind.

Der Font-Lader registriert alle lokalen Familien über `FontFace` und isoliert sie anhand der vollständigen Pack-/Assetidentität. Bild- und Font-Promises werden gecacht; fehlgeschlagene Einträge werden entfernt. Rendering findet zunächst in einem Offscreen-Arbeitscanvas statt. Ein Jobzähler verhindert, dass langsamere ältere Vorschauaufträge neuere Ergebnisse überschreiben. Erst ein vollständig erfolgreicher Renderauftrag ersetzt das Zielcanvas.

## Layouts und Grafikvertrag

**Watercolor Forest** bietet drei illustrierte Layouts: **Klassisches Hochformat** (1024 × 1536 px), **Breites Querformat** (1536 × 1024 px) und **Runder Deckel** (1254 × 1254 px). Die Illustrationen sind mit OpenAI Image Generation in traditioneller Aquarelloptik erzeugt; es sind keine menschlich gemalten Originale. Herkunft und Prompts sind im Pack dokumentiert. **Woodland Study** und **Ink Study** bleiben technische Beispielpacks mit eigenen Hochformat-, Querformat- und Kreiskompositionen in 1200 × 1800, 1800 × 1200 beziehungsweise 1200 × 1200 px.

Watercolor Forest 1.1.0 enthält 87 Layer-PNGs: pro Layout eine Basis und je sieben hintere Landschaften, Wetterstufen, transparente Baum-Vordergründe und Ornamentstufen. Die vollständigen Landschaften wurden dafür mit Imagegen in passende hintere und vordere Motive aufgeteilt; native Auflösung und Textkoordinaten bleiben erhalten. Woodland und Ink verwenden weiterhin vier Bildebenen ohne separaten Vordergrund. Rund hat eine eigene Komposition und ist kein Zuschnitt des Rechtecks. Alle Layer eines Layouts teilen Canvas und Ursprung; Kreisdesigns haben außerhalb des Kreises transparente Pixel und werden zusätzlich kreisförmig beschnitten. Weitere Formen außer `rectangle` und `circle` benötigen zusätzlich passende Validierung, Druckgeometrie und Renderer-Clipping.

Transparente Außenbereiche von Basis und Illustrationen bleiben transparent. Der PDF-Beschnitt verlängert Randpixel über die Schnittlinie hinaus; er malt keine Farbe in transparente Pixel. Soll Farbe bis zur Schnittkante gedruckt werden, muss das Bild dort selbst deckende Grafik enthalten und über die Schnittkante hinaus fortgesetzt werden. Details und Gestaltungsgrenzen stehen in [assets/README.md](assets/README.md) und [TEXTUREPACKS.md](TEXTUREPACKS.md).

Textpositionen, Farben und halbtransparente Leseflächen liegen im Manifest pro Pack und Layout. `bleedMm` kann pro Layout als Empfehlung dokumentiert werden; die tatsächlich angewandte Beschnittzugabe wird über die globalen Druckeinstellungen bestimmt. Die lokale Lora-Schrift liegt in jedem Pack samt OFL-Lizenz. Keine Schrift oder Illustration muss beim Rendern aus dem Netz geladen werden.

## Druck

Die gewählte Breite beziehungsweise der Durchmesser in mm und das Canvas-Seitenverhältnis ergeben physische Maße und DPI. Standardmäßig ist **Gemischte Größen** aktiviert und der Planer kann unterschiedliche physische Begrenzungsmaße auf einem A4-Bogen kombinieren. Ist die Option aus, werden gleiche Begrenzungsmaße unabhängig von Layout, Pack und Form zusammen gruppiert. Passende Rechtecke können zur Flächennutzung um 90° gedreht werden. Abstände, Seitenränder, Beschnitt, Schnittmarken und optionale 100 × 100-mm-Kalibrierungsseite sind konfigurierbar. PDF-Seitengrößen und Bildplatzierung werden in Millimetern/Punkten berechnet. Beim Drucken **100 % / Tatsächliche Größe** verwenden.

Die automatische Anordnung lässt sich im Druckbogeneditor manuell ändern: Platzierungen per Maus/Touch ziehen, X/Y in mm einstellen, Rechtecke 90° drehen sowie mit Pfeiltasten fein bewegen. Rückgängig/Wiederholen verwaltet die Geometrie-Historie; zusätzliche leere Seiten sind möglich. **Zurücksetzen** stellt das automatische Layout wieder her. Änderungen an Warenkorb oder Druckeinstellungen verwerfen die manuelle Anordnung und berechnen sie neu.

## Spätere Erweiterungen

Ein grafischer Texturepack-Editor, Pack-Vererbung und ZIP-Import durch Ablegen einer Datei sind nicht implementiert. Der ZIP-Import über Dateiauswahl, unabhängige Textfelder, PNG-/Flächenhintergründe, Vordergrundsprites, Rotation und Bogentext sind umgesetzt. Auch die manuelle Druckplatzierungsbearbeitung und gemischte Etikettengrößen bleiben nutzbar. Die Trennung von Manifestdaten, Asset-Auflösung, sortierten Elementen, Textgeometrie, Renderer, Speicher, Warenkorb und Drucklayout hält weitere Erweiterungen offen.

## Validierung und Beispiele

Die Runtime interpretiert die im veröffentlichten Schema verwendeten JSON-Schema-Schlüssel direkt aus der gemeinsamen Schemaquelle. Ein Test prüft deren exakte Gleichheit. Beziehungen wie eindeutige Element-/Layout-/Familien-IDs, registrierte Fonts, Kreisabmessungen, Größenbereiche zwischen Eigenschaften und Referenzen werden zusätzlich semantisch geprüft. Unbekannte Eigenschaften, nicht endliche Zahlen und unsichere Pfade werden abgewiesen.

`examples/composition` demonstriert zwei echte Schriftfamilien, gebundene und freie Dekorationen, Rotation und ein rundes Bogenlayout. `examples/template` ist eine kleine gültige Vorlage. `scripts/validate-pack.js` prüft beliebige Packverzeichnisse einschließlich ZIP-Roundtrip und kann ein ZIP erzeugen. Node-Tests prüfen Geometrie/Schema/Assets; Browser-Tests prüfen echte Fonts, PNG, PDF, UI, alte lokale Packs und identische zIndex-Kompositionen in allen Ausgabewegen. Details: [TEXTUREPACKS.md](TEXTUREPACKS.md) und [TEXTUREPACK_AI_GUIDE.md](TEXTUREPACK_AI_GUIDE.md).
