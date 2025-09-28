from pydantic import BaseModel
from typing import List

# para parametros (temperatura, nt, din)
class DataPoint(BaseModel):
    site: str
    valor: float
    month: str
    season: str

# para cada sitio 
class SiteSchema(BaseModel):
    id: int
    name: str
    data: List[DataPoint]
