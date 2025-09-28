from fastapi import APIRouter, HTTPException
from typing import List
from schemas.parameter import SiteSchema
from models.parameters import get_all_parameters

router = APIRouter(prefix="/parameters", tags=["Parameters"])

# todos los documentos de una coleccion
@router.get("/{param_type}", response_model=List[SiteSchema])
async def fetch_parameters(param_type: str):
    allowed = ["temperature", "din", "nt"]
    if param_type not in allowed:
        raise HTTPException(status_code=400, detail="Tipo no válido")
    return get_all_parameters(param_type)
