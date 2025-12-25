from __future__ import annotations
from pathlib import Path
from typing import Any, Dict, Optional, Tuple

import re
import subprocess

from jinja2 import Environment, FileSystemLoader, select_autoescape
from sqlalchemy.ext.asyncio import AsyncSession
from app.utils.tax_calculate import build_tax_return_context

def _get_jinja_env() -> Environment:
    base_dir = Path(__file__).resolve().parent.parent  
    templates_dir = base_dir / "utils"
    env = Environment(
        loader=FileSystemLoader(str(templates_dir)),
        autoescape=select_autoescape(enabled_extensions=("html", "xml")),
    )
    return env

async def _store_generated_pdf(
    db: AsyncSession,
    *,
    user_id: int,
    session_id: str,
    pdf_bytes: bytes,
    user_name_override: Optional[str] = None) -> str:

    from app.model.model import GeneratedFile, User
    user = await db.get(User, user_id)
    user_name_db = getattr(user, "name", "") if user is not None else ""
    user_name = (user_name_override or user_name_db) or ""
    safe_base = (user_name or f"user_{user_id}").strip() or f"user_{user_id}"
    safe_base = re.sub(r"[^A-Za-z0-9]+", "_", safe_base).strip("_") or f"user_{user_id}"
    filename = f"{safe_base}.pdf"

    record = GeneratedFile(
        user_id=user_id,
        user_name=user_name or safe_base,
        filename=filename,
        session_id=session_id,
        mime_type="application/pdf",
        size=len(pdf_bytes) if pdf_bytes is not None else 0,
        content=pdf_bytes,
    )

    db.add(record)
    try:
        await db.commit()
    except Exception:
        await db.rollback()
        fallback = GeneratedFile(
            user_id=user_id,
            user_name=user_name or safe_base,
            filename=filename,
        )
        db.add(fallback)
        await db.commit()

    return filename

def _html_to_pdf_bytes(html: str) -> bytes:
    base_dir = Path(__file__).resolve().parent.parent
    renderer = base_dir.parent / "node" / "render.js"
    if not renderer.exists():
        raise RuntimeError("PDF renderer is missing. Expected Backend/node/render.js")

    completed = subprocess.run(
        ["node", str(renderer)],
        input=html.encode("utf-8"),
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        timeout=120,
    )
    if completed.returncode != 0:
        stderr = (completed.stderr or b"").decode("utf-8", errors="replace")
        raise RuntimeError(f"Failed to generate PDF via Node renderer. {stderr}")
    if not completed.stdout:
        raise RuntimeError("Node PDF renderer returned empty output")
    return completed.stdout

async def generate_tax_return_pdf(db: AsyncSession, user_id: int, session_id: str) -> Tuple[bytes, str]:
    context = await build_tax_return_context(db=db, user_id=user_id, session_id=session_id)
    env = _get_jinja_env()
    template = env.get_template("tax_return.html")
    html = template.render(c=context)
    pdf_bytes = _html_to_pdf_bytes(html)
    filename = await _store_generated_pdf(
        db, user_id=user_id, session_id=session_id, pdf_bytes=pdf_bytes, user_name_override=context.get("name")
    )
    return pdf_bytes, filename


async def generate_tax_return_pdf_with_overrides(
    db: AsyncSession,
    *,
    user_id: int,
    session_id: str,
    overrides: Optional[Dict[str, Any]] = None,
) -> Tuple[bytes, str]:
    context = await build_tax_return_context(db=db, user_id=user_id, session_id=session_id, overrides=overrides)
    env = _get_jinja_env()
    template = env.get_template("tax_return.html")
    html = template.render(c=context)
    pdf_bytes = _html_to_pdf_bytes(html)
    filename = await _store_generated_pdf(
        db, user_id=user_id, session_id=session_id, pdf_bytes=pdf_bytes, user_name_override=context.get("name")
    )
    return pdf_bytes, filename