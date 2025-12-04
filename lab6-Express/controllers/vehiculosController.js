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

// ------------------- LISTADO VISTAS ---------------------
async function listarVehiculos(request, response) {
    try {
        const sql = "SELECT * FROM vehiculos WHERE activo = true";
        const vehiculos = await query(sql);

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
    } catch (error) {
        console.error(error);
        response.status(500).send("Error interno del servidor");
    }
}

// ------------------- LISTAR VEHICULOS API CON FETCH ---------------------
async function listarVehiculosApi(req, res) {
    try {
        console.log("Request query: ", req.query);
        console.log("API listarVehiculosAPI");
        const filtroMarca = req.query.filtroMarca || "";
        const filtroColor = (req.query.filtroColor || "").toLowerCase();
        const filtroConcesionario = req.query.filtroConcesionario || "";
        const filtroPlazas = req.query.filtroPlazas || "";
        const filtroAutonomia = req.query.filtroAutonomia || "";
        const filtroTipo = req.query.filtroTipo || "";


        let sql = "SELECT * FROM vehiculos WHERE activo = true";
        const params = [];

        if (filtroMarca) {
            sql += " AND marca = ?";
            params.push(filtroMarca);
        }

        if (filtroColor) {
            sql += ` AND color LIKE ?`;
            params.push(`%${filtroColor}%`);
        }

        if (filtroConcesionario) {
            const aux_sql = `SELECT id_concesionario FROM concesionarios WHERE nombre = ?`
            const aux_params = [filtroConcesionario];
            const concesionario = await query(aux_sql, aux_params);

            sql += ` AND id_concesionario = ?`;
            params.push(concesionario[0].id_concesionario);
        }

        if (filtroPlazas) {
            sql += ` AND numero_plazas = ?`;
            params.push(filtroPlazas);
        }

        if (filtroTipo) {
            sql += ` AND tipo = ?`;
            params.push(filtroTipo);
        }

        // --- ORDENAR POR AUTONOMÍA ---
        if (filtroAutonomia === "maxima") {
            sql += " ORDER BY autonomia_km DESC";
        } else if (filtroAutonomia === "minima") {
            sql += " ORDER BY autonomia_km ASC";
        }

        // Traer todos los vehículos filtrados
        let vehiculos = await query(sql, params);

        res.json(vehiculos);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener vehículos" });
    }
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

async function formularioEditarVehiculo(request, response) {
    try {
        let sql = `SELECT * FROM vehiculos WHERE matricula = ? AND activo = true`;
        let params = [request.params.id];

        const vehiculo = await query(sql, params);

        if (vehiculo.length === 0) {
            return response.status(404).json({ mensaje: "Vehiculo no encontrado" });
        }

        sql = `SELECT nombre FROM concesionarios WHERE id_concesionario = ?`
        params = [vehiculo[0].id_concesionario];

        const concesionario = await query(sql, params);

        vehiculo[0].id_concesionario = concesionario[0].nombre;

        response.status(200).render("vehiculos", {
            titulo: "Editar vehículo",
            estilo: "vehiculos.css",
            script: "vehiculos.js",
            vehiculo: vehiculo[0],
            error: ""
        });
    } catch (error) {
        console.error(error);
        response.status(500).send("Error interno del servidor");
    }
}

async function obtenerVehiculo(request, response) {
    try {
        const sql = `SELECT * FROM vehiculos WHERE matricula = ? and activo = true`;
        const params = [request.params.id];

        const vehiculo = await query(sql, params);

        if (vehiculo.length === 0) {
            return response.status(404).json({ mensaje: "Vehiculo no encontrado" });
        }

        response.status(200).json(vehiculo[0]);
    } catch (error) {
        console.error(error);
        response.status(500).json({ error: "Error al obtener vehículo" });
    }
}

async function crearVehiculo(request, response) {
    try {
        const error = validationResult(request);
        if (!error.isEmpty()) {
            return response.status(400).json({ errores: error.array() });
        }

        const imagen = request.file ? request.file.filename : "";
        const {
            matricula, marca, modelo, anyoMatriculacion,
            numeroPlazas, autonomia, color,
            estado, tipo, precioHora, concesionario
        } = request.body;

        // Verificamos que el concesionario existe
        let sql = `SELECT id_concesionario FROM concesionarios WHERE nombre = ?`;
        let params = [concesionario];
        const concesionarioId = await query(sql, params);

        if (concesionarioId.length === 0)
            return response.status(400).json({ message: "Concesionario no existe" });

        const id_concesionario = concesionarioId[0].id_concesionario;

        // Insertamos vehiculo
        sql = `
            INSERT INTO vehiculos
            (matricula, marca, modelo, año_matriculacion, numero_plazas, autonomia_km,
                color, imagen, estado, tipo, precio_hora, id_concesionario)
            VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        params = [
            matricula, marca, modelo, anyoMatriculacion,
            numeroPlazas, autonomia, color, imagen,
            estado, tipo, precioHora, id_concesionario
        ];

        const resultado = await query(sql, params);

        response.status(201).json({ mensaje: "Vehiculo creado", id: resultado.insertId });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener los filtros" });
    }
}

async function actualizarVehiculo(request, response) {
    try {
        const errores = validationResult(request);

        if (!errores.isEmpty()) {
            return response.status(400).json({ errores: errores.array() });
        }

        const imagen = request.file ? request.file.filename : "";
        const {
            matricula, marca, modelo, anyoMatriculacion,
            numeroPlazas, autonomia, color,
            estado, tipo, precioHora, concesionario
        } = request.body;

        let sql = `SELECT id_concesionario FROM concesionarios WHERE nombre = ?`;
        let params = [concesionario];

        const concesionarioId = await query(sql, params);

        if (concesionarioId.length === 0) {
            return response.status(400).json({ mensaje: "Concesionario no existe" });
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

        const resultado = await query(sql, params);

        if (resultado.affectedRows === 0) {
            return response.status(404).json({ mensaje: "Vehiculo no encontrado" });
        }

        response.status(200).json({ mensaje: "Vehiculo actualizado correctamente" });

    } catch (error) {
        console.error(error);
        response.status(500).json({ mensaje: "Error actualizando vehiculo" });
    }
}

async function eliminarVehiculo(request, response) {
    try {
        const sql = `
            UPDATE vehiculos SET
            activo = false
            WHERE matricula = ?`;

        const params = [request.params.id];

        const resultado = await query(sql, params);

        if (resultado.affectedRows === 0) {
            return response.status(404).json({ mensaje: "Vehiculo no encontrado" });
        }

        return response.status(200).json({ mensaje: "Vehiculo eliminado correctamente" });

    } catch (error) {
        console.error(error);
        response.status(500).json({ mensaje: "Error eliminando vehiculo" });
    }
}

async function obtenerFiltros(request, response) {
    try {
        const marcas = await query("SELECT DISTINCT marca FROM vehiculos WHERE activo = true");
        const tipos = await query("SELECT DISTINCT tipo FROM vehiculos WHERE activo = true");
        const concesionarios = await query("SELECT DISTINCT nombre FROM concesionarios");


        response.json({ marcas, tipos, concesionarios });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error interno" });
    }
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
    obtenerFiltros
};