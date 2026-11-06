# Kleine Texturepack-Vorlage

Dieses Verzeichnis ist ein vollständiges gültiges Pack für compatibilityVersion 2: 128 × 192 Pixel, eine Lora-Schrift, ein unabhängiges Namensfeld, Basis und je sieben Genetik-, THC- und CBD-Sprites.

1. Verzeichnis kopieren und in `pack.json` ID, Name, Autor und Version ändern.
2. PNGs gestalten; volle Canvas-Abmessungen und 8-Bit-RGBA erhalten.
3. Weitere Textfelder und Dekorationen nach [Anleitung](../../TEXTUREPACKS.md) ergänzen.
4. Validieren und ZIP erzeugen:

```sh
node v3/scripts/validate-pack.js v3/examples/template --zip starter-template.zip
```

PNG-Grafiken sind CC0-1.0. Lora steht unter SIL OFL 1.1, siehe [Lizenz](fonts/lora/OFL.txt) und [Asset-Hinweis](ASSET-LICENSE.txt). Für hochauflösenden Druck die Canvas-Größe und sämtliche Layer gemeinsam erhöhen.
