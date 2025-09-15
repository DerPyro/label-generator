import requests
from bs4 import BeautifulSoup
import csv
import re
#import time

BASE_URL = "https://www.zamnesia.com"
START_URLS = [
    #"https://www.zamnesia.com/de/35-cannabissamen/295-feminisiert-hanfsamen",
    "https://www.zamnesia.com/de/35-cannabissamen/294-autoflowering-hanfsamen"
    #"https://www.zamnesia.com/de/35-cannabissamen/296-regulare-hanfsamen",
    #"https://www.zamnesia.com/de/35-cannabissamen/297-cbd-hanfsamen"
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
    # Anzahl Produkte auf Seite
    product_count = len(links)
    # Gesamtanzahl Produkte (steht meist oben auf der Seite)
    total_count = None
    total_count_elem = soup.find(string=re.compile(r"\d+\s+Produkte"))
    if total_count_elem:
        total_count_match = re.search(r"(\d+)\s+Produkte", total_count_elem)
        if total_count_match:
            total_count = int(total_count_match.group(1))
    return links, product_count, total_count

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
    is_fem = "feminis" in name_lower
    is_auto = "auto" in name_lower
    if is_fem and is_auto:
        typ = "AF"
    elif is_fem:
        typ = "F"
    elif is_auto:
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
                    print(f"💬  THC-Wert für '{name}': Spanne '{val}' erkannt, höchster Wert {thc} übernommen.")
                else:
                    match = re.search(r"(\d+[\.,]?\d*)", val)
                    if match:
                        thc = float(match.group(1).replace(',', '.'))
                    elif re.search(r"hoch", val, re.IGNORECASE):
                        thc = 20
                        print(f"💬  THC-Wert für '{name}': 'hoch' erkannt und zu 20 konvertiert.")
                    elif re.search(r"mittel|medium", val, re.IGNORECASE):
                        thc = 10
                        print(f"💬  THC-Wert für '{name}': 'mittel' erkannt und zu 10 konvertiert.")
                    elif re.search(r"niedrig|gering", val, re.IGNORECASE):
                        thc = 5
                        print(f"💬  THC-Wert für '{name}': 'niedrig/gering' erkannt und zu 5 konvertiert.")
                    else:
                        print(f"❌  Fehler: Unbekannter THC-Wert für '{name}': '{val}'")
            elif key == "cbd":
                # Spanne wie '0-1%' erkennen
                range_match = re.search(r"(\d+[\.,]?\d*)\s*[-–]\s*(\d+[\.,]?\d*)", val)
                if range_match:
                    cbd = float(range_match.group(2).replace(',', '.'))
                    print(f"💬  CBD-Wert für '{name}': Spanne '{val}' erkannt, höchster Wert {cbd} übernommen.")
                else:
                    match = re.search(r"(\d+[\.,]?\d*)", val)
                    if match:
                        cbd = float(match.group(1).replace(',', '.'))
                    elif re.search(r"hoch", val, re.IGNORECASE):
                        cbd = 20
                        print(f"💬  CBD-Wert für '{name}': 'hoch' erkannt und zu 10 konvertiert.")
                    elif re.search(r"mittel|medium", val, re.IGNORECASE):
                        cbd = 10
                        print(f"💬  CBD-Wert für '{name}': 'mittel' erkannt und zu 5 konvertiert.")
                    elif re.search(r"niedrig|gering", val, re.IGNORECASE):
                        cbd = 5
                        print(f"💬  CBD-Wert für '{name}': 'niedrig/gering' erkannt und zu 1 konvertiert.")
                    else:
                        print(f"❌  Fehler: Unbekannter CBD-Wert für '{name}': '{val}'")
            elif key == "genetik":
                # Beispiel: '30% Indica / 70% Sativa' oder 'Sativa 35% Indica 60% Ruderalis 5%'
                # Extrahiere alle Prozentangaben
                sativa_match = re.search(r"(\d+)%\s*Sativa", val)
                indica_match = re.search(r"(\d+)%\s*Indica", val)
                # Ignoriere Ruderalis, falls vorhanden
                if sativa_match or indica_match:
                    if sativa_match:
                        sativa = int(sativa_match.group(1))
                    if indica_match:
                        indica = int(indica_match.group(1))
                # Nur "Sativa" oder "Indica" als Text
                elif re.search(r"^sativa$", val.strip(), re.IGNORECASE):
                    sativa = 100
                    indica = 0
                elif re.search(r"^indica$", val.strip(), re.IGNORECASE):
                    indica = 100
                    sativa = 0
                # Kombinationen wie "Indica/Sativa"
                elif re.search(r"indica\s*/\s*sativa", val.strip(), re.IGNORECASE):
                    indica = 50
                    sativa = 50
                elif re.search(r"sativa\s*/\s*indica", val.strip(), re.IGNORECASE):
                    sativa = 50
                    indica = 50
                else:
                    # Weitere Genetik-Begriffe erkennen
                    if re.search(r"indica[- ]?dominant|indicadominiert|indicadominierte autoflower|mainly indica", val, re.IGNORECASE):
                        indica = 80
                        sativa = 20
                        print(f"💬  Genetik für '{name}': '{val}' als Indica-dominant erkannt und zu 80/20 konvertiert.")
                    elif re.search(r"sativa[- ]?dominant|sativadominierte autoflower", val, re.IGNORECASE):
                        sativa = 80
                        indica = 20
                        print(f"💬  Genetik für '{name}': '{val}' als Sativa-dominant erkannt und zu 20/80 konvertiert.")
                    elif re.search(r"100%\s*indica", val, re.IGNORECASE):
                        indica = 100
                        sativa = 0
                        print(f"💬  Genetik für '{name}': '{val}' als 100% Indica erkannt und zu 100/0 konvertiert.")
                    elif re.search(r"100%\s*sativa", val, re.IGNORECASE):
                        sativa = 100
                        indica = 0
                        print(f"💬  Genetik für '{name}': '{val}' als 100% Sativa erkannt und zu 0/100 konvertiert.")
                    elif re.search(r"auto\s*hybrid", val, re.IGNORECASE):
                        indica = 50
                        sativa = 50
                        print(f"💬  Genetik für '{name}': '{val}' als Auto Hybrid erkannt und zu 50/50 konvertiert.")
                    elif re.search(r"autoflowering", val, re.IGNORECASE):
                        indica = 50
                        sativa = 50
                        print(f"💬  Genetik für '{name}': '{val}' als Autoflowering erkannt und zu 50/50 konvertiert.")
                    elif re.search(r"50%\s*indica\s*/\s*50%\s*sativa|50%\s*sativa\s*/\s*50%\s*indica", val, re.IGNORECASE):
                        indica = 50
                        sativa = 50
                        print(f"💬  Genetik für '{name}': '{val}' als 50/50 erkannt und zu 50/50 konvertiert.")
                    elif re.search(r"mix pack|mix packs", val, re.IGNORECASE):
                        print(f"⏭️  {name} (Mix Pack - übersprungen)")
                        raise Exception("Mix Pack - übersprungen")
                    else:
                        print(f"❌  Fehler: Genetik für '{name}' konnte nicht erkannt werden: '{val}'")

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


all_links = set()
for start_url in START_URLS:
    page = 1
    print(f"🔎  Starte Crawl für: {start_url}")
    # Erste Seite: Links, Produkte pro Seite, Gesamtanzahl
    first_url = f"{start_url}?p=1&orderby=position&orderway=asc"
    first_links, products_per_page, total_products = get_product_links(first_url)
    if not first_links:
        print(f"⏹️  Keine Links auf Seite 1, Kategorie übersprungen.")
        continue
    print(f"ℹ️  Gesamtanzahl Produkte laut Seite: {total_products}")
    print(f"ℹ️  Produkte pro Seite: {products_per_page}")
    # Seitenanzahl berechnen
    if total_products and products_per_page:
        max_page = int((total_products - 1) / products_per_page) + 1
    else:
        max_page = 1
    print(f"ℹ️  Geplante Seiten: {max_page}")
    # Alle Seiten abarbeiten
    for page in range(1, max_page + 1):
        url = f"{start_url}?p={page}&orderby=position&orderway=asc"
        links, _, _ = get_product_links(url)
        print(f"✅  Seite {page}: {len(links)} Links")
        all_links.update(links)
        time.sleep(1)
    print(f"➡️  Kategorie abgeschlossen: {start_url}")

print(f"➡️  Gesamt: {len(all_links)} eindeutige Sorten gefunden (alle Kategorien)")

# Schritt 2: Alle Produkte scrapen
with open("strains.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["Name", "ShortName", "Brand", "Typ", "THC", "CBD", "Sativa", "Indica", "URL"])
    for index, link in enumerate(list(all_links), start=1):
        if index < 440:
            continue
        try:
            row = scrape_strain(link)
            # Überspringe Einträge mit 'sorten', 'pack', 'Überraschungssamen' oder 'Mix Pack' im Namen (case-insensitive)
            name_lower = row[0].lower()
            if re.search(r"\bsorten\b", name_lower) or re.search(r"\bpack\b", name_lower) or "überraschungssamen" in name_lower or "mix pack" in name_lower or "mix packs" in name_lower:
                print(f"⏭️{index}: {row[0]} (übersprungen)")
                continue
            writer.writerow(row)
            print(f"✔️  {index}: {row[0]}")
            time.sleep(0.5)
        except Exception as e:
            if "übersprungen" in str(e):
                continue
            print("⚠️  Fehler bei", link, e)

print("✅ strains.csv erstellt!")
