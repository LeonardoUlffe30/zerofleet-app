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
        response.status(500).json({ mensaje: "Error interno del servidor" });
    }
}

// ------------------- LISTAR VEHICULOS API CON FETCH ---------------------
async function listarVehiculosApi(req, res) {
    try {
        console.log("Request query: ", req.query);
        console.log("API listarVehiculosAPI");
        const buscar = (req.query.buscar || "").toLowerCase();           // Texto a buscar
        const filtroCampo = req.query.filtroCampo || "";                           // "marca" o "modelo"
        const filtroTipo = req.query.filtroTipo || "";             // "coche", "moto", etc.

        console.log(buscar, filtroCampo, filtroTipo);

        let sql = "SELECT * FROM vehiculos WHERE activo = true";
        const params = [];

        if (filtroTipo) {
            sql += " AND tipo = ?";
            params.push(filtroTipo);
        }

        if (buscar && filtroCampo && (filtroCampo === "marca" || filtroCampo === "modelo")) {
            console.log("Filtrando por ", filtroCampo, "y buscando ", buscar);
            sql += ` AND LOWER(${filtroCampo}) LIKE ?`;
            params.push(`%${buscar}%`);
        }

        // Traer todos los vehículos filtrados por tipo
        let vehiculos = await query(sql, params);

        // Filtro por columna (marca o modelo) usando la búsqueda libre
        if (buscar && filtroCampo) {
            console.log("Filtrando por ", filtroCampo, " y buscando ", buscar);
            vehiculos = vehiculos.filter(v =>
                v[filtroCampo]?.toLowerCase().includes(buscar)
            );
        }
        res.json(vehiculos);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener vehículos" });
    }
}

function formularioVehiculo(request, response) {
    response.status(200).render("vehiculos", {
        titulo: "Vehículos",
        estilo: "vehiculos.css",
        script: "vehiculos.js",
        vehiculo: "",
        error: ""
    });
}

function obtenerVehiculo(request, response) {
    const sql = `SELECT * FROM vehiculos WHERE id_vehiculo = ?`;
    const params = [request.params.id];

    pool.query(sql, params, function (error, filas) {
        if (error) return response.status(500).send("Error obteniendo vehiculo");

        response.render("vehiculos", {
            titulo: "Vehículos disponibles",
            estilo: "vehiculos.css",
            script: "",
            vehiculos: filas
        });
    });
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

        console.log(matricula, marca, modelo, anyoMatriculacion,
            numeroPlazas, autonomia, color,
            estado, tipo, precioHora, concesionario);

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

        params = [matricula, marca, modelo, anyoMatriculacion, numeroPlazas, autonomia,
            color, imagen, estado, tipo, precioHora, id_concesionario];

        const resultado = await query(sql, params);

        response.status(201).json({ mensaje: "Vehiculo creado", id: resultado.insertId });

    } catch (error) {
        console.error(error);
        response.status(500).json({ mensaje: "Error creando vehiculo" });
    }
}

function actualizarVehiculo(request, response) {
    const { matricula, marca, modelo, año_matriculacion, numero_plazas, autonomia_km,
        imagen, estado, id_concesionario
    } = request.body;

    const sql = `
        UPDATE vehiculos SET
        matricula = ?, marca = ?, modelo = ?, año_matriculacion = ?, numero_plazas = ?,
            autonomia_km = ?, color = ?, imagen = ?, estado = ?, id_concesionario = ?
                WHERE id_vehiculo = ? `;

    const params = [matricula, marca, modelo, año_matriculacion, numero_plazas, autonomia_km,
        imagen, estado, id_concesionario, request.params.id];

    pool.query(sql, params, function (error) {
        if (error) return response.status(500).send("Error actualizando vehículo");
        response.redirect("/admin/vehiculos");
    });
}

async function eliminarVehiculo(request, response) {
    try {
        const sql = `
            UPDATE vehiculos SET
        activo = false
            WHERE id_vehiculo = ? `;

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

module.exports = {
    listarVehiculos,
    listarVehiculosApi,
    formularioVehiculo,
    obtenerVehiculo,
    crearVehiculo,
    actualizarVehiculo,
    eliminarVehiculo
};