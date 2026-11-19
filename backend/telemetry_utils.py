"""
Privacy-first telemetry parsing utilities:
- GDPR-compliant salted IP hashing.
- Lightweight zero-dependency User-Agent parser.
- Referrer channel normalizer.
- Cloudflare & Proxy GeoIP header extractor.
"""

import os
import re
import hashlib
from typing import Optional, Tuple
from urllib.parse import urlparse

TELEMETRY_SALT = os.getenv("TELEMETRY_SALT", "cyber-neon-telemetry-salt-981273")

def hash_client_ip(ip: str) -> str:
    """Produces a salted, one-way SHA-256 hash of the client IP address."""
    if not ip:
        ip = "127.0.0.1"
    clean_ip = ip.strip()
    salted = f"{TELEMETRY_SALT}:{clean_ip}".encode("utf-8")
    return hashlib.sha256(salted).hexdigest()

def extract_client_ip(headers: dict, client_host: Optional[str]) -> str:
    """Extracts true remote client IP resolving through proxies and load balancers."""
    # Check standard forwarding headers
    for header in ["cf-connecting-ip", "x-real-ip", "x-forwarded-for"]:
        val = headers.get(header)
        if val:
            # Handle comma-separated list of IPs in x-forwarded-for
            ips = [x.strip() for x in val.split(",") if x.strip()]
            if ips:
                return ips[0]
    return client_host or "127.0.0.1"

def extract_geo_location(headers: dict, client_ip: str) -> Tuple[str, str]:
    """
    Extracts geographic hints from CDN/reverse-proxy headers.
    Falls back to 'Local / Dev' for loopback or 'Unknown'.
    """
    country = None
    city = None

    # Common CDN/Proxy geolocation headers
    for c_header in ["cf-ipcountry", "x-country", "x-geo-country", "geoip-country"]:
        val = headers.get(c_header)
        if val and val.strip() and val.strip() != "XX":
            country = val.strip()
            break

    for ci_header in ["cf-ipcity", "x-city", "x-geo-city", "geoip-city"]:
        val = headers.get(ci_header)
        if val and val.strip():
            city = val.strip()
            break

    # Local development IP detection
    if client_ip in ["127.0.0.1", "::1", "localhost"] and not country:
        return ("Local / Dev", city or "Localhost")

    return (country or "Unknown", city or "Unknown")

def parse_user_agent(ua_str: Optional[str], screen_width: Optional[int] = None) -> Tuple[str, str, str]:
    """
    Parses User-Agent into (device_type, browser, os).
    Zero third-party dependencies with heuristic screen size fallback.
    """
    if not ua_str:
        device = "Mobile" if screen_width and screen_width < 768 else "Desktop"
        return (device, "Other", "Other")

    ua = ua_str.lower()

    # 1. Determine Device Type
    if re.search(r"ipad|tablet|playbook|silk|kindle", ua):
        device_type = "Tablet"
    elif re.search(r"mobile|iphone|ipod|android.*mobile|blackberry|iemobile|opera mini", ua):
        device_type = "Mobile"
    elif re.search(r"android", ua):
        device_type = "Tablet"
    elif screen_width and screen_width < 768:
        device_type = "Mobile"
    elif screen_width and screen_width < 1024:
        device_type = "Tablet"
    else:
        device_type = "Desktop"

    # 2. Determine Browser
    if "edg/" in ua or "edge/" in ua:
        browser = "Edge"
    elif "opr/" in ua or "opera" in ua:
        browser = "Opera"
    elif "chrome/" in ua or "crios/" in ua:
        browser = "Chrome"
    elif "firefox/" in ua or "fxios/" in ua:
        browser = "Firefox"
    elif "safari/" in ua and "chrome" not in ua and "crios" not in ua:
        browser = "Safari"
    elif "msie" in ua or "trident" in ua:
        browser = "Internet Explorer"
    else:
        browser = "Other"

    # 3. Determine Operating System
    if "iphone" in ua or "ipad" in ua or "ipod" in ua:
        os_name = "iOS"
    elif "android" in ua:
        os_name = "Android"
    elif "windows nt" in ua or "win64" in ua or "win32" in ua:
        os_name = "Windows"
    elif "macintosh" in ua or "mac os x" in ua:
        os_name = "macOS"
    elif "linux" in ua:
        os_name = "Linux"
    elif "cros" in ua:
        os_name = "Chrome OS"
    else:
        os_name = "Other"

    return (device_type, browser, os_name)

def normalize_referrer(raw_ref: Optional[str]) -> str:
    """Normalizes referrer URL into a recognizable acquisition channel label."""
    if not raw_ref:
        return "Direct"

    ref = raw_ref.strip().lower()
    if ref in ["", "direct", "none", "null", "undefined"]:
        return "Direct"

    # Match major traffic sources
    if "linkedin.com" in ref or "lnkd.in" in ref:
        return "LinkedIn"
    if "github.com" in ref:
        return "GitHub"
    if "google." in ref:
        return "Google Search"
    if "t.co" in ref or "twitter.com" in ref or "x.com" in ref:
        return "X / Twitter"
    if "upwork.com" in ref:
        return "Upwork"
    if "youtube.com" in ref or "youtu.be" in ref:
        return "YouTube"
    if "reddit.com" in ref:
        return "Reddit"
    if "instagram.com" in ref:
        return "Instagram"
    if "facebook.com" in ref or "fb.com" in ref:
        return "Facebook"

    # Extract hostname
    try:
        parsed = urlparse(raw_ref)
        domain = parsed.netloc or parsed.path
        domain = re.sub(r"^www\.", "", domain)
        return domain.capitalize() if domain else "Direct"
    except Exception:
        return "Direct"

def is_internal_route(path: Optional[str]) -> bool:
    """
    Checks whether a route path corresponds to internal administration, authentication,
    or backend utility endpoints that must be excluded from public visitor telemetry.
    """
    if not path:
        return False
    clean_path = path.strip().lower()

    # Exact matches or prefix matches for administrative routes
    internal_prefixes = (
        "/admin",
        "/login",
        "/auth",
        "/api",
        "/docs",
        "/redoc",
        "/openapi",
        "/favicon.ico"
    )
    return any(clean_path == p or clean_path.startswith(p + "/") or clean_path.startswith(p) for p in internal_prefixes)

def is_localhost_ip(ip: Optional[str]) -> bool:
    """
    Checks whether a client IP address corresponds to local loopback or internal dev environments.
    """
    if not ip:
        return True
    clean = ip.strip().lower()
    loopbacks = ("127.0.0.1", "::1", "localhost", "0.0.0.0", "testclient", "::ffff:127.0.0.1")
    if clean in loopbacks or clean.startswith("127.") or clean == "::":
        return True
    return False

def is_bot_user_agent(ua_str: Optional[str]) -> bool:
    """
    Detects automated web crawlers, headless agents, CLI scrapers, and uptime pingers.
    """
    if not ua_str:
        return False
    ua = ua_str.lower()
    bot_patterns = (
        "bot",
        "crawl",
        "spider",
        "headless",
        "slurp",
        "curl",
        "wget",
        "python-requests",
        "aiohttp",
        "postman",
        "insomnia",
        "httpie",
        "axios/0",
        "go-http-client",
        "java/",
        "php/",
        "uptimerobot",
        "monitoring",
        "pingdom"
    )
    return any(p in ua for p in bot_patterns)


