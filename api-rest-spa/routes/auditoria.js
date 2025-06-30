const express = require('express');
const {
    getItems,
    getEstadisticas,
    getItem,
    createItem,
    updateItem,
    deleteItem,
} = require("../controllers/auditoria");
const router = express.Router();

// Rutas principales de disponibilidad
router.get('/', getItems);
router.get('/estadisticas', getEstadisticas);
router.get('/:id', getItem);
router.post('/', createItem);
router.put('/:id', updateItem);
router.delete('/:id', deleteItem);

module.exports = router;