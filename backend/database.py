import os
from sqlalchemy import create_engine, text, event
from sqlalchemy.orm import declarative_base, sessionmaker

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.getenv("DATA_DIR", os.path.join(BASE_DIR, "data"))

# Support persistent volume directory for SQLite database
if os.path.isdir(DATA_DIR):
    DEFAULT_DB_PATH = os.path.join(DATA_DIR, "portfolio.db")
    legacy_db = os.path.join(BASE_DIR, "portfolio.db")
    if not os.path.exists(DEFAULT_DB_PATH) and os.path.exists(legacy_db):
        try:
            import shutil
            shutil.copy2(legacy_db, DEFAULT_DB_PATH)
        except Exception:
            pass
else:
    DEFAULT_DB_PATH = os.path.join(BASE_DIR, "portfolio.db")

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    DATABASE_URL = f"sqlite:///{DEFAULT_DB_PATH}"
elif DATABASE_URL in ("sqlite:///./portfolio.db", "sqlite:///portfolio.db") and os.path.isdir(DATA_DIR):
    DATABASE_URL = f"sqlite:///{os.path.join(DATA_DIR, 'portfolio.db')}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

# Enable SQLite WAL Mode (Write-Ahead Logging) for high concurrency & safe live snapshots
if DATABASE_URL.startswith("sqlite"):
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def migrate_db():
    """Ensures newly added columns and tables exist in SQLite database without data loss."""
    try:
        import models  # Ensure all model tables (e.g. capability_cards) are registered to Base.metadata
    except ImportError:
        pass
    Base.metadata.create_all(bind=engine)

    if not DATABASE_URL.startswith("sqlite"):
        return

    with engine.connect() as conn:
        try:
            # Check projects table columns
            table_check = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name='projects';")).fetchone()
            if table_check:
                columns = [row[1] for row in conn.execute(text("PRAGMA table_info(projects);")).fetchall()]
                if "image_url" not in columns:
                    conn.execute(text("ALTER TABLE projects ADD COLUMN image_url VARCHAR(500) DEFAULT '';"))
                    print("[Migration] Added image_url column to projects table.")
                if "order_index" not in columns:
                    conn.execute(text("ALTER TABLE projects ADD COLUMN order_index INTEGER DEFAULT 0;"))
                    print("[Migration] Added order_index column to projects table.")
                if "live_url" not in columns:
                    conn.execute(text("ALTER TABLE projects ADD COLUMN live_url VARCHAR DEFAULT '';"))
                    conn.execute(text("UPDATE projects SET live_url = COALESCE(live_demo_url, '') WHERE live_url IS NULL OR live_url = '';"))
                    print("[Migration] Added live_url column to projects table and synced with live_demo_url.")
                if "youtube_url" not in columns:
                    conn.execute(text("ALTER TABLE projects ADD COLUMN youtube_url VARCHAR DEFAULT '';"))
                    print("[Migration] Added youtube_url column to projects table.")
                if "architecture_image_url" not in columns:
                    conn.execute(text("ALTER TABLE projects ADD COLUMN architecture_image_url VARCHAR(500) DEFAULT '';"))
                    print("[Migration] Added architecture_image_url column to projects table.")
                if "purchase_url" not in columns:
                    conn.execute(text("ALTER TABLE projects ADD COLUMN purchase_url VARCHAR(500) DEFAULT '';"))
                    print("[Migration] Added purchase_url column to projects table.")
                if "purchase_price" not in columns:
                    conn.execute(text("ALTER TABLE projects ADD COLUMN purchase_price VARCHAR(100) DEFAULT '';"))
                    print("[Migration] Added purchase_price column to projects table.")
                if "allow_custom_hire" not in columns:
                    conn.execute(text("ALTER TABLE projects ADD COLUMN allow_custom_hire BOOLEAN DEFAULT 1;"))
                    print("[Migration] Added allow_custom_hire column to projects table.")
                if "hire_custom_subject" not in columns:
                    conn.execute(text("ALTER TABLE projects ADD COLUMN hire_custom_subject VARCHAR(250) DEFAULT '';"))
                    print("[Migration] Added hire_custom_subject column to projects table.")

            # Check contact_matrix_config table columns
            matrix_check = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name='contact_matrix_config';")).fetchone()
            if matrix_check:
                matrix_columns = [row[1] for row in conn.execute(text("PRAGMA table_info(contact_matrix_config);")).fetchall()]
                if "whatsapp_number" not in matrix_columns:
                    conn.execute(text("ALTER TABLE contact_matrix_config ADD COLUMN whatsapp_number VARCHAR(100) DEFAULT '';"))
                    print("[Migration] Added whatsapp_number column to contact_matrix_config table.")
                if "whatsapp_url" not in matrix_columns:
                    conn.execute(text("ALTER TABLE contact_matrix_config ADD COLUMN whatsapp_url VARCHAR(500) DEFAULT '';"))
                    print("[Migration] Added whatsapp_url column to contact_matrix_config table.")
                if "show_whatsapp" not in matrix_columns:
                    conn.execute(text("ALTER TABLE contact_matrix_config ADD COLUMN show_whatsapp BOOLEAN DEFAULT 1;"))
                    print("[Migration] Added show_whatsapp column to contact_matrix_config table.")

            # Check inquiries table columns
            inq_check = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name='inquiries';")).fetchone()
            if inq_check:
                inq_columns = [row[1] for row in conn.execute(text("PRAGMA table_info(inquiries);")).fetchall()]
                if "status" not in inq_columns:
                    conn.execute(text("ALTER TABLE inquiries ADD COLUMN status VARCHAR(50) DEFAULT 'NEW';"))
                    print("[Migration] Added status column to inquiries table.")
                if "reply_subject" not in inq_columns:
                    conn.execute(text("ALTER TABLE inquiries ADD COLUMN reply_subject VARCHAR(255) DEFAULT '';"))
                    print("[Migration] Added reply_subject column to inquiries table.")
                if "reply_body" not in inq_columns:
                    conn.execute(text("ALTER TABLE inquiries ADD COLUMN reply_body TEXT DEFAULT '';"))
                    print("[Migration] Added reply_body column to inquiries table.")
                if "replied_at" not in inq_columns:
                    conn.execute(text("ALTER TABLE inquiries ADD COLUMN replied_at DATETIME;"))
                    print("[Migration] Added replied_at column to inquiries table.")
            conn.commit()
        except Exception as e:
            print(f"[Migration Warning] Error during schema sync: {e}")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
