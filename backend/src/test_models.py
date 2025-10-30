import os
import sys
sys.path.insert(0, '.')
from ml_models.model_trainer import ModelTrainer

# Agregar src al path para imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Ruta al dataset
data_path = os.path.join(os.path.dirname(__file__), '..', 'datos', 'html', 'dataset_completo.html')

trainer = ModelTrainer(
    data_path=data_path,
    models_dir='trained_models',
    degree=2,
    alpha=1.0,
    min_samples=30
)

summary = trainer.train_all_species(test_size=0.2)
trainer.print_summary()