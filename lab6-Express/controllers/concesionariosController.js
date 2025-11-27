const pool = require("../config/db");

function listarConcesionarios(request, response) {
    const sql = `SELECT * FROM concesionarios`;

    pool.query(sql, function (error, filas) {
        if (error) return response.status(500).send("Error obteniendo concesionarios");

        response.render("admin/concesionarios", {
            titulo: "Gestion de Concesionarios",
            estilo: "",
            script: "",
            concesionarios: filas
        });
    });
}

function obtenerConcesionario(request, response) {
    const sql = `SELECT * FROM concesionarios WHERE id_concesionario = ?`;
    let params = [request.params.id];

    pool.query(sql, params, function (error, filas) {
        if (error) return response.status(500).send("Error obteniendo concesionario");

        response.render("concesionarios", {
            titulo: "Concesionarios disponibles",
            estilo: "concesionarios.css",
            script: "",
            concesionarios: filas
        });
    });
}

function crearConcesionario(request, response) {
    const { nombre, ciudad, direccion, telefono_contacto } = request.body;

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

function actualizarConcesionario(request, response) {
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

function eliminarConcesionario(request, response) {
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
    listarConcesionarios,
    obtenerConcesionario,
    crearConcesionario,
    actualizarConcesionario,
    eliminarConcesionario
}