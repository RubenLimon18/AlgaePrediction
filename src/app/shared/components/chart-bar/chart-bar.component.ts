import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AlgaeModelChartLine } from '../../../models/algae.model';


declare global {
  interface Window {
    initMyChartbar: (chartId: string, date: string[], temperature: number[], sites: string[], label: string) => void;
  }
}

@Component({
  selector: 'app-chart-bar',
  templateUrl: './chart-bar.component.html',
  styleUrl: './chart-bar.component.css'
})
export class ChartBarComponent {
  @Input() data: AlgaeModelChartLine[] = [];
  @Input() label: string = 'Ventas';
  @Input() chartId: string = 'myChart';
  @Input() chartTitle: string = 'Earnings Overview';

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
      if (window.initMyChartbar) {
        window.initMyChartbar(this.chartId, date, biomass, algaes ,this.label);
      }
    }, 0);
  }
}
