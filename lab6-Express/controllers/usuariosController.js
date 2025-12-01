const { validationResult } = require("express-validator");
const pool = require("../config/db");
const bcrypt = require("bcrypt");

function query(sql, params = []) {
    return new Promise(function (resolve, reject) {
        pool.query(sql, params, function (error, filas) {
            if (error) reject(error);
            else resolve(filas);
        })
    })
}

async function listarUsuarios(request, response) {
    try {
        const sql = "SELECT * FROM usuarios";
        const usuarios = await query(sql);

        response.status(200).render("listaUsuarios", {
            titulo: "Usuarios",
            estilo: "listaUsuarios.css",
            script: "listaUsuarios.js",
            usuarios: usuarios,
            buscar: "",
            filtro: "",
            error: "",
            mensaje: ""
        })
    } catch (error) {
        console.error(error);
        response.status(500).send("Error interno del servidor");
    }
}

async function listarUsuariosApi(request, response) {
    try {
        const buscar = (request.query.buscar || "").toLowerCase();           // Texto a buscar
        const filtroCampo = request.query.filtroCampo || "";
        const filtroRol = request.query.filtroRol || "";

        let sql = "SELECT * FROM usuarios WHERE true";
        const params = [];

        if (filtroRol) {
            sql += " AND rol = ?";
            params.push(filtroRol);
        }

        if (buscar && filtroCampo && (filtroCampo === "nombre" || filtroCampo === "apellido")) {
            console.log("Filtrando por ", filtroCampo, "y buscando ", buscar);
            sql += ` AND LOWER(${filtroCampo}) LIKE ?`;
            params.push(`%${buscar}%`);
        }

        // Traer todos los usuarios filtrados
        const usuarios = await query(sql, params);

        response.json(usuarios);

    } catch (error) {
        console.error(error);
        response.status(500).json({ error: "Error al obtener usuarios" });
    }
}

//PARA CREAR USUARIOS

function formularioCrearUsuario(request, response) {
    response.status(200).render("layout", {
        titulo: "Registrar usuario",
        estilo: "autenticar.css",
        script: "registrar.js",
        abrirModalRegistrar: true,
        error: null,
        body: ""
    });
}

async function formularioEditarUsuario(request, response) {
    try {
        let sql = `SELECT * FROM usuarios WHERE id_usuario = ?`;
        let params = [request.params.id];

        const usuario = await query(sql, params);

        if (usuario.length === 0) {
            return response.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        response.status(200).render("usuarios", {
            titulo: "Editar usuario",
            estilo: "usuarios.css",
            script: "usuarios.js",
            usuario: usuario[0],
            error: ""
        });
    } catch (error) {
        console.error(error);
        response.status(500).send("Error interno del servidor");
    }
}

async function crearUsuario(request, response) {
    try {
        const err = validationResult(request);

        if (!err.isEmpty()) {
            console.log("Errores de validación:", err.array());
            return response.status(400).json({ errores: err.array() })
        }

        const {
            nombre, apellido, correo, contrasenia,
            telefono, concesionario, preferencias_accesibilidad
        } = request.body;

        // Encriptar contraseña
        const vueltas = 10;
        const contraseniaEncriptada = await bcrypt.hash(contrasenia, vueltas);

        let sql = `SELECT * FROM usuarios WHERE correo = ? AND activo = true`;
        let params = [correo];

        let usuario = await query(sql, params);

        if (usuario.length > 0) {
            return response.status(400).json({ mensaje: "Correo ya está registrado." });
        }

        sql = `
            INSERT INTO usuarios 
            (nombre, apellido, correo, contraseña, rol, 
            telefono, id_concesionario, preferencias_accesibilidad)
            VALUES (?, ?, ?, ?, 'empleado', ?, ?, ?)
        `;

        params = [
            nombre, apellido, correo, contraseniaEncriptada,
            telefono, concesionario, preferencias_accesibilidad
        ]

        const resultado = await query(sql, params);

        response.status(201).json({ mensaje: "Usuario creado correctamente con ID: ", id: resultado.insertId });

    } catch (error) {
        console.error(error);
        response.status(500).json({ mensaje: "Error creando usuario" });
    }
}

async function actualizarUsuario(request, response) {
    try {
        const {
            nombre, apellido, correo, contrasenia, rol,
            telefono, concesionario, preferencias_accesibilidad
        } = request.body;

        const sql = `
            UPDATE usuarios SET
            nombre = ?, ciudad = ?, direccion = ?, rol = ?,
            telefono = ?, id_concesionario = ?, preferencias_accesibilidad
            WHERE id_usuario = ?`;

        const params = [
            nombre, apellido, correo, contrasenia, rol,
            telefono, concesionario, preferencias_accesibilidad, request.params.id
        ];

        const resultado = await query(sql, params);

        if (resultado.affectedRows === 0) {
            return response.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        response.status(200).json({ mensaje: "Usuario actualizado correctamente" });

    } catch (error) {
        console.error(error);
        response.status(500).json({ mensaje: "Error actualizando usuario" });
    }
}

function formularioObtenerUsuario(request, response) {
    response.status(200).render("layout", {
        titulo: "Iniciar sesión",
        estilo: "autenticar.css",
        script: "iniciarSesion.js",
        abrirModalIniciarSesion: true,
        error: null,
        body: ""
    });
}

async function obtenerUsuario(correo, contrasenia) {
    console.log("Acceso al controlador de iniciar sesion");
    const sql = `SELECT * FROM usuarios WHERE correo = ?`;
    const parametro = [correo];

    const usuario = await query(sql, parametro);
    if (usuario.length === 0) {
        console.log("No hay usuario devuelto");
        const error = new Error("Correo o Contraseña incorrecta");
        error.status = 400;
        throw error;
    }

    console.log(usuario[0]);

    const match = await bcrypt.compare(contrasenia, usuario[0].contraseña);
    if (!match) {
        const error = new Error("Correo o Contraseña incorrecta");
        error.status = 400;
        throw error;
    }

    return usuario[0];
}

async function eliminarUsuario(request, response) {
    try {
        const sql = `
            UPDATE usuarios SET
            activo = false
            WHERE id_usuario = ?`;

        const params = [request.params.id];

        const resultado = await query(sql, params);

        if (resultado.affectedRows === 0) {
            return response.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        return response.status(200).json({ mensaje: "Usuario eliminado correctamente" });

    } catch (error) {
        console.error(error);
        response.status(500).json({ mensaje: "Error eliminando usuario" });
    }
}


module.exports = {
    listarUsuarios,
    listarUsuariosApi,
    obtenerUsuario,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
    formularioCrearUsuario,
    formularioEditarUsuario,
    formularioObtenerUsuario
}