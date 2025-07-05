import { Component } from '@angular/core';

declare global {
  interface Window {
    initCircleChart: () => void;
  }
}

@Component({
  selector: 'app-chart-circle',
  templateUrl: './chart-circle.component.html',
  styleUrl: './chart-circle.component.css'
})
export class ChartCircleComponent {
  
  //Chart line
  ngOnInit(): void {
    if(window.initCircleChart){
      window.initCircleChart()
    }
  }
}
