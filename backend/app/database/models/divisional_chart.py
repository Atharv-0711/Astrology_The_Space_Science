from uuid import UUID, uuid4

from sqlalchemy import ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class DivisionalChartModel(Base):
    __tablename__ = "divisional_charts"

    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    chart_id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("birth_charts.id"))
    chart_type: Mapped[str] = mapped_column(String(10))
    payload: Mapped[dict[str, object]] = mapped_column(JSONB)
