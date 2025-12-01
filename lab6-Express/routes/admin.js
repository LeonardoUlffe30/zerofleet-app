const express = require("express");
const path = require("path");
const router = express.Router();
const { verificarUsuario } = require("./autenticar");

// Controller
const reservasController = require("../controllers/reservasController");

const reservas = [
    { id_reserva: '1', nombre: 'Juan', apellido: 'Pérez', correo: 'asdf@gmail.com', telefono: '123456789', fechaIni: '2024-07-01', horaIni: '10:00', fechaFin: '2024-07-01', horaFin: '12:00', duracion: '2 horas', tipo: 'coche' },
    { id_reserva: '2', nombre: 'María', apellido: 'Gómez', correo: 'mariaG@gmail.com', telefono: '987654321', fechaIni: '2024-07-02', horaIni: '14:00', fechaFin: '2024-07-02', horaFin: '16:00', duracion: '2 horas', tipo: 'moto' },
];

router.use(function (request, response, next) {
    verificarUsuario(request, response, next);
});


module.exports = { router, reservas };