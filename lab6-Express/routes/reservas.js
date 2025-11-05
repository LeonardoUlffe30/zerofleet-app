const express = require("express");
const path = require("path");
const router = express.Router();

const reservas = [
    { nombre: 'Juan', apellido: 'Pérez', correo: 'asdf@gmail.com', telefono: '123456789', fechaIni: '2024-07-01', horaIni: '10:00', fechaFin: '2024-07-01', horaFin: '12:00', duracion: '2 horas', tipo: 'coche' },
    { nombre: 'María', apellido: 'Gómez', correo: 'mariaG@gmail.com', telefono: '987654321', fechaIni: '2024-07-02', horaIni: '14:00', fechaFin: '2024-07-02', horaFin: '16:00', duracion: '2 horas', tipo: 'moto' },
];



router.get("/", function (request, response) {
    response.sendFile(path.join(__dirname, "..", "public", "reservas.html"))
});

router.post("/", function (request, response) {
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
        return response.status(400).send()
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


router.get("/listareservas", function (request, response) {
    response.status(200);
    response.render("listareservas", { reservas: reservas });
});

module.exports = router;