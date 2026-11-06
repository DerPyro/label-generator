# Abnahme · Natural Boho 1.1.0

Geprüft am 6. November 2026 mit Node 26.2.0 und Chrome unter Windows.

## Neuer Vertrag

- Beide Layouts verwenden explizite below/asset-Regeln für THC, CBD und Sativa. below ist exklusiv; die letzte Stufe ist ein Catch-all ohne below.
- Alle sechs Grenzen je Kategorie und Layout wurden direkt darunter, exakt darauf und direkt darüber geprüft, zusätzlich 0 und der jeweilige Maximalwert.
- Je Layout eine neu ausgefüllte Papierbasis und ein eigener freigestellter botanischer Vordergrund in nativer Canvas-Größe. Insgesamt 46 Layout-PNGs plus vier dekorative Sprites.
- Reihenfolge: Papier 0 → Tageszeit 100 → Rauch 200 → botanischer Vordergrund 250 → CBD 300 → Textplaketten → Text 500 → kleines Vordergrundornament 600.
- Alle PNGs sind 8-Bit-RGBA. Vordergründe besitzen echte Alpha-Freiflächen; dynamische Texte sind nicht eingebrannt. Schriftdateien und beide OFL-Lizenzen sind lokal enthalten.

## Ergebnisse

- 116 Node-Tests bestanden; keine Fehler. Darunter vier Natural-Boho-Prüfungen sowie Tests für eigene Skalen, Vordergrund, Typografie, ZIP, Druck und bestehende Packs.
- Statische Prüfung des isolierten Releases: vier Packs und 244 RGBA-Layout-Sprites erfolgreich geprüft. Der parallele lokale Watercolor-Umbau ist nicht Bestandteil dieses gezielten Releases.
- Allgemeine Browserprüfung bestanden, einschließlich Ebenensortierung, Warenkorb, PNG/PDF, Typografie und Import.
- Deutsch-/Englisch-Browserprüfung bestanden; Sprachwechsel verändert Grafik, Warenkorb und Druckgeometrie nicht.
- Natural-Boho-Browserabnahme bestanden: alle 42 Einzelstufen, ausgewählte niedrige/mittlere/hohe Kombinationen, kurze und lange Namen, Umlaute, PNG-Pixelgleichheit und transparente Kreisecken.
- Beide Layouts erfolgreich über den gemeinsamen Renderer auf einen maßstäblichen A4-PDF-Bogen exportiert.
- ZIP-Export, echter IndexedDB-Import, Blob-Rendering und Reexport bestanden. Beide Layouts bleiben pixelgleich und die Lizenzen erhalten.
- Natural Boho 1.1.0 im echten Dropdown gewählt, beide Layouts gerendert und die separate Vordergrundebene in der Oberfläche nachgewiesen (tests/natural-boho-selection.html).
- Abschließender CLI-ZIP-Roundtrip samt Manifest, PNGs, Fonts und Limits erfolgreich.

## Grenzen der Prüfung

Die Einzelstufen und ausgewählten Kombinationen wurden geprüft, nicht alle 343 Mischungen je Layout visuell verglichen. Kein physischer Probedruck. Die PDF-Prüfung kontrolliert Export und Geometrie über den gemeinsamen Renderer, ohne zusätzliche Rasterisierung durch einen unabhängigen PDF-Viewer.

Die aufwendige öffentliche Vollprüfung von Version 1.0.0 erreichte ihr Zeitlimit beim Herunterladen der Assets. Die gezielte Auswahlprüfung ist davon unabhängig; ihr Ergebnis wird nach der Veröffentlichung separat geprüft. Lokale Browserprüfungen liefen außerhalb der Ausführungssandbox, da Chrome darin keine DevTools-Verbindung aufbauen konnte.
