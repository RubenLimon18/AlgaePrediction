import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { AlgaeCountPerSite, AlgaeModelChartLine } from '../../models/algae.model';

@Injectable({
  providedIn: 'root'
})
export class ChartActionsService {

  // Pasamos la referencia del documento por el constructor
  constructor(@Inject(DOCUMENT) private document : Document) { }


  // Chart Line Actions
  // Export as image
  exportChartAsImageLine(chartId: string, chartTitle: string){
    const canvas = document.getElementById(chartId) as HTMLCanvasElement;

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
      link.download = `${chartTitle || 'Chart Line'}.png`;
      link.click();

    }
    else{
      console.log("Canas element not found!");
    }

  }

  // Export to CVS
  exportDataCSVLine(data: AlgaeModelChartLine[], title: string){
    if(!data || data.length < 0){
      console.log("No data to export");
      return;
    }

    // Header
    const headers: string[] = ["Algae", "Biomass", "Date"];

    // Convert data to CVS rows
    const rows = data.map((item) => {
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
    link.download = `${title}-${now}.csv`;
    link.click();

    // Free URL Object
    URL.revokeObjectURL(url);

  }

  // Open canvas en new tab ( View details )
  openCanvasInNewTabLine(chartId: string, chartTitle: string){
    const canvas = document.getElementById(chartId) as HTMLCanvasElement;
    
    // Canvas not found
    if(!canvas){
      console.log("Canvas not found");
      return;
    }

    const imageUrl = canvas.toDataURL("image/png"); // Convert canvas to image

    const newTab = window.open();

    // HTML new tab
    if(newTab){
      newTab.document.write(`
        
        <html>
          <head><title>${chartTitle}</title></head>
          
          <body style="margin:5rem">
            <h2 style="text-align: center; font-family:sans-serif;">${chartTitle}</h2>
            <img src="${imageUrl}" style="display:block; margin:auto; max-width:100%;" />
          </body>
        
        </html>
        
        `
      );
      newTab.document.close();
    } else{
      alert("Popup blocked. Please allow popups for this site");
    }

  }




  // Chart Circle Actions
  // Export as image
  exportChartAsImageCircle(chartId: string, chartTitle: string){
    const canvas = document.getElementById(chartId) as HTMLCanvasElement;

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
      link.download = `${chartTitle || 'Chart Line'}.png`;
      link.click();

    }
    else{
      console.log("Canas element not found!");
    }

  }

  // Export to CVS
  exportDataCSVCircle(data: AlgaeCountPerSite){
    if(!data){
      console.log("No data to export");
      return;
    }

    // Header
    const headers: string[] = Object.keys(data);
    const values: number[] = Object.values(data);


    // Convert data to CVS rows
    let csvContent = headers.join(',') + '\n';
    csvContent += values.join(',') + '\n';


    // Build blob for download
    const blob = new Blob([csvContent], {type: 'text/cvs;charset=utf-8'});
    const url = URL.createObjectURL(blob);

    // Create download link
    const link = document.createElement('a');
    link.href = url;
    const now = new Date().toISOString().slice(0,10);
    link.download = `Algae-count-per-site-${now}.csv`;
    link.click();

    // Free URL Object
    URL.revokeObjectURL(url);

  }

  // Open canvas en new tab ( View details )
  openCanvasInNewTabCircle(chartId: string, chartTitle: string){
    const canvas = document.getElementById(chartId) as HTMLCanvasElement;
    
    // Canvas not found
    if(!canvas){
      console.log("Canvas not found");
      return;
    }

    const imageUrl = canvas.toDataURL("image/png"); // Convert canvas to image

    const newTab = window.open();

    // HTML new tab
    if(newTab){
      newTab.document.write(`
        
        <html>
          <head><title>${chartTitle}</title></head>
          
          <body style="margin:5rem">
            <h2 style="text-align: center; font-family:sans-serif;">${chartTitle}</h2>
            <img src="${imageUrl}" style="display:block; margin:auto; max-width:100%;" />
          </body>
        
        </html>
        
        `
      );
      newTab.document.close();
    } else{
      alert("Popup blocked. Please allow popups for this site");
    }

  }
}
