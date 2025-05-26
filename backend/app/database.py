#app/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

    # --- Añadir estas líneas temporalmente ---
print(f"DEBUG: DATABASE_URL cargada: {DATABASE_URL}")
if DATABASE_URL is None:
        print("DEBUG: ERROR - DATABASE_URL es None. La carga de .env pudo fallar o la variable no está definida.")
    # ---------------------------------------
engine = create_engine(DATABASE_URL) # Aquí es donde falla si es None
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()