// prediction.service.ts
// Servicio actualizado para integración con la API de Python

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Prediction } from '../interfaces';
import { Site } from '../interfaces';
import { AlgaeSpecies } from '../interfaces';

@Injectable({
    providedIn: 'root'
})
export class PredictionService {
    private apiUrl = 'http://localhost:8000/';  // URL de tu API Python

    constructor(private http: HttpClient) { }

    /**
     * Obtener lista de sitios disponibles
     */
    getSites(): Observable<Site[]> {
        return this.http.get<Site[]>(`${this.apiUrl}/sites`);
    }

    /**
     * Obtener lista de especies disponibles
     * Incluye métricas del modelo (R², RMSE)
     */
    getSpecies(): Observable<AlgaeSpecies[]> {
        return this.http.get<AlgaeSpecies[]>(`${this.apiUrl}/species`);
    }

    /**
     * Ejecutar predicción de biomasa
     * @param predictionData - Datos del formulario (especie, sitio, fecha)
     * @returns Observable con la predicción (growth, temperature, din, nt, etc.)
     */
    runPrediction(predictionData: Prediction): Observable<any> {
        // Preparar payload para la API
        const payload = {
            specie: predictionData.specie,
            site: predictionData.site,
            date: predictionData.date  // Formato: YYYY-MM-DD
        };

        return this.http.post<any>(`${this.apiUrl}/prediction`, payload);
    }

    /**
     * Obtener el valor máximo histórico de biomasa para una especie
     * @param speciesName - Nombre de la especie
     * @returns Observable con el valor máximo de biomasa
     */
    getMaxBiomassForSpecies(speciesName: string): Observable<number> {
        return new Observable(observer => {
            this.http.get<any>(`${this.apiUrl}/species/${encodeURIComponent(speciesName)}/max-biomass`)
                .subscribe(
                    response => {
                        observer.next(response.maxBiomass);
                        observer.complete();
                    },
                    error => {
                        console.error('Error fetching max biomass:', error);
                        observer.next(0);  // Retornar 0 en caso de error
                        observer.complete();
                    }
                );
        });
    }

    /**
     * Obtener información detallada de una especie
     * @param speciesName - Nombre de la especie
     * @returns Observable con métricas del modelo y estadísticas
     */
    getSpeciesInfo(speciesName: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/species/${encodeURIComponent(speciesName)}/info`);
    }
}