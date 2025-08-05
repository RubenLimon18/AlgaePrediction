from sqlite3 import Date
from pydantic import BaseModel


class AlgaeResponse(BaseModel):
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



    # GET Method
    @staticmethod
    def individual_serial(data) -> dict:
        return {
            "site": str(data["Site"]),
            "date": str(data["Date"]),
            "month": str(data["Month"]),
            "year": str(data["Year"]),
            "season": str(data["Season"]),
            "alga": str(data["Alga"]),
            "biomass": float(data["Biomass"]),
            "din_max": float(data["DIN_Max"]),
            "din_min": float(data["DIN_Min"]),
            "nt_max": float(data["NT_Max"]),
            "nt_min": float(data["NT_Min"]),
            "temp": float(data["Temperature"])
        }

    @staticmethod
    def list_serial(algaes) -> list :
        return [AlgaeResponse.individual_serial(algae) for algae in algaes]
