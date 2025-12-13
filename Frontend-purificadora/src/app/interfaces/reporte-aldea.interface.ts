export interface ClientePorAldea {
  id_cliente: number;
  nombre: string;
  ruta: string;
  telefono: string;
  credito: boolean;
  estado: string | null;
}

export interface AldeaResumen {
  id_aldea: number;
  aldea: string;
  totalClientes: number;
  clientes: ClientePorAldea[];
}

export interface ReporteAldeasResponse {
  totalGeneral: number;
  resumen: AldeaResumen[];
}
