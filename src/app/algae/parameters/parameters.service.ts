import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaces para tipar los datos
export interface DataPoint {
  site: string;
  valor: number;
  month: string;
  season: string;
}

export interface Parameter {
  id: number;
  name: string;
  data: DataPoint[];
}

@Injectable({
  providedIn: 'root'
})
export class ParametersService {

  private baseUrl = 'http://127.0.0.1:8000/parameters'

  constructor(private http: HttpClient) { }

  // obtener todos los documentos de la coleccion
  getParameters(paramType: string): Observable<Parameter[]> {
    return this.http.get<Parameter[]>(`${this.baseUrl}/${paramType}`);
  }

}
