import { Injectable } from '@angular/core';
import { Prediction } from '../interfaces/prediction';
import { Site } from '../interfaces/site';
import { AlgaeSpecies } from '../interfaces/algae-species';
import { Observable, of } from 'rxjs';
// import { HttpClient } from '@angular/common/http'; // API 


@Injectable({
  providedIn: 'root'
})
export class PredictionService {

  // constructor(private http: HttpClient) {} // ← descomentar si se usa HttpClient
  constructor() {}

  //simulacion
  runPrediction(data: Prediction): Observable<{ site: string; specie: string; growth: number }> {
    const simulatedGrowth = (
      data.temperature * 0.4 +
      data.din * 0.3 +
      data.nt * 0.2 +
      data.days * 0.1 +
      Math.random() * 5
    );

    return of({
      site: data.site,
      specie: data.specie,
      growth: Number(simulatedGrowth.toFixed(2))
    });

    /*
    //API ejemplo:
    return this.http.post<{ site: string; specie: string; growth: number }>(
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

}
