import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
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
      if (window.initMyChart) {
        window.initMyChart(this.chartId, date, biomass, algaes ,this.label);
      }
    }, 0);
  }

  // Export as image
  exportChartAsImage(){
    const canvas = document.getElementById(this.chartId) as HTMLCanvasElement;

    if (canvas){
      const ctx = canvas.getContext('2d');

      // Create a temporal canvas with the same dimensions
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');

      // Set background 
      tempCtx!.fillStyle = '#ffffff';
      tempCtx!.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      // Draw original canvas on top
      tempCtx!.drawImage(canvas, 0, 0);

      // Create link
      const imageURL = tempCanvas.toDataURL('image/png');

      // Download image
      const link = document.createElement('a');
      link.href = imageURL;
      link.download = `${this.chartTitle || 'Chart Line'}.png`;
      link.click();

    }
    else{
      console.log("Canas element not found!");
    }

  }

  // Export to CVS
  exportDataCSV(){
    if(!this.data || this.data.length < 0){
      console.log("No data to export");
      return;
    }

    // Header
    const headers: string[] = ["Algae", "Biomass", "Date"];

    // Convert data to CVS rows
    const rows = this.data.map((item) => {
      return [
        item.alga,
        item.biomass,
        item.date
      ]
    })


    // Build CVS content
    let csvContent = headers.join(',') + '\n';
    console.log(csvContent);
    rows.forEach((row) => {
      csvContent += row.join(',') + '\n';
    });
    

    // Build blob for download
    const blob = new Blob([csvContent], {type: 'text/cvs;charset=utf-8'});
    const url = URL.createObjectURL(blob);

    // Create download link
    const link = document.createElement('a');
    link.href = url;
    const now = new Date().toISOString().slice(0,10);
    link.download = `Last-50-recorded-data-${now}.csv`;
    link.click();

    // Free URL Object
    URL.revokeObjectURL(url);

  }

}
