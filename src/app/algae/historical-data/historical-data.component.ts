import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { AlgaeModel } from '../../models/algae.model';
import { DataService } from './data-service.service';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { PageEvent } from '@angular/material/paginator';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-historical-data',
  templateUrl: './historical-data.component.html',
  styleUrl: './historical-data.component.css'
})
export class HistoricalDataComponent implements OnInit{
  // Atributos
  data: AlgaeModel[] = [];
  columns: string[] = [
    'site',
    'date',
    'month',
    'year',
    'season',
    'alga',
    'biomass',
    'din_max',
    'din_min',
    'nt_max',
    'nt_min',
    'temp'
  ];
  dataSource: MatTableDataSource<AlgaeModel>;

  options = [
    { value: 'Casa del Marino', label: 'Casa del marino' },
    { value: 'Tecolote', label: 'Tecolote' },
    { value: 'San Juan de la Costa', label: 'San Juan de la Costa' },
  ]

  option = new FormControl('', Validators.required);
  selectedValue: string | null = null;

  totalAlgaes = 0;
  algaePerPage = 10;
  currentPage = 1;
  pageSizeOptions = [10,20,50,100];


  @ViewChild(MatSort) sort!: MatSort;

  private algaesSub: Subscription;
  private _liveAnnouncer = inject(LiveAnnouncer);


  // Metodos
  constructor(
    private dataService: DataService
  ){}

   
  ngOnInit(): void {
    this.dataService.getAlgaes(this.algaePerPage, this.currentPage);

    // Subscription
    this.algaesSub = this.dataService.getAlgaesUpdateListener()
      .subscribe((data: {algaes: AlgaeModel[], algaesCount: number})=>{
        this.data = data.algaes;
        this.totalAlgaes = data.algaesCount;
        this.dataSource = new MatTableDataSource<AlgaeModel>(this.data);
        this.dataSource.sort = this.sort;
      })
  }

  

  ngOnDestroy(){
    this.algaesSub.unsubscribe();
  }


  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  onChangedPage(pageData: PageEvent){
    this.algaePerPage = pageData.pageSize;
    this.currentPage = pageData.pageIndex + 1;

    this.option.patchValue('')
    this.dataService.getAlgaes(pageData.pageSize, pageData.pageIndex + 1);
  }

  onFilter(){
    if (this.option.valid) {
      this.selectedValue = this.option.value;
      console.log('Valor seleccionado:', this.selectedValue);

      // Aquí podrías hacer más cosas, como enviar datos al backend
      if(this.selectedValue != null){
        this.dataService.getAlgaesFilter(this.algaePerPage, this.currentPage, this.selectedValue);
      }
    }
    return;

  }







}
