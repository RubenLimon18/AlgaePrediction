import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { earning_month } from '../../../models/chart_line_earnigns';
import { AlgaeModelChartLine } from '../../../models/algae.model';

declare global {
  interface Window {
    initMyChart: (chartId: string, date: string[], biomass: number[], algaes: string[], label: string) => void;
  }
}

@Component({
  selector: 'app-chart-line',
  templateUrl: './chart-line.component.html',
  styleUrl: './chart-line.component.css'
})
export class ChartLineComponent implements OnChanges {
  @Input() data: AlgaeModelChartLine[] = [];
  @Input() label: string = 'Ventas';
  @Input() chartId: string = 'myChart';
  @Input() title: string = 'Earnings Overview';

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && this.data.length > 0) {
      this.renderChart();
    }
  }

  renderChart() {
    const date = this.data.map(m => m.date);
    const biomass = this.data.map(b => b.biomass);
    const algaes = this.data.map(a => a.alga);

    setTimeout(() => {
      if (window.initMyChart) {
        window.initMyChart(this.chartId, date, biomass, algaes ,this.label);
      }
    }, 0);
  }
}
