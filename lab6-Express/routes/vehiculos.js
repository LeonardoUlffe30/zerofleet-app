const express = require("express");
const { check, validationResult } = require("express-validator");
const router = express.Router();
const { verificarUsuario, verificarAdmin } = require("./autenticar");

const vehiculos = [
    { id: '1234ABC', marca: 'Tesla', modelo: 'A', autonomia: '100km', tipo: 'coche', precioHora: '2' },
    { id: '5678DEF', marca: 'BMW', modelo: 'A',autonomia: '450km', tipo: 'coche', precioHora: '2' },
    { id: '9012GHI', marca: 'Yamaha', modelo: 'A',autonomia: '600km', tipo: 'moto', precioHora: '2' },
    { id: '3456JKL', marca: 'Audi', modelo: 'A',autonomia: '120km', tipo: 'coche', precioHora: '2' },
    { id: '7890MNO', marca: 'Ducati', modelo: 'A',autonomia: '100km', tipo: 'moto', precioHora: '2' }
]

router.use(function (request, response, next) {
    verificarUsuario(request, response, next);
});

router.get("/", function (request, response) {
    const query = (request.query.buscar || "").toLowerCase();
    const filtrar = vehiculos.filter(v=>
        v.marca.toLowerCase().includes(query) ||
        v.modelo.toLowerCase().includes(query)
    );
    response.status(200);
    response.render("listavehiculos", {
        titulo: "Vehículos",
        estilo: "listavehiculos.css",
        script: "",
        vehiculos: filtrar,
        buscar: request.query.buscar || "",
        filtro: ""
    });
});

router.use(function (request, response, next) {
    verificarAdmin(request, response, next);
});

router.get("/nuevo", function (request, response) {
    response.status(200);
    response.render("vehiculos", {
        titulo: "Vehículos",
        estilo: "vehiculos.css",
        script: "",
        vehiculo: "",
        error: ""
    });
});

router.post("/nuevo", check("precioHora", "El campo de Precio/Hora debe ser un valor numérico").isNumeric(),
    function (request, response) {
    const error = validationResult(request);
    if(!error.isEmpty()) {
        return response.render("vehiculos", {
                titulo: "Vehículos",
                estilo: "vehiculos.css",
                script: "",
                vehiculo: request.body,
                error: error.array()
    });
    }
    const { id, marca, modelo, tipo, precioHora } = request.body;
    const nVehiculo = [id, marca, modelo, tipo, precioHora];
    vehiculos.push(nVehiculo);
    console.log("VEHICULO AÑADIDO CORRECTAMENTE");
});

router.get("/:id", function (request, response) {
    response.status(200);
    response.render("listavehiculos", {
        titulo: "Vehículo",
        estilo: "listavehiculos.css",
        script: "",
        vehiculos: vehiculos.filter(v => v.id === request.params.id),
        buscar: request.query.buscar || "",
        filtro: ""
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

router.post("/:id/editar", function (request, response, next) {
    const { id, marca, modelo, tipo, precioHora } = request.body;

    const v = vehiculos.find(v => v.id === id)
    if(!v){
        const nVehiculo = [id, marca, modelo, tipo, precioHora];
        vehiculos.push(nVehiculo);
    }else{
        v.id = id;
        v.marca = marca;
        v.modelo = modelo;
        v.tipo = tipo;
        v.precioHora = precioHora;
    }

    response.status(200);
    response.json(vehiculos);
});

router.get("/:id/eliminar", function (request, response, next) {
    const index = vehiculos.findIndex(v => v.id === request.params.id)
    vehiculos.splice(index, 1);
    response.render("listavehiculos", {
        titulo: "Lista Vehículos",
        estilo: "listavehiculos.css",
        script: "",
        vehiculos: vehiculos,
        //Se borra cuando se haya creado los botones
        buscar: request.query.buscar || "",
        filtro: ""
    });
});

router.get("/api/vehiculos", function (request, response) {
    response.json(vehiculos);
});

module.exports = router;