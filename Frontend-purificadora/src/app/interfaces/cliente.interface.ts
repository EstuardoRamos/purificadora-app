export interface Cliente{
  id_cliente?: number;
  nombre: string;
  ruta: string;
  credito?: boolean;
  estado?: string;
  direccion:string;
  telefono:string;
  coordenadas?:string;
  garrafones_prestados?: number;
  aldea?:Aldea;
}

export interface Aldea{
  id?: number;
  nombre?: string;
}
