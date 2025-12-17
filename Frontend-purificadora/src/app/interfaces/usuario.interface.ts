export interface Usuario{
  id: number;
  nombre:string;
  correo: string;
  contraseña: string;
  telefono: number;
  fecha_nacimiento: Date;
  tipo: TipoUsuario;
  activo?: boolean;
}

export interface TipoUsuario{
  id: number;
  nombre: string;
}
