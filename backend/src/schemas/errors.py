from pydantic import BaseModel

class SimpleErrorResponse(BaseModel):
    message: str
    field: str | None = None  # Opcional: incluir el campo con error