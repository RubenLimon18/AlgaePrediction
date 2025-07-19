import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config.settings import settings
import logging

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_username = settings.SMTP_USERNAME
        self.smtp_password = settings.SMTP_PASSWORD
        self.from_email = settings.FROM_EMAIL

    async def send_email(self, to_email: str, subject: str, html_content: str):
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.from_email
            msg['To'] = to_email

            html_part = MIMEText(html_content, 'html')
            msg.attach(html_part)

            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)
                
            logger.info(f"Email sent successfully to {to_email}")
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            raise

    async def send_verification_email(self, to_email: str, verification_token: str):
        verification_url = f"{settings.FRONTEND_URL}/verify-email?token={verification_token}"
        
        html_content = f"""
        <html>
        <body>
            <h2>Welcome to AlgaeTrack!</h2>
            <p>Thank you for registering. Please click the link below to verify your email address:</p>
            <a href="{verification_url}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create this account, please ignore this email.</p>
        </body>
        </html>
        """
        
        await self.send_email(to_email, "Verify your AlgaeTrack account", html_content)

    async def send_magic_link(self, to_email: str, magic_token: str):
        magic_url = f"{settings.FRONTEND_URL}/magic-login?token={magic_token}"
        
        html_content = f"""
        <html>
        <body>
            <h2>AlgaeTrack Login Link</h2>
            <p>Click the link below to log into your AlgaeTrack account:</p>
            <a href="{magic_url}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login to AlgaeTrack</a>
            <p>This link will expire in 15 minutes.</p>
            <p>If you didn't request this login link, please ignore this email.</p>
        </body>
        </html>
        """
        
        await self.send_email(to_email, "Your AlgaeTrack login link", html_content)

    async def send_invitation_email(self, to_email: str, invitation_token: str, inviter_name: str, role: str):
        invitation_url = f"{settings.FRONTEND_URL}/accept-invitation?token={invitation_token}"
        
        html_content = f"""
        <html>
        <body>
            <h2>You're invited to join AlgaeTrack!</h2>
            <p>{inviter_name} has invited you to join AlgaeTrack as a {role}.</p>
            <p>Click the link below to accept the invitation and set up your account:</p>
            <a href="{invitation_url}" style="background-color: #FF9800; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Accept Invitation</a>
            <p>This invitation will expire in 7 days.</p>
        </body>
        </html>
        """
        
        await self.send_email(to_email, f"Invitation to join AlgaeTrack as {role}", html_content)

email_service = EmailService()