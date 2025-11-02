from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, date
import sys
import os
from fastapi import APIRouter, HTTPException
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from utils.data_loader import DataLoader
from utils.preprocessing import DataPreprocessor
from ml_models.polynomial_regression import PolynomialRegressionModel

current_dir = os.path.dirname(os.path.abspath(__file__))
data_path = os.path.join(current_dir, '..', '..', 'datos', 'html', 'dataset_completo.html')
data_loader = DataLoader(data_path)
df = data_loader.load_data()

MONTH_TO_SEASON = {
    1: 'cold_season', 2: 'cold_season', 3: 'dry_season', 4: 'dry_season',
    5: 'dry_season', 6: 'dry_season', 7: 'rainy_season', 8: 'rainy_season',
    9: 'rainy_season', 10: 'rainy_season', 11: 'cold_season', 12: 'cold_season'
}

MONTHLY_TEMPS = {
    1: 18.5, 2: 17.5, 3: 18.0, 4: 20.0, 5: 22.0, 6: 25.0,
    7: 26.5, 8: 27.0, 9: 26.5, 10: 25.0, 11: 22.0, 12: 26.5
}

SEASONAL_NUTRIENTS = {
    'cold_season': {'din_min': 1.5, 'din_max': 1.5, 'nt_min': 38.5, 'nt_max': 38.5},
    'dry_season': {'din_min': 4.0, 'din_max': 8.0, 'nt_min': 13.0, 'nt_max': 30.0},
    'rainy_season': {'din_min': 4.5, 'din_max': 8.5, 'nt_min': 15.0, 'nt_max': 32.0}
}

class Site(BaseModel):
    id: int
    name: str
    description: Optional[str] = None

class AlgaeSpecies(BaseModel):
    id: int
    name: str
    scientific_name: str
    r2Score: Optional[float] = None
    rmse: Optional[float] = None

class PredictionRequest(BaseModel):
    specie: str = Field(..., description="Nombre de la especie de alga")
    site: str = Field(..., description="Nombre del sitio de cultivo")
    date: str = Field(..., description="Fecha en formato YYYY-MM-DD")
    temperature: Optional[float] = Field(None, ge=0, le=50, description="Temperatura del agua (°C) - Opcional")
    din: Optional[float] = Field(None, ge=0, description="DIN promedio (μM) - Opcional")
    nt: Optional[float] = Field(None, ge=0, description="NT promedio (μM) - Opcional")


class PredictionResponse(BaseModel):
    growth: float = Field(..., description="Crecimiento predicho en g/L")
    dateActual: str = Field(..., description="Fecha actual en formato YYYY-MM-DD")
    temperature: float = Field(..., description="Temperatura en °C")
    din: float = Field(..., description="DIN en μM")
    nt: float = Field(..., description="NT en μM")
    season: str = Field(..., description="Temporada del año")
    confidence: Optional[dict]= Field(None, description="Intervalo de confianza de la predicción")


models_cache = {}
preprocessors_cache = {}

def load_model(species: str):
    if species not in models_cache:
        try:
            model_path = f"trained_models/model_{species.replace(' ', '_')}.pkl"
            preprocessor_path = f"trained_models/preprocessor_{species.replace(' ', '_')}.pkl"
            model = PolynomialRegressionModel(species_name=species)
            model.load(model_path)
            preprocessor = DataPreprocessor()
            preprocessor.load(preprocessor_path)
            models_cache[species] = model
            preprocessors_cache[species] = preprocessor
        except Exception as e:
            raise HTTPException(status_code=404, detail=f"Modelo para la especie '{species}' no encontrado.")
    return models_cache[species], preprocessors_cache[species]

router = APIRouter(prefix="/prediction", tags=["Prediction"])

@router.get("/sites")
async def get_sites():
    try:
        sites_list = data_loader.get_sites_list()

        sites = [
            Site(id=i+1, name=site, description=f"Descripción del sitio {site}")
            for i, site in enumerate(sites_list)
        ]

        return sites
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error al obtener la lista de sitios.")

@router.get("/species", response_model=List[AlgaeSpecies])
async def get_species():
    try:
        import json

        summary_path = "trained_models/training_summary.json"
        with open(summary_path, 'r', encoding='utf-8') as f:
            training_summary = json.load(f)
        
        species = []
        species_id = 1

        for species_name, info in training_summary.items():
            if info["status"] == "success":
                species.append(AlgaeSpecies(
                    id=species_id,
                    name=species_name,
                    scientific_name=species_name,
                    r2Score=info["metrics"]["test"]["r2"],
                    rmse=info["metrics"]["test"]["rmse"]
                ))
                species_id += 1

        species.sort(key=lambda x: x.r2Score or 0, reverse=True)

        return species
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error al obtener la lista de especies.")

@router.post("/api/prediction", response_model=PredictionResponse)
async def run_prediction(request: PredictionRequest):
    """
    Realizar predicción de biomasa para una especie, sitio y fecha específicos

    **Parámetros:**
    - specie: Nombre de la especie
    - site: Nombre del sitio
    - date: Fecha en formato ISO (YYYY-MM-DD)
    - temperature: (Opcional) Temperatura del agua en °C. Si no se proporciona, se calcula según el mes
    - din: (Opcional) DIN promedio en μM. Si no se proporciona, se calcula según la temporada
    - nt: (Opcional) NT promedio en μM. Si no se proporciona, se calcula según la temporada

    **Retorna:**
    - growth: Biomasa predicha
    - dateActual: Fecha procesada
    - temperature: Temperatura utilizada
    - din: DIN utilizado
    - nt: NT utilizado
    - season: Temporada del año
    - confidence: Métricas del modelo
    """
    try:
        # Validar especie
        if request.specie not in data_loader.get_species_list():
            raise HTTPException(
                status_code=404,
                detail=f"Species '{request.specie}' not found"
            )

        # Parsear fecha
        try:
            prediction_date = datetime.fromisoformat(request.date.replace('Z', '+00:00'))
        except:
            raise HTTPException(
                status_code=400,
                detail="Invalid date format. Use ISO format: YYYY-MM-DD"
            )

        # Obtener mes y temporada
        month = prediction_date.month
        season = MONTH_TO_SEASON[month]

        # Usar valores proporcionados o calcularlos automáticamente
        if request.temperature is not None:
            temperature = request.temperature
        else:
            temperature = MONTHLY_TEMPS[month]

        # Obtener nutrientes (calcular din y nt si no se proporcionan)
        nutrients = SEASONAL_NUTRIENTS[season]

        if request.din is not None:
            din_value = request.din
            # Usar el din proporcionado para calcular min/max aproximados
            din_min = din_value * 0.9  # -10% aproximado
            din_max = din_value * 1.1  # +10% aproximado
        else:
            din_min = nutrients['din_min']
            din_max = nutrients['din_max']
            din_value = (din_min + din_max) / 2

        if request.nt is not None:
            nt_value = request.nt
            # Usar el nt proporcionado para calcular min/max aproximados
            nt_min = nt_value * 0.85  # -15% aproximado
            nt_max = nt_value * 1.15  # +15% aproximado
        else:
            nt_min = nutrients['nt_min']
            nt_max = nutrients['nt_max']
            nt_value = (nt_min + nt_max) / 2

        # Cargar modelo
        model, preprocessor = load_model(request.specie)
        
        # Preparar datos para predicción
        import pandas as pd
        
        input_data = pd.DataFrame([{
            'Temperature': temperature,
            'DIN_Min': din_min,
            'DIN_Max': din_max,
            'NT_Min': nt_min,
            'NT_Max': nt_max,
            'Season': season,
            'Biomass': 0  # Placeholder
        }])

        # Preprocesar y predecir
        X, _ = preprocessor.prepare_features(input_data, fit=False)
        prediction = model.predict(X)[0]

        # Preparar respuesta
        response = PredictionResponse(
            growth=round(float(prediction), 2),
            dateActual=prediction_date.isoformat(),
            temperature=round(temperature, 2),
            din=round(din_value, 2),
            nt=round(nt_value, 2),
            season=season,
            confidence={
                'r2_score': round(model.metrics['test']['r2'], 4),
                'rmse': round(model.metrics['test']['rmse'], 2),
                'mae': round(model.metrics['test']['mae'], 2)
            }
        )

        return response

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@router.get("/species/{species_name}/max-biomass")
async def get_max_biomass_for_species(species_name: str):
    try:
        species_data = df[df['Algae'] == species_name]
        if species_data.empty:
            raise HTTPException(status_code=404, detail=f"Especie '{species_name}' no encontrada en el dataset.")
        
        max_biomass = float(species_data['Biomass'].max())
        return {"species": species_name, "maxBiomass": round(max_biomass, 2), "unit": "g/m²"}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error al obtener la biomasa máxima para la especie.")
    

@router.get("/species/{species_name}/info")
async def get_species_info(species_name: str):
    try:
        import json
        summary_path = "trained_models/training_summary.json"
        with open(summary_path, 'r', encoding='utf-8') as f:
            training_summary = json.load(f)
        if species_name not in training_summary:
            raise HTTPException(status_code=404, detail=f"Especie '{species_name}' no encontrada en el resumen de entrenamiento.")
        info = training_summary[species_name]

        if info["status"] != "success":
            raise HTTPException(status_code=404, detail=f"No hay información disponible para la especie '{species_name}' debido a un error en el entrenamiento.")
        
        species_data = df[df['Algae'] == species_name]

        return {
            "species": species_name,
            "modelMetrics": {
                "r2Score": info['metrics']['test']['r2'],
                "rmse": info['metrics']['test']['rmse'],
                "mae": info['metrics']['test']['mae']
            },
            "dataStats": {
                "totalSamples": info['n_samples'],
                "trainSamples": info['metrics']['n_train_samples'],
                "testSamples": info['metrics']['n_test_samples'],
                "biomassMin": float(species_data['Biomass'].min()),
                "biomassMax": float(species_data['Biomass'].max()),
                "biomassMean": float(species_data['Biomass'].mean()),
                "biomassStd": float(species_data['Biomass'].std())
            }
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error al obtener la información de la especie.")