from __future__ import annotations
import asyncio
import random
import smtplib
from datetime import datetime, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    ALGORITHM,
    SECRET_KEY,
    SENDER_EMAIL,
    SMTP_PASSWORD,
    SMTP_PORT,
    SMTP_SERVER,
    SMTP_USERNAME,
)

pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto"
)

def otp_code() -> str:
    return str(random.randint(100000, 999999))

async def hash_pw(password: str) -> str:
    return await asyncio.to_thread(pwd_context.hash, password)

async def check_pw(plain: str, hashed: str) -> bool:
    return await asyncio.to_thread(pwd_context.verify, plain, hashed)


def _send_mail_sync(*, recipient_email: str, subject: str, body: str) -> None:
    if not all([SMTP_SERVER, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD, SENDER_EMAIL]):
        raise ValueError("SMTP credentials are not fully set in environment variables.")

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

async def send_mail(recipient_email: str, subject: str, body: str) -> None:
    await asyncio.to_thread(_send_mail_sync, recipient_email=recipient_email, subject=subject, body=body)


async def send_otp(recipient_email: str, purpose: str = "login") -> str:
    code = otp_code()
    subject = f"Your {purpose.capitalize()} Code"
    body = (
        "Hey,\n\n"
        f"Your verification code is: {code}\n\n"
        "This code is only valid for 5 minutes.\n\n"
        "Regards,\nFerous Hasan"
    )
    await send_mail(recipient_email, subject, body)
    return code

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