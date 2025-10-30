"""
Módulo para cargar datos desde archivos HTML
"""
import pandas as pd
from bs4 import BeautifulSoup
from typing import Optional


class DataLoader:
    """Carga y limpia datos del dataset de biomasa de algas"""
    
    def __init__(self, html_path: str = 'dataset_completo.html'):
        """
        Inicializa el cargador de datos
        
        Args:
            html_path: Ruta al archivo HTML con los datos
        """
        self.html_path = html_path
        self.df = None
    
    def load_data(self) -> pd.DataFrame:
        """
        Carga los datos desde el archivo HTML
        
        Returns:
            DataFrame con los datos cargados
        """
        with open(self.html_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        soup = BeautifulSoup(html_content, 'html.parser')
        table = soup.find('table')
        
        # Extraer headers
        headers = [th.text.strip() for th in table.find('thead').find_all('th')]
        
        # Extraer datos
        data = []
        for row in table.find('tbody').find_all('tr'):
            cols = [td.text.strip() for td in row.find_all('td')]
            data.append(cols)
        
        df = pd.DataFrame(data, columns=headers)
        
        # Convertir tipos de datos
        df = self._convert_types(df)
        
        # Limpiar datos
        df = self._clean_data(df)
        
        self.df = df
        return df
    
    def _convert_types(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Convierte las columnas a sus tipos correctos
        
        Args:
            df: DataFrame a convertir
            
        Returns:
            DataFrame con tipos correctos
        """
        # Convertir fecha
        df['Date'] = pd.to_datetime(df['Date'])
        
        # Convertir numéricos
        numeric_cols = ['Year', 'Biomass', 'DIN_Max', 'DIN_Min', 
                       'NT_Max', 'NT_Min', 'Temperature']
        
        for col in numeric_cols:
            df[col] = pd.to_numeric(df[col], errors='coerce')
        
        return df
    
    def _clean_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Limpia datos eliminando registros con valores nulos críticos
        
        Args:
            df: DataFrame a limpiar
            
        Returns:
            DataFrame limpio
        """
        # Eliminar filas donde falten valores críticos
        critical_cols = ['Biomass', 'Temperature', 'DIN_Min', 'DIN_Max', 
                        'NT_Min', 'NT_Max']
        
        df_clean = df.dropna(subset=critical_cols)
        
        # Eliminar biomasa <= 0
        df_clean = df_clean[df_clean['Biomass'] > 0]
        
        return df_clean.reset_index(drop=True)
    
    def get_species_list(self) -> list:
        """
        Obtiene la lista de especies únicas
        
        Returns:
            Lista de nombres de especies
        """
        if self.df is None:
            self.load_data()
        
        return sorted(self.df['Alga'].unique().tolist())
    
    def get_sites_list(self) -> list:
        """
        Obtiene la lista de sitios únicos
        
        Returns:
            Lista de nombres de sitios
        """
        if self.df is None:
            self.load_data()
        
        return sorted(self.df['Site'].unique().tolist())
    
    def filter_by_species(self, species: str) -> pd.DataFrame:
        """
        Filtra los datos por especie
        
        Args:
            species: Nombre de la especie
            
        Returns:
            DataFrame filtrado
        """
        if self.df is None:
            self.load_data()
        
        return self.df[self.df['Alga'] == species].copy()
    
    def get_data_summary(self) -> dict:
        """
        Obtiene un resumen de los datos
        
        Returns:
            Diccionario con información resumida
        """
        if self.df is None:
            self.load_data()
        
        return {
            'total_records': len(self.df),
            'n_species': self.df['Alga'].nunique(),
            'n_sites': self.df['Site'].nunique(),
            'species_list': self.get_species_list(),
            'sites_list': self.get_sites_list(),
            'date_range': {
                'start': str(self.df['Date'].min()),
                'end': str(self.df['Date'].max())
            },
            'biomass_stats': {
                'min': float(self.df['Biomass'].min()),
                'max': float(self.df['Biomass'].max()),
                'mean': float(self.df['Biomass'].mean()),
                'median': float(self.df['Biomass'].median())
            }
        }


if __name__ == "__main__":
    # Prueba del módulo
    loader = DataLoader('dataset_completo.html')
    df = loader.load_data()
    
    print("=== RESUMEN DE DATOS ===")
    summary = loader.get_data_summary()
    
    print(f"Total de registros: {summary['total_records']}")
    print(f"Número de especies: {summary['n_species']}")
    print(f"Número de sitios: {summary['n_sites']}")
    print(f"\nRango de fechas: {summary['date_range']['start']} a {summary['date_range']['end']}")
    print(f"\nEstadísticas de biomasa:")
    print(f"  Min: {summary['biomass_stats']['min']:.2f}")
    print(f"  Max: {summary['biomass_stats']['max']:.2f}")
    print(f"  Media: {summary['biomass_stats']['mean']:.2f}")
    print(f"  Mediana: {summary['biomass_stats']['median']:.2f}")