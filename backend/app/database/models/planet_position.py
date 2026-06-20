from uuid import UUID, uuid4

from sqlalchemy import Float, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class PlanetPositionModel(Base):
    __tablename__ = "planet_positions"

    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    chart_id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("birth_charts.id"))
    chart_type: Mapped[str] = mapped_column(String(10), default="D1")
    planet: Mapped[str] = mapped_column(String(30))
    longitude: Mapped[float] = mapped_column(Float)
    latitude: Mapped[float] = mapped_column(Float)
    speed: Mapped[float] = mapped_column(Float)
    sign_number: Mapped[int] = mapped_column(Integer)
    degree: Mapped[float] = mapped_column(Float)
    house: Mapped[int | None] = mapped_column(Integer)
    dignity: Mapped[dict[str, object]] = mapped_column(JSONB)
