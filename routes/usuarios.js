const express = require("express");
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { verificarAdmin } = require("../middleware/autenticacion");

const usuariosController = require("../controllers/usuariosController");

router.use(verificarAdmin);

router.get("/", usuariosController.listarUsuarios);

router.get("/api/usuarios", usuariosController.listarUsuariosApi);

router.get("/:id/editar", usuariosController.formularioEditarUsuario);

router.post("/:id/editar", [
        check("nombre", "El nombre debe tener mínimo 3 carácteres").isLength({ min: 3 }),
        check("apellido", "El apellido debe tener mínimo 3 carácteres").isLength({ min: 3 }),
        check("correo", "El correo debe ser uno válido: xxx@zfleet.com").matches(/^[a-zA-Z0-9._%+-]+@zfleet\.com$/),
        check("telefono", "El teléfono debe tener  9 números").optional({ checkFalsy: true }).isLength({ min: 9, max: 9 }).isNumeric()],
    usuariosController.actualizarUsuario);

router.delete("/api/usuarios/:id", usuariosController.eliminarUsuario);

module.exports = router;
