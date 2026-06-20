from datetime import date
from uuid import UUID, uuid4

from sqlalchemy import Date, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class DashaModel(Base):
    __tablename__ = "dashas"

    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    chart_id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("birth_charts.id"))
    level: Mapped[str] = mapped_column(String(30))
    lord: Mapped[str] = mapped_column(String(30))
    parent_lord: Mapped[str | None] = mapped_column(String(30))
    start_date: Mapped[date] = mapped_column(Date)
    end_date: Mapped[date] = mapped_column(Date)
