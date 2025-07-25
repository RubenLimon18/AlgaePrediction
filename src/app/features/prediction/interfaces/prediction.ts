export interface Prediction {
  site: string;        
  specie: string;       
  temperature: number;
  din: number;
  nt: number;
  days: number;
  // Campos de salida que vienen del backend
  growth?: number;  // Opcional porque no se usa al enviar el formulario
  date?: Date;  // Fecha en formato texto ISO 
}