const express = require("express");
const path = require("path");
const router = express.Router();
const estadisticasController = require("../controllers/estadisticasController");

router.get("/", estadisticasController.inicial);
router.get("/api", estadisticasController.estadisticas);

module.exports = router;