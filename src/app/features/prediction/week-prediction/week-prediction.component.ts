import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WeekPrediction} from '../interfaces/week-prediction';
import { Site } from '../interfaces/site';
import { AlgaeSpecies } from '../interfaces/algae-species';
import { PredictionService } from '../services/prediction.service';
import { earning_month} from '../../../models/chart_line_earnigns';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-week-prediction',
  templateUrl: './week-prediction.component.html',
  styleUrl: './week-prediction.component.css'
})
export class WeekPredictionComponent implements OnInit{
  predictionForm: FormGroup;
  result: string | null = null;
  sites: Site[] = [];
  species: AlgaeSpecies[] = [];
  predictedData: WeekPrediction | null = null; //variable para guardar prediccion completa  
  data : earning_month[] = [] //datos de grafica
  
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
