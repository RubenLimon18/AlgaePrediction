import { Injectable } from '@angular/core';
import { Prediction } from '../../../interfaces';
import { WeekPrediction, WeeklyGrowth } from '../interfaces/week-prediction';
import { Site } from '../interfaces/site';
import { AlgaeSpecies } from '../interfaces/algae-species';
import { Observable, of } from 'rxjs';
// import { HttpClient } from '@angular/common/http'; // API 


@Injectable({
  providedIn: 'root'
})
export class PredictionService {

  // constructor(private http: HttpClient) {} // ← descomentar si se usa HttpClient
  constructor() { }

  runPrediction(data: Prediction): Observable<{
    growth: number; dateActual: string;
    temperature: number; din: number; nt: number, season: string;
    confidence: {
      r2_score: number;
      rmse: number;
      mae: number;
    };
  }> {
    const temperature = data.temperature ?? Math.random() * 10 + 20; // 20°C a 30°C
    const din = data.din ?? Math.random() * 5 + 1; // 1 a 6
    const nt = data.nt ?? Math.random() * 2 + 0.5; // 0.5 a 2.5

    const simulatedGrowth =
      temperature * 0.5 + din * 0.3 + nt * 0.2 + Math.random() * 5;

    const today = new Date().toISOString();
    const date = new Date(data.date);
    const month = date.getMonth() + 1;
    let season: string;
    if (month >= 11 || month <= 2) season = 'cold_season';
    else if (month >= 3 && month <= 6) season = 'dry_season';
    else season = 'rainy_season';
    const confidence = {
      r2_score: Number((0.3 + Math.random() * 0.4).toFixed(4)),
      rmse: Number((3 + Math.random() * 5).toFixed(2)),
      mae: Number((2 + Math.random() * 4).toFixed(2))
    };
    return of({
      growth: Number(simulatedGrowth.toFixed(2)),
      dateActual: today,
      temperature: Number(temperature.toFixed(2)),
      din: Number(din.toFixed(2)),
      nt: Number(nt.toFixed(2)),
      season: season,
      confidence: confidence
    });

    /*
    //API ejemplo:
    return this.http.post<{ growth: number; date: string }>(
      'http://localhost:3000/api/predict',
      data
    );
    */
  }

  //simulacion obtencion de datos
  getSites(): Observable<Site[]> {
    return of([
      { id: '1', name: 'Tecolote' },
      { id: '2', name: 'San Juan de la Costa' },
      { id: '3', name: 'Casa del Marino' }
    ]);
  }

  getSpecies(): Observable<AlgaeSpecies[]> {
    return of([
      { id: '1', name: 'Acanthophora spicifera' },
      { id: '2', name: 'Hypnea sp1' },
      { id: '3', name: 'Hypnea sp2' },
      { id: '4', name: 'Gracilaria sp1' },
      { id: '5', name: 'Gracilaria sp2' },
      { id: '6', name: 'Gracilaria sp3' },
      { id: '7', name: 'Gracilaria sp4' },
      { id: '8', name: 'Gelidium' },
      { id: '9', name: 'Laurencia sp1' },
      { id: '10', name: 'Laurencia sp2' },
      { id: '11', name: 'Spyridia filamentosa' },
      { id: '12', name: 'Prionitis sp' },
      { id: '13', name: 'Rhodymenia sp' },
      { id: '14', name: 'Ceramium' },
      { id: '15', name: 'Cladophora sp' },
      { id: '16', name: 'Palisada pedrochei' },
      { id: '17', name: 'Ulva foliosa' },
      { id: '18', name: 'Ulva filamentosa' },
      { id: '19', name: 'Filamentosa verde' },
      { id: '20', name: 'Caulerpa sertularioides' },
      { id: '21', name: 'Cladophora sp.' },
      { id: '22', name: 'Halimeda sp' },
      { id: '23', name: 'Sargassum sp1' },
      { id: '24', name: 'Sargassum sp2' },
      { id: '25', name: 'Dyctiota' },
      { id: '26', name: 'Padina spp' },
      { id: '27', name: 'Rosenvingea' },
      { id: '28', name: 'Codium' }
    ]);
  }

  /*
  // API ejemplo:
  getSites(): Observable<Site[]> {
    return this.http.get<Site[]>('http://localhost:3000/api/sites');
  }

  getSpecies(): Observable<AlgaSpecies[]> {
    return this.http.get<AlgaSpecies[]>('http://localhost:3000/api/species');
  }
  */
  getMaxBiomassForSpecies(specieName: string): Observable<number> {
    const maxValues: { [speciesName: string]: number } = {
      'Acanthophora spicifera': 28,
      'Hypnea sp1': 32,
      'Hypnea sp2': 27,
      'Gracilaria sp1': 35,
      'Gracilaria sp2': 30,
      'Gracilaria sp3': 29,
      'Gracilaria sp4': 33,
      'Gelidium': 25,
      'Laurencia sp1': 22,
      'Laurencia sp2': 20,
      'Spyridia filamentosa': 24,
      'Prionitis sp': 31,
      'Rhodymenia sp': 26,
      'Ceramium': 23,
      'Cladophora sp': 18,
      'Palisada pedrochei': 21,
      'Ulva foliosa': 34,
      'Ulva filamentosa': 30,
      'Filamentosa verde': 19,
      'Caulerpa sertularioides': 22,
      'Cladophora sp.': 20,
      'Halimeda sp': 17,
      'Sargassum sp1': 36,
      'Sargassum sp2': 33,
      'Dyctiota': 29,
      'Padina spp': 31,
      'Rosenvingea': 28,
      'Codium': 26
    };

    const maxValue = maxValues[specieName] ?? 0;
    return of(maxValue);
  }

  runWeekPrediction(data: WeekPrediction): Observable<WeekPrediction> {
    const temperature = Math.random() * 10 + 20; // 20°C a 30°C
    const din = Math.random() * 5 + 1;           // 1 a 6
    const nt = Math.random() * 2 + 0.5;          // 0.5 a 2.5

    const predictions: WeeklyGrowth[] = [];

    const today = new Date();

    for (let i = 0; i < data.weeks * 7; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i); // incrementa por semanas

      const growth =
        temperature * 0.5 +
        din * 0.3 +
        nt * 0.2 +
        Math.random() * 5;

      predictions.push({
        date: currentDate,
        biomass: Number(growth.toFixed(2)),
      });
    }

    return of({
      ...data,
      predictions
    });

    /*
    // Ejemplo de llamado real a backend:
    return this.http.post<WeekPrediction>(
      'http://localhost:3000/api/week-predict',
      data
    );
    */
  }


}
