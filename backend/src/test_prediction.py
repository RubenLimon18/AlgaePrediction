"""
Script de ejemplo para hacer predicciones de biomasa de algas
Ejecutar desde: backend/src/
Comando: python ejemplo_prediccion.py
"""
import os
import sys

# Agregar el directorio actual al path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from utils.data_loader import DataLoader
from utils.preprocessing import DataPreprocessor
from ml_models.polynomial_regression import PolynomialRegressionModel


def ejemplo_1_prediccion_simple():
    """Ejemplo 1: Predicción simple para una especie"""
    print("\n" + "="*70)
    print("  EJEMPLO 1: PREDICCIÓN SIMPLE")
    print("="*70)
    
    # Parámetros de entrada
    species = "Gracilaria sp3"  # La mejor del ranking
    temperature = 25.0          # Temperatura en °C
    din_min = 4.0              # DIN mínimo en μM
    din_max = 8.0              # DIN máximo en μM
    nt_min = 13.0              # NT mínimo en μM
    nt_max = 30.0              # NT máximo en μM
    season = "rainy_season"    # Temporada: cold_season, dry_season, rainy_season
    
    print(f"\n📋 Parámetros de entrada:")
    print(f"  • Especie: {species}")
    print(f"  • Temperatura: {temperature}°C")
    print(f"  • DIN: {din_min} - {din_max} μM")
    print(f"  • NT: {nt_min} - {nt_max} μM")
    print(f"  • Temporada: {season}")
    
    # Cargar modelo y preprocesador
    print(f"\n⏳ Cargando modelo para {species}...")
    
    model_path = f"trained_models/model_{species.replace(' ', '_')}.pkl"
    preprocessor_path = f"trained_models/preprocessor_{species.replace(' ', '_')}.pkl"
    
    # Cargar modelo
    model = PolynomialRegressionModel(species_name=species)
    model.load(model_path)
    
    # Cargar preprocesador
    preprocessor = DataPreprocessor()
    preprocessor.load(preprocessor_path)
    
    print("✅ Modelo cargado exitosamente")
    
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
    
    # Preprocesar
    X, _ = preprocessor.prepare_features(input_data, fit=False)
    
    # Predecir
    print(f"\n🔮 Realizando predicción...")
    prediction = model.predict(X)[0]
    
    # Mostrar resultado
    print(f"\n" + "="*70)
    print(f"  🎯 RESULTADO DE LA PREDICCIÓN")
    print("="*70)
    print(f"\n  Biomasa predicha: {prediction:.2f} g/m²")
    
    # Mostrar métricas del modelo
    metrics = model.metrics['test']
    print(f"\n  📊 Confiabilidad del modelo:")
    print(f"     • R² Score: {metrics['r2']:.4f} (Explica {metrics['r2']*100:.1f}% de la varianza)")
    print(f"     • RMSE: {metrics['rmse']:.2f}")
    print(f"     • MAE: ±{metrics['mae']:.2f} g/m² (margen de error)")
    
    print(f"\n  💡 Interpretación:")
    if prediction > 0:
        print(f"     La biomasa esperada es {prediction:.2f} ± {metrics['mae']:.2f} g/m²")
        print(f"     Rango estimado: {max(0, prediction - metrics['mae']):.2f} - {prediction + metrics['mae']:.2f} g/m²")
    else:
        print(f"     La biomasa esperada es muy baja o nula")


def ejemplo_2_comparar_temporadas():
    """Ejemplo 2: Comparar biomasa en diferentes temporadas"""
    print("\n" + "="*70)
    print("  EJEMPLO 2: COMPARACIÓN POR TEMPORADAS")
    print("="*70)
    
    species = "Gracilaria sp3"
    
    # Condiciones base
    base_params = {
        'Temperature': 25.0,
        'DIN_Min': 4.0,
        'DIN_Max': 8.0,
        'NT_Min': 13.0,
        'NT_Max': 30.0
    }
    
    print(f"\n📋 Especie: {species}")
    print(f"   Condiciones base:")
    print(f"   • Temperatura: {base_params['Temperature']}°C")
    print(f"   • DIN: {base_params['DIN_Min']}-{base_params['DIN_Max']} μM")
    print(f"   • NT: {base_params['NT_Min']}-{base_params['NT_Max']} μM")
    
    # Cargar modelo
    model_path = f"trained_models/model_{species.replace(' ', '_')}.pkl"
    preprocessor_path = f"trained_models/preprocessor_{species.replace(' ', '_')}.pkl"
    
    model = PolynomialRegressionModel(species_name=species)
    model.load(model_path)
    
    preprocessor = DataPreprocessor()
    preprocessor.load(preprocessor_path)
    
    # Predecir para cada temporada
    import pandas as pd
    seasons = {
        'cold_season': 'Temporada Fría (Feb, Nov, Dec)',
        'dry_season': 'Temporada Seca (Mar-Jun)',
        'rainy_season': 'Temporada Lluviosa (Jul-Oct)'
    }
    
    results = []
    
    print(f"\n🔮 Predicciones por temporada:\n")
    
    for season_key, season_name in seasons.items():
        input_data = pd.DataFrame([{
            **base_params,
            'Season': season_key,
            'Biomass': 0
        }])
        
        X, _ = preprocessor.prepare_features(input_data, fit=False)
        prediction = model.predict(X)[0]
        
        results.append((season_name, prediction))
    
    # Ordenar por biomasa
    results.sort(key=lambda x: x[1], reverse=True)
    
    # Mostrar resultados
    print("  " + "-"*66)
    print(f"  {'Temporada':<40} {'Biomasa (g/m²)':>20}")
    print("  " + "-"*66)
    
    for season_name, biomass in results:
        bar = "█" * int(biomass / 2)  # Barra visual
        print(f"  {season_name:<40} {biomass:>15.2f}  {bar}")
    
    print("  " + "-"*66)
    
    # Análisis
    best_season = results[0][0]
    best_biomass = results[0][1]
    worst_season = results[-1][0]
    worst_biomass = results[-1][1]
    
    print(f"\n  💡 Análisis:")
    print(f"     • Mejor temporada: {best_season} ({best_biomass:.2f} g/m²)")
    print(f"     • Peor temporada: {worst_season} ({worst_biomass:.2f} g/m²)")
    print(f"     • Diferencia: {best_biomass - worst_biomass:.2f} g/m² ({((best_biomass/worst_biomass - 1)*100):.1f}% más)")


def ejemplo_3_top_especies():
    """Ejemplo 3: Predecir múltiples especies y encontrar las mejores"""
    print("\n" + "="*70)
    print("  EJEMPLO 3: TOP ESPECIES CON MAYOR BIOMASA PREDICHA")
    print("="*70)
    
    # Condiciones ambientales
    conditions = {
        'Temperature': 26.0,
        'DIN_Min': 4.5,
        'DIN_Max': 7.5,
        'NT_Min': 15.0,
        'NT_Max': 28.0,
        'Season': 'rainy_season'
    }
    
    print(f"\n📋 Condiciones ambientales:")
    print(f"   • Temperatura: {conditions['Temperature']}°C")
    print(f"   • DIN: {conditions['DIN_Min']}-{conditions['DIN_Max']} μM")
    print(f"   • NT: {conditions['NT_Min']}-{conditions['NT_Max']} μM")
    print(f"   • Temporada: {conditions['Season']}")
    
    # Lista de especies con mejores modelos (R² > 0.30)
    top_species = [
        "Gracilaria sp3",
        "Prionitis sp",
        "Hypnea sp2",
        "Laurencia sp2",
        "Palisada pedrochei"
    ]
    
    print(f"\n🔮 Prediciendo para las 5 especies con mejores modelos...")
    
    import pandas as pd
    results = []
    
    for species in top_species:
        try:
            # Cargar modelo
            model_path = f"trained_models/model_{species.replace(' ', '_')}.pkl"
            preprocessor_path = f"trained_models/preprocessor_{species.replace(' ', '_')}.pkl"
            
            model = PolynomialRegressionModel(species_name=species)
            model.load(model_path)
            
            preprocessor = DataPreprocessor()
            preprocessor.load(preprocessor_path)
            
            # Preparar datos
            input_data = pd.DataFrame([{
                **conditions,
                'Biomass': 0
            }])
            
            X, _ = preprocessor.prepare_features(input_data, fit=False)
            prediction = model.predict(X)[0]
            
            r2 = model.metrics['test']['r2']
            
            results.append((species, prediction, r2))
            
        except Exception as e:
            print(f"  ⚠️  Error con {species}: {e}")
    
    # Ordenar por biomasa predicha
    results.sort(key=lambda x: x[1], reverse=True)
    
    # Mostrar resultados
    print(f"\n" + "="*70)
    print(f"  🏆 RANKING DE ESPECIES")
    print("="*70)
    print(f"\n  {'#':<4} {'Especie':<30} {'Biomasa (g/m²)':>15} {'R² Score':>10}")
    print("  " + "-"*66)
    
    for i, (species, biomass, r2) in enumerate(results, 1):
        confidence = "⭐" if r2 > 0.4 else "✓"
        print(f"  {i:<4} {species:<30} {biomass:>15.2f} {r2:>10.4f} {confidence}")
    
    print("  " + "-"*66)
    
    # Recomendación
    winner = results[0]
    print(f"\n  💡 Recomendación:")
    print(f"     En estas condiciones, {winner[0]} tendría la mayor biomasa")
    print(f"     con aproximadamente {winner[1]:.2f} g/m² (R²={winner[2]:.4f})")


def main():
    """Función principal"""
    print("\n" + "="*70)
    print("  🌊 EJEMPLOS DE PREDICCIÓN DE BIOMASA DE ALGAS")
    print("="*70)
    
    try:
        # Ejecutar ejemplos
        ejemplo_1_prediccion_simple()
        ejemplo_2_comparar_temporadas()
        ejemplo_3_top_especies()
        
        print("\n" + "="*70)
        print("  ✅ EJEMPLOS COMPLETADOS EXITOSAMENTE")
        print("="*70)
        print()
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()