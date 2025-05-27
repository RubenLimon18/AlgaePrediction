import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  cards = [
    { title: 'Earnings (Monthly)', amount: '$40,000', icon: 'fa-calendar', borderColor: 'primary', progress: '0'},
    { title: 'Earnings (Annual)', amount: '$215,000', icon: 'fa-dollar-sign', borderColor: 'success', progress: '0' },
    { title: 'Tasks', amount: '0', icon: 'fa-clipboard-list', borderColor: 'info', progress: '22' },
    { title: 'Pending Requests', amount: '18', icon: 'fa-comments', borderColor: 'warning', progress: '0' }
  ];
  
}
