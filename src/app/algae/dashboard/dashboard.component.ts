import { Component, OnInit } from '@angular/core';
import { earning_month } from '../../models/chart_line_earnigns';
import { DataService } from '../historical-data/data-service.service';
import { AlgaeModel, AlgaeModelChartLine } from '../../models/algae.model';
import { firstValueFrom, Subscription } from 'rxjs';


// Generate Report
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit{
  // Atributos
  private lastAlgaeSub: Subscription;
  private algaesChartLine: Subscription;

  lastAlgae: AlgaeModel | null;
  data: AlgaeModelChartLine[] = [];
  dataset: AlgaeModel[];
  fileName: string;

  allAlgaesSub: Subscription;
  
  // Earnings-cards
  cards = [
    { title: 'Casa del marino', amount: '', icon: 'fa-map-marker-alt', borderColor: 'primary', progress: '1'},
    { title: 'Tecolote', amount: '', icon: 'fa-map-marker-alt', borderColor: 'info', progress: '0'},
    { title: 'San Juan de la Costa', amount: '', icon: 'fa-map-marker-alt', borderColor: 'warning', progress: '0'},
  ];


  // Metodos
  constructor(
    private dataService: DataService,
  ){}

  ngOnInit(): void {
   this.dataService.getLastAlgae();
   this.dataService.getAlgaesChartLine();

   const now = new Date();

    // Formatear fecha y hora, ejemplo: 2025-08-11_15-30-00
   const formattedDate = now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0');

   this.fileName = `Historical_Data_Algaes_${formattedDate}`;

   //Subscription Last Algae
   this.lastAlgaeSub = this.dataService.getLastAlgaeUpdateListener()
    .subscribe((algae)=>{
      //console.log(algae);
      this.lastAlgae = algae
    })

    //Subscription Algaes chart line
    this.dataService.getAlgaesChartLineUpdateListener()
      .subscribe((algaes)=>{
        //console.log(algaes)
        this.data = algaes;
      })

    // Sucription All Algaes Report
    this.allAlgaesSub = this.dataService.getAllUpdateListener()
      .subscribe((algaes)=>{
        this.dataset = algaes;
        this.downloadHTMLReport();
        this.downloadPDFReport();
        this.downloadExcelReport();
      })

  }


  ngDestroy(){
    this.lastAlgaeSub.unsubscribe();
    this.algaesChartLine.unsubscribe();
    this.allAlgaesSub.unsubscribe();
  }



  async generateReport(){
    try{
      await this.dataService.getAll();
    }catch (error){
      console.log("Error al generar reporte: ", error);
    }
    
  }


  // Report HTML
  downloadHTMLReport() {
    
    const htmlContent = `
      <html>
        <head><title>Reporte</title></head>
        <body>
          <h1>Historical Data Algaes</h1>
          <table border="1" cellspacing="0" cellpadding="5">
            <thead>
              <tr>
                <th>Site</th>
                <th>Date</th>
                <th>Month</th>
                <th>Year</th>
                <th>Season</th>
                <th>Alga</th>
                <th>Biomass</th>
                <th>DIN Max</th>
                <th>DIN Min</th>
                <th>NT Max</th>
                <th>NT Min</th>
                <th>Temperature</th>
              </tr>
            </thead>
            <tbody>
              ${this.dataset.map(d => `
                <tr>
                  <td>${d.site}</td>
                  <td>${d.date}</td>
                  <td>${d.month}</td>
                  <td>${d.year}</td>
                  <td>${d.season}</td>
                  <td>${d.alga}</td>
                  <td>${d.biomass}</td>
                  <td>${d.din_max}</td>
                  <td>${d.din_min}</td>
                  <td>${d.nt_max}</td>
                  <td>${d.nt_min}</td>
                  <td>${d.temp}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    FileSaver.saveAs(blob, this.fileName + ".html");
  }

  // Report PDF
  downloadPDFReport() {
    const doc = new jsPDF();
    

    doc.text('Historical Data Algaes', 14, 10);

    const headers = [[
      'Site', 'Date', 'Month', 'Year', 'Season',
      'Alga', 'Biomass', 'DIN Max', 'DIN Min',
      'NT Max', 'NT Min', 'Temperature'
    ]];

    const data = this.dataset.map(d => [
      d.site, d.date, d.month, d.year, d.season,
      d.alga, d.biomass, d.din_max, d.din_min,
      d.nt_max, d.nt_min, d.temp
    ]);

    autoTable(doc, {
      startY: 20,
      head: headers,
      body: data,
      styles: { fontSize: 8 }
    });

    doc.save(this.fileName + ".pdf");
  }


  // Report XLXS
  downloadExcelReport() {
    const worksheet = XLSX.utils.json_to_sheet(this.dataset);
    const workbook = {
    Sheets: { 'Reporte': worksheet },
    SheetNames: ['Reporte']
    };

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    FileSaver.saveAs(blob, this.fileName + '.xlsx');
  }
  
} 




