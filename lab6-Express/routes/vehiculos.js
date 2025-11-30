const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const path = require("path");
const multer = require("multer");

// Middlewares de autenticacion
const { verificarUsuario, verificarAdmin } = require("../middleware/autenticacion");

// Controller
const vehiculosController = require("../controllers/vehiculosController");

// Configuracion de multer para subida de imagenes
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../public/img/imgVehiculos"));
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const basename = path.basename(file.originalname, ext);
        const nombre = basename + '-' + Date.now() + ext;
        cb(null, nombre);
    }
})

const multerFactory = multer({ storage: storage });

// ----------------- RUTAS PÚBLICAS ------------------

router.get("/", vehiculosController.listarVehiculos);

router.get("/api/vehiculos", vehiculosController.listarVehiculosApi);

// ----------------- MIDDLEWARES DE SEGURIDAD ------------------

// Todo lo que está debajo requiere usuario
router.use(verificarUsuario);

// Todo lo que esta debajo requiere admin
router.use(verificarAdmin);

// ----------------- RUTAS ADMIN ------------------

// Formulario crear nuevo vehiculo - GET
router.get("/nuevo", vehiculosController.formularioCrearVehiculo);

// Formulario crear nuevo vehiculo - POST
router.post(
    "/nuevo",
    multerFactory.single('imagen'),
    [
        check("matricula").notEmpty().withMessage("La matrícula es obligatoria"),
        check("marca").notEmpty().withMessage("La marca es obligatoria"),
        check("modelo").notEmpty().withMessage("El modelo es obligatorio"),
        check("anyoMatriculacion").isNumeric().withMessage("Año inválido"),
        check("numeroPlazas").isNumeric().withMessage("Número inválido"),
        check("autonomia").isNumeric().withMessage("Autonomía inválida"),
        check("color").notEmpty().withMessage("Color obligatorio"),
        check("tipo").notEmpty().withMessage("Tipo obligatorio"),
        check("estado").notEmpty().withMessage("Estado obligatorio"),
        check("precioHora").isNumeric().withMessage("Precio inválido"),
        check("precioHora", "El campo de Precio/Hora debe ser un valor numérico").isNumeric()
    ],
    vehiculosController.crearVehiculo
);

router.get("/:id", vehiculosController.obtenerVehiculo);

router.get("/:id/editar", vehiculosController.formularioEditarVehiculo);

router.post("/:id/editar",
    multerFactory.single('imagen'),
    [
        check("marca").notEmpty().withMessage("La marca es obligatoria"),
        check("modelo").notEmpty().withMessage("El modelo es obligatorio"),
        check("anyoMatriculacion").isNumeric().withMessage("Año inválido"),
        check("numeroPlazas").isNumeric().withMessage("Número inválido"),
        check("autonomia").isNumeric().withMessage("Autonomía inválida"),
        check("color").notEmpty().withMessage("Color obligatorio"),
        check("estado").notEmpty().withMessage("Estado obligatorio"),
        check("tipo").notEmpty().withMessage("Tipo obligatorio"),
        check("precioHora").isNumeric().withMessage("Precio inválido")
    ],
    vehiculosController.actualizarVehiculo
);

router.delete("/api/vehiculos/:id", vehiculosController.eliminarVehiculo);

module.exports = router;