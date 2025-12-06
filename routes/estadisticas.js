const express = require("express");
const router = express.Router();
const { verificarAdmin } = require("../middleware/autenticacion");
const estadisticasController = require("../controllers/estadisticasController");

router.use(verificarAdmin);

router.get("/", estadisticasController.inicial);

router.get("/api", estadisticasController.estadisticas);

module.exports = router;