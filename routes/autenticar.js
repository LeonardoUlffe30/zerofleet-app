const express = require("express");
const path = require("path");
const router = express.Router();
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const { check, validationResult } = require("express-validator");
const usuariosController = require("../controllers/usuariosController");

const usuarios = [{ nombre: "qwerty", apellido: "qwerty", correo: "qwerty@zfleet.com", contrasenia: "12345", telefono: "555-555-555", tipo: "usuario" },
{ nombre: "admin", apellido: "qwerty", correo: "adminMemoria@zfleer.com", contrasenia: "12345", telefono: "555-555-555", tipo: "admin" }
];

// Registrar usuario
router.get("/registrar", usuariosController.formularioCrearUsuario);

router.post("/registrar",
    [
        check("nombre", "El nombre debe tener mínimo 3 carácteres").isLength({ min: 3 }),
        check("apellido", "El apellido debe tener mínimo 3 carácteres").isLength({ min: 3 }),
        check("correo", "El correo debe ser uno válido: xxx@zfleet.com").matches(/^[a-zA-Z0-9._%+-]+@zfleet\.com$/),
        check("contrasenia", "La contraseña debe contener al menos 8 caracteres, 1 mayúscula, 1 minúscula, 1 número, 1 caracter especial")
            .isLength({ min: 8 }).matches(/[A-Z]/).matches(/[a-z]/).matches(/\d/).matches(/[!@#$%^&*(),.?":{}|<>]/),
        check("telefono", "El teléfono debe tener  9 números").optional({ checkFalsy: true }).isLength({ min: 9, max: 9 }).isNumeric(),
        check("repetirContrasenia")
            .custom((value, { req }) => {
                if (value !== req.body.contrasenia) {
                    throw new Error('Las contraseñas no coinciden');
                }
                return true;
            })
    ],
    usuariosController.crearUsuario
);

//INICIAR SESION

router.get("/iniciarSesion", usuariosController.formularioObtenerUsuario);

router.post("/iniciarSesion",
    check("correo", "El correo debe ser uno válido: xxx@zfleet.com").matches(/^[a-zA-Z0-9._%+-]+@zfleet\.com$/),
    async function (request, response) {

        const err = validationResult(request);
        if (!err.isEmpty()) {
            console.log("Errores de validacion:", err.array());
            return response.status(400).json({ errores: err.array() });
        }
        try {
            console.log(request.body.contrasenia);
            const usuario = await usuariosController.obtenerUsuario(request.body.correo, request.body.contrasenia);
            request.session.usuario = usuario;
            if (request.body.recordar) {
                request.session.cookie.maxAge = 24 * 60 * 60 * 1000;
            } else {
                request.session.cookie.expires = false;
            }

            return response.status(201).json({});
        } catch (err) {
            console.log("Error del backend");
            if (err.status === 400) {
                return response.status(400).json({ errores: [{ msg: err.message }] });
            } else {
                return response.status(500).json({ error: err.message });
            }
        }
    })

module.exports = {
    autenticarRouter: router
}
