import { Injectable } from '@angular/core';
import { AlgaeModel, AlgaeModelChartLine } from '../../models/algae.model';
import { Subject } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class DataService {
  // Atributos
  public apiURL = 'http://127.0.0.1:8000/algaes/'
  private algaes: AlgaeModel[];

  algaesChanged = new Subject<{algaes: AlgaeModel[], algaesCount: number}>();
  lastAlgae = new Subject<AlgaeModel>();
  algaeChartLine = new Subject<AlgaeModelChartLine[]>();

  // Metodos
  constructor(
    private http: HttpClient
  ) { }

  // GET Algaes
  getAlgaes(pageSize: number, page: number){

    const queryParams = new HttpParams()
      .set('page_size', pageSize)
      .set('page', page)

    this.http.get<{data:AlgaeModel[], maxAlgaes: number}>(this.apiURL, {params: queryParams})
      .subscribe((response)=>{
        // console.log(algaes)
        this.algaes = response.data;
        this.algaesChanged.next({algaes: [...this.algaes], algaesCount: response.maxAlgaes})
      })
  }

  // GET Algaes Filter
  getAlgaesFilter(pageSize: number, page: number, site: string){

    const queryParams = new HttpParams()
      .set('page_size', pageSize)
      .set('page', page)
      .set('site', site)

    this.http.get<{data:AlgaeModel[], maxAlgaes: number}>(this.apiURL + "filter", {params: queryParams})
      .subscribe((response)=>{
        // console.log(algaes)
        this.algaes = response.data;
        this.algaesChanged.next({algaes: [...this.algaes], algaesCount: response.maxAlgaes})
      })
  }

  // GET Algaes Subject
  getAlgaesUpdateListener(){
    return this.algaesChanged.asObservable();
  }

  
  // GET LastAlgae
  getLastAlgae(){
    this.http.get<AlgaeModel>(this.apiURL + "last")
      .subscribe((algae)=>{
        this.lastAlgae.next(algae);
      })
  }

  // GET LastAlgae Subject
  getLastAlgaeUpdateListener(){
    return this.lastAlgae.asObservable();
  }


  // GET Algaes chart-line
  getAlgaesChartLine(){
    this.http.get<AlgaeModel[]>(this.apiURL + "chart-line")
      .subscribe((algaes)=>{
        this.algaeChartLine.next(algaes);
      })
  }

  // GET Algaes chart-line Subject
  getAlgaesChartLineUpdateListener(){
    return this.algaeChartLine.asObservable();
  }


}
