export interface WeekPrediction {
  site: string;        
  specie: string;       
  weeks: number;
  // Campos de salida que vienen del backend
  growth?: number;  // Opcional porque no se usa al enviar el formulario
  dateActual?: Date;  // Fecha en formato texto ISO 
  temperature: number;
  din: number;
  nt: number;
}