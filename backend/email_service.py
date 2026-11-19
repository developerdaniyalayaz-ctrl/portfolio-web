import os
import ssl
import smtplib
import html
from email.message import EmailMessage
from fastapi import HTTPException
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

def get_smtp_config():
    # Reload env vars dynamically so live edits to .env take effect without restarting if needed
    load_dotenv(os.path.join(BASE_DIR, ".env"), override=True)
    return {
        "host": os.getenv("SMTP_HOST", "smtp.gmail.com").strip(),
        "port": int(os.getenv("SMTP_PORT", "587")),
        "user": os.getenv("SMTP_USER", "daniyalayazahmed@gmail.com").strip(),
        "password": os.getenv("SMTP_PASSWORD", "").strip(),
        "from_name": os.getenv("SMTP_FROM_NAME", "Daniyal Ayaz | Full-Stack & AI Architect").strip(),
        "admin_notify_email": os.getenv("ADMIN_NOTIFY_EMAIL", "daniyalayazahmed@gmail.com").strip(),
    }

def format_html_paragraphs(text: str) -> str:
    """Converts plain text into clean HTML paragraphs, escaping raw characters."""
    escaped = html.escape(text.strip())
    paragraphs = escaped.split("\n\n")
    html_parts = []
    for p in paragraphs:
        lines = p.split("\n")
        html_parts.append(f"<p style=\"margin: 0 0 16px 0; line-height: 1.6; color: #1e293b; font-size: 15px;\">{'<br/>'.join(lines)}</p>")
    return "".join(html_parts)

def build_client_reply_html(recipient_name: str, subject: str, body_html: str, from_name: str, from_email: str) -> str:
    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{html.escape(subject)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #050811; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #050811; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" width="100%" style="max-width: 620px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.3);" cellspacing="0" cellpadding="0">
          <!-- Top Accent Bar -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #00f0ff 0%, #3b82f6 50%, #6366f1 100%);"></td>
          </tr>
          
          <!-- Header -->
          <tr>
            <td style="padding: 28px 32px 20px 32px; background-color: #0a0f24; border-bottom: 1px solid rgba(0,240,255,0.15);">
              <div style="font-family: 'Courier New', Courier, monospace; font-size: 11px; font-weight: 700; color: #00f0ff; letter-spacing: 1.5px; text-transform: uppercase;">
                // SECURE COMMUNICATIONS DIRECT DISPATCH
              </div>
              <div style="font-size: 20px; font-weight: 700; color: #ffffff; margin-top: 6px;">
                {html.escape(subject)}
              </div>
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; background-color: #ffffff;">
              <div style="color: #334155; font-size: 15px;">
                {body_html}
              </div>
              
              <!-- Divider -->
              <div style="margin: 28px 0; height: 1px; background-color: #e2e8f0;"></div>

              <!-- Professional Signature Block -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align: middle;">
                    <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 2px;">
                      {html.escape(from_name)}
                    </div>
                    <div style="font-size: 13px; font-weight: 600; color: #0284c7; margin-bottom: 6px;">
                      Full-Stack &amp; AI Automation Engineer
                    </div>
                    <div style="font-size: 12px; color: #64748b; line-height: 1.5;">
                      Direct: <a href="mailto:{from_email}" style="color: #0284c7; text-decoration: none;">{from_email}</a><br/>
                      Portfolio: <a href="https://daniyalayaz.com" style="color: #0284c7; text-decoration: none;">daniyalayaz.com</a>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 16px 32px; background-color: #070b19; text-align: center; font-size: 11px; color: #64748b; font-family: 'Courier New', Courier, monospace;">
              Zero-Leak Telemetry &bull; Sent via Direct Node SMTP Relay
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""

def build_admin_lead_alert_html(name: str, email: str, subject: str, message: str) -> str:
    escaped_msg = html.escape(message).replace("\n", "<br/>")
    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Lead Transmission</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #03060f; font-family: 'Courier New', Courier, monospace; color: #e2e8f0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #080d1e; border: 1px solid #00f0ff; border-radius: 8px; overflow: hidden;">
    <div style="background-color: #00f0ff; color: #000000; padding: 12px 20px; font-weight: bold; font-size: 13px; letter-spacing: 1px;">
      [!] NEW CLIENT LEAD DETECTED // PORTFOLIO INQUIRY
    </div>
    <div style="padding: 24px; font-size: 13px; line-height: 1.6;">
      <p style="margin: 0 0 10px 0;"><strong style="color: #00f0ff;">SENDER:</strong> {html.escape(name)} &lt;<a href="mailto:{html.escape(email)}" style="color: #38bdf8;">{html.escape(email)}</a>&gt;</p>
      <p style="margin: 0 0 10px 0;"><strong style="color: #00f0ff;">SUBJECT:</strong> {html.escape(subject)}</p>
      <div style="margin-top: 16px; padding: 16px; background-color: #050811; border-left: 3px solid #00f0ff; border-radius: 4px; color: #cbd5e1; font-size: 13px; white-space: pre-wrap;">{escaped_msg}</div>
      <div style="margin-top: 24px;">
        <a href="mailto:{html.escape(email)}?subject=Re:%20{html.escape(subject)}" style="display: inline-block; padding: 10px 18px; background-color: #00f0ff; color: #000000; font-weight: bold; text-decoration: none; border-radius: 6px; font-size: 12px;">
          REPLY DIRECTLY TO CLIENT
        </a>
      </div>
    </div>
  </div>
</body>
</html>
"""

def send_direct_email(to_email: str, subject: str, body: str, reply_to: str | None = None, recipient_name: str | None = None) -> dict:
    """
    Dispatches a real email directly to the recipient via SMTP with TLS encryption.
    Raises HTTPException(400) with a clear explanation if SMTP_PASSWORD is not set.
    """
    config = get_smtp_config()
    
    if not config["password"]:
        raise HTTPException(
            status_code=400,
            detail=(
                "SMTP_PASSWORD is not configured in backend/.env. "
                "Add your 16-character Gmail App Password to enable real direct email dispatch."
            )
        )

    if not config["user"]:
        raise HTTPException(
            status_code=400,
            detail="SMTP_USER is not configured in backend/.env."
        )

    # Construct EmailMessage
    msg = EmailMessage()
    msg["From"] = f'"{config["from_name"]}" <{config["user"]}>'
    msg["To"] = to_email.strip()
    msg["Subject"] = subject.strip()
    
    clean_reply_to = (reply_to or config["user"]).strip()
    msg["Reply-To"] = clean_reply_to

    # Plain text version
    clean_body = body.strip()
    text_content = f"{clean_body}\n\n---\n{config['from_name']}\nFull-Stack & AI Automation Engineer\nEmail: {config['user']}\nPortfolio: https://daniyalayaz.com"
    msg.set_content(text_content)

    # HTML alternative version
    html_paragraphs = format_html_paragraphs(clean_body)
    html_content = build_client_reply_html(
        recipient_name=recipient_name or to_email,
        subject=subject,
        body_html=html_paragraphs,
        from_name=config["from_name"],
        from_email=config["user"]
    )
    msg.add_alternative(html_content, subtype="html")

    try:
        context = ssl.create_default_context()
        with smtplib.SMTP(config["host"], config["port"], timeout=15) as server:
            server.ehlo()
            server.starttls(context=context)
            server.ehlo()
            server.login(config["user"], config["password"])
            server.send_message(msg)

        return {"sent": True, "recipient": to_email, "subject": subject}
    except smtplib.SMTPAuthenticationError as auth_err:
        raise HTTPException(
            status_code=401,
            detail=f"SMTP Authentication failed: {str(auth_err)}. Verify that your 16-character Gmail App Password in backend/.env is correct and 2-Step Verification is active."
        )
    except smtplib.SMTPException as smtp_err:
        raise HTTPException(
            status_code=500,
            detail=f"SMTP Protocol Exception during dispatch: {str(smtp_err)}"
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to connect to SMTP server ({config['host']}:{config['port']}): {str(exc)}"
        )

def send_admin_new_lead_alert(name: str, email: str, subject: str, message: str) -> None:
    """
    Background worker task: Dispatches an instant lead alert to the admin's inbox.
    Silently skips if SMTP is not configured so public form submission never breaks.
    """
    config = get_smtp_config()
    if not config["password"] or not config["user"]:
        # Silently skip if SMTP is not yet configured
        return

    admin_email = config["admin_notify_email"] or config["user"]

    try:
        msg = EmailMessage()
        msg["From"] = f'"{config["from_name"]}" <{config["user"]}>'
        msg["To"] = admin_email
        msg["Subject"] = f"[NEW PORTFOLIO LEAD] {name} - {subject}"
        msg["Reply-To"] = email.strip()

        plain_text = f"NEW CLIENT LEAD RECEIVED\n\nName: {name}\nEmail: {email}\nSubject: {subject}\n\nMessage:\n{message}\n\nReply directly to: {email}"
        msg.set_content(plain_text)

        html_body = build_admin_lead_alert_html(name, email, subject, message)
        msg.add_alternative(html_body, subtype="html")

        context = ssl.create_default_context()
        with smtplib.SMTP(config["host"], config["port"], timeout=10) as server:
            server.ehlo()
            server.starttls(context=context)
            server.ehlo()
            server.login(config["user"], config["password"])
            server.send_message(msg)
            print(f"[Lead Alert] Direct SMTP notification delivered to admin {admin_email}.")
    except Exception as e:
        print(f"[Lead Alert Warning] Could not dispatch admin notification: {e}")
