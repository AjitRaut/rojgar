import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional

from app.core.config import settings

logger = logging.getLogger(__name__)


def _smtp_configured() -> bool:
    return bool(settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASSWORD)


def send_email(to_email: str, subject: str, html_body: str, text_body: Optional[str] = None) -> bool:
    if not _smtp_configured():
        logger.warning(
            "SMTP not configured. Email would be sent to %s. Subject: %s",
            to_email,
            subject,
        )
        logger.info("Email body:\n%s", text_body or html_body)
        return False

    from_email = settings.SMTP_FROM_EMAIL or settings.SMTP_USER
    from_name = settings.SMTP_FROM_NAME

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{from_name} <{from_email}>"
    msg["To"] = to_email

    if text_body:
        msg.attach(MIMEText(text_body, "plain"))
    msg.attach(MIMEText(html_body, "html"))

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
            if settings.SMTP_USE_TLS:
                server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(from_email, [to_email], msg.as_string())
        logger.info("Email sent to %s", to_email)
        return True
    except Exception as e:
        logger.error("Failed to send email to %s: %s", to_email, e)
        return False


def send_password_reset_email(to_email: str, full_name: str, reset_link: str) -> bool:
    subject = "Reset your Rojgar Find password"
    text_body = (
        f"Hi {full_name},\n\n"
        "We received a request to reset your password. Click the link below to set a new one. "
        "This link will expire in 1 hour.\n\n"
        f"{reset_link}\n\n"
        "If you didn't request this, you can safely ignore this email.\n\n"
        "— The Rojgar Find Team"
    )
    html_body = f"""<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; color: #1e293b;">
  <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6, #f97316); padding: 32px; border-radius: 16px 16px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Rojgar Find</h1>
  </div>
  <div style="background: #f8fafc; padding: 32px; border-radius: 0 0 16px 16px;">
    <h2 style="margin-top: 0;">Reset your password</h2>
    <p>Hi {full_name},</p>
    <p>We received a request to reset your password. Click the button below to set a new one. This link will expire in 1 hour.</p>
    <p style="text-align: center; margin: 32px 0;">
      <a href="{reset_link}" style="background: #6366f1; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">Reset password</a>
    </p>
    <p style="font-size: 13px; color: #64748b;">Or copy this link into your browser:<br/>
      <a href="{reset_link}" style="color: #6366f1; word-break: break-all;">{reset_link}</a>
    </p>
    <p style="font-size: 13px; color: #64748b; margin-top: 32px;">If you didn't request this, you can safely ignore this email.</p>
  </div>
</body>
</html>"""
    return send_email(to_email, subject, html_body, text_body)