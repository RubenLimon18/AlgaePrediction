import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PredictionService } from '../services/prediction.service';
import { DecimalPipe } from '@angular/common';
import { Site } from '../interfaces/site';
import { AlgaeSpecies } from '../interfaces/algae-species';
import { Prediction } from '../../../interfaces';

@Component({
    selector: 'app-biomass-prediction',
    templateUrl: './biomass-prediction.component.html',
    styleUrls: ['./biomass-prediction.component.css'],
    providers: [DecimalPipe]
})
export class BiomassPredictionComponent implements OnInit {
    predictionForm: FormGroup;
    sites: Site[] = [];
    species: AlgaeSpecies[] = [];
    prediction: Prediction | null = null;
    isLoading: boolean = false;
    errorMessage: string | null = null;
    showOptionalFields: boolean = false;

    constructor(
        private fb: FormBuilder,
        private predictionService: PredictionService
    ) {
        this.predictionForm = this.fb.group({
            specie: ['', Validators.required],
            site: ['', Validators.required],
            date: ['', Validators.required],
            // Campos opcionales
            temperature: [null, [Validators.min(0), Validators.max(50)]],
            din: [null, [Validators.min(0)]],
            nt: [null, [Validators.min(0)]]
        });
    }

    ngOnInit(): void {
        this.loadSites();
        this.loadSpecies();
    }

    /**
     * Cargar lista de sitios desde la API
     */
    loadSites(): void {
        this.predictionService.getSites().subscribe({
            next: (sites) => {
                this.sites = sites;
            },
            error: (error) => {
                console.error('Error loading sites:', error);
                this.errorMessage = 'Error al cargar los sitios. Por favor, recarga la página.';
            }
        });
    }

    /**
     * Cargar lista de especies desde la API
     */
    loadSpecies(): void {
        this.predictionService.getSpecies().subscribe({
            next: (species) => {
                this.species = species;
            },
            error: (error) => {
                console.error('Error loading species:', error);
                this.errorMessage = 'Error al cargar las especies. Por favor, recarga la página.';
            }
        });
    }

    /**
     * Verificar si un campo es inválido
     */
    isFieldInvalid(fieldName: string): boolean {
        const field = this.predictionForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }

    /**
     * Obtener mensaje de error para un campo
     */
    getFieldError(fieldName: string): string {
        const field = this.predictionForm.get(fieldName);

        if (field?.hasError('required')) {
            return 'Este campo es requerido';
        }
        if (field?.hasError('min')) {
            return `El valor mínimo es ${field.errors?.['min'].min}`;
        }
        if (field?.hasError('max')) {
            return `El valor máximo es ${field.errors?.['max'].max}`;
        }

        return '';
    }

    /**
     * Toggle para mostrar/ocultar campos opcionales
     */
    toggleOptionalFields(): void {
        this.showOptionalFields = !this.showOptionalFields;

        // Si se ocultan, limpiar los valores
        if (!this.showOptionalFields) {
            this.predictionForm.patchValue({
                temperature: null,
                din: null,
                nt: null
            });
        }
    }

    /**
     * Ejecutar predicción
     */
    runPrediction(): void {
        // Validar formulario
        if (this.predictionForm.invalid) {
            this.predictionForm.markAllAsTouched();
            this.errorMessage = 'Por favor, completa todos los campos requeridos correctamente.';
            return;
        }

        // Limpiar mensajes previos
        this.errorMessage = null;
        this.prediction = null;
        this.isLoading = true;

        // Preparar datos
        const formData: any = {
            specie: this.predictionForm.value.specie,
            site: this.predictionForm.value.site,
            date: this.predictionForm.value.date
        };

        // Agregar campos opcionales solo si tienen valor
        if (this.predictionForm.value.temperature) {
            formData.temperature = this.predictionForm.value.temperature;
        }
        if (this.predictionForm.value.din) {
            formData.din = this.predictionForm.value.din;
        }
        if (this.predictionForm.value.nt) {
            formData.nt = this.predictionForm.value.nt;
        }

        // Llamar al servicio
        this.predictionService.runPrediction(formData).subscribe({
            next: (response) => {
                this.isLoading = false;

                // Combinar datos del formulario con la respuesta
                this.prediction = {
                    ...formData,
                    growth: response.growth,
                    dateActual: new Date(response.dateActual),
                    temperature: response.temperature,
                    din: response.din,
                    nt: response.nt,
                    season: response.season,
                    confidence: response.confidence
                };
            },
            error: (error) => {
                this.isLoading = false;
                console.error('Error in prediction:', error);

                // Mensajes de error específicos
                if (error.status === 404) {
                    this.errorMessage = 'Especie no encontrada. Por favor, verifica el nombre.';
                } else if (error.status === 400) {
                    this.errorMessage = 'Datos inválidos. Verifica la fecha y los valores numéricos.';
                } else if (error.status === 0) {
                    this.errorMessage = 'No se puede conectar al servidor. Verifica que la API esté corriendo.';
                } else {
                    this.errorMessage = 'Ocurrió un error al realizar la predicción. Por favor, intenta de nuevo.';
                }
            }
        });
    }

    /**
     * Limpiar formulario y resultados
     */
    clearForm(): void {
        this.predictionForm.reset();
        this.prediction = null;
        this.errorMessage = null;
        this.showOptionalFields = false;
    }

    /**
     * Obtener el nombre de la temporada en español
     */
    getSeasonName(season: string): string {
        const seasonNames: { [key: string]: string } = {
            'cold_season': 'Temporada Fría',
            'dry_season': 'Temporada Seca',
            'rainy_season': 'Temporada Lluviosa'
        };
        return seasonNames[season] || season;
    }

    /**
     * Obtener clase CSS según el R² Score
     */
    getConfidenceClass(r2Score: number): string {
        if (r2Score >= 0.5) return 'confidence-high';
        if (r2Score >= 0.3) return 'confidence-medium';
        return 'confidence-low';
    }

    /**
     * Obtener texto de confianza según el R² Score
     */
    getConfidenceText(r2Score: number): string {
        if (r2Score >= 0.5) return 'Alta';
        if (r2Score >= 0.3) return 'Media';
        return 'Baja';
    }

    /**
     * Formatear número con decimales
     */
    formatNumber(value: number, decimals: number = 2): string {
        return value.toFixed(decimals);
    }
}