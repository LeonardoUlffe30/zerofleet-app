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

// LISTAR RESERVAS

function listarReservas(request, response) {
    response.status(200).render("listareservas", { 
        titulo: "Lista de reservas",
        estilo: "listavehiculos.css",
        script: "",
     });
}

async function listarReservasApi(request, response) {
    console.log("Acceso al controladorAPI de listar reservas");
    const sql = `SELECT * FROM reservas`;
    let reserva = await query(sql);
    response.json(reserva);
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

// EDITAR RESERVAS
async function actualizarReserva(request, response) {
    try {
        const {estado, id_reserva} = request.params;
        
        const sql = `
        UPDATE reservas
        SET estado = ?
        WHERE id_reserva = ?`;

        const params = [estado, id_reserva];
        await query(sql, params);

        return response.status(201).json({ mensaje: "Estado actualizado correctamente"});
    } catch (err) {
        console.error("Error al actualizar el estado:", err.message);
        return response.status(500).json({ error: "Error al actualizar el estado" });
    }
}

// OBTENER RESERVAS POR ID
async function obtenerReservasPorUsuario(request, response) {
    try {
        console.log("Acceso al controladorAPI de reservas por usuario");
        const sql = `SELECT * FROM reservas WHERE id_usuario = ?`;
        const {id_usuario} = request.params;
        let reservas = await query(sql, [id_usuario]);
        response.json(reservas);
    } catch (err) {
        console.error("Error al obtener reservas por usuario:", err.message);
        response.status(500).json({ error: "Error al obtener reservas por usuario" });
    }
}

module.exports = {
    listarReservas,
    listarReservasApi,
    formulariocrearReserva,
    crearReserva,
    actualizarReserva,
    obtenerReservasPorUsuario
}