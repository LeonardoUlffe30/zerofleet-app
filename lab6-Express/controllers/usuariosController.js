const e = require("express");
const pool = require("../config/db");

function query(sql, params = []) {
    return new Promise(function (resolve, reject) {
        pool.query(sql, params, function (error, filas) {
            if (error) reject(error);
            else resolve(filas);
        })
    })
}

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

async function crearUsuario(datosRegistro) {
    const { nombre, correo, contrasenia, rol, telefono, id_concesionario, preferencias_accesibilidad } = datosRegistro;
    console.log("he llegafo aqui");
    const filas = await query("SELECT * FROM usuarios WHERE correo = ?", [correo]);
    if (filas.length > 0) {
        throw new Error("El correo ya está registrado");
    }
console.log("he llegafo aqui2");
    const sqlInsert = `
        INSERT INTO usuarios 
        (nombre, apellido, correo, contraseña, rol, telefono, id_concesionario, preferencias_accesibilidad)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
console.log("he llegafo aqui3");
    const valores = [nombre, correo, contrasenia, rol, telefono, id_concesionario, preferencias_accesibilidad];
console.log("he llegafo aqui4");
    await query(sqlInsert, valores);
}

function actualizarUsuario(datosRegistro) {
    const { nombre, correo, contraseña, rol, telefono, id_concesionario, preferencias_accesibilidad } = datosRegistro;

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