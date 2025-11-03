"use strict";
const express = require("express");     // importamos el módulo de express
const path = require("path");
const app = express();      // creamos la aplicación de express
const PORT = 3000;

const reservas = [
    { nombre: 'Juan', apellido: 'Pérez', correo: 'asdf@gmail.com', telefono: '123456789', fechaIni: '2024-07-01', horaIni: '10:00', fechaFin: '2024-07-01', horaFin: '12:00', duracion: '2 horas', tipo: 'coche' },
    { nombre: 'María', apellido: 'Gómez', correo: 'mariaG@gmail.com', telefono: '987654321', fechaIni: '2024-07-02', horaIni: '14:00', fechaFin: '2024-07-02', horaFin: '16:00', duracion: '2 horas', tipo: 'moto' },
];

const vehiculos = [
    { matricula: '1234ABC', marca: 'Tesla', autonomia: '100km', tipo: 'coche' },
    { matricula: '5678DEF', marca: 'BMW', autonomia: '450km', tipo: 'coche' },
    { matricula: '9012GHI', marca: 'Yamaha', autonomia: '600km', tipo: 'moto' },
    { matricula: '3456JKL', marca: 'Audi', autonomia: '120km', tipo: 'coche' },
    { matricula: '7890MNO', marca: 'Ducati', autonomia: '100km', tipo: 'moto' }
]

//Para servir archivos estáticos
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true })); // Para parsear el body de las peticiones POST

//Motor de ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//Para servir rutas
app.get("/", function (request, response) {
    response.sendFile(path.join(__dirname, "public", "index.html"))
});

app.get("/vehiculos", function (request, response) {
    response.status(200);
    response.render("vehiculos", { vehiculos: vehiculos });
});

app.get("/vehiculos/:id", function (request, response) {
    response.status(200);
    response.render("vehiculos", { vehiculos: vehiculos.filter(v => v.matricula === request.params.id) });
});

app.get("/reserva", function (request, response) {
    response.sendFile(path.join(__dirname, "public", "reserva.html"))
});

app.post("/reserva", function (request, response) {
    const nombre = request.body["nombre"];
    const apellido = request.body["apellido"];
    const correo = request.body["correo"];
    const telefono = request.body["telefono"];
    const vehiculo = request.body["lista-vehiculos"];
    const fechaIni = request.body["fecha-ini"];
    const horaIni = request.body["hora-ini"];
    const fechaFin = request.body["fecha-fin"];
    const horaFin = request.body["hora-fin"];
    const duracion = request.body["duracion"];
    const tipo = request.body["tipo"];

    if (!nombre || !apellido || !correo || !telefono || !vehiculo || !fechaIni || !horaIni || !fechaFin || !horaFin || !duracion || !tipo) {
        return res.status(400).send()
    }

    const nuevaReserva = {
        nombre,
        apellido,
        correo,
        telefono,
        vehiculo,
        fechaIni,
        horaIni,
        fechaFin,
        horaFin,
        duracion,
        tipo
    };

    reservas.push(nuevaReserva);
    console.log("RESERVA ALMACENADA CORRECTAMENTE");

    // Enviar una sola respuesta al cliente
    response.send(`
    <h2>Datos recibidos:</h2>
    <p><strong>Nombre:</strong> ${nombre}</p>
    <p><strong>Apellido:</strong> ${apellido}</p>
    <p><strong>Correo:</strong> ${correo}</p>
    <p><strong>Teléfono:</strong> ${telefono}</p>
    <p><strong>Vehículo:</strong> ${vehiculo}</p>
    <p><strong>Fecha Inicio:</strong> ${fechaIni} ${horaIni}</p>
    <p><strong>Fecha Fin:</strong> ${fechaFin} ${horaFin}</p>
    <p><strong>Duración:</strong> ${duracion}</p>
    <p><strong>Tipo:</strong> ${tipo}</p>
  `);
})


app.get("/listareserva", function (request, response) {
    response.status(200);
    response.render("listareserva", { reservas: reservas });
});


//Gestión de errores
app.use(function(request, response, next){
    response.status(404);
    response.render("error", {url: request.originalUrl});
});

app.use(function(request, response, next){
    response.status(500);
    response.send("Error interno del servidor");
});

app.listen(PORT, function (err) {
    if (err) {
        console.log("No se pudo inicializar el servidor:", err);
    } else {
        console.log(`Servidor escuchando en http://localhost:${PORT}`);
    }
});