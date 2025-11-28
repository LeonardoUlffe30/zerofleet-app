const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const path = require("path");
const multer = require("multer");

// Middlewares de autenticacion
const { verificarUsuario, verificarAdmin } = require("./autenticar");

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

const vehiculos = [
    { id: '1234ABC', marca: 'Tesla', modelo: 'A', autonomia: '100km', tipo: 'coche', precioHora: '2', imagen: "vehiculo1.png" },
    { id: '5678DEF', marca: 'BMW', modelo: 'A', autonomia: '450km', tipo: 'coche', precioHora: '2', imagen: "vehiculo2.png" },
    { id: '9012GHI', marca: 'Yamaha', modelo: 'A', autonomia: '600km', tipo: 'moto', precioHora: '2', imagen: "vehiculo3.png" },
    { id: '3456JKL', marca: 'Audi', modelo: 'A', autonomia: '120km', tipo: 'coche', precioHora: '2', imagen: "vehiculo4.png" },
    { id: '7890MNO', marca: 'Ducati', modelo: 'A', autonomia: '100km', tipo: 'moto', precioHora: '2', imagen: "vehiculo5.png" }
]

router.get("/", vehiculosController.listarVehiculos);

// router.get("/", function (request, response) {
//     const query = (request.query.buscar || "").toLowerCase();
//     const filtrar = vehiculos.filter(v =>
//         v.marca ? v.marca.toLowerCase().includes(query) : "" ||
//             v.modelo ? v.modelo.toLowerCase().includes(query) : ""
//     );
//     response.status(200);
//     response.render("listavehiculos", {
//         titulo: "Vehículos",
//         estilo: "listavehiculos.css",
//         script: "",
//         vehiculos: filtrar,
//         buscar: request.query.buscar || "",
//         filtro: request.query.filtro || "",
//         error: "",
//         mensaje: ""
//     });
// });


router.get("/api/vehiculos", vehiculosController.listarVehiculosApi);

// router.get("/api/vehiculos", function (request, response) {
//     const { tipo } = request.query;
//     const vehiculosFiltrados = tipo ? vehiculos.filter(v => v.tipo === tipo) : vehiculos;
//     response.json(vehiculosFiltrados);
// });

// ----------------- MIDDLEWARES DE SEGURIDAD ------------------

// Todo lo que está debajo requiere usuario
router.use(verificarUsuario);

// Todo lo que esta debajo requiere admin
router.use(verificarAdmin);

// ----------------- RUTAS ADMIN ------------------

// Formulario crear nuevo vehiculo - GET
//router.get("/nuevo", vehiculosController.formularioVehiculo);
router.get("/nuevo", vehiculosController.formularioVehiculo);
// Formulario crear nuevo vehiculo - POST
router.post(
    "/nuevo",
    multerFactory.single('imagen'),
    [check("matricula").notEmpty().withMessage("La matrícula es obligatoria"),
    check("marca").notEmpty().withMessage("La marca es obligatoria"),
    check("modelo").notEmpty().withMessage("El modelo es obligatorio"),
    check("anyoMatriculacion").isNumeric().withMessage("Año inválido"),
    check("numeroPlazas").isNumeric().withMessage("Número inválido"),
    check("autonomia").isNumeric().withMessage("Autonomía inválida"),
    check("color").notEmpty().withMessage("Color obligatorio"),
    check("tipo").notEmpty().withMessage("Tipo obligatorio"),
    check("estado").notEmpty().withMessage("Estado obligatorio"),
    check("precioHora").isNumeric().withMessage("Precio inválido"),
    check("precioHora", "El campo de Precio/Hora debe ser un valor numérico").isNumeric()],
    vehiculosController.crearVehiculo
);

router.get("/:id", function (request, response) {
    response.status(200);
    response.render("listavehiculos", {
        titulo: "Vehículo",
        estilo: "listavehiculos.css",
        script: "",
        vehiculos: vehiculos.filter(v => v.id === request.params.id),
        buscar: request.query.buscar || "",
        filtro: request.query.filtro || ""
    });
});

router.get("/:id/editar", function (request, response) {
    const v = vehiculos.filter(v => v.id === request.params.id)[0];

    response.status(200);
    response.render("vehiculos", {
        titulo: "Vehículos",
        estilo: "vehiculos.css",
        script: "",
        vehiculo: v,
        error: ""
    });
});

router.post("/:id/editar", multerFactory.single('imagen'), function (request, response, next) {
    const { id, marca, modelo, autonomia, tipo, precioHora, } = request.body;
    const imagen = request.file ? request.file.filename : "";
    const v = vehiculos.find(v => v.id === id);

    if (!v) {
        vehiculos.push({ id, marca, modelo, autonomia, tipo, precioHora, imagen });

        // Eliminar el anterior vehiculo porque se ha cambiado la matricula
        const index = vehiculos.findIndex(v => v.id === request.params.id)
        vehiculos.splice(index, 1);
    } else {
        v.id = id;
        v.marca = marca;
        v.modelo = modelo;
        v.autonomia = autonomia;
        v.tipo = tipo;
        v.precioHora = precioHora;
        v.imagen = imagen;
    }

    response.status(200);
    response.render("listavehiculos", {
        titulo: "Lista Vehículos",
        estilo: "listavehiculos.css",
        script: "",
        vehiculos: vehiculos,
        buscar: request.query.buscar || "",
        filtro: request.query.filtro || "",
        error: "",
        mensaje: "Vehículo editado correctamente"
    });
});

router.delete("/api/vehiculos/:id", vehiculosController.eliminarVehiculo);

// router.delete("/api/vehiculos/:id", function (request, response) {
//     try {
//         const index = vehiculos.findIndex(v => v.id === request.params.id)
//         if (index !== -1) {
//             vehiculos.splice(index, 1);
//             response.status(200).json({ mensaje: "Vehiculo eliminado correctamente" });
//         } else {
//             response.status(404).json({ error: "Vehiculo no encontrado" });
//         }
//     } catch (err) {
//         console.error("Error en DELETE:", err);
//         return res.status(500).json({ error: "Error interno del servidor" });
//     }
// });

module.exports = router;