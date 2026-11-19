import json
from typing import Optional, List, Union
from datetime import datetime
from pydantic import BaseModel, Field, field_validator

# Auth & Superadmin Schemas
class LoginRequest(BaseModel):
    username: str = Field(..., example="admin")
    password: str = Field(..., example="admin123")

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class UserResponse(BaseModel):
    id: Optional[int] = None
    username: str
    role: str

class ProfileUpdateRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=100)

class ProfileUpdateResponse(BaseModel):
    username: str
    role: str = "superadmin"
    access_token: str
    message: str = "Operator identity updated successfully."

class ChangePasswordRequest(BaseModel):
    current_password: str = Field(...)
    new_password: str = Field(..., min_length=8, description="Minimum 8 characters")
    confirm_new_password: str = Field(...)

class StatusMessageResponse(BaseModel):
    status: str
    message: str

# Project Schemas
class ProjectBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    category: str = Field(..., min_length=2, max_length=100)
    tech_stack: str = Field(..., description="Comma-separated tags or JSON string, e.g. 'React, FastAPI, Docker'")
    description: str = Field(..., description="Project summary / case study")
    image_url: Optional[str] = ""
    live_url: Optional[str] = ""
    live_demo_url: Optional[str] = None
    github_url: Optional[str] = None
    youtube_url: Optional[str] = ""
    architecture_image_url: Optional[str] = ""
    purchase_url: Optional[str] = ""
    purchase_price: Optional[str] = ""
    allow_custom_hire: Optional[bool] = True
    hire_custom_subject: Optional[str] = ""
    is_published: bool = True
    order_index: Optional[int] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    tech_stack: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    live_url: Optional[str] = None
    live_demo_url: Optional[str] = None
    github_url: Optional[str] = None
    youtube_url: Optional[str] = None
    architecture_image_url: Optional[str] = None
    purchase_url: Optional[str] = None
    purchase_price: Optional[str] = None
    allow_custom_hire: Optional[bool] = None
    hire_custom_subject: Optional[str] = None
    is_published: Optional[bool] = None
    order_index: Optional[int] = None

class ProjectResponse(ProjectBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ProjectReorderItem(BaseModel):
    id: int
    order_index: int

class UploadResponse(BaseModel):
    url: str
    filename: str

# Inquiry Schemas
class InquiryCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    email: str = Field(..., min_length=5, max_length=255)
    subject: Optional[str] = "Portfolio Contact"
    message: str = Field(..., min_length=5)

class InquiryReplyRequest(BaseModel):
    subject: str = Field(..., min_length=1, max_length=255, description="Reply email subject")
    message: str = Field(..., min_length=1, description="Reply email body message")

class InquiryResponse(InquiryCreate):
    id: int
    is_read: bool
    status: Optional[str] = "NEW"
    reply_subject: Optional[str] = None
    reply_body: Optional[str] = None
    replied_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Stats / Dashboard Metrics
class DashboardStats(BaseModel):
    total_projects: int
    published_projects: int
    draft_projects: int
    total_inquiries: int
    unread_inquiries: int

# Telemetry & Audience Intelligence Schemas
class TelemetryVisitRequest(BaseModel):
    session_id: str = Field(..., description="UUIDv4 client session token")
    page_path: Optional[str] = Field("/", description="Visited route path")
    referrer: Optional[str] = Field("Direct", description="Source referrer URL")
    screen_width: Optional[int] = Field(None, description="Client display width")
    user_agent: Optional[str] = Field(None, description="Optional override user-agent string")

class TelemetryHeartbeatRequest(BaseModel):
    session_id: str = Field(..., description="UUIDv4 client session token")
    duration_seconds: int = Field(..., ge=0, description="Active session duration in seconds")

class TelemetryOverviewResponse(BaseModel):
    total_views: int
    unique_sessions_total: int
    unique_sessions_24h: int
    unique_sessions_7d: int
    unique_sessions_30d: int
    avg_duration_seconds: int
    bounce_rate: float
    total_countries: int
    top_referrer: str
    top_referrer_percent: float

class TelemetryDistributionItem(BaseModel):
    name: str
    count: int
    percentage: float

class TelemetrySourcesResponse(BaseModel):
    sources: List[TelemetryDistributionItem]

class TelemetryCityItem(BaseModel):
    city: str
    country: str
    count: int

class TelemetryLocationsResponse(BaseModel):
    countries: List[TelemetryDistributionItem]
    cities: List[TelemetryCityItem]

class TelemetryDevicesResponse(BaseModel):
    device_types: List[TelemetryDistributionItem]
    browsers: List[TelemetryDistributionItem]
    operating_systems: List[TelemetryDistributionItem]

class TelemetryLiveItem(BaseModel):
    id: int
    session_id: str
    page_path: str
    referrer: str
    country: str
    city: str
    device_type: str
    browser: str
    os: str
    duration_seconds: int
    created_at: datetime
    time_ago: str

# Social & Freelance Link Schemas
class SocialLinkBase(BaseModel):
    platform: str = Field(..., example="GitHub")
    label: str = Field(..., example="GitHub")
    url: str = Field(..., example="https://github.com/kingsdaniyalayaz-droid")
    icon_key: str = Field(default="globe", example="github")
    order_index: int = Field(default=0, example=0)
    is_active: bool = Field(default=True, example=True)

class SocialLinkCreate(SocialLinkBase):
    pass

class SocialLinkUpdate(BaseModel):
    platform: Optional[str] = None
    label: Optional[str] = None
    url: Optional[str] = None
    icon_key: Optional[str] = None
    order_index: Optional[int] = None
    is_active: Optional[bool] = None

class SocialLinkResponse(SocialLinkBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class SocialLinkReorderItem(BaseModel):
    id: int
    order_index: int

# Capability & Services Schemas
class CapabilityCardBase(BaseModel):
    title: str = Field(..., example="AI AGENTIC PIPELINES")
    description: str = Field(..., example="Gemini Vision OCR, Whisper & Multi-LLM Orchestration")
    icon_key: str = Field(default="cpu", example="cpu")
    accent_color: str = Field(default="cyan", example="cyan")
    order_index: int = Field(default=0, example=0)
    is_active: bool = Field(default=True, example=True)

class CapabilityCardCreate(CapabilityCardBase):
    pass

class CapabilityCardUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    icon_key: Optional[str] = None
    accent_color: Optional[str] = None
    order_index: Optional[int] = None
    is_active: Optional[bool] = None

class CapabilityCardResponse(CapabilityCardBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CapabilityReorderItem(BaseModel):
    id: int
    order_index: int

# Dynamic Tech Stack & Skills Schemas
class StackItemBase(BaseModel):
    name: str = Field(..., example="Python 3.11+")
    detail: str = Field(default="", example="Primary core language")
    order_index: int = Field(default=0, example=0)
    is_active: bool = Field(default=True, example=True)

class StackItemCreate(StackItemBase):
    category_id: int = Field(..., example=1)

class StackItemUpdate(BaseModel):
    category_id: Optional[int] = None
    name: Optional[str] = None
    detail: Optional[str] = None
    order_index: Optional[int] = None
    is_active: Optional[bool] = None

class StackItemResponse(StackItemBase):
    id: int
    category_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class StackCategoryBase(BaseModel):
    title: str = Field(..., example="AI & INTELLIGENT AUTOMATION")
    subtitle: Optional[str] = Field(default="", example="Large Language Models, Vision OCR & Agentic Orchestration")
    icon_key: str = Field(default="cpu", example="cpu")
    accent_color: str = Field(default="cyan", example="cyan")
    order_index: int = Field(default=0, example=0)
    is_active: bool = Field(default=True, example=True)

class StackCategoryCreate(StackCategoryBase):
    pass

class StackCategoryUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    icon_key: Optional[str] = None
    accent_color: Optional[str] = None
    order_index: Optional[int] = None
    is_active: Optional[bool] = None

class StackCategoryResponse(StackCategoryBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    items: List[StackItemResponse] = []

    class Config:
        from_attributes = True

class StackReorderItem(BaseModel):
    id: int
    order_index: int

# Contact Matrix Schemas
class ContactMatrixBase(BaseModel):
    matrix_title: str = Field(default="NODE CONTACT MATRIX", example="NODE CONTACT MATRIX")
    availability_badge: str = Field(default="OPEN FOR CONTRACTS", example="OPEN FOR CONTRACTS")
    is_available: bool = Field(default=True, example=True)
    email: str = Field(default="daniyalayazahmed@gmail.com", example="daniyalayazahmed@gmail.com")
    location: str = Field(default="Karachi, Pakistan (Global Remote)", example="Karachi, Pakistan (Global Remote)")
    timezone: str = Field(default="PKT (UTC+5) // Async Availability", example="PKT (UTC+5) // Async Availability")
    security_title: str = Field(default="ZERO-LEAK DIRECT PERSISTENCE", example="ZERO-LEAK DIRECT PERSISTENCE")
    security_description: str = Field(
        default="Inquiries are securely piped directly to the private database without third-party mail brokers or tracking scripts.",
        example="Inquiries are securely piped directly to the private database without third-party mail brokers or tracking scripts."
    )
    show_security_card: bool = Field(default=True, example=True)
    whatsapp_number: Optional[str] = Field(default="", example="+92 300 1234567")
    whatsapp_url: Optional[str] = Field(default="", example="https://wa.me/923001234567")
    show_whatsapp: bool = Field(default=True, example=True)

class ContactMatrixUpdate(BaseModel):
    matrix_title: Optional[str] = None
    availability_badge: Optional[str] = None
    is_available: Optional[bool] = None
    email: Optional[str] = None
    location: Optional[str] = None
    timezone: Optional[str] = None
    security_title: Optional[str] = None
    security_description: Optional[str] = None
    show_security_card: Optional[bool] = None
    whatsapp_number: Optional[str] = None
    whatsapp_url: Optional[str] = None
    show_whatsapp: Optional[bool] = None

class ContactMatrixResponse(ContactMatrixBase):
    id: int
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Impact Metrics Telemetry Schemas
class ImpactMetricBase(BaseModel):
    metric_value: str = Field(..., example="3,000+")
    metric_label: str = Field(..., example="Workforce Automated")
    sub_context: Optional[str] = Field(default="", example="HR & Payroll Engine")
    accent_color: Optional[str] = Field(default="cyan", example="cyan")
    order_index: Optional[int] = Field(default=0, example=0)
    is_active: Optional[bool] = Field(default=True, example=True)

class ImpactMetricCreate(ImpactMetricBase):
    pass

class ImpactMetricUpdate(BaseModel):
    metric_value: Optional[str] = None
    metric_label: Optional[str] = None
    sub_context: Optional[str] = None
    accent_color: Optional[str] = None
    order_index: Optional[int] = None
    is_active: Optional[bool] = None

class ImpactMetricResponse(ImpactMetricBase):
    id: int
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ImpactMetricReorderItem(BaseModel):
    id: int
    order_index: int

# Testimonials Schemas
class TestimonialBase(BaseModel):
    client_name: str = Field(..., example="Garment Unit K-03 Production Team")
    client_role: Optional[str] = Field(default="", example="Apparel Manufacturing & Quality Audit")
    platform_badge: Optional[str] = Field(default="Enterprise Client", example="Enterprise Client")
    badge_color: Optional[str] = Field(default="emerald", example="emerald")
    rating: Optional[int] = Field(default=5, ge=1, le=5, example=5)
    review_text: str = Field(..., example="Automated our daily line audit extraction...")
    project_ref: Optional[str] = Field(default="", example="Garment Quality Audit OCR")
    order_index: Optional[int] = Field(default=0, example=0)
    is_active: Optional[bool] = Field(default=True, example=True)

class TestimonialCreate(TestimonialBase):
    pass

class TestimonialUpdate(BaseModel):
    client_name: Optional[str] = None
    client_role: Optional[str] = None
    platform_badge: Optional[str] = None
    badge_color: Optional[str] = None
    rating: Optional[int] = Field(default=None, ge=1, le=5)
    review_text: Optional[str] = None
    project_ref: Optional[str] = None
    order_index: Optional[int] = None
    is_active: Optional[bool] = None

class TestimonialResponse(TestimonialBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class TestimonialReorderItem(BaseModel):
    id: int
    order_index: int

# Engagement Models ("How We Work") Schemas
class EngagementModelBase(BaseModel):
    tier_badge: str = Field(..., example="PHASE 01 // PROOF OF VALUE")
    title: str = Field(..., example="Rapid MVP / AI Prototype")
    timeline: str = Field(..., example="5–7 Days")
    summary: str = Field(..., example="FastAPI backend + LLM/OCR pipeline + clean web UI.")
    deliverables: List[str] = Field(default_factory=list, example=["FastAPI REST Backend", "LLM Integration"])
    accent_color: Optional[str] = Field(default="cyan", example="cyan")
    is_featured: Optional[bool] = Field(default=False, example=False)
    inquiry_subject: str = Field(..., example="Scope Inquiry: Rapid MVP / AI Prototype (5–7 Days)")
    order_index: Optional[int] = Field(default=0, example=0)
    is_active: Optional[bool] = Field(default=True, example=True)

    @field_validator("deliverables", mode="before")
    @classmethod
    def parse_deliverables(cls, v):
        if isinstance(v, str):
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return parsed
            except Exception:
                return [line.strip() for line in v.splitlines() if line.strip()]
        return v or []

class EngagementModelCreate(EngagementModelBase):
    pass

class EngagementModelUpdate(BaseModel):
    tier_badge: Optional[str] = None
    title: Optional[str] = None
    timeline: Optional[str] = None
    summary: Optional[str] = None
    deliverables: Optional[List[str]] = None
    accent_color: Optional[str] = None
    is_featured: Optional[bool] = None
    inquiry_subject: Optional[str] = None
    order_index: Optional[int] = None
    is_active: Optional[bool] = None

    @field_validator("deliverables", mode="before")
    @classmethod
    def parse_deliverables(cls, v):
        if isinstance(v, str):
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return parsed
            except Exception:
                return [line.strip() for line in v.splitlines() if line.strip()]
        return v

class EngagementModelResponse(EngagementModelBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class EngagementModelReorderItem(BaseModel):
    id: int
    order_index: int





