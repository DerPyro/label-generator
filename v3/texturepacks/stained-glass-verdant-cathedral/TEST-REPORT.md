# Verdant Cathedral · Testbericht

Stand: 6. November 2026, Version 1.0.0, compatibilityVersion 2.

## Ergebnis

- `npm --prefix v3 test`: 119/119 Tests erfolgreich, einschließlich zwei
  packspezifischer Regressionstests.
- `npm --prefix v3 run check`: fünf Katalogpacks und 343 RGBA-Layer geprüft.
- `npm --prefix v3 run test:browser`: vollständige bestehende Browser-Suite
  erfolgreich, einschließlich ZIP-/IndexedDB-, PNG-, PDF- und Oberflächentests.
- `tests/verdant-cathedral.html`: beide Layouts in nativer Größe dekodiert;
  jede der 21/9/7 Stufen gerendert und als unterschiedliches Ergebnis geprüft;
  alle exklusiven Grenzen unmittelbar darunter, darauf und darüber sowie
  sämtliche Null-/Maximalwerte geprüft. 27 Kombinationen je Layout, insgesamt
  54, zusätzlich im Kontaktbogen dokumentiert.
- Lange Namen und Produzenten, 200 bzw. 120 breite W-Zeichen, Dezimalwerte
  und leerer Produzent werden ohne Abschneiden gerendert. Extremtexte benötigen
  kleinere Schriftgrade; normale Namen bleiben erheblich größer.
- Pixelprüfungen: alle Genetics-Alphamasken identisch; ein statischer
  Foreground je Layout; keine dynamischen Overlaypixel auf dessen deckenden
  Fassungen oder auf dem Opalmedaillon; maximale THC-Deckkraft unter 25 %;
  CBD-Stufen fügen Pixel hinzu und erhalten alle vorhandenen Pixel bytegleich.
- PNG-Dateien: 8 Bit, RGBA/Farbtyp 6, korrekte Abmessungen; keine identischen
  Sprites innerhalb einer Kategorie. Kreisaußenbereiche transparent.
- PNG-Export nach erneutem Dekodieren pixelgleich mit der Live-Vorschau.
  Der echte gemeinsame PDF-Druckbogen enthält beide Layouts bei 60 mm Breite,
  eine A4-Seite und unverzerrte Proportionen. Mit Poppler bei 140 dpi gerendert
  und visuell geprüft: keine abgeschnittenen Texte, keine schwarzen Kästen,
  unveränderte Komposition. Die Druckplanung dreht das Hochformat zulässig
  um 90 Grad. PDF-Prüfdatei: `v3/output/verdant-cathedral-source/print-proof.pdf`.
- `validate-pack.js … --zip stained-glass-verdant-cathedral.zip`: Manifest,
  Assetreferenzen, lokale Fonts und vollständiger ZIP-Roundtrip erfolgreich.
- `tests/verdant-cathedral-install.html`: unverändertes ZIP über den echten
  Importer und IndexedDB installiert, beide Layouts aus Blob-Assets gerendert,
  nach erneutem Öffnen geladen, identischen Reimport erkannt und Testimport
  entfernt. Nur der Testkatalog lässt das Pack aus, um eine Installation ohne
  bereits mitgelieferte ID/Version zu simulieren. Anschließend das echte
  App-Dropdown bedient und beide mitgelieferten Layouts ausgewählt.

## Budget und Lieferumfang

97 Dateien einschließlich dieses Berichts, 88 RGBA-PNGs, rund 95 MiB entpackt.
139.666.344 PNG-Pixel (133,20 Mi-Pixel), größte Datei rund 4,04 MiB.
Damit unter 256 Einträgen, 192 MiB entpackt, 160 Mi-Pixel und 16 MiB/Datei.
Das rund 95 MiB große ZIP liegt unter dem Limit von 160 MiB.

78 eigentliche Canvas-Layer, zwei Textmedaillons, zwei Masterillustrationen,
drei Vorschauen und drei Kontaktbögen. Zwei lokale Fontdateien mit beiden
vollständigen OFL-Lizenzen. Die Master wurden ausschließlich verlustfrei in
RGBA normalisiert; die RGB-Samples bleiben unverändert.

## Grenzen und Änderungen

Kein physischer Druck- oder Material-/Farbproof. Sehr kleine Etiketten und
maximale Textlängen können die Lesbarkeit vermindern. Nicht jede der 1.323
möglichen Stufenkombinationen je Layout wurde einzeln visuell begutachtet;
alle Stufen, Grenzfälle, Alphageometrien und 54 Extrem-/Mittel-Kombinationen
sind geprüft. Botanisches Wachstum bedeutet kumulative farbige Ausgestaltung
fest begrenzter Glasteile; die botanischen Bleikonturen bleiben auch bei
niedrigem CBD als Teil der Fensterarchitektur sichtbar.

Bestehender Renderer, Manifest-Schema, andere Texturepacks, v1 und v2 wurden
nicht verändert. Außerhalb des neuen Packverzeichnisses: Katalogeintrag,
Erstellungsskript, zwei Browser-Prüfseiten, ein Regressionstest und das
eigenständige ZIP. Bereits vorhandene unversionierte Ausgaben und Prüfseiten
im Arbeitsverzeichnis wurden beibehalten.
