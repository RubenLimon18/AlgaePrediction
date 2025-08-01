import { Component } from '@angular/core';
import { earning_month } from '../../models/chart_line_earnigns';



@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

  // Earnings-cards
  cards = [
    { title: 'Casa del marino', amount: '', icon: 'fa-map-marker-alt', borderColor: 'primary', progress: '1'},
    { title: 'Tecolote', amount: '', icon: 'fa-map-marker-alt', borderColor: 'info', progress: '0'},
    { title: 'San Juan de la Costa', amount: '', icon: 'fa-map-marker-alt', borderColor: 'warning', progress: '0'},
  ];
  
  // Chart-line
  data : earning_month[] = [
    { month: 'Ene', earning: 10000 },
    { month: 'Feb', earning: 15000 },
    { month: 'Mar', earning: 12000 },
    { month: 'Abr', earning: 17000 },
    { month: 'May', earning: 20000 },
    { month: 'Jun', earning: 25000 },
    { month: 'Jul', earning: 10000 },
    { month: 'Ago', earning: 26000 }
  ]


}




