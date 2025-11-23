const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
const pool = require("./db");

async function ejecutarSQLDesdeArchivo(ruta) {
    const sql = fs.readFileSync(ruta, "utf8");
    const comandos = sql.split(";").filter(c => c.trim());
    for (const comando of comandos) {
        await pool.query(comando);
    }
}

async function baseDatosVacia() {
    try {
        const [filas] = await pool.query("SELECT COUNT(*) AS total FROM vehiculos");
        return filas[0].total === 0;
    } catch (error) {
        return true; // Si falla, se asume que BD vacía
    }
}

async function cargarDatosIniciales() {
    const rutaJSON = path.join(__dirname, "../data/datos-iniciales.json");
    const datos = JSON.parse(fs.readFileSync(rutaJSON, "utf8"));

    // Insertar concesionarios
    for (const c of datos.concesionarios) {
        await pool.query(
            `INSERT INTO concesionarios (nombre, ciudad, direccion, telefono_contacto)
            VALUES (?, ?, ?, ?)`,
            [c.nombre, c.ciudad, c.direccion, c.telefono_contacto]
        );
    }

    // Insertar vehiculos
    for (const v of datos.vehiculos) {
        await pool.query(
            `INSERT INTO vehiculos (matricula, marca, modelo, año_matriculacion, numero_plazas, autonomia_km,
            color, imagen, estado, id_concesionario, tipo, precio_hora)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                v.matricula, v.marca, v.modelo, v.año_matriculacion, v.numero_plazas, v.autonomia_km,
                v.color, v.imagen, v.estado, v.id_concesionario, v.tipo, v.precio_hora
            ]
        );
    }
}

async function inicializarBD() {
    // Conexión temporal para crear la base de datos si no existe antes de usar el pool de conexiones
    console.log("Verificando si existe base de datos zerofleet...");
    const conn = await mysql.createConnection({ host: "localhost", user: "root", password: "" });
    await conn.query("CREATE DATABASE IF NOT EXISTS zerofleet DEFAULT CHARACTER SET utf8mb4 DEFAULT COLLATE utf8mb4_unicode_ci");
    await conn.end();

    console.log("BD creada, verificando si base de datos esta vacia...");

    const vacia = await baseDatosVacia();

    if (!vacia) {
        console.log("La base de datos ya contiene datos.");
        return;
    }

    console.log("BD vacía, creando tablas...");

    const rutaSQL = path.join(__dirname, "schema.sql");
    await ejecutarSQLDesdeArchivo(rutaSQL);

    console.log("Tablas creadas. Insertando datos iniciales...");
    await cargarDatosIniciales();

    console.log("Datos iniciales cargados.");
}

module.exports = { inicializarBD };