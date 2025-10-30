"""
Modelo de regresión polinomial para predicción de biomasa
"""
import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
import pickle
from typing import Dict, Tuple, Optional
import warnings
warnings.filterwarnings('ignore')


class PolynomialRegressionModel:
    """Modelo de regresión polinomial para predicción de biomasa de algas"""
    
    def __init__(self, species_name: str, alpha: float = 1.0):
        """
        Inicializa el modelo
        
        Args:
            species_name: Nombre de la especie de alga
            alpha: Parámetro de regularización Ridge
        """
        self.species_name = species_name
        self.alpha = alpha
        self.model = Ridge(alpha=alpha)
        self.is_trained = False
        self.metrics = {}
        self.n_samples = 0
    
    def train(self, X: np.ndarray, y: np.ndarray, test_size: float = 0.2, 
              random_state: int = 42) -> Dict:
        """
        Entrena el modelo
        
        Args:
            X: Features de entrenamiento
            y: Target de entrenamiento
            test_size: Proporción de datos para test
            random_state: Semilla aleatoria
            
        Returns:
            Diccionario con métricas de entrenamiento
        """
        self.n_samples = len(X)
        
        # Dividir en train y test
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=random_state
        )
        
        # Entrenar modelo
        self.model.fit(X_train, y_train)
        self.is_trained = True
        
        # Predicciones
        y_train_pred = self.model.predict(X_train)
        y_test_pred = self.model.predict(X_test)
        
        # Calcular métricas
        self.metrics = {
            'train': {
                'r2': float(r2_score(y_train, y_train_pred)),
                'rmse': float(np.sqrt(mean_squared_error(y_train, y_train_pred))),
                'mae': float(mean_absolute_error(y_train, y_train_pred)),
                'mse': float(mean_squared_error(y_train, y_train_pred))
            },
            'test': {
                'r2': float(r2_score(y_test, y_test_pred)),
                'rmse': float(np.sqrt(mean_squared_error(y_test, y_test_pred))),
                'mae': float(mean_absolute_error(y_test, y_test_pred)),
                'mse': float(mean_squared_error(y_test, y_test_pred))
            },
            'n_train_samples': len(X_train),
            'n_test_samples': len(X_test),
            'n_features': X.shape[1]
        }
        
        return self.metrics
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        """
        Realiza predicciones
        
        Args:
            X: Features para predicción
            
        Returns:
            Array con predicciones
        """
        if not self.is_trained:
            raise ValueError(f"El modelo para {self.species_name} no ha sido entrenado")
        
        predictions = self.model.predict(X)
        
        # Asegurar que no haya predicciones negativas
        predictions = np.maximum(predictions, 0)
        
        return predictions
    
    def get_model_info(self) -> Dict:
        """
        Obtiene información del modelo
        
        Returns:
            Diccionario con información del modelo
        """
        return {
            'species_name': self.species_name,
            'is_trained': self.is_trained,
            'n_samples': self.n_samples,
            'alpha': self.alpha,
            'metrics': self.metrics if self.is_trained else None
        }
    
    def save(self, filepath: str):
        """
        Guarda el modelo entrenado
        
        Args:
            filepath: Ruta donde guardar el modelo
        """
        if not self.is_trained:
            raise ValueError("No se puede guardar un modelo no entrenado")
        
        with open(filepath, 'wb') as f:
            pickle.dump({
                'model': self.model,
                'species_name': self.species_name,
                'alpha': self.alpha,
                'is_trained': self.is_trained,
                'metrics': self.metrics,
                'n_samples': self.n_samples
            }, f)
    
    def load(self, filepath: str):
        """
        Carga un modelo guardado
        
        Args:
            filepath: Ruta del modelo guardado
        """
        with open(filepath, 'rb') as f:
            data = pickle.load(f)
            self.model = data['model']
            self.species_name = data['species_name']
            self.alpha = data['alpha']
            self.is_trained = data['is_trained']
            self.metrics = data['metrics']
            self.n_samples = data['n_samples']
    
    def get_metrics_summary(self) -> str:
        """
        Obtiene un resumen legible de las métricas
        
        Returns:
            String con el resumen de métricas
        """
        if not self.is_trained:
            return "Modelo no entrenado"
        
        summary = f"\n=== Métricas para {self.species_name} ===\n"
        summary += f"Muestras de entrenamiento: {self.metrics['n_train_samples']}\n"
        summary += f"Muestras de prueba: {self.metrics['n_test_samples']}\n"
        summary += f"Número de features: {self.metrics['n_features']}\n\n"
        
        summary += "TRAIN:\n"
        summary += f"  R² Score: {self.metrics['train']['r2']:.4f}\n"
        summary += f"  RMSE: {self.metrics['train']['rmse']:.4f}\n"
        summary += f"  MAE: {self.metrics['train']['mae']:.4f}\n\n"
        
        summary += "TEST:\n"
        summary += f"  R² Score: {self.metrics['test']['r2']:.4f}\n"
        summary += f"  RMSE: {self.metrics['test']['rmse']:.4f}\n"
        summary += f"  MAE: {self.metrics['test']['mae']:.4f}\n"
        
        return summary


if __name__ == "__main__":
    # Prueba del módulo
    import sys
    sys.path.append('..')
    from utils.data_loader import DataLoader
    from utils.preprocessing import DataPreprocessor
    
    # Cargar datos
    loader = DataLoader('dataset_completo.html')
    df = loader.load_data()
    
    # Filtrar una especie
    species = 'Acanthophora spicifera'
    df_species = df[df['Alga'] == species].copy()
    
    print(f"Registros para {species}: {len(df_species)}")
    
    # Preprocesar
    preprocessor = DataPreprocessor(degree=2)
    X, y = preprocessor.prepare_features(df_species, fit=True)
    
    # Entrenar modelo
    model = PolynomialRegressionModel(species_name=species, alpha=1.0)
    metrics = model.train(X, y, test_size=0.2)
    
    print(model.get_metrics_summary())