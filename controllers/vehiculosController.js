const { validationResult } = require("express-validator");
const pool = require("../config/db");

// Helper para ejecutar consultas facilmente
function query(sql, params = []) {
    return new Promise(function (resolve, reject) {
        pool.query(sql, params, function (error, filas) {
            if (error) reject(error);
            else resolve(filas);
        })
    })
}

// ------------------- EN RELACION CON LISTADO VISTAS ---------------------
function listarVehiculos(request, response) {
    const sql = `
    SELECT v.id_vehiculo, v.matricula, v.marca, v.modelo, v.año_matriculacion, v.numero_plazas, v.autonomia_km, v.color, 
    c.id_concesionario, c.nombre AS concesionario, c.ciudad, v.estado, v.tipo, v.precio_hora, v.imagen
    FROM(
        SELECT * FROM vehiculos WHERE activo = true
    ) AS v
    INNER JOIN concesionarios AS c ON v.id_concesionario = c.id_concesionario
    `;
    query(sql)
        .then(vehiculos => {
            response.status(200).render("listavehiculos", {
                titulo: "Vehículos",
                estilo: "listavehiculos.css",
                script: "",
                vehiculos: vehiculos,
                buscar: "",
                filtro: "",
                error: "",
                mensaje: ""
            });
        })
        .catch(error => {
            console.error(error);
            response.status(500).send("Error interno del servidor");
        });
}

function listarVehiculosApi(request, response) {
    console.log("Request query: ", request.query);
    console.log("API listarVehiculosAPI");

    const filtroMarca = request.query.filtroMarca || "";
    const filtroColor = (request.query.filtroColor || "").toLowerCase();
    const filtroPlazas = request.query.filtroPlazas || "";
    const filtroAutonomia = request.query.filtroAutonomia || "";
    const filtroTipo = request.query.filtroTipo || "";
    const filtroConcesionario = request.query.filtroConcesionario || "";
    const filtroCiudad = (request.query.filtroCiudad || "").toLowerCase();

    let sql = `
    SELECT v.id_vehiculo, v.matricula, v.marca, v.modelo, v.año_matriculacion, v.numero_plazas, v.autonomia_km, v.color, 
    c.id_concesionario, c.nombre AS concesionario, c.ciudad, v.estado, v.tipo, v.precio_hora, v.imagen
    FROM vehiculos AS v
    INNER JOIN concesionarios AS c ON v.id_concesionario = c.id_concesionario WHERE v.activo = true
    `;
    const params = [];

    if (filtroMarca) {
        sql += " AND v.marca = ?";
        params.push(filtroMarca);
    }

    if (filtroColor) {
        sql += " AND v.color LIKE ?";
        params.push(`%${filtroColor}%`);
    }

    if (filtroPlazas) {
        sql += " AND v.numero_plazas = ?";
        params.push(filtroPlazas);
    }

    if (filtroTipo) {
        sql += " AND v.tipo = ?";
        params.push(filtroTipo);
    }

    if (filtroCiudad) {
        sql += " AND c.ciudad LIKE ?"
        params.push(`%${filtroCiudad}%`);
    }

    if (filtroAutonomia === "maxima") {
        sql += " ORDER BY v.autonomia_km DESC";
    } else if (filtroAutonomia === "minima") {
        sql += " ORDER BY v.autonomia_km ASC";
    }

    // Promesa inicial con la consulta básica
    query(sql, params)
        .then(vehiculos => {
            if (!filtroConcesionario) return vehiculos;

            const aux_sql = "SELECT id_concesionario FROM concesionarios WHERE nombre = ?";
            const aux_params = [filtroConcesionario];

            return query(aux_sql, aux_params)
                .then(concesionario => {
                    if (concesionario.length > 0) {
                        const id_concesionario = concesionario[0].id_concesionario;
                        return vehiculos.filter(v => v.id_concesionario === id_concesionario);
                    }
                });
        })
        .then(vehiculosFinal => {
            response.status(200).json(vehiculosFinal);
        })
        .catch(error => {
            console.error(error);
            response.status(500).json({ error: "Error al obtener vehículos" });
        });
}

function eliminarVehiculo(request, response) {
    const sql = `
        UPDATE vehiculos SET
        activo = false
        WHERE matricula = ?`;
    const params = [request.params.id];

    query(sql, params)
        .then(resultado => {
            if (resultado.affectedRows === 0) {
                return response.status(404).json({ mensaje: "Vehiculo no encontrado" });
            }
            return response.status(200).json({ mensaje: "Vehiculo eliminado correctamente" });
        })
        .catch(error => {
            console.error(error);
            response.status(500).json({ mensaje: "Error eliminando vehiculo" });
        });
}

function formularioCrearVehiculo(request, response) {
    response.status(200).render("vehiculos", {
        titulo: "Vehículos",
        estilo: "vehiculos.css",
        script: "vehiculos.js",
        vehiculo: "",
        error: ""
    });
}

function crearVehiculo(request, response) {

    const { matricula, marca, modelo, anyoMatriculacion, numeroPlazas, autonomia, color,
        estado, tipo, precioHora, concesionarioVehiculo } = request.body;
    const imagen = request.file ? request.file.filename : "";

    sql = "SELECT matricula FROM vehiculos WHERE matricula = ?";
    params = [matricula];

    query(sql, params)
        .then(existente => {
            if (existente.length > 0) {
                throw { status: 400, mensaje: "La matrícula ya existe" };
            }

            sql = "SELECT id_concesionario FROM concesionarios WHERE nombre = ?";
            params = [concesionarioVehiculo];
            return query(sql, params);
        })
        .then(concesionarioId => {
            if (concesionarioId.length === 0) {
                throw { status: 400, mensaje: "Concesionario no existe" };
            }

            const id_concesionario = concesionarioId[0].id_concesionario;

            // Insertamos el vehículo
            sql = `
            INSERT INTO vehiculos
            (matricula, marca, modelo, año_matriculacion, numero_plazas, autonomia_km,
             color, imagen, estado, tipo, precio_hora, id_concesionario)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            params = [
                matricula, marca, modelo, anyoMatriculacion,
                numeroPlazas, autonomia, color, imagen,
                estado, tipo, precioHora, id_concesionario
            ];

            return query(sql, params);
        })
        .then(resultado => {
            if (resultado && resultado.insertId) {
                response.status(201).json({ mensaje: "Vehiculo creado", id: resultado.insertId });
            }
        })
        .catch(error => {
            if (error.status && error.mensaje) {
                response.status(error.status).json({ mensaje: error.mensaje });
            } else {
                console.error(error);
                response.status(500).json({ error: "Error al crear el vehículo" });
            }
        });
}

function formularioEditarVehiculo(request, response) {
    let sql = `SELECT * FROM vehiculos WHERE matricula = ? AND activo = true`;
    let params = [request.params.id];

    query(sql, params)
        .then(vehiculo => {
            if (vehiculo.length === 0) {
                throw { status: 400, mensaje: "Vehiculo no existe" };
            }

            sql = `SELECT nombre FROM concesionarios WHERE id_concesionario = ?`;
            params = [vehiculo[0].id_concesionario];

            return query(sql, params)
                .then(concesionario => {
                    vehiculo[0].id_concesionario = concesionario[0].nombre;

                    response.status(200).render("vehiculos", {
                        titulo: "Editar vehículo",
                        estilo: "vehiculos.css",
                        script: "vehiculos.js",
                        vehiculo: vehiculo[0],
                        error: ""
                    });
                });
        })
        .catch(error => {
            if (error.status && error.mensaje) {
                response.status(error.status).json({ mensaje: error.mensaje });
            } else {
                console.error(error);
                response.status(500).json({ error: "Error al crear el vehículo" });
            }
        });
}

function obtenerVehiculo(request, response) {
    const sql = `SELECT * FROM vehiculos WHERE matricula = ? and activo = true`;
    const params = [request.params.id];

    query(sql, params)
        .then(vehiculo => {
            if (vehiculo.length === 0) {
                return response.status(404).json({ mensaje: "Vehiculo no encontrado" });
            }
            response.status(200).json(vehiculo[0]);
        })
        .catch(error => {
            console.error(error);
            response.status(500).json({ error: "Error al obtener vehículo" });
        });
}

function actualizarVehiculo(request, response) {
    const errores = validationResult(request);

    if (!errores.isEmpty()) {
        console.log("Errores de validación:", errores.array());
        return response.status(400).json({ errores: errores.array() });
    }

    const imagen = request.file ? request.file.filename : "";
    const {matricula, marca, modelo, anyoMatriculacion, numeroPlazas, autonomia, color, estado, tipo, precioHora, concesionarioVehiculo } = request.body;

     sql = "SELECT matricula FROM vehiculos WHERE matricula = ?";
    params = [matricula];

    query(sql, params)
    .then(existente => {
        if (existente.length > 0) {
            throw { status: 400, mensaje: "La matrícula ya existe" };
        }

        sql = "SELECT id_concesionario FROM concesionarios WHERE nombre = ?";
        params = [concesionarioVehiculo];
        return query(sql, params);
    })
    .then(concesionarioId => {
        if (concesionarioId.length === 0) {
            throw { status: 400, mensaje: "Concesionario no existe" };
        }

        const id_concesionario = concesionarioId[0].id_concesionario;

        // La matricula a filtrar del WHERE es la antigua (viene en la URL /id/editar)
        // y la matricula a actualizar (en caso se cambie, viene en el request.body) 

        sql = `
        UPDATE vehiculos SET
            matricula = ?, marca = ?, modelo = ?, año_matriculacion = ?, 
            numero_plazas = ?, autonomia_km = ?, color = ?, imagen = ?, 
            estado = ?, tipo = ?, precio_hora = ?, id_concesionario = ?
            WHERE matricula = ? AND activo = true `;

        params = [
            matricula, marca, modelo, anyoMatriculacion,
            numeroPlazas, autonomia, color, imagen,
            estado, tipo, precioHora, id_concesionario, request.params.id
        ];

        return query(sql, params);
    })
    .then(resultado => {
        if (resultado && resultado.affectedRows === 0) {
            throw { status: 400, mensaje: "Vehiculo no existe" };
        }
        response.status(200).json({ mensaje: "Vehiculo actualizado correctamente" });
    })
    .catch(error => {
        if (error.status && error.mensaje) {
            response.status(error.status).json({ mensaje: error.mensaje });
        } else {
            console.error(error);
            response.status(500).json({ error: "Error al crear el vehículo" });
        }
    });
}

function obtenerFiltros(request, response) {
    query("SELECT DISTINCT marca FROM vehiculos WHERE activo = true")
        .then(marcas => {
            return query("SELECT DISTINCT tipo FROM vehiculos WHERE activo = true").then(tipos => ({ marcas, tipos }));
        })
        .then(({ marcas, tipos }) => {
            return query("SELECT DISTINCT nombre FROM concesionarios")
                .then(concesionarios => ({ marcas, tipos, concesionarios }));
        })
        .then(resultado => {
            response.json(resultado);
        })
        .catch(err => {
            console.error(err);
            response.status(500).json({ error: "Error interno" });
        });
}

function obtenerConcesionarios(request, response) {
    query("SELECT DISTINCT nombre FROM concesionarios WHERE activo = true")
        .then(concesionarios => {
            response.json(concesionarios);
        })
        .catch(err => {
            console.error(err);
            response.status(500).json({ error: "Error interno" });
        });
}



module.exports = {
    listarVehiculos,
    listarVehiculosApi,
    formularioCrearVehiculo,
    formularioEditarVehiculo,
    obtenerVehiculo,
    crearVehiculo,
    actualizarVehiculo,
    eliminarVehiculo,
    obtenerFiltros,
    obtenerConcesionarios
};