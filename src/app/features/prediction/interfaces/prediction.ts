export interface Prediction {
  site: string;        
  specie: string;       
  date: Date;
  // Campos de salida que vienen del backend
  growth?: number;  // Opcional porque no se usa al enviar el formulario
  dateActual?: Date;  // Fecha en formato texto ISO 
  temperature: number;
  din: number;
  nt: number;
}