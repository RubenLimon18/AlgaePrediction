import { Component, OnInit, AfterViewChecked} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { WeekPrediction, WeeklyGrowth} from '../interfaces/week-prediction';
import { Site } from '../interfaces/site';
import { AlgaeSpecies } from '../interfaces/algae-species';
import { PredictionService } from '../services/prediction.service';
import { earning_month} from '../../../models/chart_line_earnigns';


@Component({
  selector: 'app-week-prediction',
  templateUrl: './week-prediction.component.html',
  styleUrl: './week-prediction.component.css'
})
export class WeekPredictionComponent implements OnInit, AfterViewChecked{
  predictionForm: FormGroup;
  result: string | null = null;
  sites: Site[] = [];
  species: AlgaeSpecies[] = [];
  predictedData: WeekPrediction | null = null; //variable para guardar prediccion completa  
  data : earning_month[] = [ { month: '0', earning: 0 }] //datos de grafica
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
            biomass: item.biomass
          })):[]
        };

        this.predictedData = fullWeekPrediction;

        this.result = `Weekly prediction for species *${fullWeekPrediction.specie}* at site *${fullWeekPrediction.site}* was generated.`;

        this.data = fullWeekPrediction.predictions?.map(item => ({
          month: item.date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }),
          earning: item.biomass
        })) ?? [];
      },
      error => {
        this.result = 'An error occurred during weekly prediction.';
        console.error(error);
      }
    );
  }

  groupByWeek(data: WeeklyGrowth[]): earning_month[] {
  if (data.length === 0) return [];

  const grouped: earning_month[] = [];

  const startDate = new Date(data[0].date);
  let currentBlockStart = new Date(startDate);
  let currentBlockEnd = new Date(currentBlockStart);
  currentBlockEnd.setDate(currentBlockEnd.getDate() + 6); // rango de 7 días

  let blockValues: number[] = [];

  for (const item of data) {
    const itemDate = new Date(item.date);

    if (itemDate >= currentBlockStart && itemDate <= currentBlockEnd) {
      blockValues.push(item.biomass);
    } else {
      grouped.push({
        month: `${currentBlockStart.toLocaleDateString('es-MX', { day: 'numeric'})
      }-${currentBlockEnd.toLocaleDateString('es-MX', {day: 'numeric', month: 'short', year: '2-digit'})}`,
        earning: this.calculateAverage(blockValues),
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
    month: `${currentBlockStart.toLocaleDateString('es-MX', { day: 'numeric'})
    }-${currentBlockEnd.toLocaleDateString('es-MX', {day: 'numeric', month: 'short', year: '2-digit'})}`,      
    earning: this.calculateAverage(blockValues),
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
        month: item.date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }),
        earning: item.biomass,
      }));
    } else {
      this.data = this.groupByWeek(this.predictedData.predictions);
    }
  }
}


  ngAfterViewChecked() {
    if (!this.chartRendered && this.data.length > 0 && window.initMyChart) {
      setTimeout(() => {
        window.initMyChart('weekChart', this.data.map(d => d.month), this.data.map(d => d.earning), 'Biomass');
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
