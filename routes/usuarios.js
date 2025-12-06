const express = require("express");
const path = require("path");
const router = express.Router();
const { verificarAdmin } = require("../middleware/autenticacion");

const usuariosController = require("../controllers/usuariosController");

router.use(verificarAdmin);

router.get("/", usuariosController.listarUsuarios);

router.get("/api/usuarios", usuariosController.listarUsuariosApi);

router.get("/:id/editar", usuariosController.formularioEditarUsuario);

router.post("/:id/editar", usuariosController.actualizarUsuario);

router.delete("/api/usuarios/:id", usuariosController.eliminarUsuario);

module.exports = router;
