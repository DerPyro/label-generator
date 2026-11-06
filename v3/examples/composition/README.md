# Composition Demo

Vollständiges Beispiel für [Texturepack-Spezifikation 2](../../TEXTUREPACKS.md): Lora und Abel, unabhängig platzierte und wiederholbare Datenfelder, gedrehter Name mit gekoppelter PNG-Plakette, Vordergrundornament und tangentialer Text auf dem runden Layout.

Das Pack ist absichtlich nicht im Katalog der drei mitgelieferten Designs. So lässt es sich ohne ID-Konflikt als ZIP importieren:

```sh
node v3/scripts/validate-pack.js v3/examples/composition --zip composition-demo.zip
```

Öffne v3, importiere das ZIP und wähle Hochformat oder Rund. Die Zahlenzeile demonstriert zwei unabhängig positionierte Textfelder. Die Plakette hat zIndex 450, Text 500 und das goldene Vordergrundornament 600. Der Name ist um −4° gedreht; beide gebundenen PNGs übernehmen diese Drehung.

PNGs: CC0-1.0, geometrisch erzeugt mit [create-example-packs.js](../../scripts/create-example-packs.js). Fonts unverändert: Lora (The Lora Project Authors) und Abel (Matthew Desmond), SIL OFL 1.1. Vollständige Lizenzen: [Lora](fonts/lora/OFL.txt), [Abel](fonts/abel/OFL.txt). Abel stammt aus [google/fonts](https://github.com/google/fonts/tree/main/ofl/abel). Die Anwendung lädt alle Dateien lokal.
