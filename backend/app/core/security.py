from datetime import UTC, datetime, timedelta
from typing import Any

from jose import jwt


def create_access_token(
    subject: str,
    secret_key: str,
    algorithm: str,
    expires_delta: timedelta,
    extra_claims: dict[str, Any] | None = None,
) -> str:
    now = datetime.now(UTC)
    payload: dict[str, Any] = {
        "sub": subject,
        "iat": int(now.timestamp()),
        "exp": int((now + expires_delta).timestamp()),
    }
    if extra_claims:
        payload.update(extra_claims)
    return jwt.encode(payload, secret_key, algorithm=algorithm)
