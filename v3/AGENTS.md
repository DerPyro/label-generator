# Arbeiten an v3

Vor dem Erstellen oder Ändern von Texturepacks **alle drei Dateien vollständig lesen**:

- [TEXTUREPACKS.md](TEXTUREPACKS.md)
- [TEXTUREPACK_AI_GUIDE.md](TEXTUREPACK_AI_GUIDE.md)
- [schemas/texturepack.schema.json](schemas/texturepack.schema.json)

Die implementierte Spezifikation ist compatibilityVersion 2. Keine Legacy-Adapter für ältere Manifeste ergänzen. v1 und v2 unverändert lassen. Assets und Fonts müssen lokal, sicher packrelativ und legal weitergebbar sein; Lizenzen mitliefern.

`src/manifest-schema.js` ist die gemeinsame Schemaquelle; nach Änderungen `node v3/scripts/write-schema.js` ausführen. JSON Schema und Runtime müssen übereinstimmen, semantische Referenz-/Geometrieprüfungen zusätzlich erhalten.

Packs mit `node v3/scripts/validate-pack.js PACKVERZEICHNIS` prüfen. Bei Codeänderungen `npm --prefix v3 test`, `npm --prefix v3 run check` sowie bei laufendem Server `npm --prefix v3 run test:browser` ausführen. Vorschau, PNG und PDF müssen dieselbe zIndex-Komposition verwenden. Warenkorb und Druckplanung nur ändern, wenn die Aufgabe dies erfordert.
