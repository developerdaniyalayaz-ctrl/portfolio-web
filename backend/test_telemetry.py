"""
Automated Telemetry & Audience Intelligence Verification Script.
Simulates realistic visitor transmissions, heartbeats, and asserts analytics accuracy.
"""

import sys
import os
import time
import requests
import subprocess
import uuid

def run_tests():
    print("=" * 70)
    print(" [TEST RUNNER] TELEMETRY & AUDIENCE INTELLIGENCE VERIFICATION")
    print("=" * 70)

    # 1. Start backend process on test port
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "main:app", "--port", "8011", "--log-level", "warning"],
        cwd=backend_dir
    )

    time.sleep(3)
    base_url = "http://127.0.0.1:8011"

    try:
        # Step 1: Authenticate Superadmin (generate valid signed token for active admin)
        print("\n[1] Authenticating Superadmin token...")
        sys.path.insert(0, backend_dir)
        from database import SessionLocal
        from models import AdminUser
        from auth import create_access_token

        with SessionLocal() as db:
            admin = db.query(AdminUser).first()
            admin_username = admin.username if admin else "admin"

        token = create_access_token(data={"sub": admin_username, "role": "superadmin"})
        headers = {"Authorization": f"Bearer {token}"}
        print(f"  [+] Superadmin JWT token issued for operator '{admin_username}'.")

        # Step 2: Clean slate for testing
        print("\n[2] Resetting telemetry buffer for clean baseline test...")
        del_res = requests.delete(f"{base_url}/api/telemetry/purge", headers=headers)
        assert del_res.status_code == 200, f"Purge failed: {del_res.text}"
        print(f"  [+] Purge verified: {del_res.json()}")

        # Step 3: Simulate realistic visitor transmissions
        print("\n[3] Ingesting simulated visitor transmissions...")
        sessions = [
            {
                "session_id": str(uuid.uuid4()),
                "page_path": "/",
                "referrer": "https://www.linkedin.com/in/cyber-dev",
                "screen_width": 1920,
                "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                "country": "United States",
                "city": "San Francisco",
                "ip": "198.51.100.10",
                "duration": 135
            },
            {
                "session_id": str(uuid.uuid4()),
                "page_path": "/projects/advocate-diary",
                "referrer": "https://github.com/kingsdaniyalayaz-droid",
                "screen_width": 390,
                "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Mobile/15E148 Safari/604.1",
                "country": "United Kingdom",
                "city": "London",
                "ip": "203.0.113.45",
                "duration": 48
            },
            {
                "session_id": str(uuid.uuid4()),
                "page_path": "/projects/video-ai-assistant",
                "referrer": "https://www.google.com/search?q=fullstack+ai+architect",
                "screen_width": 820,
                "user_agent": "Mozilla/5.0 (iPad; CPU OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
                "country": "Germany",
                "city": "Berlin",
                "ip": "198.51.100.88",
                "duration": 210
            },
            {
                "session_id": str(uuid.uuid4()),
                "page_path": "/about",
                "referrer": "Direct",
                "screen_width": 1440,
                "user_agent": "Mozilla/5.0 (X11; Linux x86_64; rv:123.0) Gecko/20100101 Firefox/123.0",
                "country": "Japan",
                "city": "Tokyo",
                "ip": "192.0.2.77",
                "duration": 4  # Bounce (<10s)
            },
            {
                "session_id": str(uuid.uuid4()),
                "page_path": "/contact",
                "referrer": "https://www.upwork.com/freelancers/~01abcdef",
                "screen_width": 412,
                "user_agent": "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36",
                "country": "Canada",
                "city": "Toronto",
                "ip": "198.51.100.99",
                "duration": 95
            }
        ]

        for s in sessions:
            visit_headers = {
                "CF-IPCountry": s["country"],
                "CF-IPCity": s["city"],
                "X-Forwarded-For": s["ip"],
                "X-Test-Telemetry": "true"
            }
            res = requests.post(f"{base_url}/api/telemetry/visit", json={
                "session_id": s["session_id"],
                "page_path": s["page_path"],
                "referrer": s["referrer"],
                "screen_width": s["screen_width"],
                "user_agent": s["user_agent"]
            }, headers=visit_headers)
            assert res.status_code == 201, f"Visit ingestion failed: {res.text}"
            print(f"  [+] Packet logged: {s['page_path']} from {s['country']} ({s['referrer'][:25]}...)")

        # Step 4: Dispatch Heartbeats
        print("\n[4] Dispatching session dwell-time heartbeats...")
        for s in sessions:
            hb_res = requests.post(f"{base_url}/api/telemetry/heartbeat", json={
                "session_id": s["session_id"],
                "duration_seconds": s["duration"]
            })
            assert hb_res.status_code == 200, f"Heartbeat failed: {hb_res.text}"
            print(f"  [+] Heartbeat: Session {s['session_id'][:8]}... -> {s['duration']}s")

        # Step 5: Query Overview Analytics
        print("\n[5] Verifying GET /api/telemetry/overview...")
        ov_res = requests.get(f"{base_url}/api/telemetry/overview", headers=headers)
        assert ov_res.status_code == 200, f"Overview query failed: {ov_res.text}"
        overview = ov_res.json()
        print(f"  Overview Telemetry: {overview}")
        assert overview["total_views"] == 5, f"Expected 5 total views, got {overview['total_views']}"
        assert overview["unique_sessions_total"] == 5, f"Expected 5 unique sessions, got {overview['unique_sessions_total']}"
        assert overview["unique_sessions_24h"] == 5, f"Expected 5 24h sessions, got {overview['unique_sessions_24h']}"
        assert overview["total_countries"] == 5, f"Expected 5 countries, got {overview['total_countries']}"
        assert overview["bounce_rate"] == 20.0, f"Expected 20.0% bounce rate (1/5), got {overview['bounce_rate']}"
        print("  [+] Overview assertions passed cleanly!")

        # Step 6: Query Referral Channels
        print("\n[6] Verifying GET /api/telemetry/sources...")
        src_res = requests.get(f"{base_url}/api/telemetry/sources", headers=headers)
        assert src_res.status_code == 200
        sources = src_res.json()["sources"]
        source_names = [s["name"] for s in sources]
        print(f"  Acquisition Sources: {source_names}")
        assert "LinkedIn" in source_names
        assert "GitHub" in source_names
        assert "Google Search" in source_names
        assert "Upwork" in source_names
        assert "Direct" in source_names
        print("  [+] Source categorization verified.")

        # Step 7: Query Locations
        print("\n[7] Verifying GET /api/telemetry/locations...")
        loc_res = requests.get(f"{base_url}/api/telemetry/locations", headers=headers)
        assert loc_res.status_code == 200
        loc_data = loc_res.json()
        country_names = [c["name"] for c in loc_data["countries"]]
        city_names = [ci["city"] for ci in loc_data["cities"]]
        print(f"  Countries: {country_names}")
        print(f"  Cities: {city_names}")
        assert "United States" in country_names
        assert "United Kingdom" in country_names
        assert "San Francisco" in city_names
        print("  [+] Location telemetry verified.")

        # Step 8: Query Devices
        print("\n[8] Verifying GET /api/telemetry/devices...")
        dev_res = requests.get(f"{base_url}/api/telemetry/devices", headers=headers)
        assert dev_res.status_code == 200
        dev_data = dev_res.json()
        device_types = [d["name"] for d in dev_data["device_types"]]
        browsers = [b["name"] for b in dev_data["browsers"]]
        operating_systems = [o["name"] for o in dev_data["operating_systems"]]
        print(f"  Devices: {device_types}")
        print(f"  Browsers: {browsers}")
        print(f"  Operating Systems: {operating_systems}")
        assert "Desktop" in device_types
        assert "Mobile" in device_types
        assert "Tablet" in device_types
        assert "Chrome" in browsers
        assert "Safari" in browsers
        assert "Firefox" in browsers
        assert "Windows" in operating_systems
        assert "iOS" in operating_systems
        assert "Linux" in operating_systems
        print("  [+] Device matrix verified.")

        # Step 9: Query Live Transmissions Feed
        print("\n[9] Verifying GET /api/telemetry/live...")
        live_res = requests.get(f"{base_url}/api/telemetry/live?limit=10", headers=headers)
        assert live_res.status_code == 200
        live_items = live_res.json()
        print(f"  Live Transmissions Count: {len(live_items)}")
        assert len(live_items) == 5
        for item in live_items:
            assert "time_ago" in item
            assert item["duration_seconds"] >= 0
            assert item["page_path"].startswith("/")
        print("  [+] Live feed verified.")

        print("\n" + "=" * 70)
        print(" [SUCCESS] ALL TELEMETRY & AUDIENCE INTELLIGENCE TESTS PASSED!")
        print("=" * 70 + "\n")

    finally:
        # TEARDOWN: Completely purge test data so live portfolio.db remains at a clean 0 baseline
        try:
            print("\n[*] Executing post-test teardown purge...")
            teardown_res = requests.delete(f"{base_url}/api/telemetry/purge", headers=headers)
            if teardown_res.status_code == 200:
                print("  [+] Teardown verified: All synthetic test transmissions purged from database.")
        except Exception as e:
            print(f"  [!] Note on teardown: {e}")

        proc.terminate()
        proc.wait()

if __name__ == "__main__":
    run_tests()
