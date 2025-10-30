"use strict";
const express = require("express");     // importamos el módulo de express
const app = express();      // creamos la aplicación de express
const PORT = 3000;

const path = require("path");

//Para servir archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

//Motor de ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname,"views"));

//Para servir rutas
app.get("/", function(request, response){
    response.sendFile(path.join(__dirname, "public", "index.html"))
});

const vehiculos = [
            { matricula: '1234ABC', marca: 'Tesla', autonomia: '100km', tipo: 'coche' },
            { matricula: '5678DEF', marca: 'BMW', autonomia: '450km', tipo: 'coche' },
            { matricula: '9012GHI', marca: 'Yamaha', autonomia: '600km', tipo: 'moto' },
            { matricula: '3456JKL', marca: 'Audi', autonomia: '120km', tipo: 'coche' },
            { matricula: '7890MNO', marca: 'Ducati', autonomia: '100km', tipo: 'moto' }
        ]
app.get("/vehiculos", function(request, response){
    response.status(200);
    response.render("vehiculos", {vehiculos: vehiculos});
});

app.get("/vehiculos/:id", function(request, response){
    response.status(200);
    response.render("vehiculos", {vehiculos: vehiculos.filter(v => v.matricula === request.params.id)});
});

app.get("/reserva", function(request, response){
    response.sendFile(path.join(__dirname, "public", "reserva.html"))
});

const reservas = [{nombre: 'Juan', apellido: 'Pérez', correo: 'asdf@gmail.com', telefono: '123456789', fechaIni: '2024-07-01', horaIni: '10:00', fechaFin: '2024-07-01', horaFin: '12:00', duracion: '2 horas', tipo: 'coche'},
                        {nombre: 'María', apellido: 'Gómez', correo: 'mariaG@gmail.com', telefono: '987654321', fechaIni: '2024-07-02', horaIni: '14:00', fechaFin: '2024-07-02', horaFin: '16:00', duracion: '2 horas', tipo: 'moto'}];
app.get("/listareserva", function(request, response){
    response.status(200);
    response.render("listareserva", {reservas: reservas});
});


app.listen(PORT, function(err){
    if (err) {
        console.log("No se pudo inicializar el servidor:", err);
    } else {
        console.log("Servidor escuchando en http://localhost:${PORT}");
    }
});