import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Prediction } from '../interfaces/prediction';
import { Site } from '../interfaces/site';
import { AlgaeSpecies } from '../interfaces/algae-species';
import { PredictionService } from '../services/prediction.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-day-prediction',
  templateUrl: './day-prediction.component.html',
  styleUrls: ['./day-prediction.component.css']
})
export class DayPredictionComponent implements OnInit {
  predictionForm: FormGroup;
  result: string | null = null;
  sites: Site[] = [];
  species: AlgaeSpecies[] = [];
  predictedData: Prediction | null = null; //variable para guardar prediccion completa
  biomassChart: Chart | null = null;
  maxBiomassValue: number = 0;


  constructor(
    private fb: FormBuilder,
    private predictionService: PredictionService
  ) {
    this.predictionForm = this.fb.group({
      specie: ['', Validators.required],
      site: ['', Validators.required],
      /* temperature: [null, [Validators.required, Validators.min(0), Validators.max(50)]],
      din: [null, [Validators.required, Validators.min(0)]],
      nt: [null, [Validators.required, Validators.min(0)]], */
      date: [null, [Validators.required]],
    });
  }

  ngOnInit(): void {
    // Cargar sitios simulados
    this.predictionService.getSites().subscribe(sites => {
      this.sites = sites;
    });

    // Cargar especies simuladas
    this.predictionService.getSpecies().subscribe(species => {
      this.species = species;
    });
  }

  isInvalid(str: string): boolean {
    const control = this.predictionForm.get(str);
    return control ? control.invalid && control.touched : false;
  }

  runPrediction() {
  if (this.predictionForm.invalid) {
    this.predictionForm.markAllAsTouched();
    this.result = 'Please complete all fields correctly.';
    return;
  }

  const formData: Prediction = this.predictionForm.value;

  this.predictionService.runPrediction(formData).subscribe(
    response => {
      // combinar datos del formulario + respuesta del backend
      const fullPrediction: Prediction = {
        ...formData,                // datos del formulario
        growth: response.growth,    // del backend
        dateActual: new Date(response.dateActual),  // convierte string ISO a Date
        temperature: response.temperature,
        din: response.din,
        nt: response.nt
      };

      // guardar el resultado como string visual (opcional)
      this.result = `The predicted growth for the species *${fullPrediction.specie}* 
        at site *${fullPrediction.site}* on ${fullPrediction.date} 
        is expected to be *${fullPrediction.growth}* biomass units.`;
      this.predictedData = fullPrediction;//guardar datos de prediccion 
      this.predictionService.getMaxBiomassForSpecies(fullPrediction.specie).subscribe(maxValue => {
       this.maxBiomassValue = maxValue;
        setTimeout(() => this.renderBiomassChart(fullPrediction.growth ?? 0, this.maxBiomassValue), 0);
      });
    },
    error => {
      this.result = 'An error occurred during prediction.';
      console.error(error);
    }
  );
}

renderBiomassChart(predicted: number, max: number): void {
  const canvas = document.getElementById('biomassChart') as HTMLCanvasElement;
  if (!canvas) return;

  // Destruye el gráfico anterior si existe
  if (this.biomassChart) {
    this.biomassChart.destroy();
  }

  // Obtener la relación de píxeles del dispositivo
  const dpr = window.devicePixelRatio || 1;

  // Obtener dimensiones del canvas según su tamaño visual en el DOM
  const rect = canvas.getBoundingClientRect();

  // Establecer dimensiones internas del canvas (pixeles reales)
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  // Escalar el contexto para que el contenido se vea nítido
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.scale(dpr, dpr);
  }

  // Crear el gráfico
  this.biomassChart = new Chart(ctx!, {
    type: 'bar',
    data: {
      labels: ['Biomass'],
      datasets: [
        {
          label: 'Predicted',
          data: [predicted],
          backgroundColor: '#1cc88a'
        },
        {
          label: 'Historical Max',
          data: [max],
          backgroundColor: '#17a673'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false, // Permite controlar la altura vía CSS
      indexAxis: 'y',
      scales: {
        x: {
          beginAtZero: true
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'Comparison: Predicted vs Max Biomass'
        },
        legend: {
          labels: {
            font: {
              size: 12
            }
          }
        }
      }
    }
  });
}


}