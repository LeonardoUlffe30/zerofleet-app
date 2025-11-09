"use strict";
const express = require("express");     // importamos el módulo de express
const path = require("path");
const expressLayouts = require("express-ejs-layouts");

const app = express();      // creamos la aplicación de express
const PORT = 3000;

//Para servir archivos estáticos
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true })); // Para parsear el body de las peticiones POST

//Impotar rutas
const vehiculosRouter = require("./routes/vehiculos");
const reservasRouter = require("./routes/reservas");
const { router } = require("./routes/autenticar");

//Motor de views
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layout");

app.use("/vehiculos", vehiculosRouter);
app.use("/reservas", reservasRouter);
app.use("/autenticar", router);

//Ruta principal
app.get("/", function (request, response) {
    response.render("index", {
        titulo: "Gestión de Flota de Vehículos Eléctricos",
        estilo: "",
        script: ""
    });
});

//Gestión de errores
app.use(function (request, response, next) {
    response.status(404);
    response.render("error", { url: request.originalUrl });
});

app.use(function (error, request, response, next) {
    response.status(error.status || 500);
    response.send(error.message || "Error interno del servidor");
});

app.listen(PORT, function (err) {
    if (err) {
        console.log("No se pudo inicializar el servidor:", err);
    } else {
        console.log(`Servidor escuchando en http://localhost:${PORT}`);
    }
});