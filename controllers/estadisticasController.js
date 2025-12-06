// controllers/estadisticasController.js
const pool = require("../config/db");

function query(sql, params = []) {
    return new Promise(function (resolve, reject) {
        pool.query(sql, params, function (error, filas) {
            if (error) reject(error);
            else resolve(filas);
        });
    });
}

function inicial(request, response){
    response.render("estadisticas", {
            titulo: "Estadísticas",
            estilo: "estadisticas.css",
            script: "estadisticas.js",
        });
}

function estadisticas(request, response) {
    const sqlTotalReservas = "SELECT COUNT(*) AS total FROM reservas";
    const sqlVehiculo = `
        SELECT v.marca AS nombre, COUNT(*) AS reservas
        FROM reservas r
        JOIN vehiculos v ON r.id_vehiculo = v.id_vehiculo
        GROUP BY v.id_vehiculo
        ORDER BY reservas DESC
        LIMIT 1
    `;
    const sqlConcesionarios = `
        SELECT c.nombre, COUNT(r.id_reserva) AS reservas
        FROM concesionarios c
        LEFT JOIN usuarios u ON c.id_concesionario = u.id_concesionario
        LEFT JOIN reservas r ON u.id_usuario = r.id_usuario
        GROUP BY c.id_concesionario
    `;


    Promise.all([
        query(sqlTotalReservas),
        query(sqlVehiculo),
        query(sqlConcesionarios)
    ])
    .then(([totalRows, vehiculoRows, concesionariosRows]) => {
        const totalReservas = totalRows[0]?.total || 0;
        const vehiculoMasUsado = vehiculoRows[0] || null;
        const concesionarios = concesionariosRows;

        response.status(200).json({totalReservas, vehiculoMasUsado, concesionarios});
    })
    .catch(err => {
        console.error("Error cargando estadísticas:", err);
        response.status(500).send("Error cargando estadísticas");
    });
}

module.exports = {
    inicial,
    estadisticas
};
