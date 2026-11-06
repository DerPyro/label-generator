# Watercolor Forest – Generierungsprotokoll

Die 60 Wald-, Wetter- und Blumenillustrationen wurden mit dem eingebauten OpenAI-Imagegen-Werkzeug erstellt. Keine CLI/API-Schlüssel. Die drei neutralen Papiergrundlagen und drei leeren Klarhimmel-Layer enthalten keine Illustrationen und werden durch `scripts/normalize-watercolor.js --init-baselines` erzeugt. Derselbe Helfer normalisiert ausschließlich die PNG-Codierung verlustfrei zu RGBA8; Farben, Alphawerte, Bildinhalt und native Auflösung bleiben erhalten. Text und Vorschaubilder werden durch den vorhandenen LabelRenderer komponiert.

Die quadratischen transparenten Ausgaben haben nativ 1254 × 1254 px statt der zunächst angefragten 1024 × 1024 px. Das Manifest und die Textmaße wurden an diese tatsächliche Auflösung angepasst. Keine Bildverzerrung oder Umrechnung der Illustration.

## Vollständiger Prompt-Satz

### `layouts/classic-portrait/genetics/5.png`

Use case: stylized-concept. Asset type: production PNG layer for a botanical label texturepack called Watercolor Forest. Create exactly ONE portrait 2:3 illustration, canvas 1024 pixels wide by 1536 pixels high. This is a standalone full-bleed forest landscape, no typography, no lettering, no logos, no border, no mockup, no label shape. Style: sophisticated hand-painted traditional watercolor on fine warm ivory cotton paper, fluid pigment granulation, subtle deckled watercolor edges WITHIN an opaque rectangular canvas, delicate botanical realism. Landscape: quiet conifer forest around an open misty valley; tall detailed firs restricted to extreme left/right edges and lower quarter, low distant forest ridge at 70 percent height; huge open pale sky and airy mist from y=15% to y=70% so black label text can later sit at center. Composition precisely: left firs x=0..18%, right firs x=82..100%, foreground moss and ferns bottom15%; completely calm central area x=20..80%, y=36..65%, no branches intrude there. Time of day stage5 of7: bright gentle afternoon, pale azure/ivory sky, soft sage and deep emerald pines, warm soft sunlight. No clouds, rain, lightning, sun disc, moon, stars, flowers or decorative frame; those are separate compositing layers. Professional cohesive printed botanical packaging artwork, naturalistic watercolor NOT vector flat triangles, NOT pixelart. Output a finished landscape painted to all canvas edges, no transparency for this background.

### `layouts/classic-portrait/genetics/1.png`

Use case: lighting-weather. Image1 is the EDIT TARGET. Create ONE production PNG portrait 1024x1536. Preserve the exact forest composition and tree placement, watercolor granulation, detailed pine shapes, open central text-safe valley and all landscape contours of image1. Change ONLY time of day and illumination to stage 1/7: deep nocturnal forest, rich midnight indigo sky and blue green conifers, soft moonlight, small ivory crescent moon near top x70% y12% and sparse fine stars upper third. Center remains an open blue-grey misty valley. The result must be a complete opaque full-bleed watercolor landscape. No text, letters, label panels, decorative flowers, clouds, rain or lightning. No montage. Keep the center x20..80%, y36..65% visually calm for typography. Keep aspect2:3 and all original coordinates invariant.

Ursprungsdatei: `exec-4b7d7296-da00-4a5a-aa82-5adddc0d5a53.png`.

Referenzrolle und Invarianten stehen im Prompt; Referenzdatei: `exec-9a15e4e4-5e52-461e-9e4e-b71cb80638c0.png`.

### `layouts/classic-portrait/genetics/2.png`

Use case: lighting-weather. Image1 is the EDIT TARGET. Create ONE production PNG portrait 1024x1536. Preserve the exact forest composition and tree placement, watercolor granulation, detailed pine shapes, open central text-safe valley and all landscape contours of image1. Change ONLY time of day and illumination to stage 2/7: late evening blue-hour twilight, muted violet indigo sky with subtle mauve horizon, cool blue-violet forest, last warm glow low horizon; no stars or moon. The result must be a complete opaque full-bleed watercolor landscape. No text, letters, label panels, decorative flowers, clouds, rain or lightning. No montage. Keep the center x20..80%, y36..65% visually calm for typography. Keep aspect2:3 and all original coordinates invariant.

Ursprungsdatei: `exec-0ad288c3-017d-4fde-a378-a6d87fb9e243.png`.

Referenzrolle und Invarianten stehen im Prompt; Referenzdatei: `exec-9a15e4e4-5e52-461e-9e4e-b71cb80638c0.png`.

### `layouts/classic-portrait/genetics/3.png`

Use case: lighting-weather. Image1 is the EDIT TARGET. Create ONE production PNG portrait 1024x1536. Preserve the exact forest composition and tree placement, watercolor granulation, detailed pine shapes, open central text-safe valley and all landscape contours of image1. Change ONLY time of day and illumination to stage 3/7: dramatic sunset, warm coral and burnt-orange sky fading into apricot cream mist, purplish spruce shadows, tiny low setting sun near x72% y22%, visibly warmer and rosier than golden afternoon. The result must be a complete opaque full-bleed watercolor landscape. No text, letters, label panels, decorative flowers, clouds, rain or lightning. No montage. Keep the center x20..80%, y36..65% visually calm for typography. Keep aspect2:3 and all original coordinates invariant.

Ursprungsdatei: `exec-714bce80-a88e-4e75-a8cc-7add72ee8f9c.png`.

Referenzrolle und Invarianten stehen im Prompt; Referenzdatei: `exec-9a15e4e4-5e52-461e-9e4e-b71cb80638c0.png`.

### `layouts/classic-portrait/genetics/4.png`

Use case: lighting-weather. Image1 is the EDIT TARGET. Create ONE production PNG portrait 1024x1536. Preserve the exact forest composition and tree placement, watercolor granulation, detailed pine shapes, open central text-safe valley and all landscape contours of image1. Change ONLY time of day and illumination to stage 4/7: golden late afternoon, honey gold and amber sunlight through softly ochre pale sky, olive and warm deep emerald forest, warm creamy valley, brighter and less rose than sunset. The result must be a complete opaque full-bleed watercolor landscape. No text, letters, label panels, decorative flowers, clouds, rain or lightning. No montage. Keep the center x20..80%, y36..65% visually calm for typography. Keep aspect2:3 and all original coordinates invariant.

Ursprungsdatei: `exec-07754dd9-5ed8-477b-8fca-f3e069bfda06.png`.

Referenzrolle und Invarianten stehen im Prompt; Referenzdatei: `exec-9a15e4e4-5e52-461e-9e4e-b71cb80638c0.png`.

### `layouts/classic-portrait/genetics/6.png`

Use case: lighting-weather. Image1 is the EDIT TARGET. Create ONE production PNG portrait 1024x1536. Preserve the exact forest composition and tree placement, watercolor granulation, detailed pine shapes, open central text-safe valley and all landscape contours of image1. Change ONLY time of day and illumination to stage 6/7: sunny late morning, fresh clean cool blue sky, bright lively emerald and sage pines, airy pale lemon sunlight and crisp luminous light mist, brighter greener cooler than afternoon. The result must be a complete opaque full-bleed watercolor landscape. No text, letters, label panels, decorative flowers, clouds, rain or lightning. No montage. Keep the center x20..80%, y36..65% visually calm for typography. Keep aspect2:3 and all original coordinates invariant.

Ursprungsdatei: `exec-ac92234b-30e8-49f8-b2a3-a33b7ea31d96.png`.

Referenzrolle und Invarianten stehen im Prompt; Referenzdatei: `exec-9a15e4e4-5e52-461e-9e4e-b71cb80638c0.png`.

### `layouts/classic-portrait/genetics/7.png`

Use case: lighting-weather. Image1 is the EDIT TARGET. Create ONE production PNG portrait 1024x1536. Preserve the exact forest composition and tree placement, watercolor granulation, detailed pine shapes, open central text-safe valley and all landscape contours of image1. Change ONLY time of day and illumination to stage 7/7: clear very early bright morning, palest luminous sky blue with pearly sunrise mist and soft peach near horizon, fresh blue-green pine forest with delicate golden edges, brightest airy atmosphere. The result must be a complete opaque full-bleed watercolor landscape. No text, letters, label panels, decorative flowers, clouds, rain or lightning. No montage. Keep the center x20..80%, y36..65% visually calm for typography. Keep aspect2:3 and all original coordinates invariant.

Ursprungsdatei: `exec-605ce119-2fef-4b5c-8087-80e9756c7e49.png`.

Referenzrolle und Invarianten stehen im Prompt; Referenzdatei: `exec-9a15e4e4-5e52-461e-9e4e-b71cb80638c0.png`.

### `layouts/wide-landscape/genetics/5.png`

Use case: stylized-concept. Image1 is STYLE REFERENCE ONLY. Paint ONE wholly new wide landscape watercolor botanical label background, EXACTLY1536x1024px ratio3:2. Same premium traditional watercolor on cotton paper and delicate realistic conifer detail as reference. Create a coherent WIDE COMPOSITION, NOT a cropped portrait. Tall fir trees only at extreme x0..12% and88..100%; lower pine forest ridge bottom22%; open pale misty valley and pale azure sky covers center. Text-safe area x20..80%,y30..67% is light calm ivory mist, no branches or hard lines. Bright gentle afternoon, sage emerald pines, sunlit moss/ferns bottom15%, open atmosphere. No text, border, label panels, logo, clouds, sun/moon/stars, rain, lightning, flowers. Full-bleed opaque watercolor landscape exactly3:2.

Ursprungsdatei: `exec-1a3d2ae8-dfdd-487d-b786-b800c7f9623d.png`.

Referenzrolle und Invarianten stehen im Prompt; Referenzdatei: `exec-9a15e4e4-5e52-461e-9e4e-b71cb80638c0.png`.

### `layouts/round-lid/genetics/5.png`

Use case: stylized-concept. Image1 is STYLE REFERENCE ONLY. Paint ONE bespoke CIRCULAR forest landscape for a round botanical jar-lid label. EXACTLY1024x1024px square canvas, one perfectly circular painted disk centered512,512 radius512; ALL pixels outside the circle genuinely TRANSPARENT alpha, not a checkerboard. Unique radial round composition, NOT portrait cropped in a circle. Same premium traditional watercolor detailed pines/cotton paper grain. Pines arch around lower left/right curved rim; distant pine valley bottomquarter; pale azure sky at top, expansive calm light ivory mist at x20..80%,y30..65% for later black text. Bright gentle afternoon, sage emerald green forest, softly sunlit moss loweredge. No frame, text, lettering, logo, panels, clouds, sun/moon/stars, rain, lightning or flowers. Keep artwork INSIDE the perfect circular disk, circle touches all four canvas edges, alpha outside.

Ursprungsdatei: `exec-2c102336-f430-41b3-96fa-06ce1a440e15.png`.

Referenzrolle und Invarianten stehen im Prompt; Referenzdatei: `exec-9a15e4e4-5e52-461e-9e4e-b71cb80638c0.png`.

### `layouts/wide-landscape/genetics/1.png`

Use case: lighting-weather. Image1 is the EDIT TARGET. Create ONE production PNG LANDSCAPE1536x1024 pixels. Preserve the exact forest composition and tree placement, watercolor granulation, detailed pine shapes, open central text-safe valley and all landscape contours of image1. Change ONLY time of day and illumination to stage 1/7: deep nocturnal forest, rich midnight indigo sky and blue green conifers, soft moonlight, small ivory crescent moon near top x70% y12% and sparse fine stars upper third. Center remains an open blue-grey misty valley. The result must be a complete opaque full-bleed watercolor landscape. No text, letters, label panels, decorative flowers, clouds, rain or lightning. No montage. Keep the center x20..80%, y36..65% visually calm for typography. Keep aspect3:2 and all original coordinates invariant.

Ursprungsdatei: `exec-2c1e2d2b-6905-48fc-a6c0-e98d8d9d61a7.png`.

Referenzrolle und Invarianten stehen im Prompt; Referenzdatei: `5.png`.

### `layouts/wide-landscape/genetics/2.png`

Use case: lighting-weather. Image1 is the EDIT TARGET. Create ONE production PNG LANDSCAPE1536x1024 pixels. Preserve the exact forest composition and tree placement, watercolor granulation, detailed pine shapes, open central text-safe valley and all landscape contours of image1. Change ONLY time of day and illumination to stage 2/7: late evening blue-hour twilight, muted violet indigo sky with subtle mauve horizon, cool blue-violet forest, last warm glow low horizon; no stars or moon. The result must be a complete opaque full-bleed watercolor landscape. No text, letters, label panels, decorative flowers, clouds, rain or lightning. No montage. Keep the center x20..80%, y36..65% visually calm for typography. Keep aspect3:2 and all original coordinates invariant.

Ursprungsdatei: `exec-c8a2f6c5-d1c2-435b-a1b1-5796ecabcd0f.png`.

Referenzrolle und Invarianten stehen im Prompt; Referenzdatei: `5.png`.

### `layouts/wide-landscape/genetics/3.png`

Use case: lighting-weather. Image1 is the EDIT TARGET. Create ONE production PNG LANDSCAPE1536x1024 pixels. Preserve the exact forest composition and tree placement, watercolor granulation, detailed pine shapes, open central text-safe valley and all landscape contours of image1. Change ONLY time of day and illumination to stage 3/7: dramatic sunset, warm coral and burnt-orange sky fading into apricot cream mist, purplish spruce shadows, tiny low setting sun near x72% y22%, visibly warmer and rosier than golden afternoon. The result must be a complete opaque full-bleed watercolor landscape. No text, letters, label panels, decorative flowers, clouds, rain or lightning. No montage. Keep the center x20..80%, y36..65% visually calm for typography. Keep aspect3:2 and all original coordinates invariant.

Ursprungsdatei: `exec-74a56c81-f84d-4637-83ed-470ead907c6d.png`.

Referenzrolle und Invarianten stehen im Prompt; Referenzdatei: `5.png`.

### `layouts/wide-landscape/genetics/4.png`

Use case: lighting-weather. Image1 is the EDIT TARGET. Create ONE production PNG LANDSCAPE1536x1024 pixels. Preserve the exact forest composition and tree placement, watercolor granulation, detailed pine shapes, open central text-safe valley and all landscape contours of image1. Change ONLY time of day and illumination to stage 4/7: golden late afternoon, honey gold and amber sunlight through softly ochre pale sky, olive and warm deep emerald forest, warm creamy valley, brighter and less rose than sunset. The result must be a complete opaque full-bleed watercolor landscape. No text, letters, label panels, decorative flowers, clouds, rain or lightning. No montage. Keep the center x20..80%, y36..65% visually calm for typography. Keep aspect3:2 and all original coordinates invariant.

Ursprungsdatei: `exec-a072b155-5d37-413b-b0c6-07c625168f77.png`.

Referenzrolle und Invarianten stehen im Prompt; Referenzdatei: `5.png`.

### `layouts/wide-landscape/genetics/6.png`

Use case: lighting-weather. Image1 is the EDIT TARGET. Create ONE production PNG LANDSCAPE1536x1024 pixels. Preserve the exact forest composition and tree placement, watercolor granulation, detailed pine shapes, open central text-safe valley and all landscape contours of image1. Change ONLY time of day and illumination to stage 6/7: sunny late morning, fresh clean cool blue sky, bright lively emerald and sage pines, airy pale lemon sunlight and crisp luminous light mist, brighter greener cooler than afternoon. The result must be a complete opaque full-bleed watercolor landscape. No text, letters, label panels, decorative flowers, clouds, rain or lightning. No montage. Keep the center x20..80%, y36..65% visually calm for typography. Keep aspect3:2 and all original coordinates invariant.

Ursprungsdatei: `exec-66650b5b-8951-4a42-a7b6-b46970830a8b.png`.

Referenzrolle und Invarianten stehen im Prompt; Referenzdatei: `5.png`.

### `layouts/wide-landscape/genetics/7.png`

Use case: lighting-weather. Image1 is the EDIT TARGET. Create ONE production PNG LANDSCAPE1536x1024 pixels. Preserve the exact forest composition and tree placement, watercolor granulation, detailed pine shapes, open central text-safe valley and all landscape contours of image1. Change ONLY time of day and illumination to stage 7/7: clear very early bright morning, palest luminous sky blue with pearly sunrise mist and soft peach near horizon, fresh blue-green pine forest with delicate golden edges, brightest airy atmosphere. The result must be a complete opaque full-bleed watercolor landscape. No text, letters, label panels, decorative flowers, clouds, rain or lightning. No montage. Keep the center x20..80%, y36..65% visually calm for typography. Keep aspect3:2 and all original coordinates invariant.

Ursprungsdatei: `exec-3c2178eb-8f64-45a3-8319-330c41028572.png`.

Referenzrolle und Invarianten stehen im Prompt; Referenzdatei: `5.png`.

### `layouts/round-lid/genetics/1.png`

Use case: lighting-weather. Image1 is the EDIT TARGET. Create ONE production PNG SQUARE1254x1254 pixels. Preserve the exact forest composition and tree placement, watercolor granulation, detailed pine shapes, open central text-safe valley and all landscape contours of image1. Change ONLY time of day and illumination to stage 1/7: deep nocturnal forest, rich midnight indigo sky and blue green conifers, soft moonlight, small ivory crescent moon near top x70% y12% and sparse fine stars upper third. Center remains an open blue-grey misty valley. The result must be a complete opaque full-bleed watercolor landscape. No text, letters, label panels, decorative flowers, clouds, rain or lightning. No montage. Keep the center x20..80%, y36..65% visually calm for typography. Keep square1:1 aspect and preserve perfect circulardisk with transparent outside and all original coordinates invariant. CRITICAL preserve exact round disk silhouette and TRUE TRANSPARENT ALPHA outside the circular disk of the reference. No rectangular background, no crop, square canvas1254x1254. Do not crop or rescale the disk. Hand-painted landscape remains fully inside circular boundary.

Ursprungsdatei: `exec-fb27ffe7-ac9e-4ee6-95ad-0b9f08261b43.png`.

Referenzrolle und Invarianten stehen im Prompt; Referenzdatei: `5.png`.

### `layouts/round-lid/genetics/2.png`

Use case: lighting-weather. Image1 is the EDIT TARGET. Create ONE production PNG SQUARE1254x1254 pixels. Preserve the exact forest composition and tree placement, watercolor granulation, detailed pine shapes, open central text-safe valley and all landscape contours of image1. Change ONLY time of day and illumination to stage 2/7: late evening blue-hour twilight, muted violet indigo sky with subtle mauve horizon, cool blue-violet forest, last warm glow low horizon; no stars or moon. The result must be a complete opaque full-bleed watercolor landscape. No text, letters, label panels, decorative flowers, clouds, rain or lightning. No montage. Keep the center x20..80%, y36..65% visually calm for typography. Keep square1:1 aspect and preserve perfect circulardisk with transparent outside and all original coordinates invariant. CRITICAL preserve exact round disk silhouette and TRUE TRANSPARENT ALPHA outside the circular disk of the reference. No rectangular background, no crop, square canvas1254x1254. Do not crop or rescale the disk. Hand-painted landscape remains fully inside circular boundary.

Ursprungsdatei: `exec-fbd44316-2679-46c0-9502-9dd96c75b0fe.png`.

Referenzrolle und Invarianten stehen im Prompt; Referenzdatei: `5.png`.

### `layouts/round-lid/genetics/3.png`

Use case: lighting-weather. Image1 is the EDIT TARGET. Create ONE production PNG SQUARE1254x1254 pixels. Preserve the exact forest composition and tree placement, watercolor granulation, detailed pine shapes, open central text-safe valley and all landscape contours of image1. Change ONLY time of day and illumination to stage 3/7: dramatic sunset, warm coral and burnt-orange sky fading into apricot cream mist, purplish spruce shadows, tiny low setting sun near x72% y22%, visibly warmer and rosier than golden afternoon. The result must be a complete opaque full-bleed watercolor landscape. No text, letters, label panels, decorative flowers, clouds, rain or lightning. No montage. Keep the center x20..80%, y36..65% visually calm for typography. Keep square1:1 aspect and preserve perfect circulardisk with transparent outside and all original coordinates invariant. CRITICAL preserve exact round disk silhouette and TRUE TRANSPARENT ALPHA outside the circular disk of the reference. No rectangular background, no crop, square canvas1254x1254. Do not crop or rescale the disk. Hand-painted landscape remains fully inside circular boundary.

Ursprungsdatei: `exec-2980b11f-355f-448f-a1b1-a1fd70b4e35b.png`.

Referenzrolle und Invarianten stehen im Prompt; Referenzdatei: `5.png`.

### `layouts/round-lid/genetics/4.png`

Use case: lighting-weather. Image1 is the EDIT TARGET. Create ONE production PNG SQUARE1254x1254 pixels. Preserve the exact forest composition and tree placement, watercolor granulation, detailed pine shapes, open central text-safe valley and all landscape contours of image1. Change ONLY time of day and illumination to stage 4/7: golden late afternoon, honey gold and amber sunlight through softly ochre pale sky, olive and warm deep emerald forest, warm creamy valley, brighter and less rose than sunset. The result must be a complete opaque full-bleed watercolor landscape. No text, letters, label panels, decorative flowers, clouds, rain or lightning. No montage. Keep the center x20..80%, y36..65% visually calm for typography. Keep square1:1 aspect and preserve perfect circulardisk with transparent outside and all original coordinates invariant. CRITICAL preserve exact round disk silhouette and TRUE TRANSPARENT ALPHA outside the circular disk of the reference. No rectangular background, no crop, square canvas1254x1254. Do not crop or rescale the disk. Hand-painted landscape remains fully inside circular boundary.

Ursprungsdatei: `exec-8786333f-30bb-4469-b471-1fda385b3cbd.png`.

Referenzrolle und Invarianten stehen im Prompt; Referenzdatei: `5.png`.

### `layouts/round-lid/genetics/6.png`

Use case: lighting-weather. Image1 is the EDIT TARGET. Create ONE production PNG SQUARE1254x1254 pixels. Preserve the exact forest composition and tree placement, watercolor granulation, detailed pine shapes, open central text-safe valley and all landscape contours of image1. Change ONLY time of day and illumination to stage 6/7: sunny late morning, fresh clean cool blue sky, bright lively emerald and sage pines, airy pale lemon sunlight and crisp luminous light mist, brighter greener cooler than afternoon. The result must be a complete opaque full-bleed watercolor landscape. No text, letters, label panels, decorative flowers, clouds, rain or lightning. No montage. Keep the center x20..80%, y36..65% visually calm for typography. Keep square1:1 aspect and preserve perfect circulardisk with transparent outside and all original coordinates invariant. CRITICAL preserve exact round disk silhouette and TRUE TRANSPARENT ALPHA outside the circular disk of the reference. No rectangular background, no crop, square canvas1254x1254. Do not crop or rescale the disk. Hand-painted landscape remains fully inside circular boundary.

Ursprungsdatei: `exec-c4287bae-90b5-44f7-8d22-29ff2cbc07e7.png`.

Referenzrolle und Invarianten stehen im Prompt; Referenzdatei: `5.png`.

### `layouts/round-lid/genetics/7.png`

Use case: lighting-weather. Image1 is the EDIT TARGET. Create ONE production PNG SQUARE1254x1254 pixels. Preserve the exact forest composition and tree placement, watercolor granulation, detailed pine shapes, open central text-safe valley and all landscape contours of image1. Change ONLY time of day and illumination to stage 7/7: clear very early bright morning, palest luminous sky blue with pearly sunrise mist and soft peach near horizon, fresh blue-green pine forest with delicate golden edges, brightest airy atmosphere. The result must be a complete opaque full-bleed watercolor landscape. No text, letters, label panels, decorative flowers, clouds, rain or lightning. No montage. Keep the center x20..80%, y36..65% visually calm for typography. Keep square1:1 aspect and preserve perfect circulardisk with transparent outside and all original coordinates invariant. CRITICAL preserve exact round disk silhouette and TRUE TRANSPARENT ALPHA outside the circular disk of the reference. No rectangular background, no crop, square canvas1254x1254. Do not crop or rescale the disk. Hand-painted landscape remains fully inside circular boundary.

Ursprungsdatei: `exec-84fc4a62-d0cb-417b-b7f8-da9593fd590e.png`.

Referenzrolle und Invarianten stehen im Prompt; Referenzdatei: `5.png`.

### `layouts/classic-portrait/thc/2.png`

Use case: stylized-concept. Asset type ONE production transparent PNG WEATHER SPRITE for botanical watercolor forest label. Canvas EXACTLY 1024x1536 pixels portrait2:3, rectangular full canvas. TRUE TRANSPARENT ALPHA background, no paper backdrop, no checkerboard drawn in, no rectangle of background paint. Premium hand-painted traditional watercolor cloud illustration with organic pigment granulation, delicate natural edges. Weatherstage 2/7: Very light cloud cover: ONLY two very small airy ivory-blue cloud wisps near x25%,70% y12%, a few soft feathery strokes, lots of transparent clear sky. No rain or lightning.. Clouds only topquarter y0..25%. Absolutely keep x20..80%,y30..94% FULLY TRANSPARENT for label text. Rain/lightning may descend only on extreme sides x<15% orx>85%. No ground, forest, trees, flowers, frame, sun, moon, text, logos or panels. No uniform opacityfade: distinct increasingly intense weather forms. Single full nativecanvas sprite, no contactsheet, no caption. Soft bluegreys chosen to remain visible against both darknight and brightday forests, lightning drawn as watercolor illustration, notglowphotography.

Ursprungsdatei: `exec-cad83965-1dff-47c3-8e2d-4ff90fc915bc.png`.

### `layouts/classic-portrait/thc/3.png`

Use case: stylized-concept. Asset type ONE production transparent PNG WEATHER SPRITE for botanical watercolor forest label. Canvas EXACTLY 1024x1536 pixels portrait2:3, rectangular full canvas. TRUE TRANSPARENT ALPHA background, no paper backdrop, no checkerboard drawn in, no rectangle of background paint. Premium hand-painted traditional watercolor cloud illustration with organic pigment granulation, delicate natural edges. Weatherstage 3/7: Moderate clouds: four to five larger soft coolbluegrey cumulus cloud groups at y8..22%, scattered coverage about45%ofskywidth, distinct shapes, no rain or lightning.. Clouds only topquarter y0..25%. Absolutely keep x20..80%,y30..94% FULLY TRANSPARENT for label text. Rain/lightning may descend only on extreme sides x<15% orx>85%. No ground, forest, trees, flowers, frame, sun, moon, text, logos or panels. No uniform opacityfade: distinct increasingly intense weather forms. Single full nativecanvas sprite, no contactsheet, no caption. Soft bluegreys chosen to remain visible against both darknight and brightday forests, lightning drawn as watercolor illustration, notglowphotography.

Ursprungsdatei: `exec-c53bf281-aa96-4112-b410-4b2828abcc81.png`.

### `layouts/classic-portrait/thc/4.png`

Use case: stylized-concept. Asset type ONE production transparent PNG WEATHER SPRITE for botanical watercolor forest label. Canvas EXACTLY 1024x1536 pixels portrait2:3, rectangular full canvas. TRUE TRANSPARENT ALPHA background, no paper backdrop, no checkerboard drawn in, no rectangle of background paint. Premium hand-painted traditional watercolor cloud illustration with organic pigment granulation, delicate natural edges. Weatherstage 4/7: Strong overcast: broad heavier layered banks of slate bluegrey clouds filling most upperquarter, visibly thicker darker thanstage3; still no rain or lightning.. Clouds only topquarter y0..25%. Absolutely keep x20..80%,y30..94% FULLY TRANSPARENT for label text. Rain/lightning may descend only on extreme sides x<15% orx>85%. No ground, forest, trees, flowers, frame, sun, moon, text, logos or panels. No uniform opacityfade: distinct increasingly intense weather forms. Single full nativecanvas sprite, no contactsheet, no caption. Soft bluegreys chosen to remain visible against both darknight and brightday forests, lightning drawn as watercolor illustration, notglowphotography.

Ursprungsdatei: `exec-2262036a-1ee6-4183-846c-52f5b075814f.png`.

### `layouts/classic-portrait/thc/5.png`

Use case: stylized-concept. Asset type ONE production transparent PNG WEATHER SPRITE for botanical watercolor forest label. Canvas EXACTLY 1024x1536 pixels portrait2:3, rectangular full canvas. TRUE TRANSPARENT ALPHA background, no paper backdrop, no checkerboard drawn in, no rectangle of background paint. Premium hand-painted traditional watercolor cloud illustration with organic pigment granulation, delicate natural edges. Weatherstage 5/7: Rainy weather: thick dark charcoal-blue and muted slate cloud bank across upperquarter, with visibly fine diagonal rain streaks ONLY below near extreme sideedges x0..14%,86..100% down to70%height. No lightning.. Clouds only topquarter y0..25%. Absolutely keep x20..80%,y30..94% FULLY TRANSPARENT for label text. Rain/lightning may descend only on extreme sides x<15% orx>85%. No ground, forest, trees, flowers, frame, sun, moon, text, logos or panels. No uniform opacityfade: distinct increasingly intense weather forms. Single full nativecanvas sprite, no contactsheet, no caption. Soft bluegreys chosen to remain visible against both darknight and brightday forests, lightning drawn as watercolor illustration, notglowphotography.

Ursprungsdatei: `exec-49a1348a-28c6-4226-b5d7-b3eec2be3286.png`.

### `layouts/classic-portrait/thc/6.png`

Use case: stylized-concept. Asset type ONE production transparent PNG WEATHER SPRITE for botanical watercolor forest label. Canvas EXACTLY 1024x1536 pixels portrait2:3, rectangular full canvas. TRUE TRANSPARENT ALPHA background, no paper backdrop, no checkerboard drawn in, no rectangle of background paint. Premium hand-painted traditional watercolor cloud illustration with organic pigment granulation, delicate natural edges. Weatherstage 6/7: Thunderstorm: stormy dark navy-charcoal cloudbank upperquarter, vivid pale gold/ivory branching lightning bolts at x10% and90% from y13 to38%, clear illustrated rain sideedges. Two pronounced lightningbolts, keepcenter free.. Clouds only topquarter y0..25%. Absolutely keep x20..80%,y30..94% FULLY TRANSPARENT for label text. Rain/lightning may descend only on extreme sides x<15% orx>85%. No ground, forest, trees, flowers, frame, sun, moon, text, logos or panels. No uniform opacityfade: distinct increasingly intense weather forms. Single full nativecanvas sprite, no contactsheet, no caption. Soft bluegreys chosen to remain visible against both darknight and brightday forests, lightning drawn as watercolor illustration, notglowphotography.

Ursprungsdatei: `exec-b662db2b-c13c-4e45-af0a-7c68b7b3e804.png`.

### `layouts/classic-portrait/thc/7.png`

Use case: stylized-concept. Asset type ONE production transparent PNG WEATHER SPRITE for botanical watercolor forest label. Canvas EXACTLY 1024x1536 pixels portrait2:3, rectangular full canvas. TRUE TRANSPARENT ALPHA background, no paper backdrop, no checkerboard drawn in, no rectangle of background paint. Premium hand-painted traditional watercolor cloud illustration with organic pigment granulation, delicate natural edges. Weatherstage 7/7: Very severe dramatic thunderstorm, much more intense thanstage6: massive deep charcoal/navy rolling cloudbank upperquarter, layered turbulent watercolor darkclouds; FOUR powerful bright palegold/ivory forked lightningbolts near x7%,13%,87%,93% extending to45%height, dense angled streaks of heavy rain down sideedges, most dramatic highcontrast weatherstage. Centraltext remains clear.. Clouds only topquarter y0..25%. Absolutely keep x20..80%,y30..94% FULLY TRANSPARENT for label text. Rain/lightning may descend only on extreme sides x<15% orx>85%. No ground, forest, trees, flowers, frame, sun, moon, text, logos or panels. No uniform opacityfade: distinct increasingly intense weather forms. Single full nativecanvas sprite, no contactsheet, no caption. Soft bluegreys chosen to remain visible against both darknight and brightday forests, lightning drawn as watercolor illustration, notglowphotography.

Ursprungsdatei: `exec-d8423ffe-16de-41aa-8dbf-74e7b3c6544e.png`.

### `layouts/wide-landscape/thc/2.png`

Use case: stylized-concept. Asset type ONE production transparent PNG WEATHER SPRITE for botanical watercolor forest label. Canvas EXACTLY 1536x1024 pixels landscape3:2, rectangular full canvas, compose WIDE not stretched portrait. TRUE TRANSPARENT ALPHA background, no paper backdrop, no checkerboard drawn in, no rectangle of background paint. Premium hand-painted traditional watercolor cloud illustration with organic pigment granulation, delicate natural edges. Weatherstage 2/7: Very light cloud cover: ONLY two very small airy ivory-blue cloud wisps near x25%,70% y12%, a few soft feathery strokes, lots of transparent clear sky. No rain or lightning.. Clouds only topquarter y0..25%. Absolutely keep x20..80%,y30..94% FULLY TRANSPARENT for label text. Rain/lightning may descend only on extreme sides x<15% orx>85%. No ground, forest, trees, flowers, frame, sun, moon, text, logos or panels. No uniform opacityfade: distinct increasingly intense weather forms. Single full nativecanvas sprite, no contactsheet, no caption. Soft bluegreys chosen to remain visible against both darknight and brightday forests, lightning drawn as watercolor illustration, notglowphotography.

Ursprungsdatei: `exec-b868ecc5-ebe8-402b-834f-875fef6200a5.png`.

### `layouts/wide-landscape/thc/3.png`

Use case: stylized-concept. Asset type ONE production transparent PNG WEATHER SPRITE for botanical watercolor forest label. Canvas EXACTLY 1536x1024 pixels landscape3:2, rectangular full canvas, compose WIDE not stretched portrait. TRUE TRANSPARENT ALPHA background, no paper backdrop, no checkerboard drawn in, no rectangle of background paint. Premium hand-painted traditional watercolor cloud illustration with organic pigment granulation, delicate natural edges. Weatherstage 3/7: Moderate clouds: four to five larger soft coolbluegrey cumulus cloud groups at y8..22%, scattered coverage about45%ofskywidth, distinct shapes, no rain or lightning.. Clouds only topquarter y0..25%. Absolutely keep x20..80%,y30..94% FULLY TRANSPARENT for label text. Rain/lightning may descend only on extreme sides x<15% orx>85%. No ground, forest, trees, flowers, frame, sun, moon, text, logos or panels. No uniform opacityfade: distinct increasingly intense weather forms. Single full nativecanvas sprite, no contactsheet, no caption. Soft bluegreys chosen to remain visible against both darknight and brightday forests, lightning drawn as watercolor illustration, notglowphotography.

Ursprungsdatei: `exec-554ba110-d9f0-43a4-9b54-05dd708c84b2.png`.

### `layouts/wide-landscape/thc/4.png`

Use case: stylized-concept. Asset type ONE production transparent PNG WEATHER SPRITE for botanical watercolor forest label. Canvas EXACTLY 1536x1024 pixels landscape3:2, rectangular full canvas, compose WIDE not stretched portrait. TRUE TRANSPARENT ALPHA background, no paper backdrop, no checkerboard drawn in, no rectangle of background paint. Premium hand-painted traditional watercolor cloud illustration with organic pigment granulation, delicate natural edges. Weatherstage 4/7: Strong overcast: broad heavier layered banks of slate bluegrey clouds filling most upperquarter, visibly thicker darker thanstage3; still no rain or lightning.. Clouds only topquarter y0..25%. Absolutely keep x20..80%,y30..94% FULLY TRANSPARENT for label text. Rain/lightning may descend only on extreme sides x<15% orx>85%. No ground, forest, trees, flowers, frame, sun, moon, text, logos or panels. No uniform opacityfade: distinct increasingly intense weather forms. Single full nativecanvas sprite, no contactsheet, no caption. Soft bluegreys chosen to remain visible against both darknight and brightday forests, lightning drawn as watercolor illustration, notglowphotography.

Ursprungsdatei: `exec-1991d4fb-ef14-4865-98b4-c6530dbffd6a.png`.

### `layouts/wide-landscape/thc/5.png`

Use case: stylized-concept. Asset type ONE production transparent PNG WEATHER SPRITE for botanical watercolor forest label. Canvas EXACTLY 1536x1024 pixels landscape3:2, rectangular full canvas, compose WIDE not stretched portrait. TRUE TRANSPARENT ALPHA background, no paper backdrop, no checkerboard drawn in, no rectangle of background paint. Premium hand-painted traditional watercolor cloud illustration with organic pigment granulation, delicate natural edges. Weatherstage 5/7: Rainy weather: thick dark charcoal-blue and muted slate cloud bank across upperquarter, with visibly fine diagonal rain streaks ONLY below near extreme sideedges x0..14%,86..100% down to70%height. No lightning.. Clouds only topquarter y0..25%. Absolutely keep x20..80%,y30..94% FULLY TRANSPARENT for label text. Rain/lightning may descend only on extreme sides x<15% orx>85%. No ground, forest, trees, flowers, frame, sun, moon, text, logos or panels. No uniform opacityfade: distinct increasingly intense weather forms. Single full nativecanvas sprite, no contactsheet, no caption. Soft bluegreys chosen to remain visible against both darknight and brightday forests, lightning drawn as watercolor illustration, notglowphotography.

Ursprungsdatei: `exec-076e4fda-8886-46c4-bdd6-dc54d6e7dcd9.png`.

### `layouts/wide-landscape/thc/6.png`

Use case: stylized-concept. Asset type ONE production transparent PNG WEATHER SPRITE for botanical watercolor forest label. Canvas EXACTLY 1536x1024 pixels landscape3:2, rectangular full canvas, compose WIDE not stretched portrait. TRUE TRANSPARENT ALPHA background, no paper backdrop, no checkerboard drawn in, no rectangle of background paint. Premium hand-painted traditional watercolor cloud illustration with organic pigment granulation, delicate natural edges. Weatherstage 6/7: Thunderstorm: stormy dark navy-charcoal cloudbank upperquarter, vivid pale gold/ivory branching lightning bolts at x10% and90% from y13 to38%, clear illustrated rain sideedges. Two pronounced lightningbolts, keepcenter free.. Clouds only topquarter y0..25%. Absolutely keep x20..80%,y30..94% FULLY TRANSPARENT for label text. Rain/lightning may descend only on extreme sides x<15% orx>85%. No ground, forest, trees, flowers, frame, sun, moon, text, logos or panels. No uniform opacityfade: distinct increasingly intense weather forms. Single full nativecanvas sprite, no contactsheet, no caption. Soft bluegreys chosen to remain visible against both darknight and brightday forests, lightning drawn as watercolor illustration, notglowphotography.

Ursprungsdatei: `exec-430f0339-d6bf-44c5-9365-46772ace8e85.png`.

### `layouts/wide-landscape/thc/7.png`

Use case: stylized-concept. Asset type ONE production transparent PNG WEATHER SPRITE for botanical watercolor forest label. Canvas EXACTLY 1536x1024 pixels landscape3:2, rectangular full canvas, compose WIDE not stretched portrait. TRUE TRANSPARENT ALPHA background, no paper backdrop, no checkerboard drawn in, no rectangle of background paint. Premium hand-painted traditional watercolor cloud illustration with organic pigment granulation, delicate natural edges. Weatherstage 7/7: Very severe dramatic thunderstorm, much more intense thanstage6: massive deep charcoal/navy rolling cloudbank upperquarter, layered turbulent watercolor darkclouds; FOUR powerful bright palegold/ivory forked lightningbolts near x7%,13%,87%,93% extending to45%height, dense angled streaks of heavy rain down sideedges, most dramatic highcontrast weatherstage. Centraltext remains clear.. Clouds only topquarter y0..25%. Absolutely keep x20..80%,y30..94% FULLY TRANSPARENT for label text. Rain/lightning may descend only on extreme sides x<15% orx>85%. No ground, forest, trees, flowers, frame, sun, moon, text, logos or panels. No uniform opacityfade: distinct increasingly intense weather forms. Single full nativecanvas sprite, no contactsheet, no caption. Soft bluegreys chosen to remain visible against both darknight and brightday forests, lightning drawn as watercolor illustration, notglowphotography.

Ursprungsdatei: `exec-a2aa56aa-7f07-43f7-b591-2d490046f8c8.png`.

### `layouts/round-lid/thc/2.png`

Use case: stylized-concept. Asset type ONE production transparent PNG WEATHER SPRITE for botanical watercolor forest label. Canvas EXACTLY 1024x1024 pixels square, ALL paint confined INSIDE perfect circle centered512,512 radius500; fullytransparent outsidecircle; composition along UPPER circular arc, not a squarecloudimage clipped. TRUE TRANSPARENT ALPHA background, no paper backdrop, no checkerboard drawn in, no rectangle of background paint. Premium hand-painted traditional watercolor cloud illustration with organic pigment granulation, delicate natural edges. Weatherstage 2/7: Very light cloud cover: ONLY two very small airy ivory-blue cloud wisps near x25%,70% y12%, a few soft feathery strokes, lots of transparent clear sky. No rain or lightning.. Clouds only topquarter y0..25%. Absolutely keep x20..80%,y30..94% FULLY TRANSPARENT for label text. Rain/lightning may descend only on extreme sides x<15% orx>85%. No ground, forest, trees, flowers, frame, sun, moon, text, logos or panels. No uniform opacityfade: distinct increasingly intense weather forms. Single full nativecanvas sprite, no contactsheet, no caption. Soft bluegreys chosen to remain visible against both darknight and brightday forests, lightning drawn as watercolor illustration, notglowphotography.

Ursprungsdatei: `exec-79663318-b4de-449d-918c-57d5a8bb7089.png`.

### `layouts/round-lid/thc/3.png`

Use case: stylized-concept. Asset type ONE production transparent PNG WEATHER SPRITE for botanical watercolor forest label. Canvas EXACTLY 1024x1024 pixels square, ALL paint confined INSIDE perfect circle centered512,512 radius500; fullytransparent outsidecircle; composition along UPPER circular arc, not a squarecloudimage clipped. TRUE TRANSPARENT ALPHA background, no paper backdrop, no checkerboard drawn in, no rectangle of background paint. Premium hand-painted traditional watercolor cloud illustration with organic pigment granulation, delicate natural edges. Weatherstage 3/7: Moderate clouds: four to five larger soft coolbluegrey cumulus cloud groups at y8..22%, scattered coverage about45%ofskywidth, distinct shapes, no rain or lightning.. Clouds only topquarter y0..25%. Absolutely keep x20..80%,y30..94% FULLY TRANSPARENT for label text. Rain/lightning may descend only on extreme sides x<15% orx>85%. No ground, forest, trees, flowers, frame, sun, moon, text, logos or panels. No uniform opacityfade: distinct increasingly intense weather forms. Single full nativecanvas sprite, no contactsheet, no caption. Soft bluegreys chosen to remain visible against both darknight and brightday forests, lightning drawn as watercolor illustration, notglowphotography.

Ursprungsdatei: `exec-34f3be4f-57fe-481e-b0f4-ba829f38c5cf.png`.

### `layouts/round-lid/thc/4.png`

Use case: stylized-concept. Asset type ONE production transparent PNG WEATHER SPRITE for botanical watercolor forest label. Canvas EXACTLY 1024x1024 pixels square, ALL paint confined INSIDE perfect circle centered512,512 radius500; fullytransparent outsidecircle; composition along UPPER circular arc, not a squarecloudimage clipped. TRUE TRANSPARENT ALPHA background, no paper backdrop, no checkerboard drawn in, no rectangle of background paint. Premium hand-painted traditional watercolor cloud illustration with organic pigment granulation, delicate natural edges. Weatherstage 4/7: Strong overcast: broad heavier layered banks of slate bluegrey clouds filling most upperquarter, visibly thicker darker thanstage3; still no rain or lightning.. Clouds only topquarter y0..25%. Absolutely keep x20..80%,y30..94% FULLY TRANSPARENT for label text. Rain/lightning may descend only on extreme sides x<15% orx>85%. No ground, forest, trees, flowers, frame, sun, moon, text, logos or panels. No uniform opacityfade: distinct increasingly intense weather forms. Single full nativecanvas sprite, no contactsheet, no caption. Soft bluegreys chosen to remain visible against both darknight and brightday forests, lightning drawn as watercolor illustration, notglowphotography.

Ursprungsdatei: `exec-70dbb3dc-af63-4bc6-906f-37d1c4eed129.png`.

### `layouts/round-lid/thc/5.png`

Use case: stylized-concept. Asset type ONE production transparent PNG WEATHER SPRITE for botanical watercolor forest label. Canvas EXACTLY 1024x1024 pixels square, ALL paint confined INSIDE perfect circle centered512,512 radius500; fullytransparent outsidecircle; composition along UPPER circular arc, not a squarecloudimage clipped. TRUE TRANSPARENT ALPHA background, no paper backdrop, no checkerboard drawn in, no rectangle of background paint. Premium hand-painted traditional watercolor cloud illustration with organic pigment granulation, delicate natural edges. Weatherstage 5/7: Rainy weather: thick dark charcoal-blue and muted slate cloud bank across upperquarter, with visibly fine diagonal rain streaks ONLY below near extreme sideedges x0..14%,86..100% down to70%height. No lightning.. Clouds only topquarter y0..25%. Absolutely keep x20..80%,y30..94% FULLY TRANSPARENT for label text. Rain/lightning may descend only on extreme sides x<15% orx>85%. No ground, forest, trees, flowers, frame, sun, moon, text, logos or panels. No uniform opacityfade: distinct increasingly intense weather forms. Single full nativecanvas sprite, no contactsheet, no caption. Soft bluegreys chosen to remain visible against both darknight and brightday forests, lightning drawn as watercolor illustration, notglowphotography.

Ursprungsdatei: `exec-ae3a65bd-dd58-4a71-9118-830c9256fbb8.png`.

### `layouts/round-lid/thc/6.png`

Use case: stylized-concept. Asset type ONE production transparent PNG WEATHER SPRITE for botanical watercolor forest label. Canvas EXACTLY 1024x1024 pixels square, ALL paint confined INSIDE perfect circle centered512,512 radius500; fullytransparent outsidecircle; composition along UPPER circular arc, not a squarecloudimage clipped. TRUE TRANSPARENT ALPHA background, no paper backdrop, no checkerboard drawn in, no rectangle of background paint. Premium hand-painted traditional watercolor cloud illustration with organic pigment granulation, delicate natural edges. Weatherstage 6/7: Thunderstorm: stormy dark navy-charcoal cloudbank upperquarter, vivid pale gold/ivory branching lightning bolts at x10% and90% from y13 to38%, clear illustrated rain sideedges. Two pronounced lightningbolts, keepcenter free.. Clouds only topquarter y0..25%. Absolutely keep x20..80%,y30..94% FULLY TRANSPARENT for label text. Rain/lightning may descend only on extreme sides x<15% orx>85%. No ground, forest, trees, flowers, frame, sun, moon, text, logos or panels. No uniform opacityfade: distinct increasingly intense weather forms. Single full nativecanvas sprite, no contactsheet, no caption. Soft bluegreys chosen to remain visible against both darknight and brightday forests, lightning drawn as watercolor illustration, notglowphotography.

Ursprungsdatei: `exec-1bc477d0-1cb6-4efc-a311-e16f59c5e71a.png`.

### `layouts/round-lid/thc/7.png`

Use case: stylized-concept. Asset type ONE production transparent PNG WEATHER SPRITE for botanical watercolor forest label. Canvas EXACTLY 1024x1024 pixels square, ALL paint confined INSIDE perfect circle centered512,512 radius500; fullytransparent outsidecircle; composition along UPPER circular arc, not a squarecloudimage clipped. TRUE TRANSPARENT ALPHA background, no paper backdrop, no checkerboard drawn in, no rectangle of background paint. Premium hand-painted traditional watercolor cloud illustration with organic pigment granulation, delicate natural edges. Weatherstage 7/7: Very severe dramatic thunderstorm, much more intense thanstage6: massive deep charcoal/navy rolling cloudbank upperquarter, layered turbulent watercolor darkclouds; FOUR powerful bright palegold/ivory forked lightningbolts near x7%,13%,87%,93% extending to45%height, dense angled streaks of heavy rain down sideedges, most dramatic highcontrast weatherstage. Centraltext remains clear.. Clouds only topquarter y0..25%. Absolutely keep x20..80%,y30..94% FULLY TRANSPARENT for label text. Rain/lightning may descend only on extreme sides x<15% orx>85%. No ground, forest, trees, flowers, frame, sun, moon, text, logos or panels. No uniform opacityfade: distinct increasingly intense weather forms. Single full nativecanvas sprite, no contactsheet, no caption. Soft bluegreys chosen to remain visible against both darknight and brightday forests, lightning drawn as watercolor illustration, notglowphotography.

Ursprungsdatei: `exec-65814a21-9f87-40de-b070-84c3bbc9db5b.png`.

### `layouts/classic-portrait/cbd/1.png`

Use case: stylized-concept. Asset type: ONE transparent PNG SPRITE overlay for premium Watercolor Forest botanical label. Canvas EXACTLY 1024x1536 pixels portrait 2:3. Genuine fully transparent alpha BACKGROUND, absolutely NO white/colored paper rectangle, NO checkerboard painted in, NO landscape/trees/text/border/mockup. Only watercolor botanical ornament. Premium fine traditional watercolor realistic hand-painted small wildflowers, delicate pigment granulation, soft natural paint edges. Geometry: two bottom corners and thin outer side margins x=0..15% and85..100%, growing upward from bottom. CBD ornament stage1/7: ONLY4 tiny delicate sage green botanical leaves near bottom, no stems longer than5%height, absolutely no flowers. Very sparse tiny stage1. CRITICAL: the entire central rectangle x20..80%,y27..91% must remain EMPTY transparent for later typography; all foliage confined narrow outermargins or bottommost9% and topmost16%, never put a flower in centraltext. No cannabis leaves required, natural woodland flowers. Do NOT fade entire ornament by global transparency; use fully colored painted components and naturally translucent watercolor edges. Single sprite full native canvas; no contact sheet.

Ursprungsdatei: `exec-2d41b75d-dde6-4d66-aec0-82b36e869d2b.png`.

### `layouts/classic-portrait/cbd/2.png`

Use case: stylized-concept. Asset type: ONE transparent PNG SPRITE overlay for premium Watercolor Forest botanical label. Canvas EXACTLY 1024x1536 pixels portrait 2:3. Genuine fully transparent alpha BACKGROUND, absolutely NO white/colored paper rectangle, NO checkerboard painted in, NO landscape/trees/text/border/mockup. Only watercolor botanical ornament. Premium fine traditional watercolor realistic hand-painted small wildflowers, delicate pigment granulation, soft natural paint edges. Geometry: two bottom corners and thin outer side margins x=0..15% and85..100%, growing upward from bottom. CBD ornament stage2/7: Two fine winding fernlike stems with small sage leaves rising from bottom to20%height, delicate sparse small leaves, no blossoms. Stage2 visibly taller thanstage1. CRITICAL: the entire central rectangle x20..80%,y27..91% must remain EMPTY transparent for later typography; all foliage confined narrow outermargins or bottommost9% and topmost16%, never put a flower in centraltext. No cannabis leaves required, natural woodland flowers. Do NOT fade entire ornament by global transparency; use fully colored painted components and naturally translucent watercolor edges. Single sprite full native canvas; no contact sheet.

Ursprungsdatei: `exec-aae4d29a-d23e-41a6-95ff-6ec756328ea0.png`.

### `layouts/classic-portrait/cbd/3.png`

Use case: stylized-concept. Asset type: ONE transparent PNG SPRITE overlay for premium Watercolor Forest botanical label. Canvas EXACTLY 1024x1536 pixels portrait 2:3. Genuine fully transparent alpha BACKGROUND, absolutely NO white/colored paper rectangle, NO checkerboard painted in, NO landscape/trees/text/border/mockup. Only watercolor botanical ornament. Premium fine traditional watercolor realistic hand-painted small wildflowers, delicate pigment granulation, soft natural paint edges. Geometry: two bottom corners and thin outer side margins x=0..15% and85..100%, growing upward from bottom. CBD ornament stage3/7: Fine foliage vines rising from bottom to32%height, PLUS first4 small blush pink and ivory wildflower blossoms and tiny buds near lowercorners. Stage3 small flowers first appear. CRITICAL: the entire central rectangle x20..80%,y27..91% must remain EMPTY transparent for later typography; all foliage confined narrow outermargins or bottommost9% and topmost16%, never put a flower in centraltext. No cannabis leaves required, natural woodland flowers. Do NOT fade entire ornament by global transparency; use fully colored painted components and naturally translucent watercolor edges. Single sprite full native canvas; no contact sheet.

Ursprungsdatei: `exec-f3e0c7f1-1b05-4cd4-98c7-c331366b7197.png`.

### `layouts/classic-portrait/cbd/4.png`

Use case: stylized-concept. Asset type: ONE transparent PNG SPRITE overlay for premium Watercolor Forest botanical label. Canvas EXACTLY 1024x1536 pixels portrait 2:3. Genuine fully transparent alpha BACKGROUND, absolutely NO white/colored paper rectangle, NO checkerboard painted in, NO landscape/trees/text/border/mockup. Only watercolor botanical ornament. Premium fine traditional watercolor realistic hand-painted small wildflowers, delicate pigment granulation, soft natural paint edges. Geometry: two bottom corners and thin outer side margins x=0..15% and85..100%, growing upward from bottom. CBD ornament stage4/7: Medium wildflower sprays climbing outer sides to46%height: delicate sage ferns, leaves,8 medium blush pink and creamy ivory daisylike woodland flowers, warm ochre small centers. Stage4 clearly larger and denser. CRITICAL: the entire central rectangle x20..80%,y27..91% must remain EMPTY transparent for later typography; all foliage confined narrow outermargins or bottommost9% and topmost16%, never put a flower in centraltext. No cannabis leaves required, natural woodland flowers. Do NOT fade entire ornament by global transparency; use fully colored painted components and naturally translucent watercolor edges. Single sprite full native canvas; no contact sheet.

Ursprungsdatei: `exec-69095d00-995d-45b4-80bf-4d4cd0bf78b7.png`.

### `layouts/classic-portrait/cbd/5.png`

Use case: stylized-concept. Asset type: ONE transparent PNG SPRITE overlay for premium Watercolor Forest botanical label. Canvas EXACTLY 1024x1536 pixels portrait 2:3. Genuine fully transparent alpha BACKGROUND, absolutely NO white/colored paper rectangle, NO checkerboard painted in, NO landscape/trees/text/border/mockup. Only watercolor botanical ornament. Premium fine traditional watercolor realistic hand-painted small wildflowers, delicate pigment granulation, soft natural paint edges. Geometry: two bottom corners and thin outer side margins x=0..15% and85..100%, growing upward from bottom. CBD ornament stage5/7: Large lush floral sprays reaching62%height at extreme edges,14 varied-size blush pink, dusty rose and ivory wildflowers, fine green climbing vines and leaves. Stage5 large blooming flowers and more complex branching. CRITICAL: the entire central rectangle x20..80%,y27..91% must remain EMPTY transparent for later typography; all foliage confined narrow outermargins or bottommost9% and topmost16%, never put a flower in centraltext. No cannabis leaves required, natural woodland flowers. Do NOT fade entire ornament by global transparency; use fully colored painted components and naturally translucent watercolor edges. Single sprite full native canvas; no contact sheet.

Ursprungsdatei: `exec-3099b392-8a07-412d-8809-f46540d64b9d.png`.

### `layouts/classic-portrait/cbd/6.png`

Use case: stylized-concept. Asset type: ONE transparent PNG SPRITE overlay for premium Watercolor Forest botanical label. Canvas EXACTLY 1024x1536 pixels portrait 2:3. Genuine fully transparent alpha BACKGROUND, absolutely NO white/colored paper rectangle, NO checkerboard painted in, NO landscape/trees/text/border/mockup. Only watercolor botanical ornament. Premium fine traditional watercolor realistic hand-painted small wildflowers, delicate pigment granulation, soft natural paint edges. Geometry: two bottom corners and thin outer side margins x=0..15% and85..100%, growing upward from bottom. CBD ornament stage6/7: Abundant botanical ornament reaching82%height outer edges,22 larger blushpink/ivory/softrose blossoms, lush sage ferns and branching tendrils, thin intermittent upper/lower decorative vines. Stage6 full lush frame, leave central text region clear. CRITICAL: the entire central rectangle x20..80%,y27..91% must remain EMPTY transparent for later typography; all foliage confined narrow outermargins or bottommost9% and topmost16%, never put a flower in centraltext. No cannabis leaves required, natural woodland flowers. Do NOT fade entire ornament by global transparency; use fully colored painted components and naturally translucent watercolor edges. Single sprite full native canvas; no contact sheet.

Ursprungsdatei: `exec-d72c7ad9-a4bb-4ef4-88ea-6044e437b158.png`.

### `layouts/classic-portrait/cbd/7.png`

Use case: stylized-concept. Asset type: ONE transparent PNG SPRITE overlay for premium Watercolor Forest botanical label. Canvas EXACTLY 1024x1536 pixels portrait 2:3. Genuine fully transparent alpha BACKGROUND, absolutely NO white/colored paper rectangle, NO checkerboard painted in, NO landscape/trees/text/border/mockup. Only watercolor botanical ornament. Premium fine traditional watercolor realistic hand-painted small wildflowers, delicate pigment granulation, soft natural paint edges. Geometry: two bottom corners and thin outer side margins x=0..15% and85..100%, growing upward from bottom. CBD ornament stage7/7: Fully grown dense botanical floral FRAME along whole outer rim,32 varied small/large blushpink ivory dustyrose woodland blossoms with warm ochre centers, richly interwoven sage foliage and ferns, thin top and bottom garlands. Stage7 visibly denser more complex and more flowers thanstage6, perimeter only, do not overgrow centraltext. CRITICAL: the entire central rectangle x20..80%,y27..91% must remain EMPTY transparent for later typography; all foliage confined narrow outermargins or bottommost9% and topmost16%, never put a flower in centraltext. No cannabis leaves required, natural woodland flowers. Do NOT fade entire ornament by global transparency; use fully colored painted components and naturally translucent watercolor edges. Single sprite full native canvas; no contact sheet.

Ursprungsdatei: `exec-8322a9fb-bd83-497e-817c-f7814dd15af2.png`.

### `layouts/wide-landscape/cbd/1.png`

Use case: stylized-concept. Asset type: ONE transparent PNG SPRITE overlay for premium Watercolor Forest botanical label. Canvas EXACTLY 1536x1024 pixels landscape 3:2. Genuine fully transparent alpha BACKGROUND, absolutely NO white/colored paper rectangle, NO checkerboard painted in, NO landscape/trees/text/border/mockup. Only watercolor botanical ornament. Premium fine traditional watercolor realistic hand-painted small wildflowers, delicate pigment granulation, soft natural paint edges. Geometry: two bottom corners and thin outer side margins x=0..13% and87..100%, growing upward from bottom; composition designed wide, not a stretched portrait. CBD ornament stage1/7: ONLY4 tiny delicate sage green botanical leaves near bottom, no stems longer than5%height, absolutely no flowers. Very sparse tiny stage1. CRITICAL: the entire central rectangle x20..80%,y27..91% must remain EMPTY transparent for later typography; all foliage confined narrow outermargins or bottommost9% and topmost16%, never put a flower in centraltext. No cannabis leaves required, natural woodland flowers. Do NOT fade entire ornament by global transparency; use fully colored painted components and naturally translucent watercolor edges. Single sprite full native canvas; no contact sheet.

Ursprungsdatei: `exec-96f36cd3-aa2d-4485-b746-2e6623109c26.png`.

### `layouts/wide-landscape/cbd/2.png`

Use case: stylized-concept. Asset type: ONE transparent PNG SPRITE overlay for premium Watercolor Forest botanical label. Canvas EXACTLY 1536x1024 pixels landscape 3:2. Genuine fully transparent alpha BACKGROUND, absolutely NO white/colored paper rectangle, NO checkerboard painted in, NO landscape/trees/text/border/mockup. Only watercolor botanical ornament. Premium fine traditional watercolor realistic hand-painted small wildflowers, delicate pigment granulation, soft natural paint edges. Geometry: two bottom corners and thin outer side margins x=0..13% and87..100%, growing upward from bottom; composition designed wide, not a stretched portrait. CBD ornament stage2/7: Two fine winding fernlike stems with small sage leaves rising from bottom to20%height, delicate sparse small leaves, no blossoms. Stage2 visibly taller thanstage1. CRITICAL: the entire central rectangle x20..80%,y27..91% must remain EMPTY transparent for later typography; all foliage confined narrow outermargins or bottommost9% and topmost16%, never put a flower in centraltext. No cannabis leaves required, natural woodland flowers. Do NOT fade entire ornament by global transparency; use fully colored painted components and naturally translucent watercolor edges. Single sprite full native canvas; no contact sheet.

Ursprungsdatei: `exec-ef0564e2-9a65-4f89-88cf-00c4366b27e2.png`.

### `layouts/wide-landscape/cbd/3.png`

Use case: stylized-concept. Asset type: ONE transparent PNG SPRITE overlay for premium Watercolor Forest botanical label. Canvas EXACTLY 1536x1024 pixels landscape 3:2. Genuine fully transparent alpha BACKGROUND, absolutely NO white/colored paper rectangle, NO checkerboard painted in, NO landscape/trees/text/border/mockup. Only watercolor botanical ornament. Premium fine traditional watercolor realistic hand-painted small wildflowers, delicate pigment granulation, soft natural paint edges. Geometry: two bottom corners and thin outer side margins x=0..13% and87..100%, growing upward from bottom; composition designed wide, not a stretched portrait. CBD ornament stage3/7: Fine foliage vines rising from bottom to32%height, PLUS first4 small blush pink and ivory wildflower blossoms and tiny buds near lowercorners. Stage3 small flowers first appear. CRITICAL: the entire central rectangle x20..80%,y27..91% must remain EMPTY transparent for later typography; all foliage confined narrow outermargins or bottommost9% and topmost16%, never put a flower in centraltext. No cannabis leaves required, natural woodland flowers. Do NOT fade entire ornament by global transparency; use fully colored painted components and naturally translucent watercolor edges. Single sprite full native canvas; no contact sheet.

Ursprungsdatei: `exec-80a1007e-fb76-48bb-8500-b191569e32a2.png`.

### `layouts/wide-landscape/cbd/4.png`

Use case: stylized-concept. Asset type: ONE transparent PNG SPRITE overlay for premium Watercolor Forest botanical label. Canvas EXACTLY 1536x1024 pixels landscape 3:2. Genuine fully transparent alpha BACKGROUND, absolutely NO white/colored paper rectangle, NO checkerboard painted in, NO landscape/trees/text/border/mockup. Only watercolor botanical ornament. Premium fine traditional watercolor realistic hand-painted small wildflowers, delicate pigment granulation, soft natural paint edges. Geometry: two bottom corners and thin outer side margins x=0..13% and87..100%, growing upward from bottom; composition designed wide, not a stretched portrait. CBD ornament stage4/7: Medium wildflower sprays climbing outer sides to46%height: delicate sage ferns, leaves,8 medium blush pink and creamy ivory daisylike woodland flowers, warm ochre small centers. Stage4 clearly larger and denser. CRITICAL: the entire central rectangle x20..80%,y27..91% must remain EMPTY transparent for later typography; all foliage confined narrow outermargins or bottommost9% and topmost16%, never put a flower in centraltext. No cannabis leaves required, natural woodland flowers. Do NOT fade entire ornament by global transparency; use fully colored painted components and naturally translucent watercolor edges. Single sprite full native canvas; no contact sheet.

Ursprungsdatei: `exec-44c17c17-7804-4fd4-b566-cf868822dfd4.png`.

### `layouts/wide-landscape/cbd/5.png`

Use case: stylized-concept. Asset type: ONE transparent PNG SPRITE overlay for premium Watercolor Forest botanical label. Canvas EXACTLY 1536x1024 pixels landscape 3:2. Genuine fully transparent alpha BACKGROUND, absolutely NO white/colored paper rectangle, NO checkerboard painted in, NO landscape/trees/text/border/mockup. Only watercolor botanical ornament. Premium fine traditional watercolor realistic hand-painted small wildflowers, delicate pigment granulation, soft natural paint edges. Geometry: two bottom corners and thin outer side margins x=0..13% and87..100%, growing upward from bottom; composition designed wide, not a stretched portrait. CBD ornament stage5/7: Large lush floral sprays reaching62%height at extreme edges,14 varied-size blush pink, dusty rose and ivory wildflowers, fine green climbing vines and leaves. Stage5 large blooming flowers and more complex branching. CRITICAL: the entire central rectangle x20..80%,y27..91% must remain EMPTY transparent for later typography; all foliage confined narrow outermargins or bottommost9% and topmost16%, never put a flower in centraltext. No cannabis leaves required, natural woodland flowers. Do NOT fade entire ornament by global transparency; use fully colored painted components and naturally translucent watercolor edges. Single sprite full native canvas; no contact sheet.

Ursprungsdatei: `exec-1def842c-a21a-42ae-818b-ba401f1b5fbb.png`.

### `layouts/wide-landscape/cbd/6.png`

Use case: stylized-concept. Asset type: ONE transparent PNG SPRITE overlay for premium Watercolor Forest botanical label. Canvas EXACTLY 1536x1024 pixels landscape 3:2. Genuine fully transparent alpha BACKGROUND, absolutely NO white/colored paper rectangle, NO checkerboard painted in, NO landscape/trees/text/border/mockup. Only watercolor botanical ornament. Premium fine traditional watercolor realistic hand-painted small wildflowers, delicate pigment granulation, soft natural paint edges. Geometry: two bottom corners and thin outer side margins x=0..13% and87..100%, growing upward from bottom; composition designed wide, not a stretched portrait. CBD ornament stage6/7: Abundant botanical ornament reaching82%height outer edges,22 larger blushpink/ivory/softrose blossoms, lush sage ferns and branching tendrils, thin intermittent upper/lower decorative vines. Stage6 full lush frame, leave central text region clear. CRITICAL: the entire central rectangle x20..80%,y27..91% must remain EMPTY transparent for later typography; all foliage confined narrow outermargins or bottommost9% and topmost16%, never put a flower in centraltext. No cannabis leaves required, natural woodland flowers. Do NOT fade entire ornament by global transparency; use fully colored painted components and naturally translucent watercolor edges. Single sprite full native canvas; no contact sheet.

Ursprungsdatei: `exec-00616c40-d27b-4530-a1b5-eac78e79697c.png`.

### `layouts/wide-landscape/cbd/7.png`

Use case: stylized-concept. Asset type: ONE transparent PNG SPRITE overlay for premium Watercolor Forest botanical label. Canvas EXACTLY 1536x1024 pixels landscape 3:2. Genuine fully transparent alpha BACKGROUND, absolutely NO white/colored paper rectangle, NO checkerboard painted in, NO landscape/trees/text/border/mockup. Only watercolor botanical ornament. Premium fine traditional watercolor realistic hand-painted small wildflowers, delicate pigment granulation, soft natural paint edges. Geometry: two bottom corners and thin outer side margins x=0..13% and87..100%, growing upward from bottom; composition designed wide, not a stretched portrait. CBD ornament stage7/7: Fully grown dense botanical floral FRAME along whole outer rim,32 varied small/large blushpink ivory dustyrose woodland blossoms with warm ochre centers, richly interwoven sage foliage and ferns, thin top and bottom garlands. Stage7 visibly denser more complex and more flowers thanstage6, perimeter only, do not overgrow centraltext. CRITICAL: the entire central rectangle x20..80%,y27..91% must remain EMPTY transparent for later typography; all foliage confined narrow outermargins or bottommost9% and topmost16%, never put a flower in centraltext. No cannabis leaves required, natural woodland flowers. Do NOT fade entire ornament by global transparency; use fully colored painted components and naturally translucent watercolor edges. Single sprite full native canvas; no contact sheet.

Ursprungsdatei: `exec-4bc24df7-ff82-4fba-b0f8-56ff07d0b604.png`.

### `layouts/round-lid/cbd/1.png`

Use case: stylized-concept. Asset type: ONE transparent PNG SPRITE overlay for premium Watercolor Forest botanical label. Canvas EXACTLY 1024x1024 pixels SQUARE canvas. Genuine fully transparent alpha BACKGROUND, absolutely NO white/colored paper rectangle, NO checkerboard painted in, NO landscape/trees/text/border/mockup. Only watercolor botanical ornament. Premium fine traditional watercolor realistic hand-painted small wildflowers, delicate pigment granulation, soft natural paint edges. Geometry: inside a perfect circular rim centered512,512 radius500, growing from bottom arc upward symmetrically along outer circular edge; all art within circle and outside remains transparent; no rectangular corners. CBD ornament stage1/7: ONLY4 tiny delicate sage green botanical leaves near bottom, no stems longer than5%height, absolutely no flowers. Very sparse tiny stage1. CRITICAL: the entire central rectangle x20..80%,y27..91% must remain EMPTY transparent for later typography; all foliage confined narrow outermargins or bottommost9% and topmost16%, never put a flower in centraltext. No cannabis leaves required, natural woodland flowers. Do NOT fade entire ornament by global transparency; use fully colored painted components and naturally translucent watercolor edges. Single sprite full native canvas; no contact sheet.

Ursprungsdatei: `exec-ada30249-6c85-4957-a6aa-a8f7e7f6f68d.png`.

### `layouts/round-lid/cbd/2.png`

Use case: stylized-concept. Asset type: ONE transparent PNG SPRITE overlay for premium Watercolor Forest botanical label. Canvas EXACTLY 1024x1024 pixels SQUARE canvas. Genuine fully transparent alpha BACKGROUND, absolutely NO white/colored paper rectangle, NO checkerboard painted in, NO landscape/trees/text/border/mockup. Only watercolor botanical ornament. Premium fine traditional watercolor realistic hand-painted small wildflowers, delicate pigment granulation, soft natural paint edges. Geometry: inside a perfect circular rim centered512,512 radius500, growing from bottom arc upward symmetrically along outer circular edge; all art within circle and outside remains transparent; no rectangular corners. CBD ornament stage2/7: Two fine winding fernlike stems with small sage leaves rising from bottom to20%height, delicate sparse small leaves, no blossoms. Stage2 visibly taller thanstage1. CRITICAL: the entire central rectangle x20..80%,y27..91% must remain EMPTY transparent for later typography; all foliage confined narrow outermargins or bottommost9% and topmost16%, never put a flower in centraltext. No cannabis leaves required, natural woodland flowers. Do NOT fade entire ornament by global transparency; use fully colored painted components and naturally translucent watercolor edges. Single sprite full native canvas; no contact sheet.

Ursprungsdatei: `exec-87eb7b71-bba8-4568-bc03-6e426dba1413.png`.

### `layouts/round-lid/cbd/3.png`

Use case: stylized-concept. Asset type: ONE transparent PNG SPRITE overlay for premium Watercolor Forest botanical label. Canvas EXACTLY 1024x1024 pixels SQUARE canvas. Genuine fully transparent alpha BACKGROUND, absolutely NO white/colored paper rectangle, NO checkerboard painted in, NO landscape/trees/text/border/mockup. Only watercolor botanical ornament. Premium fine traditional watercolor realistic hand-painted small wildflowers, delicate pigment granulation, soft natural paint edges. Geometry: inside a perfect circular rim centered512,512 radius500, growing from bottom arc upward symmetrically along outer circular edge; all art within circle and outside remains transparent; no rectangular corners. CBD ornament stage3/7: Fine foliage vines rising from bottom to32%height, PLUS first4 small blush pink and ivory wildflower blossoms and tiny buds near lowercorners. Stage3 small flowers first appear. CRITICAL: the entire central rectangle x20..80%,y27..91% must remain EMPTY transparent for later typography; all foliage confined narrow outermargins or bottommost9% and topmost16%, never put a flower in centraltext. No cannabis leaves required, natural woodland flowers. Do NOT fade entire ornament by global transparency; use fully colored painted components and naturally translucent watercolor edges. Single sprite full native canvas; no contact sheet.

Ursprungsdatei: `exec-352230e9-3a24-43dc-917a-3c1245b4da5e.png`.

### `layouts/round-lid/cbd/4.png`

Use case: stylized-concept. Asset type: ONE transparent PNG SPRITE overlay for premium Watercolor Forest botanical label. Canvas EXACTLY 1024x1024 pixels SQUARE canvas. Genuine fully transparent alpha BACKGROUND, absolutely NO white/colored paper rectangle, NO checkerboard painted in, NO landscape/trees/text/border/mockup. Only watercolor botanical ornament. Premium fine traditional watercolor realistic hand-painted small wildflowers, delicate pigment granulation, soft natural paint edges. Geometry: inside a perfect circular rim centered512,512 radius500, growing from bottom arc upward symmetrically along outer circular edge; all art within circle and outside remains transparent; no rectangular corners. CBD ornament stage4/7: Medium wildflower sprays climbing outer sides to46%height: delicate sage ferns, leaves,8 medium blush pink and creamy ivory daisylike woodland flowers, warm ochre small centers. Stage4 clearly larger and denser. CRITICAL: the entire central rectangle x20..80%,y27..91% must remain EMPTY transparent for later typography; all foliage confined narrow outermargins or bottommost9% and topmost16%, never put a flower in centraltext. No cannabis leaves required, natural woodland flowers. Do NOT fade entire ornament by global transparency; use fully colored painted components and naturally translucent watercolor edges. Single sprite full native canvas; no contact sheet.

Ursprungsdatei: `exec-c06567f6-081c-4e79-840f-9563940d4707.png`.

### `layouts/round-lid/cbd/5.png`

Use case: stylized-concept. Asset type: ONE transparent PNG SPRITE overlay for premium Watercolor Forest botanical label. Canvas EXACTLY 1024x1024 pixels SQUARE canvas. Genuine fully transparent alpha BACKGROUND, absolutely NO white/colored paper rectangle, NO checkerboard painted in, NO landscape/trees/text/border/mockup. Only watercolor botanical ornament. Premium fine traditional watercolor realistic hand-painted small wildflowers, delicate pigment granulation, soft natural paint edges. Geometry: inside a perfect circular rim centered512,512 radius500, growing from bottom arc upward symmetrically along outer circular edge; all art within circle and outside remains transparent; no rectangular corners. CBD ornament stage5/7: Large lush floral sprays reaching62%height at extreme edges,14 varied-size blush pink, dusty rose and ivory wildflowers, fine green climbing vines and leaves. Stage5 large blooming flowers and more complex branching. CRITICAL: the entire central rectangle x20..80%,y27..91% must remain EMPTY transparent for later typography; all foliage confined narrow outermargins or bottommost9% and topmost16%, never put a flower in centraltext. No cannabis leaves required, natural woodland flowers. Do NOT fade entire ornament by global transparency; use fully colored painted components and naturally translucent watercolor edges. Single sprite full native canvas; no contact sheet.

Ursprungsdatei: `exec-ab9b1f74-fa7d-4031-be1f-1809dfce1c68.png`.

### `layouts/round-lid/cbd/6.png`

Use case: stylized-concept. Asset type: ONE transparent PNG SPRITE overlay for premium Watercolor Forest botanical label. Canvas EXACTLY 1024x1024 pixels SQUARE canvas. Genuine fully transparent alpha BACKGROUND, absolutely NO white/colored paper rectangle, NO checkerboard painted in, NO landscape/trees/text/border/mockup. Only watercolor botanical ornament. Premium fine traditional watercolor realistic hand-painted small wildflowers, delicate pigment granulation, soft natural paint edges. Geometry: inside a perfect circular rim centered512,512 radius500, growing from bottom arc upward symmetrically along outer circular edge; all art within circle and outside remains transparent; no rectangular corners. CBD ornament stage6/7: Abundant botanical ornament reaching82%height outer edges,22 larger blushpink/ivory/softrose blossoms, lush sage ferns and branching tendrils, thin intermittent upper/lower decorative vines. Stage6 full lush frame, leave central text region clear. CRITICAL: the entire central rectangle x20..80%,y27..91% must remain EMPTY transparent for later typography; all foliage confined narrow outermargins or bottommost9% and topmost16%, never put a flower in centraltext. No cannabis leaves required, natural woodland flowers. Do NOT fade entire ornament by global transparency; use fully colored painted components and naturally translucent watercolor edges. Single sprite full native canvas; no contact sheet.

Ursprungsdatei: `exec-e876c54b-88e5-43b3-bd38-4054a3ef5da0.png`.

### `layouts/round-lid/cbd/7.png`

Use case: stylized-concept. Asset type: ONE transparent PNG SPRITE overlay for premium Watercolor Forest botanical label. Canvas EXACTLY 1024x1024 pixels SQUARE canvas. Genuine fully transparent alpha BACKGROUND, absolutely NO white/colored paper rectangle, NO checkerboard painted in, NO landscape/trees/text/border/mockup. Only watercolor botanical ornament. Premium fine traditional watercolor realistic hand-painted small wildflowers, delicate pigment granulation, soft natural paint edges. Geometry: inside a perfect circular rim centered512,512 radius500, growing from bottom arc upward symmetrically along outer circular edge; all art within circle and outside remains transparent; no rectangular corners. CBD ornament stage7/7: Fully grown dense botanical floral FRAME along whole outer rim,32 varied small/large blushpink ivory dustyrose woodland blossoms with warm ochre centers, richly interwoven sage foliage and ferns, thin top and bottom garlands. Stage7 visibly denser more complex and more flowers thanstage6, perimeter only, do not overgrow centraltext. CRITICAL: the entire central rectangle x20..80%,y27..91% must remain EMPTY transparent for later typography; all foliage confined narrow outermargins or bottommost9% and topmost16%, never put a flower in centraltext. No cannabis leaves required, natural woodland flowers. Do NOT fade entire ornament by global transparency; use fully colored painted components and naturally translucent watercolor edges. Single sprite full native canvas; no contact sheet.

Ursprungsdatei: `exec-704b4ffd-161e-4e60-bc3c-c534bc3e280c.png`.


## Version 1.1.0: getrennte Landschaft und Bäume

42 Bilder wurden mit dem integrierten Imagegen-Werkzeug anhand der bisherigen 21 vollständigen Landschaften bearbeitet. Je Layout und Tageszeit wurden die großen Vordergrundbäume und nahen Bodenpflanzen als transparentes PNG extrahiert und die dahinterliegenden Bereiche der Landschaft ergänzt. Die native Auflösung und die bestehenden Textkoordinaten bleiben erhalten. Generative Bearbeitungen sind keine pixelidentische Zerlegung; kleine Details können abweichen. RGB-Ausgaben wurden verlustfrei zu RGBA8 normalisiert. Keine CLI/API-Fallbacks.

### Split: layouts/classic-portrait/genetics/1.png

Edit target: bisherige vollständige Landschaft layouts/classic-portrait/genetics/1.png.

Use case: precise-object-edit. EDIT TARGET is the provided watercolor landscape. Output exactly ONE full-canvas 1024x1536 portrait background PNG. Remove ONLY the close large fir trees at the extreme left and right edges and the foreground moss rocks ferns across the bottom. Reconstruct the sky and distant misty mountain/forest valley seamlessly behind the removed foreground, all the way to canvas edges. Preserve the existing distant ridge horizon position, colors, time of day, lighting, moon/sun/stars if present, delicate paper watercolor texture and open central typography area. Do not add clouds, rain or lightning; those are separate layers. No new large trees, no text, frame or montage. Opaque full-canvas background. This is the rear half of a two-layer split: all close trees and plants will be on a separate transparent foreground PNG. Save a local PNG and return path.

Generierte Datei: exec-34d18567-a8d2-44a6-acbc-8b7d4eaa28ce.png.

### Split: layouts/classic-portrait/genetics/2.png

Edit target: bisherige vollständige Landschaft layouts/classic-portrait/genetics/2.png.

Use case: precise-object-edit. EDIT TARGET is the provided watercolor landscape. Output exactly ONE full-canvas 1024x1536 portrait background PNG. Remove ONLY the close large fir trees at the extreme left and right edges and the foreground moss rocks ferns across the bottom. Reconstruct the sky and distant misty mountain/forest valley seamlessly behind the removed foreground, all the way to canvas edges. Preserve the existing distant ridge horizon position, colors, time of day, lighting, moon/sun/stars if present, delicate paper watercolor texture and open central typography area. Do not add clouds, rain or lightning; those are separate layers. No new large trees, no text, frame or montage. Opaque full-canvas background. This is the rear half of a two-layer split: all close trees and plants will be on a separate transparent foreground PNG. Save a local PNG and return path.

Generierte Datei: exec-2d67b3c5-09bc-418b-a8f4-c91603c8ef81.png.

### Split: layouts/classic-portrait/genetics/3.png

Edit target: bisherige vollständige Landschaft layouts/classic-portrait/genetics/3.png.

Use case: precise-object-edit. EDIT TARGET is the provided watercolor landscape. Output exactly ONE full-canvas 1024x1536 portrait background PNG. Remove ONLY the close large fir trees at the extreme left and right edges and the foreground moss rocks ferns across the bottom. Reconstruct the sky and distant misty mountain/forest valley seamlessly behind the removed foreground, all the way to canvas edges. Preserve the existing distant ridge horizon position, colors, time of day, lighting, moon/sun/stars if present, delicate paper watercolor texture and open central typography area. Do not add clouds, rain or lightning; those are separate layers. No new large trees, no text, frame or montage. Opaque full-canvas background. This is the rear half of a two-layer split: all close trees and plants will be on a separate transparent foreground PNG. Save a local PNG and return path.

Generierte Datei: exec-5b2eae4e-1530-42a7-b8f9-ad479ac3060a.png.

### Split: layouts/classic-portrait/genetics/4.png

Edit target: bisherige vollständige Landschaft layouts/classic-portrait/genetics/4.png.

Use case: precise-object-edit. EDIT TARGET is the provided watercolor landscape. Output exactly ONE full-canvas 1024x1536 portrait background PNG. Remove ONLY the close large fir trees at the extreme left and right edges and the foreground moss rocks ferns across the bottom. Reconstruct the sky and distant misty mountain/forest valley seamlessly behind the removed foreground, all the way to canvas edges. Preserve the existing distant ridge horizon position, colors, time of day, lighting, moon/sun/stars if present, delicate paper watercolor texture and open central typography area. Do not add clouds, rain or lightning; those are separate layers. No new large trees, no text, frame or montage. Opaque full-canvas background. This is the rear half of a two-layer split: all close trees and plants will be on a separate transparent foreground PNG. Save a local PNG and return path.

Generierte Datei: exec-92c6838f-7b22-4310-b875-d66c3d74c7b7.png.

### Split: layouts/classic-portrait/genetics/5.png

Edit target: bisherige vollständige Landschaft layouts/classic-portrait/genetics/5.png.

Use case: precise-object-edit. EDIT TARGET is the provided watercolor landscape. Output exactly ONE full-canvas 1024x1536 portrait background PNG. Remove ONLY the close large fir trees at the extreme left and right edges and the foreground moss rocks ferns across the bottom. Reconstruct the sky and distant misty mountain/forest valley seamlessly behind the removed foreground, all the way to canvas edges. Preserve the existing distant ridge horizon position, colors, time of day, lighting, moon/sun/stars if present, delicate paper watercolor texture and open central typography area. Do not add clouds, rain or lightning; those are separate layers. No new large trees, no text, frame or montage. Opaque full-canvas background. This is the rear half of a two-layer split: all close trees and plants will be on a separate transparent foreground PNG. Save a local PNG and return path.

Generierte Datei: exec-b46a8f33-1caa-432a-aae2-0dde7d4a5532.png.

### Split: layouts/classic-portrait/genetics/6.png

Edit target: bisherige vollständige Landschaft layouts/classic-portrait/genetics/6.png.

Use case: precise-object-edit. EDIT TARGET is the provided watercolor landscape. Output exactly ONE full-canvas 1024x1536 portrait background PNG. Remove ONLY the close large fir trees at the extreme left and right edges and the foreground moss rocks ferns across the bottom. Reconstruct the sky and distant misty mountain/forest valley seamlessly behind the removed foreground, all the way to canvas edges. Preserve the existing distant ridge horizon position, colors, time of day, lighting, moon/sun/stars if present, delicate paper watercolor texture and open central typography area. Do not add clouds, rain or lightning; those are separate layers. No new large trees, no text, frame or montage. Opaque full-canvas background. This is the rear half of a two-layer split: all close trees and plants will be on a separate transparent foreground PNG. Save a local PNG and return path.

Generierte Datei: exec-89dfe897-310e-4c41-a30d-7cdb9ef9dfee.png.

### Split: layouts/classic-portrait/genetics/7.png

Edit target: bisherige vollständige Landschaft layouts/classic-portrait/genetics/7.png.

Use case: precise-object-edit. EDIT TARGET is the provided watercolor landscape. Output exactly ONE full-canvas 1024x1536 portrait background PNG. Remove ONLY the close large fir trees at the extreme left and right edges and the foreground moss rocks ferns across the bottom. Reconstruct the sky and distant misty mountain/forest valley seamlessly behind the removed foreground, all the way to canvas edges. Preserve the existing distant ridge horizon position, colors, time of day, lighting, moon/sun/stars if present, delicate paper watercolor texture and open central typography area. Do not add clouds, rain or lightning; those are separate layers. No new large trees, no text, frame or montage. Opaque full-canvas background. This is the rear half of a two-layer split: all close trees and plants will be on a separate transparent foreground PNG. Save a local PNG and return path.

Generierte Datei: exec-c2a143cb-2516-4f3b-8f95-6c376281600f.png.

### Split: layouts/classic-portrait/foreground/1.png

Edit target: bisherige vollständige Landschaft layouts/classic-portrait/genetics/1.png.

Use case: background-extraction. EDIT TARGET is provided watercolor forest. Output ONE transparent foreground PNG with full original portrait canvas 1024x1536. Extract ONLY large close fir trees left/right edges and close bottom moss rocks ferns. Erase ALL sky, mountain ridges, mist and distant small forest completely to alpha zero. Retain original positions, full canvas, exact scale, fine needle silhouettes, watercolor texture and original time-of-day colors/lighting. No gray/white matte, haze or residual background across the open center. Do not recenter, crop or add anything. This layer sits above weather on the separately reconstructed rear landscape. Genuine transparent PNG; save local file and return path.

Generierte Datei: exec-8bd0e6fc-e3b5-4e85-bdeb-6897e5a176c0.png.

### Split: layouts/classic-portrait/foreground/2.png

Edit target: bisherige vollständige Landschaft layouts/classic-portrait/genetics/2.png.

Use case: background-extraction. EDIT TARGET is provided watercolor forest. Output ONE transparent foreground PNG with full original portrait canvas 1024x1536. Extract ONLY large close fir trees left/right edges and close bottom moss rocks ferns. Erase ALL sky, mountain ridges, mist and distant small forest completely to alpha zero. Retain original positions, full canvas, exact scale, fine needle silhouettes, watercolor texture and original time-of-day colors/lighting. No gray/white matte, haze or residual background across the open center. Do not recenter, crop or add anything. This layer sits above weather on the separately reconstructed rear landscape. Genuine transparent PNG; save local file and return path.

Generierte Datei: exec-7546c615-f702-4602-9416-0cd43a49838c.png.

### Split: layouts/classic-portrait/foreground/3.png

Edit target: bisherige vollständige Landschaft layouts/classic-portrait/genetics/3.png.

Use case: background-extraction. EDIT TARGET is provided watercolor forest. Output ONE transparent foreground PNG with full original portrait canvas 1024x1536. Extract ONLY large close fir trees left/right edges and close bottom moss rocks ferns. Erase ALL sky, mountain ridges, mist and distant small forest completely to alpha zero. Retain original positions, full canvas, exact scale, fine needle silhouettes, watercolor texture and original time-of-day colors/lighting. No gray/white matte, haze or residual background across the open center. Do not recenter, crop or add anything. This layer sits above weather on the separately reconstructed rear landscape. Genuine transparent PNG; save local file and return path.

Generierte Datei: exec-cf15cea8-4976-4348-80bb-75d8cb29e533.png.

### Split: layouts/classic-portrait/foreground/5.png

Edit target: bisherige vollständige Landschaft layouts/classic-portrait/genetics/5.png.

Use case: background-extraction. EDIT TARGET is provided watercolor forest. Output ONE transparent foreground PNG with full original portrait canvas 1024x1536. Extract ONLY large close fir trees left/right edges and close bottom moss rocks ferns. Erase ALL sky, mountain ridges, mist and distant small forest completely to alpha zero. Retain original positions, full canvas, exact scale, fine needle silhouettes, watercolor texture and original time-of-day colors/lighting. No gray/white matte, haze or residual background across the open center. Do not recenter, crop or add anything. This layer sits above weather on the separately reconstructed rear landscape. Genuine transparent PNG; save local file and return path.

Generierte Datei: exec-f140eede-56af-4fc1-9fe7-753cace9055d.png.

### Split: layouts/classic-portrait/foreground/6.png

Edit target: bisherige vollständige Landschaft layouts/classic-portrait/genetics/6.png.

Use case: background-extraction. EDIT TARGET is provided watercolor forest. Output ONE transparent foreground PNG with full original portrait canvas 1024x1536. Extract ONLY large close fir trees left/right edges and close bottom moss rocks ferns. Erase ALL sky, mountain ridges, mist and distant small forest completely to alpha zero. Retain original positions, full canvas, exact scale, fine needle silhouettes, watercolor texture and original time-of-day colors/lighting. No gray/white matte, haze or residual background across the open center. Do not recenter, crop or add anything. This layer sits above weather on the separately reconstructed rear landscape. Genuine transparent PNG; save local file and return path.

Generierte Datei: exec-3bfcc212-9879-4de2-bb1a-f2d829d57226.png.

### Split: layouts/classic-portrait/foreground/7.png

Edit target: bisherige vollständige Landschaft layouts/classic-portrait/genetics/7.png.

Use case: background-extraction. EDIT TARGET is provided watercolor forest. Output ONE transparent foreground PNG with full original portrait canvas 1024x1536. Extract ONLY large close fir trees left/right edges and close bottom moss rocks ferns. Erase ALL sky, mountain ridges, mist and distant small forest completely to alpha zero. Retain original positions, full canvas, exact scale, fine needle silhouettes, watercolor texture and original time-of-day colors/lighting. No gray/white matte, haze or residual background across the open center. Do not recenter, crop or add anything. This layer sits above weather on the separately reconstructed rear landscape. Genuine transparent PNG; save local file and return path.

Generierte Datei: exec-f9391651-e7c3-4c24-98b0-8afaed4ee813.png.

### Split: layouts/classic-portrait/foreground/4.png

Edit target: bisherige vollständige Landschaft layouts/classic-portrait/genetics/4.png.

Extract close trees and bottom plants preserving full canvas and golden afternoon colors; remove sky and distant landscape to alpha transparency.

Generierte Datei: exec-df42a7d1-46c3-489a-bf70-a5c10963e6f6.png.

### Split: layouts/wide-landscape/genetics/1.png

Edit target: bisherige vollständige Landschaft layouts/wide-landscape/genetics/1.png.

Use case: precise-object-edit. Create the BACKGROUND half of a two-layer split of the provided watercolor edit target. Full original landscape canvas exactly 1536x1024. Remove the close large fir trees at extreme left/right edges and the near ground moss rocks ferns at bottom. Seamlessly reconstruct sky, distant mountain/forest ridges and misty valley in those areas to all canvas edges. Preserve original time-of-day palette, watercolor paper texture, distant horizon coordinates and lighting, moon/sun/stars if present. Retain open quiet center. No large foreground trees, plants, rocks, clouds, rain, lightning, text or border. Opaque full-canvas background. Save local PNG and return path.

Generierte Datei: exec-6028f115-7264-48c6-9d48-54a69823e877.png.

### Split: layouts/wide-landscape/genetics/2.png

Edit target: bisherige vollständige Landschaft layouts/wide-landscape/genetics/2.png.

Use case: precise-object-edit. Create the BACKGROUND half of a two-layer split of the provided watercolor edit target. Full original landscape canvas exactly 1536x1024. Remove the close large fir trees at extreme left/right edges and the near ground moss rocks ferns at bottom. Seamlessly reconstruct sky, distant mountain/forest ridges and misty valley in those areas to all canvas edges. Preserve original time-of-day palette, watercolor paper texture, distant horizon coordinates and lighting, moon/sun/stars if present. Retain open quiet center. No large foreground trees, plants, rocks, clouds, rain, lightning, text or border. Opaque full-canvas background. Save local PNG and return path.

Generierte Datei: exec-75342a6c-15a8-4d82-a059-024abf2e6320.png.

### Split: layouts/wide-landscape/genetics/3.png

Edit target: bisherige vollständige Landschaft layouts/wide-landscape/genetics/3.png.

Use case: precise-object-edit. Create the BACKGROUND half of a two-layer split of the provided watercolor edit target. Full original landscape canvas exactly 1536x1024. Remove the close large fir trees at extreme left/right edges and the near ground moss rocks ferns at bottom. Seamlessly reconstruct sky, distant mountain/forest ridges and misty valley in those areas to all canvas edges. Preserve original time-of-day palette, watercolor paper texture, distant horizon coordinates and lighting, moon/sun/stars if present. Retain open quiet center. No large foreground trees, plants, rocks, clouds, rain, lightning, text or border. Opaque full-canvas background. Save local PNG and return path.

Generierte Datei: exec-1db2241c-9a38-4581-906b-138d0d5558ed.png.

### Split: layouts/wide-landscape/genetics/4.png

Edit target: bisherige vollständige Landschaft layouts/wide-landscape/genetics/4.png.

Use case: precise-object-edit. Create the BACKGROUND half of a two-layer split of the provided watercolor edit target. Full original landscape canvas exactly 1536x1024. Remove the close large fir trees at extreme left/right edges and the near ground moss rocks ferns at bottom. Seamlessly reconstruct sky, distant mountain/forest ridges and misty valley in those areas to all canvas edges. Preserve original time-of-day palette, watercolor paper texture, distant horizon coordinates and lighting, moon/sun/stars if present. Retain open quiet center. No large foreground trees, plants, rocks, clouds, rain, lightning, text or border. Opaque full-canvas background. Save local PNG and return path.

Generierte Datei: exec-51fd209d-3207-4f88-b521-82de9716b533.png.

### Split: layouts/wide-landscape/genetics/5.png

Edit target: bisherige vollständige Landschaft layouts/wide-landscape/genetics/5.png.

Use case: precise-object-edit. Create the BACKGROUND half of a two-layer split of the provided watercolor edit target. Full original landscape canvas exactly 1536x1024. Remove the close large fir trees at extreme left/right edges and the near ground moss rocks ferns at bottom. Seamlessly reconstruct sky, distant mountain/forest ridges and misty valley in those areas to all canvas edges. Preserve original time-of-day palette, watercolor paper texture, distant horizon coordinates and lighting, moon/sun/stars if present. Retain open quiet center. No large foreground trees, plants, rocks, clouds, rain, lightning, text or border. Opaque full-canvas background. Save local PNG and return path.

Generierte Datei: exec-a1ceddfa-a28a-479f-8bbb-214412f4c008.png.

### Split: layouts/wide-landscape/genetics/6.png

Edit target: bisherige vollständige Landschaft layouts/wide-landscape/genetics/6.png.

Use case: precise-object-edit. Create the BACKGROUND half of a two-layer split of the provided watercolor edit target. Full original landscape canvas exactly 1536x1024. Remove the close large fir trees at extreme left/right edges and the near ground moss rocks ferns at bottom. Seamlessly reconstruct sky, distant mountain/forest ridges and misty valley in those areas to all canvas edges. Preserve original time-of-day palette, watercolor paper texture, distant horizon coordinates and lighting, moon/sun/stars if present. Retain open quiet center. No large foreground trees, plants, rocks, clouds, rain, lightning, text or border. Opaque full-canvas background. Save local PNG and return path.

Generierte Datei: exec-5768a5d3-1399-43ff-89cc-7617f6526b47.png.

### Split: layouts/wide-landscape/genetics/7.png

Edit target: bisherige vollständige Landschaft layouts/wide-landscape/genetics/7.png.

Use case: precise-object-edit. Create the BACKGROUND half of a two-layer split of the provided watercolor edit target. Full original landscape canvas exactly 1536x1024. Remove the close large fir trees at extreme left/right edges and the near ground moss rocks ferns at bottom. Seamlessly reconstruct sky, distant mountain/forest ridges and misty valley in those areas to all canvas edges. Preserve original time-of-day palette, watercolor paper texture, distant horizon coordinates and lighting, moon/sun/stars if present. Retain open quiet center. No large foreground trees, plants, rocks, clouds, rain, lightning, text or border. Opaque full-canvas background. Save local PNG and return path.

Generierte Datei: exec-98b68623-fd8d-4e70-8327-ff2707f7120e.png.

### Split: layouts/wide-landscape/foreground/1.png

Edit target: bisherige vollständige Landschaft layouts/wide-landscape/genetics/1.png.

Use case: background-extraction. Extract a transparent FOREGROUND PNG from the provided edit target. Keep full original landscape canvas exactly 1536x1024 and all original positions. Retain ONLY close large fir trees framing far left/right edges and the close ground with moss rocks ferns along bottom. Erase sky, distant mountain ridges, valley mist and distant small trees completely to alpha zero. Preserve fine branch silhouettes, watercolor textures, original time-of-day colors and lighting. No matte, gray haze or background across open center; real alpha transparency. Do not recenter or crop objects. No additions or text. Save a local PNG and return path.

Generierte Datei: exec-3c36c65a-dc49-4184-94eb-826da88df11e.png.

### Split: layouts/wide-landscape/foreground/2.png

Edit target: bisherige vollständige Landschaft layouts/wide-landscape/genetics/2.png.

Use case: background-extraction. Extract a transparent FOREGROUND PNG from the provided edit target. Keep full original landscape canvas exactly 1536x1024 and all original positions. Retain ONLY close large fir trees framing far left/right edges and the close ground with moss rocks ferns along bottom. Erase sky, distant mountain ridges, valley mist and distant small trees completely to alpha zero. Preserve fine branch silhouettes, watercolor textures, original time-of-day colors and lighting. No matte, gray haze or background across open center; real alpha transparency. Do not recenter or crop objects. No additions or text. Save a local PNG and return path.

Generierte Datei: exec-5f10e0c5-ebde-444f-af90-6b33fec38ad5.png.

### Split: layouts/wide-landscape/foreground/3.png

Edit target: bisherige vollständige Landschaft layouts/wide-landscape/genetics/3.png.

Use case: background-extraction. Extract a transparent FOREGROUND PNG from the provided edit target. Keep full original landscape canvas exactly 1536x1024 and all original positions. Retain ONLY close large fir trees framing far left/right edges and the close ground with moss rocks ferns along bottom. Erase sky, distant mountain ridges, valley mist and distant small trees completely to alpha zero. Preserve fine branch silhouettes, watercolor textures, original time-of-day colors and lighting. No matte, gray haze or background across open center; real alpha transparency. Do not recenter or crop objects. No additions or text. Save a local PNG and return path.

Generierte Datei: exec-80c823e1-afe6-47c1-b5ed-17cf6222525d.png.

### Split: layouts/wide-landscape/foreground/4.png

Edit target: bisherige vollständige Landschaft layouts/wide-landscape/genetics/4.png.

Use case: background-extraction. Extract a transparent FOREGROUND PNG from the provided edit target. Keep full original landscape canvas exactly 1536x1024 and all original positions. Retain ONLY close large fir trees framing far left/right edges and the close ground with moss rocks ferns along bottom. Erase sky, distant mountain ridges, valley mist and distant small trees completely to alpha zero. Preserve fine branch silhouettes, watercolor textures, original time-of-day colors and lighting. No matte, gray haze or background across open center; real alpha transparency. Do not recenter or crop objects. No additions or text. Save a local PNG and return path.

Generierte Datei: exec-2c128cc0-fd9d-48a4-934d-c3ae6a5f6b7b.png.

### Split: layouts/wide-landscape/foreground/5.png

Edit target: bisherige vollständige Landschaft layouts/wide-landscape/genetics/5.png.

Use case: background-extraction. Extract a transparent FOREGROUND PNG from the provided edit target. Keep full original landscape canvas exactly 1536x1024 and all original positions. Retain ONLY close large fir trees framing far left/right edges and the close ground with moss rocks ferns along bottom. Erase sky, distant mountain ridges, valley mist and distant small trees completely to alpha zero. Preserve fine branch silhouettes, watercolor textures, original time-of-day colors and lighting. No matte, gray haze or background across open center; real alpha transparency. Do not recenter or crop objects. No additions or text. Save a local PNG and return path.

Generierte Datei: exec-66a64f8a-1924-4d91-9778-0a14f354050a.png.

### Split: layouts/wide-landscape/foreground/6.png

Edit target: bisherige vollständige Landschaft layouts/wide-landscape/genetics/6.png.

Use case: background-extraction. Extract a transparent FOREGROUND PNG from the provided edit target. Keep full original landscape canvas exactly 1536x1024 and all original positions. Retain ONLY close large fir trees framing far left/right edges and the close ground with moss rocks ferns along bottom. Erase sky, distant mountain ridges, valley mist and distant small trees completely to alpha zero. Preserve fine branch silhouettes, watercolor textures, original time-of-day colors and lighting. No matte, gray haze or background across open center; real alpha transparency. Do not recenter or crop objects. No additions or text. Save a local PNG and return path.

Generierte Datei: exec-21ba86d5-5c7d-4bf7-8f5b-35d004018fc5.png.

### Split: layouts/wide-landscape/foreground/7.png

Edit target: bisherige vollständige Landschaft layouts/wide-landscape/genetics/7.png.

Use case: background-extraction. Extract a transparent FOREGROUND PNG from the provided edit target. Keep full original landscape canvas exactly 1536x1024 and all original positions. Retain ONLY close large fir trees framing far left/right edges and the close ground with moss rocks ferns along bottom. Erase sky, distant mountain ridges, valley mist and distant small trees completely to alpha zero. Preserve fine branch silhouettes, watercolor textures, original time-of-day colors and lighting. No matte, gray haze or background across open center; real alpha transparency. Do not recenter or crop objects. No additions or text. Save a local PNG and return path.

Generierte Datei: exec-8b709ee9-55d9-45c1-b913-f60cbe64104b.png.

### Split: layouts/round-lid/genetics/1.png

Edit target: bisherige vollständige Landschaft layouts/round-lid/genetics/1.png.

Use case: precise-object-edit. Create BACKGROUND half of a two-layer split of provided circular watercolor edit target. Keep exact original square canvas 1254x1254, with same centered circle boundary and transparent outside. Remove ONLY close large fir trees left/right and near bottom moss rocks ferns. Reconstruct the sky and distant mountain forest misty valley behind them continuously to circle edge. Preserve original distant ridge horizon positions, colors, time of day, lighting, watercolor texture and moon/sun/stars if present. No clouds, rain, lightning, large foreground trees or plants, lettering or border. Interior circle opaque, outside circle alpha zero. Save local PNG and return path.

Generierte Datei: exec-9608eef1-293c-419a-99b9-36072d545d52.png.

### Split: layouts/round-lid/genetics/2.png

Edit target: bisherige vollständige Landschaft layouts/round-lid/genetics/2.png.

Use case: precise-object-edit. Create BACKGROUND half of a two-layer split of provided circular watercolor edit target. Keep exact original square canvas 1254x1254, with same centered circle boundary and transparent outside. Remove ONLY close large fir trees left/right and near bottom moss rocks ferns. Reconstruct the sky and distant mountain forest misty valley behind them continuously to circle edge. Preserve original distant ridge horizon positions, colors, time of day, lighting, watercolor texture and moon/sun/stars if present. No clouds, rain, lightning, large foreground trees or plants, lettering or border. Interior circle opaque, outside circle alpha zero. Save local PNG and return path.

Generierte Datei: exec-ea47e956-3a94-48a9-9655-c284491edc9f.png.

### Split: layouts/round-lid/genetics/3.png

Edit target: bisherige vollständige Landschaft layouts/round-lid/genetics/3.png.

Use case: precise-object-edit. Create BACKGROUND half of a two-layer split of provided circular watercolor edit target. Keep exact original square canvas 1254x1254, with same centered circle boundary and transparent outside. Remove ONLY close large fir trees left/right and near bottom moss rocks ferns. Reconstruct the sky and distant mountain forest misty valley behind them continuously to circle edge. Preserve original distant ridge horizon positions, colors, time of day, lighting, watercolor texture and moon/sun/stars if present. No clouds, rain, lightning, large foreground trees or plants, lettering or border. Interior circle opaque, outside circle alpha zero. Save local PNG and return path.

Generierte Datei: exec-cefbf9fb-db17-4985-bcb4-e367ad491c6d.png.

### Split: layouts/round-lid/genetics/4.png

Edit target: bisherige vollständige Landschaft layouts/round-lid/genetics/4.png.

Use case: precise-object-edit. Create BACKGROUND half of a two-layer split of provided circular watercolor edit target. Keep exact original square canvas 1254x1254, with same centered circle boundary and transparent outside. Remove ONLY close large fir trees left/right and near bottom moss rocks ferns. Reconstruct the sky and distant mountain forest misty valley behind them continuously to circle edge. Preserve original distant ridge horizon positions, colors, time of day, lighting, watercolor texture and moon/sun/stars if present. No clouds, rain, lightning, large foreground trees or plants, lettering or border. Interior circle opaque, outside circle alpha zero. Save local PNG and return path.

Generierte Datei: exec-ca95d8d8-9be9-4513-8f74-47f35b953186.png.

### Split: layouts/round-lid/genetics/5.png

Edit target: bisherige vollständige Landschaft layouts/round-lid/genetics/5.png.

Use case: precise-object-edit. Create BACKGROUND half of a two-layer split of provided circular watercolor edit target. Keep exact original square canvas 1254x1254, with same centered circle boundary and transparent outside. Remove ONLY close large fir trees left/right and near bottom moss rocks ferns. Reconstruct the sky and distant mountain forest misty valley behind them continuously to circle edge. Preserve original distant ridge horizon positions, colors, time of day, lighting, watercolor texture and moon/sun/stars if present. No clouds, rain, lightning, large foreground trees or plants, lettering or border. Interior circle opaque, outside circle alpha zero. Save local PNG and return path.

Generierte Datei: exec-559b2f24-fbef-4c84-bdcd-f16af80cf437.png.

### Split: layouts/round-lid/genetics/6.png

Edit target: bisherige vollständige Landschaft layouts/round-lid/genetics/6.png.

Use case: precise-object-edit. Create BACKGROUND half of a two-layer split of provided circular watercolor edit target. Keep exact original square canvas 1254x1254, with same centered circle boundary and transparent outside. Remove ONLY close large fir trees left/right and near bottom moss rocks ferns. Reconstruct the sky and distant mountain forest misty valley behind them continuously to circle edge. Preserve original distant ridge horizon positions, colors, time of day, lighting, watercolor texture and moon/sun/stars if present. No clouds, rain, lightning, large foreground trees or plants, lettering or border. Interior circle opaque, outside circle alpha zero. Save local PNG and return path.

Generierte Datei: exec-d7f07aa9-f0f2-4deb-bddb-b8f0845fba70.png.

### Split: layouts/round-lid/genetics/7.png

Edit target: bisherige vollständige Landschaft layouts/round-lid/genetics/7.png.

Use case: precise-object-edit. Create BACKGROUND half of a two-layer split of provided circular watercolor edit target. Keep exact original square canvas 1254x1254, with same centered circle boundary and transparent outside. Remove ONLY close large fir trees left/right and near bottom moss rocks ferns. Reconstruct the sky and distant mountain forest misty valley behind them continuously to circle edge. Preserve original distant ridge horizon positions, colors, time of day, lighting, watercolor texture and moon/sun/stars if present. No clouds, rain, lightning, large foreground trees or plants, lettering or border. Interior circle opaque, outside circle alpha zero. Save local PNG and return path.

Generierte Datei: exec-773e7e3a-8fa2-411e-9685-5b6103470a75.png.

### Split: layouts/round-lid/foreground/1.png

Edit target: bisherige vollständige Landschaft layouts/round-lid/genetics/1.png.

Use case: background-extraction. Extract a transparent FOREGROUND PNG from the provided circular watercolor landscape edit target. Keep exact original square canvas 1254x1254 and original circle boundary and tree coordinates. Retain ONLY the CLOSE large fir trees along the left/right circular edges and close bottom moss rocks ferns. Erase ALL sky, distant mountain ridges, valley mist and far smaller forest to completely transparent alpha zero; keep the center fully transparent. Preserve original fine branch silhouettes, watercolor texture, time-of-day color and lighting. Keep outside the original circle fully transparent. Do not recenter, crop or enlarge. No matte, haze, frame, text or additions. Save local PNG and return path.

Generierte Datei: exec-111ec3b9-a200-4aaf-af5b-d9058bd27f67.png.

### Split: layouts/round-lid/foreground/2.png

Edit target: bisherige vollständige Landschaft layouts/round-lid/genetics/2.png.

Use case: background-extraction. Extract a transparent FOREGROUND PNG from the provided circular watercolor landscape edit target. Keep exact original square canvas 1254x1254 and original circle boundary and tree coordinates. Retain ONLY the CLOSE large fir trees along the left/right circular edges and close bottom moss rocks ferns. Erase ALL sky, distant mountain ridges, valley mist and far smaller forest to completely transparent alpha zero; keep the center fully transparent. Preserve original fine branch silhouettes, watercolor texture, time-of-day color and lighting. Keep outside the original circle fully transparent. Do not recenter, crop or enlarge. No matte, haze, frame, text or additions. Save local PNG and return path.

Generierte Datei: exec-c23dabce-b00c-46d0-8851-22af21ac7943.png.

### Split: layouts/round-lid/foreground/3.png

Edit target: bisherige vollständige Landschaft layouts/round-lid/genetics/3.png.

Use case: background-extraction. Extract a transparent FOREGROUND PNG from the provided circular watercolor landscape edit target. Keep exact original square canvas 1254x1254 and original circle boundary and tree coordinates. Retain ONLY the CLOSE large fir trees along the left/right circular edges and close bottom moss rocks ferns. Erase ALL sky, distant mountain ridges, valley mist and far smaller forest to completely transparent alpha zero; keep the center fully transparent. Preserve original fine branch silhouettes, watercolor texture, time-of-day color and lighting. Keep outside the original circle fully transparent. Do not recenter, crop or enlarge. No matte, haze, frame, text or additions. Save local PNG and return path.

Generierte Datei: exec-cd7e32a5-50a0-4cdd-9fa2-779d521935d1.png.

### Split: layouts/round-lid/foreground/4.png

Edit target: bisherige vollständige Landschaft layouts/round-lid/genetics/4.png.

Use case: background-extraction. Extract a transparent FOREGROUND PNG from the provided circular watercolor landscape edit target. Keep exact original square canvas 1254x1254 and original circle boundary and tree coordinates. Retain ONLY the CLOSE large fir trees along the left/right circular edges and close bottom moss rocks ferns. Erase ALL sky, distant mountain ridges, valley mist and far smaller forest to completely transparent alpha zero; keep the center fully transparent. Preserve original fine branch silhouettes, watercolor texture, time-of-day color and lighting. Keep outside the original circle fully transparent. Do not recenter, crop or enlarge. No matte, haze, frame, text or additions. Save local PNG and return path.

Generierte Datei: exec-c64cd2e1-8fbb-4cc6-9d68-596b9665fc8f.png.

### Split: layouts/round-lid/foreground/5.png

Edit target: bisherige vollständige Landschaft layouts/round-lid/genetics/5.png.

Use case: background-extraction. Extract a transparent FOREGROUND PNG from the provided circular watercolor landscape edit target. Keep exact original square canvas 1254x1254 and original circle boundary and tree coordinates. Retain ONLY the CLOSE large fir trees along the left/right circular edges and close bottom moss rocks ferns. Erase ALL sky, distant mountain ridges, valley mist and far smaller forest to completely transparent alpha zero; keep the center fully transparent. Preserve original fine branch silhouettes, watercolor texture, time-of-day color and lighting. Keep outside the original circle fully transparent. Do not recenter, crop or enlarge. No matte, haze, frame, text or additions. Save local PNG and return path.

Generierte Datei: exec-37f5c174-fe13-484c-bdf8-d3223341259c.png.

### Split: layouts/round-lid/foreground/6.png

Edit target: bisherige vollständige Landschaft layouts/round-lid/genetics/6.png.

Use case: background-extraction. Extract a transparent FOREGROUND PNG from the provided circular watercolor landscape edit target. Keep exact original square canvas 1254x1254 and original circle boundary and tree coordinates. Retain ONLY the CLOSE large fir trees along the left/right circular edges and close bottom moss rocks ferns. Erase ALL sky, distant mountain ridges, valley mist and far smaller forest to completely transparent alpha zero; keep the center fully transparent. Preserve original fine branch silhouettes, watercolor texture, time-of-day color and lighting. Keep outside the original circle fully transparent. Do not recenter, crop or enlarge. No matte, haze, frame, text or additions. Save local PNG and return path.

Generierte Datei: exec-ebd38075-2442-4889-a291-3f82bbb8edb0.png.

### Split: layouts/round-lid/foreground/7.png

Edit target: bisherige vollständige Landschaft layouts/round-lid/genetics/7.png.

Use case: background-extraction. Extract a transparent FOREGROUND PNG from the provided circular watercolor landscape edit target. Keep exact original square canvas 1254x1254 and original circle boundary and tree coordinates. Retain ONLY the CLOSE large fir trees along the left/right circular edges and close bottom moss rocks ferns. Erase ALL sky, distant mountain ridges, valley mist and far smaller forest to completely transparent alpha zero; keep the center fully transparent. Preserve original fine branch silhouettes, watercolor texture, time-of-day color and lighting. Keep outside the original circle fully transparent. Do not recenter, crop or enlarge. No matte, haze, frame, text or additions. Save local PNG and return path.

Generierte Datei: exec-5ff98a16-8c73-4e20-83f6-a2e2806101cb.png.
