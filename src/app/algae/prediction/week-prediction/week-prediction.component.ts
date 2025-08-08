import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WeekPrediction} from '../interfaces/week-prediction';
import { Site } from '../interfaces/site';
import { AlgaeSpecies } from '../interfaces/algae-species';
import { PredictionService } from '../services/prediction.service';
import { earning_month} from '../../../models/chart_line_earnigns';
import { ChangeDetectorRef } from '@angular/core';
import { AfterViewChecked } from '@angular/core';


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
  chartRendered = false;

  
  constructor(
    private fb: FormBuilder,
    private predictionService: PredictionService,
    private cdr: ChangeDetectorRef // inyectar ChangeDetectorRef
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

  private groupByWeek(data: earning_month[]): earning_month[] {
    const grouped: { [week: string]: number[] } = {};

    for (const item of data) {
      const date = new Date(item.month);
      const year = date.getFullYear();
      const week = this.getWeekNumber(date);
      const key = `Week ${week} - ${year}`;

      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item.earning);
    }

    return Object.keys(grouped).map(week => ({
      month: week,
      earning: +(grouped[week].reduce((a, b) => a + b, 0) / grouped[week].length).toFixed(2),
    }));
  }

  // Devuelve el número de semana del año
  private getWeekNumber(date: Date): number {
    const firstJan = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((+date - +firstJan) / (24 * 60 * 60 * 1000));
    return Math.ceil((date.getDay() + 1 + days) / 7);
    }

  changeViewMode(mode: 'daily' | 'weekly') {
    this.viewMode = mode;
    this.chartRendered = false; // Forzar redibujo

    if (this.predictedData?.predictions) {
      const baseData = this.predictedData.predictions.map(item => ({
        month: item.date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }),
        earning: item.biomass,
      }));

      this.data = mode === 'daily' ? baseData : this.groupByWeek(baseData);
    }
  }

  ngAfterViewChecked() {
    if (!this.chartRendered && this.data.length > 0 && window.initMyChart) {
      setTimeout(() => {
        window.initMyChart('yourChartId', this.data.map(d => d.month), this.data.map(d => d.earning), [],'Biomasa');
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
