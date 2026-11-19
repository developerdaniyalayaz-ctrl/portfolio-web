import datetime
import json
from database import engine, SessionLocal, Base, migrate_db
from models import Project, Inquiry, SocialLink, CapabilityCard, StackCategory, StackItem, ImpactMetric, Testimonial, EngagementModel

def seed_capability_cards(db=None, force=False):
    close_db = False
    if db is None:
        db = SessionLocal()
        close_db = True
    try:
        # If not forced, prevent re-seeding if the database is already initialized
        # This respects operator intent when all capability cards have been manually deleted or hidden
        if not force and db.query(Project).count() > 0:
            return

        if db.query(CapabilityCard).count() == 0:
            initial_cards = [
                CapabilityCard(
                    title="AI AGENTIC PIPELINES",
                    description="Gemini Vision OCR, Whisper & Multi-LLM Orchestration",
                    icon_key="cpu",
                    accent_color="cyan",
                    order_index=0,
                    is_active=True
                ),
                CapabilityCard(
                    title="FULL-STACK REST",
                    description="FastAPI, SQLite WAL Mode & React Vite SPAs",
                    icon_key="zap",
                    accent_color="emerald",
                    order_index=1,
                    is_active=True
                ),
                CapabilityCard(
                    title="MOBILE & DESKTOP",
                    description="Cross-Platform Flutter & Streamlit Automation Tools",
                    icon_key="layers",
                    accent_color="blue",
                    order_index=2,
                    is_active=True
                ),
                CapabilityCard(
                    title="HARDENED SECURITY",
                    description="JWT Auth, Atomic Gzip Backups & Edge Telemetry",
                    icon_key="shield",
                    accent_color="violet",
                    order_index=3,
                    is_active=True
                ),
            ]
            db.add_all(initial_cards)
            db.commit()
            print(f"[Seed] Successfully seeded {len(initial_cards)} default capability cards.")
    except Exception as e:
        db.rollback()
        print(f"[Seed Warning] Could not seed capability cards: {e}")
    finally:
        if close_db:
            db.close()

def seed_social_links(db=None, force=False):
    close_db = False
    if db is None:
        db = SessionLocal()
        close_db = True
    try:
        # If not forced, prevent re-seeding if database is already initialized
        if not force and db.query(Project).count() > 0:
            return

        if db.query(SocialLink).count() == 0:
            initial_links = [
                SocialLink(
                    platform="GitHub",
                    label="GitHub",
                    url="https://github.com/kingsdaniyalayaz-droid",
                    icon_key="github",
                    order_index=0,
                    is_active=True
                ),
                SocialLink(
                    platform="LinkedIn",
                    label="LinkedIn",
                    url="https://linkedin.com/in/daniyal-ayaz",
                    icon_key="linkedin",
                    order_index=1,
                    is_active=True
                ),
                SocialLink(
                    platform="Upwork",
                    label="Upwork",
                    url="https://www.upwork.com",
                    icon_key="upwork",
                    order_index=2,
                    is_active=True
                ),
                SocialLink(
                    platform="Fiverr",
                    label="Fiverr",
                    url="https://www.fiverr.com",
                    icon_key="fiverr",
                    order_index=3,
                    is_active=True
                ),
            ]
            db.add_all(initial_links)
            db.commit()
            print(f"[Seed] Successfully seeded {len(initial_links)} default social links.")
    except Exception as e:
        db.rollback()
        print(f"[Seed Warning] Could not seed social links: {e}")
    finally:
        if close_db:
            db.close()

def seed_tech_stack(db=None, force=False):
    close_db = False
    if db is None:
        db = SessionLocal()
        close_db = True
    try:
        # If not forced, prevent re-seeding if database is already initialized
        if not force and db.query(Project).count() > 0:
            return

        if db.query(StackCategory).count() == 0:
            cat1 = StackCategory(
                title="AI & INTELLIGENT AUTOMATION",
                subtitle="Large Language Models, Vision OCR & Agentic Orchestration",
                icon_key="cpu",
                accent_color="cyan",
                order_index=0,
                is_active=True
            )
            cat2 = StackCategory(
                title="BACKEND & DATA ENGINEERING",
                subtitle="High-Concurrency APIs, Relational Engines & Docker Containers",
                icon_key="server",
                accent_color="blue",
                order_index=1,
                is_active=True
            )
            cat3 = StackCategory(
                title="FRONTEND & CROSS-PLATFORM",
                subtitle="Modern Responsive SPAs, Mobile Suites & Cyber Glassmorphism",
                icon_key="layout",
                accent_color="emerald",
                order_index=2,
                is_active=True
            )

            db.add_all([cat1, cat2, cat3])
            db.flush()

            items_cat1 = [
                StackItem(category_id=cat1.id, name="Python 3.11+", detail="Primary core language", order_index=0, is_active=True),
                StackItem(category_id=cat1.id, name="Google Gemini Vision", detail="Visual OCR & tabular audits", order_index=1, is_active=True),
                StackItem(category_id=cat1.id, name="OpenAI Whisper", detail="Localized audio transcription", order_index=2, is_active=True),
                StackItem(category_id=cat1.id, name="LangChain & LangGraph", detail="Multi-agent state machines", order_index=3, is_active=True),
                StackItem(category_id=cat1.id, name="OpenRouter / Mistral", detail="Dynamic model routing", order_index=4, is_active=True),
                StackItem(category_id=cat1.id, name="Pydantic v2", detail="Strict schema & data parsing", order_index=5, is_active=True),
                StackItem(category_id=cat1.id, name="Prompt Engineering", detail="Few-shot structured synthesis", order_index=6, is_active=True),
                StackItem(category_id=cat1.id, name="Streamlit", detail="Rapid AI application prototyping", order_index=7, is_active=True),
            ]

            items_cat2 = [
                StackItem(category_id=cat2.id, name="FastAPI REST API", detail="Asynchronous, high-throughput", order_index=0, is_active=True),
                StackItem(category_id=cat2.id, name="SQLite 3 (WAL Mode)", detail="Concurrency & zero-config persistence", order_index=1, is_active=True),
                StackItem(category_id=cat2.id, name="SQLAlchemy ORM", detail="ACID migrations & session pooling", order_index=2, is_active=True),
                StackItem(category_id=cat2.id, name="PostgreSQL", detail="Enterprise data modeling", order_index=3, is_active=True),
                StackItem(category_id=cat2.id, name="Pandas & NumPy", detail="Data transformation & metrics", order_index=4, is_active=True),
                StackItem(category_id=cat2.id, name="Docker & Docker Compose", detail="Containerized deployment", order_index=5, is_active=True),
                StackItem(category_id=cat2.id, name="JWT & Bcrypt Security", detail="Encrypted authentication", order_index=6, is_active=True),
                StackItem(category_id=cat2.id, name="Atomic Backup Engine", detail="Live snapshots & Gzip rotation", order_index=7, is_active=True),
            ]

            items_cat3 = [
                StackItem(category_id=cat3.id, name="React 18 (Vite)", detail="Modern reactive architecture", order_index=0, is_active=True),
                StackItem(category_id=cat3.id, name="Tailwind CSS", detail="Cyber Neon design system", order_index=1, is_active=True),
                StackItem(category_id=cat3.id, name="Flutter (Dart)", detail="Cross-platform iOS & Android", order_index=2, is_active=True),
                StackItem(category_id=cat3.id, name="Lucide React Icons", detail="Crisp vector interface glyphs", order_index=3, is_active=True),
                StackItem(category_id=cat3.id, name="React Markdown & GFM", detail="Dynamic rich case studies", order_index=4, is_active=True),
                StackItem(category_id=cat3.id, name="Dark Glassmorphism", detail="Backdrop-blur & neon shadows", order_index=5, is_active=True),
                StackItem(category_id=cat3.id, name="Edge Telemetry Hook", detail="Zero-third-party analytics", order_index=6, is_active=True),
                StackItem(category_id=cat3.id, name="Responsive UI/UX", detail="Mobile-first fluid layouts", order_index=7, is_active=True),
            ]

            all_items = items_cat1 + items_cat2 + items_cat3
            db.add_all(all_items)
            db.commit()
            print(f"[Seed] Successfully seeded {len(all_items)} stack items across 3 categories.")
    except Exception as e:
        db.rollback()
        print(f"[Seed Warning] Could not seed tech stack: {e}")
    finally:
        if close_db:
            db.close()

def seed_impact_metrics(db=None, force=False):
    close_db = False
    if db is None:
        db = SessionLocal()
        close_db = True
    try:
        # Only seed if table is completely empty on first boot
        # Never re-seed if intentionally cleared later
        if db.query(ImpactMetric).count() == 0:
            initial_metrics = [
                ImpactMetric(
                    metric_value="3,000+",
                    metric_label="Workforce Automated",
                    sub_context="HR & Payroll Engine",
                    accent_color="cyan",
                    order_index=0,
                    is_active=True
                ),
                ImpactMetric(
                    metric_value="99.4%",
                    metric_label="OCR Extraction Accuracy",
                    sub_context="Garment Production & Quality Audit Automation",
                    accent_color="emerald",
                    order_index=1,
                    is_active=True
                ),
                ImpactMetric(
                    metric_value="10+",
                    metric_label="Production AI & Full-Stack Systems",
                    sub_context="FastAPI, LangGraph & Flutter Deployments",
                    accent_color="sky",
                    order_index=2,
                    is_active=True
                ),
                ImpactMetric(
                    metric_value="< 2 Hr",
                    metric_label="Global Response SLA",
                    sub_context="PKT (UTC+5) // Async Ready",
                    accent_color="violet",
                    order_index=3,
                    is_active=True
                ),
            ]
            db.add_all(initial_metrics)
            db.commit()
            print(f"[Seed] Successfully seeded {len(initial_metrics)} default impact metrics.")
    except Exception as e:
        db.rollback()
        print(f"[Seed Warning] Could not seed impact metrics: {e}")
    finally:
        if close_db:
            db.close()

def seed_testimonials(db=None, force=False):
    close_db = False
    if db is None:
        db = SessionLocal()
        close_db = True
    try:
        # Only seed if table is completely empty on first boot
        # Never re-seed if intentionally cleared later
        if db.query(Testimonial).count() == 0:
            initial_testimonials = [
                Testimonial(
                    client_name="Garment Unit K-03 Production Team",
                    client_role="Apparel Manufacturing & Quality Audit",
                    platform_badge="Enterprise Client",
                    badge_color="sky",
                    rating=5,
                    project_ref="Garment Quality Audit OCR",
                    review_text="Automated our daily line audit extraction and attendance matrices into structured SQLite & Excel reports, eliminating hours of manual entry with near-zero error rates.",
                    order_index=0,
                    is_active=True
                ),
                Testimonial(
                    client_name="Advocate Chambers Partner",
                    client_role="Legal Practice & Case Management",
                    platform_badge="Verified Deployment",
                    badge_color="emerald",
                    rating=5,
                    project_ref="Advocate Diary Suite",
                    review_text="Delivered a fast, reliable Flutter mobile client backed by a containerized FastAPI engine. Case hearings, client ledgers, and court schedules stay synced effortlessly.",
                    order_index=1,
                    is_active=True
                ),
                Testimonial(
                    client_name="International AI Automation Client",
                    client_role="SaaS & Workflow Engineering",
                    platform_badge="Upwork Verified",
                    badge_color="emerald",
                    rating=5,
                    project_ref="4-Agent Data Analytics Engine",
                    review_text="Clean architecture separating deterministic Python math from LLM reasoning. Clear communication, fast turnaround, and production-ready code from day one.",
                    order_index=2,
                    is_active=True
                ),
            ]
            db.add_all(initial_testimonials)
            db.commit()
            print(f"[Seed] Successfully seeded {len(initial_testimonials)} default testimonials.")
    except Exception as e:
        db.rollback()
        print(f"[Seed Warning] Could not seed testimonials: {e}")
    finally:
        if close_db:
            db.close()

def seed_engagement_models(db=None, force=False):
    close_db = False
    if db is None:
        db = SessionLocal()
        close_db = True
    try:
        # Only seed if table is completely empty on first boot
        # Never re-seed if intentionally cleared later
        if db.query(EngagementModel).count() == 0:
            initial_tiers = [
                EngagementModel(
                    tier_badge="PHASE 01 // PROOF OF VALUE",
                    title="Rapid MVP / AI Prototype",
                    timeline="5–7 Days",
                    summary="FastAPI backend + LLM/OCR pipeline + clean web UI.",
                    deliverables=json.dumps([
                        "Python FastAPI REST Backend",
                        "LLM / Vision OCR Integration",
                        "Interactive Web UI (React / Streamlit)",
                        "GitHub Repo & Live Demo Setup"
                    ]),
                    accent_color="cyan",
                    is_featured=False,
                    inquiry_subject="Scope Inquiry: Rapid MVP / AI Prototype (5–7 Days)",
                    order_index=0,
                    is_active=True
                ),
                EngagementModel(
                    tier_badge="PHASE 02 // PRODUCTION BUILD",
                    title="Full-Stack Web & Mobile System",
                    timeline="2–4 Weeks",
                    summary="React/Flutter + PostgreSQL/SQLite + Auth + Admin Dashboard.",
                    deliverables=json.dumps([
                        "React Web App or Cross-Platform Flutter Client",
                        "PostgreSQL / SQLite WAL Relational Schema",
                        "JWT Role-Based Auth & Admin Studio",
                        "Dockerized Production Deployment"
                    ]),
                    accent_color="emerald",
                    is_featured=True,
                    inquiry_subject="Scope Inquiry: Full-Stack Web & Mobile System (2–4 Weeks)",
                    order_index=1,
                    is_active=True
                ),
                EngagementModel(
                    tier_badge="PHASE 03 // SCALE & OPS",
                    title="Enterprise Workflow & Data Automation",
                    timeline="Custom / Dedicated Sprint",
                    summary="Custom Python pipelines, Excel/ERP automation, and Docker deployment.",
                    deliverables=json.dumps([
                        "Multi-Agent Data & Audit Pipelines",
                        "Automated Excel, PDF & ERP Reporting",
                        "High-Concurrency Workforce / Payroll Engines",
                        "On-Premise or Cloud Docker Architecture"
                    ]),
                    accent_color="violet",
                    is_featured=False,
                    inquiry_subject="Scope Inquiry: Enterprise Workflow & Data Automation",
                    order_index=2,
                    is_active=True
                ),
            ]
            db.add_all(initial_tiers)
            db.commit()
            print(f"[Seed] Successfully seeded {len(initial_tiers)} default engagement models.")
    except Exception as e:
        db.rollback()
        print(f"[Seed Warning] Could not seed engagement models: {e}")
    finally:
        if close_db:
            db.close()

def seed_database():
    Base.metadata.create_all(bind=engine)
    migrate_db()
    db = SessionLocal()

    try:
        # Check if already seeded - never re-seed existing database
        if db.query(Project).count() > 0:
            print("Database already contains project data. Ensuring order_index is populated.")
            # Assign order_index if any are null/zero
            projects = db.query(Project).all()
            for idx, p in enumerate(projects):
                if p.order_index is None:
                    p.order_index = idx
            db.commit()
            seed_impact_metrics(db)
            seed_testimonials(db)
            seed_engagement_models(db)
            return

        # Fresh database initialization only:
        seed_social_links(db, force=True)
        seed_capability_cards(db, force=True)
        seed_tech_stack(db, force=True)
        seed_impact_metrics(db, force=True)
        seed_testimonials(db, force=True)
        seed_engagement_models(db, force=True)

        initial_projects = [
            Project(
                title="Aegis AI: Autonomous Threat Intelligence Agent",
                category="AI/ML",
                tech_stack="Python, FastAPI, LangChain, Pinecone, PyTorch, React",
                description="""### Architectural Overview
Aegis AI is an **autonomous multi-agent system** designed for real-time zero-day vulnerability prediction, log telemetry synthesis, and automated incident triage.

#### Key Engineering Highlights:
- **Vector Search Engine**: Sub-10ms similarity clustering with Pinecone vector embeddings.
- **Agentic Pipeline**: LangGraph orchestration with recursive self-correcting validation loops.
- **Encrypted WebSocket Mesh**: Real-time broadcast telemetry to administrative war rooms.
""",
                image_url="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
                live_demo_url="https://aegis-intel.cyberdefense.io",
                github_url="https://github.com/developer/aegis-ai-agent",
                is_published=True,
                order_index=0,
                created_at=datetime.datetime.utcnow() - datetime.timedelta(days=12)
            ),
            Project(
                title="NeonPulse: Cloud Observability & Telemetry Mesh",
                category="Web App",
                tech_stack="Go, React, TypeScript, TailwindCSS, GraphQL, eBPF",
                description="""### Mission Telemetry
High-frequency telemetry dashboard visualizing microservice traces, distributed CPU flamegraphs, and cluster network health with **sub-5ms render latencies**.

```go
// eBPF kernel trace collector probe
func AttachKernelProbe(hook string) (*ProbeSession, error) {
    return ebpf.NewSession(hook, ebpf.BufferCapacity(65536))
}
```

- Integrated zero-copy ring buffers for network packet interception.
- Reactive cyber-dark canvas UI rendering 60fps telemetry graphs.
""",
                image_url="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
                live_demo_url="https://neonpulse.telemetry.dev",
                github_url="https://github.com/developer/neonpulse-observability",
                is_published=True,
                order_index=1,
                created_at=datetime.datetime.utcnow() - datetime.timedelta(days=8)
            ),
            Project(
                title="Vortex: High-Throughput Algorithmic Execution Engine",
                category="Automation",
                tech_stack="Rust, Python, WebSockets, Redis, PostgreSQL, TimescaleDB",
                description="""### Execution Pipeline
Ultra-low latency automated market making and order execution pipeline handling **100k+ events/sec** across decentralized liquidity protocols.

#### Performance Benchmarks:
| Pipeline Phase | Avg Latency | P99 Latency |
| :--- | :--- | :--- |
| Packet Parse | 1.2 µs | 3.1 µs |
| Risk Evaluation | 4.8 µs | 9.4 µs |
| Order Dispatch | 6.5 µs | 14.2 µs |
""",
                image_url="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
                live_demo_url="https://vortex-terminal.trade",
                github_url="https://github.com/developer/vortex-algo-engine",
                is_published=True,
                order_index=2,
                created_at=datetime.datetime.utcnow() - datetime.timedelta(days=4)
            ),
            Project(
                title="Kryptos: Decentralized Multi-Chain Hardware Key Manager",
                category="Mobile",
                tech_stack="React Native, WebAssembly, Rust, BLE, TailwindCSS",
                description="""### Cryptographic Enclave
Non-custodial key manager for iOS and Android featuring biometric secure enclave attestation, offline QR air-gapped signing, and zero-knowledge identity proofs.
""",
                image_url="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80",
                live_demo_url="https://kryptos-vault.app",
                github_url="https://github.com/developer/kryptos-mobile-vault",
                is_published=False,  # Draft
                order_index=3,
                created_at=datetime.datetime.utcnow() - datetime.timedelta(days=2)
            ),
            Project(
                title="Chronos: Distributed Event-Driven Orchestrator",
                category="Automation",
                tech_stack="Python, FastAPI, Celery, RabbitMQ, Docker, Prometheus",
                description="""### Resilient Task Graph
DAG task orchestrator featuring automatic dead-letter queue retries and comprehensive audit trails for enterprise microservice architectures.
""",
                image_url="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
                live_demo_url="https://chronos-engine.io",
                github_url="https://github.com/developer/chronos-orchestrator",
                is_published=True,
                order_index=4,
                created_at=datetime.datetime.utcnow() - datetime.timedelta(days=1)
            ),
        ]

        initial_inquiries = [
            Inquiry(
                name="Elena Vance",
                email="elena.vance@blackmesa-labs.com",
                subject="Enterprise AI Pipeline Consultation",
                message="Hello! We are looking to integrate autonomous threat detection into our Kubernetes edge infrastructure. Loved your Aegis AI project. Are you available for a Q1 contract engagement?",
                is_read=False,
                created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=6)
            ),
            Inquiry(
                name="Marcus Thorne",
                email="m.thorne@cyberdynesystems.org",
                subject="Keynote Speaker / Technical Advisory",
                message="We'd love to invite you to speak at the upcoming Cyberpunk DevCon regarding high-frequency distributed telemetry and FastAPI architectures. Please let us know your rates.",
                is_read=False,
                created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=22)
            ),
            Inquiry(
                name="Sophia Chen",
                email="sophia.chen@novaventures.vc",
                subject="Seed Round Technical Due Diligence",
                message="Hi Daniyal, our VC fund is reviewing an algorithmic trading startup and we'd love your expert technical perspective on their latency architecture. Let's schedule a call.",
                is_read=True,
                created_at=datetime.datetime.utcnow() - datetime.timedelta(days=3)
            )
        ]

        db.add_all(initial_projects)
        db.add_all(initial_inquiries)
        db.commit()
        print(f"Successfully seeded {len(initial_projects)} projects and {len(initial_inquiries)} client inquiries.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
