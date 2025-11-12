const express = require("express");
const path = require("path");
const router = express.Router();
const {verificarAdmin } = require("./autenticar");

const reservas = [
    { nombre: 'Juan', apellido: 'Pérez', correo: 'asdf@gmail.com', telefono: '123456789', fechaIni: '2024-07-01', horaIni: '10:00', fechaFin: '2024-07-01', horaFin: '12:00', duracion: '2 horas', tipo: 'coche' },
    { nombre: 'María', apellido: 'Gómez', correo: 'mariaG@gmail.com', telefono: '987654321', fechaIni: '2024-07-02', horaIni: '14:00', fechaFin: '2024-07-02', horaFin: '16:00', duracion: '2 horas', tipo: 'moto' },
];

router.use(function (request, response, next) {
    verificarAdmin(request, response, next);
});

router.get("/listareservas", function (request, response) {
    response.status(200);
    response.render("listareservas", { 
        titulo: "Lista de reservas",
        estilo: null,
        script: "",
        reservas: reservas
     });
});

module.exports = router;