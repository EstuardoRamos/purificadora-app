export interface Cliente{
  id_cliente?: number;
  nombre: string;
  ruta: string;
  credito?: boolean;
  estado?: string;
  ultimaCompra?: string | null;
  direccion:string;
  telefono:string;
  coordenadas?:string;
  garrafones_prestados?: number;
  id_aldea?:number;
  Aldea?:Aldea;
}

export interface Aldea{
  id_aldea?: number;
  nombre?: string;
}
