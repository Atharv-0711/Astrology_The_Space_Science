from datetime import date, datetime, time
from uuid import UUID, uuid4

from sqlalchemy import Date, DateTime, Float, ForeignKey, String, Time
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class ChartModel(Base):
    __tablename__ = "birth_charts"

    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID | None] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("users.id"))
    name: Mapped[str] = mapped_column(String(120))
    birth_date: Mapped[date] = mapped_column(Date)
    birth_time: Mapped[time] = mapped_column(Time)
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    timezone: Mapped[float] = mapped_column(Float)
    settings: Mapped[dict[str, object]] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
