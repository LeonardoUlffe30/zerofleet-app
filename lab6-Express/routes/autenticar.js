const express = require("express");
const path = require("path");
const router = express.Router();

const usuarios = [{nombre: "qwerty", apellido: "qwerty", correo:"qwerty@gmail.com", contrasenia: "12345", telefono: "555-555-555"}];

router.get("/registrar", function (request, response) {
    response.status(200);
    response.render("partials/registrar", {
        titulo: "Registrar usuario",
        estilo: "autenticar.css",
        script: "registrar.js",
        abrirModalRegistrar: true,
        error: null
    });
});

router.post("/registrar", function (request, response) {
    const nombre = request.body["nombre"];
    const apellido = request.body["apellido"];
    const correo = request.body["correo"];
    const contrasenia = request.body["contrasenia"];
    const telefono = request.body["telefono"];

    if(!nombre || !apellido || !correo || !contrasenia || !telefono){
         return response.render("partials/registrar", {
            titulo: "Registrar usuario",
            estilo: "autenticar.css",
            script: "registrar.js",
            abrirModalRegistrar: true,
            error: "Faltan datos en el formulario de registro"
         });
    }

    const existe = usuarios.find(u => u.correo === request.body.correo);
    if(existe){
         return response.render("partials/registrar", {
            titulo: "Registrar usuario",
            estilo: "autenticar.css",
            script: "registrar.js",
            abrirModalRegistrar: true,
            error: "El correo ya está registrado"
         });
    }

    const nuevoUsuario = {
        nombre, apellido, correo, contrasenia, telefono
    };

    usuarios.push(nuevoUsuario);
    
    console.log("USUARIO REGISTRADO CORRECTAMENTE");
    console.log(request.body);

    response.redirect("/");
})

router.get("/iniciarSesion", function (request, response) {
    response.status(200);
    response.render("partials/iniciarSesion", {
        titulo: "Iniciar sesión",
        estilo: "autenticar.css",
        script: "iniciarSesion.js",
        abrirModalIniciarSesion: true,
        error: null
    });
});

router.post("/iniciarSesion", function (request, response){
    const u = usuarios.find(u => u.correo === request.body.correo && u.contrasenia === request.body.contrasenia);
    if(u){
        request.session.usuario = u;
        response.redirect("/");
    }
    else{
        response.render("partials/iniciarSesion",{
        titulo: "Iniciar sesión",
            estilo: "autenticar.css",
            script: "iniciarSesion.js",
            abrirModalIniciarSesion: true,
            error: "Correo o contraseña incorrectos"
        });
    }
})

function verificarUsuario(request, response, next) {
    if (request.session && request.session.usuario) {
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
