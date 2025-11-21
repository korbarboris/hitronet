# Hitronet EMS - MVP Demo

Minimalni CRUD sustav za upravljanje mrežnom infrastrukturom.

## 🚀 Brzo pokretanje

### Preduvjeti
- Python 3.8+
- Node.js 16+
- npm ili yarn

### 1. Backend Setup

```bash
cd backend
pip install -r requirements.txt
python main.py
```

Backend će biti dostupan na: http://localhost:8000
API dokumentacija: http://localhost:8000/docs

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend će biti dostupan na: http://localhost:3000

## 📋 Funkcionalnosti

### Implementirano:
- ✅ CRUD operacije za sve entitete
- ✅ Korisnici (OIB, naziv, adresa, paketi, status)
- ✅ Lokacije (tip, adresa, koordinate, status)  
- ✅ Veze između lokacija (tip, kapacitet, brzina)
- ✅ Oprema (tip, serijski broj, status)
- ✅ Statistika u real-time
- ✅ Responsivni UI s Material Design
- ✅ REST API s dokumentacijom
- ✅ SQLite baza podataka

### Struktura baze:
```
korisnici
├── id, oib, naziv, adresa
├── tip_korisnika, paket_usluga
├── status, kontakti
└── datum_ugovora

lokacije  
├── id, naziv, tip
├── adresa, koordinate
├── status
└── korisnik_id (FK)

veze
├── id, lokacija_a_id (FK)
├── lokacija_b_id (FK)
├── tip, kapaciteti
├── brzina_mbps, status
└── redundantna_veza_id

oprema
├── id, lokacija_id (FK)
├── tip, proizvodjac, model
├── serijski_broj, inventurni_broj
├── status
└── datum_instalacije
```

## 🎯 Što demonstrira ovaj MVP:

1. **Potpuna CRUD funkcionalnost** - Create, Read, Update, Delete za sve entitete
2. **Relacijska baza podataka** - Veze između tablica (Foreign Keys)
3. **RESTful API** - Standard REST endpoints s JSON response
4. **Moderni frontend** - React s Material-UI komponentama
5. **Real-time statistika** - Dashboard s ključnim metrikama
6. **Validacija podataka** - Na backend i frontend razini
7. **Error handling** - Pravilno rukovanje greškama

## 📊 API Endpoints

### Korisnici
- `GET /korisnici` - Lista svih korisnika
- `GET /korisnici/{id}` - Detalji korisnika
- `POST /korisnici` - Novi korisnik
- `PUT /korisnici/{id}` - Ažuriranje korisnika
- `DELETE /korisnici/{id}` - Brisanje korisnika

### Lokacije
- `GET /lokacije` - Lista svih lokacija
- `GET /lokacije/{id}` - Detalji lokacije  
- `POST /lokacije` - Nova lokacija
- `PUT /lokacije/{id}` - Ažuriranje lokacije
- `DELETE /lokacije/{id}` - Brisanje lokacije

### Veze
- `GET /veze` - Lista svih veza
- `GET /veze/{id}` - Detalji veze
- `POST /veze` - Nova veza
- `PUT /veze/{id}` - Ažuriranje veze
- `DELETE /veze/{id}` - Brisanje veze

### Oprema
- `GET /oprema` - Lista sve opreme
- `GET /oprema/{id}` - Detalji opreme
- `POST /oprema` - Nova oprema
- `PUT /oprema/{id}` - Ažuriranje opreme
- `DELETE /oprema/{id}` - Brisanje opreme

### Statistika
- `GET /stats` - Agregirani podaci

## 🔧 Tehnologije

**Backend:**
- FastAPI (Python web framework)
- SQLAlchemy (ORM)
- SQLite (baza podataka)
- Pydantic (validacija)
- Uvicorn (ASGI server)

**Frontend:**
- React 18
- Material-UI 5
- Vite (build tool)

## 📈 Sljedeći koraci (za produkciju)

1. **Sigurnost:**
   - Dodati autentifikaciju (JWT)
   - Role-based access control
   - Input sanitizacija
   - HTTPS

2. **Baza podataka:**
   - Migracija na PostgreSQL
   - Backup strategija
   - Indeksi za performanse

3. **Funkcionalnosti:**
   - Export u Excel/CSV
   - Bulk import
   - Audit log
   - Geografska mapa
   - Topološki dijagrami
   - Workflow za naloge
   - API za vanjske sustave

4. **DevOps:**
   - Docker kontejneri
   - CI/CD pipeline
   - Monitoring (Prometheus/Grafana)
   - Logging (ELK stack)

## 💡 Napomene za prezentaciju

Ovaj MVP demonstrira:
- Brzu implementaciju (3-5 dana)
- Čisti kod s komentarima
- Modularnu arhitekturu
- Skalabilnost
- Moderne tehnologije
- Jednostavno proširivanje

Za produkciju bi trebalo dodatnih 6-8 tjedana za implementaciju svih funkcionalnosti iz originalnog zahtjeva.

## 📞 Kontakt

Za pitanja i dodatne informacije kontaktirajte razvojni tim.
