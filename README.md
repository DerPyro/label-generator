# How to use

v1 -> https://derpyro.github.io/label-generator/v1/index.html
v2 -> https://derpyro.github.io/label-generator/v2/index.html
v3 -> https://derpyro.github.io/label-generator/v3/

## Eigene Texturepacks erstellen

Texturepacks bestimmen das Design der Etiketten in v3. Eigene Layouts, PNG-Sprites, Schriftarten, Textpositionen, Hintergründe und Zeichenreihenfolgen lassen sich vollständig im Manifest definieren und als ZIP importieren.

Die [vollständige Texturepack-Anleitung](v3/TEXTUREPACKS.md) erklärt das Format und den ZIP-Import. Das [funktionierende Beispieltexturepack](v3/examples/composition/README.md) demonstriert die Möglichkeiten; die [kleine Vorlage](v3/examples/template/README.md) dient als Ausgangspunkt. Für KI-Agenten gibt es eine [eigene Anleitung](v3/TEXTUREPACK_AI_GUIDE.md) und ein [JSON Schema](v3/schemas/texturepack.schema.json).

## Updating Search

1. Run zamnesia-crawler.py or something else that collects data into a csv or json.
2. Maybe remove unused data (https://onlinetools.com/csv/delete-csv-columns)
3. Convert to json (https://csvjson.com/csv2json) (https://jsonformatter.org/json-minify)
  - Convert json to base64 (https://codebeautify.org/json-to-base64-converter#)
  -  Replace defaultBase64 in canna-gen-v1-german.html
4. or Upload json on the website
