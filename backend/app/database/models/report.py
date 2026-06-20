from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class ReportModel(Base):
    __tablename__ = "reports"

    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    chart_id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("birth_charts.id"))
    sections: Mapped[dict[str, object]] = mapped_column(JSONB)
    source_factors: Mapped[dict[str, object]] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
