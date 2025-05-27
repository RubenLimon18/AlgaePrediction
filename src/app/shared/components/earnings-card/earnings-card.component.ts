import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-earnings-card',
  templateUrl: './earnings-card.component.html',
  styleUrl: './earnings-card.component.css'
})
export class EarningsCardComponent {
  @Input() title: string = 'Earnings (Monthly)';
  @Input() amount: string = '$40,000';
  @Input() progress: string = '0';
  @Input() icon: string = 'fa-calendar';
  @Input() borderColor: string = 'primary';
}
