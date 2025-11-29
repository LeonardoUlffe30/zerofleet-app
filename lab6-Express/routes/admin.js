const express = require("express");
const path = require("path");
const router = express.Router();
const {verificarUsuario, verificarAdmin } = require("./autenticar");

// Controller
const reservasController = require("../controllers/reservasController");
const usuariosController = require("../controllers/usuariosController");

const reservas = [
    { id_reserva: '1', nombre: 'Juan', apellido: 'Pérez', correo: 'asdf@gmail.com', telefono: '123456789', fechaIni: '2024-07-01', horaIni: '10:00', fechaFin: '2024-07-01', horaFin: '12:00', duracion: '2 horas', tipo: 'coche' },
    { id_reserva: '2', nombre: 'María', apellido: 'Gómez', correo: 'mariaG@gmail.com', telefono: '987654321', fechaIni: '2024-07-02', horaIni: '14:00', fechaFin: '2024-07-02', horaFin: '16:00', duracion: '2 horas', tipo: 'moto' },
];

router.use(function (request, response, next) {
    verificarUsuario(request, response, next);
});

// ----------------- DE LISTAR RESERVAS ------------------

router.get("/listareservas", reservasController.listarReservas);
/*
{
    /*
    response.status(200);
    response.render("listareservas", { 
        titulo: "Lista de reservas",
        estilo: null,
        script: "",
        reservas: reservas
     });
}*/

router.get("/api/reservas", function (request, response){
    response.json(reservas);
})

router.delete("/api/reservas/:id", function (request, response) {
    console.log(request.params.id);
    try{
        const index = reservas.findIndex(r => r.id_reserva === request.params.id)
        if (index !== -1) {
            reservas.splice(index, 1);
            response.status(200).json({mensaje: "Reserva eliminado correctamente"});
        } else {
            response.status(404).json({ error: "Reserva no encontrado" });
        }
    }catch (err){
        console.error("Error en DELETE:", err);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
});

router.use(function (request, response, next) {
    verificarAdmin(request, response, next);
});

router.get("/listarusuarios", function (request, response){
    console.log("Acceso al backend");
    usuariosController.listarUsuarios(request, response);
});

router.get("/api/listarusuarios", usuariosController.listarUsuariosApi);


module.exports = {router, reservas};