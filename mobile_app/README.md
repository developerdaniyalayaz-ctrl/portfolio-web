# Cyber-Neon Obsidian Portfolio & Admin Studio Mobile App (Flutter)

A cross-platform mobile client (`Flutter 3.x`, `Dart 3.x`, `Riverpod`, `Dio`) mirroring the **Cyber-Neon Obsidian** design aesthetic of the Web Portfolio and integrating directly with the **FastAPI REST API**.

---

## Unified Dual-Experience Architecture

### 1. Public Client Showcase Mode (Default Entry)
- **Interactive Project Showcase:** Filterable by domain (`ALL`, `AI/ML`, `AUTOMATION`, `MOBILE`, `WEB APP`).
- **2x2 Live Impact Telemetry Strip:** Real-time production metrics directly synced with SQLite.
- **Detailed Markdown Case Studies:** Complete technical specifications with code blocks and benchmarks.
- **Pinch-to-Zoom 16:9 Architecture Blueprints:** Fullscreen `InteractiveViewer` with 1x to 4x scaling, panning, and double-tap reset.
- **Two Commercial Purchase & Hire Pathways:**
  - **Ready-Made Codebase / Product:** One-tap checkout redirect with live price tag (`$49`, `$199`) or fallback inquiry.
  - **Custom Integration & Extensions:** One-tap routing that auto-fills the pre-configured inquiry subject in the contact form.
- **3-Tier Engagement Scopes ("How We Work"):** Rapid MVP, Full System, and Enterprise tiers with one-tap scope intake prefill.
- **Verified Client Endorsements:** Star ratings, platform proof badges (`Upwork`, `Fiverr`, `Enterprise Client`).
- **Direct Contact & Commission Intake:** Direct inquiry submission plus WhatsApp and Email quick-launchers.

### 2. Operator Admin Studio Mode (JWT Protected)
- **Secure Authentication:** JWT token persistence via `flutter_secure_storage`.
- **Server Address Switcher:** Easily toggle between Android Emulator (`http://10.0.2.2:8000`), iOS/Localhost (`http://localhost:8000`), LAN (`http://192.168.X.X:8000`), or Production Cloud URL directly from the login screen.
- **Real-Time Telemetry Bar:** Live tracking of projects, unread inquiries, and system health.
- **Projects Management (CRUD):**
  - Create, edit, and purge projects.
  - Inline toggle for `LIVE` / `DRAFT` status.
  - Direct camera & gallery upload for Cover Images and 16:9 Architecture Blueprints.
  - Manage live URLs, YouTube video URLs, and GitHub links.
  - Granular monetization configuration (`purchase_url`, `purchase_price`, `allow_custom_hire`, `hire_custom_subject`).
- **Client Inquiries & Direct SMTP Dispatch:**
  - Inspect incoming client briefs.
  - Send direct SMTP email replies (`POST /api/inquiries/{id}/reply`) right to the client's inbox.
  - Mark read or purge lead records.

---

## Project Structure

```text
mobile_app/
├── pubspec.yaml
├── README.md
├── lib/
│   ├── main.dart
│   ├── core/
│   │   ├── config/
│   │   │   └── app_config.dart          # Dynamic Base URL + Image URL resolver
│   │   ├── theme/
│   │   │   └── cyber_neon_theme.dart    # Obsidian, Neon Cyan, Emerald, Space Grotesk & JetBrains Mono
│   │   ├── network/
│   │   │   └── api_client.dart          # Dio client with JWT interceptor & error handling
│   │   └── storage/
│   │       └── token_storage.dart       # flutter_secure_storage for JWT & Host URL
│   ├── models/
│   │   ├── project_model.dart
│   │   ├── impact_metric_model.dart
│   │   ├── testimonial_model.dart
│   │   ├── engagement_model.dart
│   │   └── inquiry_model.dart
│   ├── repositories/
│   │   └── portfolio_repository.dart    # Public + Admin API endpoints mapped
│   ├── providers/
│   │   └── portfolio_providers.dart     # Riverpod StateNotifiers & FutureProviders
│   ├── screens/
│   │   ├── public/
│   │   │   ├── public_shell_screen.dart # Bottom Navigation: Showcase, Solutions, Reviews, Commission
│   │   │   ├── showcase_home_screen.dart# Hero + Impact Telemetry + Filterable Project Cards
│   │   │   ├── case_study_screen.dart   # Markdown Case Study + 16:9 Blueprint + CTAs
│   │   │   ├── blueprint_viewer_screen.dart # Fullscreen 1x-4x Pinch-Zoom Architecture Viewer
│   │   │   ├── engagements_screen.dart  # 3-Tier Scope Cards with one-tap Subject Prefill
│   │   │   ├── testimonials_screen.dart # Verified Client Reviews & Ratings
│   │   │   └── contact_screen.dart      # Direct Intake Form + WhatsApp & Email
│   │   └── admin/
│   │       ├── admin_login_screen.dart  # JWT Login & Host Config Dialog
│   │       ├── admin_dashboard_screen.dart # Admin BottomNav: Projects, Inquiries & Telemetry
│   │       ├── admin_projects_screen.dart  # Full Project CRUD + Image Picker Upload
│   │       └── admin_inquiries_screen.dart # View Leads & Direct SMTP Email Dispatch
│   └── widgets/
│       ├── cyber_card.dart              # Obsidian card with neon glow & gradient borders
│       ├── neon_badge.dart              # Cyber tag badges
│       └── project_card_widget.dart     # Showcase card with Live, Video, Codebase & Custom CTAs
```

---

## Setup & Running

```bash
cd mobile_app
flutter pub get
flutter run
```

### Backend Host Settings
- **Android Emulator:** Defaults to `http://10.0.2.2:8000`.
- **Physical Device (via WiFi):** Tap the Settings gear icon on the Admin Login screen and enter your machine's local IP (e.g., `http://192.168.1.105:8000`).
- **Web / iOS Simulator:** Defaults to `http://localhost:8000`.
