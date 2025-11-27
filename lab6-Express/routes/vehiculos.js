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

router.get("/api/vehiculos", vehiculosController.listarVehiculosApi);

// ----------------- MIDDLEWARES DE SEGURIDAD ------------------

// Todo lo que está debajo requiere usuario
router.use(verificarUsuario);

// Todo lo que esta debajo requiere admin
router.use(verificarAdmin);

// ----------------- RUTAS ADMIN ------------------

// Formulario crear nuevo vehiculo - GET
router.get("/nuevo", vehiculosController.formularioVehiculo);

// Formulario crear nuevo vehiculo - POST
router.post(
    "/nuevo",
    multerFactory.single('imagen'),
    check("precioHora", "El campo de Precio/Hora debe ser un valor numérico").isNumeric(),
    function (request, response) {
        const error = validationResult(request);
        if (!error.isEmpty()) {
            return response.render("vehiculos", {
                titulo: "Vehículos",
                estilo: "vehiculos.css",
                script: "",
                vehiculo: request.body,
                error: error.array()
            });
        }
        const { id, marca, modelo, autonomia, tipo, precioHora } = request.body;
        const imagen = request.file ? request.file.filename : "";
        vehiculos.push({ id, marca, modelo, autonomia, tipo, precioHora, imagen });
        console.log("VEHICULO AÑADIDO CORRECTAMENTE");
        response.render("listavehiculos", {
            titulo: "Lista Vehículos",
            estilo: "listavehiculos.css",
            script: "",
            vehiculos: vehiculos,
            buscar: request.query.buscar || "",
            filtro: request.query.filtro || "",
            error: "",
            mensaje: "Vehículo añadido correctamente"
        });
    });

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

router.delete("/api/vehiculos/:id", function (request, response, next) {
    console.log("eliminar")
    const index = vehiculos.findIndex(v => v.id === request.params.id)
    if (index !== -1) {
        console.log("11111")
        vehiculos.splice(index, 1);
        response.status(200).json({});
    } else {
        console.log("22222")
        response.status(404).json({ error: "Vehiculo no encontrado" });
    }
});

module.exports = router;