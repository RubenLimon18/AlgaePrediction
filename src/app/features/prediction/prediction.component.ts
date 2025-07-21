import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Prediction } from './interfaces/prediction';
import { Site } from './interfaces/site';
import { AlgaeSpecies } from './interfaces/algae-species';
import { PredictionService } from './services/prediction.service';



@Component({
  selector: 'app-prediction',
  templateUrl: './prediction.component.html',
  styleUrls: ['./prediction.component.css']
})
export class PredictionComponent implements OnInit {
  predictionForm: FormGroup;
  result: string | null = null;

  sites: Site[] = [];
  species: AlgaeSpecies[] = [];

  constructor(
    private fb: FormBuilder,
    private predictionService: PredictionService
  ) {
    this.predictionForm = this.fb.group({
      specie: ['', Validators.required],
      site: ['', Validators.required],
      temperature: [null, [Validators.required, Validators.min(0), Validators.max(50)]],
      din: [null, [Validators.required, Validators.min(0)]],
      nt: [null, [Validators.required, Validators.min(0)]],
      days: [null, [Validators.required, Validators.min(1), Validators.pattern('^[0-9]+$')]],
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
        this.result = `The predicted growth for the species *${response.specie}* at site *${response.site}* after ${formData.days} days is estimated to be *${response.growth}* biomass units.`;
      },
      error => {
        this.result = 'An error occurred during prediction.';
        console.error(error);
      }
    );
  }
}