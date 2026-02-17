#!/usr/bin/env python3
"""
CONCITO CO2 Update Script
Aktualisiert die CO2-Werte aus der CONCITO Big Climate Database

Usage: python scripts/update_co2_data.py
"""

import json
from datetime import datetime
import os

# CONCITO Mapping (erweitert um alle Produkte)
CONCITO_MAPPING = {
    # Gemüse
    "Tomate": {"total": 0.485, "agriculture": 0.214, "iluc": 0.014, "processing": 0.0, "packaging": 0.140, "transport": 0.110, "retail": 0.006},
    "Gurke": {"total": 0.395, "agriculture": 0.154, "iluc": 0.013, "processing": 0.0, "packaging": 0.140, "transport": 0.082, "retail": 0.006},
    "Salatgurke": {"total": 0.395, "agriculture": 0.154, "iluc": 0.013, "processing": 0.0, "packaging": 0.140, "transport": 0.082, "retail": 0.006},
    "Paprika": {"total": 1.071, "agriculture": 0.610, "iluc": 0.037, "processing": 0.0, "packaging": 0.140, "transport": 0.278, "retail": 0.006},
    "Aubergine": {"total": 0.986, "agriculture": 0.513, "iluc": 0.027, "processing": 0.0, "packaging": 0.140, "transport": 0.299, "retail": 0.006},
    "Zucchini": {"total": 0.842, "agriculture": 0.482, "iluc": 0.040, "processing": 0.0, "packaging": 0.065, "transport": 0.249, "retail": 0.006},
    "Kürbis": {"total": 0.842, "agriculture": 0.482, "iluc": 0.040, "processing": 0.0, "packaging": 0.065, "transport": 0.249, "retail": 0.006},
    "Kartoffel": {"total": 0.173, "agriculture": 0.073, "iluc": 0.010, "processing": 0.0, "packaging": 0.029, "transport": 0.055, "retail": 0.006},
    "Möhre": {"total": 0.165, "agriculture": 0.074, "iluc": 0.010, "processing": 0.0, "packaging": 0.029, "transport": 0.046, "retail": 0.006},
    "Zwiebel": {"total": 0.180, "agriculture": 0.084, "iluc": 0.010, "processing": 0.0, "packaging": 0.029, "transport": 0.051, "retail": 0.006},
    "Knoblauch": {"total": 0.180, "agriculture": 0.084, "iluc": 0.010, "processing": 0.0, "packaging": 0.029, "transport": 0.051, "retail": 0.006},
    "Spargel": {"total": 0.682, "agriculture": 0.406, "iluc": 0.062, "processing": 0.0, "packaging": 0.074, "transport": 0.134, "retail": 0.006},
    "Brokkoli": {"total": 0.463, "agriculture": 0.215, "iluc": 0.026, "processing": 0.0, "packaging": 0.074, "transport": 0.142, "retail": 0.006},
    "Blumenkohl": {"total": 0.463, "agriculture": 0.215, "iluc": 0.026, "processing": 0.0, "packaging": 0.074, "transport": 0.142, "retail": 0.006},
    "Kohlrabi": {"total": 0.270, "agriculture": 0.097, "iluc": 0.012, "processing": 0.0, "packaging": 0.074, "transport": 0.081, "retail": 0.006},
    "Rote Bete": {"total": 0.195, "agriculture": 0.089, "iluc": 0.012, "processing": 0.0, "packaging": 0.029, "transport": 0.059, "retail": 0.006},
    "Lauch": {"total": 0.350, "agriculture": 0.144, "iluc": 0.016, "processing": 0.0, "packaging": 0.074, "transport": 0.110, "retail": 0.006},
    "Spinat": {"total": 0.363, "agriculture": 0.157, "iluc": 0.026, "processing": 0.0, "packaging": 0.065, "transport": 0.109, "retail": 0.006},
    "Feldsalat": {"total": 0.363, "agriculture": 0.157, "iluc": 0.026, "processing": 0.0, "packaging": 0.065, "transport": 0.109, "retail": 0.006},
    "Radieschen": {"total": 0.270, "agriculture": 0.097, "iluc": 0.012, "processing": 0.0, "packaging": 0.074, "transport": 0.081, "retail": 0.006},
    "Mais": {"total": 0.430, "agriculture": 0.215, "iluc": 0.025, "processing": 0.0, "packaging": 0.074, "transport": 0.110, "retail": 0.006},

    # Obst
    "Apfel": {"total": 0.407, "agriculture": 0.184, "iluc": 0.026, "processing": 0.0, "packaging": 0.140, "transport": 0.051, "retail": 0.006},
    "Birne": {"total": 0.440, "agriculture": 0.206, "iluc": 0.033, "processing": 0.0, "packaging": 0.140, "transport": 0.055, "retail": 0.006},
    "Erdbeere": {"total": 0.653, "agriculture": 0.388, "iluc": 0.075, "processing": 0.0, "packaging": 0.100, "transport": 0.084, "retail": 0.006},
    "Himbeere": {"total": 2.070, "agriculture": 1.757, "iluc": 0.080, "processing": 0.0, "packaging": 0.100, "transport": 0.127, "retail": 0.006},
    "Johannisbeere": {"total": 1.350, "agriculture": 1.104, "iluc": 0.076, "processing": 0.0, "packaging": 0.100, "transport": 0.064, "retail": 0.006},
    "Pflaume": {"total": 0.613, "agriculture": 0.312, "iluc": 0.054, "processing": 0.0, "packaging": 0.140, "transport": 0.101, "retail": 0.006},
    "Kirsche": {"total": 0.786, "agriculture": 0.427, "iluc": 0.087, "processing": 0.0, "packaging": 0.140, "transport": 0.126, "retail": 0.006},
    "Zitrone": {"total": 0.610, "agriculture": 0.235, "iluc": 0.031, "processing": 0.0, "packaging": 0.140, "transport": 0.198, "retail": 0.006},
    "Limette": {"total": 0.720, "agriculture": 0.235, "iluc": 0.031, "processing": 0.0, "packaging": 0.140, "transport": 0.308, "retail": 0.006},
    "Avocado": {"total": 0.846, "agriculture": 0.323, "iluc": 0.041, "processing": 0.0, "packaging": 0.140, "transport": 0.336, "retail": 0.006},

    # Kräuter
    "Basilikum": {"total": 2.350, "agriculture": 1.912, "iluc": 0.077, "processing": 0.0, "packaging": 0.065, "transport": 0.290, "retail": 0.006},
    "Petersilie": {"total": 0.363, "agriculture": 0.157, "iluc": 0.026, "processing": 0.0, "packaging": 0.065, "transport": 0.109, "retail": 0.006},
    "Schnittlauch": {"total": 0.350, "agriculture": 0.144, "iluc": 0.016, "processing": 0.0, "packaging": 0.074, "transport": 0.110, "retail": 0.006},
    "Dill": {"total": 0.363, "agriculture": 0.157, "iluc": 0.026, "processing": 0.0, "packaging": 0.065, "transport": 0.109, "retail": 0.006},

    # Pilze
    "Champignon": {"total": 1.580, "agriculture": 1.228, "iluc": 0.038, "processing": 0.0, "packaging": 0.140, "transport": 0.168, "retail": 0.006},

    # Nüsse
    "Walnuss": {"total": 0.700, "agriculture": 0.377, "iluc": 0.034, "processing": 0.036, "packaging": 0.029, "transport": 0.218, "retail": 0.006},
    "Haselnuss": {"total": 0.850, "agriculture": 0.465, "iluc": 0.047, "processing": 0.036, "packaging": 0.029, "transport": 0.267, "retail": 0.006},
    "Cashewkerne": {"total": 2.750, "agriculture": 1.450, "iluc": 0.285, "processing": 0.520, "packaging": 0.140, "transport": 0.349, "retail": 0.006},

    # Getreide
    "Mehl": {"total": 0.580, "agriculture": 0.280, "iluc": 0.042, "processing": 0.120, "packaging": 0.050, "transport": 0.082, "retail": 0.006},
    "Reis": {"total": 2.680, "agriculture": 1.892, "iluc": 0.358, "processing": 0.180, "packaging": 0.050, "transport": 0.194, "retail": 0.006},
    "Quinoa": {"total": 1.620, "agriculture": 0.815, "iluc": 0.142, "processing": 0.210, "packaging": 0.050, "transport": 0.397, "retail": 0.006},

    # Öle
    "Olivenöl": {"total": 3.230, "agriculture": 2.152, "iluc": 0.312, "processing": 0.420, "packaging": 0.140, "transport": 0.200, "retail": 0.006},

    # Gewürze
    "Ingwer": {"total": 0.850, "agriculture": 0.320, "iluc": 0.045, "processing": 0.0, "packaging": 0.140, "transport": 0.339, "retail": 0.006},
}

PRODUCT_TO_CONCITO = {
    "tomate": "Tomate",
    "gurke": "Gurke",
    "salatgurke": "Salatgurke",
    "paprika": "Paprika",
    "aubergine": "Aubergine",
    "zucchini": "Zucchini",
    "kürbis": "Kürbis",
    "hokkaido": "Kürbis",
    "kartoffel": "Kartoffel",
    "möhre": "Möhre",
    "karotte": "Möhre",
    "zwiebel": "Zwiebel",
    "knoblauch": "Knoblauch",
    "spargel": "Spargel",
    "brokkoli": "Brokkoli",
    "blumenkohl": "Blumenkohl",
    "kohlrabi": "Kohlrabi",
    "rote bete": "Rote Bete",
    "lauch": "Lauch",
    "porree": "Lauch",
    "spinat": "Spinat",
    "feldsalat": "Feldsalat",
    "radieschen": "Radieschen",
    "rettich": "Radieschen",
    "mais": "Mais",
    "apfel": "Apfel",
    "birne": "Birne",
    "erdbeere": "Erdbeere",
    "himbeere": "Himbeere",
    "johannisbeere": "Johannisbeere",
    "pflaume": "Pflaume",
    "zwetschge": "Pflaume",
    "kirsche": "Kirsche",
    "zitrone": "Zitrone",
    "limette": "Limette",
    "avocado": "Avocado",
    "basilikum": "Basilikum",
    "petersilie": "Petersilie",
    "schnittlauch": "Schnittlauch",
    "dill": "Dill",
    "champignon": "Champignon",
    "walnuss": "Walnuss",
    "haselnuss": "Haselnuss",
    "cashew": "Cashewkerne",
    "mehl": "Mehl",
    "risotto": "Reis",
    "quinoa": "Quinoa",
    "olivenöl": "Olivenöl",
    "ingwer": "Ingwer",
}

def match_product(product_name):
    """Matched Produktname zu CONCITO-Eintrag"""
    name_lower = product_name.lower()
    for key, concito_name in PRODUCT_TO_CONCITO.items():
        if key in name_lower:
            return CONCITO_MAPPING.get(concito_name)
    return None

def update_co2_data(lebensmittel_path='src/lib/data/lebensmittel.json'):
    """Aktualisiert CO2-Daten in lebensmittel.json"""

    # Prüfe ob Datei existiert
    if not os.path.exists(lebensmittel_path):
        print(f"❌ Fehler: {lebensmittel_path} nicht gefunden!")
        print(f"   Führe das Script aus dem Root-Verzeichnis aus.")
        return 0

    print(f"🔄 Lade {lebensmittel_path}...")
    with open(lebensmittel_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    updated = 0
    unchanged = 0

    for product in data:
        concito_data = match_product(product['name'])

        if concito_data and 'regional_data' in product:
            old_co2 = product['regional_data'].get('co2_per_kg', 0)
            new_co2 = concito_data['total']

            if abs(old_co2 - new_co2) > 0.001:  # Nur bei Änderung
                product['regional_data']['co2_per_kg'] = new_co2
                product['regional_data']['co2_breakdown'] = {
                    "agriculture": concito_data['agriculture'],
                    "iluc": concito_data['iluc'],
                    "processing": concito_data['processing'],
                    "packaging": concito_data['packaging'],
                    "transport": concito_data['transport'],
                    "retail": concito_data['retail']
                }
                product['regional_data']['data_source'] = "CONCITO Big Climate Database v1.2"
                product['regional_data']['last_updated'] = datetime.now().strftime("%Y-%m-%d")

                print(f"  ✏️  {product['name']:30s}: {old_co2:.3f} → {new_co2:.3f} kg/kg")
                updated += 1
            else:
                unchanged += 1

    if updated > 0:
        # Backup erstellen
        backup_path = lebensmittel_path.replace('.json', f'_backup_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json')
        with open(backup_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"\n💾 Backup erstellt: {backup_path}")

        # Speichern
        with open(lebensmittel_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print(f"\n✅ {updated} Produkte aktualisiert!")
    else:
        print(f"\n✅ Alle {unchanged} Produkte sind bereits aktuell!")

    return updated

if __name__ == "__main__":
    print("=" * 70)
    print("CONCITO CO2 Update Script")
    print("=" * 70)
    update_co2_data()
    print("=" * 70)
