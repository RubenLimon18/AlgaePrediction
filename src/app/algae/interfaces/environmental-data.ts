export interface EnvironmentalData {
  id?: string;
  location: string;
  date: Date;
  waterTemperature: number; // °C (15-35°C)
  salinity: number; // PSU (30-40 PSU)
  solarRadiation: number; // W/m² (0-1500 W/m²)
  windSpeed: number; // m/s (0-30 m/s)
  windDirection: number; // degrees (0-360°)
  currentSpeed: number; // m/s (0-2 m/s)
  currentDirection: number; // degrees (0-360°)
  createdAt?: Date;
}

export interface EnvironmentalDataForm {
  location: string;
  date: string;
  time: string;
  waterTemperature: number | null;
  salinity: number | null;
  solarRadiation: number | null;
  windSpeed: number | null;
  windDirection: number | null;
  currentSpeed: number | null;
  currentDirection: number | null;
}