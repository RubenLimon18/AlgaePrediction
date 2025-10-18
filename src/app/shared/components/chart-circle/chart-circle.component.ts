import { Component, Input, SimpleChanges } from '@angular/core';
import { AlgaeCountPerSite } from '../../../models/algae.model';

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
  
  
  //Chart line
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data){
      this.renderChart();
    }
    
  }
  
  renderChart() {
    setTimeout(() => {
      if (window.initCircleChart) {
        window.initCircleChart(this.chartId, this.data);
      }
    }, 0);
  }

  
}
