from pydantic import BaseModel


class Algae(BaseModel):
    site: str
    date: str
    month: str
    year: str
    season: str
    alga: str
    biomass: float    
    din_max: float    
    din_min: float    
    nt_max: float     
    nt_min: float     
    temp: float   