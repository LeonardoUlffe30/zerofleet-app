const express = require("express");
const path = require("path");
const router = express.Router();
const { verificarUsuario } = require("../middleware/autenticacion");
const {reservas} = require("./admin");
const { check, validationResult } = require("express-validator");
const reservasController = require("../controllers/reservasController");


router.use(verificarUsuario);

// ----------------- DE RESERVAS ------------------

router.get("/", reservasController.formulariocrearReserva);

router.post("/",[
    check("nombre", "El nombre debe tener mínimo 3 carácteres").isLength({min: 3}),
    check("apellido", "El apellido debe tener mínimo 3 carácteres").isLength({min: 3}),
    check("telefono", "El teléfono debe tener  9 números").isLength({min: 9, max: 9}).isNumeric(),
    check("correo", "El correo debe ser uno váido: xxx@zfleet.com").matches(/^[a-zA-Z0-9._%+-]+@zfleet\.com$/),
    check("tipo", "El campo tipo es obligatorio").notEmpty(),
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
    })],
    reservasController.crearReserva
);

// ----------------- DE LISTAR RESERVAS ------------------
router.get("/listareservas", reservasController.listarReservas);

router.get("/api/listareservas", reservasController.listarReservasApi)

router.put("editar/:id", reservasController.actualizarReserva);

router.get("/listareservas/:id", reservasController.obtenerReservasPorUsuario);

module.exports = router;