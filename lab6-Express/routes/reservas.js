const express = require("express");
const path = require("path");
const router = express.Router();
const { verificarUsuario } = require("./autenticar");
const {reservas} = require("./admin");

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

router.post("/api/reservas", function (request, response, next) {
    const { nombre, apellido, correo, telefono, tipo, fechaIni, horaIni, fechaFin, horaFin, duracion } = request.body;
    console.log(request.body);
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