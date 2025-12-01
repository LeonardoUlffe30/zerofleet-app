const pool = require("../config/db");
const { validationResult } = require("express-validator");

function query(sql, params = []) {
    return new Promise(function (resolve, reject) {
        pool.query(sql, params, function (error, filas) {
            if (error) reject(error);
            else resolve(filas);
        })
    })
}

// Cargar el listado de reservas inicial
function listarReservas(request, response) {
    const usuario = request.session.usuario;

    let sql = `SELECT * FROM reservas`;

    let params = [];

    /*
    if (usuario.rol === "empleado") {
        sql += ` WHERE r.id_usuario = ?`;
        params.push(usuario.id);
    }*/

    pool.query(sql, params, function (error, filas) {
        if (error) return response.status(500).send("Error obteniendo las reservas");

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

// CREAR RESERVAS

function formulariocrearReserva(request, response) {
    response.status(200).render("reservas", {
        titulo: "Reservas",
        estilo: "reservas.css",
        script: "reservas.js"
    });
}

async function crearReserva(request, response) {
    console.log("Acceso al controlador de crear reserva")
    try {
        const err = validationResult(request);
        if (!err.isEmpty()) {
            console.log("Errores de validación:", err.array());
            return response.status(400).json({ errores: err.array()})
        }

        const { nombre, apellido, correo, telefono, tipo, fechaIni, horaIni, fechaFin, horaFin, duracion } = request.body;

        //Se comprueba si el vehiculo esta disponible
        let sql = `SELECT * FROM vehiculos WHERE matricula = ? AND estado != 'disponible'`;
        let params = [tipo];
        let vehiculo = await query(sql, params);
        if(vehiculo.length > 0) {
            return response.status(401).json({ mensaje: "Vehiculo no disponible" });
        }

        //Se coge el id_usuario
        sql = `SELECT * FROM usuarios WHERE correo = ?`;
        params = [correo];
        let usuario = await query(sql, params);
        if(usuario.length == 0){
            return response.status(401).json({ mensaje: "Correo no existente" });
        }

        //Se coge el id_vehiculo
        sql = `SELECT * FROM vehiculos WHERE matricula = ?`;
        params = [tipo];
        let vehic = await query(sql, params);
        if(vehic.length == 0){
            return response.status(401).json({ mensaje: "Vehiculo no existente" });
        }

        sql = `INSERT INTO reservas
        (id_usuario, id_vehiculo, fecha_inicio, fecha_fin, estado, activo)
        VALUES (?, ?, ?, ?, 'activa', true)`;
        params = [usuario[0].id, vehic[0].id, fechaIni, fechaFin]
        const resultado = await query(sql, params);

        response.status(201).json({ mensaje: "Reserva creada correctamente" });

    } catch (err) {
        console.error(err);
        response.status(500).json({ mensaje: "Error creando reserva" });
    }
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
    formulariocrearReserva,
    crearReserva,
    actualizarReserva,
    eliminarReserva
}