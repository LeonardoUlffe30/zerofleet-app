const express = require("express");
const path = require("path");
const router = express.Router();
const { verificarUsuario } = require("../middleware/autenticacion");
const {reservas} = require("./admin");
const { check, validationResult } = require("express-validator");


router.use(verificarUsuario);

// ----------------- DE RESERVAS ------------------

router.get("/", function (request, response) {
    response.status(200);
    response.render("reservas", {
        titulo: "Reservas",
        estilo: "reservas.css",
        script: "reservas.js"
    });
});

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

// ----------------- DE LISTAR RESERVAS ------------------
router.get("/api/reservas", function (request, response){
    response.json(reservas);
})

router.delete("/api/reservas/:id", function (request, response) {
    console.log(request.params)
    try{
        const index = reservas.findIndex(r => r.id_reserva === request.params.id)
        if (index !== -1) {
            vehiculos.splice(index, 1);
            response.status(200).json({mensaje: "Reserva eliminado correctamente"});
        } else {
            response.status(404).json({ error: "Reserva no encontrado" });
        }
    }catch (err){
        console.error("Error en DELETE:", err);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
});
module.exports = router;