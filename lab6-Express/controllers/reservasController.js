const pool = require("../config/db");

function listarReservas(request, response) {
    const usuario = request.session.usuario;

    let sql = `
        SELECT r.*, u.nombre AS usuario, v.matricula
        FROM reservsa AS r
        JOIN usuarios AS u ON r.id_usuario = u.id_usuario
        JOIN vehiculos AS v ON r.id_vehiculo = v.id_vehiculo`;

    let params = [];

    if (usuario.rol === "empleado") {
        query += ` WHERE r.id_usuario = ?`;
        params.push(usuario.id);
    }

    pool.query(sql, params, function (error, filas) {
        if (error) return response.status(500).send("Error obteniendo reservas");

        response.render("listaReservas", {
            titulo: "Listado de Reservas",
            estilo: "",
            script: "",
            reservas: filas
        });
    });
}

// Falta editar
function obtenerReserva(request, response) {
    const sql = `SELECT * FROM concesionarios WHERE id_concesionario = ?`;
    let params = [request.params.id];

    pool.query(sql, params, function (error, filas) {
        if (error) return response.status(500).send("Error obteniendo concesionario");

        response.render("concesionarios", {
            titulo: "Reservas disponibles",
            estilo: "concesionarios.css",
            script: "",
            concesionarioss: filas
        });
    });
}

// Falta editar
function crearReserva(request, response) {
    const { id_vehiculo, fecha_inicio, fecha_fin } = request.body;

    const sql = `
        INSERT INTO concesionarios
        (nombre, ciudad, direccion, telefono_contacto) 
        VALUES (?, ?, ?, ?)`;

    const params = [nombre, ciudad, direccion, telefono_contacto];

    pool.query(sql, params, function (error) {
        if (error) return response.status(500).send("Error creando concesionario");
        response.redirect("/admin/concesionarios");
    });
}

// Falta editar
function actualizarReserva(request, response) {
    const { nombre, ciudad, direccion, telefono_contacto } = request.body;

    const sql = `
        UPDATE concesionarios SET
        nombre = ?, ciudad = ?, direccion = ?, telefono_contacto = ?
        WHERE id_concesionario = ?`;

    const params = [nombre, ciudad, direccion, telefono_contacto];

    pool.query(sql, params, function (error) {
        if (error) return response.status(500).send("Error actualizando concesionario");
        response.redirect("/admin/concesionarios");
    });
}

// Falta editar
function eliminarReserva(request, response) {
    const sql = `
        UPDATE concesionarios SET
        activo = false
        WHERE id_concesionario = ?`;

    const params = [request.params.id];

    pool.query(sql, params, function (error) {
        if (error) return response.status(500).sendd("Error eliminando concesionario");
        response.redirect("/admin/concesionarios");
    })
}


module.exports = {
    listarReservas,
    obtenerReserva,
    crearReserva,
    actualizarReserva,
    eliminarReserva
}