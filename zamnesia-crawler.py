import requests
from bs4 import BeautifulSoup
import csv
import re
import time

BASE_URL = "https://www.zamnesia.com"
START_URLS = [
    "https://www.zamnesia.com/de/35-cannabissamen/295-feminisiert-hanfsamen",
    "https://www.zamnesia.com/de/35-cannabissamen/294-autoflowering-hanfsamen"
]

def extract_percentage(text, keyword):
    """Extrahiert z.B. '18%' aus 'THC: 18%' oder '18% THC'"""
    # Suche nach 'THC: 18%' oder 'CBD: 1%'
    match = re.search(rf"{keyword}\s*[:]?\s*(\d+[\.,]?\d*)\s*%", text, re.IGNORECASE)
    if match:
        return float(match.group(1).replace(',', '.'))
    # Suche nach '18% THC' oder '1% CBD'
    match = re.search(rf"(\d+[\.,]?\d*)\s*%\s*{keyword}", text, re.IGNORECASE)
    if match:
        return float(match.group(1).replace(',', '.'))
    return 0

def get_product_links(page_url):
    """Sammelt alle Produktlinks von einer Seite"""
    r = requests.get(page_url)
    soup = BeautifulSoup(r.text, "html.parser")
    links = []
    for a in soup.select("a.product_img_link"):
        href = a.get("href")
        if href and "/de/" in href:
            links.append(BASE_URL + href if href.startswith("/") else href)
    return links

def scrape_strain(url):
    """Extrahiert Name, THC, CBD, Sativa, Indica von einer Produktseite"""
    r = requests.get(url)
    soup = BeautifulSoup(r.text, "html.parser")

    # Name
    name = soup.find("h1").get_text(strip=True)

    # Extrahiere shortName und brand
    if "(" in name and ")" in name:
        shortName = name.split("(")[0].strip()
        brand = name.split("(")[1].split(")")[0].strip()
    else:
        shortName = name.strip()
        brand = ""

    # Typ bestimmen
    typ = ""
    name_lower = name.lower()
    if "feminis" in name_lower:
        typ = "F"
    elif "auto" in name_lower:
        typ = "A"

    thc, cbd, sativa, indica = 0, 0, 0, 0

    # Suche nach Tabelle mit Datenblatt
    table = soup.find("table", class_="features-table")
    if table:
        for row in table.find_all("tr"):
            th = row.find("th")
            td = row.find("td")
            if not th or not td:
                continue
            key = th.get_text(strip=True).lower()
            val = td.get_text(strip=True)
            if key == "thc":
                # Spanne wie '5-10%' erkennen
                range_match = re.search(r"(\d+[\.,]?\d*)\s*[-–]\s*(\d+[\.,]?\d*)", val)
                if range_match:
                    thc = float(range_match.group(2).replace(',', '.'))
                    print(f"⚠️  THC-Wert für '{name}': Spanne '{val}' erkannt, höchster Wert {thc} übernommen.")
                else:
                    match = re.search(r"(\d+[\.,]?\d*)", val)
                    if match:
                        thc = float(match.group(1).replace(',', '.'))
                    elif re.search(r"hoch", val, re.IGNORECASE):
                        thc = 20
                        print(f"⚠️  THC-Wert für '{name}': 'hoch' erkannt und zu 20 konvertiert.")
                    elif re.search(r"mittel|medium", val, re.IGNORECASE):
                        thc = 10
                        print(f"⚠️  THC-Wert für '{name}': 'mittel' erkannt und zu 10 konvertiert.")
                    elif re.search(r"niedrig|gering", val, re.IGNORECASE):
                        thc = 5
                        print(f"⚠️  THC-Wert für '{name}': 'niedrig/gering' erkannt und zu 5 konvertiert.")
                    else:
                        print(f"❌  Warnung: Unbekannter THC-Wert für '{name}': '{val}'")
            elif key == "cbd":
                # Spanne wie '0-1%' erkennen
                range_match = re.search(r"(\d+[\.,]?\d*)\s*[-–]\s*(\d+[\.,]?\d*)", val)
                if range_match:
                    cbd = float(range_match.group(2).replace(',', '.'))
                    print(f"⚠️  CBD-Wert für '{name}': Spanne '{val}' erkannt, höchster Wert {cbd} übernommen.")
                else:
                    match = re.search(r"(\d+[\.,]?\d*)", val)
                    if match:
                        cbd = float(match.group(1).replace(',', '.'))
                    elif re.search(r"hoch", val, re.IGNORECASE):
                        cbd = 20
                        print(f"⚠️  CBD-Wert für '{name}': 'hoch' erkannt und zu 10 konvertiert.")
                    elif re.search(r"mittel|medium", val, re.IGNORECASE):
                        cbd = 10
                        print(f"⚠️  CBD-Wert für '{name}': 'mittel' erkannt und zu 5 konvertiert.")
                    elif re.search(r"niedrig|gering", val, re.IGNORECASE):
                        cbd = 5
                        print(f"⚠️  CBD-Wert für '{name}': 'niedrig/gering' erkannt und zu 1 konvertiert.")
                    else:
                        print(f"❌  Warnung: Unbekannter CBD-Wert für '{name}': '{val}'")
            elif key == "genetik":
                # Beispiel: '30% Indica / 70% Sativa'
                indica_match = re.search(r"(\d+)%\s*Indica", val)
                sativa_match = re.search(r"(\d+)%\s*Sativa", val)
                if indica_match:
                    indica = int(indica_match.group(1))
                if sativa_match:
                    sativa = int(sativa_match.group(1))

    # Fallback falls Tabelle nicht gefunden
    if thc == 0 or cbd == 0 or (sativa == 0 and indica == 0):
        info_blocks = soup.find_all(["li", "p", "div", "span"])
        for block in info_blocks:
            text = block.get_text(" ", strip=True)
            if thc == 0 and "THC" in text:
                thc = extract_percentage(text, "THC")
            if cbd == 0 and "CBD" in text:
                cbd = extract_percentage(text, "CBD")
            if (sativa == 0 or indica == 0) and "Sativa" in text and "Indica" in text:
                sativa = int(extract_percentage(text, "Sativa"))
                indica = int(extract_percentage(text, "Indica"))

    # Alle Zahlenwerte auf ganze Zahlen runden
    thc = int(round(thc))
    cbd = int(round(cbd))
    sativa = int(round(sativa))
    indica = int(round(indica))
    return [name, shortName, brand, typ, thc, cbd, sativa, indica, url]

# Schritt 1: Alle Produktlinks sammeln

all_links = []
for start_url in START_URLS:
    page = 1
    count = 0
    print(f"🔎  Starte Crawl für: {start_url}")
    while True:
        url = f"{start_url}?p={page}"
        links = get_product_links(url)
        if not links:
            break
        if count == len(links):
            print(f"✅  Alle {len(links)} Links gefunden")
            break
        print(f"✅  Seite {page}: {len(links)} Links")
        count = len(links)
        page += 1
        time.sleep(1)  # Shop nicht überlasten
    print(f"➡️  Kategorie abgeschlossen: {start_url}")
    all_links.extend(links)

print(f"➡️  Gesamt: {len(all_links)} Sorten gefunden (feminisierte & automatic)")

# Schritt 2: Alle Produkte scrapen
with open("strains.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["Name", "ShortName", "Brand", "Typ", "THC", "CBD", "Sativa", "Indica", "URL"])
    for index, link in enumerate(all_links, start=1):
        try:
            row = scrape_strain(link)
            # Überspringe Einträge mit 'sorten' oder 'pack' als eigenständiges Wort im Namen (case-insensitive)
            name_lower = row[0].lower()
            if re.search(r"\bsorten\b", name_lower) or re.search(r"\bpack\b", name_lower):
                print(f"⏭️{index}: {row[0]} (übersprungen)")
                continue
            writer.writerow(row)
            print(f"✔️  {index}: {row[0]}")
            time.sleep(0.5)
        except Exception as e:
            print("❌  Fehler bei", link, e)

print("✅ strains.csv erstellt!")
