const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const pool = require("../config/db");
const bcrypt = require("bcrypt");
const concesionariosController = require("../controllers/usuariosController");

// Funcion para actualizar estado BD
const { setBDVacia } = require("../config/estadoDB");

// Configuracion de subida de archivo
const upload = multer({ dest: "uploads/" });

// Mostrar formulario para subir JSON
router.get("/", function (request, response) {
    response.render("cargarJSON", {
        titulo: "Carga de JSON",
        estilo: "cargarJSON.css",
        script: ""
    });
});

// Procesar el archivo JSON subido
router.post("/", upload.single("archivo"), function (request, response) {
    if (!request.file) {
        return response.status(400).send("No se subió ningun archivo");
    }

    const raw = fs.readFileSync(request.file.path, "utf8");
    const datos = JSON.parse(raw);

    const vehiculos = datos.vehiculos || [];
    const concesionarios = datos.concesionarios || [];
    const usuarios = datos.usuarios || [];

    // Insertar concesionarios
    concesionarios.forEach(c => {
        pool.query(
            `INSERT INTO concesionarios (id_concesionario, nombre, ciudad, direccion, telefono_contacto) VALUES (?, ?, ?, ?, ?)`,
            [c.id_concesionario, c.nombre, c.ciudad, c.direccion, c.telefono_contacto]
        );
    });

    // Insertar vehiculos
    vehiculos.forEach(v => {
        pool.query(
            `INSERT INTO vehiculos (id_vehiculo, matricula, marca, modelo, año_matriculacion, numero_plazas, autonomia_km, color, imagen, estado, tipo, precio_hora, id_concesionario)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [v.id_vehiculo, v.matricula, v.marca, v.modelo, v.año_matriculacion, v.numero_plazas, v.autonomia_km, v.color, v.imagen, v.estado, v.tipo, v.precio_hora, v.id_concesionario]
        );
    });

    if (usuarios.length > 0) {
        usuarios.forEach(u => {
            const vueltas = 10;

            // Encriptar contraseña
            bcrypt.hash(u.contraseña, vueltas)
                .then(contraseniaEncriptada => {
                    pool.query(`
                        INSERT INTO usuarios 
                        (id_usuario, nombre, apellido, correo, contraseña, rol, telefono, id_concesionario)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                        [u.id_usuario, u.nombre, u.apellido, u.correo, contraseniaEncriptada, u.rol, u.telefono, u.id_concesionario]
                    );
                })
        });
    }

    console.log("Datos cargados correctamente. Ya puede usar la aplicación.");

    setBDVacia(false);

    response.status(200).json({ mensaje: "Datos cargados correctamente" });
});

module.exports = router;