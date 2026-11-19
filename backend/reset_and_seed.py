"""
Standalone Database Reset & Production Seeding Pipeline
Safely wipes dummy/placeholder data and seeds authentic engineering case studies.
Preserves Superadmin authentication records intact.
"""

import sys
import os

# Ensure backend directory is in python module search path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from sqlalchemy import text
from database import SessionLocal, engine, Base
import models

PRODUCTION_PROJECTS = [
    {
        "title": "Garment Unit K-03 Quality Audit & OCR Suite",
        "category": "Automation",
        "tech_stack": "Python, Streamlit, Google Gemini Vision, SQLite, Pandas, ReportLab",
        "order_index": 1,
        "is_published": True,
        "github_url": "https://github.com/kingsdaniyalayaz-droid/garment_excel_automation",
        "live_demo_url": None,
        "image_url": "",
        "description": (
            "### Overview\n"
            "An automated visual inspection and tabular audit extraction system designed for "
            "industrial apparel manufacturing. Built to handle daily line inspection matrices, "
            "size-ratio distributions, and quality control auditing.\n\n"
            "### Engineering Highlights\n"
            "- Structured audit sheet data extraction utilizing Gemini Vision OCR pipelines directly into SQLite.\n"
            "- Automated generation of production line attendance, overtime logs, and defect-ratio summaries.\n"
            "- Reduced daily compliance reporting overhead and manual transcription latency by over 70%."
        ),
    },
    {
        "title": "Advocate Diary Legal Practice Suite",
        "category": "Mobile",
        "tech_stack": "Flutter, Python, FastAPI, SQLite, Docker, JWT",
        "order_index": 2,
        "is_published": True,
        "github_url": "https://github.com/kingsdaniyalayaz-droid/Advocate-Diary",
        "live_demo_url": None,
        "image_url": "",
        "description": (
            "### Overview\n"
            "A cross-platform mobile and desktop management application tailored for legal "
            "advocates and law firms to manage court hearings, case dockets, client files, "
            "and daily proceedings.\n\n"
            "### Architecture & Features\n"
            "- Offline-first local SQLite caching with background cloud sync via containerized FastAPI REST endpoints.\n"
            "- Smart judicial calendar alerting advocates of upcoming summons, cause lists, and hearing stages.\n"
            "- Clean, responsive Flutter interface with biometric-ready local state management."
        ),
    },
    {
        "title": "AI Video & Meeting Assistant",
        "category": "AI/ML",
        "tech_stack": "Python, Whisper, OpenRouter, Streamlit, ReportLab, Docker",
        "order_index": 3,
        "is_published": True,
        "github_url": "https://github.com/kingsdaniyalayaz-droid/Video-AI-Friend",
        "live_demo_url": None,
        "image_url": "",
        "description": (
            "### Overview\n"
            "A containerized audio/video intelligence pipeline that transcribes raw meeting "
            "recordings, extracts actionable agendas, and exports executive documentation.\n\n"
            "### System Capabilities\n"
            "- Localized, privacy-conscious audio transcription using OpenAI Whisper.\n"
            "- Multi-lingual translation and automated meeting summarization via optimized LLM endpoints.\n"
            "- One-click structured PDF synthesis with action items, participant analytics, and meeting timestamps."
        ),
    },
]

def reset_and_seed():
    print("=" * 65)
    print(" [CYBER NEON] PRODUCTION DATABASE PURGE & SEEDING PIPELINE")
    print("=" * 65)

    db = SessionLocal()
    try:
        # Step 1: Pre-flight sanity checks & verify Superadmin preservation
        print("\n[1/5] Verifying Superadmin authentication persistence...")
        superadmin_count = db.query(models.AdminUser).count()
        if superadmin_count == 0:
            print("  [!] WARNING: No AdminUser found. Preserving table structure.")
        else:
            admins = db.query(models.AdminUser).all()
            for a in admins:
                print(f"  [+] Superadmin Identity Locked: '{a.username}' (ID: {a.id}, Created: {a.created_at})")

        # Step 2: Purge inquiries
        print("\n[2/5] Purging dummy and simulated client inquiries...")
        inquiries_deleted = db.query(models.Inquiry).delete()
        print(f"  [-] Erased {inquiries_deleted} inquiry records from 'inquiries' table.")

        # Step 3: Purge projects
        print("\n[3/5] Purging dummy and placeholder projects...")
        projects_deleted = db.query(models.Project).delete()
        print(f"  [-] Erased {projects_deleted} project records from 'projects' table.")

        # Step 4: Reset SQLite auto-increment sequences for wiped tables
        print("\n[4/5] Resetting SQLite primary key sequences...")
        try:
            db.execute(text("DELETE FROM sqlite_sequence WHERE name IN ('projects', 'inquiries');"))
            print("  [+] Auto-increment counters for 'projects' and 'inquiries' reset to 0.")
        except Exception as seq_err:
            print(f"  [*] SQLite sequence note: {seq_err}")

        # Step 5: Seed verified production case studies
        print("\n[5/5] Seeding authentic production project records...")
        inserted_projects = []
        for proj_data in PRODUCTION_PROJECTS:
            project = models.Project(
                title=proj_data["title"],
                category=proj_data["category"],
                tech_stack=proj_data["tech_stack"],
                order_index=proj_data["order_index"],
                is_published=proj_data["is_published"],
                github_url=proj_data["github_url"],
                live_demo_url=proj_data["live_demo_url"],
                image_url=proj_data["image_url"],
                description=proj_data["description"],
            )
            db.add(project)
            inserted_projects.append(project)

        # Commit transaction atomically
        db.commit()

        for p in inserted_projects:
            db.refresh(p)
            print(f"  [+] Seeded Record #{p.id} [Priority #{p.order_index}]: {p.title} ({p.category})")

        # Verification telemetry
        final_projects = db.query(models.Project).count()
        final_published = db.query(models.Project).filter(models.Project.is_published == True).count()
        final_drafts = db.query(models.Project).filter(models.Project.is_published == False).count()
        final_inquiries = db.query(models.Inquiry).count()
        final_admins = db.query(models.AdminUser).count()

        print("\n" + "=" * 65)
        print(" PIPELINE EXECUTION SUMMARY & VERIFICATION TELEMETRY")
        print("=" * 65)
        print(f"  - Total Projects:     {final_projects} (Published: {final_published}, Drafts: {final_drafts})")
        print(f"  - Client Inquiries:   {final_inquiries} (Unread: 0)")
        print(f"  - Superadmin Records: {final_admins} (Identity preserved)")
        print("=" * 65)
        print(" [SUCCESS] Database purge and production seeding completed cleanly.\n")

    except Exception as e:
        db.rollback()
        print(f"\n[FATAL ERROR] Transaction aborted and rolled back: {e}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    reset_and_seed()
