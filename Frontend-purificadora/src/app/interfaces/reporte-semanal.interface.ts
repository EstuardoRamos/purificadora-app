export interface ReporteSemanalDia {
  dia: string;
  fecha: string;
  ventas: number;
  credito: number;
  entrega_total: number;
  garrafones_en_planta: number;
}

export interface ReporteSemanalTotales {
  ventas: number;
  credito: number;
  entrega_total: number;
}

export interface ReporteSemanalResponse {
  resumen: Record<string, ReporteSemanalDia>;
  total: ReporteSemanalTotales;
}

export interface ReporteIngresosDia {
  dia: string;
  fecha: string;
  vendidos: number;
  ventas: number;
  creditos: number;
  ingreso: number;
}

export interface ReporteIngresosTotales {
  ingresos: number;
  creditos: number;
  vendidos: number;
}

export interface ReporteIngresosResponse {
  resumen: Record<string, ReporteIngresosDia>;
  totales: ReporteIngresosTotales;
}
