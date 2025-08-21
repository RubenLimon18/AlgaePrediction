import { Component, QueryList, ViewChildren, AfterViewInit } from '@angular/core';
import { ChartBarComponent } from '../../../shared/components/chart-bar/chart-bar.component';
import { parameterModel } from '../../../models/algae.model';

@Component({
  selector: 'app-temperature',
  templateUrl: './temperature.component.html',
  styleUrls: ['./temperature.component.css']
})
export class TemperatureComponent implements AfterViewInit {
  @ViewChildren('chartBar') chartBarComponents!: QueryList<ChartBarComponent>;

  chartRefs: { [key: number]: ChartBarComponent } = {};

  sites = [
  {
    id: 1,
    name: 'Tecolote',
    data: [
      { site: 'Tecolote', valor: 28, month: 'Feb', season: 'Cold' },
      { site: 'Tecolote', valor: 30, month: 'Mar', season: 'Dry' },
      { site: 'Tecolote', valor: 31, month: 'Apr', season: 'Dry' },
      { site: 'Tecolote', valor: 32, month: 'May', season: 'Dry' },
      { site: 'Tecolote', valor: 33, month: 'Jun', season: 'Dry' },
      { site: 'Tecolote', valor: 34, month: 'Jul', season: 'Rainy' },
      { site: 'Tecolote', valor: 35, month: 'Aug', season: 'Rainy' },
      { site: 'Tecolote', valor: 34, month: 'Sep', season: 'Rainy' },
      { site: 'Tecolote', valor: 33, month: 'Oct', season: 'Rainy' },
      { site: 'Tecolote', valor: 31, month: 'Nov', season: 'Cold' },
      { site: 'Tecolote', valor: 29, month: 'Dec', season: 'Cold' }
    ]
  },
  {
    id: 2,
    name: 'San Juan de la Costa',
    data: [
      { site: 'San Juan Costa', valor: 22.6, month: 'Feb', season:'Cold' },
      { site: 'San Juan Costa', valor: 25.4, month: 'Mar', season:'Dry' },
      { site: 'San Juan Costa', valor: 25.2, month: 'Apr', season:'Dry' },
      { site: 'San Juan Costa', valor: 21.6, month: 'May', season:'Dry' },
      { site: 'San Juan Costa', valor: 27.5, month: 'Jun', season:'Dry' },
      { site: 'San Juan Costa', valor: 28.7, month: 'Jul', season:'Rainy' },
      { site: 'San Juan Costa', valor: 29.9, month: 'Aug', season:'Rainy' },
      { site: 'San Juan Costa', valor: 29.1, month: 'Sep', season:'Rainy' },
      { site: 'San Juan Costa', valor: 28.3, month: 'Oct', season:'Rainy' },
      { site: 'San Juan Costa', valor: 24.9, month: 'Nov', season:'Cold' },
      { site: 'San Juan Costa', valor: 25.6, month: 'Dec', season:'Cold' }
    ]
  },
  {
    id: 3,
    name: 'San Marino',
    data: [
      { site: 'San Marino', valor: 18.2, month: 'Feb', season:'Cold' },
      { site: 'San Marino', valor: 20.1, month: 'Mar', season:'Dry' },
      { site: 'San Marino', valor: 21.0, month: 'Apr', season:'Dry' },
      { site: 'San Marino', valor: 21.5, month: 'May', season:'Dry' },
      { site: 'San Marino', valor: 22.7, month: 'Jun', season:'Dry' },
      { site: 'San Marino', valor: 23.3, month: 'Jul', season:'Rainy' },
      { site: 'San Marino', valor: 23.8, month: 'Aug', season:'Rainy' },
      { site: 'San Marino', valor: 23.1, month: 'Sep', season:'Rainy' },
      { site: 'San Marino', valor: 22.5, month: 'Oct', season:'Rainy' },
      { site: 'San Marino', valor: 20.0, month: 'Nov', season:'Cold' },
      { site: 'San Marino', valor: 18.7, month: 'Dec', season:'Cold' }
    ]
  }
];


  ngAfterViewInit() {
    // Guardamos referencias de cada chart por id del sitio
    this.chartBarComponents.forEach(chart => {
      const siteId = parseInt(chart.chartId.split('-')[1], 10);
      this.chartRefs[siteId] = chart;
    });
  }
}

