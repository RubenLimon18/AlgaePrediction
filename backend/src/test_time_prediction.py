"""
Script para predecir biomasa de algas en los próximos meses con visualizaciones
Ejecutar desde: backend/src/
Comando: python prediccion_temporal.py
"""
import os
import sys
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from typing import List, Dict

# Agregar el directorio actual al path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from utils.data_loader import DataLoader
    from utils.preprocessing import DataPreprocessor
    from ml_models.polynomial_regression import PolynomialRegressionModel
except:
    # Si estamos en /mnt/project, usar imports relativos
    sys.path.insert(0, '.')
    from utils.data_loader import DataLoader
    from utils.preprocessing import DataPreprocessor
    from ml_models.polynomial_regression import PolynomialRegressionModel

# Configurar estilo de gráficas
plt.style.use('seaborn-v0_8-darkgrid')
sns.set_palette("husl")


class TemporalBiomassPredictor:
    """Predictor de biomasa con proyecciones temporales"""
    
    def __init__(self):
        """Inicializar el predictor temporal"""
        self.models = {}
        self.preprocessors = {}
        
        # Mapeo de meses a temporadas
        self.month_to_season = {
            1: 'cold_season',   # Enero (no está en el mapeo original, usar cold)
            2: 'cold_season',   # Febrero
            3: 'dry_season',    # Marzo
            4: 'dry_season',    # Abril
            5: 'dry_season',    # Mayo
            6: 'dry_season',    # Junio
            7: 'rainy_season',  # Julio
            8: 'rainy_season',  # Agosto
            9: 'rainy_season',  # Septiembre
            10: 'rainy_season', # Octubre
            11: 'cold_season',  # Noviembre
            12: 'cold_season'   # Diciembre
        }
        
        # Temperaturas promedio por mes (estimadas para el Golfo de California)
        self.monthly_temps = {
            1: 18.5, 2: 17.5, 3: 18.0, 4: 20.0, 5: 22.0, 6: 25.0,
            7: 26.5, 8: 27.0, 9: 26.5, 10: 25.0, 11: 22.0, 12: 19.5
        }
        
        # Nutrientes promedio por temporada
        self.seasonal_nutrients = {
            'cold_season': {'din_min': 3.5, 'din_max': 7.0, 'nt_min': 12.0, 'nt_max': 25.0},
            'dry_season': {'din_min': 4.0, 'din_max': 8.0, 'nt_min': 13.0, 'nt_max': 30.0},
            'rainy_season': {'din_min': 4.5, 'din_max': 8.5, 'nt_min': 15.0, 'nt_max': 32.0}
        }
    
    def load_model(self, species: str):
        """Cargar modelo y preprocesador para una especie"""
        if species in self.models:
            return
        
        model_path = f"trained_models/model_{species.replace(' ', '_')}.pkl"
        preprocessor_path = f"trained_models/preprocessor_{species.replace(' ', '_')}.pkl"
        
        model = PolynomialRegressionModel(species_name=species)
        model.load(model_path)
        
        preprocessor = DataPreprocessor()
        preprocessor.load(preprocessor_path)
        
        self.models[species] = model
        self.preprocessors[species] = preprocessor
    
    def predict_month(self, species: str, year: int, month: int) -> Dict:
        """Predecir biomasa para un mes específico"""
        # Cargar modelo si no está cargado
        if species not in self.models:
            self.load_model(species)
        
        # Obtener temporada y condiciones
        season = self.month_to_season[month]
        temperature = self.monthly_temps[month]
        nutrients = self.seasonal_nutrients[season]
        
        # Preparar datos
        input_data = pd.DataFrame([{
            'Temperature': temperature,
            'DIN_Min': nutrients['din_min'],
            'DIN_Max': nutrients['din_max'],
            'NT_Min': nutrients['nt_min'],
            'NT_Max': nutrients['nt_max'],
            'Season': season,
            'Biomass': 0
        }])
        
        # Preprocesar y predecir
        preprocessor = self.preprocessors[species]
        X, _ = preprocessor.prepare_features(input_data, fit=False)
        
        model = self.models[species]
        prediction = model.predict(X)[0]
        
        return {
            'year': year,
            'month': month,
            'month_name': datetime(year, month, 1).strftime('%B'),
            'season': season,
            'temperature': temperature,
            'biomass': prediction,
            'mae': model.metrics['test']['mae'],
            'r2': model.metrics['test']['r2']
        }
    
    def predict_next_months(self, species: str, n_months: int = 12) -> pd.DataFrame:
        """Predecir biomasa para los próximos N meses"""
        predictions = []
        
        current_date = datetime.now()
        
        for i in range(n_months):
            future_date = current_date + timedelta(days=30*i)
            year = future_date.year
            month = future_date.month
            
            pred = self.predict_month(species, year, month)
            pred['date'] = future_date
            predictions.append(pred)
        
        return pd.DataFrame(predictions)
    
    def predict_full_year(self, species: str, year: int) -> pd.DataFrame:
        """Predecir biomasa para todos los meses de un año"""
        predictions = []
        
        for month in range(1, 13):
            pred = self.predict_month(species, year, month)
            pred['date'] = datetime(year, month, 15)  # Usar día 15 como representativo
            predictions.append(pred)
        
        return pd.DataFrame(predictions)


def plot_temporal_prediction(df: pd.DataFrame, species: str, output_file: str = None):
    """Generar gráfica de predicción temporal"""
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(14, 10))
    
    # Gráfica 1: Biomasa predicha con banda de confianza
    ax1.plot(df['date'], df['biomass'], marker='o', linewidth=2, markersize=8, 
             label='Biomasa predicha', color='#2E86AB')
    
    # Banda de confianza (±MAE)
    mae = df['mae'].iloc[0]
    ax1.fill_between(df['date'], 
                      df['biomass'] - mae, 
                      df['biomass'] + mae,
                      alpha=0.3, color='#2E86AB', label=f'±MAE ({mae:.2f})')
    
    ax1.set_xlabel('Fecha', fontsize=12, fontweight='bold')
    ax1.set_ylabel('Biomasa (g/m²)', fontsize=12, fontweight='bold')
    ax1.set_title(f'Predicción de Biomasa - {species}', fontsize=14, fontweight='bold')
    ax1.legend(loc='upper right', fontsize=10)
    ax1.grid(True, alpha=0.3)
    
    # Rotar etiquetas del eje x
    plt.setp(ax1.xaxis.get_majorticklabels(), rotation=45, ha='right')
    
    # Gráfica 2: Biomasa por temporada
    season_colors = {
        'cold_season': '#6A4C93',
        'dry_season': '#F4A261',
        'rainy_season': '#2A9D8F'
    }
    
    season_names = {
        'cold_season': 'Temporada Fría',
        'dry_season': 'Temporada Seca',
        'rainy_season': 'Temporada Lluviosa'
    }
    
    # Crear barras coloreadas por temporada
    for season, color in season_colors.items():
        mask = df['season'] == season
        if mask.any():
            season_df = df[mask]
            ax2.bar(season_df['date'], season_df['biomass'], 
                   color=color, label=season_names[season], alpha=0.7, width=20)
    
    ax2.set_xlabel('Fecha', fontsize=12, fontweight='bold')
    ax2.set_ylabel('Biomasa (g/m²)', fontsize=12, fontweight='bold')
    ax2.set_title('Biomasa por Temporada', fontsize=14, fontweight='bold')
    ax2.legend(loc='upper right', fontsize=10)
    ax2.grid(True, alpha=0.3, axis='y')
    
    plt.setp(ax2.xaxis.get_majorticklabels(), rotation=45, ha='right')
    
    # Ajustar layout
    plt.tight_layout()
    
    # Guardar o mostrar
    if output_file:
        plt.savefig(output_file, dpi=300, bbox_inches='tight')
        print(f"✅ Gráfica guardada en: {output_file}")
    else:
        plt.show()
    
    plt.close()


def plot_species_comparison(predictions_dict: Dict[str, pd.DataFrame], 
                           output_file: str = None):
    """Comparar múltiples especies en una gráfica"""
    fig, ax = plt.subplots(figsize=(14, 8))
    
    colors = ['#2E86AB', '#A23B72', '#F18F01', '#C73E1D', '#6A4C93']
    
    for i, (species, df) in enumerate(predictions_dict.items()):
        color = colors[i % len(colors)]
        ax.plot(df['date'], df['biomass'], marker='o', linewidth=2, 
               markersize=6, label=species, color=color)
    
    ax.set_xlabel('Fecha', fontsize=12, fontweight='bold')
    ax.set_ylabel('Biomasa (g/m²)', fontsize=12, fontweight='bold')
    ax.set_title('Comparación de Biomasa entre Especies', fontsize=14, fontweight='bold')
    ax.legend(loc='best', fontsize=10)
    ax.grid(True, alpha=0.3)
    
    plt.setp(ax.xaxis.get_majorticklabels(), rotation=45, ha='right')
    plt.tight_layout()
    
    if output_file:
        plt.savefig(output_file, dpi=300, bbox_inches='tight')
        print(f"✅ Gráfica guardada en: {output_file}")
    else:
        plt.show()
    
    plt.close()


def plot_seasonal_boxplot(df: pd.DataFrame, species: str, output_file: str = None):
    """Crear boxplot de biomasa por temporada"""
    fig, ax = plt.subplots(figsize=(10, 6))
    
    season_order = ['cold_season', 'dry_season', 'rainy_season']
    season_labels = ['Temporada Fría', 'Temporada Seca', 'Temporada Lluviosa']
    
    # Preparar datos
    df_plot = df.copy()
    df_plot['season_label'] = df_plot['season'].map({
        'cold_season': 'Temporada Fría',
        'dry_season': 'Temporada Seca',
        'rainy_season': 'Temporada Lluviosa'
    })
    
    sns.boxplot(data=df_plot, x='season_label', y='biomass', 
                order=season_labels, palette='Set2', ax=ax)
    
    ax.set_xlabel('Temporada', fontsize=12, fontweight='bold')
    ax.set_ylabel('Biomasa (g/m²)', fontsize=12, fontweight='bold')
    ax.set_title(f'Distribución de Biomasa por Temporada - {species}', 
                fontsize=14, fontweight='bold')
    ax.grid(True, alpha=0.3, axis='y')
    
    plt.tight_layout()
    
    if output_file:
        plt.savefig(output_file, dpi=300, bbox_inches='tight')
        print(f"✅ Gráfica guardada en: {output_file}")
    else:
        plt.show()
    
    plt.close()


def main():
    """Función principal"""
    print("\n" + "="*70)
    print("  🌊 PREDICCIÓN TEMPORAL DE BIOMASA DE ALGAS")
    print("="*70)
    
    # Crear directorio para gráficas
    os.makedirs("graficas", exist_ok=True)
    
    predictor = TemporalBiomassPredictor()
    
    # ========== EJEMPLO 1: Predicción para próximos 12 meses ==========
    print("\n[1/4] Prediciendo próximos 12 meses para Gracilaria sp3...")
    
    species = "Gracilaria sp3"
    df_future = predictor.predict_next_months(species, n_months=12)
    
    print(f"\n📊 Predicciones para {species}:")
    print("\n" + "-"*70)
    print(f"{'Fecha':<12} {'Mes':<12} {'Temporada':<20} {'Biomasa (g/m²)':>15}")
    print("-"*70)
    
    for _, row in df_future.iterrows():
        print(f"{row['date'].strftime('%Y-%m-%d'):<12} "
              f"{row['month_name']:<12} "
              f"{row['season']:<20} "
              f"{row['biomass']:>15.2f}")
    
    print("-"*70)
    print(f"\nEstadísticas:")
    print(f"  • Biomasa promedio: {df_future['biomass'].mean():.2f} g/m²")
    print(f"  • Biomasa máxima: {df_future['biomass'].max():.2f} g/m² ({df_future.loc[df_future['biomass'].idxmax(), 'month_name']})")
    print(f"  • Biomasa mínima: {df_future['biomass'].min():.2f} g/m² ({df_future.loc[df_future['biomass'].idxmin(), 'month_name']})")
    print(f"  • R² del modelo: {df_future['r2'].iloc[0]:.4f}")
    
    # Generar gráfica
    plot_temporal_prediction(df_future, species, "graficas/prediccion_12_meses.png")
    
    
    # ========== EJEMPLO 2: Año completo 2026 ==========
    print("\n[2/4] Generando predicciones para todo el año 2026...")
    
    df_2026 = predictor.predict_full_year(species, 2026)
    
    plot_temporal_prediction(df_2026, species, "graficas/prediccion_anual_2026.png")
    plot_seasonal_boxplot(df_2026, species, "graficas/boxplot_temporadas.png")
    
    print(f"✅ Predicciones generadas para 2026")
    
    
    # ========== EJEMPLO 3: Comparar múltiples especies ==========
    print("\n[3/4] Comparando 5 especies con mejores modelos...")
    
    top_species = [
        "Gracilaria sp3",
        "Prionitis sp",
        "Hypnea sp2",
        "Laurencia sp2",
        "Palisada pedrochei"
    ]
    
    predictions_dict = {}
    
    for sp in top_species:
        try:
            df_sp = predictor.predict_next_months(sp, n_months=12)
            predictions_dict[sp] = df_sp
            print(f"  ✓ {sp}")
        except Exception as e:
            print(f"  ✗ {sp}: {e}")
    
    if predictions_dict:
        plot_species_comparison(predictions_dict, "graficas/comparacion_especies.png")
    
    
    # ========== EJEMPLO 4: Análisis estacional ==========
    print("\n[4/4] Generando análisis estacional...")
    
    seasonal_summary = df_future.groupby('season').agg({
        'biomass': ['mean', 'std', 'min', 'max'],
        'temperature': 'mean'
    }).round(2)
    
    print(f"\n📊 Resumen por Temporada ({species}):")
    print(seasonal_summary)
    
    
    # ========== RESUMEN FINAL ==========
    print("\n" + "="*70)
    print("  ✅ ANÁLISIS COMPLETADO")
    print("="*70)
    print(f"\n📁 Gráficas generadas en: ./graficas/")
    print(f"   • prediccion_12_meses.png")
    print(f"   • prediccion_anual_2026.png")
    print(f"   • boxplot_temporadas.png")
    print(f"   • comparacion_especies.png")
    
    print(f"\n💡 Interpretación:")
    best_month = df_future.loc[df_future['biomass'].idxmax()]
    worst_month = df_future.loc[df_future['biomass'].idxmin()]
    
    print(f"   • Mejor mes: {best_month['month_name']} ({best_month['biomass']:.2f} g/m²)")
    print(f"   • Peor mes: {worst_month['month_name']} ({worst_month['biomass']:.2f} g/m²)")
    print(f"   • Variación: {df_future['biomass'].std():.2f} g/m² (desviación estándar)")
    
    print("\n" + "="*70)
    print()


if __name__ == "__main__":
    main()