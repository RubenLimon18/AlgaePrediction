from typing import Optional
from fastapi import APIRouter, Query

from database.db import get_collection
from models.algae import Algae
from schemas.algaes import AlgaeResponse




router = APIRouter(prefix="/algaes", tags=["Algaes"])


# Obtener en general los primeros 100
@router.get("/") # ?page=3&page_size=100
async def get_all_page(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=1000)
):  
    collection = get_collection("dataset")
    skip = (page - 1) * page_size
    total = collection.count_documents({})

    cursor = (collection
              .find()
              .sort("Date", -1)
              .skip(skip)
              .limit(page_size))
    algaes = AlgaeResponse.list_serial(cursor)
    
    return {
        "data": algaes,
        "maxAlgaes": total
        }


# Obtener por site
@router.get("/filter") # ?page=3&page_size=100
async def get_all_filter(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=1000),
    site: Optional[str] = Query(None), # Site es opcional
    month: Optional[str] = Query(None), # Site es opcional
    year: Optional[str] = Query(None), # Site es opcional
    season: Optional[str] = Query(None), # Site es opcional
    algae: Optional[str] = Query(None) # Site es opcional
):
    
    filter_query = {}
    if site:
        filter_query["Site"] = site
    if month:
        filter_query["Month"] = month
    if year:
        filter_query["Year"] = year
    if season:
        filter_query["Season"] = season
    if algae:
        filter_query["Algae"] = algae



    skip = (page - 1) * page_size
    collection = get_collection("dataset")
    total = collection.count_documents(filter_query)

    cursor = (collection
              .find(filter_query)
              .sort("Date", -1)
              .skip(skip)
              .limit(page_size))
    algaes = AlgaeResponse.list_serial(cursor)
    return {
        "data": algaes,
        "maxAlgaes": total
        }


# Solo para nosotros
@router.get("/all")
async def get_all():
    algaes = AlgaeResponse.list_serial()
    return algaes



