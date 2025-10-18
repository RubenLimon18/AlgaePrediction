export interface AlgaeModel {
  temperature: any;
  site: string;
  date: string;
  month: string;
  year: string;
  season: string;
  alga: string;
  biomass: number;
  din_max: number;
  din_min: number;
  nt_max: number;
  nt_min: number;
  temp: number;
}

export interface AlgaeModelChartLine {
  // month: string;
  // year: string;
  alga: string;
  biomass: number;
  date: string;
}

export interface parameterModel{
  // month: string;
  // year: string;
  site: string;
  valor: number;
  month: string;
  season: string;
}


export interface AlgaeCountPerSite{
  count: {
    string : number,
  }
}