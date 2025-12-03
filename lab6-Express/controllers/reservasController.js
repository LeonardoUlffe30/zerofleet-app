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

async function formulariocrearReserva(request, response) {
    try {
        const idConcesionario = request.session.usuario.id_concesionario;

        const sql = `SELECT matricula FROM vehiculos WHERE id_concesionario = ? AND activo = true`;
        const params = [idConcesionario];

        const vehiculos = await query(sql, params);

        response.status(200).render("reservas", {
            titulo: "Reservas",
            estilo: "reservas.css",
            script: "reservas.js",
            vehiculos: vehiculos
        });

    } catch (error) {
        console.error("Error cargando vehículos:", err.message);
        response.status(500).send("Error interno cargando vehículos");
    }
}

async function crearReserva(request, response) {
    console.log("Acceso al controlador de crear reserva")
    try {
        const err = validationResult(request);
        if (!err.isEmpty()) {
            console.log("Errores de validación:", err.array());
            return response.status(400).json({ errores: err.array() })
        }

        const { nombreCliente, apellidoCliente, correoCliente, telefonoCliente, vehiculo, fechaHoraIni, fechaHoraFin, duracion } = request.body;

        console.log(nombreCliente, apellidoCliente, correoCliente, telefonoCliente, vehiculo, fechaHoraIni, fechaHoraFin, duracion);

        // Verificar si existe cliente
        let sql = `SELECT * FROM clientes WHERE correo = ?`;
        let params = [correoCliente];

        let cliente = await query(sql, params);
        let id_cliente;

        if (cliente.length === 0) {
            // Insertar cliente
            sql = `INSERT INTO clientes (nombre, apellido, correo, telefono)
                   VALUES (?, ?, ?, ?)`
            params = [nombreCliente, apellidoCliente, correoCliente, telefonoCliente];

            cliente = await query(sql, params);

            id_cliente = cliente.insertId;
        } else id_cliente = cliente[0].id_cliente;

        // Cambiar el estado del vehiculo de disponible a reservado
        sql = `UPDATE vehiculos SET estado = 'reservado' WHERE matricula = ?`;
        params = [vehiculo];

        const vehiculoActualizado = await query(sql, params);

        if (vehiculoActualizado.affectedRows === 0) {
            return response.status(404).json({ mensaje: "No se ha podido cambiar el estado a reseervado del vehiculo" });
        }

        // Obtener id_vehiculo con la matricula seleccionada
        sql = `SELECT id_vehiculo FROM vehiculos WHERE matricula = ?`;
        params = [vehiculo];

        const vehic = await query(sql, params);

        if (vehic === 0) {
            response.status(404).json({ mensaje: "No se ha podido encontrar el vehiculo" });
        }

        const id_vehiculo = vehic[0].id_vehiculo;
        const id_usuario = request.session.usuario.id_usuario; // Obtenido de la sesion guardada al iniciar sesión

        sql = `INSERT INTO reservas
        (id_usuario, id_vehiculo, fecha_inicio, fecha_fin, kilometros_recorridos, incidencias_reportadas)
        VALUES (?, ?, ?, ?, ?, ?)`;
        params = [id_usuario, id_vehiculo, fechaHoraIni, fechaHoraFin, 0, 0];

        const resultado = await query(sql, params);

        response.status(201).json({ mensaje: "Reserva creada", id: resultado.insertId });

    } catch (err) {
        console.error(err);
        response.status(500).json({ mensaje: "Error creando reserva" });
    }
}

// EDITAR RESERVAS
async function actualizarReserva(request, response) {
    try {
        const { estado, id_reserva } = request.params;

        const sql = `
        UPDATE reservas
        SET estado = ?
        WHERE id_reserva = ?`;

        const params = [estado, id_reserva];
        await query(sql, params);

        return response.status(201).json({ mensaje: "Estado actualizado correctamente" });
    } catch (err) {
        console.error("Error al actualizar el estado:", err.message);
        return response.status(500).json({ error: "Error al actualizar el estado" });
    }
}

// OBTENER RESERVAS POR ID
async function obtenerReservasPorUsuario(request, response) {
    try {
        console.log("Acceso al controladorAPI de reservas por usuario: ");
        const sql = `SELECT * FROM reservas WHERE id_usuario = ?`;
        const { id } = request.params;
        let reservas = await query(sql, [id]);
        console.log(reservas);
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