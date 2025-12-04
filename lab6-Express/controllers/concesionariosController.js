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
async function listarConcesionarios(request, response) {
    try {
        const sql = "SELECT * FROM concesionarios WHERE activo = true";
        const concesionarios = await query(sql);

        response.status(200).render("listaConcesionarios", {
            titulo: "Concesionarios",
            estilo: "listaConcesionarios.css",
            script: "listaConcesionarios.js",
            concesionarios: concesionarios,
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

// ------------------- LISTAR CONCESIONARIOS API CON FETCH ---------------------
async function listarConcesionariosApi(request, response) {
    try {
        const filtroNombre = (request.query.filtroNombre || "").toLowerCase();
        const filtroCiudad = (request.query.filtroCiudad || "").toLowerCase();
        const filtroDireccion = (request.query.filtroDireccion || "").toLowerCase();

        let sql = "SELECT * FROM concesionarios WHERE activo = true";
        const params = [];

        if (filtroNombre) {
            sql += ` AND nombre LIKE ?`;
            params.push(`%${filtroNombre}%`);
        }

        if (filtroCiudad) {
            sql += ` AND ciudad LIKE ?`;
            params.push(`%${filtroCiudad}%`);
        }

        if (filtroDireccion) {
            sql += ` AND direccion LIKE ?`;
            params.push(`%${filtroDireccion}%`);
        }

        // Traer todos los concesionarios filtrados
        const concesionarios = await query(sql, params);

        response.json(concesionarios);

    } catch (error) {
        console.error(error);
        response.status(500).json({ error: "Error al obtener concesionarios" });
    }
}

function formularioCrearConcesionario(request, response) {
    response.status(200).render("concesionarios", {
        titulo: "Concesionarios",
        estilo: "concesionarios.css",
        script: "concesionarios.js",
        concesionario: "",
        error: ""
    });
}

async function formularioEditarConcesionario(request, response) {
    try {
        let sql = `SELECT * FROM concesionarios WHERE id_concesionario = ? AND activo = true`;
        let params = [request.params.id];

        const concesionario = await query(sql, params);

        if (concesionario.length === 0) {
            return response.status(404).json({ mensaje: "Concesionario no encontrado" });
        }

        response.status(200).render("concesionarios", {
            titulo: "Editar concesionario",
            estilo: "concesionarios.css",
            script: "concesionarios.js",
            concesionario: concesionario[0],
            error: ""
        });
    } catch (error) {
        console.error(error);
        response.status(500).send("Error interno del servidor");
    }
}

async function obtenerConcesionario(request, response) {
    try {
        const sql = `SELECT * FROM concesionarios WHERE id_concesionario = ? and activo = true`;
        const params = [request.params.id];

        const concesionario = await query(sql, params);

        if (concesionario.length === 0) {
            return response.status(404).json({ mensaje: "Concesionario no encontrado" });
        }

        response.status(200).json(concesionario[0]);
    } catch (error) {
        console.error(error);
        response.status(500).json({ error: "Error al obtener concesionario" });
    }
}

async function crearConcesionario(request, response) {
    try {
        const error = validationResult(request);
        if (!error.isEmpty()) {
            return response.status(400).json({ errores: error.array() });
        }

        const {
            nombre, ciudad, direccion, telefono
        } = request.body;

        // Insertamos concesionario
        sql = `
            INSERT INTO concesionarios
            (nombre, ciudad, direccion, telefono_contacto)
            VALUES(?, ?, ?, ?)`;

        params = [
            nombre, ciudad, direccion, telefono
        ];

        const resultado = await query(sql, params);

        response.status(201).json({ mensaje: "Concesionario creado", id: resultado.insertId });

    } catch (error) {
        console.error(error);
        response.status(500).json({ mensaje: "Error creando concesionario" });
    }
}

async function actualizarConcesionario(request, response) {
    try {
        const errores = validationResult(request);

        if (!errores.isEmpty()) {
            return response.status(400).json({ errores: errores.array() });
        }

        const {
            nombre, ciudad, direccion, telefono
        } = request.body;

        sql = `
            UPDATE concesionarios SET
                nombre = ?, ciudad = ?, direccion = ?, telefono_contacto = ?
                WHERE id_concesionario = ? AND activo = true `;

        params = [
            nombre, ciudad, direccion, telefono, request.params.id
        ];

        const resultado = await query(sql, params);

        if (resultado.affectedRows === 0) {
            return response.status(404).json({ mensaje: "Concesionario no encontrado" });
        }

        response.status(200).json({ mensaje: "Concesionario actualizado correctamente" });

    } catch (error) {
        console.error(error);
        response.status(500).json({ mensaje: "Error actualizando concesionario" });
    }
}

async function eliminarConcesionario(request, response) {
    try {
        const sql = `
            UPDATE concesionarios SET
            activo = false
            WHERE id_concesionario = ?`;

        const params = [request.params.id];

        const resultado = await query(sql, params);

        if (resultado.affectedRows === 0) {
            return response.status(404).json({ mensaje: "Concesionario no encontrado" });
        }

        return response.status(200).json({ mensaje: "Concesionario eliminado correctamente" });

    } catch (error) {
        console.error(error);
        response.status(500).json({ mensaje: "Error eliminando concesionario" });
    }
}

module.exports = {
    listarConcesionarios,
    listarConcesionariosApi,
    formularioCrearConcesionario,
    formularioEditarConcesionario,
    obtenerConcesionario,
    crearConcesionario,
    actualizarConcesionario,
    eliminarConcesionario
};