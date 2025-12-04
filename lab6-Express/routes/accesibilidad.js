const express = require("express");
const path = require("path");
const router = express.Router();

// Obtener preferencias de sesión
router.get("/obtener-preferencias", function (request, response) {
    response.json(request.session.preferencias || {})
});

// Guardar preferencias
router.post("/guardar-preferencias", function (request, response) {
    const {clave, valor} = request.body;
    if(!request.session.preferencias) {
        request.session.preferencias = {};
    }
    request.session.preferencias[clave] = valor;
    response.json({ok: true});
})



module.exports = router;