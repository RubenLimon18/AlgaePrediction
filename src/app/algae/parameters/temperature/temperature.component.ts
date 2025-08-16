import { Component, OnInit } from '@angular/core';
import { AlgaeModelChartLine } from '../../../models/algae.model';//modelo para grafica

@Component({
  selector: 'app-temperature',
  templateUrl: './temperature.component.html',
  styleUrl: './temperature.component.css'
})
export class TemperatureComponent{
  sites = [
  {
    id: 1,
    name: 'San Juan de la Costa',
    data: [
      { alga: 'San Juan Costa', biomass: 22.6, date: 'feb' },
      { alga: 'San Juan Costa', biomass: 25.4, date: 'mar' },
      { alga: 'San Juan Costa', biomass: 25.2, date: 'abr' },
      { alga: 'San Juan Costa', biomass: 21.6, date: 'may' },
      { alga: 'San Juan Costa', biomass: 27.5, date: 'jun' },
      { alga: 'San Juan Costa', biomass: 28.7, date: 'jul' },
      { alga: 'San Juan Costa', biomass: 29.9, date: 'ago' },
      { alga: 'San Juan Costa', biomass: 29.1, date: 'sep' },
      { alga: 'San Juan Costa', biomass: 28.3, date: 'oct' },
      { alga: 'San Juan Costa', biomass: 24.9, date: 'nov' },
      { alga: 'San Juan Costa', biomass: 25.6, date: 'dic' }
    ]
  },
  {
    id: 2,
    name: 'Casa del Marino',
    data: [
      { alga: 'Casa Marino', biomass: 23.6, date: 'feb' },
      { alga: 'Casa Marino', biomass: 27.2, date: 'mar' },
      { alga: 'Casa Marino', biomass: 24.8, date: 'abr' },
      { alga: 'Casa Marino', biomass: 22.3, date: 'may' },
      { alga: 'Casa Marino', biomass: 26.1, date: 'jun' },
      { alga: 'Casa Marino', biomass: 26.5, date: 'jul' },
      { alga: 'Casa Marino', biomass: 26.9, date: 'ago' },
      { alga: 'Casa Marino', biomass: 25.2, date: 'sep' },
      { alga: 'Casa Marino', biomass: 27.5, date: 'oct' },
      { alga: 'Casa Marino', biomass: 26.6, date: 'nov' },
      { alga: 'Casa Marino', biomass: 25.6, date: 'dic' },
    ]
  },
  {
    id:3,
    name: 'Tecolote',
    data: [
      {alga:'Tecolote', biomass: 20, date: 'feb'},
      {alga:'Tecolote', biomass: 24.1, date: 'mar'},
      {alga:'Tecolote', biomass: 23.3, date: 'abr'},
      {alga:'Tecolote', biomass: 22.5, date: 'may'},
      {alga:'Tecolote', biomass: 22.2, date: 'jun'},
      {alga:'Tecolote', biomass: 24.3, date: 'jul'},
      {alga:'Tecolote', biomass: 27.8, date: 'ago'},
      {alga:'Tecolote', biomass: 27.6, date: 'sep'},
      {alga:'Tecolote', biomass: 27.2, date: 'oct'},
      {alga:'Tecolote', biomass: 24.5, date: 'nov'},
      {alga:'Tecolote', biomass: 25, date: 'dic'},
    ]
  }
];

}
