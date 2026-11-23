import os
import json
import re
import shutil
import uuid
import datetime
from contextlib import asynccontextmanager
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, status, Query, File, UploadFile, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc, func, text
from apscheduler.schedulers.background import BackgroundScheduler

from database import engine, Base, SessionLocal, get_db, migrate_db
from models import Project, Inquiry, AdminUser, VisitorSession, SocialLink, CapabilityCard, StackCategory, StackItem, ContactMatrixConfig, ImpactMetric, Testimonial, EngagementModel
from schemas import (
    LoginRequest, TokenResponse, UserResponse,
    ProfileUpdateRequest, ProfileUpdateResponse, ChangePasswordRequest, StatusMessageResponse,
    ProjectCreate, ProjectUpdate, ProjectResponse,
    ProjectReorderItem, UploadResponse,
    InquiryCreate, InquiryReplyRequest, InquiryResponse, DashboardStats,
    TelemetryVisitRequest, TelemetryHeartbeatRequest, TelemetryOverviewResponse,
    TelemetrySourcesResponse, TelemetryLocationsResponse, TelemetryDevicesResponse,
    TelemetryLiveItem, TelemetryDistributionItem, TelemetryCityItem,
    SocialLinkCreate, SocialLinkUpdate, SocialLinkResponse, SocialLinkReorderItem,
    CapabilityCardCreate, CapabilityCardUpdate, CapabilityCardResponse, CapabilityReorderItem,
    StackItemCreate, StackItemUpdate, StackItemResponse,
    StackCategoryCreate, StackCategoryUpdate, StackCategoryResponse, StackReorderItem,
    ContactMatrixUpdate, ContactMatrixResponse,
    ImpactMetricCreate, ImpactMetricUpdate, ImpactMetricResponse, ImpactMetricReorderItem,
    TestimonialCreate, TestimonialUpdate, TestimonialResponse, TestimonialReorderItem,
    EngagementModelCreate, EngagementModelUpdate, EngagementModelResponse, EngagementModelReorderItem
)
from auth import (
    authenticate_superadmin, create_access_token, get_current_user,
    get_current_user_or_token_query,
    hash_password, verify_password, get_or_create_default_admin
)
from email_service import send_direct_email, send_admin_new_lead_alert
from seed import seed_database
from backup_engine import create_snapshot, get_backup_metadata, BACKUPS_DIR
from telemetry_utils import (
    hash_client_ip, extract_client_ip, extract_geo_location,
    parse_user_agent, normalize_referrer, is_internal_route,
    is_localhost_ip, is_bot_user_agent
)

# Initialize database tables and run incremental schema migrations
Base.metadata.create_all(bind=engine)
migrate_db()

# Auto seed if database is empty
seed_database()

# Automated Background Snapshot Scheduler
scheduler = BackgroundScheduler()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure upload and backup directories exist, default admin exists & start daily backup scheduler
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    os.makedirs(BACKUPS_DIR, exist_ok=True)
    with SessionLocal() as db:
        get_or_create_default_admin(db)

    try:
        scheduler.add_job(create_snapshot, "interval", hours=24, id="daily_db_backup", replace_existing=True)
        scheduler.start()
        print("[Scheduler] Automated 24h SQLite backup scheduler initialized.")
    except Exception as e:
        print(f"[Scheduler Warning] Could not start scheduler: {e}")

    yield

    # Shutdown
    try:
        if scheduler.running:
            scheduler.shutdown(wait=False)
            print("[Scheduler] Backup scheduler stopped cleanly.")
    except Exception:
        pass

app = FastAPI(
    title="Cyber Neon Portfolio Admin API",
    description="Decoupled backend REST API for Portfolio & Content Management with hardened dynamic superadmin security & automated SQLite backups.",
    version="1.2.0",
    lifespan=lifespan
)

# File upload, backup and static distribution directories
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
BACKUPS_DIR = os.path.join(BASE_DIR, "backups")

# Automatically create uploads and backups directories on startup if missing
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(BACKUPS_DIR, exist_ok=True)

class CachedStaticFiles(StaticFiles):
    """Static file handler that attaches public Cache-Control headers for media assets."""
    async def get_response(self, path: str, scope):
        response = await super().get_response(path, scope)
        if response.status_code == 200:
            response.headers["Cache-Control"] = "public, max-age=86400"
        return response

app.mount("/uploads", CachedStaticFiles(directory=UPLOAD_DIR), name="uploads")

def get_static_dist_dir() -> Optional[str]:
    """Resolves production frontend build directory across Docker and local layouts."""
    candidates = [
        os.getenv("STATIC_DIR"),
        os.path.join(BASE_DIR, "frontend", "dist"),
        os.path.join(BASE_DIR, "dist"),
        os.path.join(BASE_DIR, "..", "frontend", "dist"),
    ]
    return next((p for p in candidates if p and os.path.isdir(p)), None)

STATIC_DIST_DIR = get_static_dist_dir()
if STATIC_DIST_DIR and os.path.isdir(os.path.join(STATIC_DIST_DIR, "assets")):
    app.mount("/assets", StaticFiles(directory=os.path.join(STATIC_DIST_DIR, "assets")), name="frontend-assets")

# Enable CORS for frontend applications
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:4173",
    "http://localhost:8001",
    "http://127.0.0.1:8001",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enable GZip compression for all responses >= 500 bytes (reduces latency over AWS Sydney)
app.add_middleware(GZipMiddleware, minimum_size=500)

# Allowed file upload formats
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}

# --- ROOT & HEALTHCHECK ---
@app.get("/", tags=["Health"])
def root():
    dist_dir = get_static_dist_dir()
    if dist_dir:
        index_file = os.path.join(dist_dir, "index.html")
        if os.path.isfile(index_file):
            return FileResponse(index_file)
    return {
        "status": "online",
        "system": "Cyber Neon Portfolio Core (Hardened)",
        "version": "1.2.0",
        "storage": "SQLite 3 WAL Mode",
        "docs": "/docs"
    }

@app.get("/api/health", tags=["Health"])
def api_health():
    return {
        "status": "online",
        "system": "Cyber Neon Portfolio Core (Hardened)",
        "version": "1.2.0",
        "storage": "SQLite 3 WAL Mode",
        "docs": "/docs"
    }

# --- AUTHENTICATION & SUPERADMIN PROFILE MODULE ---
@app.post("/api/auth/login", response_model=TokenResponse, tags=["Auth"])
def login(creds: LoginRequest, db: Session = Depends(get_db)):
    admin = authenticate_superadmin(db, creds.username, creds.password)
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid cyber credentials. Access strictly denied.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": admin.username, "role": "superadmin"})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": admin.id,
            "username": admin.username,
            "role": "superadmin"
        }
    }

@app.get("/api/auth/me", response_model=UserResponse, tags=["Auth"])
def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "id": current_user.get("id"),
        "username": current_user["username"],
        "role": current_user["role"]
    }

@app.put("/api/auth/profile", response_model=ProfileUpdateResponse, tags=["Auth"])
def update_profile(
    profile_in: ProfileUpdateRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Updates active Superadmin operator username.
    Issues a newly signed JWT reflecting the new identity.
    """
    new_username = profile_in.username.strip()
    if not new_username:
        raise HTTPException(status_code=400, detail="Username cannot be empty.")

    # Check if taken by another admin record
    existing = db.query(AdminUser).filter(AdminUser.username == new_username, AdminUser.id != current_user["id"]).first()
    if existing:
        raise HTTPException(status_code=400, detail="Selected operator username is already in use.")

    admin = db.query(AdminUser).filter(AdminUser.id == current_user["id"]).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin record not found.")

    admin.username = new_username
    admin.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(admin)

    # Issue renewed JWT
    new_token = create_access_token(data={"sub": admin.username, "role": "superadmin"})

    return {
        "username": admin.username,
        "role": "superadmin",
        "access_token": new_token,
        "message": f"Operator identity successfully updated to '{admin.username}'."
    }

@app.put("/api/auth/change-password", response_model=StatusMessageResponse, tags=["Auth"])
def change_password(
    pwd_in: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Rotates the Superadmin security access key.
    Enforces minimum 8 chars, match confirmation, and verifies the current key.
    """
    if len(pwd_in.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New security key must be at least 8 characters in length."
        )

    if pwd_in.new_password != pwd_in.confirm_new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Confirmation key does not match the new security key."
        )

    admin = db.query(AdminUser).filter(AdminUser.id == current_user["id"]).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin record not found.")

    # Verify current password
    if not verify_password(pwd_in.current_password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current security key verification failed. Access denied."
        )

    # Hash and commit new password
    admin.password_hash = hash_password(pwd_in.new_password)
    admin.updated_at = datetime.datetime.utcnow()
    db.commit()

    return {
        "status": "success",
        "message": "Superadmin security access key rotated successfully."
    }

@app.post("/api/auth/logout", tags=["Auth"])
def logout(current_user: dict = Depends(get_current_user)):
    return {"message": "Session terminated successfully."}

# --- DATABASE BACKUP & SNAPSHOT MODULE ---
@app.get("/api/admin/backup-now", tags=["Database Backups"])
@app.post("/api/admin/backup-now", tags=["Database Backups"])
def backup_database_now(
    mode: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """
    Immediately performs an atomic SQLite snapshot via sqlite3 backup API,
    compresses the database file with gzip, prunes archives older than 7 days.
    If mode=json, returns JSON with snapshot metadata and download_url.
    Otherwise returns the compressed .db.gz file as an on-demand download stream.
    """
    try:
        archive_path = create_snapshot()
        filename = os.path.basename(archive_path)
        size_bytes = os.path.getsize(archive_path)

        if mode == "json":
            return {
                "status": "ok",
                "filename": filename,
                "size_bytes": size_bytes,
                "download_url": f"/api/admin/backups/{filename}/download"
            }

        return FileResponse(
            path=archive_path,
            filename=filename,
            media_type="application/gzip",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Atomic database backup failed: {str(e)}"
        )

@app.get("/api/admin/backups/{filename}/download", tags=["Database Backups"])
def download_backup_archive(
    filename: str,
    current_user: dict = Depends(get_current_user_or_token_query)
):
    """
    Dedicated download endpoint for generated backup archives.
    Secured via either Bearer authorization header or ?token= query parameter.
    """
    clean_name = os.path.basename(filename)
    if clean_name != filename or not filename.endswith(".db.gz"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid backup filename format."
        )

    file_path = os.path.join(BACKUPS_DIR, clean_name)
    if not os.path.isfile(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requested backup snapshot file not found."
        )

    return FileResponse(
        path=file_path,
        filename=clean_name,
        media_type="application/gzip",
        headers={"Content-Disposition": f"attachment; filename={clean_name}"}
    )

@app.get("/api/admin/backup-stats", tags=["Database Backups"])
def get_backup_stats(current_user: dict = Depends(get_current_user)):
    """Returns telemetry on existing SQLite snapshots and disk footprint."""
    return get_backup_metadata()

# --- MEDIA UPLOAD MODULE ---
@app.post("/api/upload", response_model=UploadResponse, tags=["Media"])
def upload_media(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    original_filename = file.filename or "upload.png"
    ext = os.path.splitext(original_filename)[1].lower()

    if ext not in ALLOWED_EXTENSIONS or (file.content_type and file.content_type not in ALLOWED_MIME_TYPES):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported media format. Allowed extensions: .jpg, .jpeg, .png, .webp."
        )

    unique_filename = f"{uuid.uuid4().hex}{ext}"
    dest_path = os.path.join(UPLOAD_DIR, unique_filename)

    try:
        with open(dest_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to persist asset to storage: {str(e)}"
        )

    return {
        "url": f"/uploads/{unique_filename}",
        "filename": unique_filename
    }

# --- STATS / METRICS MODULE ---
@app.get("/api/stats", response_model=DashboardStats, tags=["Metrics"])
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    total_projects = db.query(Project).count()
    published_projects = db.query(Project).filter(Project.is_published == True).count()
    draft_projects = db.query(Project).filter(Project.is_published == False).count()
    total_inquiries = db.query(Inquiry).count()
    unread_inquiries = db.query(Inquiry).filter(Inquiry.is_read == False).count()

    return {
        "total_projects": total_projects,
        "published_projects": published_projects,
        "draft_projects": draft_projects,
        "total_inquiries": total_inquiries,
        "unread_inquiries": unread_inquiries
    }

# --- PROJECTS CRUD & REORDER MODULE ---
@app.get("/api/projects", response_model=List[ProjectResponse], tags=["Projects"])
@app.get("/api/public/projects", response_model=List[ProjectResponse], tags=["Projects"], include_in_schema=False)
def list_projects(
    search: Optional[str] = Query(None, description="Search across title, tech stack, or description"),
    category: Optional[str] = Query(None, description="Filter by category"),
    published_only: Optional[bool] = Query(None, description="Filter by published status"),
    db: Session = Depends(get_db)
):
    query = db.query(Project)

    if published_only is not None:
        query = query.filter(Project.is_published == published_only)

    if category and category.lower() != "all":
        query = query.filter(Project.category.ilike(f"%{category}%"))

    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            or_(
                Project.title.ilike(search_fmt),
                Project.tech_stack.ilike(search_fmt),
                Project.category.ilike(search_fmt),
                Project.description.ilike(search_fmt)
            )
        )

    return query.order_by(asc(Project.order_index), desc(Project.id)).all()

@app.post("/api/projects/reorder", tags=["Projects"])
def reorder_projects(
    items: List[ProjectReorderItem],
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    try:
        for item in items:
            db.query(Project).filter(Project.id == item.id).update(
                {"order_index": item.order_index},
                synchronize_session=False
            )
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Reordering transaction failed: {str(e)}"
        )

    return {"status": "success", "message": f"Successfully reordered {len(items)} project records."}

@app.get("/api/projects/{project_id}", response_model=ProjectResponse, tags=["Projects"])
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found in system records.")
    return project

@app.post("/api/projects", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED, tags=["Projects"])
def create_project(
    project_in: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    order_idx = project_in.order_index
    if order_idx is None:
        max_idx = db.query(Project.order_index).order_by(desc(Project.order_index)).first()
        order_idx = (max_idx[0] + 1) if max_idx and max_idx[0] is not None else 0

    raw_live = (project_in.live_url or project_in.live_demo_url or "").strip()
    clean_live = normalize_url(raw_live) if raw_live else ""
    raw_github = (project_in.github_url or "").strip()
    clean_github = normalize_url(raw_github) if raw_github else ""
    raw_youtube = (project_in.youtube_url or "").strip()
    clean_youtube = normalize_url(raw_youtube) if raw_youtube else ""
    raw_arch = (project_in.architecture_image_url or "").strip()
    raw_purchase_url = (project_in.purchase_url or "").strip()
    clean_purchase_url = normalize_url(raw_purchase_url) if raw_purchase_url else ""
    raw_purchase_price = (project_in.purchase_price or "").strip()
    allow_custom_hire = project_in.allow_custom_hire if project_in.allow_custom_hire is not None else True
    raw_hire_custom_subject = (project_in.hire_custom_subject or "").strip()

    project = Project(
        title=project_in.title.strip(),
        category=project_in.category.strip(),
        tech_stack=project_in.tech_stack.strip(),
        description=project_in.description.strip(),
        image_url=project_in.image_url.strip() if project_in.image_url else "",
        live_url=clean_live,
        live_demo_url=clean_live,
        github_url=clean_github,
        youtube_url=clean_youtube,
        architecture_image_url=raw_arch,
        purchase_url=clean_purchase_url,
        purchase_price=raw_purchase_price,
        allow_custom_hire=allow_custom_hire,
        hire_custom_subject=raw_hire_custom_subject,
        is_published=project_in.is_published,
        order_index=order_idx
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

@app.put("/api/projects/{project_id}", response_model=ProjectResponse, tags=["Projects"])
def update_project(
    project_id: int,
    project_update: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found in system records.")

    update_data = project_update.dict(exclude_unset=True)
    if "live_url" in update_data:
        val = (update_data["live_url"] or "").strip()
        val = normalize_url(val) if val else ""
        update_data["live_url"] = val
        update_data["live_demo_url"] = val
    elif "live_demo_url" in update_data:
        val = (update_data["live_demo_url"] or "").strip()
        val = normalize_url(val) if val else ""
        update_data["live_url"] = val
        update_data["live_demo_url"] = val

    if "github_url" in update_data and update_data["github_url"] is not None:
        val = (update_data["github_url"] or "").strip()
        update_data["github_url"] = normalize_url(val) if val else ""

    if "youtube_url" in update_data and update_data["youtube_url"] is not None:
        val = (update_data["youtube_url"] or "").strip()
        update_data["youtube_url"] = normalize_url(val) if val else ""

    if "purchase_url" in update_data and update_data["purchase_url"] is not None:
        val = (update_data["purchase_url"] or "").strip()
        update_data["purchase_url"] = normalize_url(val) if val else ""

    for field, value in update_data.items():
        if isinstance(value, str):
            value = value.strip()
        setattr(project, field, value)

    db.commit()
    db.refresh(project)
    return project

@app.patch("/api/projects/{project_id}/toggle-status", response_model=ProjectResponse, tags=["Projects"])
def toggle_project_status(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    project.is_published = not project.is_published
    db.commit()
    db.refresh(project)
    return project

@app.delete("/api/projects/{project_id}", status_code=status.HTTP_200_OK, tags=["Projects"])
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    db.delete(project)
    db.commit()
    return {"message": f"Project #{project_id} deleted successfully."}

# --- INQUIRIES / CONTACT MESSAGES MODULE ---
@app.get("/api/inquiries", response_model=List[InquiryResponse], tags=["Inquiries"])
def list_inquiries(
    unread_only: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    query = db.query(Inquiry)
    if unread_only is True:
        query = query.filter(Inquiry.is_read == False)
    return query.order_by(desc(Inquiry.created_at)).all()

@app.post("/api/inquiries", response_model=InquiryResponse, status_code=status.HTTP_201_CREATED, tags=["Inquiries"])
def create_inquiry(
    inquiry_in: InquiryCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    inquiry = Inquiry(
        name=inquiry_in.name.strip(),
        email=inquiry_in.email.strip(),
        subject=inquiry_in.subject.strip() if inquiry_in.subject else "Portfolio Contact",
        message=inquiry_in.message.strip(),
        is_read=False,
        status="NEW"
    )
    db.add(inquiry)
    db.commit()
    db.refresh(inquiry)

    # Dispatch non-blocking instant notification email to admin inbox if SMTP is configured
    background_tasks.add_task(
        send_admin_new_lead_alert,
        inquiry.name,
        inquiry.email,
        inquiry.subject,
        inquiry.message
    )

    return inquiry

@app.post("/api/inquiries/{inquiry_id}/reply", response_model=InquiryResponse, tags=["Inquiries"])
def reply_to_inquiry(
    inquiry_id: int,
    reply_in: InquiryReplyRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Protected route: Send a real direct SMTP email to the client, record reply in SQLite,
    and update inquiry status to REPLIED.
    """
    inquiry = db.query(Inquiry).filter(Inquiry.id == inquiry_id).first()
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry message not found.")

    # Dispatch real email via smtplib
    send_direct_email(
        to_email=inquiry.email,
        subject=reply_in.subject.strip(),
        body=reply_in.message.strip(),
        recipient_name=inquiry.name
    )

    # Update inquiry state
    inquiry.is_read = True
    inquiry.status = "REPLIED"
    inquiry.reply_subject = reply_in.subject.strip()
    inquiry.reply_body = reply_in.message.strip()
    inquiry.replied_at = datetime.datetime.utcnow()

    db.commit()
    db.refresh(inquiry)
    return inquiry

@app.patch("/api/inquiries/{inquiry_id}/read", response_model=InquiryResponse, tags=["Inquiries"])
def toggle_inquiry_read_status(
    inquiry_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    inquiry = db.query(Inquiry).filter(Inquiry.id == inquiry_id).first()
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry message not found.")

    inquiry.is_read = not inquiry.is_read
    db.commit()
    db.refresh(inquiry)
    return inquiry

@app.delete("/api/inquiries/{inquiry_id}", status_code=status.HTTP_200_OK, tags=["Inquiries"])
def delete_inquiry(
    inquiry_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    inquiry = db.query(Inquiry).filter(Inquiry.id == inquiry_id).first()
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry message not found.")

    db.delete(inquiry)
    db.commit()
    return {"message": f"Inquiry #{inquiry_id} eliminated from records."}

def normalize_url(url: str) -> str:
    cleaned = (url or "").strip()
    if cleaned and not (cleaned.startswith("http://") or cleaned.startswith("https://")):
        return f"https://{cleaned}"
    return cleaned

def normalize_whatsapp_url(val: str) -> str:
    cleaned = (val or "").strip()
    if not cleaned:
        return ""
    if cleaned.startswith("http://") or cleaned.startswith("https://"):
        return cleaned
    if cleaned.startswith("wa.me/"):
        return f"https://{cleaned}"
    digits = re.sub(r"\D", "", cleaned)
    if digits.startswith("0") and len(digits) == 11:
        digits = "92" + digits[1:]
    if digits:
        return f"https://wa.me/{digits}"
    return cleaned

# ==========================================
# --- DYNAMIC SOCIAL & FREELANCE LINKS ---
# ==========================================

@app.get("/api/social-links", response_model=List[SocialLinkResponse], tags=["Social Links"])
def get_social_links(
    active_only: bool = Query(False, description="Filter for active visible links only"),
    db: Session = Depends(get_db)
):
    """
    Public route: Retrieve social and freelance profile links.
    When active_only=true, returns only public-facing active items.
    """
    query = db.query(SocialLink)
    if active_only:
        query = query.filter(SocialLink.is_active == True)
    return query.order_by(asc(SocialLink.order_index), asc(SocialLink.id)).all()

@app.post("/api/social-links", response_model=SocialLinkResponse, status_code=status.HTTP_201_CREATED, tags=["Social Links"])
def create_social_link(
    link_in: SocialLinkCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Protected route: Add a new social or freelance platform link.
    """
    order_idx = link_in.order_index
    if order_idx == 0:
        max_idx = db.query(func.max(SocialLink.order_index)).scalar()
        order_idx = (max_idx + 1) if max_idx is not None else 0

    normalized_url = normalize_url(link_in.url)

    link = SocialLink(
        platform=link_in.platform.strip(),
        label=link_in.label.strip(),
        url=normalized_url,
        icon_key=(link_in.icon_key or "globe").strip().lower(),
        order_index=order_idx,
        is_active=link_in.is_active
    )
    db.add(link)
    db.commit()
    db.refresh(link)
    return link

@app.put("/api/social-links/reorder", status_code=status.HTTP_200_OK, tags=["Social Links"])
def reorder_social_links(
    items: List[SocialLinkReorderItem],
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Protected route: Batch update priority ordering for social links.
    """
    for item in items:
        db.query(SocialLink).filter(SocialLink.id == item.id).update(
            {"order_index": item.order_index},
            synchronize_session=False
        )
    db.commit()
    return {"status": "success", "message": "Social links reordered successfully."}

@app.put("/api/social-links/{link_id}", response_model=SocialLinkResponse, tags=["Social Links"])
def update_social_link(
    link_id: int,
    link_update: SocialLinkUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Protected route: Modify platform, label, destination URL, icon key, or active status.
    """
    link = db.query(SocialLink).filter(SocialLink.id == link_id).first()
    if not link:
        raise HTTPException(status_code=404, detail="Social link record not found.")

    update_data = (
        link_update.model_dump(exclude_unset=True)
        if hasattr(link_update, "model_dump")
        else link_update.dict(exclude_unset=True)
    )

    for field, value in update_data.items():
        if field == "url" and isinstance(value, str):
            value = normalize_url(value)
        elif field == "icon_key" and isinstance(value, str):
            value = value.strip().lower()
        elif isinstance(value, str):
            value = value.strip()
        setattr(link, field, value)

    link.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(link)
    return link

@app.patch("/api/social-links/{link_id}/toggle-status", response_model=SocialLinkResponse, tags=["Social Links"])
def toggle_social_link_status(
    link_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Protected route: Instantly toggle active/hidden status on public site.
    """
    link = db.query(SocialLink).filter(SocialLink.id == link_id).first()
    if not link:
        raise HTTPException(status_code=404, detail="Social link record not found.")

    link.is_active = not link.is_active
    db.commit()
    db.refresh(link)
    return link

@app.delete("/api/social-links/{link_id}", status_code=status.HTTP_200_OK, tags=["Social Links"])
def delete_social_link(
    link_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Protected route: Permanently eliminate a social link.
    """
    link = db.query(SocialLink).filter(SocialLink.id == link_id).first()
    if not link:
        raise HTTPException(status_code=404, detail="Social link record not found.")

    db.delete(link)
    db.commit()
    return {"status": "success", "message": f"Social link #{link_id} deleted."}

# ==========================================
# --- DYNAMIC CAPABILITIES & SERVICES ---
# ==========================================

@app.get("/api/capabilities", response_model=List[CapabilityCardResponse], tags=["Capabilities"])
def get_capabilities(
    active_only: bool = Query(False, description="Filter for active visible capability cards only"),
    db: Session = Depends(get_db)
):
    """
    Public route: Retrieve capability and value proposition cards for the portfolio showcase.
    When active_only=true, returns only live active cards ordered by sequence index.
    """
    query = db.query(CapabilityCard)
    if active_only:
        query = query.filter(CapabilityCard.is_active == True)
    return query.order_by(asc(CapabilityCard.order_index), asc(CapabilityCard.id)).all()

@app.post("/api/capabilities", response_model=CapabilityCardResponse, status_code=status.HTTP_201_CREATED, tags=["Capabilities"])
def create_capability(
    card_in: CapabilityCardCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Protected route: Register a new capability or value proposition card.
    """
    order_idx = card_in.order_index
    if order_idx == 0:
        max_idx = db.query(func.max(CapabilityCard.order_index)).scalar()
        order_idx = (max_idx + 1) if max_idx is not None else 0

    card = CapabilityCard(
        title=card_in.title.strip(),
        description=card_in.description.strip(),
        icon_key=(card_in.icon_key or "cpu").strip().lower(),
        accent_color=(card_in.accent_color or "cyan").strip().lower(),
        order_index=order_idx,
        is_active=card_in.is_active
    )
    db.add(card)
    db.commit()
    db.refresh(card)
    return card

@app.put("/api/capabilities/reorder", status_code=status.HTTP_200_OK, tags=["Capabilities"])
def reorder_capabilities(
    items: List[CapabilityReorderItem],
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Protected route: Batch update priority ordering for capability cards.
    """
    for item in items:
        db.query(CapabilityCard).filter(CapabilityCard.id == item.id).update(
            {"order_index": item.order_index},
            synchronize_session=False
        )
    db.commit()
    return {"status": "success", "message": "Capability cards reordered successfully."}

@app.put("/api/capabilities/{card_id}", response_model=CapabilityCardResponse, tags=["Capabilities"])
def update_capability(
    card_id: int,
    card_update: CapabilityCardUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Protected route: Modify card title, description, icon key, accent color, or active status.
    """
    card = db.query(CapabilityCard).filter(CapabilityCard.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Capability card not found.")

    update_data = (
        card_update.model_dump(exclude_unset=True)
        if hasattr(card_update, "model_dump")
        else card_update.dict(exclude_unset=True)
    )

    for field, value in update_data.items():
        if field in ("icon_key", "accent_color") and isinstance(value, str):
            value = value.strip().lower()
        elif isinstance(value, str):
            value = value.strip()
        setattr(card, field, value)

    card.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(card)
    return card

@app.patch("/api/capabilities/{card_id}/toggle-status", response_model=CapabilityCardResponse, tags=["Capabilities"])
def toggle_capability_status(
    card_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Protected route: Instantly toggle active/hidden status on the public hero section.
    """
    card = db.query(CapabilityCard).filter(CapabilityCard.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Capability card not found.")

    card.is_active = not card.is_active
    card.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(card)
    return card

@app.delete("/api/capabilities/{card_id}", status_code=status.HTTP_200_OK, tags=["Capabilities"])
def delete_capability(
    card_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Protected route: Permanently delete a capability card.
    """
    card = db.query(CapabilityCard).filter(CapabilityCard.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Capability card not found.")

    db.delete(card)
    db.commit()
    return {"status": "success", "message": f"Capability card #{card_id} deleted."}

# ==========================================
# --- DYNAMIC TECH STACK & SKILLS ENGINE ---
# ==========================================

@app.get("/api/tech-stack", response_model=List[StackCategoryResponse], tags=["Tech Stack & Skills"])
def get_tech_stack(
    active_only: bool = Query(False, description="Filter for active categories and active skill modules"),
    db: Session = Depends(get_db)
):
    """
    Public route: Retrieve technology stack categories with nested skill modules.
    When active_only=true, returns only live active categories with active skill items.
    """
    query = db.query(StackCategory)
    if active_only:
        query = query.filter(StackCategory.is_active == True)
    categories = query.order_by(asc(StackCategory.order_index), asc(StackCategory.id)).all()

    results = []
    for cat in categories:
        if active_only:
            items = [item for item in cat.items if item.is_active]
        else:
            items = list(cat.items)
        items_sorted = sorted(items, key=lambda x: (x.order_index, x.id))

        results.append(
            StackCategoryResponse(
                id=cat.id,
                title=cat.title,
                subtitle=cat.subtitle or "",
                icon_key=cat.icon_key,
                accent_color=cat.accent_color,
                order_index=cat.order_index,
                is_active=cat.is_active,
                created_at=cat.created_at,
                updated_at=cat.updated_at,
                items=[StackItemResponse.model_validate(i) for i in items_sorted]
            )
        )
    return results

# --- Category Endpoints ---

@app.post("/api/tech-stack/categories", response_model=StackCategoryResponse, status_code=status.HTTP_201_CREATED, tags=["Tech Stack & Skills"])
def create_stack_category(
    cat_in: StackCategoryCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Protected route: Create a new tech stack pillar/category."""
    order_idx = cat_in.order_index
    if order_idx == 0:
        max_order = db.query(func.max(StackCategory.order_index)).scalar() or 0
        order_idx = max_order + 1

    category = StackCategory(
        title=cat_in.title.strip().upper(),
        subtitle=(cat_in.subtitle or "").strip(),
        icon_key=(cat_in.icon_key or "cpu").strip().lower(),
        accent_color=(cat_in.accent_color or "cyan").strip().lower(),
        order_index=order_idx,
        is_active=cat_in.is_active
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return StackCategoryResponse(
        id=category.id,
        title=category.title,
        subtitle=category.subtitle or "",
        icon_key=category.icon_key,
        accent_color=category.accent_color,
        order_index=category.order_index,
        is_active=category.is_active,
        created_at=category.created_at,
        updated_at=category.updated_at,
        items=[]
    )

@app.put("/api/tech-stack/categories/reorder", status_code=status.HTTP_200_OK, tags=["Tech Stack & Skills"])
def reorder_stack_categories(
    items: List[StackReorderItem],
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Protected route: Batch update ordering of stack categories."""
    for item in items:
        db.query(StackCategory).filter(StackCategory.id == item.id).update(
            {"order_index": item.order_index, "updated_at": datetime.datetime.utcnow()}
        )
    db.commit()
    return {"status": "success", "message": "Stack categories successfully reordered."}

@app.put("/api/tech-stack/categories/{category_id}", response_model=StackCategoryResponse, tags=["Tech Stack & Skills"])
def update_stack_category(
    category_id: int,
    cat_in: StackCategoryUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Protected route: Update an existing stack category."""
    cat = db.query(StackCategory).filter(StackCategory.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Stack category not found.")

    if cat_in.title is not None:
        cat.title = cat_in.title.strip().upper()
    if cat_in.subtitle is not None:
        cat.subtitle = cat_in.subtitle.strip()
    if cat_in.icon_key is not None:
        cat.icon_key = cat_in.icon_key.strip().lower()
    if cat_in.accent_color is not None:
        cat.accent_color = cat_in.accent_color.strip().lower()
    if cat_in.order_index is not None:
        cat.order_index = cat_in.order_index
    if cat_in.is_active is not None:
        cat.is_active = cat_in.is_active

    cat.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(cat)

    items_sorted = sorted(cat.items, key=lambda x: (x.order_index, x.id))
    return StackCategoryResponse(
        id=cat.id,
        title=cat.title,
        subtitle=cat.subtitle or "",
        icon_key=cat.icon_key,
        accent_color=cat.accent_color,
        order_index=cat.order_index,
        is_active=cat.is_active,
        created_at=cat.created_at,
        updated_at=cat.updated_at,
        items=[StackItemResponse.model_validate(i) for i in items_sorted]
    )

@app.patch("/api/tech-stack/categories/{category_id}/toggle-status", response_model=StackCategoryResponse, tags=["Tech Stack & Skills"])
def toggle_stack_category_status(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Protected route: Toggle visibility of a category on the public portfolio."""
    cat = db.query(StackCategory).filter(StackCategory.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Stack category not found.")

    cat.is_active = not cat.is_active
    cat.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(cat)

    items_sorted = sorted(cat.items, key=lambda x: (x.order_index, x.id))
    return StackCategoryResponse(
        id=cat.id,
        title=cat.title,
        subtitle=cat.subtitle or "",
        icon_key=cat.icon_key,
        accent_color=cat.accent_color,
        order_index=cat.order_index,
        is_active=cat.is_active,
        created_at=cat.created_at,
        updated_at=cat.updated_at,
        items=[StackItemResponse.model_validate(i) for i in items_sorted]
    )

@app.delete("/api/tech-stack/categories/{category_id}", status_code=status.HTTP_200_OK, tags=["Tech Stack & Skills"])
def delete_stack_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Protected route: Permanently delete a category and all its nested skill items."""
    cat = db.query(StackCategory).filter(StackCategory.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Stack category not found.")

    db.delete(cat)
    db.commit()
    return {"status": "success", "message": f"Category #{category_id} and all associated skills deleted."}

# --- Skill Item Endpoints ---

@app.post("/api/tech-stack/items", response_model=StackItemResponse, status_code=status.HTTP_201_CREATED, tags=["Tech Stack & Skills"])
def create_stack_item(
    item_in: StackItemCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Protected route: Add a new skill module inside a target category."""
    cat = db.query(StackCategory).filter(StackCategory.id == item_in.category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Target stack category not found.")

    order_idx = item_in.order_index
    if order_idx == 0:
        max_order = db.query(func.max(StackItem.order_index)).filter(StackItem.category_id == item_in.category_id).scalar() or 0
        order_idx = max_order + 1

    item = StackItem(
        category_id=item_in.category_id,
        name=item_in.name.strip(),
        detail=(item_in.detail or "").strip(),
        order_index=order_idx,
        is_active=item_in.is_active
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@app.put("/api/tech-stack/items/reorder", status_code=status.HTTP_200_OK, tags=["Tech Stack & Skills"])
def reorder_stack_items(
    items: List[StackReorderItem],
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Protected route: Batch update ordering of skills within a category."""
    for it in items:
        db.query(StackItem).filter(StackItem.id == it.id).update(
            {"order_index": it.order_index, "updated_at": datetime.datetime.utcnow()}
        )
    db.commit()
    return {"status": "success", "message": "Skill items successfully reordered."}

@app.put("/api/tech-stack/items/{item_id}", response_model=StackItemResponse, tags=["Tech Stack & Skills"])
def update_stack_item(
    item_id: int,
    item_in: StackItemUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Protected route: Update an individual skill module."""
    item = db.query(StackItem).filter(StackItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Skill item not found.")

    if item_in.category_id is not None:
        target_cat = db.query(StackCategory).filter(StackCategory.id == item_in.category_id).first()
        if not target_cat:
            raise HTTPException(status_code=404, detail="Target stack category not found.")
        item.category_id = item_in.category_id

    if item_in.name is not None:
        item.name = item_in.name.strip()
    if item_in.detail is not None:
        item.detail = item_in.detail.strip()
    if item_in.order_index is not None:
        item.order_index = item_in.order_index
    if item_in.is_active is not None:
        item.is_active = item_in.is_active

    item.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(item)
    return item

@app.patch("/api/tech-stack/items/{item_id}/toggle-status", response_model=StackItemResponse, tags=["Tech Stack & Skills"])
def toggle_stack_item_status(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Protected route: Toggle visibility of a skill module."""
    item = db.query(StackItem).filter(StackItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Skill item not found.")

    item.is_active = not item.is_active
    item.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(item)
    return item

@app.delete("/api/tech-stack/items/{item_id}", status_code=status.HTTP_200_OK, tags=["Tech Stack & Skills"])
def delete_stack_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Protected route: Delete an individual skill module."""
    item = db.query(StackItem).filter(StackItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Skill item not found.")

    db.delete(item)
    db.commit()
    return {"status": "success", "message": f"Skill item #{item_id} deleted."}

# ==========================================
# --- DYNAMIC CONTACT & AVAILABILITY MATRIX ---
# ==========================================

@app.get("/api/contact-matrix", response_model=ContactMatrixResponse, tags=["Contact Matrix"])
@app.get("/api/public/contact-matrix", response_model=ContactMatrixResponse, tags=["Contact Matrix"], include_in_schema=False)
def get_contact_matrix(db: Session = Depends(get_db)):
    """
    Public route: Retrieve the singleton Node Contact Matrix configuration.
    Initializes default singleton row if not yet present in database.
    """
    config = db.query(ContactMatrixConfig).filter(ContactMatrixConfig.id == 1).first()
    if not config:
        config = ContactMatrixConfig(
            id=1,
            matrix_title="NODE CONTACT MATRIX",
            availability_badge="OPEN FOR CONTRACTS",
            is_available=True,
            email="daniyalayazahmed@gmail.com",
            location="Karachi, Pakistan (Global Remote)",
            timezone="PKT (UTC+5) // Async Availability",
            security_title="ZERO-LEAK DIRECT PERSISTENCE",
            security_description="Inquiries are securely piped directly to the private database without third-party mail brokers or tracking scripts.",
            show_security_card=True,
            whatsapp_number="",
            whatsapp_url="",
            show_whatsapp=True
        )
        db.add(config)
        db.commit()
        db.refresh(config)
    return config

@app.put("/api/contact-matrix", response_model=ContactMatrixResponse, tags=["Contact Matrix"])
def update_contact_matrix(
    matrix_in: ContactMatrixUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Protected route: Update Node Contact Matrix and availability status.
    """
    config = db.query(ContactMatrixConfig).filter(ContactMatrixConfig.id == 1).first()
    if not config:
        config = ContactMatrixConfig(id=1)
        db.add(config)
        db.commit()
        db.refresh(config)

    updates = matrix_in.model_dump(exclude_unset=True)
    for field, value in updates.items():
        if value is not None:
            if field == "whatsapp_url" and isinstance(value, str):
                setattr(config, field, normalize_whatsapp_url(value))
            elif isinstance(value, str):
                setattr(config, field, value.strip())
            else:
                setattr(config, field, value)

    config.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(config)
    return config

# ==========================================
# --- PRODUCTION IMPACT METRICS TELEMETRY ---
# ==========================================

@app.get("/api/metrics", response_model=List[ImpactMetricResponse], tags=["Impact Metrics"])
@app.get("/api/public/metrics", response_model=List[ImpactMetricResponse], tags=["Impact Metrics"], include_in_schema=False)
def get_public_metrics(db: Session = Depends(get_db)):
    """
    Public route: Returns active impact telemetry metrics ordered by sequence.
    """
    return (
        db.query(ImpactMetric)
        .filter(ImpactMetric.is_active == True)
        .order_by(asc(ImpactMetric.order_index), asc(ImpactMetric.id))
        .all()
    )

@app.get("/api/admin/metrics", response_model=List[ImpactMetricResponse], tags=["Impact Metrics"])
def get_admin_metrics(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Protected route: Returns all impact telemetry metrics (active + hidden) ordered by sequence.
    """
    return (
        db.query(ImpactMetric)
        .order_by(asc(ImpactMetric.order_index), asc(ImpactMetric.id))
        .all()
    )

@app.post("/api/metrics", response_model=ImpactMetricResponse, status_code=status.HTTP_201_CREATED, tags=["Impact Metrics"])
def create_impact_metric(
    metric_in: ImpactMetricCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Protected route: Create a new impact telemetry metric card.
    """
    order_idx = metric_in.order_index
    if order_idx == 0:
        max_idx = db.query(func.max(ImpactMetric.order_index)).scalar()
        order_idx = (max_idx + 1) if max_idx is not None else 0

    metric = ImpactMetric(
        metric_value=metric_in.metric_value.strip(),
        metric_label=metric_in.metric_label.strip(),
        sub_context=(metric_in.sub_context or "").strip(),
        accent_color=(metric_in.accent_color or "cyan").strip().lower(),
        order_index=order_idx,
        is_active=metric_in.is_active
    )
    db.add(metric)
    db.commit()
    db.refresh(metric)
    return metric

@app.put("/api/metrics/reorder", status_code=status.HTTP_200_OK, tags=["Impact Metrics"])
def reorder_impact_metrics(
    items: List[ImpactMetricReorderItem],
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Protected route: Batch update ordering sequences for impact telemetry metrics.
    """
    for item in items:
        db.query(ImpactMetric).filter(ImpactMetric.id == item.id).update(
            {"order_index": item.order_index, "updated_at": datetime.datetime.utcnow()},
            synchronize_session=False
        )
    db.commit()
    return {"status": "success", "message": "Impact metrics successfully reordered."}

@app.put("/api/metrics/{metric_id}", response_model=ImpactMetricResponse, tags=["Impact Metrics"])
def update_impact_metric(
    metric_id: int,
    metric_update: ImpactMetricUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Protected route: Modify metric value, label, sub_context, accent color, order_index, or is_active.
    """
    metric = db.query(ImpactMetric).filter(ImpactMetric.id == metric_id).first()
    if not metric:
        raise HTTPException(status_code=404, detail="Impact metric not found.")

    update_data = (
        metric_update.model_dump(exclude_unset=True)
        if hasattr(metric_update, "model_dump")
        else metric_update.dict(exclude_unset=True)
    )

    for field, value in update_data.items():
        if field == "accent_color" and isinstance(value, str):
            value = value.strip().lower()
        elif isinstance(value, str):
            value = value.strip()
        setattr(metric, field, value)

    metric.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(metric)
    return metric

@app.patch("/api/metrics/{metric_id}/toggle-status", response_model=ImpactMetricResponse, tags=["Impact Metrics"])
def toggle_impact_metric_status(
    metric_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Protected route: Instantly toggle active/hidden visibility on public telemetry bar.
    """
    metric = db.query(ImpactMetric).filter(ImpactMetric.id == metric_id).first()
    if not metric:
        raise HTTPException(status_code=404, detail="Impact metric not found.")

    metric.is_active = not metric.is_active
    metric.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(metric)
    return metric

@app.delete("/api/metrics/{metric_id}", status_code=status.HTTP_200_OK, tags=["Impact Metrics"])
def delete_impact_metric(
    metric_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Protected route: Permanently delete an impact telemetry metric.
    """
    metric = db.query(ImpactMetric).filter(ImpactMetric.id == metric_id).first()
    if not metric:
        raise HTTPException(status_code=404, detail="Impact metric not found.")

    db.delete(metric)
    db.commit()
    return {"status": "success", "message": f"Impact metric #{metric_id} deleted."}

# ==========================================
# --- CLIENT TESTIMONIALS & REVIEWS ---
# ==========================================

@app.get("/api/testimonials", response_model=List[TestimonialResponse], tags=["Testimonials"])
@app.get("/api/public/testimonials", response_model=List[TestimonialResponse], tags=["Testimonials"], include_in_schema=False)
def get_public_testimonials(db: Session = Depends(get_db)):
    """
    Public route: Returns active verified client testimonials ordered by sequence.
    """
    return (
        db.query(Testimonial)
        .filter(Testimonial.is_active == True)
        .order_by(asc(Testimonial.order_index), asc(Testimonial.id))
        .all()
    )

@app.get("/api/admin/testimonials", response_model=List[TestimonialResponse], tags=["Testimonials"])
def get_admin_testimonials(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Protected route: Returns all client testimonials (active + hidden) ordered by sequence.
    """
    return (
        db.query(Testimonial)
        .order_by(asc(Testimonial.order_index), asc(Testimonial.id))
        .all()
    )

@app.post("/api/testimonials", response_model=TestimonialResponse, status_code=status.HTTP_201_CREATED, tags=["Testimonials"])
def create_testimonial(
    test_in: TestimonialCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Protected route: Create a new verified client review card.
    """
    order_idx = test_in.order_index
    if order_idx == 0:
        max_idx = db.query(func.max(Testimonial.order_index)).scalar()
        order_idx = (max_idx + 1) if max_idx is not None else 0

    testimonial = Testimonial(
        client_name=test_in.client_name.strip(),
        client_role=(test_in.client_role or "").strip(),
        platform_badge=(test_in.platform_badge or "Enterprise Client").strip(),
        badge_color=(test_in.badge_color or "emerald").strip().lower(),
        rating=max(1, min(5, test_in.rating or 5)),
        review_text=test_in.review_text.strip(),
        project_ref=(test_in.project_ref or "").strip(),
        order_index=order_idx,
        is_active=test_in.is_active
    )
    db.add(testimonial)
    db.commit()
    db.refresh(testimonial)
    return testimonial

@app.put("/api/testimonials/reorder", status_code=status.HTTP_200_OK, tags=["Testimonials"])
def reorder_testimonials(
    items: List[TestimonialReorderItem],
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Protected route: Batch update ordering sequences for client testimonials.
    """
    for item in items:
        db.query(Testimonial).filter(Testimonial.id == item.id).update(
            {"order_index": item.order_index},
            synchronize_session=False
        )
    db.commit()
    return {"status": "success", "message": "Testimonials successfully reordered."}

@app.put("/api/testimonials/{testimonial_id}", response_model=TestimonialResponse, tags=["Testimonials"])
def update_testimonial(
    testimonial_id: int,
    test_update: TestimonialUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Protected route: Modify testimonial details, ratings, platform badges, or visibility.
    """
    testimonial = db.query(Testimonial).filter(Testimonial.id == testimonial_id).first()
    if not testimonial:
        raise HTTPException(status_code=404, detail="Testimonial not found.")

    update_data = (
        test_update.model_dump(exclude_unset=True)
        if hasattr(test_update, "model_dump")
        else test_update.dict(exclude_unset=True)
    )

    for field, value in update_data.items():
        if field == "rating" and value is not None:
            value = max(1, min(5, int(value)))
        elif field == "badge_color" and isinstance(value, str):
            value = value.strip().lower()
        elif isinstance(value, str):
            value = value.strip()
        setattr(testimonial, field, value)

    db.commit()
    db.refresh(testimonial)
    return testimonial

@app.patch("/api/testimonials/{testimonial_id}/toggle-status", response_model=TestimonialResponse, tags=["Testimonials"])
def toggle_testimonial_status(
    testimonial_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Protected route: Instantly toggle active/hidden visibility on public portfolio.
    """
    testimonial = db.query(Testimonial).filter(Testimonial.id == testimonial_id).first()
    if not testimonial:
        raise HTTPException(status_code=404, detail="Testimonial not found.")

    testimonial.is_active = not testimonial.is_active
    db.commit()
    db.refresh(testimonial)
    return testimonial

@app.delete("/api/testimonials/{testimonial_id}", status_code=status.HTTP_200_OK, tags=["Testimonials"])
def delete_testimonial(
    testimonial_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Protected route: Permanently delete a client testimonial.
    """
    testimonial = db.query(Testimonial).filter(Testimonial.id == testimonial_id).first()
    if not testimonial:
        raise HTTPException(status_code=404, detail="Testimonial not found.")

    db.delete(testimonial)
    db.commit()
    return {"status": "success", "message": f"Testimonial #{testimonial_id} deleted."}

# ==========================================
# --- ENGAGEMENT MODELS ("HOW WE WORK") ---
# ==========================================

@app.get("/api/engagements", response_model=List[EngagementModelResponse], tags=["Engagement Models"])
@app.get("/api/public/engagements", response_model=List[EngagementModelResponse], tags=["Engagement Models"], include_in_schema=False)
def get_public_engagements(db: Session = Depends(get_db)):
    """
    Public route: Returns active engagement models ordered by sequence.
    """
    return (
        db.query(EngagementModel)
        .filter(EngagementModel.is_active == True)
        .order_by(asc(EngagementModel.order_index), asc(EngagementModel.id))
        .all()
    )

@app.get("/api/admin/engagements", response_model=List[EngagementModelResponse], tags=["Engagement Models"])
def get_admin_engagements(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Protected route: Returns all engagement models (active + hidden) ordered by sequence.
    """
    return (
        db.query(EngagementModel)
        .order_by(asc(EngagementModel.order_index), asc(EngagementModel.id))
        .all()
    )

@app.post("/api/engagements", response_model=EngagementModelResponse, status_code=status.HTTP_201_CREATED, tags=["Engagement Models"])
def create_engagement(
    tier_in: EngagementModelCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Protected route: Create a new engagement scope tier.
    """
    order_idx = tier_in.order_index
    if order_idx == 0:
        max_idx = db.query(func.max(EngagementModel.order_index)).scalar()
        order_idx = (max_idx + 1) if max_idx is not None else 0

    deliverables_str = (
        json.dumps(tier_in.deliverables)
        if isinstance(tier_in.deliverables, list)
        else str(tier_in.deliverables or "[]")
    )

    tier = EngagementModel(
        tier_badge=tier_in.tier_badge.strip(),
        title=tier_in.title.strip(),
        timeline=tier_in.timeline.strip(),
        summary=tier_in.summary.strip(),
        deliverables=deliverables_str,
        accent_color=(tier_in.accent_color or "cyan").strip().lower(),
        is_featured=tier_in.is_featured or False,
        inquiry_subject=tier_in.inquiry_subject.strip(),
        order_index=order_idx,
        is_active=tier_in.is_active
    )
    db.add(tier)
    db.commit()
    db.refresh(tier)
    return tier

@app.put("/api/engagements/reorder", status_code=status.HTTP_200_OK, tags=["Engagement Models"])
def reorder_engagements(
    items: List[EngagementModelReorderItem],
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Protected route: Batch update priority order for engagement scope tiers.
    """
    for item in items:
        db.query(EngagementModel).filter(EngagementModel.id == item.id).update(
            {"order_index": item.order_index},
            synchronize_session=False
        )
    db.commit()
    return {"status": "success", "message": "Engagement tiers successfully reordered."}

@app.put("/api/engagements/{model_id}", response_model=EngagementModelResponse, tags=["Engagement Models"])
def update_engagement(
    model_id: int,
    tier_update: EngagementModelUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Protected route: Modify tier badge, title, timeline, summary, deliverables, or visibility.
    """
    tier = db.query(EngagementModel).filter(EngagementModel.id == model_id).first()
    if not tier:
        raise HTTPException(status_code=404, detail="Engagement tier not found.")

    update_data = (
        tier_update.model_dump(exclude_unset=True)
        if hasattr(tier_update, "model_dump")
        else tier_update.dict(exclude_unset=True)
    )

    for field, value in update_data.items():
        if field == "deliverables" and value is not None:
            value = json.dumps(value) if isinstance(value, list) else str(value)
        elif field == "accent_color" and isinstance(value, str):
            value = value.strip().lower()
        elif isinstance(value, str):
            value = value.strip()
        setattr(tier, field, value)

    db.commit()
    db.refresh(tier)
    return tier

@app.patch("/api/engagements/{model_id}/toggle-status", response_model=EngagementModelResponse, tags=["Engagement Models"])
def toggle_engagement_status(
    model_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Protected route: Instantly toggle active/hidden visibility on public portfolio.
    """
    tier = db.query(EngagementModel).filter(EngagementModel.id == model_id).first()
    if not tier:
        raise HTTPException(status_code=404, detail="Engagement tier not found.")

    tier.is_active = not tier.is_active
    db.commit()
    db.refresh(tier)
    return tier

@app.delete("/api/engagements/{model_id}", status_code=status.HTTP_200_OK, tags=["Engagement Models"])
def delete_engagement(
    model_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Protected route: Permanently delete an engagement tier.
    """
    tier = db.query(EngagementModel).filter(EngagementModel.id == model_id).first()
    if not tier:
        raise HTTPException(status_code=404, detail="Engagement tier not found.")

    db.delete(tier)
    db.commit()
    return {"status": "success", "message": f"Engagement tier #{model_id} deleted."}







# ==========================================
# --- TELEMETRY & AUDIENCE INTELLIGENCE ---
# ==========================================

def format_time_ago(dt: datetime.datetime) -> str:
    now = datetime.datetime.utcnow()
    diff = now - dt
    seconds = max(0, int(diff.total_seconds()))
    if seconds < 10:
        return "Just now"
    elif seconds < 60:
        return f"{seconds}s ago"
    elif seconds < 3600:
        return f"{seconds // 60}m ago"
    elif seconds < 86400:
        return f"{seconds // 3600}h ago"
    else:
        return f"{seconds // 86400}d ago"

@app.post("/api/telemetry/visit", status_code=status.HTTP_201_CREATED, tags=["Visitor Telemetry"])
def record_visitor_transmission(
    visit_in: TelemetryVisitRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Public ingestion route: Silently captures anonymized visitor telemetry packet.
    Strictly filters out internal admin, login, and system routes to preserve data purity.
    GDPR-compliant salted IP hash and zero third-party footprint.
    """
    page_path = (visit_in.page_path or "/").strip()

    # Server-side guard: Exclude internal administration and auth routes
    if is_internal_route(page_path):
        return {
            "status": "ignored",
            "reason": "internal_route_exclusion",
            "page_path": page_path
        }

    raw_ua = visit_in.user_agent or request.headers.get("user-agent") or ""
    headers_dict = {k.lower(): v for k, v in request.headers.items()}
    client_ip = extract_client_ip(headers_dict, request.client.host if request.client else "127.0.0.1")

    # Allow test suites to explicitly bypass filters when verifying ingestion
    is_test_sim = (
        headers_dict.get("x-test-telemetry") == "true" or
        os.getenv("TRACK_LOCALHOST", "false").lower() == "true"
    )

    # Server-side guard: Exclude automated bots, scrapers, and headless agents
    if not is_test_sim and is_bot_user_agent(raw_ua):
        return {
            "status": "ignored",
            "reason": "bot_excluded",
            "user_agent": raw_ua[:50]
        }

    # Server-side guard: Exclude localhost and internal development traffic
    if not is_test_sim and is_localhost_ip(client_ip):
        return {
            "status": "ignored",
            "reason": "localhost_excluded",
            "client_ip": client_ip
        }

    ip_hash = hash_client_ip(client_ip)
    country, city = extract_geo_location(headers_dict, client_ip)
    device_type, browser, os_name = parse_user_agent(raw_ua, visit_in.screen_width)
    normalized_ref = normalize_referrer(visit_in.referrer)

    visit_session = VisitorSession(
        session_id=visit_in.session_id,
        ip_hash=ip_hash,
        country=country,
        city=city,
        page_path=page_path,
        referrer=normalized_ref,
        device_type=device_type,
        browser=browser,
        os=os_name,
        screen_width=visit_in.screen_width,
        duration_seconds=0
    )
    db.add(visit_session)
    db.commit()
    db.refresh(visit_session)

    return {
        "status": "recorded",
        "session_id": visit_in.session_id,
        "transmission_id": visit_session.id
    }

@app.post("/api/telemetry/heartbeat", tags=["Visitor Telemetry"])
def record_session_heartbeat(
    heartbeat_in: TelemetryHeartbeatRequest,
    db: Session = Depends(get_db)
):
    """
    Public heartbeat route: Accumulates time-on-page duration for active browser sessions.
    Gracefully ignores heartbeats for excluded internal sessions.
    """
    records = db.query(VisitorSession).filter(VisitorSession.session_id == heartbeat_in.session_id).all()
    if not records:
        return {
            "status": "ignored",
            "reason": "session_not_found_or_excluded",
            "session_id": heartbeat_in.session_id
        }

    for r in records:
        if heartbeat_in.duration_seconds > (r.duration_seconds or 0):
            r.duration_seconds = heartbeat_in.duration_seconds
    db.commit()

    return {
        "status": "updated",
        "session_id": heartbeat_in.session_id,
        "duration_seconds": heartbeat_in.duration_seconds
    }

@app.get("/api/telemetry/overview", response_model=TelemetryOverviewResponse, tags=["Audience Analytics"])
def get_telemetry_overview(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Admin route: High-level audience metrics, uniques across time windows, and engagement."""
    total_views = db.query(VisitorSession).count()
    unique_sessions_total = db.query(func.count(func.distinct(VisitorSession.session_id))).scalar() or 0

    now = datetime.datetime.utcnow()
    t_24h = now - datetime.timedelta(hours=24)
    t_7d = now - datetime.timedelta(days=7)
    t_30d = now - datetime.timedelta(days=30)

    unique_24h = db.query(func.count(func.distinct(VisitorSession.session_id))).filter(VisitorSession.created_at >= t_24h).scalar() or 0
    unique_7d = db.query(func.count(func.distinct(VisitorSession.session_id))).filter(VisitorSession.created_at >= t_7d).scalar() or 0
    unique_30d = db.query(func.count(func.distinct(VisitorSession.session_id))).filter(VisitorSession.created_at >= t_30d).scalar() or 0

    avg_dur = db.query(func.avg(VisitorSession.duration_seconds)).filter(VisitorSession.duration_seconds > 0).scalar()
    avg_duration_seconds = int(avg_dur) if avg_dur else 0

    # Bounce rate: sessions with duration < 10 seconds / total sessions
    if unique_sessions_total > 0:
        bounces = db.query(func.count(func.distinct(VisitorSession.session_id))).filter(VisitorSession.duration_seconds < 10).scalar() or 0
        bounce_rate = round((bounces / unique_sessions_total) * 100, 1)
    else:
        bounce_rate = 0.0

    # Total distinct countries
    total_countries = db.query(func.count(func.distinct(VisitorSession.country))).filter(
        VisitorSession.country.isnot(None),
        VisitorSession.country != "Unknown"
    ).scalar() or 0

    # Top Referrer Channel
    top_ref_row = db.query(VisitorSession.referrer, func.count(VisitorSession.id).label("cnt")).group_by(
        VisitorSession.referrer
    ).order_by(desc("cnt")).first()

    if top_ref_row and total_views > 0:
        top_referrer = top_ref_row[0]
        top_referrer_percent = round((top_ref_row[1] / total_views) * 100, 1)
    else:
        top_referrer = "No Data"
        top_referrer_percent = 0.0

    return {
        "total_views": total_views,
        "unique_sessions_total": unique_sessions_total,
        "unique_sessions_24h": unique_24h,
        "unique_sessions_7d": unique_7d,
        "unique_sessions_30d": unique_30d,
        "avg_duration_seconds": avg_duration_seconds,
        "bounce_rate": bounce_rate,
        "total_countries": total_countries,
        "top_referrer": top_referrer,
        "top_referrer_percent": top_referrer_percent
    }

@app.get("/api/telemetry/sources", response_model=TelemetrySourcesResponse, tags=["Audience Analytics"])
def get_telemetry_sources(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Admin route: Referral channels and traffic acquisition percentages."""
    total_views = db.query(VisitorSession).count()
    if total_views == 0:
        return {"sources": []}

    rows = db.query(
        VisitorSession.referrer,
        func.count(VisitorSession.id).label("count")
    ).group_by(VisitorSession.referrer).order_by(desc("count")).all()

    sources = [
        TelemetryDistributionItem(
            name=row[0] or "Direct",
            count=row[1],
            percentage=round((row[1] / total_views) * 100, 1)
        )
        for row in rows
    ]
    return {"sources": sources}

@app.get("/api/telemetry/locations", response_model=TelemetryLocationsResponse, tags=["Audience Analytics"])
def get_telemetry_locations(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Admin route: Geographic audience distribution by country and top cities."""
    total_views = db.query(VisitorSession).count()
    if total_views == 0:
        return {"countries": [], "cities": []}

    c_rows = db.query(
        VisitorSession.country,
        func.count(VisitorSession.id).label("count")
    ).group_by(VisitorSession.country).order_by(desc("count")).limit(10).all()

    countries = [
        TelemetryDistributionItem(
            name=row[0] or "Unknown",
            count=row[1],
            percentage=round((row[1] / total_views) * 100, 1)
        )
        for row in c_rows
    ]

    city_rows = db.query(
        VisitorSession.city,
        VisitorSession.country,
        func.count(VisitorSession.id).label("count")
    ).group_by(VisitorSession.city, VisitorSession.country).order_by(desc("count")).limit(12).all()

    cities = [
        TelemetryCityItem(
            city=row[0] or "Unknown",
            country=row[1] or "Unknown",
            count=row[2]
        )
        for row in city_rows
    ]

    return {"countries": countries, "cities": cities}

@app.get("/api/telemetry/devices", response_model=TelemetryDevicesResponse, tags=["Audience Analytics"])
def get_telemetry_devices(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Admin route: Device types, browser share, and operating system matrix."""
    total_views = db.query(VisitorSession).count()
    if total_views == 0:
        return {"device_types": [], "browsers": [], "operating_systems": []}

    def calc_dist(column):
        rows = db.query(column, func.count(VisitorSession.id).label("cnt")).group_by(column).order_by(desc("cnt")).all()
        return [
            TelemetryDistributionItem(
                name=row[0] or "Other",
                count=row[1],
                percentage=round((row[1] / total_views) * 100, 1)
            )
            for row in rows
        ]

    return {
        "device_types": calc_dist(VisitorSession.device_type),
        "browsers": calc_dist(VisitorSession.browser),
        "operating_systems": calc_dist(VisitorSession.os)
    }

@app.get("/api/telemetry/live", response_model=List[TelemetryLiveItem], tags=["Audience Analytics"])
def get_telemetry_live(
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Admin route: Real-time incoming visitor transmissions with relative timestamps."""
    records = db.query(VisitorSession).order_by(desc(VisitorSession.id)).limit(limit).all()

    return [
        TelemetryLiveItem(
            id=r.id,
            session_id=r.session_id,
            page_path=r.page_path,
            referrer=r.referrer,
            country=r.country,
            city=r.city,
            device_type=r.device_type,
            browser=r.browser,
            os=r.os,
            duration_seconds=r.duration_seconds,
            created_at=r.created_at,
            time_ago=format_time_ago(r.created_at)
        )
        for r in records
    ]

@app.delete("/api/telemetry/purge", tags=["Audience Analytics"])
def purge_telemetry_records(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Admin route: Flushes historical visitor telemetry transmissions."""
    deleted_count = db.query(VisitorSession).delete()
    try:
        db.execute(text("DELETE FROM sqlite_sequence WHERE name = 'visitor_sessions';"))
    except Exception:
        pass
    db.commit()
    return {
        "status": "purged",
        "deleted_count": deleted_count,
        "message": f"Successfully wiped {deleted_count} visitor telemetry transmissions."
    }

# --- SPA CLIENT FALLBACK (Catch-All) ---
# Serves index.html or static assets for client-side routing on all non-API, non-Uploads paths
@app.get("/{full_path:path}", include_in_schema=False)
async def serve_spa_fallback(full_path: str):
    # Strictly isolate API and Uploads paths so unmatched routes return 404 JSON instead of HTML
    if (
        full_path == "api"
        or full_path.startswith("api/")
        or full_path == "uploads"
        or full_path.startswith("uploads/")
        or full_path in ("docs", "redoc", "openapi.json")
    ):
        raise HTTPException(status_code=404, detail="Resource not found")

    dist_dir = get_static_dist_dir()
    if dist_dir:
        # Check if the requested path corresponds to an exact static file in dist (e.g. vite.svg, favicon.ico)
        target_file = os.path.join(dist_dir, full_path)
        if os.path.isfile(target_file):
            return FileResponse(target_file)

        # SPA Fallback: serve index.html for React Router / client-side paths
        index_file = os.path.join(dist_dir, "index.html")
        if os.path.isfile(index_file):
            return FileResponse(index_file)

    raise HTTPException(status_code=404, detail="Resource not found")


