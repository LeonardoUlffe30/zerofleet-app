const express = require("express");
const router = express.Router();

const vehiculos = [
    { matricula: '1234ABC', marca: 'Tesla', autonomia: '100km', tipo: 'coche', precioHora: '2' },
    { matricula: '5678DEF', marca: 'BMW', autonomia: '450km', tipo: 'coche', precioHora: '2' },
    { matricula: '9012GHI', marca: 'Yamaha', autonomia: '600km', tipo: 'moto', precioHora: '2' },
    { matricula: '3456JKL', marca: 'Audi', autonomia: '120km', tipo: 'coche', precioHora: '2' },
    { matricula: '7890MNO', marca: 'Ducati', autonomia: '100km', tipo: 'moto', precioHora: '2' }
]

router.get("/nuevo", function (request, response) {
    response.status(200);
    response.render("vehiculos", {
        titulo: "Vehículos",
        estilo: "vehiculos.css",
        script: "",
    });
});

router.post("/nuevo", function (request, response){
    const {id, marca, modelo, tipo, precioHora} = request.body;
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

router.get("/:id/editar", function (requst, response){
    const v = vehiculos.filter(v => v.matricula === request.params.id);
    response.status(200);
    response.render("vehiculos", {
        titulo: "Vehículos",
        estilo: "vehiculos.css",
        script: "",
        vehiculo: v
    });
});

router.get("/:id/eliminar", function (request, response){
    //Hay q eliminar de la base de datos
    response.render("listavehiculos", {
        titulo: "Lista Vehículos",
        estilo: "listavehiculos.css",
        script: "",
        
    });
});

router.get("/api/vehiculos", function (request, response) {
    response.json(vehiculos);
});

module.exports = router;