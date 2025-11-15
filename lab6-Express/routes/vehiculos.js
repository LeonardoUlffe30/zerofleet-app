const express = require("express");
const router = express.Router();

const vehiculos = [
    { matricula: '1234ABC', marca: 'Tesla', modelo: 'A', autonomia: '100km', tipo: 'coche', precioHora: '2' },
    { matricula: '5678DEF', marca: 'BMW', modelo: 'A',autonomia: '450km', tipo: 'coche', precioHora: '2' },
    { matricula: '9012GHI', marca: 'Yamaha', modelo: 'A',autonomia: '600km', tipo: 'moto', precioHora: '2' },
    { matricula: '3456JKL', marca: 'Audi', modelo: 'A',autonomia: '120km', tipo: 'coche', precioHora: '2' },
    { matricula: '7890MNO', marca: 'Ducati', modelo: 'A',autonomia: '100km', tipo: 'moto', precioHora: '2' }
]

router.get("/nuevo", function (request, response) {
    response.status(200);
    response.render("vehiculos", {
        titulo: "Vehículos",
        estilo: "vehiculos.css",
        script: "",
        vehiculo: "",
    });
});

router.post("/nuevo", function (request, response) {
    const { id, marca, modelo, tipo, precioHora } = request.body;
    const nVehiculo = [id, marca, modelo, tipo, precioHora];
    vehiculos.push(nVehiculo);
    console.log("VEHICULO AÑADIDO CORRECTAMENTE");
    response.json(vehiculos);
});

router.get("/", function (request, response) {
    response.status(200);
    response.render("listavehiculos", {
        titulo: "Vehículos",
        estilo: "listavehiculos.css",
        script: "",
        vehiculos: vehiculos
    });
});

router.get("/:id", function (request, response) {
    response.status(200);
    response.render("listavehiculos", {
        titulo: "Vehículos",
        estilo: "listavehiculos.css",
        script: "",
        vehiculos: vehiculos.filter(v => v.matricula === request.params.id)
    });
});

router.get("/:id/editar", function (request, response) {
    const v = vehiculos.filter(v => v.matricula === request.params.id)[0];

    console.log(v);
    response.status(200);
    response.render("vehiculos", {
        titulo: "Vehículos",
        estilo: "vehiculos.css",
        script: "",
        vehiculo: v
    });
});

router.post("/:id/editar", function (request, response, next) {
    const { id, marca, modelo, tipo, precioHora } = request.body;

    const v = vehiculos.find(v => v.matricula === id)
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
    
    const index = vehiculos.findIndex(v => v.matricula === request.params.id)
    vehiculos.splice(index, 1);
    response.render("listavehiculos", {
        titulo: "Lista Vehículos",
        estilo: "listavehiculos.css",
        script: "",
        vehiculos: vehiculos
    });
});

router.get("/api/vehiculos", function (request, response) {
    response.json(vehiculos);
});

module.exports = router;