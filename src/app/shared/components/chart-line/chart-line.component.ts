import { Component, Input } from '@angular/core';
import { earning_month } from '../../../models/chart_line_earnigns';

declare global {
  interface Window {
    initMyChart: (months: string[], earnings: number[]) => void;
  }
}

@Component({
  selector: 'app-chart-line',
  templateUrl: './chart-line.component.html',
  styleUrl: './chart-line.component.css'
})
export class ChartLineComponent {
  @Input() data: earning_month[] = [];

  
  
  // Chart line
  ngOnInit(): void {
    const m = this.data.map(m=> m.month);
    const e = this.data.map(e => e.earning);
     
    if (window.initMyChart) {
      window.initMyChart(m, e);
    }
  }


}
