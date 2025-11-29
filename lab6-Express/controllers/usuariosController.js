const e = require("express");
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

// PARA LISTAR USUARIOS

async function listarUsuarios(request, response) {
    console.log("Acceso al controlador de listar usuarios");
        response.status(200).render("listausuarios", {
            titulo: "Usuarios",
            estilo: "listavehiculos.css",
            script: "",
        });
}

async function listarUsuariosApi(request, response) {
    console.log("Acceso al controladorAPI de listar usuarios");
    const sql = `SELECT * FROM usuarios`;
    let usuario = await query(sql);
    response.json(usuario);
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

async function crearUsuario(datosRegistro) {
    console.log("Acceso al controlador de crear usuario");
    const { nombre, apellido, correo, contrasenia, rol, telefono, id_concesionario, preferencias_accesibilidad } = datosRegistro;
    const filas = await query("SELECT * FROM usuarios WHERE correo = ?", [correo]);
    if (filas.length > 0) {
        throw new Error("El correo ya está registrado");
    }
    const sql = `
        INSERT INTO usuarios 
        (nombre, apellido, correo, contraseña, rol, telefono, id_concesionario, preferencias_accesibilidad)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const valores = [nombre, apellido, correo, contrasenia, rol, telefono, id_concesionario, preferencias_accesibilidad];
    await query(sql, valores);
}

//PARA ACTUALIZAR EL ROL DEL USUARIO

async function actualizarUsuario(id_usuario, nuevoRol) {
    console.log("Acceso al controlador de actualizar usuario");

    const sql = `
        UPDATE usuarios
        SET rol = ?
        WHERE id_usuario = ?
    `;

    const valores = [nuevoRol, id_usuario];
    await query(sql, valores);
}

//PARA OBTENER USUSARIO

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
    if(usuario.length === 0) {
        console.log("3333333");
       const error = new Error("Correo o Contraseña incorrecta");
       error.status = 400; 
       throw error;
    }


    const match = await bcrypt.compare(contrasenia, usuario[0].contraseña);
    if (!match) {
        const error = new Error("Correo o Contraseña incorrecta");
        error.status = 400; 
        throw error;
    }
    
    return usuario[0];
}

//PARA ELIMINAR USUARIO

function eliminarUsuario(request, response) {
    const sql = `
        UPDATE usuarios SET
        activo = false
        WHERE id_usuario = ?`;

    const params = [request.params.id];

    pool.query(sql, params, function (error) {
        if (error) return response.status(500).sendd("Error eliminando usuario");
        response.redirect("/admin/usuarios");
    })
}


module.exports = {
    listarUsuarios,
    listarUsuariosApi,
    obtenerUsuario,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
    formularioCrearUsuario,
    formularioObtenerUsuario
}