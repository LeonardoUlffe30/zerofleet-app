const express = require("express");
const path = require("path");
const router = express.Router();
const { verificarUsuario } = require("../middleware/autenticacion");
const { reservas } = require("./accesibilidad");
const { check, validationResult } = require("express-validator");
const reservasController = require("../controllers/reservasController");


router.use(verificarUsuario);

// ----------------- DE RESERVAS ------------------

router.get("/nuevo", reservasController.formulariocrearReserva);

router.post("/nuevo", [
    check("nombreCliente", "El nombre debe tener mínimo 3 carácteres").isLength({ min: 3 }),
    check("apellidoCliente", "El apellido debe tener mínimo 3 carácteres").isLength({ min: 3 }),
    check("telefonoCliente", "El teléfono debe tener  9 números").isLength({ min: 9, max: 9 }).isNumeric(),
    check("correoCliente", "El correo debe ser uno váido: xxx@zfleet.com").matches(/^[a-zA-Z0-9._%+-]+@zfleet\.com$/),
    check("vehiculo", "El campo vehiculo es obligatorio").notEmpty(),
    check("fechaHoraIni").custom((fechaHoraIni, { req }) => {
        const inicio = new Date(req.body.fechaHoraIni);
        const ahora = new Date();
        if (inicio.getTime() < ahora.getTime()) {
            throw new Error("La fecha de inicio debe ser posterior a la fecha actual");
        }
        return true;
    }),
    check("fechaHoraFin").custom((fechaHoraFin, { req }) => {
        const inicio = new Date(req.body.fechaHoraIni);
        const fin = new Date(req.body.fechaHoraFin);
        if (inicio.getTime() >= fin.getTime()) {
            throw new Error("La fecha de fin debe ser posterior a la fecha de inicio");
        }
        return true;
    })],
    reservasController.crearReserva
);

// ----------------- DE LISTAR RESERVAS ------------------
router.get("/mis-reservas", reservasController.listarReservas);

//router.get("/api/mis-reservas", reservasController.listarReservasApi)

router.put("editar/:id", reservasController.actualizarReserva);

router.get("/mis-reservas/:id", reservasController.obtenerReservasPorUsuario);

module.exports = router;