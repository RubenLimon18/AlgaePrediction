import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AlgaeModelChartLine } from '../../../models/algae.model';
import { ChartActionsService } from '../../../services/chartActions/chart-actions.service';

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
  // Parametros desde dashboard
  @Input() data: AlgaeModelChartLine[] = [];
  @Input() label: string = 'Ventas';
  @Input() chartId: string = 'myChart';
  @Input() chartTitle: string = 'Earnings Overview';
  

  // Constructor
  constructor(
    private chartActionsService: ChartActionsService
  ){}


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

  // Export as image
  exportChartAsImage(){
    this.chartActionsService.exportChartAsImageLine(this.chartId, this.chartTitle)
  }

  // Export to CVS
  exportDataCSV(){
    this.chartActionsService.exportDataCSVLine(this.data, this.chartTitle);
  }

  // Open canvas en new tab ( View details )
  openCanvasInNewTab(){
    this.chartActionsService.openCanvasInNewTabLine(this.chartId, this.chartTitle);
  }

}
