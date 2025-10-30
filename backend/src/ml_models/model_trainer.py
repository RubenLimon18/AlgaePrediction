"""
Entrenador de modelos para todas las especies de algas
"""
import os
import json
import pandas as pd
from typing import Dict, List
from tqdm import tqdm
import sys
sys.path.append('..')

from utils.data_loader import DataLoader
from utils.preprocessing import DataPreprocessor
from ml_models.polynomial_regression import PolynomialRegressionModel


class ModelTrainer:
    """Entrena modelos de regresión polinomial para todas las especies"""
    
    def __init__(self, data_path: str = 'dataset_completo.html', 
                 models_dir: str = 'trained_models',
                 degree: int = 2,
                 alpha: float = 1.0,
                 min_samples: int = 30):
        """
        Inicializa el entrenador
        
        Args:
            data_path: Ruta al archivo de datos
            models_dir: Directorio donde guardar modelos
            degree: Grado del polinomio
            alpha: Parámetro de regularización
            min_samples: Mínimo de muestras para entrenar un modelo
        """
        self.data_path = data_path
        self.models_dir = models_dir
        self.degree = degree
        self.alpha = alpha
        self.min_samples = min_samples
        
        # Crear directorio de modelos si no existe
        os.makedirs(models_dir, exist_ok=True)
        
        self.loader = DataLoader(data_path)
        self.trained_models = {}
        self.training_summary = {}
    
    def train_all_species(self, test_size: float = 0.2) -> Dict:
        """
        Entrena modelos para todas las especies
        
        Args:
            test_size: Proporción de datos para test
            
        Returns:
            Diccionario con resumen del entrenamiento
        """
        print("=" * 60)
        print("INICIANDO ENTRENAMIENTO DE MODELOS")
        print("=" * 60)
        
        # Cargar datos
        print("\n[1/4] Cargando datos...")
        df = self.loader.load_data()
        species_list = self.loader.get_species_list()
        
        print(f"✓ Datos cargados: {len(df)} registros")
        print(f"✓ Especies encontradas: {len(species_list)}")
        
        # Entrenar modelos
        print(f"\n[2/4] Entrenando modelos (mínimo {self.min_samples} muestras)...")
        
        successful_models = 0
        skipped_models = 0
        
        for species in tqdm(species_list, desc="Entrenando"):
            # Filtrar datos de la especie
            df_species = df[df['Alga'] == species].copy()
            n_samples = len(df_species)
            
            # Verificar mínimo de muestras
            if n_samples < self.min_samples:
                self.training_summary[species] = {
                    'status': 'skipped',
                    'reason': f'Insuficientes muestras: {n_samples} < {self.min_samples}',
                    'n_samples': n_samples
                }
                skipped_models += 1
                continue
            
            try:
                # Preprocesar datos
                preprocessor = DataPreprocessor(degree=self.degree)
                X, y = preprocessor.prepare_features(df_species, fit=True)
                
                # Entrenar modelo
                model = PolynomialRegressionModel(species_name=species, alpha=self.alpha)
                metrics = model.train(X, y, test_size=test_size)
                
                # Guardar modelo y preprocesador
                model_filename = self._get_model_filename(species)
                preprocessor_filename = self._get_preprocessor_filename(species)
                
                model.save(os.path.join(self.models_dir, model_filename))
                preprocessor.save(os.path.join(self.models_dir, preprocessor_filename))
                
                # Guardar en memoria
                self.trained_models[species] = {
                    'model': model,
                    'preprocessor': preprocessor
                }
                
                # Registrar en resumen
                self.training_summary[species] = {
                    'status': 'success',
                    'n_samples': n_samples,
                    'metrics': metrics,
                    'model_file': model_filename,
                    'preprocessor_file': preprocessor_filename
                }
                
                successful_models += 1
                
            except Exception as e:
                self.training_summary[species] = {
                    'status': 'error',
                    'reason': str(e),
                    'n_samples': n_samples
                }
                skipped_models += 1
        
        # Guardar resumen
        print("\n[3/4] Guardando resumen de entrenamiento...")
        self._save_training_summary()
        
        # Mostrar resultados
        print("\n[4/4] Resumen del entrenamiento:")
        print("=" * 60)
        print(f"✓ Modelos entrenados exitosamente: {successful_models}")
        print(f"⚠ Modelos omitidos/fallidos: {skipped_models}")
        print(f"✓ Total de especies procesadas: {len(species_list)}")
        print("=" * 60)
        
        return self.training_summary
    
    def get_best_models(self, top_n: int = 10, metric: str = 'r2') -> List[Dict]:
        """
        Obtiene los mejores modelos según una métrica
        
        Args:
            top_n: Número de modelos a retornar
            metric: Métrica para ordenar ('r2', 'rmse', 'mae')
            
        Returns:
            Lista con los mejores modelos
        """
        models_with_metrics = []
        
        for species, info in self.training_summary.items():
            if info['status'] == 'success':
                metric_value = info['metrics']['test'][metric]
                models_with_metrics.append({
                    'species': species,
                    'metric': metric,
                    'value': metric_value,
                    'n_samples': info['n_samples'],
                    'r2_test': info['metrics']['test']['r2'],
                    'rmse_test': info['metrics']['test']['rmse']
                })
        
        # Ordenar según métrica
        reverse = True if metric == 'r2' else False
        models_with_metrics.sort(key=lambda x: x['value'], reverse=reverse)
        
        return models_with_metrics[:top_n]
    
    def print_summary(self):
        """Imprime un resumen detallado del entrenamiento"""
        print("\n" + "=" * 60)
        print("RESUMEN DETALLADO DE ENTRENAMIENTO")
        print("=" * 60)
        
        successful = [s for s, info in self.training_summary.items() 
                     if info['status'] == 'success']
        skipped = [s for s, info in self.training_summary.items() 
                  if info['status'] == 'skipped']
        errors = [s for s, info in self.training_summary.items() 
                 if info['status'] == 'error']
        
        print(f"\n✓ Modelos exitosos: {len(successful)}")
        print(f"⚠ Modelos omitidos: {len(skipped)}")
        print(f"✗ Modelos con error: {len(errors)}")
        
        if successful:
            print("\n--- TOP 10 MODELOS POR R² ---")
            best_models = self.get_best_models(top_n=10, metric='r2')
            
            for i, model_info in enumerate(best_models, 1):
                print(f"{i:2d}. {model_info['species']:40s} | "
                      f"R²: {model_info['r2_test']:.4f} | "
                      f"RMSE: {model_info['rmse_test']:.2f} | "
                      f"N: {model_info['n_samples']}")
        
        if skipped:
            print(f"\n--- ESPECIES OMITIDAS ({len(skipped)}) ---")
            for species in skipped[:5]:  # Mostrar solo primeras 5
                reason = self.training_summary[species]['reason']
                print(f"  • {species}: {reason}")
            if len(skipped) > 5:
                print(f"  ... y {len(skipped) - 5} más")
    
    def _get_model_filename(self, species: str) -> str:
        """Genera nombre de archivo para modelo"""
        safe_name = species.replace(' ', '_').replace('/', '_')
        return f"model_{safe_name}.pkl"
    
    def _get_preprocessor_filename(self, species: str) -> str:
        """Genera nombre de archivo para preprocesador"""
        safe_name = species.replace(' ', '_').replace('/', '_')
        return f"preprocessor_{safe_name}.pkl"
    
    def _save_training_summary(self):
        """Guarda el resumen de entrenamiento en JSON"""
        summary_path = os.path.join(self.models_dir, 'training_summary.json')
        
        # Convertir para JSON (solo info serializable)
        json_summary = {}
        for species, info in self.training_summary.items():
            json_summary[species] = {
                k: v for k, v in info.items() 
                if k not in ['model', 'preprocessor']
            }
        
        with open(summary_path, 'w', encoding='utf-8') as f:
            json.dump(json_summary, f, indent=2, ensure_ascii=False)
        
        print(f"✓ Resumen guardado en: {summary_path}")


if __name__ == "__main__":
    # Entrenar todos los modelos
    trainer = ModelTrainer(
        data_path='../dataset_completo.html',
        models_dir='../trained_models',
        degree=2,
        alpha=1.0,
        min_samples=30
    )
    
    # Entrenar
    summary = trainer.train_all_species(test_size=0.2)
    
    # Mostrar resumen
    trainer.print_summary()