import { Component, Input } from '@angular/core';
import { earning_month } from '../../../models/chart_line_earnigns';

declare global {
  interface Window {
    initMyChart: (chartId: string, months: string[], earnings: number[], label: string) => void;
  }
}

@Component({
  selector: 'app-chart-line',
  templateUrl: './chart-line.component.html',
  styleUrl: './chart-line.component.css'
})
export class ChartLineComponent {
  @Input() data: earning_month[] = [];
  @Input() label: string = 'Ventas';
  @Input() chartId: string = 'myChart';
  @Input() title: string = 'Earnings Overview';

  
  
  // Chart line
  ngOnInit(): void {
    const m = this.data.map(m=> m.month);
    const e = this.data.map(e => e.earning);
     
    // Esperar a que el DOM esté listo
    setTimeout(() => {
      if (window.initMyChart) {
        window.initMyChart(this.chartId, m, e, this.label);
      }
    }, 0);
  }


}
