const express = require("express");
const router = express.Router();

const vehiculos = [
    { matricula: '1234ABC', marca: 'Tesla', autonomia: '100km', tipo: 'coche' },
    { matricula: '5678DEF', marca: 'BMW', autonomia: '450km', tipo: 'coche' },
    { matricula: '9012GHI', marca: 'Yamaha', autonomia: '600km', tipo: 'moto' },
    { matricula: '3456JKL', marca: 'Audi', autonomia: '120km', tipo: 'coche' },
    { matricula: '7890MNO', marca: 'Ducati', autonomia: '100km', tipo: 'moto' }
]

router.get("/", function (request, response) {
    response.status(200);
    response.render("vehiculos", { vehiculos: vehiculos });
});

router.get("/:id", function (request, response) {
    response.status(200);
    response.render("vehiculos", { vehiculos: vehiculos.filter(v => v.matricula === request.params.id) });
});

module.exports = router;