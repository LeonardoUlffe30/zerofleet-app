const express = require("express");
const path = require("path");
const router = express.Router();
const { verificarUsuario } = require("./autenticar");
const {reservas} = require("./admin");
const { check, validationResult } = require("express-validator");

router.use(function (request, response, next) {
    verificarUsuario(request, response, next);
});

router.get("/", function (request, response) {
    response.status(200);
    response.render("reservas", {
        titulo: "Reservas",
        estilo: "reservas.css",
        script: "reservas.js"
    });
});

router.get("/api/reservas", function (request, response){
    response.json(reservas);
})

router.post("/api/reservas",
    check("nombre", "El nombre debe tener mínimo 3 carácteres").isLength({min: 3}),
    check("apellido", "El apellido debe tener mínimo 3 carácteres").isLength({min: 3}),
    check("telefono", "El teléfono debe tener  9 números").isLength({min: 9, max: 9}).isNumeric(),
    check("correo", "El correo debe ser uno váido").isEmail(),
    check("tipo", "El campo tipo es obligatorio").notEmpty().isIn(['coche', 'moto', 'patinete electrico']),
    check("fechaIni").custom((fechaIni) =>{
        const fechaIngresada = new Date(fechaIni);
        const ahora = new Date();
        if(ahora < fechaIngresada){
            throw new Error("La fecha de inicio debe ser posterior a la fecha actual");
        }
        return true;
    }),
    check("fechaFin").custom((fechaFin, {req}) =>{
        const fechaIni = new Date(req.body.fechaIni);
        const fechaIngresada = new Date(fechaFin);
        if(fechaIni >= fechaIngresada){
            throw new Error("La fecha de fin debe ser posterior a la fecha de inicio");
        }
        return true;
    }),
    function (request, response, next) {
    
    const errores = validationResult(request);
    if (!errores.isEmpty()) {
        console.log("Errores de validación:", errores.array());
        return response.status(400).json({ errores: errores.array()})
    }

    const { nombre, apellido, correo, telefono, tipo, fechaIni, horaIni, fechaFin, horaFin, duracion } = request.body;
    
    if (!nombre || !apellido || !correo || !telefono || !fechaIni || !horaIni || !fechaFin || !horaFin || !duracion || !tipo) {
        const error = new Error("Faltan datos en el formulario de reservas");
        error.status = 400;
        return next(error);
    }

    const nuevaReserva = {
        nombre,
        apellido,
        correo,
        telefono,
        fechaIni,
        horaIni,
        fechaFin,
        horaFin,
        duracion,
        tipo
    };

    reservas.push(nuevaReserva);
    console.log("RESERVA ALMACENADA CORRECTAMENTE");
    console.log(nuevaReserva);

    response.status(201).json(nuevaReserva);   

})

module.exports = router;