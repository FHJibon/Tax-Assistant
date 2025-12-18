from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
import hashlib
from app.core.config import SMTP_SERVER, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD, SENDER_EMAIL, ACCESS_TOKEN_EXPIRE_MINUTES, SECRET_KEY, ALGORITHM
import os
import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto"
)

def get_password_hash(password: str):
    raw = password.encode("utf-8")
    return pwd_context.hash(password)

def generate_verification_code():
    return str(random.randint(100000, 999999))

def send_verification_email(recipient_email: str, code: str, subject: str = "Your Verification Code"):
    if not all([SMTP_SERVER, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD, SENDER_EMAIL]):
        raise ValueError("SMTP credentials are not fully set in environment variables.")

    body = f"Hey,\n\nYour verification code is: {code}\n\nThis code is only valid for 5 minutes.\n\nRegards,\nFerous Hasan"

    msg = MIMEMultipart()
    msg['From'] = SENDER_EMAIL
    msg['To'] = recipient_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.sendmail(SENDER_EMAIL, recipient_email, msg.as_string())
    except Exception as e:
        raise RuntimeError(f"Failed to send email: {e}")

def send_otp(recipient_email: str, purpose: str = "login") -> str:
    # Always generate a random verification code
    code = generate_verification_code()
    subject = f"Your {purpose.capitalize()} Code"
    send_verification_email(recipient_email, code, subject)
    return code
    
def verify_password(plain: str, hashed: str):
    raw = plain.encode("utf-8")
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError as e:
        raise ValueError(f"Invalid token: {e}")