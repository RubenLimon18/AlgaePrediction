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
    name: 'Puerto Vallarta',
    data: [
      { alga: 'pv', biomass: 23, date: 'febrero' },
      { alga: 'pv', biomass: 24, date: 'marzo' },
      { alga: 'pv', biomass: 23, date: 'abril' },
      { alga: 'pv', biomass: 24, date: 'mayo' }
    ]
  },
  {
    id: 2,
    name: 'Marino',
    data: [
      { alga: 'm', biomass: 23, date: 'febrero' },
      { alga: 'm', biomass: 24, date: 'marzo' },
      { alga: 'm', biomass: 23, date: 'abril' },
      { alga: 'm', biomass: 24, date: 'mayo' }
    ]
  }
];

}
