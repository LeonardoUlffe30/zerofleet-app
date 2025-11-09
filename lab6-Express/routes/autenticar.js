const express = require("express");
const path = require("path");
const router = express.Router();
const session = require("express-session");

const usuarios = []

router.get("/registrar", function (request, response) {
    response.status(200);
    response.render("partials/registrar", {
        titulo: "Registrar usuario",
        estilo: "autenticar.css",
        script: "registrar.js",
        abrirModalRegistrar: true
    });
});

router.post("/registrar", function (request, response) {
    const nombre = request.body["nombre"];
    const apellido = request.body["apellido"];
    const correo = request.body["correo"];
    const contrasenia = request.body["contrasenia"];
    const telefono = request.body["telefono"];

    const nuevoUsuario = {
        nombre, apellido, correo, contrasenia, telefono
    };

    usuarios.push(nuevoUsuario);
    console.log("USUARIO REGISTRADO CORRECTAMENTE");
    response.send(`
        <h2>Usuario registrado correctamente:</h2>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Apellido:</strong> ${apellido}</p>
        <p><strong>Correo:</strong> ${correo}</p>
        <p><strong>Teléfono:</strong> ${telefono}</p>
    `);
})

const middlewareSesion = session({
    saveUninitialized: false,
    secret: "foobar34",
    resave: false
});

router.get("/iniciarSesion", function (request, response) {
    response.status(200);
    response.render("partials/iniciarSesion", {
        titulo: "Iniciar sesión",
        estilo: "autenticar.css",
        script: "iniciarSesion.js",
        abrirModalIniciarSesion: true
    });
    /*
    console.log(request.session.correo);
    response.end();*/
});

function verificarUsuario(request, response, next) {
    if (request.session && request.session.correo) {
        return next();
    } else {
        const error = new Error("Usuario no se ha registrado o iniciado sesión");
        error.status = 401;
        return next(error);
    }
}

module.exports = {
    router, verificarUsuario
}
