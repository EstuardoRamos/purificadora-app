import { Component } from '@angular/core';
import { ProductosService } from '../../services/productos.service';
import { Producto } from '../../../interfaces/producto.interface';

@Component({
  selector: 'app-crud-productos',
  templateUrl: './crud-productos.component.html',
  styleUrls: ['./crud-productos.component.css'],
})
export class CrudProductosComponent {
  constructor(
    private productoService: ProductosService,
  ){

  }
  ngOnInit(){
    this.listarProductos();
  }
  productos: Producto[]=[]
  productos1 = [
    { nombre: 'Garrafón', descripcion: 'Agua purificada', precio: 25, categoria: 'venta' },
    { nombre: 'Filtro', descripcion: 'Filtro para purificación', precio: 50, categoria: 'mantenimiento' },
    { nombre: 'Cloro', descripcion: 'Cloro para limpieza', precio: 30, categoria: 'mantenimiento' },
  ];

  displayedColumns = ['nombre', 'precio', 'categoria', 'acciones'];

  productoSeleccionado = null; // Producto en edición
  productoFormulario: Producto =
  {
    id_producto:0,
    nombre: '',
    descripcion: '',
    precio: 0,
    id_categoria:0,
    cantidad: 0
  };

  //productoFormulario = { nombre: '', descripcion: '', precio: null, categoria: '' }; // Formulario vacío
  mostrarFormulario = false; // Controla si se muestra el formulario

  abrirFormulario() {
    this.mostrarFormulario = true;
    this.productoSeleccionado = null;
    this.productoFormulario = { nombre: '', descripcion: '', precio: 0 , id_categoria:0, cantidad:0  };
  }

  editarProducto(producto: any) {
    this.mostrarFormulario = true;
    this.productoSeleccionado = producto;
    console.log(producto);

    this.productoFormulario = { ...producto }; // Carga los datos del producto
  }

  guardarProducto() {
    if (!this.productoFormulario.nombre || !this.productoFormulario.precio || !this.productoFormulario.id_categoria) {
      alert('Por favor completa todos los campos obligatorios.');
      return;
    }


    if (this.productoSeleccionado) {
      // Actualizar producto existente

      Object.assign(this.productoSeleccionado, this.productoFormulario);
      this.actualizarProducto();
      alert('Producto actualizado con éxito.');
    } else {
      // Crear nuevo producto
      this.productos.push({ ...this.productoFormulario });
      this.crearProducto();
      alert('Producto registrado con éxito.');
    }

    this.cancelarFormulario();
  }

  eliminarProducto(producto: any) {
    if (confirm(`¿Estás seguro de eliminar el producto "${producto.nombre}"?`)) {
      this.productos = this.productos.filter((p) => p !== producto);
      this.productoService.deleteProducto(producto.id_producto).subscribe({
        next: () => alert('Producto eliminado con éxito.'),
        error: (error) => alert('Error al eliminar el producto:'+ error)
      })
      //alert('Producto eliminado.');
    }
  }

  cancelarFormulario() {
    this.mostrarFormulario = false;
    this.productoFormulario = { nombre: '', descripcion: '', precio: 0, id_categoria:0, cantidad:0 };
  }


  crearProducto(){
    this.productoService.crearProducto(this.productoFormulario).subscribe({
      next: (producto) => {
        //this.productos.push(producto);
        alert('Producto creado con exito xd')
        this.ngOnInit()
      },
      error: (error) => {
        console.error('Error al crear producto:', error);
        alert("Error al crear producto: "+error.error)
      }
    })
  }

  actualizarProducto(){
    console.log('-----------');

    console.log(this.productoFormulario);

    this.productoService.updateProducto(this.productoFormulario).subscribe({
      next: (producto) => {
        //this.productos.push(producto);
        alert('Producto Actualizado con exito xd')
        this.ngOnInit()
      },
      error: (error) => {
        console.error('Error al crear producto:', error);
        alert("Error al crear producto: "+error.error)
      }
    })
  }



  listarProductos(){
    this.productoService.getProductos().subscribe({
      next: (data) => {
        this.productos = data as Producto[];
      },
      error: (error) => {
        console.error('Error al obtener los productos:', error);
      }
    })
  }
}
