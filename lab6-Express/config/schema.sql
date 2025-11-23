-- Crear base de datos
CREATE DATABASE IF NOT EXISTS zerofleet
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

-- Seleccionar la base de datos a usar
USE zerofleet;

-- =========================
--   TABLA CONCESIONARIOS
-- =========================
CREATE TABLE IF NOT EXISTS concesionarios (
    id_concesionario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    ciudad VARCHAR(255),
    direccion VARCHAR(255),
    telefono_contacto VARCHAR(20)
);

-- =========================
--   TABLA USUARIOS
-- =========================
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    contraseña VARCHAR(255) NOT NULL,
    rol ENUM('empleado', 'admin') DEFAULT 'empleado',
    telefono VARCHAR(20),
    id_concesionario INT,
    preferencias_accesibilidad JSON,

    FOREIGN KEY (id_concesionario) 
        REFERENCES concesionarios(id_concesionario) 
        ON DELETE SET NULL
);


-- =========================
--   TABLA VEHICULOS
-- =========================
CREATE TABLE IF NOT EXISTS vehiculos (
    id_vehiculo INT AUTO_INCREMENT PRIMARY KEY,
    matricula VARCHAR(20) NOT NULL UNIQUE,
    marca VARCHAR(100) NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    año_matriculacion YEAR NOT NULL,
    numero_plazas INT DEFAULT 5,
    autonomia_km INT NOT NULL,
    color VARCHAR(50) NOT NULL,
    imagen VARCHAR(255) NOT NULL,
    estado ENUM('disponible', 'reservado', 'mantenimiento') NOT NULL DEFAULT 'disponible',
    tipo ENUM('coche', 'camioneta', 'van', 'moto') DEFAULT 'coche',
    precio_hora DECIMAL(5,2) DEFAULT 0.00,
    id_concesionario INT,

    FOREIGN KEY (id_concesionario)
        REFERENCES concesionarios(id_concesionario)
        ON DELETE SET NULL
);

-- =========================
--   TABLA RESERVAS
-- =========================
CREATE TABLE IF NOT EXISTS reservas (
    id_reserva INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_vehiculo INT NOT NULL,
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME NOT NULL,
    estado ENUM('activa', 'finalizada', 'cancelada') DEFAULT 'activa',
    kilometros_recorridos INT,
    incidencias_reportadas TEXT,

    FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE,

    FOREIGN KEY (id_vehiculo)
        REFERENCES vehiculos(id_vehiculo)
        ON DELETE CASCADE
);