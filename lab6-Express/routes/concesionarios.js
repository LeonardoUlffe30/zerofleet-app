const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

// Middlewares de autenticacion
const { verificarUsuario, verificarAdmin } = require("./autenticar");

// Controller
const concesionariosController = require("../controllers/concesionariosController");

// ----------------- MIDDLEWARES DE SEGURIDAD ------------------

// Todo lo que está debajo requiere usuario
router.use(verificarUsuario);

// Todo lo que esta debajo requiere admin
router.use(verificarAdmin);

// ----------------- RUTAS ADMIN ------------------

router.get("/", concesionariosController.listarConcesionarios);

router.get("/api/concesionarios", concesionariosController.listarConcesionariosApi);

// Formulario crear nuevo concesionario - GET
router.get("/nuevo", concesionariosController.formularioCrearConcesionario);

// Formulario crear nuevo concesionario - POST
router.post(
    "/nuevo",
    [
        check("nombre").notEmpty().withMessage("El nombre es obligatorio"),
        check("ciudad").notEmpty().withMessage("La ciudad es obligatoria"),
        check("direccion").notEmpty().withMessage("La dirección es obligatoria"),
        check("telefono").isNumeric().withMessage("Telefono inválido")
    ],
    concesionariosController.crearConcesionario
);

router.get("/:id", concesionariosController.obtenerConcesionario);

router.get("/:id/editar", concesionariosController.formularioEditarConcesionario);

router.post("/:id/editar",
    [
        check("nombre").notEmpty().withMessage("El nombre es obligatorio"),
        check("ciudad").notEmpty().withMessage("La ciudad es obligatoria"),
        check("direccion").notEmpty().withMessage("La dirección es obligatoria"),
        check("telefono").matches(/^\d{9}$/).withMessage("Telefono inválido")
    ],
    concesionariosController.actualizarConcesionario
);

router.delete("/api/concesionarios/:id", concesionariosController.eliminarConcesionario);

module.exports = router;