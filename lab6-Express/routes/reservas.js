const express = require("express");
const path = require("path");
const router = express.Router();
const { verificarUsuario } = require("./autenticar");
const reservas = require("./admin");

router.use(function (request, response, next) {
    verificarUsuario(request, response, next);
});

router.get("/", function (request, response) {
    response.status(200);
    response.render("reservas", {
        titulo: "Reservas",
        estilo: "reservas.css",
        script: null
    });
});

router.post("/", function (request, response, next) {
    const nombre = request.body["nombre"];
    const apellido = request.body["apellido"];
    const correo = request.body["correo"];
    const telefono = request.body["telefono"];
    const vehiculo = request.body["lista-vehiculos"];
    const fechaIni = request.body["fecha-ini"];
    const horaIni = request.body["hora-ini"];
    const fechaFin = request.body["fecha-fin"];
    const horaFin = request.body["hora-fin"];
    const duracion = request.body["duracion"];
    const tipo = request.body["tipo"];

    if (!nombre || !apellido || !correo || !telefono || !vehiculo || !fechaIni || !horaIni || !fechaFin || !horaFin || !duracion || !tipo) {
        const error = new Error("Faltan datos en el formulario de reservas");
        error.status = 400;
        return next(error);
    }

    const nuevaReserva = {
        nombre,
        apellido,
        correo,
        telefono,
        vehiculo,
        fechaIni,
        horaIni,
        fechaFin,
        horaFin,
        duracion,
        tipo
    };

    reservas.push(nuevaReserva);
    console.log("RESERVA ALMACENADA CORRECTAMENTE");

    // Enviar una sola respuesta al cliente
    response.send(`
    <h2>Datos recibidos:</h2>
    <p><strong>Nombre:</strong> ${nombre}</p>
    <p><strong>Apellido:</strong> ${apellido}</p>
    <p><strong>Correo:</strong> ${correo}</p>
    <p><strong>Teléfono:</strong> ${telefono}</p>
    <p><strong>Vehículo:</strong> ${vehiculo}</p>
    <p><strong>Fecha Inicio:</strong> ${fechaIni} ${horaIni}</p>
    <p><strong>Fecha Fin:</strong> ${fechaFin} ${horaFin}</p>
    <p><strong>Duración:</strong> ${duracion}</p>
    <p><strong>Tipo:</strong> ${tipo}</p>
  `);
})

module.exports = router;