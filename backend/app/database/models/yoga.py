from uuid import UUID, uuid4

from sqlalchemy import Float, ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class YogaModel(Base):
    __tablename__ = "yogas"

    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    chart_id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("birth_charts.id"))
    name: Mapped[str] = mapped_column(String(120))
    strength: Mapped[float] = mapped_column(Float)
    evidence: Mapped[dict[str, object]] = mapped_column(JSONB)
    interpretation_key: Mapped[str | None] = mapped_column(String(120))
