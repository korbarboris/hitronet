"""
Hitronet EMS - Minimalni MVP CRUD Sustav
Backend: FastAPI + SQLite + SQLAlchemy
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# === DATABASE SETUP ===
SQLALCHEMY_DATABASE_URL = "sqlite:///./hitronet.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# === MODELS ===
class Korisnik(Base):
    __tablename__ = "korisnici"
    
    id = Column(Integer, primary_key=True, index=True)
    oib = Column(String, unique=True, index=True)
    naziv = Column(String, index=True)
    adresa = Column(String)
    tip_korisnika = Column(String)  # fizicki/pravni
    paket_usluga = Column(String)
    status = Column(String)  # aktivan/neaktivan
    kontakt_admin = Column(String)
    kontakt_tehnika = Column(String)
    datum_ugovora = Column(DateTime, default=datetime.now)
    created_at = Column(DateTime, default=datetime.now)
    
    lokacije = relationship("Lokacija", back_populates="korisnik")

class Lokacija(Base):
    __tablename__ = "lokacije"
    
    id = Column(Integer, primary_key=True, index=True)
    naziv = Column(String, index=True)
    tip = Column(String)  # korisnik/servisna/pomocna
    adresa = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    status = Column(String)  # planirana/aktivna/neaktivna
    korisnik_id = Column(Integer, ForeignKey("korisnici.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    
    korisnik = relationship("Korisnik", back_populates="lokacije")
    oprema = relationship("Oprema", back_populates="lokacija")

class Veza(Base):
    __tablename__ = "veze"
    
    id = Column(Integer, primary_key=True, index=True)
    lokacija_a_id = Column(Integer, ForeignKey("lokacije.id"))
    lokacija_b_id = Column(Integer, ForeignKey("lokacije.id"))
    tip = Column(String)  # optika/bakar/wireless/P2P/P2MP
    kapacitet_vlakana = Column(Integer)
    kapacitet_parica = Column(Integer)
    brzina_mbps = Column(Integer)
    status = Column(String)  # aktivan/planiran/u_kvaru
    redundantna_veza_id = Column(Integer, ForeignKey("veze.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    
    lokacija_a = relationship("Lokacija", foreign_keys=[lokacija_a_id])
    lokacija_b = relationship("Lokacija", foreign_keys=[lokacija_b_id])

class Oprema(Base):
    __tablename__ = "oprema"
    
    id = Column(Integer, primary_key=True, index=True)
    lokacija_id = Column(Integer, ForeignKey("lokacije.id"))
    tip = Column(String)  # switch/router/ONT/antena
    proizvodjac = Column(String)
    model = Column(String)
    serijski_broj = Column(String, unique=True)
    inventurni_broj = Column(String)
    status = Column(String)  # u_upotrebi/rezerva/otpisana
    datum_instalacije = Column(DateTime)
    created_at = Column(DateTime, default=datetime.now)
    
    lokacija = relationship("Lokacija", back_populates="oprema")

# Kreiraj tablice
Base.metadata.create_all(bind=engine)

# === PYDANTIC SCHEMAS ===
class KorisnikBase(BaseModel):
    oib: str
    naziv: str
    adresa: str
    tip_korisnika: str
    paket_usluga: str
    status: str
    kontakt_admin: Optional[str] = None
    kontakt_tehnika: Optional[str] = None

class KorisnikCreate(KorisnikBase):
    pass

class KorisnikResponse(KorisnikBase):
    id: int
    datum_ugovora: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True

class LokacijaBase(BaseModel):
    naziv: str
    tip: str
    adresa: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: str
    korisnik_id: Optional[int] = None

class LokacijaCreate(LokacijaBase):
    pass

class LokacijaResponse(LokacijaBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class VezaBase(BaseModel):
    lokacija_a_id: int
    lokacija_b_id: int
    tip: str
    kapacitet_vlakana: Optional[int] = None
    kapacitet_parica: Optional[int] = None
    brzina_mbps: Optional[int] = None
    status: str
    redundantna_veza_id: Optional[int] = None

class VezaCreate(VezaBase):
    pass

class VezaResponse(VezaBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class OpremaBase(BaseModel):
    lokacija_id: int
    tip: str
    proizvodjac: str
    model: str
    serijski_broj: str
    inventurni_broj: str
    status: str
    datum_instalacije: Optional[datetime] = None

class OpremaCreate(OpremaBase):
    pass

class OpremaResponse(OpremaBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# === FastAPI APP ===
app = FastAPI(title="Hitronet EMS - MVP", version="0.1.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Za produkciju specificirati domene
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# === API ENDPOINTS ===

# ROOT
@app.get("/")
def read_root():
    return {
        "message": "Hitronet EMS MVP API",
        "version": "0.1.0",
        "endpoints": {
            "korisnici": "/korisnici",
            "lokacije": "/lokacije",
            "veze": "/veze",
            "oprema": "/oprema"
        }
    }

# KORISNICI CRUD
@app.post("/korisnici", response_model=KorisnikResponse)
def create_korisnik(korisnik: KorisnikCreate, db: Session = Depends(get_db)):
    db_korisnik = Korisnik(**korisnik.dict())
    db.add(db_korisnik)
    db.commit()
    db.refresh(db_korisnik)
    return db_korisnik

@app.get("/korisnici", response_model=List[KorisnikResponse])
def read_korisnici(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    korisnici = db.query(Korisnik).offset(skip).limit(limit).all()
    return korisnici

@app.get("/korisnici/{korisnik_id}", response_model=KorisnikResponse)
def read_korisnik(korisnik_id: int, db: Session = Depends(get_db)):
    korisnik = db.query(Korisnik).filter(Korisnik.id == korisnik_id).first()
    if korisnik is None:
        raise HTTPException(status_code=404, detail="Korisnik not found")
    return korisnik

@app.put("/korisnici/{korisnik_id}", response_model=KorisnikResponse)
def update_korisnik(korisnik_id: int, korisnik: KorisnikCreate, db: Session = Depends(get_db)):
    db_korisnik = db.query(Korisnik).filter(Korisnik.id == korisnik_id).first()
    if db_korisnik is None:
        raise HTTPException(status_code=404, detail="Korisnik not found")
    
    for key, value in korisnik.dict().items():
        setattr(db_korisnik, key, value)
    
    db.commit()
    db.refresh(db_korisnik)
    return db_korisnik

@app.delete("/korisnici/{korisnik_id}")
def delete_korisnik(korisnik_id: int, db: Session = Depends(get_db)):
    db_korisnik = db.query(Korisnik).filter(Korisnik.id == korisnik_id).first()
    if db_korisnik is None:
        raise HTTPException(status_code=404, detail="Korisnik not found")
    
    db.delete(db_korisnik)
    db.commit()
    return {"message": "Korisnik deleted successfully"}

# LOKACIJE CRUD
@app.post("/lokacije", response_model=LokacijaResponse)
def create_lokacija(lokacija: LokacijaCreate, db: Session = Depends(get_db)):
    db_lokacija = Lokacija(**lokacija.dict())
    db.add(db_lokacija)
    db.commit()
    db.refresh(db_lokacija)
    return db_lokacija

@app.get("/lokacije", response_model=List[LokacijaResponse])
def read_lokacije(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    lokacije = db.query(Lokacija).offset(skip).limit(limit).all()
    return lokacije

@app.get("/lokacije/{lokacija_id}", response_model=LokacijaResponse)
def read_lokacija(lokacija_id: int, db: Session = Depends(get_db)):
    lokacija = db.query(Lokacija).filter(Lokacija.id == lokacija_id).first()
    if lokacija is None:
        raise HTTPException(status_code=404, detail="Lokacija not found")
    return lokacija

@app.put("/lokacije/{lokacija_id}", response_model=LokacijaResponse)
def update_lokacija(lokacija_id: int, lokacija: LokacijaCreate, db: Session = Depends(get_db)):
    db_lokacija = db.query(Lokacija).filter(Lokacija.id == lokacija_id).first()
    if db_lokacija is None:
        raise HTTPException(status_code=404, detail="Lokacija not found")
    
    for key, value in lokacija.dict().items():
        setattr(db_lokacija, key, value)
    
    db.commit()
    db.refresh(db_lokacija)
    return db_lokacija

@app.delete("/lokacije/{lokacija_id}")
def delete_lokacija(lokacija_id: int, db: Session = Depends(get_db)):
    db_lokacija = db.query(Lokacija).filter(Lokacija.id == lokacija_id).first()
    if db_lokacija is None:
        raise HTTPException(status_code=404, detail="Lokacija not found")
    
    db.delete(db_lokacija)
    db.commit()
    return {"message": "Lokacija deleted successfully"}

# VEZE CRUD
@app.post("/veze", response_model=VezaResponse)
def create_veza(veza: VezaCreate, db: Session = Depends(get_db)):
    db_veza = Veza(**veza.dict())
    db.add(db_veza)
    db.commit()
    db.refresh(db_veza)
    return db_veza

@app.get("/veze", response_model=List[VezaResponse])
def read_veze(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    veze = db.query(Veza).offset(skip).limit(limit).all()
    return veze

@app.get("/veze/{veza_id}", response_model=VezaResponse)
def read_veza(veza_id: int, db: Session = Depends(get_db)):
    veza = db.query(Veza).filter(Veza.id == veza_id).first()
    if veza is None:
        raise HTTPException(status_code=404, detail="Veza not found")
    return veza

@app.put("/veze/{veza_id}", response_model=VezaResponse)
def update_veza(veza_id: int, veza: VezaCreate, db: Session = Depends(get_db)):
    db_veza = db.query(Veza).filter(Veza.id == veza_id).first()
    if db_veza is None:
        raise HTTPException(status_code=404, detail="Veza not found")
    
    for key, value in veza.dict().items():
        setattr(db_veza, key, value)
    
    db.commit()
    db.refresh(db_veza)
    return db_veza

@app.delete("/veze/{veza_id}")
def delete_veza(veza_id: int, db: Session = Depends(get_db)):
    db_veza = db.query(Veza).filter(Veza.id == veza_id).first()
    if db_veza is None:
        raise HTTPException(status_code=404, detail="Veza not found")
    
    db.delete(db_veza)
    db.commit()
    return {"message": "Veza deleted successfully"}

# OPREMA CRUD
@app.post("/oprema", response_model=OpremaResponse)
def create_oprema(oprema: OpremaCreate, db: Session = Depends(get_db)):
    db_oprema = Oprema(**oprema.dict())
    db.add(db_oprema)
    db.commit()
    db.refresh(db_oprema)
    return db_oprema

@app.get("/oprema", response_model=List[OpremaResponse])
def read_oprema(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    oprema = db.query(Oprema).offset(skip).limit(limit).all()
    return oprema

@app.get("/oprema/{oprema_id}", response_model=OpremaResponse)
def read_oprema_single(oprema_id: int, db: Session = Depends(get_db)):
    oprema = db.query(Oprema).filter(Oprema.id == oprema_id).first()
    if oprema is None:
        raise HTTPException(status_code=404, detail="Oprema not found")
    return oprema

@app.put("/oprema/{oprema_id}", response_model=OpremaResponse)
def update_oprema(oprema_id: int, oprema: OpremaCreate, db: Session = Depends(get_db)):
    db_oprema = db.query(Oprema).filter(Oprema.id == oprema_id).first()
    if db_oprema is None:
        raise HTTPException(status_code=404, detail="Oprema not found")
    
    for key, value in oprema.dict().items():
        setattr(db_oprema, key, value)
    
    db.commit()
    db.refresh(db_oprema)
    return db_oprema

@app.delete("/oprema/{oprema_id}")
def delete_oprema(oprema_id: int, db: Session = Depends(get_db)):
    db_oprema = db.query(Oprema).filter(Oprema.id == oprema_id).first()
    if db_oprema is None:
        raise HTTPException(status_code=404, detail="Oprema not found")
    
    db.delete(db_oprema)
    db.commit()
    return {"message": "Oprema deleted successfully"}

# STATISTICS ENDPOINT
@app.get("/stats")
def get_statistics(db: Session = Depends(get_db)):
    return {
        "korisnici": db.query(Korisnik).count(),
        "lokacije": db.query(Lokacija).count(),
        "veze": db.query(Veza).count(),
        "oprema": db.query(Oprema).count(),
        "aktivni_korisnici": db.query(Korisnik).filter(Korisnik.status == "aktivan").count(),
        "aktivne_lokacije": db.query(Lokacija).filter(Lokacija.status == "aktivna").count()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
