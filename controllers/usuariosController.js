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

function listarUsuarios(request, response) {
    const sql = "SELECT * FROM usuarios";

    query(sql)
    .then(usuarios => {
        response.status(200).render("listaUsuarios", {
            titulo: "Usuarios",
            estilo: "listaUsuarios.css",
            script: "listaUsuarios.js",
            usuarios: usuarios,
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

function listarUsuariosApi(request, response) {
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
        console.log("Filtrando por", filtroCampo, "y buscando", buscar);
        sql += ` AND LOWER(${filtroCampo}) LIKE ?`;
        params.push(`%${buscar}%`);
    }

    query(sql, params)
    .then(usuarios => {
        response.json(usuarios);
    })
    .catch(error => {
        console.error(error);
        response.status(500).json({ error: "Error al obtener usuarios" });
    });
}

//PARA CREAR USUARIOS

function formularioCrearUsuario(request, response) {
    console.log("Acceso al controlador de crear formulario de usuario")
    const sql = `SELECT id_concesionario FROM concesionarios`;
    query(sql)
    .then(concesionarios => {
        response.status(200).render("layout", {
            titulo: "Registrar usuario",
            estilo: "autenticar.css",
            script: "registrar.js",
            abrirModalRegistrar: true,
            error: null,
            body: "",
            concesionarios: concesionarios
        });
    })
    .catch (err => {
        console.error("Error cargando concesionarios:", err.message);
        response.status(500).send("Error interno cargando concesionarios");
    })
}

function crearUsuario(request, response) {
    console.log("Acceso al controlador de crear usuario");
    const err = validationResult(request);

    if (!err.isEmpty()) {
        console.log("Errores de validación:", err.array());
        throw { tipo: "VALIDACION", errores: err.array() };
    }

    const { nombre, apellido, correo, contrasenia, telefono, concesionario } = request.body;

    const vueltas = 10;

    // Encriptar contraseña
    bcrypt.hash(contrasenia, vueltas)
    .then(contraseniaEncriptada => {
        // Verificar si el usuario ya existe
        const sql = `SELECT * FROM usuarios WHERE correo = ? AND activo = true`;
        const params = [correo];

        return query(sql, params)
            .then(usuario => ({ usuario, contraseniaEncriptada }));
    })
    .then(({ usuario, contraseniaEncriptada }) => {
        if (usuario.length > 0) {
            throw { tipo: "NO_ENCONTRADO", mensaje: "Correo ya registrado" };
        }

        const sql = `
            INSERT INTO usuarios 
            (nombre, apellido, correo, contraseña, rol, telefono, id_concesionario)
            VALUES (?, ?, ?, ?, 'empleado', ?, ?)
        `;

        const params = [nombre, apellido, correo, contraseniaEncriptada, telefono, concesionario];

        return query(sql, params);
    })
    .then( () => {
        response.status(201).json({ mensaje: "Usuario creado correctamente"});
    })
    .catch(err => {
        if (err.tipo === "VALIDACION") {
            return response.status(400).json({ errores: err.errores });
        } else if (err.tipo === "NO_ENCONTRADO") {
            return response.status(404).json({ mensaje: err.mensaje });
        } else {
            console.error(err);
            return response.status(500).json({ mensaje: "Error creando reserva" });
        }
    });
}

function formularioEditarUsuario(request, response) {
    console.log("Acceso al controlador de formulaio de editar usuario");
    let sqlUsuario = `SELECT * FROM usuarios WHERE id_usuario = ?`;
    let params = [request.params.id];

    let sqlConcesionarios = `SELECT * FROM concesionarios`;

    // Obtener usuario
    query(sqlUsuario, params)
    .then(usuario => {
        if (usuario.length === 0) {
            throw { status: 404, mensaje: "Usuario no encontrado" };
        }
        // Obtener concesionarios
        return query(sqlConcesionarios)
            .then(concesionarios => {
                response.status(200).render("usuarios", {
                    titulo: "Editar usuario",
                    estilo: "usuarios.css",
                    script: "usuarios.js",
                    usuario: usuario[0],
                    error: "",
                    concesionarios: concesionarios  
                });
            });
    })
    .catch(error => {
        if (error.status && error.mensaje) {
            response.status(error.status).json({ mensaje: error.mensaje });
        } else {
            console.error(error);
            response.status(500).json({ error: "Error interno del servidor" });
        }
    });
}

function actualizarUsuario(request, response) {
    console.log("Acceso al controlador de editar usuario");
    const errores = validationResult(request);

    if (!errores.isEmpty()) {
        console.log("Errores de validación:", errores.array());
        return response.status(400).json({ errores: errores.array() });
    }

    const { nombre, apellido, correo, contrasenia, rol, telefono, concesionario, preferencias_accesibilidad } = request.body;

    const sql = `UPDATE usuarios SET nombre = ?, apellido = ?, correo = ?, contraseña = ?, rol = ?,telefono = ?, id_concesionario = ?, preferencias_accesibilidad = ? 
    WHERE id_usuario = ?`;
    const params = [ nombre, apellido, correo, contrasenia, rol, telefono, concesionario, preferencias_accesibilidad, request.params.id];

    query(sql, params)
    .then(resultado => {
        if (resultado.affectedRows === 0) {
            return response.status(404).json({ mensaje: "Usuario no encontrado" });
        } 
        response.status(200).json({ mensaje: "Usuario actualizado correctamente" });
    })
    .catch(error => {
        console.error(error);
        response.status(500).json({ mensaje: "Correo existente" });
    });
}

function actualizarPreferencias(request, response) {
    const preferencias = request.body;

    if (!request.session.usuario) {
        return response.status(401).json({ mensaje: "Usuario no autenticado" });
    }

    const sql = `
        UPDATE usuarios 
        SET preferencias_accesibilidad = ?
        WHERE id_usuario = ?`;
    const params = [JSON.stringify(preferencias), request.session.usuario.id_usuario];

    query(sql, params)
    .then(resultado => {
        if (resultado.affectedRows === 0) {
            return response.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        // Actualizamos la sesión
        request.session.usuario.preferencias_accesibilidad = JSON.stringify(preferencias);

        response.status(200).json({ mensaje: "Preferencias guardadas correctamente" });
    })
    .catch(error => {
        console.error(error);
        response.status(500).json({ mensaje: "Error guardando preferencias" });
    });
}

function obtenerPreferencias(request, response) {
    // Si está autenticado
    if (request.session.usuario) {
        const sql = `SELECT preferencias_accesibilidad FROM usuarios WHERE id_usuario = ?`;
        const params = [request.session.usuario.id_usuario];

        query(sql, params)
            .then(result => {
                const preferencias = result[0]?.preferencias_accesibilidad;
                response.json(preferencias || {});
            })
            .catch(error => {
                console.error("Error obteniendo preferencias:", error);
                response.status(500).json({ error: "Error obteniendo preferencias" });
            });
    } else {
        // Si no está autenticado, devolver preferencias vacías
        response.json({});
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

function obtenerUsuario(request, response) {
    console.log("Acceso al controlador de iniciar sesión");

    const err = validationResult(request);
    if (!err.isEmpty()) {
        console.log("Errores de validacion:", err.array());
        return response.status(400).json({ errores: err.array() });
    }

    const { correo, contrasenia, recordar } = request.body;

    const sql = `SELECT * FROM usuarios WHERE correo = ?`;
    const parametro = [correo];

    query(sql, parametro)
    .then(usuario => {
        if (usuario.length === 0) {
            throw {status: 400, mensaje: "Correo o Contraseña incorrecta"}
        }
        // Comparamos la contraseña
        return bcrypt.compare(contrasenia, usuario[0].contraseña)
            .then(match => ({ usuario: usuario[0], match }));
    })
    .then(({ usuario, match }) => {
        if (!match) {
            throw {status: 400, mensaje: "Correo o Contraseña incorrecta"}
        }

        request.session.usuario = usuario;

        if (recordar) {
            request.session.cookie.maxAge = 24 * 60 * 60 * 1000;
        } else {
            request.session.cookie.expires = false;
        }

        response.status(201).json({});
    })
    .catch(err => {
        if (err.status === 400) {
            console.log(err.mensaje);
            response.status(400).json({ mensaje: err.mensaje });
        } else {
            response.status(500).json({ error: err.message });
        }
    });
}

function eliminarUsuario(request, response) {
    const sql = `
        UPDATE usuarios SET
        activo = false
        WHERE id_usuario = ?`;

    const params = [request.params.id];

    query(sql, params)
    .then(resultado => {
        if (resultado.affectedRows === 0) {
            return response.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        response.status(200).json({ mensaje: "Usuario eliminado correctamente" });
    })
    .catch(error => {
        console.error(error);
        response.status(500).json({ mensaje: "Error eliminando usuario" });
    });
}



module.exports = {
    listarUsuarios,
    listarUsuariosApi,
    obtenerUsuario,
    crearUsuario,
    actualizarUsuario,
    actualizarPreferencias,
    obtenerPreferencias,
    eliminarUsuario,
    formularioCrearUsuario,
    formularioEditarUsuario,
    formularioObtenerUsuario
}