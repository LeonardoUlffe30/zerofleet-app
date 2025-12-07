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

function listarReservasTotales(request, response) {
    console.log("Acceso al controladorAPI de reservas ");
    const sql = `
    SELECT v.id_vehiculo, v.matricula, v.marca, v.modelo, v.año_matriculacion, v.numero_plazas, v.autonomia_km, v.color, 
    c.id_concesionario, c.nombre AS concesionario, c.ciudad, v.estado, v.tipo, v.precio_hora
    FROM(
        SELECT * FROM vehiculos WHERE activo = true
    ) AS v
    INNER JOIN concesionarios AS c ON v.id_concesionario = c.id_concesionario;`;

    query(sql)
        .then(reservas => {
            response.status(200).json(reservas);
        })
        .catch(err => {
            console.error("Error al obtener reservas:", err.message);
            response.status(500).json({ error: "Error al obtener reservas" });
        })
}

// CREAR RESERVAS

function formulariocrearReserva(request, response) {
    const idConcesionario = request.session.usuario.id_concesionario;

    const sql = `SELECT matricula FROM vehiculos WHERE id_concesionario = ? AND activo = true AND estado = 'disponible'`;
    const params = [idConcesionario];

    query(sql, params)
        .then(vehiculos => {
            response.status(200).render("reservas", {
                titulo: "Reservas",
                estilo: "reservas.css",
                script: "reservas.js",
                vehiculos: vehiculos
            });
        })
        .catch(err => {
            console.error("Error cargando vehículos:", err.message);
            response.status(500).send("Error interno cargando vehículos");
        });
}

function crearReserva(request, response) {
    console.log("Acceso al controlador de crear reserva");

    const err = validationResult(request);
    if (!err.isEmpty()) {
        console.log("Errores de validación:", err.array());
        return response.status(400).json({ errores: err.errores });
    }

    const { nombreCliente, apellidoCliente, correoCliente, telefonoCliente, vehiculo, fechaHoraIni, fechaHoraFin, duracion } = request.body;

    let sql = `SELECT * FROM clientes WHERE correo = ?`;
    let params = [correoCliente];

    query(sql, params)
        .then(cliente => {
            let id_cliente;

            if (cliente.length === 0) {
                // Insertar cliente
                sql = `INSERT INTO clientes (nombre, apellido, correo, telefono)
                   VALUES (?, ?, ?, ?)`;
                params = [nombreCliente, apellidoCliente, correoCliente, telefonoCliente];

                return query(sql, params)
                    .then(resultado => {
                        id_cliente = resultado.insertId;
                        return id_cliente;
                    });
            } else {
                id_cliente = cliente[0].id_cliente;
                return id_cliente;
            }
        })
        .then(id_cliente => {
            // Cambiar estado del vehículo a reservado
            sql = `UPDATE vehiculos SET estado = 'reservado' WHERE matricula = ?`;
            params = [vehiculo];

            return query(sql, params)
                .then(vehiculoActualizado => {
                    if (vehiculoActualizado.affectedRows === 0) {
                        throw { tipo: "NO_ENCONTRADO", mensaje: "No se ha podido cambiar el estado a reservado del vehículo" };
                    }
                    return id_cliente;
                });
        })
        .then(id_cliente => {
            // Obtener id_vehiculo con la matrícula
            sql = `SELECT id_vehiculo FROM vehiculos WHERE matricula = ?`;
            params = [vehiculo];

            return query(sql, params)
                .then(vehic => {
                    if (vehic.length === 0) {
                        throw { tipo: "NO_ENCONTRADO", mensaje: "No se ha podido encontrar el vehículo" };
                    }
                    return { id_cliente, id_vehiculo: vehic[0].id_vehiculo };
                });
        })
        .then(({ id_cliente, id_vehiculo }) => {
            // Insertar reserva
            const id_usuario = request.session.usuario.id_usuario;
            sql = `INSERT INTO reservas
                (id_usuario, id_vehiculo, id_cliente, fecha_inicio, fecha_fin, kilometros_recorridos, incidencias_reportadas)
                VALUES (?, ?, ?, ?, ?, ?, ?)`;
            params = [id_usuario, id_vehiculo, id_cliente, fechaHoraIni, fechaHoraFin, 0, 0];

            return query(sql, params);
        })
        .then(resultado => {
            response.status(201).json({ mensaje: "Reserva creada", id: resultado.insertId });
        })
        .catch(err => {
            if (err.tipo === "NO_ENCONTRADO") {
                return response.status(404).json({ mensaje: err.mensaje });
            } else {
                console.error(err);
                return response.status(500).json({ mensaje: "Error creando reserva" });
            }
        });
}


// EDITAR RESERVAS
function actualizarReserva(request, response) {
    console.log("Acceso al controlador de actualizar reserva");

    const sql = `
        UPDATE reservas
        SET estado = ?
        WHERE id_reserva = ?
    `;
    const params = [request.body.estado, request.params.id];

    query(sql, params)
        .then(() => {
            return response.status(201).json({ mensaje: "Estado actualizado correctamente" });
        })
        .catch(err => {
            console.error("Error al actualizar el estado:", err.message);
            return response.status(500).json({ error: "Error al actualizar el estado" });
        });
}

// OBTENER RESERVAS POR ID
function obtenerReservasPorUsuario(request, response) {
    console.log("Acceso al controladorAPI de reservas ");
    const sql = `
    SELECT r.id_reserva, c.nombre, c.apellido, c.correo, c.telefono, v.matricula, v.marca, v.modelo,r.fecha_inicio, r.fecha_fin, r.estado
    FROM (
         SELECT * FROM reservas WHERE id_usuario = ?
    ) AS r
    INNER JOIN clientes AS c ON r.id_cliente = c.id_cliente
    INNER JOIN vehiculos AS v ON r.id_vehiculo = v.id_vehiculo`;

    const params = [request.params.id];

    query(sql, params)
        .then(reservas => {
            response.status(200).json(reservas);
        })
        .catch(err => {
            console.error("Error al obtener reservas por usuario:", err.message);
            response.status(500).json({ error: "Error al obtener reservas por usuario" });
        })
}

module.exports = {
    listarReservas,
    listarReservasTotales,
    formulariocrearReserva,
    crearReserva,
    actualizarReserva,
    obtenerReservasPorUsuario
}