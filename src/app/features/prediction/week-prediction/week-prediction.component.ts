import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WeekPrediction } from '../interfaces/week-prediction';
import { Site } from '../interfaces/site';
import { AlgaeSpecies } from '../interfaces/algae-species';
import { PredictionService } from '../services/prediction.service';
import { earning_month } from '../../../models/chart_line_earnigns';

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

// Chart-line
  data : earning_month[] = [
    { month: '1', earning: 10000 },
    { month: '2', earning: 15000 },
    { month: '3', earning: 12000 },
    { month: '4', earning: 17000 },
    { month: '5', earning: 20000 },
    { month: '6', earning: 25000 },
    { month: '7', earning: 10000 },
    { month: '8', earning: 26000 }
  ]


}
