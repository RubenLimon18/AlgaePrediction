import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { parameterModel } from '../../../models/algae.model';

declare global {
  interface Window {
    initMyChartbar: (
      chartId: string,
      labels: string[],
      data: parameterModel[],
      sites?: string[],
      label?: string,
      filterSeason?: string | null
    ) => void;
  }
}

@Component({
  selector: 'app-chart-bar',
  templateUrl: './chart-bar.component.html',
  styleUrls: ['./chart-bar.component.css']
})
export class ChartBarComponent implements OnChanges {
  @Input() data: parameterModel[] = [];
  @Input() label: string;
  @Input() chartId: string = 'myChart';
  @Input() chartTitle: string = 'Monthly Temperature';

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && this.data.length > 0) {
      this.renderChart();
    }
  }

  renderChart(filterSeason: string | null = null) {
    const labels = this.data.map(d => d.month); 
    const sites = this.data.map(d => d.site);

    setTimeout(() => {
      if (window.initMyChartbar) {
        window.initMyChartbar(this.chartId, labels, this.data, sites, this.label, filterSeason);
      }
    }, 0);
  }

  // Método público para filtrar desde el componente padre
  filterBySeason(season: string | null) {
    this.renderChart(season);
  }
}
