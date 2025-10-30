"use strict";
const express = require("express");     // importamos el módulo de express
const app = express();      // creamos la aplicación de express
const PORT = 3000;

const path = require("path");

//Para servir archivos estáticos
app.get("/", function(request, response){
    response.sendFile(path.join(__dirname,"public"))
});

//Motor de ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname,"views"));

app.listen(PORT, function(err){
    if (err) {
        console.log("No se pudo inicializar el servidor:", err);
    } else {
        console.log("Servidor escuchando en http://localhost:${PORT}");
    }
});