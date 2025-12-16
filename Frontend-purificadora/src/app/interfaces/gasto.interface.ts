export interface Gasto {
  id?: number;
  gasto: string;
  valor: number;
  fecha: string;
  observacion?: string;
}

export interface GastoReporteResponse {
  gastos: Gasto[];
  total?: number;
}
