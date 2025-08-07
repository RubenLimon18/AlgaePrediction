export interface WeekPrediction {
  site: string;        
  specie: string;       
  weeks: number;
  // lista que viene del backend
  predictions?: WeeklyGrowth[];
}

export interface WeeklyGrowth {
  date: Date;     // o Date, si ya viene convertido
  biomass: number;
}