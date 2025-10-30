"""
Módulo de preprocesamiento de datos para regresión polinomial
"""
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, PolynomialFeatures
from typing import Tuple, Optional
import pickle


class DataPreprocessor:
    """Preprocesa datos para modelos de regresión polinomial"""
    
    def __init__(self, degree: int = 2):
        """
        Inicializa el preprocesador
        
        Args:
            degree: Grado del polinomio para features
        """
        self.degree = degree
        self.scaler = StandardScaler()
        self.poly = PolynomialFeatures(degree=degree, include_bias=False)
        self.feature_names = None
        self.season_categories = None
        self.fitted = False
    
    def prepare_features(self, df: pd.DataFrame, fit: bool = True) -> Tuple[np.ndarray, np.ndarray]:
        """
        Prepara las features y el target para el modelo
        
        Args:
            df: DataFrame con los datos
            fit: Si es True, ajusta los transformadores
            
        Returns:
            Tupla (X, y) con features y target
        """
        df_copy = df.copy()
        
        # One-hot encoding para Season
        season_dummies = pd.get_dummies(df_copy['Season'], prefix='Season', drop_first=True)
        
        if fit:
            self.season_categories = season_dummies.columns.tolist()
        else:
            # Asegurar que tenga las mismas columnas que en entrenamiento
            for col in self.season_categories:
                if col not in season_dummies.columns:
                    season_dummies[col] = 0
            season_dummies = season_dummies[self.season_categories]
        
        # Seleccionar features numéricas
        numeric_features = ['Temperature', 'DIN_Min', 'DIN_Max', 'NT_Min', 'NT_Max']
        
        # Combinar features numéricas y categóricas
        X_numeric = df_copy[numeric_features].values
        X_season = season_dummies.values
        X_combined = np.hstack([X_numeric, X_season])
        
        if fit:
            # Guardar nombres de features originales
            self.feature_names = numeric_features + season_dummies.columns.tolist()
        
        # Escalar features
        if fit:
            X_scaled = self.scaler.fit_transform(X_combined)
        else:
            X_scaled = self.scaler.transform(X_combined)
        
        # Crear features polinomiales
        if fit:
            X_poly = self.poly.fit_transform(X_scaled)
            self.fitted = True
        else:
            if not self.fitted:
                raise ValueError("El preprocesador no ha sido ajustado. Llama primero con fit=True")
            X_poly = self.poly.transform(X_scaled)
        
        # Target
        y = df_copy['Biomass'].values
        
        return X_poly, y
    
    def get_feature_info(self) -> dict:
        """
        Obtiene información sobre las features
        
        Returns:
            Diccionario con información de features
        """
        return {
            'degree': self.degree,
            'original_features': self.feature_names,
            'n_original_features': len(self.feature_names) if self.feature_names else 0,
            'n_polynomial_features': self.poly.n_output_features_ if self.fitted else 0,
            'season_categories': self.season_categories
        }
    
    def save(self, filepath: str):
        """
        Guarda el preprocesador
        
        Args:
            filepath: Ruta donde guardar el preprocesador
        """
        with open(filepath, 'wb') as f:
            pickle.dump({
                'scaler': self.scaler,
                'poly': self.poly,
                'feature_names': self.feature_names,
                'season_categories': self.season_categories,
                'degree': self.degree,
                'fitted': self.fitted
            }, f)
    
    def load(self, filepath: str):
        """
        Carga un preprocesador guardado
        
        Args:
            filepath: Ruta del preprocesador guardado
        """
        with open(filepath, 'rb') as f:
            data = pickle.load(f)
            self.scaler = data['scaler']
            self.poly = data['poly']
            self.feature_names = data['feature_names']
            self.season_categories = data['season_categories']
            self.degree = data['degree']
            self.fitted = data['fitted']


if __name__ == "__main__":
    # Prueba del módulo
    import sys
    sys.path.append('..')
    from utils.data_loader import DataLoader
    
    loader = DataLoader('dataset_completo.html')
    df = loader.load_data()
    
    # Filtrar una especie para prueba
    df_species = df[df['Alga'] == 'Acanthophora spicifera'].copy()
    
    preprocessor = DataPreprocessor(degree=2)
    X, y = preprocessor.prepare_features(df_species, fit=True)
    
    print("=== INFO DEL PREPROCESADOR ===")
    info = preprocessor.get_feature_info()
    print(f"Grado del polinomio: {info['degree']}")
    print(f"Features originales: {info['n_original_features']}")
    print(f"Features polinomiales: {info['n_polynomial_features']}")
    print(f"\nNombres de features originales:")
    for i, name in enumerate(info['original_features'], 1):
        print(f"  {i}. {name}")
    
    print(f"\nShape de X: {X.shape}")
    print(f"Shape de y: {y.shape}")