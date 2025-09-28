import { Component, QueryList, ViewChildren, AfterViewInit, OnInit } from '@angular/core';
import { ChartBarComponent } from '../../../shared/components/chart-bar/chart-bar.component';
import { ParametersService, Parameter } from '../parameters.service';

@Component({
  selector: 'app-temperature',
  templateUrl: './temperature.component.html',
  styleUrls: ['./temperature.component.css']
})
export class TemperatureComponent implements OnInit, AfterViewInit {

  @ViewChildren('chartBar') chartBarComponents!: QueryList<ChartBarComponent>;
  chartRefs: { [key: number]: ChartBarComponent } = {};

  sites: Parameter[] = [];
  collectionType: string = 'temperature'; // puede ser 'din' o 'nt'

  constructor(private paramService: ParametersService) { }

  ngOnInit(): void {
    this.loadParameters();
  }

  ngAfterViewInit(): void {
    this.chartBarComponents.changes.subscribe(() => {
      this.assignChartsData();
    });
  }

  loadParameters(): void {
    this.paramService.getParameters(this.collectionType).subscribe({
      next: (data) => {
        this.sites = data;
        this.assignChartsData(); // asigna datos a los charts
      },
      error: (err) => console.error('Error al cargar datos', err)
    });
  }

  private assignChartsData(): void {
    this.chartBarComponents.forEach(chart => {
      const siteId = parseInt(chart.chartId.split('-')[1], 10); // siteId es un numero extraido del chartId de temperature.html
      this.chartRefs[siteId] = chart;

      // asignar datos al chart y renderizar
      const siteData = this.sites.find(p => p.id === siteId)?.data || [];
      chart.data = siteData;
      chart.renderChart(); // render inicial sin filtro
    });
  }
}
