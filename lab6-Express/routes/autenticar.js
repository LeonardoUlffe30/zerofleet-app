const express = require("express");
const path = require("path");
const router = express.Router();
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const { check, validationResult } = require("express-validator");

const usuarios = [{ nombre: "qwerty", apellido: "qwerty", correo: "qwerty@gmail.com", contrasenia: "12345", telefono: "555-555-555", tipo: "usuario" },
                  { nombre: "admin", apellido: "qwerty", correo: "admin@gmail.com", contrasenia: "12345", telefono: "555-555-555", tipo: "admin" }
];

//REGISTRAR USUARIO

router.get("/registrar", function (request, response) {
    response.status(200);
    response.render("layout", {
        titulo: "Registrar usuario",
        estilo: "autenticar.css",
        script: "registrar.js",
        abrirModalRegistrar: true,
        error: null,
        body: ""
    });
});

router.post("/registrar", 
    check("nombre", "El nombre debe tener mínimo 3 carácteres").isLength({min: 3}),
    check("apellido", "El apellido debe tener mínimo 3 carácteres").isLength({min: 3}),
    check("correo", "El correo debe ser uno váido: xxx@zfleet.com").matches(/^[a-zA-Z0-9._%+-]+@zfleet\.com$/),
    check("contrasenia", "La contraseña debe contener al menos 8 caracteres, 1 mayúscula, 1 minúscula, 1 número, 1 caracter especial")
    .isLength({min: 8}).matches(/[A-Z]/).matches(/[a-z]/).matches(/\d/).matches(/[!@#$%^&*(),.?":{}|<>]/),
    check("telefono", "El teléfono debe tener  9 números").optional({checkFalsy: true}).isLength({min: 9, max: 9}).isNumeric(),
    check("repetir-contrasenia")
        .custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Las contraseñas no coinciden');
        }
        return true;
        }),
    function (request, response) {

        const err = validationResult(request);
        if (!err.isEmpty()) {
            console.log("Errores de validación:", err.array());
            return response.status(400).json({ errores: err.array()})
        }

    
    const nombre = request.body["nombre"];
    const apellido = request.body["apellido"];
    const correo = request.body["correo"];
    const contrasenia = request.body["contrasenia"];
    const telefono = request.body["telefono"] || null;

    const existe = usuarios.find(u => u.correo === request.body.correo);
    if (existe) {
        return response.status(400).json({ error: "El correo ya está registrado"});
    }

    const vueltas = 10;
    const contraEncript = bcrypt.hash(contrasenia, vueltas);

    const nuevoUsuario = {
        nombre, apellido, correo, contrasenia: contraEncript, telefono, rol: "empleado"
    };

    usuarios.push(nuevoUsuario);
    console.log("USUARIO REGISTRADO CORRECTAMENTE");
    console.log(nuevoUsuario);

    return response.status(201).json({ mensaje: "Usuario registrado correctamente"});
});

//INICIAR SESION

router.get("/iniciarSesion", function (request, response) {
    response.status(200);
    response.render("layout", {
        titulo: "Iniciar sesión",
        estilo: "autenticar.css",
        script: "iniciarSesion.js",
        abrirModalIniciarSesion: true,
        error: null,
        body: ""
    });
});

// INICIAR SESION

router.post("/iniciarSesion", function (request, response) {
    const contrasenia = request.body["contrasenia"];
    const recordar = request.body["recordar"];
    const u = usuarios.find(u => u.correo === request.body.correo);
    //Esto hay q hacerlo con middleware
    if (u) {
        const matchContra = bcrypt.compare(u.contrasenia, contrasenia);
        if (matchContra) {
            request.session.usuario = u;
            if (recordar) {
                request.session.cookie.maxAge = 24 * 60 * 60 * 1000;
            } else {
                request.session.cookie.expires = false;
            }
            return response.redirect("/");
        }
    }

    response.render("partials/iniciarSesion", {
        titulo: "Iniciar sesión",
        estilo: "autenticar.css",
        script: "iniciarSesion.js",
        abrirModalIniciarSesion: true,
        error: "Correo o contraseña incorrectos"
    });
})

function verificarUsuario(request, response, next) {
    if (request.session && request.session.usuario) {
        return next();
    } else {
        return response.render("index", {
            titulo: "Gestión de Flota de Vehículos Eléctricos",
            estilo: "index.css",
            script: "",
            error: "Usuario no se ha registrado o iniciado sesión"
        })
    }
}

function verificarAdmin(request, response, next) {
    if (request.session && request.session.usuario && request.session.usuario.tipo === "admin") {
        return next();
    } else {
        return response.render("index", {
            titulo: "Gestión de Flota de Vehículos Eléctricos",
            estilo: "index.css",
            script: "",
            error: "Acceso denegado, se necesitan permisos de administrador"
        })
    }
}

module.exports = {
    autenticarRouter: router, verificarUsuario, verificarAdmin
}
