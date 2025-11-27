const pool = require("../config/db");

function listarUsuarios(request, response) {
    const sql = `SELECT * FROM usuarios`;

    pool.query(sql, function (error, filas) {
        if (error) return response.status(500).send("Error obteniendo usuarios");

        response.render("admin/usuarios", {
            titulo: "Usuarios registrados",
            estilo: "",
            script: "",
            usuarios: filas
        });
    });
}

function obtenerUsuario(request, response) {
    const sql = `SELECT * FROM usuarios WHERE id_usuario = ?`;
    const params = [request.params.id];

    pool.query(sql, params, function (error, filas) {
        if (error) return response.status(500).send("Error obteniendo usuario");

        response.render("admin/usuarios", {
            titulo: "Usuarios disponibles",
            estilo: "usuarios.css",
            script: "",
            concesionarioss: filas
        });
    });
}

function crearUsuario(request, response) {
    const { nombre, correo, contraseña, rol, telefono, id_concesionario, preferencias_accesibilidad } = request.body;

    const sql = `
        INSERT INTO usuarios 
        (nombre, correo, contraseña, rol, telefono, id_concesionario, preferencias_accesibilidad) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`;

    const params = [nombre, correo, contraseña, rol, telefono, id_concesionario, preferencias_accesibilidad];

    pool.query(sql, params, function (error) {
        if (error) return response.status(500).send("Error creando usuario");
        response.redirect("/admin/usuarios");
    });
}

function actualizarUsuario(request, response) {
    const { nombre, correo, contraseña, rol, telefono, id_concesionario, preferencias_accesibilidad } = request.body;

    const sql = `
        UPDATE usuarios SET
        nombre = ?, correo = ?, contraseña = ?, rol = ?, telefono = ?, id_concesionario = ?, preferencias_accesibilidad = ?
        WHERE id_usuario = ?`;

    const params = [nombre, correo, contraseña, rol, telefono, id_concesionario, preferencias_accesibilidad, request.params.id];

    pool.query(sql, params, function (error) {
        if (error) return response.status(500).send("Error actualizando usuario");
        response.redirect("/admin/usuarios");
    });
}

function eliminarUsuario(request, response) {
    const sql = `
        UPDATE usuarios SET
        activo = false
        WHERE id_usuario = ?`;

    const params = [request.params.id];

    pool.query(sql, params, function (error) {
        if (error) return response.status(500).sendd("Error eliminando usuario");
        response.redirect("/admin/usuarios");
    })
}


module.exports = {
    listarUsuarios,
    obtenerUsuario,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario
}