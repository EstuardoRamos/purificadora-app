export interface Producto{
  id_producto?: number,
  nombre: string,
  descripcion: string,
  precio: number,
  estado?: string,
  id_categoria?:number
  Categoria?: Categoria;
}

export interface Categoria{
  id: number,
  nombre: string,
}
