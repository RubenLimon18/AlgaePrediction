// interfaces/site.ts
export interface Site {
    id: number;
    name: string;
    description?: string;
}

// interfaces/algae-species.ts
export interface AlgaeSpecies {
    id: number;
    name: string;
    scientificName: string;
    r2Score?: number;
    rmse?: number;
}

// interfaces/prediction.ts
export interface Prediction {
    specie: string;
    site: string;
    date: string;  // Formato ISO: YYYY-MM-DD
    growth?: number;  // Opcional - viene del backend
    dateActual?: Date;  // Opcional - viene del backend
    temperature?: number;  // Opcional - viene del backend
    din?: number;  // Opcional - viene del backend
    nt?: number;  // Opcional - viene del backend
    season?: string;  // Opcional - viene del backend
    confidence?: {
        r2_score: number;
        rmse: number;
        mae: number;
    };
}

// interfaces/prediction-response.ts (respuesta completa del backend)
export interface PredictionResponse {
    growth: number;
    dateActual: string;
    temperature: number;
    din: number;
    nt: number;
    season: string;
    confidence?: {
        r2_score: number;
        rmse: number;
        mae: number;
    };
}