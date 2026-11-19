from fastapi.testclient import TestClient
from main import app

def test_full_system_flow():
    with TestClient(app) as client:
        print("\n--- 1. Testing Root Healthcheck ---")
        res = client.get("/")
        assert res.status_code == 200
        assert res.json()["status"] == "online"
        print("✓ Healthcheck OK:", res.json())

        print("\n--- 2. Testing Superadmin Authentication ---")
        res = client.post("/api/auth/login", json={"username": "admin", "password": "wrongpassword"})
        assert res.status_code == 401
        print("✓ Invalid login correctly rejected with 401 Unauthorized")

        res = client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
        assert res.status_code == 200
        data = res.json()
        assert "access_token" in data
        token = data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("✓ Superadmin authenticated successfully! Access token issued.")

        print("\n--- 3. Testing Protected /api/auth/me ---")
        res = client.get("/api/auth/me", headers=headers)
        assert res.status_code == 200
        assert res.json()["username"] == "admin"
        print("✓ Token validated for superadmin:", res.json())

        print("\n--- 4. Testing Stats Telemetry ---")
        res = client.get("/api/stats", headers=headers)
        assert res.status_code == 200
        stats = res.json()
        assert stats["total_projects"] >= 5
        assert stats["total_inquiries"] >= 3
        print("✓ Dashboard stats retrieved:", stats)

        print("\n--- 5. Testing Projects CRUD ---")
        res = client.get("/api/projects")
        assert res.status_code == 200
        projects = res.json()
        print(f"✓ Retrieved {len(projects)} seeded projects")

        new_proj = {
            "title": "QuantumLedger: Zero-Knowledge Microservice",
            "category": "Blockchain / Web3",
            "tech_stack": "Rust, Actix, WebAssembly, React, ZK-SNARKs",
            "description": "High-throughput zero-knowledge privacy layer for verifiable credential attestation.",
            "live_demo_url": "https://quantumledger.dev",
            "github_url": "https://github.com/developer/quantumledger",
            "is_published": True
        }
        res = client.post("/api/projects", json=new_proj, headers=headers)
        assert res.status_code == 201
        created = res.json()
        proj_id = created["id"]
        assert created["title"] == new_proj["title"]
        print(f"✓ Project created successfully with ID #{proj_id}")

        res = client.patch(f"/api/projects/{proj_id}/toggle-status", headers=headers)
        assert res.status_code == 200
        assert res.json()["is_published"] == False
        print("✓ Project status toggled to Draft (False)")

        res = client.put(f"/api/projects/{proj_id}", json={"title": "QuantumLedger v2: Updated"}, headers=headers)
        assert res.status_code == 200
        assert res.json()["title"] == "QuantumLedger v2: Updated"
        print("✓ Project updated successfully")

        res = client.delete(f"/api/projects/{proj_id}", headers=headers)
        assert res.status_code == 200
        print("✓ Project deleted successfully")

        print("\n--- 6. Testing Inquiries / Contact Messages ---")
        inquiry_data = {
            "name": "Sarah Connor",
            "email": "sarah.connor@resistance.net",
            "subject": "Cybernetic Architecture Consultation",
            "message": "We need your system design expertise for our distributed network."
        }
        res = client.post("/api/inquiries", json=inquiry_data)
        assert res.status_code == 201
        inq = res.json()
        inq_id = inq["id"]
        print(f"✓ Public contact form submission received (Inquiry #{inq_id})")

        res = client.patch(f"/api/inquiries/{inq_id}/read", headers=headers)
        assert res.status_code == 200
        assert res.json()["is_read"] == True
        print("✓ Inquiry marked as read")

        res = client.delete(f"/api/inquiries/{inq_id}", headers=headers)
        assert res.status_code == 200
        print("✓ Inquiry deleted successfully")

        print("\n==========================================")
        print("ALL BACKEND TEST SUITES PASSED! 100%")
        print("==========================================")

if __name__ == "__main__":
    test_full_system_flow()
