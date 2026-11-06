# Stained Glass – Verdant Cathedral

Illustriertes, eigenständig importierbares Texturepack für Label Generator v3,
Version 1.0.0, compatibilityVersion 2. Zwei originale Imagegen-Kompositionen:
Spitzbogenfenster (1024 × 1536) und eigenständige Rosette (1254 × 1254).

## Ebenen und Werte

- Base 0; Genetics 100; THC 200; CBD 300; fester Foreground 400;
  illustriertes Opalmedaillon 450; sieben dynamische Textfelder 500.
- 21 Genetics-Sprites: exklusive Grenzen 5, 10, …, 95, 100; letzte Stufe
  ausschließlich bei 100 % Sativa. Indica ist der Gegenanteil. Violett/Blau
  wandelt sich über Türkis/Grün zu Gold/Bernstein/Rubinrot.
- Neun THC-Sprites: exklusive Grenzen 5, 10, 15, 20, 25, 30, 35, 40.
  Transparente Reflexe lassen Glasfarben und Textmedaillon sichtbar.
- Sieben CBD-Sprites: exklusive Grenzen 2, 5, 8, 11, 14, 17.
  Botanische Glasteile werden kumulativ farbig ausgefüllt; ihre Bleikonturen
  gehören zur unveränderlichen Fensterarchitektur. Vorhandene Teile bleiben
  exakt an Ort und Stelle. Keine Überblendung zwischen Stufen.

Pro Layout 39 Canvas-Layer (1 + 21 + 9 + 7 + 1), insgesamt 78. Die im Auftrag
genannte Summe 76 war ein Rechenfehler. Zusätzlich zwei Canvas-Textmedaillons,
zwei unveränderte Masterillustrationen, drei Vorschauen und drei Kontaktbögen.
Alle PNGs sind 8-Bit-RGBA. Sämtliche Rundlayer haben transparente Außenbereiche.
Keine dynamischen Werte sind in Layer-PNGs eingebrannt.

## Typografie und Druck

Lora für Name, Produzent und Jahr; Abel für die Prozentwerte. Lokale Fonts
und vollständige SIL-OFL-Lizenzen sind enthalten. Sehr lange Texte verkleinert
der Renderer und bricht sie kontrolliert um. Die maximal erlaubten 200/120
Zeichen passen; bei solch extremen Eingaben leidet die Lesbarkeit kleiner
Druckgrößen. Für übliche Namen ist eine Druckbreite ab 60 mm sinnvoll.
Native Auflösung bei 60 mm: etwa 434 dpi Hochformat, 531 dpi Rosette.
Ein physischer Druck-/Farbproof auf dem Zielmaterial steht noch aus.

## Vorschauen und Reproduktion

`classic-portrait-preview.png`, `round-lid-preview.png`, `preview.png`.
`genetics-contact-sheet.png`: alle 21 Farbzustände beider Layouts.
`light-growth-contact-sheet.png`: alle Licht- und Pflanzenzustände.
`combinations-contact-sheet.png`: 54 niedrige/mittlere/hohe Kombinationen.
PROMPTS.md dokumentiert die Originalgenerierung und Ableitung.

Ab Repositorywurzel:

```sh
node v3/scripts/create-verdant-cathedral.js
npm --prefix v3 start
node v3/scripts/run-browser-check.js --url http://localhost:3003/tests/verdant-cathedral.html --artifacts-dir v3/texturepacks/stained-glass-verdant-cathedral
npm --prefix v3 test
npm --prefix v3 run check
node v3/scripts/validate-pack.js v3/texturepacks/stained-glass-verdant-cathedral --zip stained-glass-verdant-cathedral.zip
```

Zum Importieren auf einer Installation ohne diese mitgelieferte Pack-ID die
ZIP-Datei in der Texturepack-Verwaltung auswählen. Eine bereits mitgelieferte
identische ID/Version ist absichtlich gegen lokalen Reimport geschützt.
Siehe TEST-REPORT.md für tatsächlich ausgeführte Prüfungen und Grenzen.
