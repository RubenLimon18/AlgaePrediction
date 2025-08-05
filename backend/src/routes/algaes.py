from typing import Optional
from fastapi import APIRouter, Query

from database.db import get_collection
from schemas.algaes import AlgaeResponse




router = APIRouter(prefix="/algaes", tags=["Algaes"])


# Obtener en general los primeros 100
@router.get("/") # ?page=3&page_size=100
async def get_all_by_page(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=1000)
):
    skip = (page - 1) * page_size
    cursor = (get_collection("dataset")
              .find()
              .sort("Date", -1)
              .skip(skip)
              .limit(page_size))
    algaes = AlgaeResponse.list_serial(cursor)
    return algaes


# Obtener por site
@router.get("/filter") # ?page=3&page_size=100
async def get_all_by_page(
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
    cursor = (get_collection("dataset")
              .find(filter_query)
              .sort("Date", -1)
              .skip(skip)
              .limit(page_size))
    algaes = AlgaeResponse.list_serial(cursor)
    return algaes


# Solo para nosotros
@router.get("/all") # ?page=3&page_size=100
async def get_all_by_page():
    algaes = AlgaeResponse.list_serial()
    return algaes



