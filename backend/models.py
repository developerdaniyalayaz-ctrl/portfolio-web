import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)
    tech_stack = Column(Text, nullable=False, default="")  # Stored as comma-separated or JSON list
    description = Column(Text, nullable=False, default="")
    image_url = Column(String(500), nullable=True, default="")
    live_url = Column(String(500), nullable=True, default="")
    live_demo_url = Column(String(500), nullable=True, default="")
    github_url = Column(String(500), nullable=True)
    youtube_url = Column(String(500), nullable=True, default="")
    architecture_image_url = Column(String(500), nullable=True, default="")
    purchase_url = Column(String(500), nullable=True, default="")
    purchase_price = Column(String(100), nullable=True, default="")
    allow_custom_hire = Column(Boolean, default=True)
    hire_custom_subject = Column(String(250), nullable=True, default="")
    is_published = Column(Boolean, default=True, index=True)
    order_index = Column(Integer, default=0, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class Inquiry(Base):
    __tablename__ = "inquiries"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    email = Column(String(255), nullable=False)
    subject = Column(String(255), nullable=True, default="Portfolio Contact")
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False, index=True)
    status = Column(String(50), default="NEW", nullable=False)
    reply_subject = Column(String(255), nullable=True)
    reply_body = Column(Text, nullable=True)
    replied_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class VisitorSession(Base):
    __tablename__ = "visitor_sessions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(64), index=True, nullable=False)
    ip_hash = Column(String(64), index=True, nullable=False)
    country = Column(String(100), default="Unknown", index=True)
    city = Column(String(100), default="Unknown")
    page_path = Column(String(500), default="/", index=True)
    referrer = Column(String(500), default="Direct", index=True)
    device_type = Column(String(50), default="Desktop", index=True)  # Desktop, Mobile, Tablet
    browser = Column(String(50), default="Other", index=True)        # Chrome, Firefox, Safari, Edge, Other
    os = Column(String(50), default="Other", index=True)             # Windows, macOS, Linux, Android, iOS, Other
    screen_width = Column(Integer, nullable=True)
    duration_seconds = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class SocialLink(Base):
    __tablename__ = "social_links"

    id = Column(Integer, primary_key=True, index=True)
    platform = Column(String(100), nullable=False)
    label = Column(String(100), nullable=False)
    url = Column(String(500), nullable=False)
    icon_key = Column(String(50), nullable=False, default="globe")
    order_index = Column(Integer, default=0, index=True)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class CapabilityCard(Base):
    __tablename__ = "capability_cards"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False, index=True)
    description = Column(String(500), nullable=False)
    icon_key = Column(String(50), nullable=False, default="cpu")
    accent_color = Column(String(50), nullable=False, default="cyan")
    order_index = Column(Integer, default=0, index=True)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class StackCategory(Base):
    __tablename__ = "stack_categories"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False, index=True)
    subtitle = Column(String(255), nullable=True, default="")
    icon_key = Column(String(50), nullable=False, default="cpu")
    accent_color = Column(String(50), nullable=False, default="cyan")
    order_index = Column(Integer, default=0, index=True)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    items = relationship(
        "StackItem",
        back_populates="category",
        cascade="all, delete-orphan",
        order_by="StackItem.order_index.asc(), StackItem.id.asc()"
    )

class StackItem(Base):
    __tablename__ = "stack_items"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("stack_categories.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    detail = Column(String(255), nullable=False, default="")
    order_index = Column(Integer, default=0, index=True)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    category = relationship("StackCategory", back_populates="items")

class ContactMatrixConfig(Base):
    __tablename__ = "contact_matrix_config"

    id = Column(Integer, primary_key=True, default=1)
    matrix_title = Column(String(150), default="NODE CONTACT MATRIX", nullable=False)
    availability_badge = Column(String(100), default="OPEN FOR CONTRACTS", nullable=False)
    is_available = Column(Boolean, default=True, nullable=False)
    email = Column(String(255), default="daniyalayazahmed@gmail.com", nullable=False)
    location = Column(String(255), default="Karachi, Pakistan (Global Remote)", nullable=False)
    timezone = Column(String(255), default="PKT (UTC+5) // Async Availability", nullable=False)
    security_title = Column(String(150), default="ZERO-LEAK DIRECT PERSISTENCE", nullable=False)
    security_description = Column(
        String(500),
        default="Inquiries are securely piped directly to the private database without third-party mail brokers or tracking scripts.",
        nullable=False
    )
    show_security_card = Column(Boolean, default=True, nullable=False)
    whatsapp_number = Column(String(100), default="", nullable=True)
    whatsapp_url = Column(String(500), default="", nullable=True)
    show_whatsapp = Column(Boolean, default=True, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class ImpactMetric(Base):
    __tablename__ = "impact_metrics"

    id = Column(Integer, primary_key=True, index=True)
    metric_value = Column(String(60), nullable=False)
    metric_label = Column(String(120), nullable=False)
    sub_context = Column(String(180), nullable=True, default="")
    accent_color = Column(String(30), default="cyan")
    order_index = Column(Integer, default=0, index=True)
    is_active = Column(Boolean, default=True, index=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class Testimonial(Base):
    __tablename__ = "testimonials"

    id = Column(Integer, primary_key=True, index=True)
    client_name = Column(String(120), nullable=False)
    client_role = Column(String(150), nullable=True, default="")
    platform_badge = Column(String(60), nullable=False, default="Enterprise Client")
    badge_color = Column(String(30), default="emerald")
    rating = Column(Integer, default=5)
    review_text = Column(Text, nullable=False)
    project_ref = Column(String(120), nullable=True, default="")
    order_index = Column(Integer, default=0, index=True)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class EngagementModel(Base):
    __tablename__ = "engagement_models"

    id = Column(Integer, primary_key=True, index=True)
    tier_badge = Column(String(60), nullable=False)
    title = Column(String(140), nullable=False)
    timeline = Column(String(80), nullable=False)
    summary = Column(Text, nullable=False)
    deliverables = Column(Text, nullable=False, default="[]")  # JSON encoded list of strings
    accent_color = Column(String(30), default="cyan")
    is_featured = Column(Boolean, default=False)
    inquiry_subject = Column(String(200), nullable=False)
    order_index = Column(Integer, default=0, index=True)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)






