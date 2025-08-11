import { Component, OnInit, AfterViewChecked} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { WeekPrediction, WeeklyGrowth} from '../interfaces/week-prediction';
import { Site } from '../interfaces/site';
import { AlgaeSpecies } from '../interfaces/algae-species';
import { PredictionService } from '../services/prediction.service';
import { AlgaeModelChartLine } from '../../../models/algae.model';


@Component({
  selector: 'app-week-prediction',
  templateUrl: './week-prediction.component.html',
  styleUrl: './week-prediction.component.css'
})
export class WeekPredictionComponent implements OnInit, AfterViewChecked{
  predictionForm: FormGroup; // inputs usuario
  result: string | null = null;//prediccion en texto
  sites: Site[] = []; // sitio (botones)
  species: AlgaeSpecies[] = [];//especie de algas (botones)
  predictedData: WeekPrediction | null = null; //variable para guardar prediccion completa  
  data: AlgaeModelChartLine[] = []; //datos de grafica
  viewMode: 'daily' | 'weekly' = 'daily'; // modo de visualizacion actual
  weeksSelected: number = 1;// guardar semanas a proyectar
  chartRendered = false;

  
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
      weeks: [1, [Validators.required, Validators.min(1), Validators.max(48)]],
    });
  }

  runWeekPrediction() {
    if (this.predictionForm.invalid) {
      this.predictionForm.markAllAsTouched();
      this.result = 'Please complete all fields correctly.';
      return;
    }

    const formData: WeekPrediction = this.predictionForm.value;

    this.predictionService.runWeekPrediction(formData).subscribe(
      response => {
        const fullWeekPrediction: WeekPrediction = {
          ...formData,
          predictions:  response.predictions ? response.predictions.map(item => ({
            date: new Date(item.date),
            biomass: item.biomass,
            algae: item.algae,
          })):[]
        };

        this.predictedData = fullWeekPrediction;

        this.result = `Weekly prediction for species *${fullWeekPrediction.specie}* at site *${fullWeekPrediction.site}* was generated.`;

        this.data = fullWeekPrediction.predictions?.map(item => ({
          date: item.date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }),
          biomass: item.biomass,
          alga: item.algae
        })) ?? [];
      },
      error => {
        this.result = 'An error occurred during weekly prediction.';
        console.error(error);
      }
    );
  }

  groupByWeek(data: WeeklyGrowth[]): AlgaeModelChartLine[] {
  if (data.length === 0) return [];

  const grouped: AlgaeModelChartLine[] = [];
  const fixedAlga = data[0].algae; // alga única en todo el dataset

  //Obtener rangos de dias
  const startDate = new Date(data[0].date);
  let currentBlockStart = new Date(startDate);
  let currentBlockEnd = new Date(currentBlockStart);
  currentBlockEnd.setDate(currentBlockEnd.getDate() + 6); // rango de 7 días

  let blockValues: number[] = [];//biomass


  for (const item of data) {
    const itemDate = new Date(item.date);

    if (itemDate >= currentBlockStart && itemDate <= currentBlockEnd) {
      blockValues.push(item.biomass);
    } else {
      grouped.push({
        date: `${currentBlockStart.toLocaleDateString('es-MX', { day: 'numeric'})
      }-${currentBlockEnd.toLocaleDateString('es-MX', {day: 'numeric', month: 'short', year: '2-digit'})}`,
        biomass: this.calculateAverage(blockValues),
        alga: fixedAlga
      });

      currentBlockStart = new Date(currentBlockEnd);
      currentBlockStart.setDate(currentBlockStart.getDate() + 1);
      currentBlockEnd = new Date(currentBlockStart);
      currentBlockEnd.setDate(currentBlockEnd.getDate() + 6);

      blockValues = [item.biomass];
    }
  }

  if (blockValues.length > 0) {
    grouped.push({
    date: `${currentBlockStart.toLocaleDateString('es-MX', { day: 'numeric'})
    }-${currentBlockEnd.toLocaleDateString('es-MX', {day: 'numeric', month: 'short', year: '2-digit'})}`,      
    biomass: this.calculateAverage(blockValues),
    alga: fixedAlga
    });
  }

  return grouped;
}


  calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
  }



  changeViewMode(mode: 'daily' | 'weekly') {
  this.viewMode = mode;
  this.chartRendered = false;

  if (this.predictedData?.predictions) {
    if (mode === 'daily') {
      this.data = this.predictedData.predictions.map(item => ({
        date: item.date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }),
        biomass: item.biomass,
        alga: item.algae,

      }));
    } else {
      this.data = this.groupByWeek(this.predictedData.predictions);
    }
  }
}


  ngAfterViewChecked() {
    if (!this.chartRendered && this.data.length > 0 && window.initMyChart) {
      setTimeout(() => {
        window.initMyChart('weekChart', this.data.map(d => d.date), this.data.map(d => d.biomass), this.data.map(d => d.alga),'Biomass');
        this.chartRendered = true;
      });
    }
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

}
