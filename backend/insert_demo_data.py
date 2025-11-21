"""
Demo podatci za Hitronet EMS MVP
Skripta za punjenje baze s test podatcima
"""

import requests
import json
from datetime import datetime, timedelta
import random

BASE_URL = "http://localhost:8000"

# Demo podatci
demo_korisnici = [
    {
        "oib": "12345678901",
        "naziv": "Tvrtka d.o.o.",
        "adresa": "Ilica 1, Zagreb",
        "tip_korisnika": "pravni",
        "paket_usluga": "Business 1000",
        "status": "aktivan",
        "kontakt_admin": "admin@tvrtka.hr",
        "kontakt_tehnika": "tehnika@tvrtka.hr"
    },
    {
        "oib": "98765432109",
        "naziv": "Ivan Horvat",
        "adresa": "Vukovarska 58, Zagreb",
        "tip_korisnika": "fizicki",
        "paket_usluga": "Home 500",
        "status": "aktivan",
        "kontakt_admin": "ivan.horvat@gmail.com",
        "kontakt_tehnika": "098-123-4567"
    },
    {
        "oib": "11223344556",
        "naziv": "Trgovina Centar d.d.",
        "adresa": "Radnička cesta 52, Zagreb",
        "tip_korisnika": "pravni",
        "paket_usluga": "Business 2000",
        "status": "aktivan",
        "kontakt_admin": "info@trgovina.hr",
        "kontakt_tehnika": "support@trgovina.hr"
    },
    {
        "oib": "55443322110",
        "naziv": "Marija Novak",
        "adresa": "Dubrava 15, Zagreb",
        "tip_korisnika": "fizicki",
        "paket_usluga": "Home 200",
        "status": "neaktivan",
        "kontakt_admin": "marija.novak@email.com",
        "kontakt_tehnika": "091-888-9999"
    }
]

demo_lokacije = [
    {
        "naziv": "DC Zagreb Centar",
        "tip": "servisna",
        "adresa": "Savska 41, Zagreb",
        "latitude": 45.8008,
        "longitude": 15.9706,
        "status": "aktivna",
        "korisnik_id": None
    },
    {
        "naziv": "POP Črnomerec",
        "tip": "servisna",
        "adresa": "Ilica 200, Zagreb",
        "latitude": 45.8128,
        "longitude": 15.9456,
        "status": "aktivna",
        "korisnik_id": None
    },
    {
        "naziv": "Tvrtka d.o.o. - Glavna lokacija",
        "tip": "korisnik",
        "adresa": "Ilica 1, Zagreb",
        "latitude": 45.8131,
        "longitude": 15.9772,
        "status": "aktivna",
        "korisnik_id": 1
    },
    {
        "naziv": "Ivan Horvat - Kućna adresa",
        "tip": "korisnik",
        "adresa": "Vukovarska 58, Zagreb",
        "latitude": 45.8009,
        "longitude": 15.9851,
        "status": "aktivna",
        "korisnik_id": 2
    },
    {
        "naziv": "Trgovina Centar - Skladište",
        "tip": "korisnik",
        "adresa": "Radnička cesta 52, Zagreb",
        "latitude": 45.8022,
        "longitude": 15.9698,
        "status": "aktivna",
        "korisnik_id": 3
    },
    {
        "naziv": "Repetitor Sljeme",
        "tip": "pomocna",
        "adresa": "Sljeme, Zagreb",
        "latitude": 45.9059,
        "longitude": 15.9569,
        "status": "aktivna",
        "korisnik_id": None
    }
]

demo_veze = [
    {
        "lokacija_a_id": 1,
        "lokacija_b_id": 2,
        "tip": "optika",
        "kapacitet_vlakana": 48,
        "kapacitet_parica": None,
        "brzina_mbps": 10000,
        "status": "aktivan",
        "redundantna_veza_id": None
    },
    {
        "lokacija_a_id": 1,
        "lokacija_b_id": 3,
        "tip": "optika",
        "kapacitet_vlakana": 12,
        "kapacitet_parica": None,
        "brzina_mbps": 1000,
        "status": "aktivan",
        "redundantna_veza_id": None
    },
    {
        "lokacija_a_id": 2,
        "lokacija_b_id": 4,
        "tip": "optika",
        "kapacitet_vlakana": 4,
        "kapacitet_parica": None,
        "brzina_mbps": 500,
        "status": "aktivan",
        "redundantna_veza_id": None
    },
    {
        "lokacija_a_id": 1,
        "lokacija_b_id": 5,
        "tip": "optika",
        "kapacitet_vlakana": 24,
        "kapacitet_parica": None,
        "brzina_mbps": 2000,
        "status": "aktivan",
        "redundantna_veza_id": None
    },
    {
        "lokacija_a_id": 2,
        "lokacija_b_id": 6,
        "tip": "wireless",
        "kapacitet_vlakana": None,
        "kapacitet_parica": None,
        "brzina_mbps": 1000,
        "status": "aktivan",
        "redundantna_veza_id": None
    },
    {
        "lokacija_a_id": 1,
        "lokacija_b_id": 6,
        "tip": "wireless",
        "kapacitet_vlakana": None,
        "kapacitet_parica": None,
        "brzina_mbps": 1000,
        "status": "planiran",
        "redundantna_veza_id": 5
    }
]

demo_oprema = [
    {
        "lokacija_id": 1,
        "tip": "router",
        "proizvodjac": "Cisco",
        "model": "ASR-9010",
        "serijski_broj": "SN123456789",
        "inventurni_broj": "INV-001",
        "status": "u_upotrebi",
        "datum_instalacije": "2023-01-15T10:00:00"
    },
    {
        "lokacija_id": 1,
        "tip": "switch",
        "proizvodjac": "Cisco",
        "model": "Catalyst 9300",
        "serijski_broj": "SN987654321",
        "inventurni_broj": "INV-002",
        "status": "u_upotrebi",
        "datum_instalacije": "2023-01-15T11:00:00"
    },
    {
        "lokacija_id": 2,
        "tip": "switch",
        "proizvodjac": "Juniper",
        "model": "EX4300",
        "serijski_broj": "SN456789123",
        "inventurni_broj": "INV-003",
        "status": "u_upotrebi",
        "datum_instalacije": "2023-02-20T09:00:00"
    },
    {
        "lokacija_id": 3,
        "tip": "ONT",
        "proizvodjac": "Huawei",
        "model": "HG8245H",
        "serijski_broj": "SN111222333",
        "inventurni_broj": "INV-004",
        "status": "u_upotrebi",
        "datum_instalacije": "2023-03-10T14:00:00"
    },
    {
        "lokacija_id": 4,
        "tip": "ONT",
        "proizvodjac": "Nokia",
        "model": "G-240W-A",
        "serijski_broj": "SN444555666",
        "inventurni_broj": "INV-005",
        "status": "u_upotrebi",
        "datum_instalacije": "2023-04-05T10:30:00"
    },
    {
        "lokacija_id": 5,
        "tip": "router",
        "proizvodjac": "MikroTik",
        "model": "CCR1036",
        "serijski_broj": "SN777888999",
        "inventurni_broj": "INV-006",
        "status": "u_upotrebi",
        "datum_instalacije": "2023-05-12T13:00:00"
    },
    {
        "lokacija_id": 6,
        "tip": "antena",
        "proizvodjac": "Ubiquiti",
        "model": "airFiber 5XHD",
        "serijski_broj": "SN101010101",
        "inventurni_broj": "INV-007",
        "status": "u_upotrebi",
        "datum_instalacije": "2023-06-01T11:00:00"
    },
    {
        "lokacija_id": 1,
        "tip": "switch",
        "proizvodjac": "HP",
        "model": "ProCurve 2910",
        "serijski_broj": "SN202020202",
        "inventurni_broj": "INV-008",
        "status": "rezerva",
        "datum_instalacije": None
    }
]

def insert_data():
    print("🚀 Početak unosa demo podataka...")
    
    # Unos korisnika
    print("\n📝 Unos korisnika...")
    for korisnik in demo_korisnici:
        response = requests.post(f"{BASE_URL}/korisnici", json=korisnik)
        if response.status_code == 200:
            print(f"  ✅ Dodan korisnik: {korisnik['naziv']}")
        else:
            print(f"  ❌ Greška za korisnika {korisnik['naziv']}: {response.text}")
    
    # Unos lokacija
    print("\n📍 Unos lokacija...")
    for lokacija in demo_lokacije:
        response = requests.post(f"{BASE_URL}/lokacije", json=lokacija)
        if response.status_code == 200:
            print(f"  ✅ Dodana lokacija: {lokacija['naziv']}")
        else:
            print(f"  ❌ Greška za lokaciju {lokacija['naziv']}: {response.text}")
    
    # Unos veza
    print("\n🔗 Unos veza...")
    for i, veza in enumerate(demo_veze, 1):
        response = requests.post(f"{BASE_URL}/veze", json=veza)
        if response.status_code == 200:
            print(f"  ✅ Dodana veza #{i}: Lokacija {veza['lokacija_a_id']} <-> Lokacija {veza['lokacija_b_id']}")
        else:
            print(f"  ❌ Greška za vezu #{i}: {response.text}")
    
    # Unos opreme
    print("\n🔧 Unos opreme...")
    for oprema in demo_oprema:
        response = requests.post(f"{BASE_URL}/oprema", json=oprema)
        if response.status_code == 200:
            print(f"  ✅ Dodana oprema: {oprema['proizvodjac']} {oprema['model']}")
        else:
            print(f"  ❌ Greška za opremu {oprema['model']}: {response.text}")
    
    # Prikaz statistike
    print("\n📊 Finalna statistika:")
    response = requests.get(f"{BASE_URL}/stats")
    if response.status_code == 200:
        stats = response.json()
        print(f"  • Korisnici: {stats['korisnici']} (aktivnih: {stats['aktivni_korisnici']})")
        print(f"  • Lokacije: {stats['lokacije']} (aktivnih: {stats['aktivne_lokacije']})")
        print(f"  • Veze: {stats['veze']}")
        print(f"  • Oprema: {stats['oprema']}")
    
    print("\n✨ Demo podatci uspješno uneseni!")
    print("🌐 Otvorite http://localhost:3000 za pregled aplikacije")

if __name__ == "__main__":
    insert_data()
