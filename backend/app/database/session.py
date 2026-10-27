import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Support PostgreSQL, or SQLite fallback for offline local testing
db_url = settings.SQLALCHEMY_DATABASE_URI

# Fallback to SQLite if PostgreSQL connection fails or SQLite environment flag is set
use_sqlite = os.getenv("USE_SQLITE", "true").lower() == "true"
if use_sqlite or "sqlite" in db_url:
    sqlite_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "..", "ids_database.db")
    db_url = f"sqlite:///{os.path.abspath(sqlite_file)}"
    engine = create_engine(db_url, connect_args={"check_same_thread": False})
else:
    engine = create_engine(db_url, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
