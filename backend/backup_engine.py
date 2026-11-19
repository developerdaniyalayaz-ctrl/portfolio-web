import os
import sqlite3
import datetime
import gzip
import shutil
import glob
from typing import List, Dict, Optional

from database import DEFAULT_DB_PATH, BASE_DIR
BACKUPS_DIR = os.path.join(BASE_DIR, "backups")
os.makedirs(BACKUPS_DIR, exist_ok=True)

def prune_old_snapshots(backup_dir: str = BACKUPS_DIR, max_age_days: int = 7) -> List[str]:
    """
    Retention Policy: Removes database snapshots older than `max_age_days`.
    Returns list of deleted archive paths.
    """
    if not os.path.exists(backup_dir):
        return []

    cutoff_time = datetime.datetime.utcnow() - datetime.timedelta(days=max_age_days)
    pattern = os.path.join(backup_dir, "portfolio_snapshot_*.db.gz")
    pruned_files = []

    for file_path in glob.glob(pattern):
        try:
            mtime = datetime.datetime.utcfromtimestamp(os.path.getmtime(file_path))
            if mtime < cutoff_time:
                os.remove(file_path)
                pruned_files.append(file_path)
                print(f"[Backup Pruner] Purged expired snapshot: {os.path.basename(file_path)}")
        except Exception as e:
            print(f"[Backup Pruner Warning] Failed to inspect/delete {file_path}: {e}")

    return pruned_files

def create_snapshot(
    source_db_path: str = DEFAULT_DB_PATH,
    backup_dir: str = BACKUPS_DIR,
    max_age_days: int = 7
) -> str:
    """
    1. Creates a live online atomic backup using SQLite's native C-level backup API.
    2. Compresses the snapshot into a .gz archive.
    3. Removes the temporary uncompressed .db file.
    4. Enforces the 7-day retention policy.
    Returns the absolute path to the generated .db.gz archive.
    """
    os.makedirs(backup_dir, exist_ok=True)

    if not os.path.exists(source_db_path):
        raise FileNotFoundError(f"Source database not found at: {source_db_path}")

    timestamp = datetime.datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    raw_filename = f"portfolio_snapshot_{timestamp}.db"
    raw_path = os.path.join(backup_dir, raw_filename)
    gz_filename = f"{raw_filename}.gz"
    gz_path = os.path.join(backup_dir, gz_filename)

    print(f"[Backup Engine] Starting atomic SQLite snapshot -> {raw_filename} ...")

    # Step 1: Atomic Online Backup
    # Opens source in read-only URI mode and backs up pages safely into destination
    source_conn = sqlite3.connect(f"file:{source_db_path}?mode=ro", uri=True)
    dest_conn = sqlite3.connect(raw_path)
    try:
        source_conn.backup(dest_conn, pages=100)
    finally:
        dest_conn.close()
        source_conn.close()

    raw_size = os.path.getsize(raw_path)

    # Step 2: Gzip compression
    print(f"[Backup Engine] Compressing {raw_size} bytes into {gz_filename} ...")
    with open(raw_path, "rb") as f_in:
        with gzip.open(gz_path, "wb", compresslevel=9) as f_out:
            shutil.copyfileobj(f_in, f_out)

    gz_size = os.path.getsize(gz_path)
    compression_ratio = ((raw_size - gz_size) / raw_size * 100) if raw_size > 0 else 0

    # Step 3: Remove raw temporary snapshot
    if os.path.exists(raw_path):
        os.remove(raw_path)

    # Step 4: Prune expired archives
    prune_old_snapshots(backup_dir, max_age_days=max_age_days)

    print(f"[Backup Engine] Snapshot created successfully: {gz_filename} ({gz_size} bytes, -{compression_ratio:.1f}%)")
    return gz_path

def get_backup_metadata(backup_dir: str = BACKUPS_DIR) -> Dict:
    """Returns summary statistics for existing database snapshots."""
    if not os.path.exists(backup_dir):
        return {"total_snapshots": 0, "total_size_bytes": 0, "latest_snapshot": None}

    pattern = os.path.join(backup_dir, "portfolio_snapshot_*.db.gz")
    files = sorted(glob.glob(pattern), key=os.path.getmtime, reverse=True)
    total_size = sum(os.path.getsize(f) for f in files)

    latest = None
    if files:
        latest = {
            "filename": os.path.basename(files[0]),
            "path": files[0],
            "size_bytes": os.path.getsize(files[0]),
            "created_at": datetime.datetime.utcfromtimestamp(os.path.getmtime(files[0])).isoformat() + "Z"
        }

    return {
        "total_snapshots": len(files),
        "total_size_bytes": total_size,
        "latest_snapshot": latest
    }

if __name__ == "__main__":
    print("Executing manual SQLite backup snapshot test...")
    archive_path = create_snapshot()
    print(f"Verified generated archive: {archive_path}")
    meta = get_backup_metadata()
    print("Backup Metadata:", meta)
