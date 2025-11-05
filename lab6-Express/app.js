"use strict";
const express = require("express");     // importamos el módulo de express
const path = require("path");
const app = express();      // creamos la aplicación de express
const PORT = 3000;

//Para servir archivos estáticos
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true })); // Para parsear el body de las peticiones POST

//Impotar rutas
const vehiculosRouter = require("./routes/vehiculos");
const reservasRouter = require("./routes/reservas");

app.use("/vehiculos", vehiculosRouter);
app.use("/reservas", reservasRouter);

//Motor de views
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//Ruta principal
app.get("/", function (request, response) {
    response.sendFile(path.join(__dirname, "public", "index.html"))
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