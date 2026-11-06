# Stained Glass – Verdant Cathedral 1.1.0

Eigenständig importierbares, illustriertes Texturepack für Label Generator v3,
compatibilityVersion 2. Hochformat 1024 × 1536 und eigenständige runde Rosette
1254 × 1254. Die Revision macht Genetik und Gehalt unmittelbar erkennbar.

## Visuelle Zuordnung

- **Genetik färbt das ganze Glas**, einschließlich der Textmitte, aller seitlichen
  Scheiben und der oberen und unteren Motivkammern. 0 % Sativa ist violett,
  25 % saphirblau, 50 % türkisgrün, 75 % goldfarben und 100 % warm rot.
  Dunkle metallische Bleifassungen behalten ihre Position und Materialfarbe.
- **THC füllt den oberen Bereich**: neun Zustände von leer bis acht erkennbaren
  Himmelsmotiven. Nacheinander kommen Mondsichel, Sonne, Saturn, Himmelsstern,
  Orbitalplanet, Sternbild, Komet und Mondphasen hinzu. Motive bewegen sich
  beim Wechsel nicht. Die ausdrücklich gewünschte Astronomie ersetzt die
  Lichtreflexe aus Version 1.0.
- **CBD lässt unten eine Pflanze wachsen**: sieben kumulative Zustände von der
  kleinen Wurzel mit ersten Blättern bis zum vollen Jugendstil-Ornament mit
  Ranken, Efeu, Farnen und Blüten. Wachstum folgt den Verzweigungen der Pflanze.
  Es gibt keine fest eingebauten floralen Hintergrundflächen.
- **Werte sind größer und kräftiger**: separate Beschriftungen über THC, CBD,
  Indica und Sativa; große Prozentangaben in lokal eingebundener Lora. Die
  Prozentwerte tragen bei normaler Breite mindestens 40 native Pixel Größe.

## Skalen und Ebenen

Genetics: 21 Stufen, exklusive Grenzen 5, 10, …, 95, 100; die letzte Stufe
gilt nur für 100 % Sativa. THC: neun Stufen, exklusive Grenzen 5, 10, 15, 20,
25, 30, 35, 40. CBD: sieben Stufen mit Grenzen 2, 5, 8, 11, 14, 17.
Pro Kategorie wird genau ein Sprite gewählt, ohne Überblendung.

Base 0; Genetics 100; THC 200; CBD 300; ein statischer Foreground 400;
alle Texte 500. Keine deckende Textplakette über der Genetikfarbe.
Je Layout 39 Canvas-Layer, insgesamt 78, echte 8-Bit-RGBA-PNGs. Kreisaußenbereiche
sind transparent. Hinzu kommen vier Originalmaster, drei Vorschauen und vier
Kontakt-/Vergleichsbögen. Keine dynamischen Werte sind in Layer-PNGs eingebrannt.

## Vorschauen, Lizenz und Druck

`revision-comparison.png` zeigt beide Layouts mit niedrigen, mittleren und
hohen Werten. `genetics-contact-sheet.png` zeigt alle 21 Genetikfarben,
`light-growth-contact-sheet.png` alle Astronomie-/Pflanzenstufen und
`combinations-contact-sheet.png` 54 niedrige/mittlere/hohe Kombinationen.
Die vollständigen Vorschauen heißen `classic-portrait-preview.png` und
`round-lid-preview.png`; `preview.png` ist die Katalogvorschau.

Alle Grafiken sind originale Imagegen-Arbeiten; Herkunft und Bildprompts stehen
in PROMPTS.md und ASSET-LICENSE.txt. Lora liegt lokal mit vollständiger SIL OFL.
Sehr lange Namen/Produzenten werden kontrolliert umgebrochen und verkleinert.
Bei maximalen 200/120 Zeichen oder sehr kleinen Etiketten nimmt die Lesbarkeit
ab. Empfohlene Prüfbreite 60 mm: etwa 434 dpi Hochformat, 531 dpi rund.
Ein physischer Druck- und Farbproof auf dem Zielmaterial steht aus.

## Erzeugen und prüfen

Ab Repositorywurzel:

```sh
node v3/scripts/create-verdant-cathedral.js
npm --prefix v3 start
node v3/scripts/run-browser-check.js --url http://localhost:3003/tests/verdant-cathedral.html --artifacts-dir v3/texturepacks/stained-glass-verdant-cathedral
npm --prefix v3 test
npm --prefix v3 run check
npm --prefix v3 run test:browser
node v3/scripts/validate-pack.js v3/texturepacks/stained-glass-verdant-cathedral --zip stained-glass-verdant-cathedral.zip
```

Für den zusätzlichen Browser-Installationstest das erzeugte ZIP nach
`v3/output/verdant-cathedral-source/import.zip` kopieren und
`tests/verdant-cathedral-install.html` öffnen. Der Test simuliert eine
Installation ohne bereits mitgelieferte Pack-ID/Version. In der normalen
Anwendung ist dieses identische mitgelieferte ID-/Versionspaar geschützt.
1.1.0 kann neben einer lokal importierten 1.0.0 koexistieren.
