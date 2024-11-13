-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS purificadora;
USE purificadora;

-- Tabla para tipos de usuarios
CREATE TABLE tipo_usuario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL
);

-- Tabla para usuarios
CREATE TABLE usuario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    tipo INT,
    telefono INT,
    contraseña VARCHAR(100) NOT NULL,
    fecha_de_nacimiento DATE,
    FOREIGN KEY (tipo) REFERENCES tipo_usuario(id)
);

CREATE TABLE aldea(
    id_aldea INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
);

-- Tabla para clientes
CREATE TABLE cliente (
    id_cliente INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    ruta VARCHAR(100),
    credito BOOLEAN DEFAULT false,
    estado VARCHAR(50),
    direccion VARCHAR(200),
    telefono VARCHAR(15),
    coordenadas VARCHAR(100),
    id_aldea INT,
    garradones_prestados,
    FOREIGN KEY (id_aldea) REFERENCES aldea(id_aldea)
);



-- Tabla para la empresa
CREATE TABLE empresa (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(200),
    logo BLOB
);

-- Tabla para categorías de productos
CREATE TABLE categoria (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL
);

-- Tabla para productos
CREATE TABLE productos (
    id_producto INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    estado BOOLEAN DEFAULT true,
    categoria INT,
    FOREIGN KEY (categoria) REFERENCES categoria(id)
);

-- Tabla para el inventario de productos
CREATE TABLE inventario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_producto INT,
    cantidad INT NOT NULL,
    estado BOOLEAN GENERATED ALWAYS AS (cantidad > 0) STORED,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
);

-- Tabla para registrar el inventario (historial de entradas)
CREATE TABLE registro_inventario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_producto INT,
    cantidad INT NOT NULL,
    fecha_ingreso DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_empleado INT,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto),
    FOREIGN KEY (id_empleado) REFERENCES usuario(id)
);

-- Tabla para formas de pago
CREATE TABLE forma_pago (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL
);

-- Tabla para ventas
CREATE TABLE venta (
    id_venta INT PRIMARY KEY AUTO_INCREMENT,
    id_cliente INT,
    fecha_compra DATETIME DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10, 2),
    id_usuario INT,
    id_forma_pago INT,
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id),
    FOREIGN KEY (id_forma_pago) REFERENCES forma_pago(id)
);

-- Tabla para detalle de ventas
CREATE TABLE detalle_venta (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_compra INT,
    id_producto INT,
    cantidad INT NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) AS (cantidad * precio) STORED,
    FOREIGN KEY (id_compra) REFERENCES venta(id_venta),
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
);
