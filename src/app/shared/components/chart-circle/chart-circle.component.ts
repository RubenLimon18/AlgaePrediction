import { Component, Input, SimpleChanges } from '@angular/core';
import { AlgaeCountPerSite } from '../../../models/algae.model';
import { ChartActionsService } from '../../../services/chartActions/chart-actions.service';

declare global {
  interface Window {
    initCircleChart: (chartId: string, da: AlgaeCountPerSite) => void;
  }
}

@Component({
  selector: 'app-chart-circle',
  templateUrl: './chart-circle.component.html',
  styleUrl: './chart-circle.component.css'
})
export class ChartCircleComponent {
  @Input() chartId: string = 'myChart';
  @Input() chartTitle: string = "Algae Diversity by Site";
  @Input() data: AlgaeCountPerSite;
  

  // Constructor
  constructor(
    private chartActionsService: ChartActionsService
  ){}
  
  //Chart line
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data){
      this.renderChart();
      // console.log(this.data);
    }
    
  }
  
  renderChart() {
    setTimeout(() => {
      if (window.initCircleChart) {
        window.initCircleChart(this.chartId, this.data);
      }
    }, 0);
  }


  // Export as image
  exportChartAsImage(){
    this.chartActionsService.exportChartAsImageCircle(this.chartId, this.chartTitle)
  }

  // Export to CVS
  exportDataCSV(){
    this.chartActionsService.exportDataCSVCircle(this.data);
  }


  // Open canvas en new tab ( View details )
  openCanvasInNewTab(){
    this.chartActionsService.openCanvasInNewTabCircle(this.chartId, this.chartTitle);
  }

}
