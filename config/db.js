const mysql = require("mysql");

// Configuración de la conexión a la base de datos
const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "zerofleet",
    waitForConnections: true, // Esperar conexiones si no hay disponibles
    connectionLimit: 10, // Límite de conexiones en el pool
    queueLimit: 0, // Sin límite en la cola de espera
    timezone: 'Z'
});

module.exports = pool