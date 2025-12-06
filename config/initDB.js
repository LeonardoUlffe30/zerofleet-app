const fs = require("fs");
const path = require("path");
const pool = require("./db");
const mysql = require("mysql");

const schemaPath = path.join(__dirname, "../data/schema.sql");

// Conexion temporal sin base de datos
function crearConexionTemporal() {
    return mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        multipleStatements: true
    });
}

// Ejecutar schema.sql (crear BD + tablas)
function ejecutarSchema(conn, callback) {
    const schema = fs.readFileSync(schemaPath, "utf8");
    console.log("Creando BD y tablas...");

    conn.query(schema, (err) => {
        if (err) return callback(err);
        console.log("BD y tablas creadas.");
        callback(null);
    });
}

// Revisar si la BD está vacia
function verificarBaseDatosVacia(pool, callback) {
    pool.query("SELECT COUNT(*) AS total FROM vehiculos", (err, vehiculos) => {
        if (err) return callback(err);

        pool.query("SELECT COUNT(*) AS total FROM concesionarios", (err, concesionarios) => {
            if (err) return callback(err);

            const vacia = (vehiculos[0].total === 0) && (concesionarios[0].total === 0);
            callback(null, vacia);
        })
    })
}

// Funcion principal (orquestador)
function inicializarBD(callback) {
    console.log("Verificando si existe base de datos zerofleet...");
    const connTemp = crearConexionTemporal();

    connTemp.connect(err => {
        if (err) return callback(err);

        ejecutarSchema(connTemp, (err) => {
            if (err) return callback(err);

            verificarBaseDatosVacia(pool, (err, vacia) => {
                if (err) return callback(err);

                callback(null, { vacia });
            })
        })
    })
}

module.exports = { inicializarBD };