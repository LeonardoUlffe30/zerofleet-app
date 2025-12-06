const express = require("express");
const path = require("path");
const router = express.Router();
const usuariosController = require("../controllers/usuariosController");

// Obtener preferencias de sesión
router.get("/obtener-preferencias", usuariosController.obtenerPreferencias);

// Guardar preferencias
router.post("/guardar-preferencias", usuariosController.actualizarPreferencias);

module.exports = router;