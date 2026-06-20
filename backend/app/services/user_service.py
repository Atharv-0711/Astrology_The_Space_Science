from dataclasses import dataclass
from uuid import UUID


@dataclass(frozen=True)
class UserIdentity:
    id: UUID
    email: str


class UserService:
    """Authentication and profile behavior will be implemented in Phase 10."""

    def normalize_email(self, email: str) -> str:
        return email.strip().lower()
