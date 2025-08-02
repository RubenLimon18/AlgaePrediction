import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
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
export class ChartLineComponent implements OnChanges {
  @Input() data: earning_month[] = [];
  @Input() label: string = 'Ventas';
  @Input() chartId: string = 'myChart';
  @Input() title: string = 'Earnings Overview';

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && this.data.length > 0) {
      this.renderChart();
    }
  }

  renderChart() {
    const m = this.data.map(m => m.month);
    const e = this.data.map(e => e.earning);

    setTimeout(() => {
      if (window.initMyChart) {
        window.initMyChart(this.chartId, m, e, this.label);
      }
    }, 0);
  }
}
