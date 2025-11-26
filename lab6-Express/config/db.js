const mysql = require("mysql"); // Usamos mysql2 en lugar de mysql para soporte de promesas en async/await

// Configuración de la conexión a la base de datos
const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "zerofleet",
    waitForConnections: true, // Esperar conexiones si no hay disponibles
    connectionLimit: 10, // Límite de conexiones en el pool
    queueLimit: 0 // Sin límite en la cola de espera
});

module.exports = pool