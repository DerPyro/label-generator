# Verdant Cathedral 1.1.0 · Bildherkunft und Prompts

Die Revision ersetzt die zurückhaltende Farbtemperatur und Lichtreflexe der
Version 1.0 durch ganzflächige Genetikfarbe, astronomische THC-Motive oben und
ein tatsächlich wachsendes CBD-Ornament unten. Alle vier Originale wurden mit
dem integrierten OpenAI Imagegen-Werkzeug am 6. November 2026 erstellt.
Die ersten beiden bearbeiten die eigenen bisherigen Masterillustrationen;
für die beiden neuen transparenten Motivmaster gab es keine Bildvorlagen.

## Hochformat · Bearbeitung des bisherigen Masters

Use case: precise-object-edit. Edit this stained-glass label into an improved neutral master for a dynamic texture pack, exact 1024x1536 portrait. Preserve its finely crafted Gothic outer frame and pointed arch identity, orthographic full-canvas view. REMOVE ALL botanical motifs: no leaves, stems, flowers, ferns anywhere, including the bottom. Replace their cells with luminous plain handblown glass; no ghost floral outlines. Simplify the upper inner tracery to create a LARGE uninterrupted empty pointed glass chamber from x280 to744 y95 to435, for later astronomical imagery; do not put symbols there yet. The bottom x190..834 y1150..1460 must be an uninterrupted clear glass chamber for a later growing floral ornament. Middle x220..804 y490..1100 is quiet uninterrupted glass for text. All glass throughout the entire window, INCLUDING central medallion, side columns, top and bottom, is the SAME restrained pale blue-grey translucent glass with ripples, soft variations in thickness. No ivory center, no green, no amber/gold glass. Thin dark oxidized PEWTER lead cames, subtle silver edge highlights, no thick golden borders. Ornament confined to architectural outer rim and pointed vault, about 100 pixels wide at sides. Interior needs ample calm areas and balanced negative space, still genuine detailed artisan stained glass. No text, numbers, stars, moon, sun, plants or other icons baked in. No perspective, bloom, neon or modern panels.

## Rosette · Bearbeitung des bisherigen Masters

Use case: precise-object-edit. Redesign this circular stained-glass rose-window label as a clean neutral master, exact 1254x1254 and genuinely transparent outside its circular rim. Preserve the circular Gothic rosette identity and exquisite artisan material. REMOVE ALL plants, lilies, leaves, ferns, flowers and stems and their outlines. Every outer petal cell now plain handblown pale blue-grey glass. Enlarge the quiet central glass medallion to radius 435 pixels centered627,627; its entire interior must be empty of lines and ornament for separate dynamic motifs and text. Thin dark oxidized pewter cames and fine silver highlights, no gold. Outer radial Gothic petals and quatrefoil tracery confined to annulus radius450..610. No ivory white center: all central and peripheral panes use the SAME softly luminous blue-grey rippled translucent glass with gentle thickness differences. Main central glass has three intended EMPTY zones with NO dividers: upper astronomical area x390..864 y235..425, middle text area x325..929 y440..825, bottom floral area x375..879 y850..1050. Do not draw symbols or flowers yet. Flat orthographic front view, high detail, restrained transmitted light. No text, numbers, astronomical figures, stars, smoke, bloom or neon. Proper circular silhouette, no wall, black background or shadows outside rim.

## Astronomisches Sprite-Atlas · Neugenerierung

Use case: stylized-concept. Production sprite atlas on genuine transparent background, exact 1536x1024 landscape, strict regular 4 columns by 2 rows, eight separate centered astronomical stained-glass ornaments. Each cell384x512 with at least50px transparent padding, no overlap, no frames. Row1 left to right: elegant crescent moon; radiant medieval SUN DISC with many fine rays; ringed Saturn; eight-pointed celestial compass star. Row2 left to right: small planet with two elliptical orbital rings; recognisable seven-star constellation joined by delicate lines; ornate comet with flowing tail; three moon phases arranged horizontally. Uniform matching old artisan Gothic/Art Nouveau style: dark sculptural pewter lead outlines, luminous pale silver/ivory glass inserts, delicate warm pale gold edge highlights, fine rippled glass details. High contrast silhouettes that remain recognisable at 60px size. Clear individual motifs, no background glass plates behind them, no square panels, no text, letters, numbers or labels, no astrological zodiac or magical/pentagram symbols, no faces. Entire blank area truly transparent including between rays and orbit lines. Eight self contained exquisite original motifs, not flat modern UI icons.

## Botanisches Wachstum · Neugenerierung

Use case: stylized-concept. Original ornate botanical stained-glass ornament, 1536x1024 landscape sprite on genuine transparent background. A single symmetrical Art Nouveau flowering plant grows from a small rooted stem at BOTTOM CENTER, spreading into a wide graceful fan of curling ivy stems, individual fern fronds, small leaves, buds and five elegant lily / bell flowers. Bottom stem at(768,930), highest flowers around y180, widest leaves x110..1426. Continuous organic branch connections so the plant can later be progressively revealed from the bottom upwards. Highest flowers are small delicate, middle complex curving vines, bottom initially only two small leaves. Exquisite real fitted pale silver / opalescent ivory translucent glass pieces bounded by sculptural pewter lead veins, minute brushed pale champagne highlights, high contrast dark contours. Restrained monochrome neutral palette, NO green leaves or colored glass: this needs to work over any purple, teal or ruby window. Fine handblown glass ripples, tactile artisan craftsmanship, elegant visual mass readable on a small printed label. No floral border around the canvas, no frame, no background plate, no container, pot, soil, ground shadow, no writing or numbers. All space around and between every leaf and vine is truly transparent, no haze, no vignette, no glowing mist.

## Deterministische Ableitung

`v3/scripts/create-verdant-cathedral.js` ist die vollständige reproduzierbare
Ableitung aus `masters/`. Es normalisiert die Originale verlustfrei in RGBA.
Keine Illustrationen werden hochskaliert. Glas und feste Fassungen stammen
aus denselben Koordinaten; auch die gesamte Textmitte gehört zur Genetik.
21 Palettenzustände interpolieren Violett, Saphir, Türkis, Gold und warmes Rot.
Es gibt keine weiß bleibende Textplakette und keine festen farbigen Pflanzen.

Das transparente Astronomie-Atlas wird in acht Motive getrennt und in beiden
Layoutarchitekturen unabhängig platziert. Die neun THC-Stufen zeigen null bis
acht Motive kumulativ. Jeder vorhandene Stern-/Planetenpixel bleibt identisch.

Das florale Original wird proportional in die untere Kammer gesetzt. Ein
Abstandsgraph folgt ab der Wurzel den tatsächlichen zusammenhängenden Stielen,
Blättern und Blüten. Sieben aufsteigende Distanzgrenzen lassen die Pflanze
entlang ihrer Verzweigungen wachsen. Bereits sichtbare Pixel bleiben exakt
erhalten. Fassungen, oberer Bereich und Texte bleiben frei.

Die Vorschauen, Vergleichstafel und Kontaktbögen entstehen mit dem unveränderten
Anwendungsrenderer über `tests/verdant-cathedral.html`.
