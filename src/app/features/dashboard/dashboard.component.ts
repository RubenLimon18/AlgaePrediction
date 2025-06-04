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
    { title: 'Earnings (Monthly)', amount: '$40,000', icon: 'fa-calendar', borderColor: 'primary', progress: '0'},
    { title: 'Earnings (Annual)', amount: '$215,000', icon: 'fa-dollar-sign', borderColor: 'success', progress: '0' },
    { title: 'Tasks', amount: '0', icon: 'fa-clipboard-list', borderColor: 'info', progress: '22' },
    { title: 'Pending Requests', amount: '18', icon: 'fa-comments', borderColor: 'warning', progress: '0' }
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




